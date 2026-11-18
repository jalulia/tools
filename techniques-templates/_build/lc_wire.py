# writes lc-figure.js from the lift probe (_build/qa/lift-probe.json) plus per-family extras; argv: codes, family
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
json.dump(C,open('_build/plates.json','w'),indent=1,ensure_ascii=False); open('_build/plates.json','a').write('\n')
import plates
for q in plates.CFG['plates']:
    if q['code'] in codes: plates.plate(q)
print('wired',codes)
