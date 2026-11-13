#!/usr/bin/env python3
"""make_study.py pNN [pNN ...|all] [--out DIR] [--of N] — write a Technique Studies page for a measured plate.

  python3 make_study.py p04        ->  /home/claude/tools/technique-studies/st-16-<slug>.html

ST number = 12 + plate number for p01..p21, 11 + plate number for p23..p28 (there is no p22).

The page is the ST-11 read-plate shell, byte for byte (fonts, CSS, body markup, runtime script are cut out of
technique-studies/st-11-gradient-by-number.html at build time), with four things put into it:
  1. the engine, inlined: src/util.js, src/<plate>_*.js (a LUT, if any), src/<plate>.js, src/metrics.js;
  2. a bridge script (window.__MP) that gives the shell a `live` object: draws the plate, runs the benchmark,
     runs Motion (plate.motion) and Live (plate.live) when their toolbar toggles are on;
  3. window.STUDY, written from the plate's own record (study, params, palettes, presets, passes, measured, bench);
  4. a short script after the shell runtime that lays out color chips, presets, grouped sliders and the fidelity block.
Nothing is fetched at run time and no reference pixels are embedded: only refstats/<plate>.json (numbers).
Two runs over the same sources write identical bytes.
"""
import asyncio, base64, json, os, re, subprocess, sys

R = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.join(os.path.dirname(R), 'tools')
ST_DIR = os.path.join(TOOLS, 'technique-studies')
SHELL_SRC = ['/home/claude/plates/shell/st-11-gradient-by-number.html', '/home/claude/plates/shell/st-10-stirred-mesh-gradient.html']   # the ST read-plate shell as of f5cb3dd; techniques-templates/_build/studies.mjs ports the result onto the T&T shell
CHROME = '/usr/bin/google-chrome'
CHROME_ARGS = ['--force-color-profile=srgb', '--no-sandbox']
OF = 39                       # last sheet in the series (ST-39)
GENERATOR = 'plates/make_study.py'
D_CODES = {'KEY', 'FORM', 'TEX', 'MARK', 'COL', 'GRND', 'TONE', 'FILL', 'TYPE', 'READ'}

rd = lambda p: open(p, encoding='utf8').read()


def warn(pid, msg):
    print('  [warn] %s: %s' % (pid, msg), file=sys.stderr)


# ------------------------------------------------------------------ ids, files
def plate_no(arg):
    m = re.fullmatch(r'p0*(\d+)', arg.strip().lower())
    if not m: raise SystemExit('not a plate id: %r (want pNN)' % arg)
    return int(m.group(1))


def st_no(n):
    if 1 <= n <= 21: return 12 + n
    if 23 <= n <= 28: return 11 + n
    raise SystemExit('plate %d has no ST number (p01..p21 -> ST-13..33, p23..p28 -> ST-34..39)' % n)


def plate_files(n):
    """the plate's own sources, in load order: its helper files (LUTs), then the engine"""
    for stem in ('p%02d' % n, 'p%d' % n):
        f = os.path.join(R, 'src', stem + '.js')
        if os.path.exists(f) and len(rd(f).strip()) > 0:
            extras = sorted(x for x in os.listdir(os.path.join(R, 'src')) if re.fullmatch(re.escape(stem) + r'_\w+\.js', x))
            return stem, [os.path.join(R, 'src', x) for x in extras] + [f]
    raise SystemExit('no engine for plate %d: src/p%02d.js is missing or empty' % (n, n))


def all_plates():
    out = set()
    for x in os.listdir(os.path.join(R, 'src')):
        m = re.fullmatch(r'p0*(\d+)\.js', x)
        if m and len(rd(os.path.join(R, 'src', x)).strip()) > 0 and (1 <= int(m.group(1)) <= 21 or 23 <= int(m.group(1)) <= 28): out.add(int(m.group(1)))
    return sorted(out)


# ------------------------------------------------------------------ plate record (read in a real browser, so any engine loads)
async def read_plate(n, files):
    from playwright.async_api import async_playwright
    meta = os.path.join(R, 'src', 'meta.js')
    tags = ['<script>%s</script>' % inline_js(rd(os.path.join(R, 'src', 'util.js')))]
    tags += ['<script>%s</script>' % inline_js(rd(f)) for f in files]
    tags.append('<script>window.__own=PLATES.map(p=>[p.id,Object.keys(p)]);</script>')
    if os.path.exists(meta): tags.append('<script>%s</script>' % inline_js(rd(meta)))     # p1..p4 keep passes/presets/limits there
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=CHROME_ARGS)
        pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content('<!doctype html><meta charset="utf-8"><body>' + '\n'.join(tags))
        res = await pg.evaluate("""(n)=>{ if(typeof PLATES==='undefined'||!PLATES.length) return null;
          const pl=PLATES.find(p=>new RegExp('^p0*'+n+'$').test(p.id))||PLATES[PLATES.length-1];
          const own=(window.__own.find(o=>o[0]===pl.id)||[0,[]])[1];
          const data=JSON.parse(JSON.stringify(pl,(k,v)=>typeof v==='function'?undefined:(typeof v==='number'&&!isFinite(v)?null:v)));
          return {plate:data, fromMeta:Object.keys(data).filter(k=>!own.includes(k)), hasRender:typeof pl.render==='function'}; }""", n)
        await b.close()
    if not res: raise SystemExit('p%d: the engine did not push a plate (%s)' % (n, '; '.join(errs) or 'PLATES is empty'))
    if not res['hasRender']: raise SystemExit('p%d: the plate has no render()' % n)
    return res['plate'], res['fromMeta'], errs


