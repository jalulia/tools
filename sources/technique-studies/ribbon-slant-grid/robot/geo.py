import numpy as np, json, networkx as nx
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize
from skimage import measure
a = np.array(Image.open('masks.png')).astype(int); H, W = a.shape[:2]
fw, fb, eye = a[..., 0] > 127, a[..., 1] > 127, a[..., 2] > 127
white = fw & ~fb
def flood(ok, seeds):
    lab, _ = ndi.label(ok); ids = {lab[y, x] for (y, x) in seeds if ok[y, x]}; return np.isin(lab, list(ids))
out = flood(~fb, [(0, 0), (0, W - 1), (H - 1, 0), (H - 1, W - 1)])
face = flood(white, [(820, 880)])
yy = np.arange(H)[:, None] * np.ones((1, W))
rest = white & ~out & ~face
brain = rest & (yy < 600); light = rest & (yy >= 600)
ring = white & out
print('px brain', brain.sum(), 'light', light.sum(), 'face', face.sum(), 'ring', ring.sum())
# ---- eye lights
lab, n = ndi.label(light); EL = []
for k in range(1, n + 1):
    m = lab == k; s = m.sum()
    if s < 200: continue
    cy, cx = ndi.center_of_mass(m); EL.append([round(cx, 1), round(cy, 1), round((s / np.pi) ** .5, 1), int(s)])
print('eye lights', EL)
# ---- contours (y down, units = v13 px)
def contour(mask, lvl=.5):
    cs = measure.find_contours(np.pad(mask.astype(float), 1), lvl); c = max(cs, key=len) - 1
    return [[round(float(p[1]), 1), round(float(p[0]), 1)] for p in c[::3]]
sil = contour(fw); head = contour(fw & ~ring); fc = contour(face)
# ---- brain gyri: skeleton per component, pruned, toured
dt = ndi.distance_transform_edt(brain)
sk = skeletonize(brain)
lab, n = ndi.label(brain, structure=np.ones((3, 3)))
print('gyri components', n)
comps = []
for k in range(1, n + 1):
    m = lab == k
    if m.sum() < 60: continue
    pts = np.argwhere(sk & m)
    if len(pts) == 0: continue
    G = nx.Graph(); S = set(map(tuple, pts))
    for (y, x) in S:
        G.add_node((y, x))
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if (dy or dx) and (y + dy, x + dx) in S: G.add_edge((y, x), (y + dy, x + dx), weight=(dy * dy + dx * dx) ** .5)
    G = G.subgraph(max(nx.connected_components(G), key=len)).copy()
    T = nx.minimum_spanning_tree(G)
    # prune spurs shorter than 1.2 × local radius
    for _ in range(6):
        leaves = [v for v in T if T.degree(v) == 1]; cut = False
        for lf in leaves:
            path = [lf]; v = lf
            while True:
                nb = [u for u in T.neighbors(v) if u not in path]
                if len(nb) != 1 or T.degree(v) > 2 and v != lf: break
                v = nb[0]; path.append(v)
                if T.degree(v) != 2: break
            if T.degree(path[-1]) >= 3 and len(path) - 1 < 1.2 * dt[path[-1]] and T.number_of_nodes() > len(path):
                T.remove_nodes_from(path[:-1]); cut = True
        if not cut: break
    # diameter ends
    e0 = list(T.nodes)[0]; d = nx.single_source_dijkstra_path_length(T, e0); A = max(d, key=d.get)
    d = nx.single_source_dijkstra_path_length(T, A); B = max(d, key=d.get)
    comps.append({'T': T, 'A': A, 'B': B, 'cx': float(np.mean([v[1] for v in T])), 'cy': float(np.mean([v[0] for v in T])), 'area': int(m.sum())})
print('kept', len(comps))
def walk(T, root, end):
    # Euler walk from root; the branch toward `end` is visited last and not retraced
    onpath = set(nx.shortest_path(T, root, end)); seq = []
    def go(v, p, last):
        seq.append(v)
        ch = [u for u in T.neighbors(v) if u != p]
        ch.sort(key=lambda u: u in onpath)
        for i, u in enumerate(ch):
            fin = last and u in onpath
            go(u, v, fin)
            if not fin: seq.append(v)
    import sys; sys.setrecursionlimit(100000); go(root, None, True); return seq
# order: sweep left → right along the dome, nearest end each time
left = min(comps, key=lambda c: min(c['A'][1], c['B'][1]))
order = []; cur = None; todo = comps[:]
while todo:
    if cur is None: c = left; st = c['A'] if c['A'][1] < c['B'][1] else c['B']
    else:
        best = None
        for c2 in todo:
            for e in (c2['A'], c2['B']):
                dd = np.hypot(e[0] - cur[0], e[1] - cur[1]) + 0.35 * max(0, cur[1] - e[1])
                if best is None or dd < best[0]: best = (dd, c2, e)
        _, c, st = best
    todo.remove(c); en = c['B'] if st == c['A'] else c['A']
    order.append((c, st, en)); cur = en
