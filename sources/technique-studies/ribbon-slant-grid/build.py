#!/usr/bin/env python3
"""build.py VERSION · inline the fonts, the wordmark, gifenc and the sources into one HTML file (out/ribbon-to-mindgut_VERSION.html)."""
import base64, re, sys, os
V = sys.argv[1] if len(sys.argv) > 1 else 'V01'
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(p, encoding='utf8').read()
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
page = rd(f'{R}/src/page5.html').replace('/*@CSS*/', rd(f'{R}/src/page4.css'))
NM = os.environ.get('NODE_MODULES', os.path.join(R, 'node_modules'))  # npm i geist@1 gifenc@1.0.3
FONTS = f'{NM}/geist/dist/fonts'
gif = rd(f'{NM}/gifenc/dist/gifenc.esm.js')
gif = re.sub(r'//# sourceMappingURL=.*', '', gif)
m = re.search(r'export\{([^}]*)\};?\s*$', gif.strip())
names = dict(reversed(x.strip().split(' as ')) for x in m.group(1).split(','))
gif = gif.strip()[:m.start()] + '\nreturn {GIFEncoder:%s,quantize:%s,applyPalette:%s};' % (names['GIFEncoder'], names['quantize'], names['applyPalette'])
gif = '/* gifenc 1.0.3 · MIT © 2017 Matt DesLauriers · https://github.com/mattdesl/gifenc */\nwindow.GIFENC=(function(){' + gif + '})();'
rep = {
  '/*@GEIST*/': b64(f'{FONTS}/geist-sans/Geist-Variable.woff2'), '/*@GEISTMONO*/': b64(f'{FONTS}/geist-mono/GeistMono-Variable.woff2'),
  '/*@LOGO*/': rd(f'{R}/src/logo.js'), '/*@GIFENC*/': gif, '/*@GEOM*/': rd(f'{R}/src/geom.js'), '/*@ROUTES*/': rd(f'{R}/src/routes.js'),
  '/*@GL*/': rd(f'{R}/src/gl.js'), '/*@MAP*/': rd(f'{R}/src/map.js'), '/*@APP*/': rd(f'{R}/src/app5.js'), '/*@LOCK*/': rd(f'{R}/src/lockups.js'), '/*@HANDS*/': rd(f'{R}/src/hands.js'), '/*@GUIDE*/': rd(f'{R}/src/guide.js')
}
for k, v in rep.items():
    assert k in page, k
    page = page.replace(k, v)
os.makedirs(f'{R}/out', exist_ok=True)
out = f'{R}/out/ribbon-to-mindgut_{V}.html'
if os.path.exists(out) and '--force' not in sys.argv: sys.exit(f'{out} exists: make a new version')
open(out, 'w', encoding='utf8').write(page)
print(out, len(page.encode()) // 1024, 'KB')
