import asyncio, json
from playwright.async_api import async_playwright
SK='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
open('out/_test.html','w').write(SK+open('out/measured-plates.html').read()+'</body></html>')
async def run(w,h,dpr,scheme,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--force-color-profile=srgb','--no-sandbox'])
        ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=dpr,color_scheme=scheme); pg=await ctx.new_page(); errs=[]; reqs=[]
        pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('request',lambda r: reqs.append(r.url) if not r.url.startswith('file:') and not r.url.startswith('data:') else None)
        await pg.goto('file:///home/claude/plates/out/_test.html')
        for i in range(4):
            await pg.evaluate(f"document.querySelectorAll('section.plate')[{i}].scrollIntoView()"); await pg.wait_for_timeout(2600)
        info=await pg.evaluate("""()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,scores:[...document.querySelectorAll('.score')].map(e=>e.textContent),canv:[...document.querySelectorAll('section.plate canvas')].map(c=>[c.width,c.height,Math.round(c.getBoundingClientRect().width)]),wide:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+1&&!e.closest('pre,.tw')).slice(0,5).map(e=>e.tagName+'.'+e.className)})""")
        print(tag,json.dumps(info),'errors',errs,'external',reqs)
        secs=await pg.query_selector_all('section.plate')
        for i,s in enumerate(secs[:4]):
            wk=await s.query_selector('.work'); await wk.screenshot(path=f'shots/page_{tag}_{i+1}.jpg',type='jpeg',quality=80)
        await pg.evaluate("window.scrollTo(0,0)"); await pg.screenshot(path=f'shots/page_{tag}_top.jpg',type='jpeg',quality=80)
        await b.close()
async def main():
    await run(1440,900,1,'light','desk'); await run(390,844,2,'dark','phone')
asyncio.run(main())
