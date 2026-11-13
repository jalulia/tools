"""cd.py <plate> k=v:step ... [--passes N] — coordinate descent on the benchmark mean"""
import sys, json, asyncio, base64
from playwright.async_api import async_playwright
from bench import JS_REF, JS_OUT, REF
async def main():
    pid=sys.argv[1]; args=[a for a in sys.argv[2:] if '=' in a]; passes=int(sys.argv[sys.argv.index('--passes')+1]) if '--passes' in sys.argv else 3
    cur={a.split('=')[0]:float(a.split('=')[1].split(':')[0]) for a in args}; step={a.split('=')[0]:float(a.split(':')[1]) for a in args}
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--force-color-profile=srgb','--no-sandbox']); pg=await b.new_page(); await pg.goto('file:///home/claude/plates/dev.html?p='+pid)
        b64=base64.b64encode(open(f'ref/{REF[pid]}.png','rb').read()).decode(); ref=await pg.evaluate(JS_REF,[pid,b64])
        ev=lambda o: pg.evaluate(JS_OUT,[pid,o,ref])
        best=(await ev(cur))['mean']; print('start %.4f'%best)
        for ps in range(passes):
            for k in cur:
                for sg in (1,-1):
                    t=dict(cur); t[k]=round(cur[k]+sg*step[k],5); s=(await ev(t))['mean']
                    if s>best+1e-5:
                        best=s; cur=t
                        while True:
                            t=dict(cur); t[k]=round(cur[k]+sg*step[k],5); s=(await ev(t))['mean']
                            if s>best+1e-5: best=s; cur=t
                            else: break
                        break
            print('pass',ps,'%.4f'%best,json.dumps(cur)); step={k:v*.5 for k,v in step.items()}
        await b.close()
asyncio.run(main())
