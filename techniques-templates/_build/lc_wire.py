# writes lc-figure.js from the lift probe (_build/qa/lift-probe.json) plus per-family extras; argv: codes, family [dial filter json]
# Refresh (charter fixes, Nov 18): python3 _build/lc_wire.py PL-03,PL-11 fix
#   keeps each plate's measured part of lc-figure.js (source, selector, size, crop, inks) and rewrites its dials, extras and
#   patches from its family here (CODE_FAM) plus the plate's own row in FIX: dials (the final list, in panel order), extra
#   (leaf overrides: range, default, options, scale), patches (added, or replacing a family patch with the same search
#   string), unpatch (family search strings to drop), set (top-level keys such as ground; None removes one) and
#   inkswap (a measured ink replaced by another, e.g. a cream ground by Paper #FBFBF7).
#   Running it again gives the same file. plates.json is not touched in this mode.
import json,sys
sys.path.insert(0,'_build')
R=json.load(open('_build/qa/lift-probe.json'))
import os
LI=json.load(open('_build/qa/layer-inks.json')) if os.path.exists('_build/qa/layer-inks.json') else {}
FAM={
 'soft-focus':{'dials':['blur','grain','dust','velvet','seed'],
   'extra':{'dust':{'value':1,'range':[0,3],'step':0.01,'label':'Dust','unit':'×','note':'The white dust the page scatters over the plate, as a multiple of its own. 0 clears it.'},
            'grain':{'value':1,'range':[0,3],'step':0.01,'label':'Grain','unit':'×','note':'The grain the page lays over each plate, mono and chromatic, as a multiple of its own. 0 leaves the paint clean.'},
            'velvet':{'value':1,'range':[0,2.5],'step':0.01,'label':'Velvet','unit':'×','note':'Depth of the velvet noise multiplied into each soft shape. 0 lays the color flat.'},
            'seed':{'value':0,'range':[0,40],'step':1,'label':'Seed','note':'Re-rolls every seeded choice the page makes: the grain, the noise and where each mark falls. 0 is the page’s own drawing.'}},
   'patches':[['function RNG(seed){let s=','function RNG(seed){seed+=((window.__P||{}).seed|0);let s='],
              ['function grainCtx(x,W,H,amt,rng,onlyInk=false){','function grainCtx(x,W,H,amt,rng,onlyInk=false){amt*=((window.__P||{}).grain==null?1:window.__P.grain);'],
              ['function chromaGrain(x,W,H,amt,rng){','function chromaGrain(x,W,H,amt,rng){amt*=((window.__P||{}).grain==null?1:window.__P.grain);'],
              ['function noiseTile(rng,size=256,lo=150,hi=255){','function noiseTile(rng,size=256,lo=150,hi=255){lo=255-(255-lo)*((window.__P||{}).velvet==null?1:window.__P.velvet);'],
              ['function grainVeil(plate,W,H,strength=18,seed=3,tint=[20,20,20]){','function grainVeil(plate,W,H,strength=18,seed=3,tint=[20,20,20]){strength*=((window.__P||{}).grain==null?1:window.__P.grain);'],
              ['function dustVeil(plate,W,H,strength=40,seed=5,density=.06){','function dustVeil(plate,W,H,strength=40,seed=5,density=.06){strength*=((window.__P||{}).dust==null?1:window.__P.dust);']],
   'composite':True,'overlay':True},
}
FAM['keyline']={'dials':['weight','bleed','misreg','pitch','grain','dust','tooth','type','seed'],
   'extra':{'bleed':{'value':1,'range':[0,3],'step':0.01,'label':'Ink bleed','unit':'×','note':'How far the page lets each ink wander off its edge (the displacement in its ink filter), as a multiple of its own. 0 prints a clean edge.'},
            'misreg':{'value':1,'range':[0,4],'step':0.01,'label':'Misregistration','unit':'×','note':'How far each riso plate shifts off true, as a multiple of the page’s own.'},
            'pitch':{'value':1,'range':[0.5,2.5],'step':0.01,'label':'Screen ruling','unit':'×','note':'Spacing of every dot and line screen, with its dots and lines grown to keep the same coverage.'},
            'grain':{'value':1,'range':[0,3],'step':0.01,'label':'Grain','unit':'×','note':'The dark grain veil the page lays over the plate, as a multiple of its own. 0 leaves the print clean.'},
            'dust':{'value':1,'range':[0,3],'step':0.01,'label':'Dust','unit':'×','note':'The white speckle where the ink skipped, as a multiple of its own. 0 clears it.'},
            'tooth':{'value':1,'range':[0,2],'step':0.01,'label':'Paper tooth','unit':'×','note':'Opacity of the paper texture multiplied over the plate. 0 is a smooth sheet.'},
            'seed':{'value':0,'range':[0,40],'step':1,'label':'Seed','note':'Re-rolls every seeded choice the page makes: the paper, grain, dust and the ink filters’ noise. 0 is the page’s own print.'}},
   'patches':[['function RNG(seed){let s=','function RNG(seed){seed+=((window.__P||{}).seed|0);let s='],
              ['function inkFilter(id,fine,freq,holes,holeFreq,seed){','function inkFilter(id,fine,freq,holes,holeFreq,seed){fine*=((window.__P||{}).bleed==null?1:window.__P.bleed);seed+=((window.__P||{}).seed|0);'],
              ['function risoPlate(id,seed,grainAmt=1.35,shift=1.2){','function risoPlate(id,seed,grainAmt=1.35,shift=1.2){shift*=((window.__P||{}).misreg==null?1:window.__P.misreg);seed+=((window.__P||{}).seed|0);'],
              ['function dotScreen(id,color,pitch,r,angle=45){','function dotScreen(id,color,pitch,r,angle=45){pitch*=((window.__P||{}).pitch==null?1:window.__P.pitch);r*=((window.__P||{}).pitch==null?1:window.__P.pitch);'],
              ['function lineScreen(id,color,pitch,w,angle=45){','function lineScreen(id,color,pitch,w,angle=45){pitch*=((window.__P||{}).pitch==null?1:window.__P.pitch);w*=((window.__P||{}).pitch==null?1:window.__P.pitch);'],
              ['function grainVeil(plate,W,H,strength=18,seed=3,tint=[20,20,20]){','function grainVeil(plate,W,H,strength=18,seed=3,tint=[20,20,20]){strength*=((window.__P||{}).grain==null?1:window.__P.grain);'],
              ['function dustVeil(plate,W,H,strength=40,seed=5,density=.06){','function dustVeil(plate,W,H,strength=40,seed=5,density=.06){strength*=((window.__P||{}).dust==null?1:window.__P.dust);'],
              ['function tooth(plate,W,H,seed=1,op=.5){','function tooth(plate,W,H,seed=1,op=.5){op*=((window.__P||{}).tooth==null?1:window.__P.tooth);']],
   'composite':True,'overlay':True}

def _P(k,d=1): return "((window.__P||{}).%s==null?%s:window.__P.%s)"%(k,d,k)
def _x(v,lo,hi,step,label,note,unit=None):
    o={'value':v,'range':[lo,hi],'step':step,'label':label,'note':note}
    if unit: o['unit']=unit
    return o
FAM['worlds-v2']={'dials':[],'overlay':True,
  'per':{'PL-49':['turn','tilt','tube','twist','density','coral','mark'],'PL-50':['turn','tilt','tube','twist','density','coral','mark'],
         'PL-51':['rings','spacing','squash','rotate','weight'],'PL-53':['freq','amp','env','pitch','ink','moment'],'PL-54':['oturn','radius','glyphs','gstep','type','ink']},
  'extra':{'turn':_x(0,-1.5,1.5,0.01,'Turn','How far the loop is turned about its axis, added to the page’s own angle.','rad'),
    'tilt':_x(0,-0.8,0.8,0.01,'Tilt','How far the loop leans toward you, added to the page’s 0.85 rad.','rad'),
    'tube':_x(1,0.2,2.2,0.01,'Tube','Thickness of the ring’s tube, as a multiple of the page’s 0.32.','×'),
    'twist':_x(1,0,4,0.01,'Twist','Height of the three-lobed twist along the ring, as a multiple of the page’s own.','×'),
    'density':_x(1,0.35,1.4,0.01,'Mark density','How many of the ring’s 13,500 sample points are kept as marks. 1 is the page’s own thinning.','×'),
    'coral':_x(0.175,0,0.5,0.005,'Coral share','How much of the ring turns coral where it catches the light. 0 is all lime.'),
    'rings':_x(45,6,90,1,'Rings','How many afterimage ellipses are drawn.'),
    'spacing':_x(1,0.4,2.5,0.01,'Ring spacing','Gap between rings, as a multiple of the page’s 5 px.','×'),
    'squash':_x(1,0.3,1.6,0.01,'Squash','Height of each ring against its width, as a multiple of the page’s 0.64.','×'),
    'rotate':_x(0,-1.6,1.6,0.01,'Rotation','Turn of the rings, added to the page’s −0.4 rad.','rad'),
    'freq':_x(1,0.3,3,0.01,'Wave frequency','How many beats each exchange’s wave packs in, as a multiple of what its letters give.','×'),
    'amp':_x(1,0.2,1.6,0.01,'Amplitude','Height of each wave in its row, as a multiple of the page’s own.','×'),
    'env':_x(0.7,0.1,3,0.01,'Envelope','How the wave swells from its ends: the power on the page’s sine envelope. Low is full width, high pinches to the middle.'),
    'pitch':_x(2,1,8,1,'Bar pitch','Spacing of the vertical bars that build each wave, in px.','px'),
    'oturn':_x(0,-3.1,3.1,0.01,'Turn','Turn of the helix, added to the angle you set by dragging across it.','rad'),
    'radius':_x(1,0.3,1.6,0.01,'Radius','Width of the helix, as a multiple of the page’s 0.28 of the frame.','×'),
    'glyphs':_x(120,10,240,1,'Glyphs per strand','Most letters each strand may set (its count of letters, up to this).'),
    'gstep':_x(1,0.2,3,0.01,'Coil','How far each letter turns along its strand, as a multiple of the page’s 0.045 rad.','×')},
  'patches':[['function sculpture(x,w,h,phase=.3,small=false){','function sculpture(x,w,h,phase=.3,small=false){phase+=%s;'%_P('turn',0)],
    ['r=1+.32*Math.cos(v)','r=1+.32*%s*Math.cos(v)'%_P('tube')],['pz=.32*Math.sin(v)','pz=.32*%s*Math.sin(v)'%_P('tube')],
    ['yy=py*Math.cos(.85)-pz*Math.sin(.85),zz=py*Math.sin(.85)+pz*Math.cos(.85)','TL=.85+%s,yy=py*Math.cos(TL)-pz*Math.sin(TL),zz=py*Math.sin(TL)+pz*Math.cos(TL)'%_P('tilt',0)],
    ['tw=.18*Math.sin(u*3)','tw=.18*%s*Math.sin(u*3)'%_P('twist')],
    ['if(hash(p.i,p.j)>p.light*.82+.16)continue;','if(hash(p.i,p.j)>(p.light*.82+.16)*%s)continue;'%_P('density')],
    ['let hot=Math.sin(p.u+phase*1.2)>.65;','let hot=Math.sin(p.u+phase*1.2)>1-2*%s;'%_P('coral',.175)],
    ['for(let i=0;i<45;i++){x.beginPath();x.ellipse(w*.75,h*.6,i*5,i*3.2,-.4,0,TAU);x.stroke()}','for(let i=0;i<%s;i++){x.beginPath();x.ellipse(w*.75,h*.6,i*5*%s,i*3.2*%s*%s,-.4+%s,0,TAU);x.stroke()}'%(_P('rings',45),_P('spacing'),_P('spacing'),_P('squash'),_P('rotate',0))],
    ['val=Math.sin(f*TAU*(c.f[0]*9+2))*Math.sin(f*TAU*(c.f[1]*11+1))','val=Math.sin(f*TAU*(c.f[0]*9+2)*%s)*Math.sin(f*TAU*(c.f[1]*11+1)*%s)'%(_P('freq'),_P('freq'))],
    ['amp=(row*.37)*env*','amp=(row*.37*%s)*env*'%_P('amp')],['env=Math.sin(f*Math.PI)**.7','env=Math.sin(f*Math.PI)**%s'%_P('env',.7)],
    ['for(let j=0;j<width;j+=2){','for(let j=0;j<width;j+=%s){'%_P('pitch',2)],
    ['let a=i*.62+j*.045+objectAngle,px=w*.57+Math.cos(a)*w*.28','let a=i*.62+j*.045*%s+objectAngle+%s,px=w*.57+Math.cos(a)*w*.28*%s'%(_P('gstep'),_P('oturn',0),_P('radius'))],
    ['for(let j=0;j<Math.min(c.n,120);j++){','for(let j=0;j<Math.min(c.n,%s);j++){'%_P('glyphs',120)]]}

FAM['a10-specs']={'dials':['weight','mark','ink','tilt','shown'],
  'extra':{'tilt':_x(0,0,80,1,'View tilt','Tilt of the top view off straight down, in degrees (the side view below stays side-on).','°'),
           'shown':_x(1,0.05,1,0.01,'Strands shown','Share of the record’s strands drawn, from the first. 1 is the whole record.')},
  'patches':[['drawRecord(x, r, { cx: 220, cy: 190, S: 150, px: 1.5, N: n, tilt: 0,','drawRecord(x, r, { cx: 220, cy: 190, S: 150, px: 1.5, N: Math.max(1, Math.round(n * %s)), tilt: %s,'%(_P('shown'),_P('tilt',0))],
             ['drawRecord(x, r, { cx: 220, cy: 570, S: 190, px: 1.5, N: n, tilt: 90,','drawRecord(x, r, { cx: 220, cy: 570, S: 190, px: 1.5, N: Math.max(1, Math.round(n * %s)), tilt: 90,'%_P('shown')]]}

FAM['counted-marks']={'dials':['dot','cell','den','seed'],
  'per':{'PL-151':['dot','cell','den','seed'],'PL-152':['dot','cell','den','count','seed'],'PL-153':['dot','cell','den','count','seed'],'PL-154':['dot','cell','den','seed','type']},
  'extra':{'dot':_x(1,0.4,3,0.01,'Dot size','Size of every printed dot, as a multiple of the deck’s own.','×'),
    'cell':_x(1,0.5,3,0.01,'Screen pitch','Spacing of the cells each dot is printed in, as a multiple of the deck’s own. Larger is coarser.','×'),
    'den':_x(1,0.2,2.5,0.01,'Density','How many dots each cell prints for the count it carries, as a multiple of the deck’s own.','×'),
    'count':_x(1,0.2,2,0.01,'Strands','How many strands (ring) or arcs are counted, as a multiple of the deck’s own.','×'),
    'seed':_x(0,0,40,1,'Seed','Re-rolls where every dot falls. 0 is the deck’s own print.')},
  'patches':[['const want=(o.dot||1.6)*u, cell=(o.cell||3.6)*u, r=Math.max(1,want), seed=o.seed||1, M=o.multi||3,','const want=(o.dot||1.6)*u*%s, cell=(o.cell||3.6)*u*%s, r=Math.max(1,want), seed=(o.seed||1)+%s, M=o.multi||3,'%(_P('dot'),_P('cell'),_P('seed',0))],
    ['    d*=ks;\n','    d*=ks*%s;\n'%_P('den')],
    ['ring(ctx,W,H,u,o){const n=o.n||126,cx=W/2,cy=H/2,R0=Math.min(W,H)*.2,R1=Math.min(W,H)*.44,seed=o.seed||1;const step=3.2*u;const r=Math.max(1,1.7*u);','ring(ctx,W,H,u,o){const n=Math.max(3,Math.round((o.n||126)*%s)),cx=W/2,cy=H/2,R0=Math.min(W,H)*.2,R1=Math.min(W,H)*.44,seed=(o.seed||1)+%s;const step=3.2*u*%s;const r=Math.max(1,1.7*u*%s);'%(_P('count'),_P('seed',0),_P('cell'),_P('dot'))],
    ['if(h2(k,s,seed+9)<.12)continue;','if(h2(k,s,seed+9)<1-.88*%s)continue;'%_P('den')],
    ['arcs(ctx,W,H,u,o){const seed=o.seed||1,post=o.post;','arcs(ctx,W,H,u,o){const seed=(o.seed||1)+%s,post=o.post;'%_P('seed',0)],
    ['r=Math.max(1,1.5*u);\n   for(let k=0;k<(post?40:28);k++){','r=Math.max(1,1.5*u*%s);\n   for(let k=0;k<Math.round((post?40:28)*%s);k++){'%(_P('dot'),_P('count'))],
    ['const N=Math.ceil(rx*1.6*Math.PI/2.4);','const N=Math.ceil(rx*1.6*Math.PI/(2.4*%s));'%_P('cell')],
    ['if(h2(k,s,seed+5)<.35&&k)continue;','if(h2(k,s,seed+5)<1-.65*%s&&k)continue;'%_P('den')]]}

