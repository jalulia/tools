#!/usr/bin/env python3
"""build11.py VERSION · inline fonts, logo, gifenc, references and the sources into one HTML file."""
import base64, io, re, sys, os
from PIL import Image
V = sys.argv[1] if len(sys.argv) > 1 else 'V01'
R = os.path.dirname(os.path.abspath(__file__))
rd = lambda p: open(p, encoding='utf8').read()
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
page = rd(f'{R}/src/v11/page11.html').replace('/*@CSS*/', rd(f'{R}/src/v11/page11.css'))
NM = os.environ.get('NODE_MODULES', os.path.join(R, 'node_modules'))  # npm i geist@1 gifenc@1.0.3
FONTS = f'{NM}/geist/dist/fonts'
gif = rd(f'{NM}/gifenc/dist/gifenc.esm.js')
gif = re.sub(r'//# sourceMappingURL=.*', '', gif)
m = re.search(r'export\{([^}]*)\};?\s*$', gif.strip())
names = dict(reversed(x.strip().split(' as ')) for x in m.group(1).split(','))
gif = gif.strip()[:m.start()] + '\nreturn {GIFEncoder:%s,quantize:%s,applyPalette:%s};' % (names['GIFEncoder'], names['quantize'], names['applyPalette'])
gif = '/* gifenc 1.0.3 · MIT © 2017 Matt DesLauriers · https://github.com/mattdesl/gifenc */\nwindow.GIFENC=(function(){' + gif + '})();'
refs = []
for f, alt in [('d72bb7f7-image.png', 'Brush script specimen: Metropolis, Phantom, Bergkatze'), ('ce10536a-image.png', 'homélior wordmark with a script m'),
               ('01677b2e-image.png', 'A single-glyph d mark'), ('86e6f344-image.png', 'Rémi wordmark with a script m and a slash accent')]:
    im = Image.open('/mnt/user-data/uploads/' + f).convert('RGB'); im.thumbnail((520, 390), Image.LANCZOS); bio = io.BytesIO(); im.save(bio, 'WEBP', quality=82)
    refs.append(f'<img alt="{alt}" src="data:image/webp;base64,{base64.b64encode(bio.getvalue()).decode()}">')
rep = {
  '/*@GEIST*/': b64(f'{FONTS}/geist-sans/Geist-Variable.woff2'), '/*@GEISTMONO*/': b64(f'{FONTS}/geist-mono/GeistMono-Variable.woff2'),
  '/*@LOGO*/': rd(f'{R}/src/v11/logo.js'), '/*@GIFENC*/': gif, '/*@GEOM*/': rd(f'{R}/src/v11/geom.js'), '/*@ROUTES*/': rd(f'{R}/src/v11/routes.js'),
  '/*@GL*/': rd(f'{R}/src/v11/gl10.js'), '/*@MAP*/': rd(f'{R}/src/v11/map.js'), '/*@APP*/': rd(f'{R}/src/v11/app11.js'), '/*@RES*/': rd(f'{R}/src/v11/resolve.js') + '\n' + rd(f'{R}/src/v11/mark22.js') + '\n' + rd(f'{R}/src/v11/robotgeo.js') + '\n' + rd(f'{R}/src/v11/head.js'), '/*@HANDS*/': rd(f'{R}/src/v11/hands.js'), '/*@GUIDE*/': rd(f'{R}/src/v11/guide.js')
}
for k, v in rep.items():
    assert k in page, k
    page = page.replace(k, v)
os.makedirs(f'{R}/out', exist_ok=True)
out = f'{R}/out/ribbon-to-mindgut_{V}.html'
if os.path.exists(out) and '--force' not in sys.argv: sys.exit(f'{out} exists: make a new version')
open(out, 'w', encoding='utf8').write(page)
print(out, len(page.encode()) // 1024, 'KB')
