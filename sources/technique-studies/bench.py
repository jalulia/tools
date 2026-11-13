"""bench.py <plate> [json overrides] [--save out.png] [--raw] — score a plate against its reference.
Reference stats are measured in the same page with the same code, and cached to refstats/<plate>.json."""
import sys, json, base64, asyncio, os
from playwright.async_api import async_playwright
class _Ref(dict):
    def __missing__(self, k): return 'r' + k[1:]
REF = _Ref()
JS_REF = """async ([id,b64])=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const img=g.getImageData(0,0,c.width,c.height);const pl=PLATES.find(p=>p.id===id);return pl.bench.items.map(it=>MX.measure(img,it,'ref'))}"""
JS_OUT = """async ([id,over,ref,jpeg])=>{const pl=PLATES.find(p=>p.id===id);const r=await draw(id,Object.assign({},pl.bench.params||{},over),pl.bench.palette);const cv=document.getElementById('c');let img=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);const q=jpeg!=null?jpeg:pl.bench.jpeg;if(q){img=await MX.throughJpeg(cv,q)}const s=MX.score(img,pl.bench,ref);s.ms=r.ms;s.jpeg=q||null;s.out=pl.bench.items.map(it=>MX.measure(img,it,'out'));return s}"""
async def run(pid, overs, save=None, raw=False, jpeg=None):
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--force-color-profile=srgb', '--no-sandbox'])
        pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/plates/dev.html?p='+pid)
        b64 = base64.b64encode(open(f'/home/claude/plates/ref/{REF[pid]}.png', 'rb').read()).decode()
        ref = await pg.evaluate(JS_REF, [pid, b64])
        os.makedirs('/home/claude/plates/refstats', exist_ok=True)
        json.dump(ref, open(f'/home/claude/plates/refstats/{pid}.json', 'w'))
        res = []
        for over in overs:
            s = await pg.evaluate(JS_OUT, [pid, over, ref, jpeg]); res.append(s)
            if save:
                data = await pg.evaluate("document.getElementById('c').toDataURL('image/png')"); open(save, 'wb').write(base64.b64decode(data.split(',')[1]))
        await b.close()
        if errs: print('ERR', errs)
        return ref, res
def show(ref, s, raw=False):
    print('SCORE mean %.4f  min %.4f  (%d metrics, %d ms%s)' % (s['mean'], s['min'], len(s['rows']), s['ms'], ('  through JPEG q%s' % s['jpeg']) if s.get('jpeg') else ''))
    for r in s['rows']: print('  %-22s %-28s %.3f%s' % (r['patch'], r['metric'], r['v'], '  <' if r['v'] < .98 else ''))
    if raw:
        for i, (R, O) in enumerate(zip(ref, s['out'])):
            f = lambda t: 'mean %.1f std %.1f q %s' % (t['mean'], t['std'], [round(v) for v in t['q']])
            print(' #%d ref %s\n    out %s' % (i, f(R['tone']), f(O['tone'])))
            for k in ('spec',):
                if k in R: print('    spec ref', [round(v, 2) for v in R[k]], '\n    spec out', [round(v, 2) for v in O[k]])
            if 'ac' in R: print('    ac ref x', [round(v, 2) for v in R['ac']['x']], 'y', [round(v, 2) for v in R['ac']['y']], '\n    ac out x', [round(v, 2) for v in O['ac']['x']], 'y', [round(v, 2) for v in O['ac']['y']])
            if 'inks' in R: print('    inks ref', [(round(k['share'], 3), [round(v) for v in k['c']] if k['c'] else None) for k in R['inks']], '\n    inks out', [(round(k['share'], 3), [round(v) for v in k['c']] if k['c'] else None) for k in O['inks']])
            print('    hist ref', [round(v, 3) for v in R['hist']], '\n    hist out', [round(v, 3) for v in O['hist']])
if __name__ == '__main__':
    pid = sys.argv[1]; over = json.loads(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2][0] == '{' else {}
    save = sys.argv[sys.argv.index('--save') + 1] if '--save' in sys.argv else None
    jpeg = float(sys.argv[sys.argv.index('--jpeg') + 1]) if '--jpeg' in sys.argv else None
    ref, res = asyncio.run(run(pid, [over], save, jpeg=jpeg)); show(ref, res[0], '--raw' in sys.argv)