FAM['garden']={'auto':True,'settle':2500,
  'patches':[["fetch(RAW+PATH+'?t='+Date.now(),{cache:'no-store'})","fetch('/tools/techniques-templates/plates/pl-130-the-garden-read-as-a-sheet/garden-2026-09-06.json',{cache:'no-store'})"],
             ["fetch(RAW+'encyclopedia/manifest.js?t='+Date.now(),{cache:'no-store'})","Promise.reject(new Error('snapshot'))"],
             ['const img=e?`<img src="${ROOT}encyclopedia/content/','const img=false?`<img src="${ROOT}encyclopedia/content/']]}

FAM['exhibition']={'dials':[],'real':True,'settle':3500,
  'per':{'PL-13':['tilt','strands','breath','dot'],'PL-16':['vtilt','strands','breath','dot','zoom']},
  'extra':{'tilt':_x(72,0,90,1,'Tilt','Angle of the right-hand view, held still: 0 is seen from above, 90 from the side. The page sweeps it over time.','°'),
    'vtilt':_x(0,0,80,1,'View tilt','Tilt of the upper view off straight down (the side view below stays side-on).','°'),
    'strands':_x(1,0.1,2,0.01,'Strands','How many strands the record holds, as a multiple of the page’s own.','×'),
    'breath':_x(7,3,9,0.1,'Breath','How much the lightness swells along the record (the page’s breath, 7 on this figure).'),
    'dot':_x(1,0.4,2.5,0.01,'Dot size','Size of every strand mark, as a multiple of the page’s own.','×'),
    'zoom':_x(1,0.6,1.6,0.01,'Zoom','Scale of the upper view, as a multiple of the page’s 1.12.','×')},
  'patches':[["const nodes = R.makeRecord(168, seedsFrom(DEFAULT_LINES));","const nodes = R.makeRecord(Math.max(8, Math.round(168 * %s)), seedsFrom(DEFAULT_LINES));"%_P('strands')],
    ["const tilt = 90 * (ph * ph * (3 - 2 * ph));","const tilt = (window.__P || {}).tilt != null ? window.__P.tilt : 90 * (ph * ph * (3 - 2 * ph));"],
    ["drawRecord(x, W * .32, H, nodes, { tilt: 0, breath: 7, layer: 'glow', dot: 1.5 });","drawRecord(x, W * .32, H, nodes, { tilt: 0, breath: %s, layer: 'glow', dot: 1.5 * %s });"%(_P('breath',7),_P('dot'))],
    ["drawRecord(x, W * .68, H, nodes, { tilt, breath: 7, layer: 'path', dot: 1.8, recall: tilt > 70 });","drawRecord(x, W * .68, H, nodes, { tilt, breath: %s, layer: 'path', dot: 1.8 * %s, recall: tilt > 70 });"%(_P('breath',7),_P('dot'))],
    ["const n2 = R.makeRecord(210, seedsFrom(DEFAULT_LINES));","const n2 = R.makeRecord(Math.max(8, Math.round(210 * %s)), seedsFrom(DEFAULT_LINES));"%_P('strands')],
    ["drawRecord(x, W, 440, n2, { tilt: 0, breath: 7, layer: 'glow', dot: 1.9, zoom: 1.12 });","drawRecord(x, W, 440, n2, { tilt: %s, breath: %s, layer: 'glow', dot: 1.9 * %s, zoom: 1.12 * %s });"%(_P('vtilt',0),_P('breath',7),_P('dot'),_P('zoom'))],
    ["drawSide(x, 0, 500, W, 250, n2, { breath: 7, layer: 'path', dot: 1.7, recall: true });","drawSide(x, 0, 500, W, 250, n2, { breath: %s, layer: 'path', dot: 1.7 * %s, recall: true });"%(_P('breath',7),_P('dot'))]]}

SF=FAM['soft-focus']
SF['extra'].update({
  'lobes':_x(5,3,9,1,'Lobes','How many lobes the blossom has.'),
  'lobek':_x(0.62,0.3,0.9,0.01,'Lobe fullness','Radius of each lobe against the flower’s (the page’s 0.62). Low reads as separate petals, high as one round bloom.'),
  'turn':_x(0,-1.6,1.6,0.01,'Turn','Turn of the blossom, added to the page’s own.','rad'),
  'stamens':_x(22,0,48,1,'Stamens','How many stamens rise from the core.'),
  'reach':_x(1,0.4,1.6,0.01,'Stamen reach','Length of the stamens, as a multiple of the page’s 44 px.','×'),
  'frost':_x(1,0,2.5,0.01,'Frost','How white the glass is (its 28% white tint), as a multiple.','×'),
  'panel':_x(1,0.4,1.15,0.01,'Panel width','Width of the frosted panel, as a multiple of the page’s 270 px.','×'),
  'fruit':_x(1,0.5,1.5,0.01,'Fruit size','Size of every citrus slice behind the glass.','×'),
  'segs':_x(9,4,16,1,'Segments','Segments in each citrus slice.'),
  'spark':_x(1,0,2.5,0.01,'Sparkle size','Size of the four-point sparkles on the glass. 0 removes them.','×')})
SF['patches']=SF['patches']+[
  ['(x,rng)=>{lobes(x,150,140,86,5,-Math.PI/2);x.fillStyle="#f8493a";x.fill();stamens(x,150,140,22,10,44,"#f7d35c",rng,2.6,1.2)}',
   '(x,rng)=>{lobes(x,150,140,86,%s,-Math.PI/2+%s,%s);x.fillStyle="#f8493a";x.fill();stamens(x,150,140,%s,10,44*%s,"#f7d35c",rng,2.6,1.2)}'%(_P('lobes',5),_P('turn',0),_P('lobek',.62),_P('stamens',22),_P('reach'))],
  ['[[120,150,58],[210,190,50],[170,110,44],[262,132,40]].forEach(([cx,cy,r],i)=>citrus(sx,cx,cy,r,["#f3f5a2","#cfe06a"],"#9dbf3a","#f7fbe0",9,i*.4));',
   '[[120,150,58],[210,190,50],[170,110,44],[262,132,40]].forEach(([cx,cy,r],i)=>citrus(sx,cx,cy,r*%s,["#f3f5a2","#cfe06a"],"#9dbf3a","#f7fbe0",%s,i*.4));'%(_P('fruit'),_P('segs',9))],
  ['glass(x,src,W,H,70,80,270,180,{blur:14});\n    [[120,150,7],[230,120,5],[300,200,9],[180,220,4]].forEach(([a,b,r])=>sparkle(x,a,b,r));',
   'glass(x,src,W,H,70,80,270*%s,180,{blur:14,tint:"rgba(255,255,255,"+Math.min(1,.28*%s)+")"});\n    [[120,150,7],[230,120,5],[300,200,9],[180,220,4]].forEach(([a,b,r])=>{if(%s>0)sparkle(x,a,b,r*%s)});'%(_P('panel'),_P('frost'),_P('spark'),_P('spark'))]]
SF['per']={'PL-114':['lobes','lobek','turn','stamens','reach','seed'],'PL-115':['blur','grain','seed','ink'],'PL-116':['blur','grain','seed','ink'],
  'PL-117':['blur','frost','panel','fruit','segs','spark']}


SF['extra'].update({
  'bloom':_x(1,0.4,1.8,0.01,'Bloom size','Size of the two blurred blooms behind the type.','×'),
  'glow':_x(1,0.2,1.4,0.01,'Bloom strength','Opacity of the blooms, as a multiple of the page’s own.','×'),
  'drift':_x(0,-160,40,1,'Bloom position','Moves the blooms left (negative) or right across the sheet.','px'),
  'bokeh':_x(1,0,2.5,0.01,'Bokeh size','Size of the out-of-focus discs. 0 removes them.','×'),
  'streak':_x(1,0,2.4,0.01,'Streak length','Length of the lens-flare streak.','×'),
  'crystal':_x(1,0.3,2.5,0.01,'Crystal size','Size of the small frost crystal.','×'),
  'slices':_x(10,4,16,1,'Segments','Segments in each citrus round and wedge.')})
SF['patches']=SF['patches']+[
  ['blob(x,270,140,60,"#ff8b7c",26,.7);blob(x,300,220,40,"#ffe27a",22,.6);','blob(x,270+%s,140,60*%s,"#ff8b7c",26,Math.min(1,.7*%s));blob(x,300+%s,220,40*%s,"#ffe27a",22,Math.min(1,.6*%s));'%(_P('drift',0),_P('bloom'),_P('glow'),_P('drift',0),_P('bloom'),_P('glow'))],
  ['[[60,70,4],[120,60,7],[210,110,11],[300,70,6],[90,190,9],[250,200,5]].forEach(([a,b,r])=>sparkle(x,a,b,r));','[[60,70,4],[120,60,7],[210,110,11],[300,70,6],[90,190,9],[250,200,5]].forEach(([a,b,r])=>{if(%s>0)sparkle(x,a,b,r*%s)});'%(_P('spark'),_P('spark'))],
  ['[[300,170,18],[330,210,10]].forEach(([a,b,r])=>{blob(x,a,b,r,"rgba(255,255,255,.55)",6);blob(x,a,b,r*.35,"#fff",1)});','[[300,170,18],[330,210,10]].forEach(([a,b,r])=>{r*=%s;if(r>0){blob(x,a,b,r,"rgba(255,255,255,.55)",6);blob(x,a,b,r*.35,"#fff",1)}});'%_P('bokeh')],
  ['frostStar(x,180,180,20,RNG(9),"rgba(255,255,255,.9)");','frostStar(x,180,180,20*%s,RNG(9+((window.__P||{}).seed|0)),"rgba(255,255,255,.9)");'%_P('crystal')],
  ['x.moveTo(30,230);x.lineTo(160,226);','x.moveTo(30,230);x.lineTo(30+130*%s,230-4*%s);'%(_P('streak'),_P('streak'))],
  ['glass(x,src,W,H,222,250,358,550,{blur:8,tint:"rgba(255,255,255,.18)"});','glass(x,src,W,H,222,250,358,550,{blur:8,tint:"rgba(255,255,255,"+Math.min(1,.18*%s)+")"});'%_P('frost')],
  ['[[300,420,8],[420,470,5],[470,560,11],[330,640,6],[510,700,7],[380,540,4],[260,720,9]].forEach(([a,b,r])=>sparkle(x,a,b,r));','[[300,420,8],[420,470,5],[470,560,11],[330,640,6],[510,700,7],[380,540,4],[260,720,9]].forEach(([a,b,r])=>{if(%s>0)sparkle(x,a,b,r*%s)});'%(_P('spark'),_P('spark'))],
  ['.forEach(([cx,cy,r,rot])=>citrus(sx,cx,cy,r,OR,RIM,PITH,10,rot));','.forEach(([cx,cy,r,rot])=>citrus(sx,cx,cy,r,OR,RIM,PITH,%s,rot));'%_P('slices',10)]]
SF['per'].update({'PL-118':['blur','bloom','glow','drift','type'],'PL-119':['blur','spark','bokeh','streak','crystal','type']})

SF['extra'].update({
  'specks':_x(1,0,3,0.01,'Dust points','How many of the page’s 700 dust points are scattered on the black, as a multiple.','×'),
  'fogtop':_x(0,-0.3,0.25,0.01,'Fog line','Moves where the fog starts: negative raises it over more of the heads.'),
  'lotus':_x(1,0.6,1.3,0.01,'Lotus size','Size of the main lotus, as a multiple of the page’s own.','×'),
  'pads':_x(1,0,2,0.01,'Pad haze','Opacity of the out-of-focus pads and washes behind the lotus. 0 leaves the sheet white.','×')})
SF['patches']=SF['patches']+[
  ['x.fillStyle="#040406";x.fillRect(0,0,B,BH);dust(x,B,BH,700,rng);','x.fillStyle="#040406";x.fillRect(0,0,B,BH);dust(x,B,BH,Math.round(700*%s),rng);'%_P('specks')],
  ['fog(x,B,BH,rng,{top:.66,ribbons:[[.28,.66],[.76,.72]]});','fog(x,B,BH,rng,{top:.66+%s,ribbons:[[.28,.66+%s],[.76,.72+%s]]});'%(_P('fogtop',0),_P('fogtop',0),_P('fogtop',0))],
  ['lotusProfile(x,cx,cy,190,','lotusProfile(x,cx,cy,190*%s,'%_P('lotus')],
  ['blob(x,140,640,150,GREEN,40,.55);blob(x,470,690,120,GREEN2,44,.42);blob(x,520,180,110,GREEN,46,.35);blob(x,110,150,80,PALE,40,.6);',
   'blob(x,140,640,150,GREEN,40,Math.min(1,.55*%s));blob(x,470,690,120,GREEN2,44,Math.min(1,.42*%s));blob(x,520,180,110,GREEN,46,Math.min(1,.35*%s));blob(x,110,150,80,PALE,40,Math.min(1,.6*%s));'%((_P('pads'),)*4)]]
SF['per'].update({'PL-120':['blur','grain','velvet','seed','lotus','pads','type'],'PL-121':['blur','grain','seed','specks','fogtop','type'],'PL-122':['blur','grain','frost','spark','slices','type']})
FAM['a01-specs']={'dials':['weight','mark','tilt','spin','shown','pitch'],
  'extra':{'tilt':_x(0,0,80,1,'View tilt','Tilt of the record off straight down the axis.','°'),
    'spin':_x(0,0,3.14,0.01,'Spin','Turn of the record about its axis, added to its own.','rad'),
    'shown':_x(1,0.05,1,0.01,'Crossings shown','Share of the record’s crossings drawn, from the first. 1 is the whole record.'),
    'pitch':_x(1,0.6,2.5,0.01,'Dot pitch','Spacing of the dot field each lobe is printed in, as a multiple of the page’s own.','×')},
  'patches':[["var rec=recOf(i),pr=cam(rec,0,0,1),T=lobes(rec,pr);T.sig='sp'+i+'_'+Math.round(w);drawTech(x,w,T,'dots',{frame:true});",
    "var rec=recOf(i),UP=Math.max(2,Math.round(rec.N*%s)),pr=cam(rec,%s,%s,1,UP),T=lobes(rec,pr,UP);T.sig='sp'+i+'_'+Math.round(w)+'_'+UP;drawTech(x,w,T,'dots',{frame:true,pitch:Math.max(4.6,1850/w)*%s});"%(_P('shown'),_P('tilt',0),_P('spin',0),_P('pitch'))]]}

