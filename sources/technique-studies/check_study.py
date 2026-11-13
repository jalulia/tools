#!/usr/bin/env python3
"""check_study.py <pNN | path/to/page.html> ... [--no-poke] [--shots DIR] — load a study page headless and report what a reader would hit.

For each page, at 1440x900 and at 390x844 (both DPR 2): console errors, external requests, horizontal overflow, the
match text, canvas sizes; a JPEG of the top of the page goes to shots/st_<id>_{desk,phone}.jpg and one of the
instrument (notes column / panel scrolled into view) to shots/st_<id>_{desk,phone}_ctl.jpg.
Generated pages (pNN) are also poked: a slider is dragged and released, a palette, a preset, New seed and Reset
are clicked, the spec drawer and the metric table are opened, Motion is run and stopped and Live is dragged
(where the plate has them). Exit code 1 if anything is wrong.
A plain path (e.g. the real st-10 page) gets the same report minus the poke, for side-by-side screenshots.
"""
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
import make_study as M

SHOTS = os.path.join(M.R, 'shots')
VIEWS = [('desk', 1440, 900, 2, 'css'), ('phone', 390, 844, 2, 'device')]

STATE = """()=>{ const de=document.documentElement, MP=window.__MP, cv=document.getElementById('cv'), fid=document.getElementById('fid'), st=window.__study;
  const vw=de.clientWidth, wide=[...document.querySelectorAll('body *')].filter(e=>{ if(e.closest('#spec'))return false; const r=e.getBoundingClientRect(); return r.width>0&&(r.right>vw+1||r.left<-1); }).slice(0,6).map(e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&e.className.baseVal===undefined?'.'+String(e.className).trim().replace(/\\s+/g,'.'):''));
  const f=st&&st.fig?st.fig():null, box=id=>{ const e=document.getElementById(id); return e?e.getBoundingClientRect():null; }, sg=box('stage'), tb=box('tb'), lg=box('log'), nt=box('copy'), layout=[];
  if(innerWidth>960&&sg&&tb&&tb.left<sg.left-1) layout.push('title block is '+Math.round(sg.left-tb.left)+' px wider than the figure column');
  if(innerWidth>960&&lg&&tb&&lg.bottom>tb.top+1) layout.push('track log runs '+Math.round(lg.bottom-tb.top)+' px under the title block');
  if(f&&(f.w<120||f.h<120)) layout.push('figure is only '+f.w+' x '+f.h+' px');
  return { scrollW:de.scrollWidth, clientW:vw, bodyW:document.body.scrollWidth, wide, layout, lede:(document.querySelector('#copy .lede')||{}).offsetHeight,
    match: fid?(fid.dataset.match||fid.textContent.replace(/\\s+/g,' ').trim().slice(0,90)):null, bench: fid?fid.dataset.bench||null:null,
    mean: MP&&MP.st.bench?MP.st.bench.mean:null, rows: MP&&MP.st.bench?MP.st.bench.rows.length:null, benchErr: MP?MP.st.benchErr:null,
    cv: cv?[cv.width,cv.height,Math.round(cv.getBoundingClientRect().width),Math.round(cv.getBoundingClientRect().height)]:null,
    fig: f?[f.x,f.y,f.w,f.h]:null, plate: MP&&MP.buf?[MP.buf.width,MP.buf.height]:null, ms: MP?MP.st.ms:null,
    rest: MP ? (JSON.stringify(MP.st.P)===JSON.stringify(MP.defaults()) && !MP.st.motion && !MP.st.live && MP.st.pal.id===(MP.plate.bench.palette||MP.plate.palettes[0].id)) : null,
    ctr: (document.getElementById('ctr')||{}).textContent, title: document.title, tags:[...document.querySelectorAll('#copy .tags span')].map(e=>e.textContent) }; }"""

