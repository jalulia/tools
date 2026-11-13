#!/usr/bin/env python3
"""update_index.py [--dry] — put a card for every generated study into technique-studies/index.html, and make the counts true.

Looks for pages written by make_study.py in tools/technique-studies/ (they carry a generator <meta>), opens each
headless at default parameters, waits for the read and the live benchmark, and takes from the page itself:
the thumbnail (the study's own canvas around the figure, 520 px on the long side, JPEG q 0.82, like the ST-09..11
cards), the code, the title, the method line and `match NN %`.
The cards go after the existing ST cards, between two comment markers, so a second run replaces them and never
doubles them. The plate count in the index headline and in tool.json, and the FIG range in the index footer, are
rewritten from the cards that are really there; nothing else in either file is touched.
Other pages that list the studies (gallery, library) are reported, not edited.
"""
import asyncio, base64, html as H, json, os, re, subprocess, sys
from playwright.async_api import async_playwright
import make_study as M

INDEX = os.path.join(M.ST_DIR, 'index.html')
TOOL = os.path.join(M.ST_DIR, 'tool.json')
OPEN, CLOSE = '<!-- measured plates: cards written by plates/update_index.py -->', '<!-- /measured plates -->'
LONG, QUALITY, MARGIN = 520, 0.82, 22          # px on the long side, JPEG quality, CSS px kept around the figure

SMALL = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'twenty thirty forty fifty sixty seventy eighty ninety'.split()
def words(n):
    if n < 20: w = SMALL[n]
    elif n < 100: w = TENS[n // 10 - 2] + ('-' + SMALL[n % 10] if n % 10 else '')
    else: return str(n)
    return w[:1].upper() + w[1:]


def generated():
    """{st number: file} for pages make_study.py wrote; the newest wins when a number has two"""
    out = {}
    for f in sorted(os.listdir(M.ST_DIR)):
        m = re.fullmatch(r'st-(\d+)-[a-z0-9-]+\.html', f)
        if not m: continue
        head = open(os.path.join(M.ST_DIR, f), encoding='utf8').read(4000)
        if '<meta name="generator" content="%s' % M.GENERATOR not in head: continue
        n = int(m.group(1))
        if n in out:
            print('  [warn] two generated pages for ST-%02d: %s, %s — using the newer' % (n, out[n], f), file=sys.stderr)
            if os.path.getmtime(os.path.join(M.ST_DIR, f)) < os.path.getmtime(os.path.join(M.ST_DIR, out[n])): continue
        out[n] = f
    return out


SNAP = """([m,long,q])=>{ const S=window.STUDY, MP=window.__MP, cv=document.getElementById('cv'), f=window.__study.fig(), k=cv.width/cv.getBoundingClientRect().width;
  const x=(f.x-m)*k, y=(f.y-m)*k, w=(f.w+2*m)*k, h=(f.h+2*m)*k, s=long/Math.max(w,h), c=document.createElement('canvas'); c.width=Math.round(w*s); c.height=Math.round(h*s);
  const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high'; g.drawImage(cv,x,y,w,h,0,0,c.width,c.height);
  return { code:S.code, title:S.title, method:S.method, mean:MP.st.bench?MP.st.bench.mean:null, err:MP.st.benchErr, size:[c.width,c.height], jpeg:c.toDataURL('image/jpeg',q) }; }"""


async def snap(files):
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=M.CHROME, args=M.CHROME_ARGS)
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2, reduced_motion='reduce')
        for n, f in sorted(files.items()):
            pg = await ctx.new_page(); errs = []
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('file://' + os.path.join(M.ST_DIR, f))
            await pg.wait_for_function("()=>{ const c=document.getElementById('ctr'), m=c&&c.textContent.match(/(\\d+) \\/ (\\d+)/); return m&&m[1]===m[2]&&+m[2]>0&&window.__MP&&(window.__MP.st.bench||window.__MP.st.benchErr); }", timeout=60000)
            await pg.wait_for_timeout(900)                      # trackers and their numbers finish drawing; the plate is HELD
            r = await pg.evaluate(SNAP, [MARGIN, LONG, QUALITY]); r['errors'] = errs; res[n] = r
            await pg.close()
        await b.close()
    return res