FAM['worlds-dom']={'dials':['type','weight'],'dom':True,'real':True,'settle':1500,
  'per':{'PL-41':['contour','grain','warp','type','weight'],'PL-42':['contour','grain','warp','type','weight'],'PL-47':['contour','grain','warp','type','weight'],
         'PL-43':['layout','arr','path','type','weight'],'PL-46':['route','zoom','panx','type','weight']},
  'extra':{'contour':_x(1,0,3,0.01,'Contour','How hard the gradient field snaps into contour bands, as a multiple of the page’s own. 0 is a smooth blend.','×'),
    'grain':_x(1,0,4,0.01,'Grain','The per-pixel grain in the gradient field, as a multiple of the page’s own.','×'),
    'warp':_x(1,0,3,0.01,'Warp','How far the noise folds the field back on itself, as a multiple of the page’s own.','×'),
    'layout':_x(1,1,3,1,'Layout','The table’s own layouts: 1 working table (scatter), 2 aligned, 3 stacked.'),
    'arr':_x(0,0,24,1,'Arrangement','Which arrangement of the scatter the table deals (its “Another arrangement”). 0 is the first.'),
    'path':_x(0,0,1,1,'Reading path','The table’s reading-path overlay: 0 off, 1 on.'),
    'route':_x(1,1,3,1,'Route','Which route the atlas traces: 1 A way in, 2 The room, 3 All crossings.'),
    'zoom':_x(1,0.8,2.4,0.1,'Zoom','The atlas’s own zoom, 80–240%.','×'),
    'panx':_x(0,-300,300,1,'Pan','Slides the atlas sideways under its frame.','px')},
  'patches':[['u=m(.52+l*(1+2.7*Math.exp(-l*l/.012)))','u=m(.52+l*(1+2.7*%(ct)s*Math.exp(-l*l/.012)))'],['p=(h(n,t)-.5)*7,g=(t*220+n)*4','p=(h(n,t)-.5)*7*%(gr)s,g=(t*220+n)*4'],['l=_(r*2+s*1.6+e,o*2+c*1.6)','l=_(r*2+s*1.6*%(wp)s+e,o*2+c*1.6*%(wp)s)'],
    ['s=.44+d*(1+2.5*Math.exp(-d*d/.012))','s=.44+d*(1+2.5*%(ct)s*Math.exp(-d*d/.012))'],['m=(ue(n,e,l)-.5)*9','m=(ue(n,e,l)-.5)*9*%(gr)s'],['s=(fe(r+1.65*a,i+1.65*o,l)-.5)*2.5','s=(fe(r+1.65*%(wp)s*a,i+1.65*%(wp)s*o,l)-.5)*2.5'],
    ['c=.51+l*(1+1.7*Math.exp(-l*l/.012))','c=.51+l*(1+1.7*%(ct)s*Math.exp(-l*l/.012))'],['(Ve(i*4+21,a*3)-.5)*.22','(Ve(i*4+21,a*3)-.5)*.22*%(gr)s'],['i=e+n*.055,a=t+r*.075','i=e+n*.055*%(wp)s,a=t+r*.075*%(wp)s'],
    ['[m,h]=(0,l.useState)(()=>Ze(e,`scatter`,!1))','[m,h]=(0,l.useState)(()=>Ze(e,%(lay)s,!1,%(arr)s))'],['s.current||h(Ze(e,`scatter`,re))','s.current||h(Ze(e,%(lay)s,re,%(arr)s))'],
    ['[g,_]=(0,l.useState)(`scatter`)','[g,_]=(0,l.useState)(%(lay)s)'],['[D,O]=(0,l.useState)(!1),[k,te]=(0,l.useState)(0)','[D,O]=(0,l.useState)(!!((window.__P||{}).path)),[k,te]=(0,l.useState)(%(arr)s)'],
    ['[s,c]=(0,l.useState)(0),[u,d]=(0,l.useState)(1),[p,m]=(0,l.useState)({x:0,y:0})','[s,c]=(0,l.useState)(Math.min(ne.length-1,Math.max(0,Math.round(((window.__P||{}).route||1))-1))),[u,d]=(0,l.useState)(%(zm)s),[p,m]=(0,l.useState)({x:%(px)s,y:0})']]}
WD=FAM['worlds-dom']; D=dict(ct=_P('contour'),gr=_P('grain'),wp=_P('warp'),lay='(["scatter","aligned","stacked"][Math.round((window.__P||{}).layout||1)-1]||"scatter")',arr='((window.__P||{}).arr|0)',zm=_P('zoom'),px=_P('panx',0))
WD['patches']=[[a,b%D] for a,b in WD['patches']]
FAM['auto']={'auto':True}
CODE_FAM={'PL-03':'a01-specs','PL-11':'a10-specs','PL-12':'a10-specs','PL-13':'exhibition','PL-16':'exhibition','PL-130':'garden'}
CODE_FAM.update({c:'auto' for c in ('PL-19','PL-37','PL-56','PL-131','PL-132','PL-144','PL-145','PL-146','PL-147')})
CODE_FAM.update({'PL-%d'%c:'worlds-dom' for c in (41,42,43,46,47)}); CODE_FAM.update({'PL-%d'%c:'worlds-v2' for c in (49,50,51,53,54)})
CODE_FAM.update({'PL-%d'%c:'keyline' for c in (97,98,100,101,102,105,107,108)}); CODE_FAM.update({'PL-%d'%c:'soft-focus' for c in range(114,123)})
CODE_FAM.update({'PL-%d'%c:'counted-marks' for c in range(151,155)})
FIX={}
#@FIX

# ---- A08 resonance field (PL-37): the two ring screens are the figure. Pitch of screen A, how far screen B is detuned
# from it (the clash), how far apart their centers sit, the threshold where they disagree enough to print red, and the
# press's screen (stochastic dots or continuous tone). Generic weight, mark, ink and type dials cut.
_PA=_P('pa',44); _DET="((window.__P||{}).det!=null?window.__P.det/100:clamp(cl * .7, .05, .22))"; _SEP=_P('sep')
_BX="(560 + (this.bx - 560) * %s)"%_SEP; _BY="(330 + (this.by - 330) * %s)"%_SEP
FIX['PL-37']={'dials':['pa','det','sep','thr','screen'],
  'extra':{'pa':_x(44,28,64,1,'Pitch A','Ring spacing of screen A (you), centered on the red core.','u'),
           'det':_x(12.25,5,22,0.25,'Detune','How much finer screen B (Mir) is ruled than screen A. The beat between them, and the red, come from it.','%'),
           'sep':_x(1,0.4,1.25,0.01,'Separation','How far screen B’s center sits from screen A’s, as a multiple of the page’s own.','×'),
           'thr':_x(0.25,0.1,0.45,0.01,'Red threshold','How far the two screens must disagree before the red prints. Low spreads the red, high keeps it to the sharpest clashes.'),
           'screen':dict(_x(0,0,1,1,'Screen','How the press renders tone: one-pixel dots against white noise, as the page prints it, or continuous tone.'),options=[{'v':0,'label':'Stochastic'},{'v':1,'label':'Continuous'}])},
  'patches':[["cov(X, Y, o) { const cl = clashOf(REC.length / 2 - 1), pA = 44, pB = pA * (1 - clamp(cl * .7, .05, .22)), dA = Math.hypot(X - 560, Y - 330), dB = Math.hypot(X - this.bx, Y - this.by), gA = ring(dA, pA), gB = ring(dB, pB);",
               "cov(X, Y, o) { const cl = clashOf(REC.length / 2 - 1), pA = %s, pB = pA * (1 - %s), dA = Math.hypot(X - 560, Y - 330), dB = Math.hypot(X - %s, Y - %s), gA = ring(dA, pA), gB = ring(dB, pB);"%(_PA,_DET,_BX,_BY)],
              ["o[1] = Math.min(1, 1.5 * Math.exp(-dA * dA / (190 * 190))) * sm(.25, .6, Math.abs(gA - gB)); },","o[1] = Math.min(1, 1.5 * Math.exp(-dA * dA / (190 * 190))) * sm(%s, %s + .35, Math.abs(gA - gB)); },"%(_P('thr',.25),_P('thr',.25))],
              ["const cl = clashOf(REC.length / 2 - 1), pB = 44 * (1 - clamp(cl * .7, .05, .22)), bar =","const cl = clashOf(REC.length / 2 - 1), pB = %s * (1 - %s), bar ="%(_PA,_DET)],
              ["mark(560, 330, 'You / screen A / 44 u');","mark(560, 330, 'You / screen A / ' + %s + ' u');"%_PA],
              ["mark(this.bx, this.by, 'Mir / screen B / ' + pB.toFixed(1) + ' u');","mark(%s, %s, 'Mir / screen B / ' + pB.toFixed(1) + ' u');"%(_BX,_BY)],
              ["'Beat ' + Math.round(1 / (1 / pB - 1 / 44)) + ' u = clash ' + cl.toFixed(3)","'Beat ' + Math.round(1 / (1 / pB - 1 / %s)) + ' u = clash ' + cl.toFixed(3)"%_PA],
              ["world('field', plateOf({ pal: NIGHTP, vh: 620, bx: 1150, by: 120,","world('field', plateOf({ pal: (window.__P||{}).screen ? Object.assign({}, NIGHTP, { mode: 'line' }) : NIGHTP, vh: 620, bx: 1150, by: 120,"]]}

