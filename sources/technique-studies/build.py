import base64, json, os
R='/home/claude/plates'; rd=lambda p: open(os.path.join(R,p),encoding='utf8').read()
def font(fam,wt,path): b=base64.b64encode(open(os.path.join(R,'fonts',path),'rb').read()).decode(); return '@font-face{font-family:"%s";font-weight:%s;font-style:normal;font-display:block;src:url(data:font/woff2;base64,%s) format("woff2")}'%(fam,wt,b)
fonts='\n'.join([font('Archivo Black',400,'x_fontsource-archivo-black-5.3.0/package/files/archivo-black-latin-400-normal.woff2'),font('Anton',400,'x_fontsource-anton-5.3.0/package/files/anton-latin-400-normal.woff2'),font('Archivo',600,'x_fontsource-archivo-5.3.0/package/files/archivo-latin-600-normal.woff2'),font('Archivo',700,'x_fontsource-archivo-5.3.0/package/files/archivo-latin-700-normal.woff2')])
ids=['p1','p2','p3','p4']; refstats={i:json.load(open(os.path.join(R,'refstats',i+'.json'))) for i in ids}
def slim(o):
    if isinstance(o,float): return round(o,4)
    if isinstance(o,list): return [slim(v) for v in o]
    if isinstance(o,dict): return {k:slim(v) for k,v in o.items()}
    return o
js='\n'.join(rd('src/'+f) for f in ['util.js','p1_lut.js','p1.js','p2.js','p3.js','p4.js','meta.js','metrics.js'])
html=f'''<title>Measured Plates</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
{fonts}
{rd('src/app.css')}
</style>
<div class="wrap">
<header class="top">
<h1>Measured Plates</h1>
<p class="lede">Four technique engines, drawn live in the browser. Each one is scored against statistics read off its reference image, and every slider changes the material itself. Batch 1 of the set.</p>
<nav class="idx" id="idx" aria-label="Plates"></nav>
</header>
<main id="plates" style="display:flex;flex-direction:column;gap:48px"></main>
<footer>
<span>The references themselves are not embedded; only the numbers measured from them are.</span>
<span>Type: Anton and Archivo Black stand in for the reference faces. All texture is computed at render time.</span>
</footer>
</div>
<script>
const REFSTATS={json.dumps(slim(refstats),separators=(',',':'))};
{js}
{rd('src/app.js')}
</script>
'''
open(os.path.join(R,'out','measured-plates.html'),'w',encoding='utf8').write(html); print('bytes',len(html))
