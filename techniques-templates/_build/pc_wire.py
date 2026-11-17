# writes pc-figure.js for plates driven by their page's own controls; spec in _build/pc-specs.json
import json,sys
sys.path.insert(0,'_build')
SP=json.load(open('_build/pc-specs.json'))
C=json.load(open('_build/plates.json')); by={p['code']:p for p in C['plates']}
only=sys.argv[1].split(',') if len(sys.argv)>1 else list(SP)
for code in only:
    o=dict(SP[code]); p=by[code]; L=list(p['lift'].values())[0]
    for k in ('src','sel','crop','tab','slide','sid'):
        if k not in o: o[k]={'src':L['rt'],'sel':L['sel'],'crop':L.get('crop',[0,0,1,1]),'tab':L.get('tab',''),'slide':L.get('slide',-1),'sid':L.get('sid','')}[k]
    open('plates/%s/pc-figure.js'%p['slug'],'w').write("/* %s · %s · drawn by its source page's own code (%s); each dial is one of that page's own controls. Spec: _build/pc-specs.json. See _build/engines/page-controls.js. */\nwindow.PC_FIG=%s;\n"%(code,p['title'],o['src'].split('/')[-1] or o['src'],json.dumps(o,ensure_ascii=False)))
    p['engine']=['pc-figure.js','../../_build/engines/page-controls.js']
json.dump(C,open('_build/plates.json','w'),indent=1,ensure_ascii=False); open('_build/plates.json','a').write('\n')
import plates
for q in plates.CFG['plates']:
    if q['code'] in only: plates.plate(q)
print('wired',only)
