import numpy as np, json
from PIL import Image
from scipy import ndimage as ndi
a = np.array(Image.open('masks.png')).astype(int); fw = a[..., 0] > 127
E = ndi.distance_transform_edt(fw); D = json.load(open('robotgeo.json'))
def thin(c, k=2): return c[::k]
out = {'W': D['W'], 'H': D['H'], 'dmax': round(float(E.max()), 1), 'brain': D['brain'], 'lights': D['lights'], 'gyri': D['gyri']}
for key in ('sil', 'head', 'face'):
    c = thin(D[key]); d = [E[min(D['H'] - 1, int(round(y))), min(D['W'] - 1, int(round(x)))] for x, y in c]
    out[key] = c; out['d_' + key] = round(float(np.median(d)), 1)
print({k: out[k] for k in ('dmax', 'd_sil', 'd_head', 'd_face')}, len(out['sil']), len(out['head']), len(out['face']))
open('../src/robotgeo.js', 'w').write('/* the Mindgut 2.2 mark, measured from its own vector (landing page v13): brain tour (x, y, stroke width; 0 = between folds), eye lights, three contours, in mark units (1620 × 1571, y down) */\nwindow.ROBOTGEO = ' + json.dumps(out, separators=(',', ':')) + ';\n')