POKE = """async ()=>{ const MP=window.__MP, S=window.STUDY, st=MP.st, out={}, wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=async n=>{ for(let i=0;i<n;i++) await new Promise(r=>requestAnimationFrame(r)); };
  const num=(S.params||[]).filter(p=>p.type!=='text'&&p.id!=='seed'), p=num[0];
  if(p&&p._el){ const el=p._el, v0=+el.value, v1=Math.min(+el.max,Math.max(+el.min,v0+(+el.max-+el.min)*0.31)); el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); el.value=v1; el.dispatchEvent(new Event('input',{bubbles:true})); await frames(3);
    out.quick=[st.quick, st.px.slice()]; el.dispatchEvent(new Event('change',{bubbles:true})); window.dispatchEvent(new PointerEvent('pointerup')); await frames(3); out.full=[st.quick, st.px.slice()]; out.slider=[p.id, v0, st.P[p.id], S.spec.params[p.id].value, document.getElementById('pv-'+p.id).textContent]; }
  const pal=[...document.querySelectorAll('.mp .pal button')]; if(pal.length>1){ pal[1].click(); await frames(3); out.palette=[S.spec.palette.key, pal[1].classList.contains('on'), pal.length]; }
  const pre=[...document.querySelectorAll('.mp .grp')].find(g=>g.querySelector('.gh span').textContent==='Presets'); if(pre){ const b=pre.querySelectorAll('button'); b[0].click(); await frames(3); out.preset=[b[0].textContent, b.length, b[0].classList.contains('on')]; }
  const seed=document.getElementById('lc-seed'); if(seed){ const s0=st.P.seed; seed.click(); await frames(3); out.seed=[s0, st.P.seed]; }
  document.getElementById('bSpec').click(); await wait(350); const js=JSON.parse(document.getElementById('specpre').textContent); out.spec={open:document.getElementById('spec').classList.contains('open'), palette:js.palette.key, mean:js.benchmark.mean, match:js.benchmark.match, metrics:js.benchmark.metrics.length, passes:js.pass_order.length, measured:Object.keys(js.measured).length, limits:js.limits.length, params:Object.keys(js.params).length};
  if(p&&p._el){ p._el.value=p._el.min; p._el.dispatchEvent(new Event('input',{bubbles:true})); p._el.dispatchEvent(new Event('change',{bubbles:true})); await frames(3); out.specLive=JSON.parse(document.getElementById('specpre').textContent).params[p.id].value===+p._el.min; }
  document.getElementById('specclose').click(); await wait(300);
  document.getElementById('lc-reset').click(); await frames(4); out.reset=[S.spec.palette.key, JSON.stringify(st.P)===JSON.stringify(MP.defaults())];
  const d=document.querySelector('#fid details'); if(d){ d.open=true; await frames(3); const log=document.getElementById('log'), tb=document.getElementById('tb'); out.table=[d.querySelectorAll('.fr').length, innerWidth>960?Math.round(log.getBoundingClientRect().bottom)<=Math.round(tb.getBoundingClientRect().top):true, log.scrollHeight>log.clientHeight]; d.open=false; await frames(2); }
  const bm=document.getElementById('lc-motion'); if(bm){ const key=MP.motion[0].key, pv=document.getElementById('pv-'+key), base=st.P[key], t0=pv.textContent, inp=S.params.find(q=>q.id===key)._el; bm.click(); await wait(900);
    const mid={keys:MP.motion.map(m=>m.key+' '+m.mode), on:st.motion, pressed:bm.classList.contains('on'), halfScale:[st.quick, st.px.slice()], readoutMoves:pv.textContent!==t0, sliderHolds:st.P[key]===base&&+inp.value===base}; bm.click(); await frames(4);
    out.motion=Object.assign(mid,{off:[st.motion, bm.classList.contains('on')], fullAfter:[st.quick, st.px.slice()], readoutBack:pv.textContent===t0}); }
  const bl=document.getElementById('lc-live'); if(bl){ const ax=MP.axes, cv=document.getElementById('cv'), at=(u,v)=>{ const f=window.__study.fig(), r=cv.getBoundingClientRect(); return {clientX:r.left+f.x+u*f.w, clientY:r.top+f.y+v*f.h, pointerId:7, button:0, bubbles:true, pointerType:'mouse'}; }, ev=(t,u,v)=>cv.dispatchEvent(new PointerEvent(t,at(u,v)));
    const snap=a=>{ if(!a)return null; const q=S.params.find(x=>x.id===a.key); return [a.key, st.P[a.key], q&&q._el?+q._el.value:null]; }, want=(a,t)=>a?+(a.min+t*(a.max-a.min)).toFixed(4):null;
    const b0=JSON.stringify(st.P); ev('pointerdown',.3,.4); ev('pointermove',.6,.5); ev('pointerup',.6,.5); await frames(2); const inertWhenOff=JSON.stringify(st.P)===b0;
    bl.click(); ev('pointerdown',.3,.4); ev('pointermove',.25,.75); await frames(3); const during=[st.quick, st.px.slice()]; ev('pointerup',.25,.75); await frames(4);
    out.live={on:st.live, pressed:bl.classList.contains('on'), inertWhenOff, quickWhileDragging:during, fullOnRelease:[st.quick, st.px.slice()], x:snap(ax.x), xWant:want(ax.x,.25), y:snap(ax.y), yWant:want(ax.y,.75), touchAction:cv.style.touchAction}; bl.click(); out.live.off=[st.live, cv.style.touchAction]; document.getElementById('lc-reset').click(); await frames(4); }
  out.inputs={sliders:document.querySelectorAll('.mp input[type=range]').length, texts:document.querySelectorAll('.mp input[type=text]').length, choices:document.querySelectorAll('.mp .prow[role=group]').length, help:document.querySelectorAll('.mp .ph').length, groups:[...document.querySelectorAll('.mp .gh')].map(e=>e.firstChild.textContent+(e.lastChild.textContent?' ('+e.lastChild.textContent+')':'')), toolbar:[...document.querySelectorAll('#copy .ctl:not(.mp .ctl) button')].filter(b=>!b.hidden).map(b=>b.textContent)};
  return out; }"""


