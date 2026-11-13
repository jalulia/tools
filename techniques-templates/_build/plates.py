#!/usr/bin/env python3
"""Read plates · Techniques & Templates · ø co.

python3 _build/plates.py            run from techniques-templates/
Reads _build/plates.json (the groups) and the figures in plates/<slug>/f01.jpg, f02.jpg …
Writes plates/<slug>/study.js for each plate (layout, measured points, spec), the 'plates' rows of
_shared/entries.js, the plate terms in _build/registry-map.json, and in ../library/_build:
works.json rows point at their plate and editions.json makes each figure a part of its plate.
Then run: node _build/build.mjs pl- && node _build/render.mjs pl- && the library and registry builds.

Every number in a plate is measured from its figures here: ground, ink coverage, ink colors,
where the ink sits. Nothing is drawn but the figures themselves."""
import json, os, re, glob, math
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); TT = os.path.dirname(HERE); ROOT = os.path.dirname(TT)
LIB = os.path.join(ROOT, 'library', '_build')
CFG = json.load(open(os.path.join(HERE, 'plates.json')))
CAT = json.load(open(os.path.join(ROOT, 'library', 'catalog.json')))
REC = {r['id']: r for r in CAT['records']}
WORKS = json.load(open(os.path.join(LIB, 'works.json')))
WROW = {r['id']: r for r in WORKS['records']}

hexs = lambda c: '#%02X%02X%02X' % tuple(int(round(v)) for v in c[:3])
W_U, MARGIN, GUT = 1000.0, 30.0, 14.0