P = []   # x, y, w(diameter), on(1 stroke / 0 transit)
for j, (c, st, en) in enumerate(order):
    seq = walk(c['T'], st, en)
    xy = np.array([[v[1], v[0]] for v in seq], float); r = np.array([dt[v] for v in seq], float)
    # smooth along the walk
    xy = ndi.gaussian_filter1d(xy, 2.2, axis=0, mode='nearest'); r = ndi.gaussian_filter1d(r, 1.5, mode='nearest')
    for (x, y), rr in zip(xy, r): P.append([x, y, 2 * rr + .8, 1])
    if j < len(order) - 1: P.append([xy[-1][0], xy[-1][1], 0, 0])   # pen up
P = np.array(P)
# arc length; transits weighted 0.12 so they take few samples
seg = np.hypot(*np.diff(P[:, :2], axis=0).T); wgt = np.where((P[1:, 3] == 0) | (P[:-1, 3] == 0), .12, 1.)
L = np.concatenate([[0], np.cumsum(seg * wgt)])
N = 1800; s = np.linspace(0, L[-1], N); idx = np.clip(np.searchsorted(L, s, side='right') - 1, 0, len(P) - 2)
t = (s - L[idx]) / np.maximum(L[idx + 1] - L[idx], 1e-9)
X = P[idx, 0] + (P[idx + 1, 0] - P[idx, 0]) * t; Y = P[idx, 1] + (P[idx + 1, 1] - P[idx, 1]) * t
on = np.minimum(P[idx, 3], P[idx + 1, 3]); Wd = (P[idx, 2] + (P[idx + 1, 2] - P[idx, 2]) * t) * on
print('stroke length', round(float((seg * (wgt == 1)).sum())), 'transit length', round(float((seg * (wgt != 1)).sum())), 'samples on', int(on.sum()), 'spacing', round(float(L[-1] / N), 2))
json.dump({'W': W, 'H': H, 'brain': [[round(float(x), 2), round(float(y), 2), round(float(w), 2)] for x, y, w in zip(X, Y, Wd)],
           'lights': EL, 'sil': sil, 'head': head, 'face': fc, 'gyri': len(order)}, open('robotgeo.json', 'w'))
# ---- eye lights: the bite of each eye (its convex hull minus the eye)
from skimage.morphology import convex_hull_image
lab, n = ndi.label(eye); EL = []
for k in range(1, n + 1):
    m = lab == k
    if m.sum() < 2000: continue
    b = convex_hull_image(m) & ~m; bl, bn = ndi.label(b); sz = ndi.sum(b, bl, range(1, bn + 1)); kk = int(np.argmax(sz)) + 1; hm = bl == kk
    cy, cx = ndi.center_of_mass(hm); dtm = ndi.distance_transform_edt(hm); my, mx = np.unravel_index(np.argmax(dtm), dtm.shape)
    ey, ex = ndi.center_of_mass(m)
    EL.append({'cx': round(float(mx), 1), 'cy': round(float(my), 1), 'r': round(float(dtm.max()), 1), 'eye': [round(float(ex), 1), round(float(ey), 1)]})
print('eye lights', EL)
D = json.load(open('robotgeo.json')); D['lights'] = EL; json.dump(D, open('robotgeo.json', 'w'))
# ---- coverage check: discs along the tour vs the brain mask
from PIL import ImageDraw
im = Image.new('RGB', (W, H), (8, 11, 12)); px = np.zeros((H, W, 3), np.uint8); px[brain] = (90, 90, 90); im = Image.fromarray(px); dr = ImageDraw.Draw(im)
B = np.array(D['brain'])
for i in range(len(B) - 1):
    x, y, w = B[i]; x2, y2, w2 = B[i + 1]
    if w > 0 and w2 > 0: dr.line([(x, y), (x2, y2)], fill=(236, 238, 236), width=max(1, int(round(min(w, w2)))))
    else: dr.line([(x, y), (x2, y2)], fill=(255, 80, 60), width=1)
for e in EL: dr.ellipse([e['cx'] - e['r'], e['cy'] - e['r'], e['cx'] + e['r'], e['cy'] + e['r']], outline=(80, 200, 255), width=3)
im.crop((250, 80, 1380, 640)).save('/tmp/brain-cover.png'); print(B[:, 2].max(), np.median(B[B[:, 2] > 0, 2]))