def target(arg):
    if arg.endswith('.html'):
        p = arg if os.path.isabs(arg) else os.path.abspath(arg)
        if not os.path.exists(p) and os.path.exists(os.path.join(M.ST_DIR, arg)): p = os.path.join(M.ST_DIR, arg)
        return (re.match(r'st-\d+', os.path.basename(p)) or re.match(r'[\w-]+', os.path.basename(p))).group(0), p, ('name="generator" content="' + M.GENERATOR) in open(p, encoding='utf8').read(4000)
    n = M.plate_no(arg); sn = M.st_no(n)
    hits = [x for x in os.listdir(M.ST_DIR) if x.startswith('st-%02d-' % sn) and x.endswith('.html')]
    if not hits: raise SystemExit('no page for %s yet: run `python3 make_study.py %s`' % (arg, arg))
    hits.sort(key=lambda x: os.path.getmtime(os.path.join(M.ST_DIR, x)))
    return 'p%02d' % n, os.path.join(M.ST_DIR, hits[-1]), True


async def run(arg, poke=True):
    tid, path, generated = target(arg); ok = True
    print('%s  %s' % (tid, path))
    os.makedirs(SHOTS, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=M.CHROME, args=M.CHROME_ARGS)
        for tag, w, h, dpr, scale in VIEWS:
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, has_touch=(tag == 'phone'), is_mobile=(tag == 'phone'))
            pg = await ctx.new_page(); errs, reqs = [], []
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('request', lambda r: reqs.append(r.url) if not re.match(r'^(file|data|blob|about):', r.url) else None)
            await pg.goto('file://' + path)
            try:
                await pg.wait_for_function("()=>{ const c=document.getElementById('ctr'); const m=c&&c.textContent.match(/(\\d+) \\/ (\\d+)/); const read=m&&m[1]===m[2]&&+m[2]>0; return read && (window.__MP ? !!(window.__MP.st.bench||window.__MP.st.benchErr) : true); }", timeout=45000)
            except Exception as e:
                errs.append('timed out waiting for the read and the benchmark')
            await pg.wait_for_timeout(700)
            s = await pg.evaluate(STATE)
            over = s['scrollW'] - s['clientW']
            await pg.screenshot(path=os.path.join(SHOTS, 'st_%s_%s.jpg' % (tid, tag)), type='jpeg', quality=82, scale=scale)
            # the instrument: notes column scrolled to the controls (desk), page scrolled to the panel (phone)
            await pg.evaluate("()=>{ const m=document.querySelector('.mp')||document.querySelector('#copy .params')||document.querySelector('#copy .meta'); if(m) m.scrollIntoView({block:'start'}); if(innerWidth<=960) scrollBy(0,-Math.round(innerHeight*0.5)); }")
            await pg.wait_for_timeout(250)
            await pg.screenshot(path=os.path.join(SHOTS, 'st_%s_%s_ctl.jpg' % (tid, tag)), type='jpeg', quality=82, scale=scale)
            poked = None
            if generated and poke:
                try: poked = await pg.evaluate(POKE)
                except Exception as e: errs.append('poke failed: ' + str(e).split('\n')[0])
                s2 = await pg.evaluate(STATE); over = max(over, s2['scrollW'] - s2['clientW']); s['wide'] = s['wide'] or s2['wide']
            bad = bool(errs or reqs or over > 0 or s['wide'] or s['layout'] or (generated and not s['rest']) or (generated and (s['bench'] != 'done' or not re.match(r'^match \d+\.\d %$', s['match'] or ''))))
            ok = ok and not bad
            print('  %-5s %dx%d@%d  %s' % (tag, w, h, dpr, 'FAIL' if bad else 'ok'))
            print('    console errors: %s' % (errs or 'none'))
            print('    external requests: %s' % (reqs or 'none'))
            print('    horizontal overflow: %s px%s' % (max(over, 0), (' · past the edge: ' + ', '.join(s['wide'])) if s['wide'] else ''))
            print('    layout: %s' % ('; '.join(s['layout']) or 'title block and track log inside the figure column'))
            print('    match text: %s%s' % (s['match'], ('  (mean %.4f over %d metrics)' % (s['mean'], s['rows'])) if s['mean'] is not None else ''))
            print('    canvas: #cv %dx%d px shown at %dx%d · figure %s · plate render %s%s' % (s['cv'][0], s['cv'][1], s['cv'][2], s['cv'][3], 'x'.join(str(v) for v in s['fig'][2:]) if s['fig'] else '?', 'x'.join(str(v) for v in s['plate']) if s['plate'] else 'n/a', (' in %d ms' % s['ms']) if s['ms'] is not None else ''))
            print('    title: %s · read %s · techniques: %s' % (s['title'], s['ctr'], ', '.join(s['tags'])))
            if generated: print('    first paint: %s' % ('defaults, bench palette, Motion and Live off' if s['rest'] else 'NOT the default render'))
            if poked: print('    poke: ' + json.dumps(poked, ensure_ascii=False))
            print('    shots: %s, %s' % (os.path.join(SHOTS, 'st_%s_%s.jpg' % (tid, tag)), os.path.join(SHOTS, 'st_%s_%s_ctl.jpg' % (tid, tag))))
            await ctx.close()
        await b.close()
    return ok


if __name__ == '__main__':
    argv = sys.argv[1:]
    if '--shots' in argv: i = argv.index('--shots'); SHOTS = os.path.abspath(argv[i + 1]); del argv[i:i + 2]
    args = [a for a in argv if not a.startswith('--')]
    if not args: raise SystemExit(__doc__)
    res = [asyncio.run(run(a, '--no-poke' not in sys.argv)) for a in args]
    sys.exit(0 if all(res) else 1)
