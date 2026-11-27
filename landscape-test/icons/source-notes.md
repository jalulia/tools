# Existing artwork used by the test index

These illustrations are isolated exports and compositions from existing project sources. Original pages and Library records are unchanged.

- `bo.svg` and `bo-blink.gif`: `jalulia/bo/src/raster.js`, `src/rex.js` and `src/cat.js` at commit `fd918c18a759787ee31a36c1ed12d26338c7f346`. The original Cornish Rex skeleton, Bo coat, personality proportions, sitting pose, pixel raster and silhouette outline are rendered onto a transparent surface. The GIF changes only the original eyelid parameter. The index uses the static SVG to respect its motion controls; the GIF is an optional reusable asset.
- `yoshi.svg`: alias of the original dossier cover export `yoshi-dossier.svg`. Exact source hashes and adaptations for all Yoshi exports are in `yoshi-provenance.json`.
- `yoshios-crt.svg`: the original YoshiOS rear/side tilt drawings, at their starting angles, fitted inside the Library’s PROFEEL receiver. CRT geometry comes from `jalulia/tools/techniques-templates/plates/_src/cathode-ray-receivers.html`, section 01, also catalogued as PL-92. Cabinet and screen fills and optical line weights were adapted for icon size; receiver geometry was retained.
- `ki.svg`: a small static crop of Sonic’s seeded ridge generator, original biome colors and paper-grain field. Stored as a PNG inside an SVG wrapper for reliable image-host rendering. `ki-atelier.svg` retains the same eleven contours as vector paths with the sampled layer colors. The full live landscape remains procedural.
- Library, Gallery and MeshViz exports have their exact references and adaptations in `library-gallery-meshviz-provenance.json`.

SVGs use transparent backgrounds except their depicted objects/screens or the Ki scene. No external icon pack, generated replacement character, private Ki consolidation link, or audio recording is included.
