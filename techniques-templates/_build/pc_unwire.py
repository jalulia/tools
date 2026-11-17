# takes a plate off its engine and restores its generated page from plates.json alone
import json,sys,os
sys.path.insert(0,'_build')
codes=sys.argv[1].split(',')
C=json.load(open('_build/plates.json'))
for p in C['plates']:
    if p['code'] in codes and p.get('engine'):
        e=p['engine']; f='plates/%s/%s'%(p['slug'],e[0] if isinstance(e,list) else '')
        if isinstance(e,list) and os.path.exists(f): os.remove(f)
        del p['engine']
json.dump(C,open('_build/plates.json','w'),indent=1,ensure_ascii=False); open('_build/plates.json','a').write('\n')
sp=json.load(open('_build/pc-specs.json')); [sp.pop(c,None) for c in codes]; json.dump(sp,open('_build/pc-specs.json','w'),indent=1,ensure_ascii=False)
import plates
for q in plates.CFG['plates']:
    if q['code'] in codes: plates.plate(q)
print('unwired',codes)
