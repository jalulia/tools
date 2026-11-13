import asyncio, json
from playwright.async_api import async_playwright
JS="""async (id)=>{const pl=PLATES.find(p=>p.id===id);const cv=document.getElementById('c');const grab=async(o,pal)=>{await draw(id,o,pal,0.5);const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;const a=new Float32Array(d.length/4);let m=0,nan=0;for(let i=0;i<a.length;i++){a[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];m+=a[i];if(d[i*4+3]!==255)nan++}m/=a.length;let v=0;for(let i=0;i<a.length;i++)v+=(a[i]-m)**2;return{a,std:Math.sqrt(v/a.length),nan,rgb:[d[0],d[1],d[2]],data:d}};const diff=(A,B)=>{let s=0;for(let i=0;i<A.a.length;i++)s+=Math.abs(A.a[i]-B.a[i]);return s/A.a.length};const cdiff=(A,B)=>{let s=0;for(let i=0;i<A.data.length;i+=16)s+=Math.abs(A.data[i]-B.data[i])+Math.abs(A.data[i+1]-B.data[i+1])+Math.abs(A.data[i+2]-B.data[i+2]);return s/(A.data.length/16)/3};const out={params:[],pal:[],presets:[],errors:[]};const base=await grab({});for(const p of pl.params){try{const lo=await grab({[p.key]:p.min}),hi=await grab({[p.key]:p.max});out.params.push({k:p.key,d:+diff(lo,hi).toFixed(2),dlo:+diff(lo,base).toFixed(2),dhi:+diff(hi,base).toFixed(2),flat:lo.std<1||hi.std<1,bad:lo.nan+hi.nan})}catch(e){out.errors.push(p.key+': '+e.message)}}for(const q of pl.palettes){try{const r=await grab({},q.id);out.pal.push({id:q.id,d:+cdiff(r,base).toFixed(2),std:+r.std.toFixed(1)})}catch(e){out.errors.push('pal '+q.id+': '+e.message)}}for(const q of (pl.presets||[])){try{const r=await grab(q.set);out.presets.push({n:q.name,d:+diff(r,base).toFixed(2),std:+r.std.toFixed(1)})}catch(e){out.errors.push('preset '+q.name+': '+e.message)}}for(const t of (pl.texts||[])){try{const r=await grab({[t.key]:''});const r2=await grab({[t.key]:'A VERY LONG LINE OF TEXT / AND MORE / AND MORE STILL'});out.params.push({k:'text:'+t.key,d:+diff(r,r2).toFixed(2),flat:false,bad:0})}catch(e){out.errors.push('text '+t.key+': '+e.message)}}for(const t of (pl.selects||[])){for(const o of t.options){try{const r=await grab({[t.key]:o[0]});out.presets.push({n:'select '+o[0],d:+diff(r,base).toFixed(2),std:+r.std.toFixed(1)})}catch(e){out.errors.push('select '+o[0]+': '+e.message)}}}return out}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--force-color-profile=srgb','--no-sandbox']); pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); allr={}
        import sys
        for pid in (sys.argv[1:] or ['p1','p2','p3','p4']):
            await pg.goto('file:///home/claude/plates/dev.html?p='+pid)
            r=await pg.evaluate(JS,pid); allr[pid]=r
            weak=[x for x in r['params'] if x['d']<0.4 or x['flat'] or x['bad']]
            print(pid,'params',len(r['params']),'palettes',len(r['pal']),'presets',len(r['presets']),'errors',r['errors'])
            print('  weakest:',sorted([(x['k'],x['d']) for x in r['params']],key=lambda t:t[1])[:6])
            print('  flagged:',weak)
            print('  pal:',[(x['id'],x['d']) for x in r['pal']],'presets:',[(x['n'],x['d']) for x in r['presets']])
        json.dump(allr,open('param_tests.json','w')); print('pageerrors',errs)
        await b.close()
asyncio.run(main())