def card(f, r):
    e = lambda s: H.escape(str(s), quote=False)
    return '<a class="card" href="%s"><div class="th"><img src="%s" alt=""></div><div class="cap"><span class="n">%s</span><span class="t">%s</span><span class="m">%s</span><span class="f">match %d %%</span></div></a>' % (
        f, r['jpeg'], e(r['code']), e(r['title']), e(r['method']), round(r['mean'] * 100))


def elsewhere():
    """other files in the repo that name a study page: they need their own entries, by their own builds"""
    try:
        out = subprocess.run(['grep', '-rl', '--exclude-dir=.git', '--exclude-dir=node_modules', '--exclude-dir=technique-studies', 'st-11-gradient-by-number', M.TOOLS], capture_output=True, text=True).stdout.split()
    except Exception:
        out = []
    return sorted(os.path.relpath(x, M.TOOLS) for x in out)


def main(dry=False):
    files = generated()
    s = open(INDEX, encoding='utf8').read()
    s = re.sub(r'\n?' + re.escape(OPEN) + r'.*?' + re.escape(CLOSE), '', s, flags=re.S)        # last run's cards
    for f in files.values():                                                                      # and any loose copy of one
        s = re.sub(r'<a class="card" href="%s">.*?</a>' % re.escape(f), '', s, flags=re.S)
    res = asyncio.run(snap(files)) if files else {}
    cards = []
    for n, f in sorted(files.items()):
        r = res[n]
        if r['errors']: print('  [warn] %s: console errors: %s' % (f, r['errors']), file=sys.stderr)
        if r['mean'] is None: print('  [warn] %s: the benchmark did not run (%s) — no card written' % (f, r['err']), file=sys.stderr); continue
        cards.append(card(f, r))
        print('  %s  %-28s match %d %%  thumb %dx%d, %d bytes  %s' % (r['code'], r['title'][:28], round(r['mean'] * 100), r['size'][0], r['size'][1], len(base64.b64decode(r['jpeg'].split(',')[1])), f))
    j = s.index('<div class="tb">'); i = s.rindex('</div>', 0, j)                                 # the grid's closing tag
    if cards: s = s[:i] + '\n' + OPEN + ''.join(cards) + CLOSE + s[i:]
    hrefs = re.findall(r'<a class="card" href="(st-(\d+)-[^"]+)"', s)
    total, last = len(hrefs), max([int(n) for _, n in hrefs] or [0])
    s, c1 = re.subn(r'(<h1>)[A-Za-z0-9-]+( read plates:)', lambda m: m.group(1) + words(total) + m.group(2), s, count=1)
    s, c2 = re.subn(r'(FIG\. 3\.1 – 3\.)\d+', lambda m: m.group(1) + str(last), s, count=1)
    t = open(TOOL, encoding='utf8').read()
    t2, c3 = re.subn(r'("description"\s*:\s*")[A-Za-z0-9-]+( read plates)', lambda m: m.group(1) + words(total) + m.group(2), t, count=1)
    for ok, what in ((c1, 'index headline count'), (c2, 'index footer FIG range'), (c3, 'tool.json count')):
        if not ok: print('  [warn] could not find the %s to update' % what, file=sys.stderr)
    if not dry:
        with open(INDEX, 'w', encoding='utf8', newline='') as fh: fh.write(s)
        if t2 != t:
            with open(TOOL, 'w', encoding='utf8', newline='') as fh: fh.write(t2)
    print('%s: %d cards (%d existing + %d generated), headline and tool.json say "%s read plates", series FIG. 3.1 – 3.%d%s' % (os.path.relpath(INDEX, M.TOOLS), total, total - len(cards), len(cards), words(total), last, '  [dry run, nothing written]' if dry else ''))
    other = elsewhere()
    if other:
        print('also listing the studies, not edited here:')
        for x in other: print('  ' + x)


if __name__ == '__main__':
    main('--dry' in sys.argv)
