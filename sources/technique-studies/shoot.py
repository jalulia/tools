"""shoot.py <plate> <out.png> [json overrides] [palette] — render one plate headless and save the canvas."""
import sys, json, base64, asyncio
from playwright.async_api import async_playwright
async def main():
    pid, out = sys.argv[1], sys.argv[2]
    over = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    pal = sys.argv[4] if len(sys.argv) > 4 else None
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--force-color-profile=srgb', '--no-sandbox'])
        pg = await b.new_page()
        errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/plates/dev.html?p='+pid)
        r = await pg.evaluate('([id,o,p])=>draw(id,o,p)', [pid, over, pal])
        data = await pg.evaluate("document.getElementById('c').toDataURL('image/png')")
        open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
        print(r, errs)
        await b.close()
asyncio.run(main())