def load_refstats(stem, pl):
    names = [stem, pl['id']]
    f = next((os.path.join(R, 'refstats', x + '.json') for x in names if os.path.exists(os.path.join(R, 'refstats', x + '.json'))), None)
    if not f:                                              # the harness makes it: same code, same reference
        subprocess.run([sys.executable, os.path.join(R, 'bench.py'), pl['id']], cwd=R, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        f = next((os.path.join(R, 'refstats', x + '.json') for x in names if os.path.exists(os.path.join(R, 'refstats', x + '.json'))), None)
    if not f: raise SystemExit('%s: no refstats/%s.json — run `cd %s && python3 bench.py %s` first' % (pl['id'], pl['id'], R, pl['id']))
    ref = json.load(open(f)); items = (pl.get('bench') or {}).get('items') or []
    bad = len(ref) != len(items)
    for it, r in zip(items, ref):
        m = it.get('m', [])
        if ('spec' in m) != ('spec' in r) or ('ac' in m) != ('ac' in r): bad = True
        if 'ac' in r and len(r['ac'].get('x', [])) != it.get('lags', 8): bad = True
        if ('inks' in it) != ('inks' in r) or ('inks' in r and len(r['inks']) != len(it['inks'])): bad = True
    if bad: warn(pl['id'], 'refstats/%s does not fit the plate\'s bench items — rerun bench.py %s, then this' % (os.path.basename(f), pl['id']))
    return ref


# ------------------------------------------------------------------ fonts
def harness_faces():
    """the faces dev.html gives the engines: {family: {weight: file}}. The page must offer the same set, or type would rasterize differently."""
    faces = {}
    dev = os.path.join(R, 'dev.html')
    if os.path.exists(dev):
        for m in re.finditer(r'@font-face\s*\{([^}]*)\}', rd(dev)):
            fam = re.search(r'font-family\s*:\s*["\']([^"\']+)["\']', m.group(1)); src = re.search(r'url\(([^)]+)\)', m.group(1)); wt = re.search(r'font-weight\s*:\s*(\d+)', m.group(1))
            if fam and src and os.path.exists(os.path.join(R, src.group(1).strip('"\''))): faces.setdefault(fam.group(1), {})[int(wt.group(1)) if wt else 400] = src.group(1).strip('"\'')
    base = 'fonts/x_fontsource-%s-5.3.0/package/files/%s-latin-%d-normal.woff2'
    for fam, slug, wts in (('Anton', 'anton', [400]), ('Archivo Black', 'archivo-black', [400]), ('Archivo', 'archivo', [600, 700]), ('JetBrains Mono', 'jetbrains-mono', [400])):
        if fam not in faces:
            for w in wts:
                if os.path.exists(os.path.join(R, base % (slug, slug, w))): faces.setdefault(fam, {})[w] = base % (slug, slug, w)
    return faces


def plate_fonts(src):
    """[(family, weight, file)] for the faces this engine's source asks for"""
    out = []
    for fam, by_wt in sorted(harness_faces().items()):
        hits = [m.start() for m in re.finditer(r'["\']' + re.escape(fam) + r'["\']', src)]
        if not hits: continue
        want, unsure = set(), False
        for i in hits:
            head = src[max(0, i - 90):i]; head = head[max(head.rfind('`'), head.rfind('font ='), head.rfind('font=')) + 1:]
            w = re.findall(r'(?<![\w.])([1-9]00)(?![\w.])', head)
            if w and int(w[-1]) in by_wt: want.add(int(w[-1]))
            elif 'bold' in head and 700 in by_wt: want.add(700)
            elif len(by_wt) == 1: want.add(next(iter(by_wt)))
            else: unsure = True
        if unsure: want = set(by_wt)
        out += [(fam, w, by_wt[w]) for w in sorted(want)]
    return out


def font_face(fam, wt, path):
    b = base64.b64encode(open(os.path.join(R, path), 'rb').read()).decode()
    return '@font-face{font-family:"%s";font-weight:%d;font-style:normal;font-display:block;src:url(data:font/woff2;base64,%s) format("woff2");}' % (fam, wt, b)


# ------------------------------------------------------------------ small text tools
def inline_js(s): return re.sub(r'</(script)', r'<\\/\1', s, flags=re.I)
def slugify(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
def esc_html(s): return str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
def sentence(s):
    w = s.split(' ')
    return ' '.join(x if (i == 0 or (x.isupper() and len(x) > 1)) else x.lower() for i, x in enumerate(w))
STOP = set('the a an of and or to in on at by for with from into over under its it is are as that this than then per each one two all not no off out up down more less how what which where plate render reference'.split())
def toks(s):
    out = set()
    for w in re.findall(r'[a-z]+', re.sub(r'([a-z])([A-Z])', r'\1 \2', str(s)).lower()):
        if len(w) < 3 or w in STOP: continue
        out.add(w[:-1] if len(w) > 3 and w.endswith('s') and not w.endswith('ss') else w)
    return out
CLASS_WORDS = [('TYPE', 'type text letter lettering headline copy word glyph'), ('COL', 'color colour ink palette hue tint'), ('TONE', 'tone light exposure contrast glow bloom shade'),
               ('TEX', 'texture grain fabric weave paper noise screen cloth print dither halftone stipple canvas dot speck tooth'), ('GRND', 'ground background field sky'),
               ('MARK', 'mark stroke line brush dab fault scratch hatch'), ('FORM', 'layout form shape geometry composition picture land burst figure lattice grid panel')]
def class_of(text):
    t = toks(text)
    for code, words in CLASS_WORDS:
        if t & toks(words): return code
    return 'KEY'


# ------------------------------------------------------------------ JS literal writer (house style: bare keys, single quotes)
class Raw(str): pass
IDENT = re.compile(r'^[A-Za-z_$][A-Za-z0-9_$]*$')
def jstr(s):
    s = str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('\r', '').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029').replace('</', '<\\/')
    return "'" + s + "'"
def jkey(k): return k if IDENT.match(k) else jstr(k)
def js1(v):
    if isinstance(v, Raw): return str(v)
    if v is None: return 'null'
    if v is True: return 'true'
    if v is False: return 'false'
    if isinstance(v, int): return str(v)
    if isinstance(v, float): return str(int(v)) if v == int(v) and abs(v) < 1e15 else json.dumps(v)
    if isinstance(v, str): return jstr(v)
    if isinstance(v, (list, tuple)): return '[' + ','.join(js1(x) for x in v) + ']'
    if isinstance(v, dict): return '{ ' + ', '.join(jkey(k) + ':' + js1(x) for k, x in v.items()) + ' }' if v else '{}'
    raise TypeError(type(v))
def js(v, ind=0, width=150):
    one = js1(v)
    if not isinstance(v, (list, tuple, dict)) or isinstance(v, Raw) or len(one) + ind <= width or not v: return one
    pad = ' ' * (ind + 2)
    if isinstance(v, dict): return '{\n' + ',\n'.join(pad + jkey(k) + ':' + js(x, ind + 2, width) for k, x in v.items()) + '\n' + ' ' * ind + '}'
    return '[\n' + ',\n'.join(pad + js(x, ind + 2, width) for x in v) + '\n' + ' ' * ind + ']'
def json_inline(o): return json.dumps(o, separators=(',', ':'), ensure_ascii=False).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


# ------------------------------------------------------------------ study copy (the plate's own, or a stand-in so the build never stops)
METRIC_NAMES = {'hist': 'tone histogram', 'mean': 'mean luminance', 'std': 'contrast', 'spec': 'texture spectrum', 'ac': 'autocorrelation', 'ink': 'ink color', 'share': 'ink coverage'}
def stand_in(pl):
    pid, W, H = pl['id'], pl['ref']['w'], pl['ref']['h']
    line, passes, params = pl.get('line') or pl['title'], pl.get('passes') or [], pl.get('params') or []
    head = re.split(r'[,;:]| — ', line)[0].strip().rstrip('.')
    groups = []
    for p in params:
        if p.get('group') and p['group'] not in groups: groups.append(p['group'])
    b2 = []
    if passes: b2.append('The rebuild runs %d passes in order: %s.' % (len(passes), '; '.join(x.rstrip('.') for x in passes)))
    b2.append('%d sliders%s, %d palettes and %d presets drive the engine, and the match is measured in the page against statistics read from the reference.' % (len(params), (' in %d groups (%s)' % (len(groups), ', '.join(g.lower() for g in groups))) if groups else '', len(pl.get('palettes') or []), len(pl.get('presets') or [])))
    method = ' · '.join(re.split(r'[,:;(]', x)[0].strip() for x in passes[:6]) if passes else ' · '.join(groups) or pl['title']
    pts = []
    for it in ((pl.get('bench') or {}).get('items') or [])[:10]:
        x, y, w, h = it['out']
        pts.append({'u': (x + w / 2) / W, 'v': (y + h / 2) / H, 'label': '%s · benchmark patch %d × %d px, scored on %s' % (it['name'][:1].upper() + it['name'][1:], w, h, ', '.join(METRIC_NAMES.get(m, m) for m in it.get('m', [])))})
    fill = ['Pass %d · %s' % (i + 1, x) for i, x in enumerate(passes)] or ['%s · %s' % (p['label'], p.get('why', '')) for p in params] or [pl['title']]
    cands = [((i + .5) / 5, (j + .5) / 5) for j in range(5) for i in range(5)]
    k = 0
    while len(pts) < 10:
        best = max(cands, key=lambda c: (min([(c[0] - p['u']) ** 2 + (c[1] - p['v']) ** 2 for p in pts] or [1]), -cands.index(c)))
        pts.append({'u': best[0], 'v': best[1], 'label': fill[k % len(fill)]}); cands.remove(best); k += 1
    return {'slug': slugify(pl['title']), 'lede': (head if len(head) <= 64 else sentence(pl['title'])) + '.', 'body': [line, ' '.join(b2)], 'method': method[:1].upper() + method[1:], 'points': pts}


def build_study(pl, n):
    pid = pl['id']; sd = dict(pl.get('study') or {})
    if not pl.get('study'): warn(pid, 'no study block yet — lede, body, method and the ten read points are stand-ins made from title/line/passes/bench')
    fb = stand_in(pl)
    for k in ('slug', 'lede', 'body', 'method', 'points'):
        if not sd.get(k):
            if pl.get('study'): warn(pid, 'study.%s is missing — using a stand-in' % k)
            sd[k] = fb[k]
    if isinstance(sd['body'], str): sd['body'] = [sd['body']]
    sd['title'] = sd.get('title') or sentence(pl['title'])
    sd['method'] = sd['method'][:1].upper() + sd['method'][1:]
    if len(sd['lede']) > 64: warn(pid, 'study.lede is %d characters; the shell sets it as the headline (36 px, 16 ch wide) — ST-10 and ST-11 use 45 and 41, past ~60 it runs to five lines and more' % len(sd['lede']))
    sd['slug'] = slugify(sd['slug'])
    pts = [dict(p) for p in sd['points'] if isinstance(p, dict) and 'u' in p and 'v' in p][:10]
    if len(pts) != 10: warn(pid, 'study.points has %d usable points, the read wants 10' % len(pts))
    W, H = pl['ref']['w'], pl['ref']['h']
    cap = max(40, int((min(660, 532 * W / H) - 20) / 6.8))     # what the shell's one-line tag on the figure holds at 1440 x 900
    for p in pts:
        u, v = p['u'], p['v'] = min(1, max(0, float(p['u']))), min(1, max(0, float(p['v'])))
        p['label'] = ' '.join(str(p.get('label') or '').split())
        if len(p['label']) > cap:                               # the tag gets a cut, the read panel gets the whole sentence (note)
            cut = p['label'][:cap - 1]; cut = cut[:cut.rfind(' ')] if cut.rfind(' ') > cap * .6 else cut
            p['note'] = p['label']; p['label'] = cut.rstrip(' ·,;:—-(') + '…'
        sg = lambda x: (x > 0) - (x < 0)
        d = [sg(x) for x in p['dir']] if (isinstance(p.get('dir'), list) and len(p['dir']) == 2 and all(isinstance(x, (int, float)) for x in p['dir'])) else [0, 0]
        if d == [0, 0]: d = [-1 if u < .5 else 1, -1 if v < .35 else (1 if v > .65 else 0)]      # the shell's default: away from the middle
        if (d[0] < 0 and u < .22) or (d[0] > 0 and u > .78): d[0] = -d[0]                         # turned inward at an edge, so the number stays in the frame on a phone
        if (d[1] < 0 and v < .08) or (d[1] > 0 and v > .92): d[1] = -d[1]
        p['dir'] = d
    sd['points'] = pts
    return sd


def build_techniques(pl, sd):
    """spec.techniques[] so that every point's t resolves and every technique is cited (the read-plate rule)."""
    pid, params, passes, pts = pl['id'], pl.get('params') or [], pl.get('passes') or [], sd['points']
    groups = []
    for p in params:
        g = p.get('group') or 'Parameters'
        if g not in groups: groups.append(g)
    in_group = lambda g: [p for p in params if (p.get('group') or 'Parameters') == g]
    def pass_of(name, words=frozenset()):                       # the pass that names the technique; its other words only break ties
        best, bi = 0, None
        for i, x in enumerate(passes):
            s = 4 * len(toks(x) & toks(name)) + len(toks(x) & set(words))
            if s > best: best, bi = s, i
        return bi
    techs = []
    authored = [p['t'] for p in pts if p.get('t')]
    if authored:
        ids = []
        for t in authored:
            if t not in ids: ids.append(t)
        for tid in ids:
            cite = [p for p in pts if p.get('t') == tid]
            heads = set().union(*[toks((p.get('note') or p['label']).split(' · ')[0]) for p in cite])
            g = next((g for g in groups if slugify(g) == slugify(tid)), None) or next((g for g in groups if toks(g) & toks(tid)), None)
            hit = lambda words: [p for p in params if (toks(p['key']) | toks(p['label'])) & words][:8]
            mine = in_group(g) if g else (hit(toks(tid)) or hit(heads))      # the sliders that belong to it: its group, else the ones that carry its name
            pi = pass_of(tid + ' ' + (g or ''), heads)
            d = next((p['d'] for p in cite if p.get('d')), None)
            techs.append({'id': tid, 'short': d or class_of(tid + ' ' + (g or '')), 'name': sentence(re.sub(r'[-_]+', ' ', tid)).capitalize() if tid.islower() else tid, 'pass': pi + 1 if pi is not None else None,
                          'params': {p['key']: p['def'] for p in mine}, 'implementation': cite[0].get('note') or cite[0]['label'] or (passes[pi] if pi is not None else '')})
        for p in pts:                                           # a point without t goes to the technique it reads most like
            if not p.get('t'):
                p['t'] = max(techs, key=lambda t: len((toks(t['id']) | toks(t['name']) | set().union(*[toks(k) for k in t['params']] or [set()])) & toks(p.get('note') or p['label'])))['id']
    else:
        if not groups: groups = ['Engine']
        for g in groups:
            mine = in_group(g); pi = pass_of(g, set().union(*[toks(p['label']) for p in mine] or [set()]))
            techs.append({'id': slugify(g), 'short': class_of(g), 'name': g, 'pass': pi + 1 if pi is not None else None, 'params': {p['key']: p['def'] for p in mine},
                          'implementation': ' '.join(p.get('why', '').strip() for p in mine if p.get('why')) or (passes[pi] if pi is not None else '')})
        bag = {t['id']: toks(t['name']) | set().union(*[toks(p['label']) | toks(p['key']) | toks(p.get('why', '')) for p in in_group(t['name'])] or [set()]) for t in techs}
        score = lambda p, t: len(bag[t['id']] & toks(p.get('note') or p['label']))
        count = {t['id']: 0 for t in techs}
        for p in pts:
            best = max(techs, key=lambda t: (score(p, t), -count[t['id']]))
            p['t'] = best['id']; p['_s'] = score(p, best); count[best['id']] += 1
        for t in techs:                                         # nobody cites it: hand it the weakest point of the busiest technique
            if count[t['id']] == 0 and pts:
                busy = max(count, key=lambda k: count[k]); donors = [p for p in pts if p['t'] == busy]
                if len(donors) > 1:
                    p = min(donors, key=lambda p: p['_s']); count[busy] -= 1; p['t'] = t['id']; count[t['id']] += 1
        techs = [t for t in techs if count[t['id']] > 0] or techs
        for p in pts: p.pop('_s', None)
    short = {t['id']: t['short'] for t in techs}
    for p in pts:
        if not p.get('d'): p['d'] = short.get(p['t'], 'KEY')
        p['d'] = str(p['d']).upper()
    for i, t in enumerate(techs):
        t['layer'] = i
        if t['pass'] is None: t.pop('pass')
    return [{k: t[k] for k in ('id', 'short', 'name', 'layer', 'pass', 'params', 'implementation') if k in t} for t in techs]


def pal_spec(p):
    o = {'key': p['id'], 'name': p['name']}
    if p.get('note'): o['note'] = p['note']
    o['values'] = {k: v for k, v in p.items() if k not in ('id', 'name', 'note', 'sw')}
    o['swatches'] = p.get('sw') or []
    return o


def spot_of(pl, sd):
    if isinstance(sd.get('spot'), list) and len(sd['spot']) == 3: return [int(x) for x in sd['spot']]
    pal = next((p for p in pl['palettes'] if p['id'] == (pl.get('bench') or {}).get('palette')), pl['palettes'][0])
    rgb = [[int(h[i:i + 2], 16) for i in (1, 3, 5)] for h in (pal.get('sw') or []) if re.fullmatch(r'#[0-9a-fA-F]{6}', h)]
    return max(rgb, key=lambda c: max(c) - min(c)) if rgb else [21, 20, 15]


# ------------------------------------------------------------------ the scripts that go around the shell
ADD_CSS = r"""/* measured plates (ST-13 on): the instrument. Additions only; everything above is the ST-11 shell, and each part below is cut from one of its parts:
   a group label is the track log's header row, a group break is the log's hairline, a slider is the fidelity bar with a square handle,
   presets, choices and the Motion / Live toggles are toolbar buttons, a color is a flat chip framed the way the figure is framed. */
:root{--ar:__AR__;}
.mp{grid-column:1/3;min-width:0;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);line-height:20px;font-variant-numeric:tabular-nums;}
.mp .livehud{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--grey);line-height:1.6;font-variant-numeric:tabular-nums;white-space:pre-wrap;min-height:48px;}
.mp .grp{margin-top:12px;padding-top:10px;border-top:1px solid var(--hair);min-width:0;}
.mp .gh{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin:0 0 4px;font:inherit;font-weight:400;letter-spacing:.2em;color:var(--grey);}
.mp .gh span:last-child{text-align:right;letter-spacing:.12em;} .mp .gh span.v{color:var(--ink);}
.mp .prow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 10px;align-items:baseline;color:var(--grey);margin-top:4px;}
.mp .prow .pv{color:var(--ink);text-align:right;letter-spacing:.04em;}
.mp .prow .ph{grid-column:1/3;font-family:var(--text);font-size:11px;line-height:1.45;letter-spacing:0;text-transform:none;color:var(--grey);padding-bottom:4px;}
.mp .prow input{grid-column:1/3;margin:0;width:100%;min-width:0;}
.mp .prow input[type=text]{font:inherit;font-family:var(--mono);font-size:13px;line-height:1.3;letter-spacing:.04em;text-transform:none;color:var(--ink);background:#fff;border:1px solid var(--hair);padding:5px 8px;border-radius:0;margin:2px 0 4px;}
.mp .prow input[type=text]:hover{border-color:var(--grey-2);}
.mp .prow input[type=text]:focus-visible{outline:1px solid var(--ink);outline-offset:1px;}
/* slider: a hairline for the range, a 2 px ink rule up to the value, a flat ink square on it */
.mp .prow input[type=range]{--t:9px;-webkit-appearance:none;appearance:none;height:16px;padding:0;background:transparent;border:0;border-radius:0;cursor:ew-resize;touch-action:pan-y;}
.mp .prow input[type=range]::-webkit-slider-runnable-track{height:16px;border:0;border-radius:0;background:linear-gradient(var(--ink),var(--ink)) 0 50%/calc(var(--t)/2 + (100% - var(--t))*var(--f,0)) 2px no-repeat,linear-gradient(var(--hair),var(--hair)) 0 50%/100% 1px no-repeat;}
.mp .prow input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:var(--t);height:var(--t);margin-top:calc((16px - var(--t))/2);border:0;border-radius:0;background:linear-gradient(var(--ink),var(--ink)) 50% 50%/9px 9px no-repeat;}
.mp .prow input[type=range]::-moz-range-track{height:1px;border:0;background:var(--hair);}
.mp .prow input[type=range]::-moz-range-progress{height:2px;background:var(--ink);}
.mp .prow input[type=range]::-moz-range-thumb{width:9px;height:9px;border:0;border-radius:0;background:var(--ink);}
.mp .prow input[type=range]:focus-visible{outline:1px solid var(--ink);outline-offset:2px;}
.mp .prow input[type=range]:disabled{opacity:.35;cursor:default;}
@media (pointer:coarse){ .mp .prow input[type=range]{--t:28px;height:28px;} .mp .prow input[type=range]::-webkit-slider-runnable-track{height:28px;} .mp .prow input[type=range]::-webkit-slider-thumb{margin-top:0;} }
.ctl button[hidden]{display:none;}   /* the compare button has no reference to show here; the shell hides it, and all:unset must not undo that (same line as the T&T shell) */
/* toolbar buttons inside the instrument: presets and choices */
.mp .ctl{margin:4px 0 2px;}
.mp .prow .ctl{grid-column:1/3;margin:2px 0 4px;}
/* color: one flat chip per palette; the one in use takes an ink frame at the figure's 2 px stand-off */
.mp .pal{display:flex;flex-wrap:wrap;gap:10px;padding:6px 3px 4px;}
.mp .pal button{all:unset;cursor:pointer;display:flex;border:1px solid var(--hair);outline:1px solid transparent;outline-offset:2px;}
.mp .pal button b{display:block;width:10px;height:16px;}
.mp .pal button:hover,.mp .pal button:focus-visible{border-color:var(--ink);}
.mp .pal button.on{border-color:var(--ink);outline-color:var(--ink);}
/* fidelity: the live benchmark, a ruled table in the log */
.log .fid.mpf .fr{grid-template-columns:minmax(0,1fr) auto;}
.log .fid.mpf details{margin-top:2px;}
.log .fid.mpf summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;color:var(--grey);outline:none;}
.log .fid.mpf summary::-webkit-details-marker{display:none;}
.log .fid.mpf summary::after{content:'+';color:var(--ink);}
.log .fid.mpf details[open] summary::after{content:'\2212';}
.log .fid.mpf summary:hover,.log .fid.mpf summary:focus-visible{color:var(--ink);}
.log .fid.mpf .fp{display:flex;justify-content:space-between;color:var(--grey);letter-spacing:.2em;margin-top:8px;padding-top:6px;border-top:1px solid var(--hair);}
.log .fid.mpf .fp span:last-child{letter-spacing:.12em;}
.log .fid.mpf .fmt .bar{height:1px;margin:0 0 2px;}
.log .fid.mpf .fnote{margin-top:10px;padding-top:8px;border-top:1px solid var(--hair);text-transform:none;letter-spacing:0;font-family:var(--text);font-size:11.5px;line-height:1.55;color:var(--grey);}
@media (min-width:961px){
  .log{right:22px;width:248px;padding:0 6px;overflow:hidden auto;scrollbar-width:thin;scrollbar-color:var(--grey-2) transparent;}
  .tb{max-width:100%;} .tb div:nth-child(2n+3){white-space:normal;}   /* a long method or source line wraps inside the figure column */
}
@media (max-width:960px){
  .cvwrap{position:sticky;top:0;z-index:3;background:#fff;border-bottom:1px solid var(--hair-2);height:min(70vh,calc((100vw - 58px)*var(--ar) + 68px));}
  .mp.away{padding:14px 22px 20px;border-bottom:1px solid var(--hair-2);}
}
"""

ENGINE_JS = r"""/* measured plate -> ST shell (written by plates/make_study.py). The shell's CSS and runtime are the ST-11 ones, unchanged;
   this block is the bridge. window.__MP holds the plate, its state, and mount(), which hands the shell a `live` object. */
(function () {
  "use strict";
  const PL = PLATES.find(p => p.id === __ID__) || PLATES[PLATES.length - 1];
  const REFSTATS = __REFSTATS__;
  const FONTS = __FONTS__, FILE = __FILE__, HINT = __HINT__;
  const BUDGET = 2.4e6;                                   /* most pixels a display render gets; the benchmark always runs at 1x reference size */
  const prm = k => (PL.params || []).find(p => p.key === k);
  const defaults = () => { const P = {}; (PL.params || []).forEach(p => { P[p.key] = p.def; }); (PL.texts || []).forEach(p => { P[p.key] = p.def; }); (PL.selects || []).forEach(p => { P[p.key] = p.def; }); return P; };
  const benchPal = () => PL.palettes.find(p => p.id === (PL.bench && PL.bench.palette)) || PL.palettes[0];
  const palSpec = p => { const o = { key: p.id, name: p.name }, values = {}; if (p.note) o.note = p.note; for (const k in p) if (k !== "id" && k !== "name" && k !== "note" && k !== "sw") values[k] = p[k]; o.values = values; o.swatches = p.sw || []; return o; };
  const MOTION = (Array.isArray(PL.motion) ? PL.motion : []).filter(m => m && prm(m.key) && typeof prm(m.key).def === "number");   /* parameters the Motion toggle moves */
  const AXES = PL.live && typeof PL.live === "object" ? PL.live : null;                                                               /* parameters the pointer drives in Live */
  const st = { P: defaults(), pal: benchPal(), preset: -1, want: "full", quick: false, held: false, lastSet: 0, fonts: false, bench: null, benchErr: null, benchT: 0, ms: 0, msFull: 0, px: [0, 0], msg: "", msgT: -1e9,
    motion: false, mt: 0, mNow: 0, live: false };
  const MP = window.__MP = { plate: PL, st, defaults, refstats: REFSTATS, motion: MOTION, axes: AXES, on: [], ui() {}, changed() {}, moving() {} };
  const emit = what => MP.on.forEach(f => { try { f(what); } catch (e) { console.error(e); } });
  const say = t => { st.msg = t; st.msgT = performance.now(); };
  const ready = () => { st.fonts = true; };
  Promise.all(FONTS.map(f => document.fonts.load(f))).then(ready, ready);
  const toggles = () => { const S = window.STUDY; ((S && S.controls) || []).forEach(c => { if (!c._el || !c.toggle) return; const on = c.id === "motion" ? st.motion : c.id === "live" ? st.live : false; c._el.classList.toggle("on", on); c._el.setAttribute("aria-pressed", String(on)); }); };

  /* S.spec is kept current in place, so the read panel, the spec drawer and Copy all show the live state */
  MP.sync = function () {
    const S = window.STUDY, sp = S && S.spec; if (!sp) return;
    sp.palette = palSpec(st.pal);
    if (sp.text) for (const k in sp.text) sp.text[k] = st.P[k];
    if (sp.select) for (const k in sp.select) sp.select[k] = st.P[k];
    for (const k in sp.params) sp.params[k].value = st.P[k];
    (sp.techniques || []).forEach(t => { for (const k in (t.params || {})) if (k in st.P) t.params[k] = st.P[k]; });
    const b = st.bench;
    if (b) { const lo = b.rows.reduce((a, r) => r.v < a.v ? r : a, b.rows[0]); sp.benchmark.mean = +b.mean.toFixed(4); sp.benchmark.match = "match " + (b.mean * 100).toFixed(1) + " %"; sp.benchmark.lowest = { patch: lo.patch, metric: lo.metric, score: +lo.v.toFixed(4) }; sp.benchmark.metrics = b.rows.map(r => ({ patch: r.patch, metric: r.metric, score: +r.v.toFixed(4) })); }
    else if (st.benchErr) sp.benchmark.error = st.benchErr;
    sp.state = { render_px: st.px.slice(), render_ms: st.ms, motion: st.motion, live: st.live };
  };

  /* the benchmark: default parameters, the bench palette, 1x reference size, scored by the code that measured the reference */
  MP.runBench = function () {
    try { const c = mk(4, 4), P = Object.assign(defaults(), PL.bench.params || {}); PL.render(c, P, benchPal(), 1);
      st.bench = MX.score(c.getContext("2d").getImageData(0, 0, c.width, c.height), PL.bench, REFSTATS); st.benchErr = null; }
    catch (e) { console.error(e); st.benchErr = e.message || String(e); }
    MP.sync(); emit("bench");
  };

  /* motion: each listed parameter moves around the value its slider holds. sine: value ± amp over `period` seconds; saw: value up to value + amp, then again;
     drift: a seeded walk, one step of up to amp every `period` seconds, eased between steps and folded back at the slider's ends. The sliders do not move. */
  let walks = {};
  const walk = (i, k) => { const key = i + ":" + (st.P.seed || 1), w = walks[key] || (walks[key] = [0]); while (w.length <= k) w.push(w[w.length - 1] + hashI(w.length, i * 31 + 7, (st.P.seed | 0) + 911) * 2 - 1); return w[k]; };
  const fold = (v, lo, hi) => { const r = hi - lo; if (!(r > 0)) return lo; let x = (v - lo) % (2 * r); if (x < 0) x += 2 * r; return lo + (x > r ? 2 * r - x : x); };
  const moved = (m, i, t) => { const p = prm(m.key), base = +st.P[m.key], amp = +m.amp || 0, per = Math.max(.05, +m.period || 4); let v;
    if (m.mode === "saw") { v = base + amp * ((t / per) % 1); if (v > p.max) v = p.min + (v - p.min) % (p.max - p.min); }
    else if (m.mode === "drift") { const k = Math.floor(t / per), f = t / per - k, a = walk(i, k), b = walk(i, k + 1); v = fold(base + amp * (a + (b - a) * f * f * (3 - 2 * f)), p.min, p.max); }
    else v = base + amp * Math.sin(2 * Math.PI * t / per);
    v = clamp(v, p.min, p.max); return p.step >= 1 ? p.min + Math.round((v - p.min) / p.step) * p.step : v; };       /* whole-number parameters stay whole */

  MP.mount = function (S, canvas, w, h, dpr, finish) {
    const x = canvas.getContext("2d"), buf = MP.buf || (MP.buf = mk(4, 4)), cvEl = document.getElementById("cv");     /* the engine draws on its own CPU canvas; the shell's gets a copy */
    let first = true, drag = null; st.want = "full";
    const paint = (quick, P) => {
      if (canvas.width < 8 || canvas.height < 8) return;
      const full = Math.min(canvas.width / PL.ref.w, Math.sqrt(BUDGET / (PL.ref.w * PL.ref.h))), t0 = performance.now();
      const q = st.msFull > 480 ? Math.max(.25, .5 * Math.sqrt(480 / st.msFull)) : .5;      /* half scale while something moves; a heavy engine goes down to a quarter */
      try { PL.render(buf, P || st.P, st.pal, quick ? full * q : full); } catch (e) { console.error(e); say("Render failed: " + (e.message || e)); return; }
      st.ms = Math.round(performance.now() - t0); st.px = [buf.width, buf.height]; st.quick = quick; if (!quick) st.msFull = st.ms;
      x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high"; x.drawImage(buf, 0, 0, canvas.width, canvas.height);
    };
    const done = msg => { st.want = "full"; if (msg) say(msg); MP.sync(); MP.ui(); MP.changed(); };
    /* live: a drag on the figure sets two parameters, x across and y down, each between the ends the plate names */
    const axis = (ax, f) => { if (!ax || !ax.key) return; const p = prm(ax.key), lo = ax.min != null ? +ax.min : p ? p.min : 0, hi = ax.max != null ? +ax.max : p ? p.max : 1; let v = lo + f * (hi - lo);
      if (p) { if (p.step) v = +(p.min + Math.round((v - p.min) / p.step) * p.step).toFixed(6); v = clamp(v, p.min, p.max); } st.P[ax.key] = v; };
    const drive = p => { axis(AXES.x, clamp(p.u, 0, 1)); axis(AXES.y, clamp(p.v, 0, 1)); st.preset = -1; st.lastSet = performance.now(); if (st.want !== "full") st.want = "quick"; MP.sync(); MP.ui(); };
    const pointer = (type, p, e) => {
      if (type === "down") { if (e.button) return; drag = e.pointerId; st.held = true; drive(p); }
      else if (type === "move") { if (drag !== null && drag === e.pointerId) drive(p); }
      else if ((type === "up" || type === "cancel") && drag === e.pointerId) { drag = null; st.held = false; st.want = "full"; MP.changed(); } };
    const live = {
      _st: st, dirty: false,
      get: k => st.P[k],
      set(k, v, quick) { st.P[k] = v; if (k !== "seed") st.preset = -1; st.lastSet = performance.now(); st.want = quick && st.want !== "full" ? "quick" : "full"; MP.sync(); if (!quick) { MP.ui(); MP.changed(); } },   /* quick: a slider is moving */
      commit() { st.want = "full"; MP.ui(); MP.changed(); },                                                                                  /* slider released */
      palette(id) { const p = PL.palettes.find(q => q.id === id); if (!p) return; st.pal = p; done("Color · " + p.name); },
      cyclePalette() { live.palette(PL.palettes[(PL.palettes.indexOf(st.pal) + 1) % PL.palettes.length].id); },
      preset(i) { const ps = (PL.presets || [])[i]; if (!ps) return; (PL.params || []).forEach(p => { st.P[p.key] = p.def; }); Object.assign(st.P, ps.set || {}); st.preset = i; done("Preset · " + ps.name); },
      reset() { st.P = defaults(); st.pal = benchPal(); st.preset = -1; done("Back to the measured defaults"); },
      seed() { const sp = prm("seed"); if (!sp) return; const stp = sp.step || 1, nn = Math.floor((sp.max - sp.min) / stp) + 1; let v = st.P.seed; for (let i = 0; i < 8 && v === st.P.seed; i++) v = +(sp.min + Math.floor(Math.random() * nn) * stp).toFixed(6); st.P.seed = v; done("Seed " + v); },
      motion(on) { st.motion = MOTION.length ? (on === undefined ? !st.motion : !!on) : false; if (st.motion) { st.mt = 0; st.mNow = performance.now(); walks = {}; say("Motion · " + MOTION.map(m => prm(m.key).label).join(" · ")); } else { st.want = "full"; say("Motion off"); }
        toggles(); MP.sync(); MP.ui(); return st.motion; },
      liveMode(on) { st.live = AXES ? (on === undefined ? !st.live : !!on) : false; live.pointer = st.live ? pointer : undefined; cvEl.style.touchAction = st.live ? "none" : ""; if (!st.live && drag !== null) { drag = null; st.held = false; st.want = "full"; }
        say(st.live ? "Live · drag on the figure" : "Live off"); toggles(); MP.sync(); return st.live; },
      save() { const k = Math.min(3, 2400 / Math.max(PL.ref.w, PL.ref.h)), c = mk(4, 4); try { PL.render(c, st.P, st.pal, k); } catch (e) { console.error(e); say("Could not make the image"); return; }
        c.toBlob(b => { if (!b) { say("Could not make the image"); return; } const u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = FILE + ".png"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); say("Sent " + c.width + " × " + c.height + " to your downloads"); }, "image/png"); },
      tick(now) {
        if (!st.fonts) return;
        if (st.motion && !first) {                                                           /* motion: one half-scale frame per animation frame, in real seconds */
          st.mt += Math.min(.25, Math.max(0, (now - st.mNow) / 1000)); st.mNow = now; const P = Object.assign({}, st.P); MOTION.forEach((m, i) => { P[m.key] = moved(m, i, st.mt); });
          st.want = null; paint(true, P); live.dirty = true; MP.moving(P); return; }
        if (st.want) { const q = st.want === "quick"; st.want = null; paint(q); live.dirty = true; if (!q) MP.sync();
          if (first) { first = false; finish(); if (!st.bench && !st.benchT) st.benchT = setTimeout(MP.runBench, 60); } }
        else if (st.quick && !st.held && now - st.lastSet > 260) st.want = "full";        /* a quick frame is never left standing */
      },
      key(e) { const k = (e.key || "").toLowerCase(); if (k === "m" && MOTION.length) { live.motion(); return true; } if (k === "l" && AXES) { live.liveMode(); return true; }
        if (k === "n" && "seed" in st.P) { live.seed(); return true; } if (k === "c") { live.cyclePalette(); return true; } return false; },
      hud() { return st.pal.name + ("seed" in st.P ? " · seed " + st.P.seed : "") + "\n" + st.px[0] + " × " + st.px[1] + " px · " + st.ms + " ms" + (st.motion ? " · motion" : st.quick ? " · quick" : "") + (st.live ? " · live" : "") + "\n" + (performance.now() - st.msgT < 2600 ? st.msg : HINT); },
      spec() { MP.sync(); return JSON.parse(JSON.stringify(S.spec)); }
    };
    if (st.live) { live.pointer = pointer; cvEl.style.touchAction = "none"; }
    S.live = live;
    return false;
  };
})();
"""

POST_JS = r"""/* measured plates: lay the instrument out in the shell's own parts (written by plates/make_study.py).
   Each group opens with a log header row over a hairline; colors are flat chips; presets and choices are toolbar buttons;
   every slider is the shell's own row, regrouped; the fidelity block is filled by the live benchmark. */
(function () {
  "use strict";
  const MP = window.__MP, PL = MP.plate, st = MP.st, S = window.STUDY, L = () => S.live;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const meta = document.querySelector("#copy .meta"), stage = $("stage"), logEl = $("log"), fid = $("fid"), tb = $("tb"), specEl = $("spec"), bSpec = $("bSpec");
  $("cv").style.touchAction = "";                       /* the figure takes a drag only while Live is on; otherwise a touch scrolls the page */
  const panel = el("div", "mp"), hud = $("livehud"); if (hud) panel.appendChild(hud);
  const group = (title, right) => { const g = el("div", "grp"), h = el("h2", "gh"), a = el("span", null, title), b = el("span", null, right == null ? "" : String(right)); h.appendChild(a); h.appendChild(b); g.appendChild(h); panel.appendChild(g); g.note = b; return g; };
  const btn = (text, title, fn) => { const b = el("button", null, text); b.type = "button"; if (title) b.title = title; b.onclick = fn; return b; };
  const press = (b, on) => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); };

  /* color alternates: one flat chip per palette, the name of the one in use on the header row */
  const gPal = group("Color"), palRow = el("div", "pal"); gPal.note.className = "v"; gPal.appendChild(palRow);
  const palBtns = PL.palettes.map(p => { const name = p.name + (p.note ? " · " + p.note : ""), b = btn(null, name, () => { if (L()) L().palette(p.id); }); b.setAttribute("aria-label", name); (p.sw || []).forEach(c => { const s = el("b"); s.style.background = c; b.appendChild(s); }); palRow.appendChild(b); return b; });
  /* presets */
  let gPre = null, preBtns = [];
  if ((PL.presets || []).length) { gPre = group("Presets", PL.presets.length); const row = el("div", "ctl"); gPre.appendChild(row); preBtns = PL.presets.map((ps, i) => { const b = btn(ps.name, Object.keys(ps.set || {}).map(k => k + " " + ps.set[k]).join(" · "), () => { if (L()) L().preset(i); }); row.appendChild(b); return b; }); }
  /* text and choices, then the sliders under their group names; the rows are the shell's own */
  const rowOf = p => p._el && p._el.closest(".prow"), help = (r, why) => { if (why) r.appendChild(el("span", "ph", why)); };
  const texts = (S.params || []).filter(p => p.type === "text"), nums = (S.params || []).filter(p => p.type !== "text"), choices = {};
  if (texts.length || (PL.selects || []).length) { const g = group("Content", texts.length + (PL.selects || []).length);
    texts.forEach(p => { const r = rowOf(p); if (r) { help(r, p.why); g.appendChild(r); } });
    (PL.selects || []).forEach(s => { const r = el("div", "prow"), pv = el("span", "pv"), row = el("div", "ctl"), val = o => Array.isArray(o) ? o[0] : o, lab = o => String(Array.isArray(o) ? o[1] : o); r.setAttribute("role", "group"); r.setAttribute("aria-label", s.label);
      r.appendChild(el("span", "pl", s.label)); r.appendChild(pv); const bs = (s.options || []).map(o => { const b = btn(lab(o), null, () => { if (L()) L().set(s.key, val(o)); }); row.appendChild(b); return b; });
      r.appendChild(row); help(r, s.why); g.appendChild(r); choices[s.key] = () => { (s.options || []).forEach((o, i) => { const on = val(o) === st.P[s.key]; press(bs[i], on); if (on) pv.textContent = lab(o); }); }; }); }
  const fill = e => { const lo = +e.min, hi = +e.max; e.style.setProperty("--f", hi > lo ? ((+e.value - lo) / (hi - lo)).toFixed(4) : "0"); };      /* the ink rule up to the handle */
  const names = []; nums.forEach(p => { if (!names.includes(p.group)) names.push(p.group); });
  names.forEach(gn => { const mine = nums.filter(p => p.group === gn), g = group(gn || "Parameters", mine.length); mine.forEach(p => { const r = rowOf(p); if (!r) return; help(r, p.why); if (p.why) p._el.title = p.why;
    p._el.addEventListener("input", () => fill(p._el)); p._el.addEventListener("change", () => { if (L()) L().commit(); }); p._el.addEventListener("pointerdown", () => { st.held = true; }); g.appendChild(r); }); });
  const old = meta.querySelector(":scope > .params"); if (old && !old.querySelector(".prow")) old.remove();
  const release = () => { st.held = false; }; addEventListener("pointerup", release); addEventListener("pointercancel", release); addEventListener("blur", release);
  /* space or enter on one of these buttons stays with the button */
  panel.addEventListener("keydown", e => { if (e.target.tagName === "BUTTON" && (e.key === " " || e.key === "Enter")) e.stopPropagation(); });

  /* wide: the instrument sits in the notes column. narrow: under the figure, which stays pinned while the sliders scroll */
  const mq = matchMedia("(max-width:960px)");
  const place = () => { const away = mq.matches; panel.classList.toggle("away", away); if (away) stage.insertBefore(panel, logEl); else meta.appendChild(panel); };
  place(); if (mq.addEventListener) mq.addEventListener("change", place); else mq.addListener(place);

  /* controls follow the state (preset, reset, new seed, palette, live drag) */
  MP.ui = () => { (S.params || []).forEach(p => { if (!p._el || !(p.id in st.P)) return; if (String(p._el.value) !== String(st.P[p.id])) p._el.value = st.P[p.id]; p._upd(); if (p.type !== "text") fill(p._el); });
    for (const k in choices) choices[k]();
    palBtns.forEach((b, i) => press(b, PL.palettes[i] === st.pal)); gPal.note.textContent = st.pal.name + (st.pal.note ? " · " + st.pal.note : "");
    preBtns.forEach((b, i) => press(b, i === st.preset)); };
  /* motion: the readout of a moving parameter shows where it is; its slider stays where it was set */
  const pvs = {}; MP.motion.forEach(m => { pvs[m.key] = [$("pv-" + m.key), (S.params || []).find(p => p.id === m.key)]; });
  MP.moving = P => { for (const k in pvs) { const q = pvs[k]; if (q[0] && q[1]) q[0].textContent = q[1].fmt(P[k]); } };
  /* an open spec drawer re-reads the state: the shell does that on open, so close and open it within one frame */
  MP.changed = () => { if (specEl.classList.contains("open")) { bSpec.onclick(); bSpec.onclick(); } };

  /* a point whose tag was cut for the figure reads in full in the read panel */
  const notes = {}; (S.points || []).slice(0, 10).forEach((p, i) => { if (p.note) notes[10 + i * 2] = p; });
  if (Object.keys(notes).length) { const rt = $("readtxt"); new MutationObserver(() => { const m = /^(\d+) · /.exec(rt.textContent), p = m && notes[m[1]]; if (p && !rt.textContent.endsWith(p.note)) rt.textContent = m[1] + " · " + p.d + " — " + p.note; }).observe(rt, { childList: true }); }

  /* fidelity: the live benchmark, as rows of the log; each metric is a row over a thin rule drawn to its match */
  const pc = v => (v * 100).toFixed(1) + " %";
  const fr = (a, b, cls) => { const r = el("div", "fr" + (cls ? " " + cls : "")); r.appendChild(el("span", null, a)); r.appendChild(document.createTextNode(" ")); r.appendChild(el("span", null, b)); return r; };
  const rule = v => { const bar = el("div", "bar"), i = el("i"); i.style.width = (Math.max(0, Math.min(1, v)) * 100).toFixed(1) + "%"; bar.appendChild(i); return bar; };
  let openRows = false;
  const drawFid = () => { const b = st.bench; fid.className = "fid mpf"; fid.textContent = ""; fid.appendChild(el("div", "fh", "Fidelity · ref ↔ rebuild"));
    if (!b) { fid.appendChild(fr(st.benchErr ? "Benchmark failed · " + st.benchErr : "Measuring against the reference statistics", "—")); fid.dataset.bench = st.benchErr ? "failed" : "pending"; return; }
    const lo = b.rows.reduce((a, r) => r.v < a.v ? r : a, b.rows[0]), n98 = b.rows.filter(r => r.v >= .98).length;
    fid.appendChild(fr("Lowest · " + lo.patch + " " + lo.metric, pc(lo.v)));
    fid.appendChild(fr("At or above 98 %", n98 + " / " + b.rows.length));
    fid.appendChild(rule(b.mean));
    const sum = fr("match", pc(b.mean), "sum"); sum.id = "fidmatch"; fid.appendChild(sum);
    const d = el("details"), sm = el("summary", null, "All metrics · " + b.rows.length), t = el("div", "fmt"); d.open = openRows; d.appendChild(sm); d.appendChild(t);
    const patches = []; b.rows.forEach(r => { if (!patches.includes(r.patch)) patches.push(r.patch); });
    patches.forEach(pn => { const rows = b.rows.filter(r => r.patch === pn), h = el("div", "fp"); h.appendChild(el("span", null, pn)); h.appendChild(el("span", null, pc(rows.reduce((s, r) => s + r.v, 0) / rows.length))); t.appendChild(h);
      rows.forEach(r => { t.appendChild(fr(r.metric, pc(r.v))); t.appendChild(rule(r.v)); }); });
    t.appendChild(el("div", "fnote", "Scored in this page at default parameters, " + (PL.palettes.find(p => p.id === PL.bench.palette) || PL.palettes[0]).name + " palette, at reference size, against statistics read from the reference. The reference is held locally and is not in this page." + (PL.bench.note ? " " + PL.bench.note : "")));
    d.addEventListener("toggle", () => { openRows = d.open; fit(); if (!mq.matches) logEl.scrollTop = d.open ? Math.max(0, d.offsetTop - 2) : 0; }); fid.appendChild(d);
    fid.dataset.bench = "done"; fid.dataset.match = "match " + pc(b.mean); };
  /* wide: the log may not run under the title block; it scrolls inside its own height when the metric table is open */
  const fit = () => { if (mq.matches) { logEl.style.maxHeight = ""; return; } logEl.style.maxHeight = Math.max(160, Math.floor(tb.getBoundingClientRect().top - logEl.getBoundingClientRect().top - 12)) + "px"; };
  MP.on.push(what => { if (what === "bench") { drawFid(); fit(); MP.changed(); } });
  addEventListener("resize", () => setTimeout(fit, 160)); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  MP.ui(); drawFid(); fit();
})();
"""


# ------------------------------------------------------------------ the page
def shell():
    f = next((os.path.join(ST_DIR, x) for x in SHELL_SRC if os.path.exists(os.path.join(ST_DIR, x))), None)
    if not f: raise SystemExit('shell source not found in %s (%s)' % (ST_DIR, ', '.join(SHELL_SRC)))
    s = rd(f)
    try:
        i = s.index('<script>window.__REF='); k = s.index('<script>\n(function(){\n"use strict";\n/* LIVE PLATES'); e = s.rindex('</script>') + len('</script>')
    except ValueError:
        raise SystemExit('%s is not the live read-plate shell this generator expects' % f)
    head, runtime, tail = s[:i], s[k:e], s[e:]
    for need in ('<title>', '</style>', '<main class="plate">', 'id="fid"', 'id="specpre"'):
        if need not in head: raise SystemExit('%s: shell head is missing %s' % (f, need))
    return head, runtime, tail, os.path.basename(f)


def fmt_fn(p):
    st = p.get('step') or 1
    dec = 0 if st >= 1 else 1 if st >= .1 else 2 if st >= .01 else 3
    return Raw("v=>(+v).toFixed(%d)%s" % (dec, ("+" + jstr(' ' + p['unit'])) if p.get('unit') else ''))


def page_for(arg, of=OF, verbose=True):
    n = plate_no(arg); sn = st_no(n)
    stem, files = plate_files(n)
    pl, from_meta, errs = asyncio.run(read_plate(n, files))
    pid = pl['id']
    for e in errs: warn(pid, 'while loading: ' + e)
    for k in ('title', 'ref', 'palettes', 'bench'):
        if not pl.get(k): raise SystemExit('%s: plate.%s is missing' % (pid, k))
    for k in ('line', 'params', 'presets', 'passes', 'measured', 'limits', 'source'):
        if not pl.get(k): warn(pid, 'plate.%s is missing or empty' % k)
    refstats = load_refstats(stem, pl)
    W, H = pl['ref']['w'], pl['ref']['h']
    sd = build_study(pl, n)
    techs = build_techniques(pl, sd)
    code, sid = 'ST-%02d' % sn, 'st-%02d' % sn
    fname = '%s-%s' % (sid, sd['slug'])
    src_desc = re.sub(r'^\s*References?\s*\d*\s*[:·]\s*', '', pl.get('source') or '').strip()
    first = re.split(r'(?<=[^\d\s])\.\s+(?=[A-Z])', src_desc)[0].rstrip('.')                 # the page carries the first sentence; spec.reference.source keeps all of it
    if len(first) > 110: first = first[:110][:max(first[:110].rfind(', '), first[:110].rfind(' ('), 60)].rstrip(' ,;(') + '…'
    source = sd.get('source') or ('References %d · %s' % (sn, first or sd['title']))
    params, texts, selects = pl.get('params') or [], pl.get('texts') or [], pl.get('selects') or []
    bench = pl['bench']; bpal = next((p for p in pl['palettes'] if p['id'] == bench.get('palette')), pl['palettes'][0])
    has_seed = any(p['key'] == 'seed' for p in params)
    if not has_seed: warn(pid, 'no "seed" parameter: the page has no New seed button')
    by_key = {p['key']: p for p in params}
    motion = []
    for m in (pl.get('motion') if isinstance(pl.get('motion'), list) else []):
        if not isinstance(m, dict) or m.get('key') not in by_key: warn(pid, 'motion entry %s names no slider — left out' % json.dumps(m)); continue
        if m.get('mode') not in ('sine', 'saw', 'drift'): warn(pid, 'motion.%s has mode %r — read as "sine"' % (m['key'], m.get('mode')))
        motion.append(m)
    axes = pl.get('live') if isinstance(pl.get('live'), dict) and any(isinstance(pl['live'].get(a), dict) and pl['live'][a].get('key') for a in ('x', 'y')) else None
    for a in ('x', 'y'):
        if axes and isinstance(axes.get(a), dict) and axes[a].get('key') not in by_key: warn(pid, 'live.%s.key %r is not a slider: the drag sets it, nothing shows its value' % (a, axes[a].get('key')))
    ax_label = lambda a: (by_key.get(axes[a]['key'], {}).get('label') or axes[a]['key']) if axes and isinstance(axes.get(a), dict) and axes[a].get('key') else None

    spec = {'id': sid, 'plate': {'key': pid, 'no': pl.get('no') or '%02d' % n, 'title': pl['title']},
            'reference': {'source': pl.get('source') or source, 'px': [W, H], 'published': False, 'note': 'held locally; this page carries statistics measured from it and none of its pixels'},
            'summary': pl.get('line') or '', 'units': 'reference pixels; the plate is %d × %d and every length scales with the canvas' % (W, H),
            'palette': pal_spec(bpal), 'palettes': [{'key': p['id'], 'name': p['name'], 'swatches': p.get('sw') or []} for p in pl['palettes']]}
    if texts: spec['text'] = {t['key']: t.get('def', '') for t in texts}
    if selects: spec['select'] = {t['key']: t.get('def') for t in selects}; spec['select_options'] = {t['key']: t.get('options') or [] for t in selects}
    spec['params'] = {p['key']: {'value': p['def'], 'default': p['def'], 'range': [p['min'], p['max']], 'step': p.get('step'), 'unit': p.get('unit') or None, 'group': p.get('group') or 'Parameters', 'does': p.get('why') or ''} for p in params}
    spec['presets'] = pl.get('presets') or []
    if motion: spec['motion'] = {'moves': motion, 'modes': {'sine': 'value ± amp over period seconds', 'saw': 'value up to value + amp over period seconds, then again', 'drift': 'seeded walk, one step of up to amp every period seconds, folded back at the slider ends'},
                                 'runs': 'only while Motion is on, at half scale; the sliders hold the center values; off by default'}
    if axes: spec['live'] = {'x': axes.get('x'), 'y': axes.get('y'), 'runs': 'only while Live is on: a drag on the figure sets x across and y down between these ends; off by default'}
    spec['techniques'] = techs
    spec['pass_order'] = pl.get('passes') or []
    spec['measured'] = pl.get('measured') or {}
    spec['benchmark'] = {'mean': None, 'match': None, 'lowest': None, 'metrics': [],
                         'computed': 'live, when this page loads, by the code that measured the reference: default parameters, %s palette, 1× reference size' % bpal['name'],
                         'setup': {'palette': bench.get('palette'), 'overrides': bench.get('params') or {}, 'note': bench.get('note'),
                                   'patches': [{'name': i['name'], 'reference_rect': i['ref'], 'render_rect': i['out'], 'metrics': i.get('m', [])} for i in bench.get('items', [])]}}
    spec['limits'] = pl.get('limits') or []
    keys = {'S': 'spec', 'space': 're-read'}
    if motion: keys['M'] = 'motion'
    if axes: keys['L'] = 'live'
    if has_seed: keys['N'] = 'new seed'
    keys['C'] = 'next palette'
    spec['keys'] = keys
    spec['notes'] = ['Deterministic: the same palette, parameters and seed give the same pixels.',
                     'A display render is capped at 2.4 megapixels; a slider in motion draws at half scale (down to a quarter on a heavy engine) and the release redraws in full.',
                     'This spec follows the controls: open it again, or leave it open, after changing them.']

    L = "const L=window.STUDY.live; if(L)"
    controls = []
    if motion: controls.append("{ id:'motion', label:'Motion', toggle:true, on:false, title:'run the motion version (M)', onClick(){ const L=window.STUDY.live; return L?L.motion():false; } }")
    if axes: controls.append("{ id:'live', label:'Live', toggle:true, on:false, title:%s, onClick(){ const L=window.STUDY.live; return L?L.liveMode():false; } }" % jstr('drag on the figure' + (': ' + ', '.join(x for x in [ax_label('x') and 'across sets ' + ax_label('x'), ax_label('y') and 'down sets ' + ax_label('y')] if x)) + ' (L)'))
    if has_seed: controls.append("{ id:'seed', label:'New seed', title:'re-roll the seed (N)', onClick(){ %sL.seed(); } }" % L)
    controls.append("{ id:'reset', label:'Reset', title:'back to the measured defaults', onClick(){ %sL.reset(); } }" % L)
    controls.append("{ id:'save', label:'Save PNG', title:'the plate at 2400 px on its long side', onClick(){ %sL.save(); } }" % L)
    prm = []
    for t in texts:
        prm.append("{ id:%s, label:%s, type:'text', maxLength:%d, placeholder:'', value:%s, group:'Content', fmt:v=>v?v.length+' chars':'empty', onChange(v){ %sL.set(%s,v); } }" % (jstr(t['key']), jstr(t['label']), max(240, 2 * len(str(t.get('def', '')))), jstr(t.get('def', '')), L, jstr(t['key'])))
    for p in params:
        prm.append("{ id:%s, label:%s, min:%s, max:%s, step:%s, value:%s, unit:%s, group:%s, why:%s, fmt:%s, onChange(v){ %sL.set(%s,v,true); } }" % (
            jstr(p['key']), jstr(p['label']), js1(p['min']), js1(p['max']), js1(p.get('step') or 1), js1(p['def']), jstr(p.get('unit') or ''), jstr(p.get('group') or 'Parameters'), jstr(p.get('why') or ''), fmt_fn(p), L, jstr(p['key'])))
    pts = []
    for p in sd['points']:
        s = "{u:%.3f,v:%.3f,d:%s label:%s, t:%s, dir:%s" % (p['u'], p['v'], (jstr(p['d']) + ',').ljust(7), jstr(p['label']), jstr(p['t']), js1(p['dir']))
        if p.get('note'): s += ", note:" + jstr(p['note'])
        pts.append(s + "}")
    study = "window.STUDY={\n" \
        "  id:%s, code:%s, sheet:%d, of:%d, fig:%s, series:'STUDIES',\n" % (jstr(sid), jstr(code), sn, of, jstr('3.%d' % sn)) + \
        "  title:%s,\n  kicker:%s,\n  lede:%s,\n" % (jstr(sd['title']), jstr(sd.get('kicker') or 'Technique study · %d' % sn), jstr(sd['lede'])) + \
        "  body:[\n" + ",\n".join("    " + jstr(b) for b in sd['body']) + "\n  ],\n" + \
        "  method:%s,\n  source:%s,\n  spot:%s,\n  ref:{w:%d,h:%d},\n" % (jstr(sd['method']), jstr(source), js1(spot_of(pl, sd)), W, H) + \
        "  points:[\n" + ",\n".join("    " + x for x in pts) + "\n  ],\n" + \
        "  spec:" + js(spec, 2) + ",\n" + \
        "  controls:[\n" + ",\n".join("    " + x for x in controls) + "\n  ],\n" + \
        "  params:[\n" + ",\n".join("    " + x for x in prm) + "\n  ],\n" + \
        "  hud:true,\n" + \
        "  render(canvas,w,h,dpr,finish){ return window.__MP.mount(this,canvas,w,h,dpr,finish); }\n};\n"

    src_all = '\n'.join(rd(f) for f in files)
    faces = plate_fonts(src_all)
    head, runtime, tail, shell_name = shell()
    head = re.sub(r'<title>.*?</title>', lambda m: '<title>ST.%02d — %s</title>' % (sn, esc_html(sd['title'])), head, count=1, flags=re.S)
    head = head.replace('<link rel="icon" href="data:,">', '<link rel="icon" href="data:,">\n<meta name="generator" content="%s · %s">' % (GENERATOR, pid), 1)
    css = ADD_CSS.replace('__AR__', '%.5f' % (H / W)) + ''.join(font_face(*f) + '\n' for f in faces)
    head = head.replace('</style>', css + '</style>', 1)
    hint = ' · '.join(x for x in [motion and 'M motion', axes and 'L live', has_seed and 'N seed', 'C color', not (motion and axes) and 'S spec'] if x)
    engine = ENGINE_JS.replace('__ID__', json_inline(pid)).replace('__REFSTATS__', json_inline(refstats)) \
        .replace('__FONTS__', json_inline(['%d 40px "%s"' % (w, fam) for fam, w, _ in faces])).replace('__FILE__', json_inline(fname)).replace('__HINT__', json_inline(hint))
    tags = ['<script>window.__REF={"w":%d,"h":%d,"data":null};</script>\n' % (W, H)]
    tags.append('<script>\n/* engine kit: src/util.js */\n%s\n</script>' % inline_js(rd(os.path.join(R, 'src', 'util.js')).rstrip()))
    for f in files: tags.append('<script>\n/* engine: src/%s */\n%s\n</script>' % (os.path.basename(f), inline_js(rd(f).rstrip())))
    if from_meta: tags.append('<script>\n/* this plate\'s record from src/meta.js */\nObject.assign(PLATES.find(p=>p.id===%s),%s);\n</script>' % (json_inline(pid), json_inline({k: pl[k] for k in from_meta})))
    tags.append('<script>\n/* benchmark: src/metrics.js */\n%s\n</script>' % inline_js(rd(os.path.join(R, 'src', 'metrics.js')).rstrip()))
    tags.append('<script>\n%s</script>' % engine)
    tags.append('<script>\n%s</script>' % study)
    html = head + '\n'.join(tags) + '\n' + runtime + '\n<script>\n' + POST_JS + '</script>' + tail
    if re.search(r'(src|href)\s*=\s*["\']https?:', html) or re.search(r'url\(\s*["\']?https?:', html): warn(pid, 'the page references an external URL')
    info = {'plate': pid, 'st': sn, 'code': code, 'file': fname + '.html', 'title': sd['title'], 'bytes': len(html.encode('utf8')), 'fonts': ['%s %d' % (f[0], f[1]) for f in faces], 'shell': shell_name,
            'techniques': [t['id'] for t in techs], 'study_block': bool(pl.get('study')), 'motion': [m['key'] for m in motion], 'live': [axes[a]['key'] for a in ('x', 'y') if isinstance(axes.get(a), dict) and axes[a].get('key')] if axes else []}
    return html, info


def main(argv):
    out_dir, of, ids = ST_DIR, OF, []
    it = iter(argv)
    for a in it:
        if a == '--out': out_dir = next(it)
        elif a == '--of': of = int(next(it))
        elif a == 'all': ids += ['p%02d' % n for n in all_plates()]
        else: ids.append(a)
    if not ids: raise SystemExit(__doc__)
    for a in ids:
        html, info = page_for(a, of)
        path = os.path.join(out_dir, info['file'])
        html = html.replace('NORMALISED', 'NORMALIZED')   # US spelling in the shell's figure caption
        with open(path, 'w', encoding='utf8', newline='\n') as f: f.write(html)
        others = sorted(x for x in os.listdir(out_dir) if x.startswith('st-%02d-' % info['st']) and x != info['file'])
        if others: warn(info['plate'], 'other files carry %s: %s (left in place; update_index.py uses the newest)' % (info['code'], ', '.join(others)))
        print('%s -> %s  %s "%s"  %d bytes  fonts: %s  techniques: %s  motion: %s  live: %s%s' % (info['plate'], path, info['code'], info['title'], info['bytes'], ', '.join(info['fonts']) or 'shell only', ', '.join(info['techniques']),
              ', '.join(info['motion']) or 'none (no toggle)', ' / '.join(info['live']) or 'none (no toggle)', '' if info['study_block'] else '  (stand-in study copy)'))


if __name__ == '__main__':
    main(sys.argv[1:])