def measure(path):
    im = Image.open(path).convert('RGB'); w, h = im.size
    s = 360 / max(w, h); sm = im.resize((max(8, round(w * s)), max(8, round(h * s))), Image.BOX)
    a = np.asarray(sm, dtype=np.float32); H, W, _ = a.shape
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    q = (border // 12).astype(int); keys, cnt = np.unique(q[:, 0] * 10000 + q[:, 1] * 100 + q[:, 2], return_counts=True)
    k = keys[cnt.argmax()]; ground = border[(q[:, 0] * 10000 + q[:, 1] * 100 + q[:, 2]) == k].mean(0)
    dist = np.abs(a - ground).max(2); ink = dist > 40
    cov = float(ink.mean())
    ys, xs = np.nonzero(ink)
    if len(xs) == 0: xs, ys = np.array([W // 2]), np.array([H // 2])
    # densest cell on a 6 x 6 grid, its center is the panel point
    gy, gx = 6, 6; best, bc = -1, (0.5, 0.5)
    for j in range(gy):
        for i in range(gx):
            cell = ink[j * H // gy:(j + 1) * H // gy, i * W // gx:(i + 1) * W // gx]
            if cell.size and cell.mean() > best: best, bc = cell.mean(), ((i + 0.5) / gx, (j + 0.5) / gy)
    # inks are read at full resolution from the solid marks only, so dots and hairlines are not averaged with the ground
    A = np.asarray(im, dtype=np.float32).reshape(-1, 3)
    if len(A) > 400000: A = A[np.random.default_rng(7).choice(len(A), 400000, replace=False)]
    dA = np.abs(A - ground).max(1); solid = dA > 40
    if solid.sum() > 50: solid = dA > max(40.0, 0.6 * float(np.percentile(dA[solid], 99)))
    pix = A[solid] if solid.sum() > 50 else (a[ink] if ink.any() else a.reshape(-1, 3))
    pal = Image.fromarray(pix.reshape(-1, 1, 3).astype(np.uint8)).quantize(5, method=Image.MEDIANCUT)
    p = pal.getpalette()[:15]; counts = sorted(pal.getcolors(), reverse=True)
    inks = [{'hex': hexs(p[i * 3:i * 3 + 3]), 'share': round(n / len(pix), 3)} for n, i in counts if n / len(pix) >= 0.04][:4]
    # a ground sample: the border pixel nearest the ground color, toward the top left
    g_uv = (0.04, 0.04)
    lum = float((a * [0.2126, 0.7152, 0.0722]).sum(2).mean())
    return {'w': w, 'h': h, 'ground': hexs(ground), 'coverage': round(cov, 3), 'dense': bc, 'centroid': (float(xs.mean() / W), float(ys.mean() / H)),
            'inks': inks, 'ground_uv': g_uv, 'dark': lum < 90}

def justify(aspects, width=W_U - 2 * MARGIN, target=300.0):
    """split the figures, in order, into full-width rows; every row keeps its figures' proportions.
    The split whose row heights sit closest to the target wins, so no row is left short."""
    n = len(aspects); best = None
    for mask in range(1 << (n - 1)):
        rows, row = [], [0]
        for i in range(1, n):
            if mask >> (i - 1) & 1: rows.append(row); row = [i]
            else: row.append(i)
        rows.append(row)
        hs = [(width - GUT * (len(r) - 1)) / sum(aspects[k] for k in r) for r in rows]
        H = sum(hs) + GUT * (len(rows) - 1) + 2 * MARGIN
        cost = sum(abs(math.log(h / target)) for h in hs) + 0.6 * max(0, math.log(H / W_U / 1.6)) + 0.6 * max(0, math.log(0.55 * W_U / H))
        if best is None or cost < best[0]: best = (cost, rows, hs)
    _, rows, hs = best; out, y = {}, MARGIN
    for r, h in zip(rows, hs):
        x = MARGIN
        for k in r: out[k] = (x, y, aspects[k] * h, h); x += aspects[k] * h + GUT
        y += h + GUT
    return out, y - GUT + MARGIN

def short4(name):
    w = re.sub(r'[^A-Za-z ]', '', name).upper().split()
    s = ''.join(x[0] for x in w)[:4]
    if len(s) < 4: s = (s + re.sub(r'[AEIOU ]', '', ''.join(w))[1:])[:4]
    return (s + 'XXXX')[:4]

def clip(s, n=46):
    s = re.sub(r'\s+', ' ', s or '').strip(); return s if len(s) <= n else s[:n - 1].rstrip() + '…'

def plate(p):
    d = os.path.join(TT, 'plates', p['slug']); figs = sorted(glob.glob(os.path.join(d, 'f[0-9][0-9].jpg')))
    assert len(figs) == len(p['panels']), (p['slug'], len(figs), len(p['panels']))
    M = [measure(f) for f in figs]
    n = len(M); target = 330 if n <= 2 else 270 if n <= 4 else 220 if n <= 7 else 190
    box, H = justify([m['w'] / m['h'] for m in M], target=target)
    panels = []
    for i, (pid, m) in enumerate(zip(p['panels'], M)):
        r = REC.get(pid, {}); row = WROW.get(pid, {})
        src = row.get('href') or ''
        x, y, w, h = box[i]
        panels.append({'src': os.path.basename(figs[i]), 'id': pid, 'acc': r.get('acc'), 'title': clip(r.get('title') or row.get('title') or pid, 80),
                       'x': round(x, 2), 'y': round(y, 2), 'w': round(w, 2), 'h': round(h, 2), 'source': row.get('sub_source') or row.get('source') or '', 'href': src,
                       'a': round(m['w'] / m['h'], 5), 'ground': m['ground'], 'coverage': m['coverage'], 'inks': m['inks']})
    U = lambda x: round(x / W_U, 4); V = lambda y: round(y / H, 4)
    rid, rname = p['read']['id'], p['read']['name']; sh = short4(rname)
    pts = []
    for i, (pn, m) in enumerate(zip(panels, M)):
        if i >= 8: break
        cx, cy = pn['x'] + pn['w'] * m['dense'][0], pn['y'] + pn['h'] * m['dense'][1]
        pts.append({'pi': i, 'ru': round(m['dense'][0], 4), 'rv': round(m['dense'][1], 4), 'u': U(cx), 'v': V(cy), 'd': sh, 'label': f"{clip(pn['title'], 40)} · {round(m['coverage'] * 100)}% ink", 't': rid, 'dir': [1 if m['dense'][0] >= 0.5 else -1, 1 if m['dense'][1] >= 0.5 else -1]})
    big = max(range(n), key=lambda i: panels[i]['w'] * panels[i]['h']); pb, mb = panels[big], M[big]
    if mb['inks']:
        pts.append({'pi': big, 'ru': round(mb['centroid'][0], 4), 'rv': round(mb['centroid'][1], 4), 'u': U(pb['x'] + pb['w'] * mb['centroid'][0]), 'v': V(pb['y'] + pb['h'] * mb['centroid'][1]), 'd': 'INK', 'label': f"Lead ink · {mb['inks'][0]['hex']} · {round(mb['inks'][0]['share'] * 100)}% of ink", 't': 'ink-palette', 'dir': [1, -1]})
    pts.append({'pi': big, 'ru': 0.03, 'rv': 0.03, 'u': U(pb['x'] + pb['w'] * 0.03), 'v': V(pb['y'] + pb['h'] * 0.03), 'd': 'GRND', 'label': f"Ground · {mb['ground']}", 't': 'figure-ground', 'dir': [-1, -1]})
    # the layout point sits in the first gutter (or the top margin when the first row holds one figure)
    b0 = panels[0]; same = [pn for pn in panels if abs(pn['y'] - b0['y']) < 0.5]
    lu = (b0['x'] + b0['w'] + GUT / 2) if len(same) > 1 else W_U / 2; lv = (b0['y'] + b0['h'] / 2) if len(same) > 1 else MARGIN / 2
    pts.append({'lay': 1, 'u': U(lu), 'v': V(lv), 'd': 'LAYT', 'label': f"Margin {int(MARGIN)} u · gutter {int(GUT)} u", 't': 'plate-layout', 'dir': [1, 1]})
    # inks across the plate
    allinks = {}
    for m in M:
        for k in m['inks']: allinks[k['hex']] = allinks.get(k['hex'], 0) + k['share'] * m['coverage']
    lead = sorted(allinks.items(), key=lambda kv: -kv[1])[:6]
    grounds = sorted({m['ground'] for m in M})
    dark = sum(m['dark'] for m in M) > n / 2
    sources = []
    for pn in panels:
        s = pn['source'] or ''
        if s and s not in [x['source'] for x in sources]: sources.append({'source': s, 'href': pn['href']})
    meanc = sum(m['coverage'] for m in M) / n
    body = [p['read']['implementation'],
            f"{n} figure{'s' if n != 1 else ''}, kept at their own proportions and set in justified rows. Ink covers {round(meanc * 100)}% of a figure on average; the lead inks are {', '.join(h for h, _ in lead[:3])}."]
    spec = {
        'reference': {'file': None, 'px': [int(W_U), int(round(H))], 'grammar': p['lede']},
        'units': 'design units, 1000 = plate width',
        'palette': {'grounds': grounds, 'inks': [h for h, _ in lead]},
        'techniques': [
            {'id': rid, 'short': sh, 'name': rname, 'layer': 1, 'pass': 1, 'atoms': [p['family']],
             'params': {'figures': n, 'family': p['family'], 'panels': [{'title': pn['title'], 'coverage': pn['coverage'], 'ground': pn['ground']} for pn in panels]},
             'implementation': p['read']['implementation']},
            {'id': 'ink-palette', 'short': 'INK', 'name': 'Measured inks', 'layer': 2, 'pass': 2, 'atoms': ['palette'],
             'params': {'inks': [{'hex': h, 'weight': round(v, 4)} for h, v in lead]},
             'implementation': 'solid ink pixels of each figure, read at full resolution, are clustered to five colors; a color is kept when it holds at least 4% of the ink.'},
            {'id': 'figure-ground', 'short': 'GRND', 'name': 'Figure and ground', 'layer': 0, 'pass': 0, 'atoms': ['ground', 'coverage'],
             'params': {'grounds': grounds, 'ink_threshold': 40, 'coverage_mean': round(meanc, 3)},
             'implementation': 'The ground is the most common border color of a figure; ink is every pixel more than 40 levels from it.'},
            {'id': 'plate-layout', 'short': 'LAYT', 'name': 'Justified plate', 'layer': 3, 'pass': 3, 'atoms': ['grid'],
             'params': {'row_height_u': {'value': target, 'range': [120, 600], 'step': 1}, 'gutter_u': {'value': GUT, 'range': [0, 80], 'step': 1},
                        'margin_u': {'value': MARGIN, 'range': [0, 120], 'step': 1}, 'rule_u': {'value': 0.8, 'range': [0, 4], 'step': 0.1}, 'height_u': round(H, 1)},
             'implementation': 'Figures keep their proportions and share a row height; each row fills the plate width. Every split of the figures into rows is tried, and the one whose row heights sit closest to the target wins.',
             'limits': 'Margin, gutter and row height re-lay the plate; the plate keeps its height, so a taller layout is scaled down to fit.'}],
        'pass_order': ['ground · plate', 'figures · justified rows', 'read · points measured from each figure'],
        'notes': ['Sources: ' + '; '.join(x['source'] + (' (' + x['href'] + ')' if x['href'] else '') for x in sources)] if sources else []}
    data = {'id': p['slug'], 'code': p['code'], 'fig': '4.' + str(int(p['code'][3:])), 'title': p['title'], 'kicker': p['code'] + ' · ' + p['family'], 'family': p['family'],
            'lede': p['lede'], 'body': body, 'source': (sources[0]['source'] if sources else 'Isolated figures') + (f" and {len(sources) - 1} more" if len(sources) > 1 else ''),
            'spot': [int(lead[0][0][i:i + 2], 16) for i in (1, 3, 5)] if lead else [20, 20, 20], 'ref': {'w': int(W_U), 'h': int(round(H))},
            'variantLabel': 'Ground',
            'refHint': 'The figures are the reference: each is shown as found, at its own proportions. Their sources are in the spec.',
            'colorHint': 'Paper is the plate ground; Rule is the hairline around each figure.',
            'variants': [{'id': 'white', 'label': 'White', 'sw': ['#FFFFFF'] + [h for h, _ in lead[:3]], 'spot': [20, 20, 20], 'paper': '#FFFFFF', 'rule': '#D9D9DC'},
                         {'id': 'ink', 'label': 'Ink', 'sw': ['#101014'] + [h for h, _ in lead[:3]], 'spot': [240, 240, 240], 'paper': '#101014', 'rule': '#2A2A30'}],
            'points': pts, 'spec': spec, 'panels': panels}
    if dark: data['variants'].reverse()
    js = '/* generated by _build/plates.py from _build/plates.json and the figures in this folder. Edit those, not this file. */\n'
    js += 'window.STUDY=' + json.dumps(data, ensure_ascii=False) + ';\n' + RENDER
    open(os.path.join(d, 'study.js'), 'w', encoding='utf8').write(js)
    return data, sources

RENDER = r"""(function(S){
  /* the figures are loaded once and drawn at their boxes; margin, gutter and row height re-lay the plate here with the
     same row search _build/plates.py uses, so the defaults reproduce the measured layout exactly */
  var cache={}, P=null, H0=S.ref.h;
  function load(src){ if(!cache[src])cache[src]=new Promise(function(res){ var im=new Image(); im.onload=function(){ res(im); }; im.onerror=function(){ res(null); }; im.src=src; }); return cache[src]; }
  var LP=(S.spec.techniques.filter(function(t){ return t.id==='plate-layout'; })[0]||{}).params||{};
  function val(o,k){ return o&&typeof o[k]==='number'?o[k]:(LP[k]&&typeof LP[k]==='object'?LP[k].value:LP[k]); }
  function layout(o){
    var g=val(o,'gutter_u'), m=val(o,'margin_u'), tg=val(o,'row_height_u'), A=S.panels.map(function(p){ return p.a; }), n=A.length, W=Math.max(40,1000-2*m), best=null;
    for(var mask=0;mask<(1<<(n-1));mask++){ var rows=[], row=[0];
      for(var i=1;i<n;i++){ if(mask>>(i-1)&1){ rows.push(row); row=[i]; } else row.push(i); } rows.push(row);
      var hs=rows.map(function(r){ var sa=0; r.forEach(function(k){ sa+=A[k]; }); return (W-g*(r.length-1))/sa; });
      if(hs.some(function(h){ return h<=1; }))continue;
      var Ht=hs.reduce(function(s,h){ return s+h; },0)+g*(rows.length-1)+2*m;
      var cost=hs.reduce(function(s,h){ return s+Math.abs(Math.log(h/tg)); },0)+0.6*Math.max(0,Math.log(Ht/1000/1.6))+0.6*Math.max(0,Math.log(0.55*1000/Ht));
      if(!best||cost<best.cost-1e-9)best={cost:cost,rows:rows,hs:hs,H:Ht}; }
    var B=[], y=m; best.rows.forEach(function(r,j){ var x=m, h=best.hs[j]; r.forEach(function(k){ B[k]={x:x,y:y,w:A[k]*h,h:h}; x+=A[k]*h+g; }); y+=h+g; });
    var s=Math.abs(best.H-H0)<1.5?1:Math.min(1,H0/best.H), ox=(1000-1000*s)/2, oy=s<1?0:(H0-best.H)/2; if(Math.abs(best.H-H0)<1.5)oy=0;
    B=B.map(function(b){ return {x:b.x*s+ox,y:b.y*s+oy,w:b.w*s,h:b.h*s}; });
    return {B:B,g:g*s,m:m,rows:best.rows};
  }
  function movePoints(L,o){ if(!P)return; (S.points||[]).slice(0,P.length).forEach(function(q,i){ var p=P[i];
      if(q.pi!=null){ var b=L.B[q.pi]; p.u=(b.x+b.w*q.ru)/1000; p.v=(b.y+b.h*q.rv)/H0; }
      else if(q.lay){ var r0=L.rows[0], b0=L.B[r0[0]]; if(r0.length>1){ p.u=(b0.x+b0.w+L.g/2)/1000; p.v=(b0.y+b0.h/2)/H0; } else { p.u=0.5; p.v=Math.max(0.01,b0.y/2/H0); }
        p.label='Margin '+Math.round(val(o,'margin_u'))+' u · gutter '+Math.round(val(o,'gutter_u'))+' u'; } }); }
  S.onPoints=function(arr){ P=arr; };
  S.relayPoints=function(O){ var o=(O&&O['plate-layout'])||{}; movePoints(layout(o),o); };
  S.render=function(canvas,w,h,dpr,V,done,O){
    var x=canvas.getContext('2d'), W=canvas.width, H=canvas.height, u=W/1000, v=H/H0, o=(O&&O['plate-layout'])||{}, L=layout(o), rule=val(o,'rule_u');
    x.setTransform(1,0,0,1,0,0); x.fillStyle=V.paper; x.fillRect(0,0,W,H);
    Promise.all(S.panels.map(function(p){ return load(p.src); })).then(function(ims){
      x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high';
      S.panels.forEach(function(p,i){ var im=ims[i], b=L.B[i]; var X=Math.round(b.x*u), Y=Math.round(b.y*v), PW=Math.round(b.w*u), PH=Math.round(b.h*v);
        if(im)x.drawImage(im,X,Y,PW,PH); if(rule>0){ x.strokeStyle=V.rule; x.lineWidth=Math.max(1,u*rule); x.strokeRect(X+0.5,Y+0.5,PW-1,PH-1); } });
      if(done)done(); });
  };
})(window.STUDY);
"""

def main():
    entries, mapping, parts = [], {}, []
    for p in CFG['plates']:
        data, sources = plate(p)
        entries.append("    { id:%s, section:'plates', code:%s, family:%s, path:%s, title:%s, sub:%s, techniques:%s, variants:%s }" % (
            json.dumps(p['slug']), json.dumps(p['code']), json.dumps(p['family']), json.dumps('plates/' + p['slug'] + '/'), json.dumps(p['title'], ensure_ascii=False),
            json.dumps(p['lede'] + ' ' + str(len(p['panels'])) + (' figures.' if len(p['panels']) != 1 else ' figure.'), ensure_ascii=False),
            json.dumps([p['read']['id'], 'ink-palette', 'figure-ground', 'plate-layout']), json.dumps([v['sw'] for v in data['variants']])))
        mapping.setdefault(p['read']['id'], {'name': p['read']['name'], 'family': p['family']})
        for pid in p['panels']:
            row = WROW.get(pid)
            if row is None: continue
            if not row.get('sub_source'): row['sub_source'] = row.get('source') or ''
            if not row.get('sub'): row['sub'] = 'From ' + row['sub_source'] if row['sub_source'] else ''
            row['source'] = 'techniques-templates/plates/' + p['slug'] + '/' + pid.split(':', 1)[1].replace('/', '-')
        parts.append({'source': 'techniques-templates/plates/' + p['slug'] + '/', 'work': 'tt:' + p['slug']})
    # entries.js: replace the plates rows
    ep = os.path.join(TT, '_shared', 'entries.js'); s = open(ep, encoding='utf8').read()
    s = re.sub(r"\n    \{ id:[\'\"]pl-[^\n]*", '', s)
    if "id:'plates'" not in s:
        s = s.replace("    { id:'templates',", "    { id:'plates',     title:'Plates', blurb:'Figures lifted out of pages across the work, grouped and read: each plate is measured for ground, ink and placement, and every figure links to its source.' },\n    { id:'templates',", 1)
    i = s.rindex('\n  ]'); s = s[:i] + ',\n' + ',\n'.join(entries) + s[i:]
    s = s.replace('},,\n', '},\n')
    open(ep, 'w', encoding='utf8').write(s)
    # registry map: the plate terms
    rp = os.path.join(HERE, 'registry-map.json'); R = json.load(open(rp)); E = R['entries']
    member = lambda t: any(t in e['members'] for e in E.values())
    if 'plate-read' not in E: E['plate-read'] = {'name': 'Measured read of a figure', 'family': 'data-display', 'members': []}
    for t in ('tt:ink-palette', 'tt:figure-ground', 'tt:plate-layout'):
        if not member(t): E['plate-read']['members'].append(t)
    for rid, m in mapping.items():
        t = 'tt:' + rid
        if member(t): continue
        if rid in E: E[rid]['members'].append(t)
        else: E[rid] = {'name': m['name'], 'family': m['family'], 'members': [t]}
    json.dump(R, open(rp, 'w'), indent=1, ensure_ascii=False); open(rp, 'a').write('\n')
    # library: figures are parts of their plate
    json.dump(WORKS, open(os.path.join(LIB, 'works.json'), 'w'), indent=1, ensure_ascii=False); open(os.path.join(LIB, 'works.json'), 'a').write('\n')
    edp = os.path.join(LIB, 'editions.json'); ED = json.load(open(edp))
    ED['parts'] = [x for x in ED.get('parts', []) if not str(x.get('source', '')).startswith('techniques-templates/plates/')] + parts
    json.dump(ED, open(edp, 'w'), indent=1, ensure_ascii=False); open(edp, 'a').write('\n')
    print('plates', len(entries), 'figures', sum(len(p['panels']) for p in CFG['plates']))

if __name__ == '__main__':
    main()