# ---- worlds (PL-41, 42, 43, 46, 47; one React page lifted as laid out): the gradient field's own three constants
# (contour snap, grain, warp fold) held where the cards stay gradients; the table's layout, reading path and route as
# switches, its arrangement as Re-deal; the atlas's contour interval, relief, route dash and halo rings; zoom, pan and
# line weight (camera and hairlines) cut; type stops before numerals clip or captions wrap
WD=FAM['worlds-dom']
WD['patches']=[[a,b.replace('(window.__P||{}).arr|0','(window.__P||{}).arr_seed|0')] for a,b in WD['patches']]
WD['extra'].update({
  'contour':_x(1,0.4,1.6,0.01,'Contour','How hard the gradient field snaps through its middle tone into a contour band, as a multiple of the page’s own.','×'),
  'grain':_x(1,0,2,0.01,'Grain','The per-pixel grain in the gradient field, as a multiple of the page’s own. 0 is a clean blend.','×'),
  'warp':_x(1,0.4,1.6,0.01,'Warp','How far the noise folds the field back on itself, as a multiple of the page’s own.','×'),
  'type':_x(1,0.85,1.15,0.01,'Type size','Size of every numeral, title and caption, as a multiple of the page’s own.','×'),
  'layout':dict(_x(1,1,2,1,'Layout','The table’s own layouts: cards scattered on the working table, or aligned in rows.'),options=[{'v':1,'label':'Working table'},{'v':2,'label':'Aligned'}]),
  'arr_seed':_x(0,0,24,1,'Arrangement','Deals another arrangement of the scatter (the table’s “Another arrangement”).'),
  'path':dict(_x(0,0,1,1,'Reading path','The table’s overlay that joins the cards in reading order.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'route':dict(_x(1,1,3,1,'Route','Which route the atlas traces through the records.'),options=[{'v':1,'label':'A way in'},{'v':2,'label':'The room'},{'v':3,'label':'All crossings'}]),
  'ci':_x(5.2,3.6,9,0.1,'Contour interval','Distance between the engraved contour lines of the field.','u'),
  'relief':_x(1,0,2,0.01,'Relief','How far the contours swell around each stop on the route, as a multiple of the page’s own.','×'),
  'dash':_x(6,2,14,0.5,'Route dash','Length of each dash of the traced route (the gaps keep the page’s 5 : 6).','u'),
  'halo':_x(13,0,13,1,'Halo rings','How many wavy rings ring each record on the map.')})
_CI=_P('ci',5.2)
WD['patches']=WD['patches']+[
  ["Array.from({length:145},(t,n)=>{let r=n*5.2-25,i=``;","Array.from({length:Math.ceil(780/%s)},(t,n)=>{let r=n*%s-25,i=``;"%(_CI,_CI)],
  ["-a*36;i+=","-a*36*%s;i+="%_P('relief')],
  ["strokeDasharray:`6 5`","strokeDasharray:%s+` `+%s*5/6"%(_P('dash',6),_P('dash',6))],
  ["Array.from({length:13},(e,t)=>{let n=30+t*6,r=``;","Array.from({length:Math.round(%s)},(e,t)=>{let n=30+t*6,r=``;"%_P('halo',13)]]
# US English in the page's own copy that the plates show
WD['patches']=WD['patches']+[['On the desk in colour.','On the desk in color.'],['`⌖ Centre on this record`','`⌖ Center on this record`']]
# Round 2: each world's own field. The Gardener's drawer cards (PL-41) and the Atelier's prints (PL-43) share one field
# (a six-stop ramp); the Archivist's chips (PL-42) and the Composer's columns (PL-47) have their own. Contour is the snap
# through the middle tone; Grain is the per-pixel grain each field adds (now wide enough to read at plate size); Warp
# is the noise fold. Each world adds its own decision instead of a generic type size.
WD['patches']=[q for q in WD['patches'] if q[0]!='(Ve(i*4+21,a*3)-.5)*.22']+[['a=(Be(n+1010,t)-.5)*5','a=(Be(n+1010,t)-.5)*5*%s'%_P('grain')]]
WD['extra'].update({
  'contour':_x(1,0.2,3,0.01,'Contour','How hard the field snaps through its middle tone into a contour edge, as a multiple of the page’s own. Low is a soft blend.','×'),
  'grain':_x(1,0,8,0.01,'Grain','The per-pixel grain the field is printed with, as a multiple of the page’s own (a few levels).','×'),
  'stops':_x(6,3,6,1,'Ramp stops','How many inks of the drawer’s ramp the field runs through: three greens and cream, then the pink and the blue.'),
  'chip':dict(_x(0,0,1,1,'Print','The two ways the index prints a chip: in color, as on the desk, or in graphite with a fine hatch, as filed away.'),options=[{'v':0,'label':'On the desk'},{'v':1,'label':'Filed'}]),
  'stock':_x(1,0.6,1,0.01,'Stock tone','How much of the stock’s own tone is laid over each print, as a share of the page’s own. Lower shows more of the printed field.'),
  'num':dict(_x(0,0,1,1,'Field','How the column field is set: a smooth gradient, or stepped into the nine bands the page numbers its paint-by-number view with.'),options=[{'v':0,'label':'Gradient'},{'v':1,'label':'Nine bands'}]),
  'rw':_x(1,0.5,2,0.01,'Route weight','Weight of the traced route and the paper casing under it, as a multiple of the page’s 2.4 u.','×'),
  'cw':_x(1,0.5,1.8,0.01,'Contour weight','Weight of the engraved contour lines of the field, every fifth line heavier, as a multiple of the page’s own.','×')})
_ST=_P('stops',6)
FIX['PL-41']={'dials':['contour','grain','warp','stops'],
  'patches':[['a=[[35,85,67],[86,145,109],[214,230,173],[248,245,229],[245,156,132],[94,116,179]];','a=[[35,85,67],[86,145,109],[214,230,173],[248,245,229],[245,156,132],[94,116,179]].slice(0,Math.max(3,Math.min(6,Math.round(%s))));'%_ST]]}
FIX['PL-42']={'dials':['chip','contour','grain','warp'],'extra':{'grain':_x(1,0,6,0.01,'Grain','The per-pixel grain the chip’s field is printed with, as a multiple of the page’s own (a few levels).','×')},
  'patches':[['function ve({record:e,active:t}){','function ve({record:e,active:t}){t=(window.__P||{}).chip==null?t:!window.__P.chip;'],
             ['t.includes(e.id)?`ON THE DESK`:`FILED / KEPT`','((window.__P||{}).chip==null?t.includes(e.id):!window.__P.chip)?`ON THE DESK`:`FILED / KEPT`']]}
FIX['PL-47']={'dials':['num','contour','grain','spread'],
  'extra':{'grain':_x(1,0,8,0.01,'Grain','The per-pixel grain the field is printed with, as a multiple of the page’s own (a few levels).','×'),
           'spread':_x(1,0.85,1.6,0.01,'Scene spread','How far each scene’s color spreads across the columns around its own (its radius grows with its minutes), as a multiple of the page’s own. Tighter than 0.85 the quiet scenes pool into dark wine.','×')},
  'patches':[['r:.08+e.minutes/a*.7,p:e.participation/9','r:(.08+e.minutes/a*.7)*%s,p:e.participation/9'%_P('spread')],['let r=h((n+.5)/u,(t+.5)/d),i=e[Math.round(r*255)]','let r=h((n+.5)/u,(t+.5)/d),i=e[Math.round(((window.__P||{}).num?(Math.min(9,1+Math.floor(r*9))-.5)/9:r)*255)]']],
  # the frame stops under the participation chart (the page's gray foot band is cut)
  'set':{'crop':[0.0083,0.0248,1,0.688],'fit':True}}
# the table's Aligned and Stacked layouts overlap the cards (text hidden) at the plate's frame width: the scatter stays
FIX['PL-43']={'dials':['path','stock','contour','warp','grain','arr_seed'],
  'patches':[['(0,f.jsx)(`path`,{className:`atelier-stock-tone`,d:n})','(0,f.jsx)(`path`,{className:`atelier-stock-tone`,d:n,style:{fillOpacity:%s}})'%_P('stock'),],
             ['.atelier-reading-path polyline{fill:none;stroke:#4147c795;stroke-width:1.4px;stroke-dasharray:5 5}','.atelier-reading-path polyline{fill:none;stroke:#4147c7;stroke-width:2.6px;stroke-dasharray:8 5}'],
             ['.atelier-reading-path{z-index:3;','.atelier-reading-path{z-index:60;']]}
# All crossings re-flows the page so the map rises and leaves a blank band in the crop; type re-flows the margins.
# The route's dash is set by a style rule (5 6), so the dial writes it inline; halo rings (too pale to read) are cut.
_RW=_P('rw'); _DS=_P('dash',6)
FIX['PL-46']={'dials':['route','ci','relief','cw','dash','rw'],'unpatch':["strokeDasharray:`6 5`"],
  'extra':{'route':dict(_x(1,1,2,1,'Route','Which route the atlas traces through the records.'),options=[{'v':1,'label':'A way in'},{'v':2,'label':'The room'}]),
           'dash':_x(5,4,14,0.5,'Route dash','Length of each dash of the traced route (the gaps keep the page’s 5 : 6).','u')},
  'patches':[['className:`carto-route-trace`,d:b,fill:`none`,stroke:`var(--carto-accent)`,strokeWidth:`2.4`,strokeDasharray:`6 5`','className:`carto-route-trace`,d:b,fill:`none`,stroke:`var(--carto-accent)`,strokeWidth:2.4*%s,style:{strokeDasharray:%s+` `+%s*6/5}'%(_RW,_DS,_DS)],
             ['(0,f.jsx)(`path`,{d:b,fill:`none`,stroke:`var(--carto-paper)`,strokeWidth:`10`,strokeLinejoin:`round`})','(0,f.jsx)(`path`,{d:b,fill:`none`,stroke:`var(--carto-paper)`,strokeWidth:10*%s,strokeLinejoin:`round`})'%_RW],
             ['strokeWidth:t%5==0?1.15:.48,opacity:t%5==0?.54:.27','strokeWidth:(t%%5==0?1.15:.48)*%s,opacity:t%%5==0?.54:.27'%_P('cw')]]}

# ---- A09 one-point illusion (PL-56): the engine's own parameters (FANO.PARAMS), set before the scene is built: grid
# pitch, stipple density and dot, contour weight, the room's tint and the light. Moment, type, ink and generic dials cut.
_A9=['grid_m','density','dot','contour','field','light_az']
FIX['PL-56']={'dials':['a9_'+k for k in _A9],
  'extra':{'a9_grid_m':_x(0.5,0.3,1,0.05,'Grid pitch','Spacing of the blue grid painted on the room.','m'),
           'a9_density':_x(1,0.4,1.6,0.01,'Stipple density','How many dots shade the shadow sides, as a multiple of the engine’s own.','×'),
           'a9_dot':_x(1,0.6,1.4,0.01,'Dot size','Size of every stipple dot, as a multiple of the engine’s own.','×'),
           'a9_contour':_x(1,0.6,2,0.01,'Contour weight','Weight of every silhouette and crease line, as a multiple of the engine’s own.','×'),
           'a9_field':_x(1,0,1,0.01,'Room tint','The room’s walls and floor, from white (0) to the app’s mint (1).'),
           'a9_light_az':_x(132,0,360,1,'Light azimuth','Where the light comes from around the room, which turns every shadow and stipple side.','°')},
  'patches':[['const PR = FANO.PARAMS, DEF = FANO.defaults(); let G = Object.assign({}, DEF), S = FANO.create(G);',
              "const PR = FANO.PARAMS, DEF = FANO.defaults(); let G = Object.assign({}, DEF, (function () { var P = window.__P || {}, o = {}; %s.forEach(function (k) { if (P['a9_' + k] != null) o[k] = P['a9_' + k]; }); return o; })()), S = FANO.create(G);"%json.dumps(_A9)]]}

# ---- deck ring network (PL-19): the record's own projection: line weight, node size, how far each strand departs from
# the ring (radial gain), the view's tilt and its layer. Moment (a frame of the page's breathing clock) is cut.
FIX['PL-19']={'dials':['lw','node','gain','layer'],
  'extra':{'lw':_x(1.3,0.6,2.4,0.01,'Line weight','Weight of the two filaments that join the strands.','px'),
           'node':_x(3.4,2,5,0.1,'Node size','Size of the dot at each strand.','px'),
           'gain':_x(1,0.4,1.8,0.01,'Radial gain','How far each strand steps off the ring for how far its letters stray from the mean, as a multiple of the record’s 4.2.','×'),
           'tilt':_x(0,0,60,1,'Tilt','The record seen from above (0°) or tipped toward the side.','°'),
           'layer':dict(_x(0,0,2,1,'Layer','How the record is drawn: filaments and rungs, the same with a ring at each turn, or the dots alone.'),options=[{'v':0,'label':'Path'},{'v':1,'label':'Contours'},{'v':2,'label':'Dots'}])},
  'patches':[["drawRecord(x, W, H, REC126, { tilt: 0, breath: b, layer: 'path', ground: o.ground || '#fff', paper: true, dot: 3.4, lw: 1.3, zoom: 1.04, seedRing: true });",
              "drawRecord(x, W, H, REC126, { tilt: %s, breath: b, layer: ['path','contours','dots'][(window.__P||{}).layer|0], ground: o.ground || '#fff', paper: true, dot: %s, lw: %s, gain: %s, zoom: 1.04, seedRing: true });"%(_P('tilt',0),_P('node',3.4),_P('lw',1.3),_P('gain'))]]}

# ---- exhibition (PL-13, PL-16): the record's own layers and glow; strands and dots stop before the ring empties or
# blows out; the right-hand view of PL-13 is held at the still's angle; Breath (invisible) and Zoom (framing) are cut
EX=FAM['exhibition']
_LAY="['path','contours','dots'][(window.__P||{}).layer|0]"
EX['extra'].update({
  'tilt':_x(22,0,70,1,'Tilt','Angle of the right-hand view, held still: 0 is seen from above, 70 most of the way to the side. The page sweeps it over time.','°'),
  'vtilt':_x(0,0,50,1,'View tilt','Tilt of the upper view off straight down (the side view below stays side-on). Past 50° the ring folds into a spring.','°'),
  'strands':_x(1,0.6,1.6,0.01,'Strands','How many strands the record holds, as a multiple of the page’s own.','×'),
  'dot':_x(1,0.5,1.4,0.01,'Dot size','Size of every strand mark, as a multiple of the page’s own.','×'),
  'glow':_x(1,0.4,1.4,0.01,'Glow','Radius of the glow around each strand in the view from above, as a multiple of the page’s seven dot widths.','×'),
  'layer':dict(_x(0,0,2,1,'Layer','How the tilted view is drawn: the two filaments and their rungs, the turn rings with the filaments, or the dots alone.'),options=[{'v':0,'label':'Path'},{'v':1,'label':'Contours'},{'v':2,'label':'Dots'}])})
EX['patches']=[q for q in EX['patches']]+[['for (const p of order) { const r = (o.dot ?? 2.2) * 7, g = x.createRadialGradient(','for (const p of order) { const r = (o.dot ?? 2.2) * 7 * %s, g = x.createRadialGradient('%_P('glow')]]
FIX['PL-13']={'dials':['tilt','layer','strands','dot','glow'],
  'patches':[["drawRecord(x, W * .68, H, nodes, { tilt, breath: 7, layer: 'path', dot: 1.8, recall: tilt > 70 });","drawRecord(x, W * .68, H, nodes, { tilt, breath: %s, layer: %s, dot: 1.8 * %s, recall: tilt > 70 });"%(_P('breath',7),_LAY,_P('dot'))]]}
FIX['PL-16']={'dials':['layer','strands','dot','glow'],
  'extra':{'layer':dict(_x(0,0,2,1,'Layer','How the side view is drawn: the two filaments and their rungs, the turn rings with the filaments, or the dots alone.'),options=[{'v':0,'label':'Path'},{'v':1,'label':'Contours'},{'v':2,'label':'Dots'}])},
  'patches':[["drawSide(x, 0, 500, W, 250, n2, { breath: 7, layer: 'path', dot: 1.7, recall: true });","drawSide(x, 0, 500, W, 250, n2, { breath: %s, layer: %s, dot: 1.7 * %s, recall: true });"%(_P('breath',7),_LAY,_P('dot'))]]}

# ---- A01 specimens (PL-03): the three-ink dot screen is the plate. Its pitch, the screens' angle, the dot (round or
# square), dot gain and the slip between inks are the controls. View tilt (the record folds into a column at any real
# tilt), mark size, spin and crossings shown (a crop of the record) are cut. The page draws at pixel ratio 2, as the stills were captured.
A01=FAM['a01-specs']
A01['extra'].update({
  'tilt':_x(0,0,45,1,'View tilt','Tilt of the record off straight down its axis. Past 45° the blooms fold into a column.','°'),
  'pitch':_x(1.6,1,2.4,0.01,'Dot pitch','Spacing of the three dot screens the blooms are printed in, as a multiple of the page’s 1.85 px. Larger is coarser.','×'),
  'sangle':_x(0,-30,30,1,'Screen angle','Turn of all three screens together, added to their own 15°, 45° and 75°.','°'),
  'shape':dict(_x(0,0,1,1,'Dot','The screen’s dot: round, or a square of the same area.'),options=[{'v':0,'label':'Round'},{'v':1,'label':'Square'}]),
  'gain':_x(1,0.7,1.3,0.01,'Dot gain','How far each dot spreads for the tone it carries, as a multiple of the page’s own. Above 1 the screens close into solid.','×'),
  'misreg':_x(1,0,5,0.01,'Misregistration','How far the sky and black screens slip off the cobalt one, as a multiple of the page’s own (4 and 1.5 units).','×')})
_A='((window.__P||{}).sangle||0)*Math.PI/180'
A01['patches']=A01['patches']+[
  ["g.save();g.translate(4.2,3);dotsRot(g,T,P,.262,{flat:rgba(SKY,.95),lo:.03,hi:.55,k:1.12});g.restore();dotsRot(g,T,P,1.309,{flat:rgba(COBALT,.93),lo:.28});",
   "var MR=%s,GN=%s;g.save();g.translate(4.2*MR,3*MR);dotsRot(g,T,P,.262+%s,{flat:rgba(SKY,.95),lo:.03,hi:.55,k:1.12*GN});g.restore();dotsRot(g,T,P,1.309+%s,{flat:rgba(COBALT,.93),lo:.28,k:GN});"%(_P('misreg'),_P('gain'),_A,_A)],
  ["g.save();g.translate(-1.3,1);dotsRot(g,T,P,.785,{flat:rgba(VOID,.9),lo:.6,k:.86});g.restore();","g.save();g.translate(-1.3*MR,1*MR);dotsRot(g,T,P,.785+%s,{flat:rgba(VOID,.9),lo:.6,k:.86*GN});g.restore();"%_A],
  ["path.moveTo(px+rad,py);path.arc(px,py,rad,0,TAU)}","if(%s)path.rect(px-rad*.886,py-rad*.886,rad*1.772,rad*1.772);else{path.moveTo(px+rad,py);path.arc(px,py,rad,0,TAU)}}"%_P('shape',0)]]
FIX['PL-03']={'dials':['pitch','sangle','shape','gain','misreg'],'set':{'dpr':2}}

# ---- A10 specimens (PL-11, PL-12): the record's own layers as switches, its glow and dot size, the side view's line
# spacing; the top view's tilt stops before it copies the side view. Strands shown (a crop of the record) is cut.
A10=FAM['a10-specs']
A10['extra'].update({
  'tilt':_x(0,0,60,1,'View tilt','Tilt of the top view off straight down (the side view below stays side-on). Past 60° it repeats the side view.','°'),
  'glow':_x(1,0.4,1.8,0.01,'Glow','Radius of the glow laid under the newest strands, as a multiple of the page’s own.','×'),
  'adot':_x(1,0.6,1.6,0.01,'Dot size','Size of the dots, one per counted character, as a multiple of the page’s own.','×'),
  'path':dict(_x(1,0,1,1,'Path','The two filaments and the rungs that join each exchange.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'cont':dict(_x(0,0,1,1,'Contours','The spiral path redrawn at three stepped radii around the record.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'spacing':_x(1,0.6,1.4,0.01,'Line spacing','Distance between strands in the side view, as a multiple of the page’s own.','×')})
A10['patches']=A10['patches']+[
  ['const E = Math.max(1, n / 2), dy = Math.min(.12, 1.7 / E), L = { dots: true, path: true, glow: true, contours: false };','const E = Math.max(1, n / 2), dy = Math.min(.12, 1.7 / E) * %s, L = { dots: true, path: !!%s, glow: true, contours: !!%s };'%(_P('spacing'),_P('path',1),_P('cont',0))],
  ['const col = pal.cls[dom < 0 ? 1 : dom], rad = sc * (lite ? .05 : .2);','const col = pal.cls[dom < 0 ? 1 : dom], rad = sc * (lite ? .05 : .2) * %s;'%_P('glow')],
  ['else { const dr = px * (o.dot || 1.35);','else { const dr = px * (o.dot || 1.35) * %s;'%_P('adot')],
  ['ctx.fillRect(p.sx - px * .8, p.sy - px * .8, px * 1.6, px * 1.6);','ctx.fillRect(p.sx - px * .8 * %s, p.sy - px * .8 * %s, px * 1.6 * %s, px * 1.6 * %s);'%((_P('adot'),)*4)]]
FIX['PL-11']={'dials':['tilt','glow','adot','path','cont']}
FIX['PL-12']={'dials':['adot','path','spacing'],'extra':{
  'spacing':_x(1,0.8,1.2,0.01,'Line spacing','Distance between strands in the side view, as a multiple of the page’s own. Past 1.2 the field rises into the top view; below 0.8 it leaves the panel half empty.','×')}}

# ---- the garden sheet (PL-130): its own plate switch (the sheet's V key), how far the four plates sit off register,
# the white hatch pitch on the beds, and the grain each plate is printed with; framed to the sheet, not the page
FIX['PL-130']={'dials':['plates','misreg','hatch','grain'],
  'extra':{'plates':dict(_x(0,0,5,1,'Plates','Which of the sheet’s four printing plates are shown, or its second ink set.'),options=[{'v':0,'label':'All'},{'v':1,'label':'Yellow'},{'v':2,'label':'Blue'},{'v':3,'label':'Pink'},{'v':4,'label':'Key'},{'v':5,'label':'Ember'}]),
           'misreg':_x(1,0,3,0.01,'Misregistration','How far the yellow, blue and pink plates sit off the key plate, as a multiple of the sheet’s own (3–4 units).','×'),
           'hatch':_x(1,0.6,2,0.01,'Hatch pitch','Spacing of the white dashed hatch cut into the beds and mounds, as a multiple of the sheet’s own.','×'),
           'grain':_x(1,0,2,0.01,'Grain','The grain each plate is printed with, as a multiple of the sheet’s own.','×')},
  'patches':[['let vi=0; const variant=()=>VARIANTS[vi];','let vi=%s|0; const variant=()=>VARIANTS[vi];'%_P('plates',0)],
             ['const OFFS=u=>[[-3*u,2*u],[1*u,-2*u],[4*u,3*u],[0,0]];','const OFFS=u=>{u*=%s;return [[-3*u,2*u],[1*u,-2*u],[4*u,3*u],[0,0]]};'%_P('misreg')],
             ['pitch=pitch||6;','pitch=(pitch||6)*%s;'%_P('hatch')],
             ['const amps=[0.10,0.12,0.11,0.05]','const amps=[0.10,0.12,0.11,0.05].map(v=>v*%s)'%_P('grain')]],
  # the canvas as the page lays it out in the plate's 1440 × 1000 frame (958 × 915), cropped to the sheet and its header and foot
  'set':{'w':958,'h':915,'crop':[0.025,0.04,0.637,0.715],'fit':True}}

# ---- the cave rig (PL-131 wall, PL-132 plan): the rig's own geometry drives both views. The turntable is held at an
# angle (it spins on the page's clock), the projector moves, the wipe splits what you see from what Plato stands on
CR_X={
  'tturn':_x(40,0,360,1,'Turntable','Angle of the lazy susan carrying the blocks, held still (the page spins it).','°'),
  'lampz':_x(11,7.5,12,0.1,'Throw','Distance from the projector to the wall: nearer throws bigger, softer-edged shadows.','u'),
  'lampx':_x(0,-3,3,0.1,'Projector offset','The projector’s place left or right of the wall’s center line.','u'),
  'lampy':_x(2.6,1.6,4,0.1,'Projector height','Height of the projector’s lens; higher drops every shadow down the wall.','u'),
  'wipe':_x(0.62,0.25,0.8,0.01,'Wipe','Where the wall view gives way to the mask Plato stands on, across the frame.'),
  'beam':dict(_x(0.07,0.02,0.18,0.01,'Beam','Opacity of the projector’s beam across the floor plan (the page’s 0.07).'),scale='linear')}
CR_P=[['S.scene.angle = (S.scene.angle + dt * 0.14) % (Math.PI * 2);','S.scene.angle = %s * Math.PI / 180;'%_P('tturn',40)],
  ['light: { x: 0, y: 2.6, z: 11 }','light: { x: %s, y: %s, z: %s }'%(_P('lampx',0),_P('lampy',2.6),_P('lampz',11))],
  ["mode: 'sim', scene: CAVE.defaultScene(), spin: true, wipe: 0.62,","mode: 'sim', scene: CAVE.defaultScene(), spin: true, wipe: %s,"%_P('wipe',.62)],
  ["c.fillStyle = 'rgba(242,212,138,.07)';","c.fillStyle = 'rgba(242,212,138,' + %s + ')';"%_P('beam',.07)]]
FIX['PL-131']={'dials':['tturn','lampz','lampx','lampy','wipe'],'extra':CR_X,'patches':CR_P}
FIX['PL-132']={'dials':['tturn','lampz','lampx','beam'],'extra':CR_X,'patches':CR_P}

# ---- Shannon 1948 (PL-144 … PL-147): each figure's own inputs (the page's sliders) become the dials, its unit of
# information is a switch (Shannon §1: the base of the logarithm is the choice of a unit), labels moved off the curves
_U="[1,Math.LN2,Math.LN2/Math.LN10][(window.__P||{}).unit|0]"; _UN="['bits','nats','dits'][(window.__P||{}).unit|0]"
SH_X={
  'unit':dict(_x(0,0,2,1,'Unit','The base of the logarithm, which is the choice of a unit (Shannon §1): base 2 gives bits, base e natural units, base 10 decimal digits.'),options=[{'v':0,'label':'Bits'},{'v':1,'label':'Nats'},{'v':2,'label':'Dits'}]),
  'hp':dict(_x(0.5,0.02,0.98,0.01,'Probability of heads','The coin’s p: the marker and its readout move along the curve.'),scale='linear'),
  'guides':dict(_x(1,0,1,1,'Guides','The dashed lines that carry the marker’s value to both axes.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'fp':_x(0.05,0,0.5,0.01,'Flip probability','How often the channel flips a bit: the marker moves along the capacity curve.'),
  'eqv':dict(_x(1,0,1,1,'Equivocation','The red curve of what is lost, H(p), drawn over the capacity it takes away.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'bw':_x(3,1,8,0.1,'Bandwidth','W, the highest frequency the signal may carry; it is sampled 2W times a second.','kHz'),
  'snr':dict(_x(30,5,40,1,'Signal to noise','Signal power over noise power, already a logarithm. Lower, and the red noise swamps the wave.','dB'),scale='linear'),
  'win':_x(2,1,4,0.1,'Window','How long a stretch of the signal the figure shows.','ms'),
  'marks':dict(_x(1,0,1,1,'Samples','The 2W samples a second marked on the wave.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'noise':_x(2,0,20,1,'Noise','The chance the channel flips each bit on the wire; flipped bits and the wrong letters they make turn red.','%'),
  'seed':_x(0,0,40,1,'Seed','Re-deals which bits the noise flips.')}
SH_P=[["const Hb=p=>(p<=0||p>=1)?0:-(p*log2(p)+(1-p)*log2(1-p));","const Hb=p=>((p<=0||p>=1)?0:-(p*log2(p)+(1-p)*log2(1-p)))*%s;"%_U],
  ["const L=44,R=18,Tp=18,B=40;","const L=54,R=18,Tp=34,B=40;"],
  ["const c=$('c2'); let p=0.5;","const c=$('c2'); let p=%s;"%_P('hp',.5)],
  ["x.fillText(`H(${p.toFixed(2)}) = ${Hb(p).toFixed(3)} bits`,px+(p>0.6?-10:10),py-8);","x.fillText(`H(${p.toFixed(2)}) = ${Hb(p).toFixed(3)} ${%s}`,px+(p>0.6?-10:10),py-8);"%_UN],
  ["x.fillText('H  bits',0,0);","x.fillText('H  '+%s,0,0);"%_UN],
  ["x.strokeStyle=th.ink; x.lineWidth=1; x.setLineDash([3,4]); x.beginPath(); x.moveTo(px+0.5,py); x.lineTo(px+0.5,Tp+ph); x.moveTo(L,py+0.5); x.lineTo(px,py+0.5); x.stroke(); x.setLineDash([]);",
   "if(%s){x.strokeStyle=th.ink; x.lineWidth=1; x.setLineDash([3,4]); x.beginPath(); x.moveTo(px+0.5,py); x.lineTo(px+0.5,Tp+ph); x.moveTo(L,py+0.5); x.lineTo(px,py+0.5); x.stroke(); x.setLineDash([]);}"%_P('guides',1)],
  ["const c=$('c6'); let p=0.05;","const c=$('c6'); let p=%s;"%_P('fp',.05)],
  ["const cap=q=>1-Hb(q);","const cap=q=>Hb(.5)-Hb(q);"],
  ["x.strokeStyle=th.noi; x.lineWidth=1.5; x.beginPath(); for(let i=0;i<=200;i++){ const q=i/400, yy=Tp+ph*(1-Hb(q));","x.strokeStyle=th.noi; x.lineWidth=1.5; x.beginPath(); for(let i=0;i<=(%s?200:-1);i++){ const q=i/400, yy=Tp+ph*(1-Hb(q));"%_P('eqv',1)],
  ["x.fillText('capacity  C = 1 − H(p)',L+8,Tp+ph*0.42);","x.fillText('capacity  C = '+['1','ln 2','log 2'][(window.__P||{}).unit|0]+' − H(p)',L+pw*0.3,Tp+ph*[0.5,0.12,0.5][(window.__P||{}).unit|0]);"],
  ["x.fillText('equivocation  H(p)',L+pw*0.55,Tp+ph*0.62);","if(%s)x.fillText('equivocation  H(p)',L+pw*0.6,Tp+ph*[0.34,0.24,0.34][(window.__P||{}).unit|0]);"%_P('eqv',1)],
  ["const c=$('c8'); let W=3, snr=30;","const c=$('c8'); let W=%s, snr=%s;"%(_P('bw',3),_P('snr',30))],
  ["const span=6/W;","const span=%s;"%_P('win',2)],
  ["const ns=Math.round(2*W*span); for(let i=0;i<=ns;i++){","const ns=Math.round(2*W*span); for(let i=0;i<=(%s?ns:-1);i++){"%_P('marks',1)],
  ["let msg='THE PAPER IS ABOUT CHOICE', noise=0.02,","let msg='THE PAPER IS ABOUT CHOICE', noise=%s/100,"%_P('noise',2)],
  ["let seed=1948;","let seed=1948+((window.__P||{}).seed|0);"]]
for c,d in (('PL-144',['noise','seed']),('PL-145',['hp','unit','guides']),('PL-146',['fp','unit','eqv']),('PL-147',['bw','snr','win','marks'])):
    FIX[c]={'dials':d,'extra':SH_X,'patches':SH_P}
FIX['PL-144']['set']={'crop':[0,0.1163,1,0.88],'fit':True}

# ---- worlds-v2 (PL-49 … PL-54): the page draws at pixel ratio 2, as the stills were captured (crisp bars and rings, no
# moiré from upscaling); angles in degrees; every range stops where the ring, the rows or the helix keep their shape
WV=FAM['worlds-v2']
for _k in ('turn','tilt','rotate','oturn'):
    _a=_P(_k,0); WV['patches']=[[a,b.replace(_a,'('+_a+'*Math.PI/180)')] for a,b in WV['patches']]
WV['patches']=WV['patches']+[['x.globalAlpha=.18+(p.z+1)*.38;','x.globalAlpha=.94-.76*%s*(1-p.z)/2;'%_P('depth')]]
WV['extra'].update({
  'turn':_x(0,-85,85,1,'Turn','How far the loop is turned about its axis, added to the page’s own angle.','°'),
  'tilt':_x(0,-45,45,1,'Tilt','How far the loop leans toward you, added to the page’s 49°.','°'),
  'tube':_x(1,0.3,1.6,0.01,'Tube','Thickness of the ring’s tube, as a multiple of the page’s 0.32.','×'),
  'twist':_x(1,0,3,0.01,'Twist','Height of the three-lobed twist along the ring, as a multiple of the page’s own.','×'),
  'density':_x(1,0.55,1,0.01,'Mark density','How many of the ring’s 13,500 sample points are kept as marks. 1 is the page’s own thinning; lower thins the shadow side first.','×'),
  'mark':_x(1,0.75,1.6,0.01,'Mark size','Size of every mark the loop is printed in, as a multiple of the page’s own.','×'),
  'rings':_x(45,20,90,1,'Rings','How many afterimage ellipses are drawn.'),
  'spacing':_x(1,0.8,2.5,0.01,'Ring spacing','Gap between rings, as a multiple of the page’s 5 px.','×'),
  'squash':_x(1,0.55,1.6,0.01,'Squash','Height of each ring against its width, as a multiple of the page’s 0.64.','×'),
  'rotate':_x(0,-90,90,1,'Rotation','Turn of the rings, added to the page’s −23°.','°'),
  'weight':_x(1,0.5,2.5,0.01,'Line weight','Weight of every ring line, as a multiple of the page’s 0.6 px.','×'),
  'amp':_x(1,0.4,1.2,0.01,'Amplitude','Height of each wave in its row, as a multiple of the page’s own. Above 1.2 the rows touch.','×'),
  'env':_x(0.7,0.4,3,0.01,'Envelope','How the wave swells from its ends: the power on the page’s sine envelope. Low is full width, high pinches to the middle.'),
  'pitch':_x(2,2,8,1,'Bar pitch','Spacing of the vertical bars that build each wave.','px'),
  'oturn':_x(0,-180,180,1,'Turn','Turn of the helix, added to the angle you set by dragging across it.','°'),
  'radius':_x(1,0.5,1.3,0.01,'Radius','Width of the helix, as a multiple of the page’s 0.28 of the frame.','×'),
  'gstep':_x(1,0.6,1.7,0.01,'Coil','How far each letter turns along its strand, as a multiple of the page’s 2.6°.','×'),
  'depth':_x(1,0.3,1.2,0.01,'Depth fade','How far the letters on the back of the helix fade, as a multiple of the page’s own. Low reads flat.','×'),
  'type':_x(1,0.85,1.15,0.01,'Type size','Size of the strand letters and the header, as a multiple of the page’s own.','×')})
for c in ('PL-49','PL-50','PL-51','PL-53','PL-54'): FIX.setdefault(c,{})['set']={'dpr':2}
FIX['PL-49'].update({'dials':['turn','tilt','tube','twist','density','coral','mark'],'extra':{'turn':_x(0,-45,45,1,'Turn','How far the loop is turned about its axis, added to the page’s own angle; past 45° it swings out of the frame.','°')}})
FIX['PL-50'].update({'dials':['turn','tilt','tube','twist','density','coral','mark'],'extra':{'tube':_x(1,0.3,1.4,0.01,'Tube','Thickness of the ring’s tube, as a multiple of the page’s 0.32. Past 1.4 it runs under the card’s labels.','×')}})
FIX['PL-51'].update({'dials':['rings','spacing','squash','rotate','weight'],'extra':{'rings':_x(45,20,60,1,'Rings','How many afterimage ellipses are drawn; past 60 the outer ones fall off the card.')}})
# Round 2: the selected card keeps its white outline (the page's 2 px outline, 5 px in from the edge); Turn stops at ±60°,
# past which the coil runs under the title
FIX['PL-50']['set'].update({'outline':{'i':3,'w':2,'c':'#ffffff'}})
FIX['PL-50']['extra']['turn']=_x(0,-30,60,1,'Turn','How far the loop is turned about its axis, added to the page’s own angle. Turned back past 30° or on past 60°, the bright front runs under the type.','°')
FIX['PL-53'].update({'dials':['freq','amp','env','pitch']})
FIX['PL-54'].update({'dials':['oturn','radius','gstep','depth','type']})

# ---- counted marks (PL-151 … PL-154): the deck draws at pixel ratio 2, as the stills were captured, so its marks keep their
# printed size; dot, pitch and density stop where the print stays a screen of separate dots; the band's own twist and swing
CM=FAM['counted-marks']
CM['extra'].update({
  'dot':_x(1,0.7,1.4,0.01,'Dot size','Size of every printed dot, as a multiple of the deck’s own. Above 1.4 the dots fuse into solid.','×'),
  'cell':_x(1,0.75,2,0.01,'Screen pitch','Spacing of the cells each dot is printed in, as a multiple of the deck’s own. Larger is coarser.','×'),
  'den':_x(1,0.5,1.6,0.01,'Density','How many dots each cell prints for the count it carries, as a multiple of the deck’s own.','×'),
  'count':_x(1,0.5,1.6,0.01,'Strands','How many strands (ring) or arcs are counted, as a multiple of the deck’s own.','×'),
  'turns':_x(1,0.7,1.5,0.01,'Twist','How many half-turns the band makes along its length, as a multiple of the deck’s own. Each pinch is where the face flips.','×'),
  'swing':_x(1,0,1.3,0.01,'Swing','How far the band rises and falls across the frame, as a multiple of the deck’s own.','×'),
  'shape':dict(_x(0,0,1,1,'Dot shape','The screen’s dot: square device pixels, as the deck prints at this size, or round dots.'),options=[{'v':0,'label':'Square'},{'v':1,'label':'Round'}]),
  'type':_x(1,0.85,1.2,0.01,'Type size','Size of the percentages and the axis labels, as a multiple of the deck’s own.','×'),
  'seed':_x(0,0,40,1,'Seed','Re-deals where every dot falls. 0 is the deck’s own print.')})
CM['patches']=CM['patches']+[
  ['const turns=o.turns||1.6, amp=o.amp==null?.28:o.amp, pad=o.pad==null?.07:o.pad;','const turns=(o.turns||1.6)*%s, amp=(o.amp==null?.28:o.amp)*%s, pad=o.pad==null?.07:o.pad;'%(_P('turns'),_P('swing'))],
  ['round=r>=2.5, rr=r/2;','round=%s?true:r>=2.5&&%s==null, rr=r/2;'%(_P('shape',0),"(window.__P||{}).shape")]]
for c in ('PL-151','PL-152','PL-153','PL-154'): FIX.setdefault(c,{})['set']={'dpr':2}
FIX['PL-151'].update({'dials':['dot','cell','den','turns','swing','seed']})
FIX['PL-152'].update({'dials':['dot','cell','den','count','seed'],'extra':{
  'cell':_x(1,0.75,1.4,0.01,'Screen pitch','Spacing of the dots along each ray, as a multiple of the deck’s own. Past 1.4 the dots line up into rings.','×'),
  'den':_x(1,0.7,1.6,0.01,'Density','How many of each ray’s dots print, as a multiple of the deck’s own.','×')}})
FIX['PL-153'].update({'dials':['dot','cell','den','count','seed'],'extra':{
  'cell':_x(1,0.75,1.5,0.01,'Screen pitch','Spacing of the dots along each arc, as a multiple of the deck’s own.','×'),
  'den':_x(1,0.7,1.25,0.01,'Density','How many of each arc’s dots print, as a multiple of the deck’s own. Past 1.25 the arcs close into solid lines.','×')}})
FIX['PL-154'].update({'dials':['dot','cell','den','type','seed'],'extra':{
  'dot':_x(1,0.85,1.4,0.01,'Dot size','Size of every printed dot, as a multiple of the deck’s own. Below 0.85 the bars fade, above 1.4 they fill solid.','×'),
  'cell':_x(1,0.75,1.5,0.01,'Screen pitch','Spacing of the cells each dot is printed in, as a multiple of the deck’s own. Larger is coarser.','×')}})

# Round 2: the deck draws at pixel ratio 4 (its layout unchanged), so a dot is a square of whole device pixels and one
# pixel is a quarter step of the deck's own dot: Dot size is that count of pixels (even steps, always square and crisp;
# the deck switched to soft round dots above 2.5 px). The group is named for what each figure counts.
_DPX="(window.__P||{}).dpx"
CM['patches']=[
  ['const want=(o.dot||1.6)*u, cell=(o.cell||3.6)*u, r=Math.max(1,want), seed=o.seed||1, M=o.multi||3,','const want=(o.dot||1.6)*u, cell=(o.cell||3.6)*u*%s, r=%s!=null?+%s:Math.max(1,want), seed=(o.seed||1)+%s, M=o.multi||3,'%(_P('cell'),_DPX,_DPX,_P('seed',0))],
  ['    d*=ks;\n','    d*=ks*%s;\n'%_P('den')],
  ['round=r>=2.5, rr=r/2;','round=!!%s, rr=r/2;'%_P('shape',0)],
  ['ring(ctx,W,H,u,o){const n=o.n||126,cx=W/2,cy=H/2,R0=Math.min(W,H)*.2,R1=Math.min(W,H)*.44,seed=o.seed||1;const step=3.2*u;const r=Math.max(1,1.7*u);','ring(ctx,W,H,u,o){const n=Math.max(3,Math.round((o.n||126)*%s)),cx=W/2,cy=H/2,R0=Math.min(W,H)*.2,R1=Math.min(W,H)*.44,seed=(o.seed||1)+%s;const step=3.2*u*%s;const r=%s!=null?+%s:Math.max(1,1.7*u);'%(_P('count'),_P('seed',0),_P('cell'),_DPX,_DPX)],
  ['if(h2(k,s,seed+9)<.12)continue;','if(h2(k,s,seed+9)<1-.88*%s)continue;'%_P('den')],
  ['arcs(ctx,W,H,u,o){const seed=o.seed||1,post=o.post;','arcs(ctx,W,H,u,o){const seed=(o.seed||1)+%s,post=o.post;'%_P('seed',0)],
  ['r=Math.max(1,1.5*u);\n   for(let k=0;k<(post?40:28);k++){','r=%s!=null?+%s:Math.max(1,1.5*u);\n   for(let k=0;k<Math.round((post?40:28)*%s);k++){'%(_DPX,_DPX,_P('count'))],
  ['const N=Math.ceil(rx*1.6*Math.PI/2.4);','const N=Math.ceil(rx*1.6*Math.PI/(2.4*%s));'%_P('cell')],
  ['if(h2(k,s,seed+5)<.35&&k)continue;','if(h2(k,s,seed+5)<1-.65*%s&&k)continue;'%_P('den')],
  ['const turns=o.turns||1.6, amp=o.amp==null?.28:o.amp, pad=o.pad==null?.07:o.pad;','const turns=(o.turns||1.6)*%s, amp=(o.amp==null?.28:o.amp)*%s, pad=o.pad==null?.07:o.pad;'%(_P('turns'),_P('swing'))],
  ['gap=pw*.035,bw=(pw-gap*5)/6;','gap=pw*.035*%s,bw=(pw-gap*5)/6;'%_P('gap')]]
def _dpx(v,lo,hi,what): return _x(v,lo,hi,1,'Dot size','Each dot is a square of whole device pixels; %s The deck prints at %d.'%(what,v),'px')
CM['extra'].update({'gap':_x(1,0.4,2.6,0.01,'Bar gap','Space between the six bars, as a multiple of the deck’s own (3.5% of the chart’s width); the bars narrow as it opens.','×')})
for c in ('PL-151','PL-152','PL-153','PL-154'): FIX[c]['set']={'dpr':4}
FIX['PL-151']['dials']=['dpx','cell','den','turns','swing','seed']; FIX['PL-151']['extra']={'dpx':_dpx(4,3,6,'smaller thins the band into a fine stipple, larger closes it toward solid.')}
FIX['PL-152']['dials']=['dpx','cell','den','count','seed']; FIX['PL-152']['extra'].update({'dpx':_dpx(6,4,7,'every stroke of the ring is a line of these squares.'),
  'count':_x(1,0.5,1.6,0.01,'Rays','How many rays the ring counts, as a multiple of the deck’s 126; each ray is one exchange, its length its count.','×')})
FIX['PL-152']['set'].update({'tname':'Counted rays'})
FIX['PL-153']['dials']=['dpx','cell','den','count','seed']; FIX['PL-153']['extra'].update({'dpx':_dpx(4,3,6,'each arc is a dotted line of these squares.'),
  'count':_x(1,0.5,1.6,0.01,'Arcs','How many arcs rise over the baseline, as a multiple of the deck’s 28; each arc spans one exchange.','×')})
FIX['PL-153']['set'].update({'tname':'Counted arcs'})
FIX['PL-154']['dials']=['dpx','cell','den','gap','seed']; FIX['PL-154']['extra'].update({'dpx':_dpx(4,3,6,'smaller lightens each bar, larger fills it toward solid.')})
FIX['PL-154']['set'].update({'tname':'Counted bars'})

# ---- keyline (PL-97 … PL-108): misregistration is the offset between passes (the ink pass off the fills, or each riso run
# off true); the old dial on each riso filter's edge displacement is Edge shiver. Weights, grain and bleed stop before they
# fuse lines or mottle the sheet; paper tooth (invisible at stage size) and generic type are cut; seed is Re-deal.
KL=FAM['keyline']
KL['patches']=[[a,b.replace('shift*=((window.__P||{}).misreg==null?1:window.__P.misreg)','shift*=%s'%_P('shiver'))] for a,b in KL['patches']]+[
  ['transform:`translate(${o.shift?o.shift[0]:1.1} ${o.shift?o.shift[1]:0.7})`},P.root);','transform:`translate(${(o.shift?o.shift[0]:1.1)*%s} ${(o.shift?o.shift[1]:0.7)*%s})`},P.root);'%(_P('misreg'),_P('misreg'))],
  ['P.localAll=!!o.localAll;P.shift=o.shift||[1.1,.7];','P.localAll=!!o.localAll;P.shift=(o.shift||[1.1,.7]).map(v=>v*%s);'%_P('misreg')],
  ['const w=(o.weight||.3)*10;','const w=(o.weight||.3)*10*%s;'%_P('stroke')],
  ['const size=o.size||40,sc=size/14,gap=(o.gap??.18)*10,adv=10+gap;','const size=o.size||40,sc=size/14,gap=(o.gap??.18)*10*%s,adv=10+gap;'%_P('track')],
  ['fill:"none","stroke-linecap":"round","stroke-linejoin":"round"},parent);','fill:"none","stroke-linecap":%s?"square":"round","stroke-linejoin":%s?"bevel":"round"},parent);'%(_P('cap',0),_P('cap',0))],
  ['if(o.ink){el("path",{d,stroke:o.ink,"stroke-width":w+(o.inkW||1.4)*2/sc,','if(o.ink&&%s>0){el("path",{d,stroke:o.ink,"stroke-width":w+(o.inkW||1.4)*%s*2/sc,'%(_P('outline'),_P('outline'))],
  ['risoPlate("screenA",71,1.7,.8);','risoPlate("screenA",71,1.7*%s,.8);'%_P('starve')],
  ['el("feColorMatrix",{in:"n",type:"matrix",values:"0 0 0 0 1 0 0 0 0 .92 0 0 0 0 .55 0 0 0 .55 -.05",result:"spark"},f);','el("feColorMatrix",{in:"n",type:"matrix",values:"0 0 0 0 1 0 0 0 0 .92 0 0 0 0 .55 0 0 0 "+(.55*%s)+" -.05",result:"spark"},f);'%_P('sheen')],
  ['for(let i=0;i<W*H/1600;i++){','for(let i=0;i<W*H/1600*%s;i++){'%_P('fibers')]]
KL['extra'].update({
  'misreg':_x(1,0,3,0.01,'Misregistration','How far the black keyline pass sits off the color fills, as a multiple of the page’s own (about one unit). 0 prints in register.','×'),
  'shiver':_x(1,0,2,0.01,'Edge shiver','How far each riso drum’s edge wanders (the displacement in its coverage filter), as a multiple of the page’s own.','×'),
  'bleed':_x(1,0,2,0.01,'Ink bleed','How far each ink wanders off its edge (the displacement in its ink filter), as a multiple of its own. 0 prints a clean edge.','×'),
  'grain':_x(1,0,1.5,0.01,'Grain','The dark grain veil laid over the sheet, as a multiple of the page’s own. 0 leaves the print clean.','×'),
  'dust':_x(1,0,2,0.01,'Dust','The white speckle where the ink skipped, as a multiple of the page’s own. 0 clears it.','×'),
  'pitch':_x(1,0.7,2,0.01,'Screen ruling','Spacing of every dot and line screen, with its dots and lines grown to keep the same coverage. Above 1 is a coarser screen.','×'),
  'weight':_x(1,0.5,1.5,0.01,'Line weight','Weight of the keyline, as a multiple of the page’s own.','×'),
  'stroke':_x(1,0.6,1.2,0.01,'Stroke weight','Weight of every stroke the alphabet is built from, as a multiple of the page’s (0.3 of the glyph’s 10-unit grid).','×'),
  'track':_x(1,0.6,1.25,0.01,'Tracking','Space between glyphs, as a multiple of the page’s own. Justified rows keep their length, so their letters narrow as the gaps open.','×'),
  'cap':dict(_x(0,0,1,1,'Stroke ends','How each stroke of the alphabet ends: round caps and joins, or square caps with beveled joins.'),options=[{'v':0,'label':'Round'},{'v':1,'label':'Square'}]),
  'outline':_x(1,0,2.5,0.01,'Outline','Width of the dark outline under the display word, as a multiple of the page’s 1.6. 0 removes it.','×'),
  'csize':_x(50,40,52,1,'Column type','Size of the condensed caps in the justified column.','u'),
  'cgap':_x(4,0,14,1,'Line gap','Space between neighboring justified lines, added to the type size so lines never touch.','u'),
  'clen':_x(232,180,236,1,'Justified length','The length every line is forced to (textLength), so each line stretches or squeezes its glyphs to fill it.','u'),
  'starve':_x(1,0.6,1.6,0.01,'Screen starve','How hard the screen filter eats the letters at their thin joins, as a multiple of the page’s 1.7.','×'),
  'offset':_x(1,0,4,0.01,'Plate offset','How far each riso run sits off true, as a multiple of the page’s own (up to 2 units). 0 prints all four in register.','×'),
  'cover':_x(1,0.55,1,0.01,'Ink coverage','How much of each run’s ink reaches the sheet. Below 1 the inks thin and their overprints lighten.'),
  'sheen':_x(1,0,2,0.01,'Gold sparkle','How much turbulence-lit sparkle is punched through the gold leaf, as a multiple of the page’s own. 0 leaves a plain gradient.','×'),
  'seals':dict(_x(1,0,1,1,'Seals','The four red chops pinning the corners and the top.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}]),
  'fibers':_x(1,0,2.5,0.01,'Paper fibers','How many long fibers are laid in the xuan paper, as a multiple of the page’s own.','×'),
  'under':_x(0.85,0,1,0.01,'Ochre underline','Opacity of the ochre line under the gold that gives the keyline its edge on white (the page’s 0.85).')})
FIX.update({
  'PL-97':{'dials':['offset','cover','shiver','grain','seed'],
    'patches':[['const g=el("g",{filter:`url(#${f})`,transform:`translate(${dx} ${dy})`,style:"mix-blend-mode:multiply"},svg);','const g=el("g",{filter:`url(#${f})`,transform:`translate(${dx*%s} ${dy*%s})`,style:"mix-blend-mode:multiply;opacity:"+%s},svg);'%(_P('offset'),_P('offset'),_P('cover'))],
               ['const p=plate(wrap,W,Hh,"#f8f5ee");const svg=svgLayer(p,W,Hh,`0 0 ${B} ${BH}`);\n    const runs=','const p=plate(wrap,W,Hh,"#fbfbf7");const svg=svgLayer(p,W,Hh,`0 0 ${B} ${BH}`);\n    const runs=']],
    'set':{'ground':'#fbfbf7'},'inkswap':{'#f8f5ee':'#fbfbf7'}},
  'PL-98':{'dials':['weight','misreg','pitch','shiver','grain','seed'],'extra':{'weight':_x(1,0.5,1.8,0.01,'Line weight','Weight of the black keyline over the screens, as a multiple of the page’s own.','×')}},
  'PL-100':{'dials':['weight','misreg','bleed','grain','dust','seed'],'extra':{'weight':_x(1,0.5,1.6,0.01,'Line weight','Weight of the black keyline, as a multiple of the page’s own.','×')}},
  'PL-101':{'dials':['stroke','track','cap','outline','grain','seed']},
  'PL-102':{'dials':['csize','cgap','clen','starve','grain','seed'],
    'patches':[['const t=el("text",{transform:`translate(${296-i*54} 14) rotate(90)`,"font-family":"Anton","font-size":50,fill:"#ffd84a",textLength:232,lengthAdjust:"spacingAndGlyphs"},g);',
                'const t=el("text",{transform:`translate(${296-i*(%s+%s)} 14) rotate(90)`,"font-family":"Anton","font-size":%s,fill:"#ffd84a",textLength:%s,lengthAdjust:"spacingAndGlyphs"},g);'%(_P('csize',50),_P('cgap',4),_P('csize',50),_P('clen',232))]]},
  'PL-105':{'dials':['weight','misreg','bleed','grain','seed'],'extra':{'weight':_x(1,0.75,1.5,0.01,'Line weight','Weight of the keyline and of the stroked title, as a multiple of the page’s own.','×')},'inkswap':{'#f6f4ef':'#fbfbf7'},
    'patches':[['const p=plate(wrap,W,Hh,"#f6f4ef");const rp=ricePaper(W,Hh,14);','const p=plate(wrap,W,Hh,"#fbfbf7");const rp=ricePaper(W,Hh,14,[251,251,247]);']]},
  'PL-107':{'dials':['weight','sheen','under','seals','seed'],
    'extra':{'weight':_x(1,0.5,1.8,0.01,'Line weight','Width of the gold keyline and its ochre underline, as a multiple of the page’s own.','×')},
    'patches':[['seal(svg,44,44,34,"福",-3);seal(svg,300,40,26,"積",0);seal(svg,556,44,34,"喜",3);seal(svg,44,752,28,"吉",2);','if(%s)(seal(svg,44,44,34,"福",-3),seal(svg,300,40,26,"積",0),seal(svg,556,44,34,"喜",3),seal(svg,44,752,28,"吉",2));'%_P('seals')],
               ['"stroke-linejoin":"round","stroke-linecap":"round",fill:"none",opacity:.85},svg);','"stroke-linejoin":"round","stroke-linecap":"round",fill:"none",opacity:%s},svg);'%_P('under',.85)],
               ['const p=plate(stage,W,H,"#f6f4ef");const rp=ricePaper(W,H,71);','const p=plate(stage,W,H,"#fbfbf7");const rp=ricePaper(W,H,71,[251,251,247]);']],
    'set':{'ground':'#fbfbf7'},'inkswap':{'#f6f4ef':'#fbfbf7'}},
  'PL-108':{'dials':['weight','misreg','bleed','pitch','grain','dust','seed'],'extra':{'weight':_x(1,0.75,1.5,0.01,'Line weight','Weight of the keyline and of the stroked title, as a multiple of the page’s own.','×')},}})

# Round 2 (keyline): the ink filter's displacement is softened as it grows (its nearest-pixel steps read as aliasing),
# and Ink bleed stops at 1.4; grain and dust veils widened where they could not be seen at plate size; stroked titles
# are left out of Line weight by the engine, so the keyline can thin again; PL-105 trades bleed for its screen ruling
KL['patches']=KL['patches']+[['transform:`translate(${i*adv} 0)`},g)','transform:`translate(${i*adv} 0)`,"data-lc-noweight":1},g)'],['el("feDisplacementMap",{in:"SourceGraphic",in2:"j",scale:fine,xChannelSelector:"R",yChannelSelector:"G",result:"ink"},f);',
  'el("feDisplacementMap",{in:"SourceGraphic",in2:"j",scale:fine,xChannelSelector:"R",yChannelSelector:"G",result:"ink"},f);if(%s>1)el("feGaussianBlur",{in:"ink",stdDeviation:.35*(%s-1)+.25,result:"ink"},f);'%(_P('bleed'),_P('bleed'))]]
FIX['PL-100']['extra']=dict(FIX['PL-100'].get('extra',{}),bleed=_x(1,0,1.4,0.01,'Ink bleed','How far each ink wanders off its edge (the displacement in its ink filter), as a multiple of its own; the wander is softened as it grows. 0 prints a clean edge.','×'))
FIX['PL-105']={'dials':['weight','misreg','pitch','grain','seed'],'inkswap':FIX['PL-105']['inkswap'],'patches':FIX['PL-105']['patches'],
  'extra':{'weight':_x(1,0.6,1.5,0.01,'Line weight','Weight of the keyline round every shape, as a multiple of the page’s own (the stroked titles keep theirs).','×'),
           'pitch':_x(1,0.7,2,0.01,'Screen ruling','Spacing of the dot and line screens in all three frames (the pink cone’s dots, the tints), with each dot grown to keep its coverage. Above 1 is coarser.','×'),
           'grain':_x(1,0,4,0.01,'Grain','The dark grain veil the green and violet frames are printed through, as a multiple of the page’s own.','×')}}
FIX['PL-107']['extra']={'weight':_x(1,0.5,1.5,0.01,'Line weight','Width of the gold keyline and its ochre underline, as a multiple of the page’s own.','×'),
  'under':_x(1,0,1,0.01,'Ochre underline','Opacity of the ochre line under the gold that gives the keyline its edge on white, as a share of the page’s own (0.85).')}
FIX['PL-107']['patches']=[q if 'opacity:.85},svg);' not in q[0] else [q[0],'"stroke-linejoin":"round","stroke-linecap":"round",fill:"none",opacity:.85*%s},svg);'%_P('under')] for q in FIX['PL-107']['patches']]
FIX['PL-108']={'dials':['weight','misreg','pitch','grain','dust','seed'],
  'extra':{'weight':_x(1,0.6,1.5,0.01,'Line weight','Weight of the keyline round every shape, as a multiple of the page’s own (the stroked STILLNESS keeps its own).','×'),
           'grain':_x(1,0,4,0.01,'Grain','The dark grain veil laid over the poster, as a multiple of the page’s own.','×'),
           'dust':_x(1,0,4,0.01,'Dust','The white speckle where the ink skipped, as a multiple of the page’s own. 0 clears it.','×')}}

# ---- soft-focus (PL-114 … PL-122): blur kept above the point where the soft shapes turn to hard bands, grain fine,
# rings and fog driven by the page's own numbers (the AURA ring set, the fog call), the flat blossom's skin as a switch
SF['extra'].update({
  'blur':_x(1,0.4,2,0.01,'Focus blur','Every blur the plate lays (its depth of field), as a multiple of its own. Below 0.4 the soft shapes harden into flat bands.','×'),
  'grain':_x(1,0,1.6,0.01,'Grain','The film grain laid once over the plate, as a multiple of its own. 0 leaves the paint clean.','×'),
  'velvet':_x(1,0,1.8,0.01,'Velvet','Depth of the velvet noise multiplied into each soft shape. 0 lays the color flat.','×'),
  'turn':_x(0,-36,36,1,'Turn','Turn of the blossom, within one lobe (72° apart).','°'),
  'lobek':_x(0.62,0.45,0.9,0.01,'Lobe fullness','Radius of each lobe against the flower’s (the page’s 0.62). Low reads as five petals, high as one round bloom.'),
  'edge':dict(_x(0,0,2,1,'Edge','The study’s skins for the same silhouette: a flat vector fill, a 4 px feathered airbrush, or velvet noise with a 2 px blur and film grain.'),options=[{'v':0,'label':'Flat'},{'v':1,'label':'Feathered'},{'v':2,'label':'Velvet'}]),
  'spread':_x(1,0.5,1.6,0.01,'Halo spread','How far each aura ring reaches past the flower (green ×1.36, orange ×1.2, pink ×1.1), as a multiple.','×'),
  'rings':_x(4,2,4,1,'Aura rings','How many rings of the aura stack are painted, from the blue core out: 2 is core and pink body, 4 adds the orange halo and green fringe.'),
  'specks':_x(1,0,2,0.01,'Dust points','How many dust points are scattered on the black, as a multiple of the page’s own.','×'),
  'fogd':_x(0.5,0.25,0.8,0.01,'Fog density','Opacity of the fog wash at its line (the page’s 0.5); it thickens toward the foot.'),
  'band':_x(1,0.5,2,0.01,'Spectrum width','Width of the two prismatic ribbons in the fog, as a multiple of the page’s 64 px.','×'),
  'type':_x(1,0.8,1.2,0.01,'Type size','Size of the poster’s type, as a multiple of its own; lines keep their leading.','×'),
  'lotus':_x(1,0.8,1.2,0.01,'Lotus size','Size of the lotus in profile, as a multiple of the page’s own.','×'),
  'panel':_x(1,0.6,1.15,0.01,'Panel width','Width of the frosted pane, as a multiple of the page’s 270 px; it always covers the product word.','×'),
  'fruit':_x(1,0.75,1.25,0.01,'Fruit size','Size of the citrus rounds behind the glass.','×'),
  'drift':_x(0,-90,40,1,'Bloom position','Moves the two blooms left (negative) or right through the air beside the type.','px'),
  'glow':_x(1,0.4,1.4,0.01,'Bloom strength','Opacity of the two blurred blooms behind the type, as a multiple of the page’s own.','×'),
  'bokeh':_x(1,0,1.8,0.01,'Bokeh size','Size of the two out-of-focus discs. 0 removes them.','×')})
_flat='(x,rng)=>{lobes(x,150,140,86,5,-Math.PI/2);x.fillStyle="#f8493a";x.fill();stamens(x,150,140,22,10,44,"#f7d35c",rng,2.6,1.2)}'
_L='t=>lobes(t,150,140,86,%s,-Math.PI/2+%s*Math.PI/180,%s)'%(_P('lobes',5),_P('turn',0),_P('lobek',.62))
SF['patches']=[q for q in SF['patches'] if q[0]!=_flat]+[[_flat,
  '(x,rng)=>{const E=%s|0,L=%s;if(E===1)velvet(x,B,B,L,"#f8493a",{blur:4,light:[150,140,70,.42]});else if(E===2)velvet(x,B,B,L,"#f8493a",{noise:NZ,blur:2,light:[150,140,70,.42],shade:[150,140,100,.12]});else{L(x);x.fillStyle="#f8493a";x.fill()}stamens(x,150,140,%s,10,44*%s,"#f7d35c",rng,2.6,1.2);if(E===2){x.setTransform(1,0,0,1,0,0);grainCtx(x,W,W,10,rng)}}'%(_P('edge',0),_L,_P('stamens',22),_P('reach'))],
  ['[["#6a78ff","#ff8fd0"],1,3.5,1,"source-over"]];','[["#6a78ff","#ff8fd0"],1,3.5,1,"source-over"]].map(r=>[r[0],1+(r[1]-1)*%s,r[2],r[3],r[4]]).slice(4-Math.max(1,Math.min(4,Math.round(%s))));'%(_P('spread'),_P('rings',4))],
  ['const rg=lx.createLinearGradient(cx-4,0,cx+4,0);','const SW=%s,rg=lx.createLinearGradient(cx-4*SW,0,cx+4*SW,0);'%_P('band')],
  ['lx.fillRect(cx-4,cy,8,H/8-cy)','lx.fillRect(cx-4*SW,cy,8*SW,H/8-cy)'],
  ['fog(x,B,BH,rng,{top:.5,ribbons:[[.22,.5],[.7,.55]]});','fog(x,B,BH,rng,{top:.5+%s,alpha:%s,ribbons:[[.22,.5+%s],[.7,.55+%s]]});'%(_P('fogtop',0),_P('fogd',.5),_P('fogtop',0),_P('fogtop',0))],
  ['dust(x,B,BH,220,rng);','dust(x,B,BH,Math.round(220*%s),rng);'%_P('specks')],
  ['dust(x,B,BH,180,rng);','dust(x,B,BH,Math.round(180*%s),rng);'%_P('specks')]]
FIX.update({
  'PL-114':{'dials':['edge','lobes','lobek','turn','stamens','reach']},
  'PL-115':{'dials':['blur','spread','rings','grain','specks','seed'],'extra':{'blur':_x(1,0.5,2,0.01,'Focus blur','Every blur the plate lays (its depth of field), as a multiple of its own. Below 0.5 the aura’s rings harden into outlines.','×')}},
  'PL-116':{'dials':['blur','fogtop','fogd','band','grain','specks','seed'],
            'extra':{'blur':_x(1,0.8,2,0.01,'Focus blur','Every blur the plate lays, as a multiple of its own: the fog is painted small and blown up through it. Below 0.8 the spectrum ribbons show their square ends.','×'),
                     'fogtop':_x(0,-0.2,0.2,0.01,'Fog line','Where the fog starts, against the page’s own (halfway down): negative raises it.')}},
  'PL-117':{'dials':['blur','frost','panel','spark','fruit'],
            'extra':{'panel':_x(1,0.9,1.15,0.01,'Panel width','Width of the frosted pane, as a multiple of the page’s 270 px; it always covers the slices and the product word.','×'),
                     'frost':_x(1,0,1.8,0.01,'Frost','How white the glass is (its 28% white tint), as a multiple.','×'),
                     'fruit':_x(1,0.75,1.1,0.01,'Fruit size','Size of the citrus rounds behind the glass; they stay under the pane.','×'),'blur':_x(1,0.6,1.7,0.01,'Focus blur','Every blur the plate lays, the 14 px frost of the glass first, as a multiple of its own. Below 0.6 the pane stops reading as frosted; above 1.7 the blur bands at the pane’s lower edge.','×')}},
  'PL-118':{'dials':['blur','bloom','glow','drift','type'],'extra':{
     'blur':_x(1,0.5,2,0.01,'Focus blur','Every blur the plate lays, the two blooms first, as a multiple of its own. Below 0.5 the blooms harden into flat discs.','×'),
     'type':_x(1,0.8,1.1,0.01,'Type size','Size of the poster’s type, as a multiple of its own; past 1.1 the title runs into the CJK line.','×')}},
  'PL-119':{'dials':['blur','spark','bokeh','streak','crystal'],'extra':{
     'blur':_x(1,0.5,2,0.01,'Focus blur','Every blur the plate lays, as a multiple of its own. Below 0.5 the bokeh and the far disc harden into flat circles.','×'),
     'crystal':_x(1,0.3,1.8,0.01,'Crystal size','Size of the small frost crystal.','×')}},
  'PL-120':{'dials':['blur','velvet','pads','grain','lotus','type','seed'],'set':{'blurKeep':2},
            'extra':{'blur':_x(1,0.4,2,0.01,'Focus blur','The depth of field behind the lotus: every blur wider than 2 px (the far pads, the second bud, the washes), as a multiple of its own. The lotus, the near pad and the right bud stay sharp.','×')}},
  'PL-121':{'dials':['blur','spread','specks','fogtop','grain','type','seed'],'extra':{'blur':_x(1,0.5,2,0.01,'Focus blur','Every blur the plate lays (its depth of field), as a multiple of its own. Below 0.5 the aura’s rings harden into outlines.','×'),'fogtop':_x(0,-0.15,0.2,0.01,'Fog line','Moves where the fog starts: negative raises it over more of the heads, positive lowers it to the roots.')}},
  'PL-122':{'dials':['blur','frost','spark','grain','type'],
            'extra':{'blur':_x(1,0.7,2,0.01,'Focus blur','Every blur the page lays, the 8 px frost of the glass and the warm washes first, as a multiple of its own. Below 0.7 the pane stops reading as frosted.','×'),
                     'frost':_x(1,0,1.8,0.01,'Frost','How white the glass is (its 18% white tint), as a multiple.','×')}}})
# Round 2 (soft-focus): dust draws from its own stream. The page's rng is advanced by exactly the draws the page's own
# dust takes (six per point), so the fog, flowers and grain after it are the page's own at every dust count; more dust
# than the page's comes from a separate seeded stream.
_SPK=_P('specks')
def _dustP(n): return "{const _D=[];for(let i=0;i<%d;i++)_D.push(rng());let _k=0;const _xr=RNG(919);dust(x,B,BH,Math.round(%d*%s),()=>_k<_D.length?_D[_k++]:_xr());}"%(6*n,n,_SPK)
_dfix={'dust(x,B,BH,220,rng);':'dust(x,B,BH,220,rng);'+'\x00','dust(x,B,BH,180,rng);':None}
SF['patches']=[[a0,b0] for a0,b0 in SF['patches'] if a0 not in ('dust(x,B,BH,220,rng);','dust(x,B,BH,180,rng);','x.fillStyle="#040406";x.fillRect(0,0,B,BH);dust(x,B,BH,700,rng);')]+[
  ['dust(x,B,BH,220,rng);',_dustP(220)],['dust(x,B,BH,180,rng);',_dustP(180)],
  ['x.fillStyle="#040406";x.fillRect(0,0,B,BH);dust(x,B,BH,700,rng);','x.fillStyle="#040406";x.fillRect(0,0,B,BH);'+_dustP(700)]]
# the blossom turns by a share of one lobe, whatever the lobe count
SF['patches']=[[a0,b0.replace("((window.__P||{}).turn==null?0:window.__P.turn)*Math.PI/180","((window.__P||{}).turn==null?0:window.__P.turn)*2*Math.PI/((window.__P||{}).lobes==null?5:window.__P.lobes)")] for a0,b0 in SF['patches']]
SF['extra'].update({
  'turn':_x(0,-0.5,0.5,0.01,'Turn','Turn of the blossom, as a share of one lobe (360° ÷ lobes): ±0.5 turns it half a lobe either way, which covers every pose.'),
  'rings':dict(_x(4,2,4,1,'Aura','How much of the aura stack is painted around each flower, from the blue core out.'),options=[{'v':2,'label':'Core and body'},{'v':3,'label':'With halo'},{'v':4,'label':'Full aura'}]),
  'ptop':_x(250,180,300,1,'Pane line','Where the frosted pane starts: above it the fruit is crisp, below it frosted. Higher frosts more of the fruit.','u'),
  'wash':_x(1,0,1.6,0.01,'Warm wash','Strength of the two warm orange washes behind the glass, as a multiple of the page’s own.','×'),
  'slices':_x(10,6,14,1,'Segments','Segments in each citrus round and wedge behind the glass.')})
SF['patches']=SF['patches']+[
  ['glass(x,src,W,H,222,250,358,550,{blur:8,tint:"rgba(255,255,255,.18)"});','glass(x,src,W,H,222,%s,358,800-%s,{blur:8,tint:"rgba(255,255,255,.18)"});'%(_P('ptop',250),_P('ptop',250))],
  ['blob(sx,420,560,170,"#ffb08a",40,.6);blob(sx,360,720,150,"#ff7a59",44,.5);','blob(sx,420,560,170,"#ffb08a",40,Math.min(1,.6*%s));blob(sx,360,720,150,"#ff7a59",44,Math.min(1,.5*%s));'%(_P('wash'),_P('wash'))],
  ['sx.arc(cx,cy,r,rot,rot+Math.PI);sx.closePath();sx.clip();citrus(sx,cx,cy,r,OR,RIM,PITH,10,rot);','sx.arc(cx,cy,r,rot,rot+Math.PI);sx.closePath();sx.clip();citrus(sx,cx,cy,r,OR,RIM,PITH,%s,rot);'%_P('slices',10)]]
# the PL-122 frost tint patch is the family's frost patch on its glass call: re-target it to the pane-line call
SF['patches']=[q for q in SF['patches'] if q[0]!='glass(x,src,W,H,222,250,358,550,{blur:8,tint:"rgba(255,255,255,.18)"});' or 'ptop' in q[1]]
SF['patches']=[[a0,b0.replace('{blur:8,tint:"rgba(255,255,255,.18)"});','{blur:8,tint:"rgba(255,255,255,"+Math.min(1,.18*%s)+")"});'%_P('frost'))] if 'ptop' in b0 else [a0,b0] for a0,b0 in SF['patches']]
FIX['PL-115']['dials']=['blur','spread','rings','grain','specks','seed']
FIX['PL-117']['extra']['panel']=_x(1,0.88,1.3,0.01,'Panel width','Width of the frosted pane, as a multiple of the page’s 270 px; it always covers the product word.','×')
FIX['PL-119']['extra'].update({'bokeh':dict(_x(1,0,1.8,0.01,'Bokeh size','Size of the two out-of-focus discs. 0 removes them.','×'),scale='sqrt'),
  'crystal':_x(1,0.3,1.3,0.01,'Crystal size','Size of the small frost crystal; past 1.3 its threads read as scribble.','×')})
FIX['PL-120']['dials']=['blur','velvet','pads','lotus','type','seed']
FIX['PL-120']['extra']['velvet']=_x(1,0,1.2,0.01,'Velvet','Depth of the velvet noise multiplied into each petal and pad. 0 lays the color flat; past 1.2 the petals go dusky and blotched.','×')
FIX['PL-121']['dials']=['blur','spread','specks','fogtop','grain','seed']
FIX['PL-122']={'dials':['blur','frost','ptop','slices','wash','spark'],
  'extra':dict(FIX['PL-122']['extra'],frost=_x(1,0.4,1.8,0.01,'Frost','How white the glass is (its 18% white tint), as a multiple. Below 0.4 the slices read as crisp clip art through it.','×'))}

# Round 2 (records): the contour rings get real contrast when Contours is the chosen layer (the page keeps its faint
# rings under other layers); PL-16's Layer switch acts on both views; PL-11's glow reaches every strand's radius on a
# wide log track; PL-03 drops the dot-shape switch (its 3 px dots cannot show it) and stops gain and pitch before the
# blooms close or dissolve; PL-37's continuous screen prints the red as a flat ink over the tone, on a Paper mat
_RING=["x.strokeStyle = paper ? 'rgba(16,16,20,.16)' : 'rgba(236,238,244,.12)'; x.stroke(); } }","x.strokeStyle = layer === 'contours' ? (paper ? 'rgba(16,16,20,.5)' : 'rgba(236,238,244,.42)') : (paper ? 'rgba(16,16,20,.16)' : 'rgba(236,238,244,.12)'); if (layer === 'contours') x.lineWidth = 1.3; x.stroke(); } }"]
EX['patches']=EX['patches']+[_RING]
FIX['PL-19']['patches']=FIX['PL-19']['patches']+[_RING]
FIX['PL-16']['patches']=FIX['PL-16']['patches']+[["drawRecord(x, W, 440, n2, { tilt: 0, breath: 7, layer: 'glow', dot: 1.9, zoom: 1.12 });","drawRecord(x, W, 440, n2, { tilt: 0, breath: 7, layer: ['glow','contours','dots'][(window.__P||{}).layer|0], dot: 1.9 * %s, zoom: 1.12 });"%_P('dot')]]
FIX['PL-16']['extra']['layer']=dict(_x(0,0,2,1,'Layer','How both views are drawn: the page’s own (glow from above, filaments and rungs from the side), the turn rings with the filaments, or the dots alone.'),options=[{'v':0,'label':'Path'},{'v':1,'label':'Contours'},{'v':2,'label':'Dots'}])
A10['patches']=A10['patches']+[["ctx.strokeStyle = rgba(pal.line, [.16, .10, .06][j]);","ctx.strokeStyle = rgba(pal.line, [.34, .24, .16][j]);"]]
FIX['PL-11']['extra']={'glow':_x(1,0.25,2.2,0.01,'Glow','Radius of the glow laid under the newest strands, as a multiple of the page’s own.','×')}
FIX['PL-12']['extra']['spacing']=_x(1,0.8,1.12,0.01,'Line spacing','Distance between strands in the side view, as a multiple of the page’s own. Past 1.12 the field reaches the divider; below 0.8 it leaves the panel half empty.','×')
FIX['PL-12']['extra']['path']=dict(_x(1,0,1,1,'Path','The two faint filaments that thread the strands in order through the top view.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}])
FIX['PL-03']['dials']=['pitch','sangle','gain','misreg']
FIX['PL-03']['extra']={'pitch':_x(1.6,1,2,0.01,'Dot pitch','Spacing of the three dot screens the blooms are printed in, as a multiple of the page’s 1.85 px. Larger is coarser; past 2 the rays dissolve.','×'),
  'gain':_x(1,0.7,1.12,0.01,'Dot gain','How far each dot spreads for the tone it carries, as a multiple of the page’s own. Past 1.12 the full bloom closes into a solid disc.','×')}
FIX['PL-37']['patches']=[[a0,b0.replace("{ mode: 'line' }","{ mode: 'line', flat: 1 }")] for a0,b0 in FIX['PL-37']['patches']]+[
  ["D[q++] = lerp(pal.paper[c], lerp(pal.a[c], pal.b[c], b), a) * gn;","D[q++] = (pal.flat ? lerp(lerp(pal.paper[c], pal.a[c], a), pal.b[c], Math.min(1, b * 1.6)) : lerp(pal.paper[c], lerp(pal.a[c], pal.b[c], b), a)) * gn;"]]
FIX['PL-37']['set']={'ground':'#fbfbf7'}
FIX['PL-37']['extra']['screen']=dict(_x(0,0,1,1,'Screen','How the press renders tone: one-pixel dots against white noise, as the page prints it, or continuous tone with the red laid flat over it.'),options=[{'v':0,'label':'Stochastic'},{'v':1,'label':'Continuous'}])

# Round 2 (sheet, rig, Shannon): the garden sheet's captions and plan furniture as a layer switch in place of the hatch
# pitch (invisible at plate size); the projector stays where the mask keeps its terrain; the plan's Beam (an opacity)
# gives way to the rig's own table distance; Fig. 1 holds the packet at the page's still pose, across the noise
# junction, and sets its MESSAGE labels over the box gaps; Fig. 7's axis title moves left of its tick labels
FIX['PL-130']['dials']=['plates','misreg','caps','grain']
FIX['PL-130']['extra']['caps']=dict(_x(1,0,1,1,'Captions','The key plate’s type and furniture: bed labels, counts, north arrow and scale bar.'),options=[{'v':0,'label':'Off'},{'v':1,'label':'On'}])
FIX['PL-130']['patches']=FIX['PL-130']['patches']+[['  drawCaptions(X,u);\n  drawPlanFurniture(X,u);','  if(%s){drawCaptions(X,u);\n  drawPlanFurniture(X,u);}'%_P('caps')]]
CR_X.update({'lampx':_x(0,-1.5,1.5,0.1,'Projector offset','The projector’s place left or right of the wall’s center line; past 1.5 the mask side loses its terrain.','u'),
  'lampy':_x(2.6,2,4,0.1,'Projector height','Height of the projector’s lens; higher drops every shadow down the wall. Below 2 the mask cuts into a cliff.','u'),
  'tablez':_x(3.4,2.6,5.4,0.1,'Table distance','How far the turntable stands from the wall: nearer the wall, smaller and sharper shadows; nearer the projector, larger and softer.','u')})
CR_P.append(['table: { x: 0, y: 1.45, z: 3.4, r: 2.3, t: 0.26 }','table: { x: 0, y: 1.45, z: %s, r: 2.3, t: 0.26 }'%_P('tablez',3.4)])
FIX['PL-131']={'dials':['tturn','lampz','lampx','lampy','wipe'],'extra':CR_X,'patches':CR_P}
FIX['PL-132']={'dials':['tturn','lampz','lampx','tablez'],'extra':CR_X,'patches':CR_P}
SH_P[:]=[q for q in SH_P if q[0]!="x.fillText('H  bits',0,0);"]+[
  ["x.save(); x.translate(12,Tp+ph/2); x.rotate(-Math.PI/2); x.fillText('H  bits',0,0); x.restore();","x.save(); x.translate(4,Tp+ph/2); x.rotate(-Math.PI/2); x.fillText('H  '+%s,0,0); x.restore();"%_UN],
  ["x.fillText('MESSAGE',(boxes[0][1]*w+bw+boxes[1][1]*w)/2,wy-14);","x.fillText('MESSAGE',(boxes[0][1]*w+bw+boxes[1][1]*w)/2,by-8);"],
  ["x.fillText('MESSAGE',(boxes[2][1]*w+bw+boxes[3][1]*w)/2,wy-14);","x.fillText('MESSAGE',(boxes[2][1]*w+bw+boxes[3][1]*w)/2,by-8);"],
  ["const period=reduced?1e9:9000, ph=reduced?0.62:((now-t0)%period)/period;","const period=9000, ph=0.62;"]]

def refresh(code, by):
    p=by[code]; path='plates/%s/lc-figure.js'%p['slug']; t=open(path).read(); head,body=t.split('window.LC_FIG=',1)
    cur=json.loads(body.rstrip().rstrip(';')); fam=FAM.get(CODE_FAM.get(code,''),{}); fx=FIX.get(code,{})
    o={k:v for k,v in cur.items() if k not in ('extra','patches','dials')}
    dials=list(fx.get('dials',cur.get('dials',[]))); o['dials']=dials
    ex=dict(fam.get('extra',{})); ex.update(fx.get('extra',{})); ex={k:v for k,v in ex.items() if k in dials}
    if ex: o['extra']=ex
    pats=[list(q) for q in fam.get('patches',[]) if q[0] not in fx.get('unpatch',[])]
    for q in fx.get('patches',[]):
        hit=[i for i,r in enumerate(pats) if r[0]==q[0]]
        if hit: pats[hit[0]]=list(q)
        else: pats.append(list(q))
    if pats: o['patches']=pats
    for a,b in fx.get('inkswap',{}).items(): o['inks']=[b if h==a else h for h in o.get('inks',[])]
    for k,v in fx.get('set',{}).items():
        if v is None: o.pop(k,None)
        else: o[k]=v
    open(path,'w').write(head+'window.LC_FIG='+json.dumps(o,ensure_ascii=False)+';\n')
if __name__=='__main__' and len(sys.argv)>2 and sys.argv[2]=='fix':
    codes=sys.argv[1].split(','); C=json.load(open('_build/plates.json')); by={p['code']:p for p in C['plates']}
    for code in codes: refresh(code, by)
    import plates
    for q in plates.CFG['plates']:
        if q['code'] in codes: plates.plate(q)
    print('refreshed',codes); sys.exit(0)
codes=sys.argv[1].split(','); fam=FAM.get(sys.argv[2],{}) if len(sys.argv)>2 else {}
C=json.load(open('_build/plates.json')); by={p['code']:p for p in C['plates']}
for code in codes:
    r=R.get(code,{'U':{'own':{'col':{}},'off':{'col':{}}}}); p=by[code]; L=list(p['lift'].values())[0]; own=r['U']['own']; off=r['U']['off']
    cols=dict(own['col'])
    if own.get('img',0)>0:
        for k,v in off['col'].items(): cols[k]=cols.get(k,0)+v
    inks=[h for h,_ in sorted(cols.items(),key=lambda kv:-kv[1]) if h][:8]
    ground=r.get('ground') or '#ffffff'
    if code in LI and LI[code].get('inks'): inks=LI[code]['inks']; ground=LI[code]['ground']
    dials=list(fam.get('per',{}).get(code, fam.get('dials',[])))
    al=own.get('al',0)+(off.get('al',0) if own.get('img',0) else 0)
    if al>=3 and 'ink' not in dials and code not in fam.get('per',{}): dials.append('ink')
    if fam.get('auto'):
        use=dict(own); 
        if own.get('img',0)>0 or not any(own.get(k,0) for k in ('lw','mark','al','font')):
            for k in ('lw','mark','al','font'): use[k]=own.get(k,0)+off.get(k,0)
        dials=[d for d,k in (('weight','lw'),('mark','mark'),('ink','al'),('type','font')) if use.get(k,0)>=3]+(['moment'] if r.get('moved') else [])
        if not inks:
            for k,v in off['col'].items(): cols[k]=cols.get(k,0)+v
            inks=[h for h,_ in sorted(cols.items(),key=lambda kv:-kv[1]) if h][:8]
    o={'src':L['rt'],'sel':L['sel'],'w':L['w'],'h':L['h'],'crop':L.get('crop',[0,0,1,1]),'ground':ground,'dials':dials,'inks':inks,'t0':2}
    if L.get('slide',-1)>=0: o['slide']=L['slide']; o['sid']=L.get('sid','')
    if L.get('tab'): o['tab']=L['tab']
    for k in ('real','settle','dom'):
        if fam.get(k): o[k]=fam[k]
    if fam.get('extra'): o['extra']=fam['extra']
    if fam.get('patches'): o['patches']=fam['patches']
    if len(p['lift'])>1: o['sels']=[q['sel'] for q in p['lift'].values()]
    for k in ('composite','overlay'):
        if fam.get(k): o[k]=True
    if len(sys.argv)>3 and code in json.loads(sys.argv[3]): o['dials']=[d for d in o['dials'] if d in json.loads(sys.argv[3])[code]]
    open('plates/%s/lc-figure.js'%p['slug'],'w').write("/* %s · %s · drawn by its source page's own code: %s %s. Dials and inks measured by _build/qa/lift-probe.mjs; see _build/engines/lift-canvas.js. */\nwindow.LC_FIG=%s;\n"%(code,p['title'],L['rt'].split('/')[-1],L['sel'],json.dumps(o,ensure_ascii=False)))
    p['engine']=['lc-figure.js','../../_build/engines/lift-canvas.js']
if json.dumps(C)!=json.dumps(json.load(open('_build/plates.json'))): json.dump(C,open('_build/plates.json','w'),indent=1,ensure_ascii=False); open('_build/plates.json','a').write('\n')
import plates
for q in plates.CFG['plates']:
    if q['code'] in codes: plates.plate(q)
print('wired',codes)
