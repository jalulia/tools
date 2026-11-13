"""tune.py <plate> key=v1,v2,v3 [key2=...] — grid over params, print mean/min and worst rows"""
import sys, json, asyncio, itertools
from bench import run
pid=sys.argv[1]; grid=[(a.split('=')[0],[float(v) for v in a.split('=')[1].split(',')]) for a in sys.argv[2:]]
overs=[dict(zip([k for k,_ in grid],c)) for c in itertools.product(*[v for _,v in grid])]
ref,res=asyncio.run(run(pid,overs))
for o,s in sorted(zip(overs,res),key=lambda t:-t[1]['mean']):
    worst=sorted(s['rows'],key=lambda r:r['v'])[:4]
    print('%.4f min %.3f'%(s['mean'],s['min']),o,' | '.join('%s/%s %.3f'%(r['patch'][:8],r['metric'][:9],r['v']) for r in worst))
