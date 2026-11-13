"""search.py <plate> <item index> [step] — slide the item's window over the render; list best-matching rects"""
import sys, json, asyncio, base64
from playwright.async_api import async_playwright
JS="""async ([id,idx,step,ref])=>{const pl=PLATES.find(p=>p.id===id);await draw(id,pl.bench.params||{},pl.bench.palette);const cv=document.getElementById('c');const img=cv.getContext('2d').getImageData(0,0,cv.width,cv.height);const it=Object.assign({},pl.bench.items[idx]);const full=it.m;it.m=it.m.filter(m=>m!=='spec'&&m!=='ac');const [,,w,h]=it.out;const res=[];for(let y=0;y+h<=cv.height;y+=step)for(let x=0;x+w<=cv.width;x+=step){it.out=[x,y,w,h];const O=MX.measure(img,it,'out');const c=MX.compare(ref[idx],O,it);res.push([c.reduce((s,v)=>s+v[1],0)/c.length,x,y])}res.sort((a,b)=>b[0]-a[0]);return res.slice(0,6)}"""
async def main():
    pid,idx=sys.argv[1],int(sys.argv[2]); step=int(sys.argv[3]) if len(sys.argv)>3 else 16
    ref=json.load(open(f'refstats/{pid}.json'))
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--force-color-profile=srgb','--no-sandbox']); pg=await b.new_page(); await pg.goto('file:///home/claude/plates/dev.html?p='+pid)
        print(await pg.evaluate(JS,[pid,idx,step,ref])); await b.close()
asyncio.run(main())
