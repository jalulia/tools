"""publish.py pNN [pNN…] [--push "message"]
Builds each plate's study page into techniques-templates/studies/<slug>/index.html (the T&T home since 93f2c22),
renders thumb.png at 800 px tall, then rebuilds library, registry index and gallery. With --push: fetches main,
refuses to continue on any conflict, checks for conflict markers, commits and pushes."""
import sys, os, re, glob, shutil, subprocess, asyncio, base64, json
R = '/home/claude/plates'; T = '/home/claude/tools'; SCR = '/tmp/claude-0/-home-claude/c10c3b0f-278d-5ef2-ad5f-c594c0426430/scratchpad/stout'
args = sys.argv[1:]; msg = None
if '--push' in args: i = args.index('--push'); msg = args[i + 1]; args = args[:i] + args[i + 2:]
def sh(cmd, cwd=T, check=True):
    r = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
    if check and r.returncode: print(r.stdout[-2000:], r.stderr[-2000:]); raise SystemExit('FAILED: ' + cmd)
    return r.stdout
QUAR = set(os.path.basename(p)[:-5] for p in glob.glob(T + '/.quarantine/*/technique-studies/*.html'))
if msg:
    dirty = sh('git status --porcelain').strip()
    if dirty: raise SystemExit('working tree is not clean; commit or set aside first:\n' + dirty[:800])
    sh('git fetch -q --depth=50 origin main'); sh('git reset -q --hard origin/main')
os.makedirs(SCR, exist_ok=True)
done = []
for pid in args:
    for f in glob.glob(SCR + '/*.html'): os.remove(f)
    out = sh(f'python3 make_study.py {pid} --out {SCR}', cwd=R)
    page = glob.glob(SCR + '/st-*.html'); assert len(page) == 1, out
    slug = os.path.basename(page[0])[:-5]
    if slug in QUAR: print('skip (quarantined at Julia\'s request):', slug); continue
    d = f'{T}/techniques-templates/studies/{slug}'; os.makedirs(d, exist_ok=True)
    shutil.copyfile(page[0], d + '/index.html')
    redirect = f'{T}/technique-studies/{slug}.html'
    if not os.path.exists(redirect):
        open(redirect, 'w').write(f'<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">\n<title>Moved · {slug}</title>\n<link rel="canonical" href="../techniques-templates/studies/{slug}/">\n<meta http-equiv="refresh" content="0; url=../techniques-templates/studies/{slug}/">\n<script>location.replace("../techniques-templates/studies/{slug}/"+location.search+location.hash);</script>\n</head><body><p>This study moved to <a href="../techniques-templates/studies/{slug}/">Techniques &amp; Templates</a>.</p></body></html>\n')
    done.append((pid, slug, d))
async def thumbs():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--force-color-profile=srgb', '--no-sandbox'])
        for pid, slug, d in done:
            pg = await b.new_page(); await pg.goto('file://' + R + '/dev.html?p=' + pid)
            ref = await pg.evaluate('([id])=>window.ready.then(()=>PLATES.find(p=>p.id===id).ref)', [pid])
            await pg.evaluate('([id,s])=>draw(id,{},null,s)', [pid, 800 / ref['h']])
            data = await pg.evaluate("document.getElementById('c').toDataURL('image/png')")
            open(d + '/thumb.png', 'wb').write(base64.b64decode(data.split(',')[1])); await pg.close()
        await b.close()
asyncio.run(thumbs())
for pid, slug, d in done: print(pid, '->', d)
slugs = ' '.join(slug for _, slug, _ in done)
if slugs: print(sh(f'node _build/studies.mjs {slugs} | tail -3', cwd=T + '/techniques-templates'))
print(sh('node _build/build.mjs | tail -2', cwd=T + '/techniques-templates'))
print(sh('node library/_build/collate.mjs --thumbs | tail -1'))
print(sh('node techniques-templates/_build/reg-index.mjs | tail -1'))
if os.path.exists(T + '/gallery/_build/build.mjs'): print(sh('node gallery/_build/build.mjs | tail -1'))
print(sh('node library/_build/collate.mjs --check | tail -1'))
print(sh('node scripts/build-site.mjs | tail -1'))
bad = sh("git diff --name-only | xargs -r grep -lE '^(<<<<<<<|>>>>>>>|=======)( |$)' || true", check=False).strip()
if bad: raise SystemExit('conflict markers in: ' + bad)
if msg:
    sh('git add -A techniques-templates technique-studies library gallery')
    p = subprocess.run(['git', '-c', 'user.name=Julia Compton', '-c', 'user.email=<your git email>', 'commit', '-q', '-m', msg + '\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01HyunfHpj9KmQiuSi2hsaL1'], cwd=T, capture_output=True, text=True)
    print(p.stdout, p.stderr)
    print(sh('git -c push.negotiate=true push origin HEAD:main 2>&1 | tail -1'))
    print(sh('git log --oneline -1'))
