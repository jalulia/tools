/* library/items/manifest.js · the 44 Encyclopedia items Julia kept (moved, private or archived in the library CMS), 2026-11-16.
   Generated once from encyclopedia/manifest.js when the Encyclopedia was retired (.quarantine/2026-11-16/MANIFEST.md).
   Links to items that were not kept are trimmed. The library (../) is the index; this page only shows one item. */
Shell.registerManifest({
 "schemaVersion": 1,
 "id": "library-items",
 "title": "Library items",
 "subtitle": "kept from the Encyclopedia, 2026-11-16",
 "mode": "catalogue",
 "stage": {
  "adapter": "fragment",
  "aspect": "1100/900",
  "isolation": "iframe"
 },
 "siblings": [],
 "vocabulary": {
  "status": {
   "canonical": "Work that is presented as correct and finished.",
   "exploration": "Kept because it asks a question, not because it answers one.",
   "historical": "Superseded, kept for the record.",
   "known-failure": "Shown because it fails, and the failure is the lesson.",
   "unsorted": "Imported from the inventory. No editorial ruling yet.",
   "proposed": "Written by the tool (ck-e6 candidate-technique detector). Julia rules by editing the stub."
  }
 },
 "sections": [
  {
   "id": "atoms",
   "title": "Atoms",
   "order": 1,
   "note": "A noun with parameters. Substrate, process, texture, colour, type, engine, field, mark, voice, space, bus."
  },
  {
   "id": "techniques",
   "title": "Techniques (spine)",
   "order": 2,
   "note": "Verbs with lessons. Chapters and worked examples that assert a way to do something."
  },
  {
   "id": "sound",
   "title": "Sound",
   "order": 3
  },
  {
   "id": "getting-started",
   "title": "Getting started",
   "order": 10
  },
  {
   "id": "algorithmic-drawing",
   "title": "Algorithmic drawing",
   "order": 11
  },
  {
   "id": "generative",
   "title": "Generative designs",
   "order": 12
  },
  {
   "id": "image-processing",
   "title": "Image processing",
   "order": 13
  },
  {
   "id": "beyond",
   "title": "Beyond the book",
   "order": 14
  },
  {
   "id": "worked-examples",
   "title": "Worked examples",
   "order": 15
  },
  {
   "id": "print-reproduction",
   "title": "Print & reproduction",
   "order": 20
  },
  {
   "id": "type-specimen",
   "title": "Type & specimen",
   "order": 21
  },
  {
   "id": "document-system",
   "title": "Document & system",
   "order": 22
  },
  {
   "id": "motion-kinetic",
   "title": "Motion & kinetic",
   "order": 23
  },
  {
   "id": "layout-systems",
   "title": "Layout systems",
   "order": 24
  },
  {
   "id": "in-situ",
   "title": "In situ",
   "order": 25
  },
  {
   "id": "excluded-terms",
   "title": "Excluded terms",
   "order": 16,
   "note": "Effects a field is assumed to forbid. Each entry builds the excluded term by hand and grades it: allowed after all, genuinely forbidden, or merely speculative."
  },
  {
   "id": "unfiled",
   "title": "Unfiled",
   "order": 99
  }
 ],
 "redirects": {},
 "styles": [
  {
   "id": "riso-xerox",
   "title": "Riso / Xerox",
   "summary": "Duplicator and copier reproduction. A field is screened, a second drum misses register, and coverage fails as pinholes. The failures are press facts, never filters.",
   "palette": [
    "#e8531f",
    "#4a54cf",
    "#141210",
    "#e4e0d6",
    "#c2452c"
   ],
   "type": {
    "display": "Anton",
    "text": "EB Garamond",
    "mono": "JetBrains Mono",
    "script": "Caveat"
   },
   "texture": [
    "dot-screen",
    "toner-starve",
    "misregistration",
    "paper-tooth",
    "edge-burn",
    "feed-jitter"
   ],
   "engines": [
    "_engines/raster.js",
    "_engines/rng.js",
    "_engines/field.js",
    "_engines/halftone.js",
    "_engines/paper.js",
    "_engines/scene.js"
   ],
   "rules": [
    "A photograph is a generated greyscale SCENE that is then reproduced. Never a gradient standing in for one.",
    "Misregistration is the consequence of a second drum — its own seed, its own offset, its own twist. Never a drawn stroke or a copied layer.",
    "Coverage failure (pinholes, edge burn) belongs to the ink, so it happens where there is enough ink to fail. Small type does not starve.",
    "The hand layer — marker, fineliner, pen — is applied AFTER printing and therefore takes the light but not the ink.",
    "Vinyl is not paper: a kiss-cut sticker gets a white lip, a sheen and a contact shadow, and no print filter at all."
   ],
   "entries": [
    "b1-photocopy-collage",
    "b2-riso-brush",
    "c1-heavy-ink",
    "d4-riso-print-set",
    "d6-social-tiles"
   ]
  },
  {
   "id": "display-specimen",
   "title": "Display specimen",
   "summary": "One family, shown at the sizes it was drawn for. The plate exists to let the letterforms be judged, so anything that is not the type has to justify itself.",
   "palette": [
    "#141210",
    "#ef5322",
    "#f4c20d",
    "#2aa355",
    "#f2f2f3"
   ],
   "type": {
    "display": "Anton",
    "text": "Archivo",
    "mono": "JetBrains Mono",
    "script": "Caveat"
   },
   "texture": [
    "ink-chain",
    "overflow-crop",
    "kiss-cut vinyl",
    "none"
   ],
   "engines": [
    "_engines/raster.js",
    "_engines/rng.js",
    "_engines/field.js",
    "_engines/halftone.js",
    "_engines/paper.js",
    "_engines/scene.js"
   ],
   "rules": [
    "No second family as a contrast device. A contrast of size is not a contrast of voice.",
    "Ink-chain amplitude follows type size: a display word may starve, an eight-point label may not.",
    "A crop is a real crop — overflow, not a letter drawn short.",
    "A screen piece gets no grain. Grain on a screen fakes a print that never happened."
   ],
   "entries": [
    "d3-interlocking-stack",
    "b4-program-spread",
    "d1-inline-annotation",
    "t1-type-specimen",
    "t8-blobby-display",
    "d2-circled-glyphs",
    "c3-kinetic-type",
    "c4-ribbon-type",
    "t5-brutalist-grid"
   ]
  },
  {
   "id": "editorial-serif",
   "title": "Editorial serif",
   "summary": "A serif set at optical size, hairlines that are exact, and paper that is present but silent. Archival print: the press does not fail here.",
   "palette": [
    "#0b0b0c",
    "#ede8df",
    "#6b1f1f",
    "#d6d1c7",
    "#141414"
   ],
   "type": {
    "display": "Fraunces",
    "text": "EB Garamond",
    "mono": "JetBrains Mono",
    "script": "Caveat"
   },
   "texture": [
    "paper-tooth",
    "stage-falloff",
    "contact-shadow",
    "hairline"
   ],
   "engines": [
    "_engines/raster.js",
    "_engines/rng.js",
    "_engines/scene.js"
   ],
   "rules": [
    "Optical size is bound to rendered size. A display cut and a text cut are one family answering one question at two scales.",
    "Paper is under the ink and multiplied through it, so type sits IN the sheet. Grain over the top is an effect without a cause.",
    "One light. Every shadow in the plate falls the same way, including the ones inside objects.",
    "Hairlines are exact. If a rule is blurred the page is not drafted, it is drawn."
   ],
   "entries": [
    "e1-type-stack",
    "c6-dossier",
    "c2-style-guide",
    "d5-story-triptych"
   ]
  },
  {
   "id": "swiss-modular",
   "title": "Swiss modular",
   "summary": "Grids, systems and the arguments against them. Digital-clean: one-pixel rules, integer tracks, and no texture anywhere.",
   "palette": [
    "#0f0f11",
    "#2f5fd6",
    "#f2f2f3",
    "#ffffff",
    "#98989e"
   ],
   "type": {
    "display": "Fraunces",
    "text": "Inter",
    "mono": "JetBrains Mono"
   },
   "texture": [
    "none",
    "hairline",
    "tinted-track"
   ],
   "engines": [
    "_engines/raster.js",
    "_engines/rng.js",
    "_engines/scene.js"
   ],
   "rules": [
    "Track widths are snapped to integers before anything is drawn, so hairlines land on device pixels.",
    "One accent colour on the whole sheet, and it means \"interactive\" or it means nothing.",
    "A photo area holds a generated scene. A CSS gradient standing in for a photograph makes a mockup look finished while proving nothing.",
    "No texture. This is a screen and it says so."
   ],
   "entries": [
    "b5-brand-guide-grid",
    "e2-modular-grid",
    "e3-bento-grid",
    "e6-device-mockups"
   ]
  },
  {
   "id": "technical-doc",
   "title": "Technical document",
   "summary": "A document that looks like the machine that made it. Punches, ticks, a barcode, a grid — and no ornament of any kind.",
   "palette": [
    "#0a0a0b",
    "#ffffff",
    "#9a9aa0",
    "#eaeaec"
   ],
   "type": {
    "display": "Archivo",
    "text": "Fraunces",
    "mono": "JetBrains Mono"
   },
   "texture": [
    "punched-hole",
    "hairline-grid",
    "barcode",
    "drafting-line",
    "hatch"
   ],
   "engines": [],
   "rules": [
    "Every hole is a real hole: the ground shows through, with an inner shadow for the thickness and a lit lip below.",
    "The only non-text mark is a legend. Ornament is not allowed on a spec sheet.",
    "Signatures are fineliner and never starve — a pen is not a press.",
    "No raster on a drawing sheet. If it needs grain to look finished it is not finished."
   ],
   "entries": [
    "c5-spec-sheet",
    "crx01-instrument-typology",
    "birefringent-ray-bench"
   ]
  },
  {
   "id": "atmospheric",
   "title": "Atmospheric field",
   "summary": "Colour fields painted small and upscaled, where the upscale is the blur and the grain is the emulsion. The picture and the type share one film.",
   "palette": [
    "#e7e3d9",
    "#1a1815",
    "#2b57d6",
    "#dcd9d1",
    "#0a0a0a"
   ],
   "type": {
    "display": "Fraunces",
    "text": "Archivo",
    "mono": "JetBrains Mono",
    "script": "Caveat"
   },
   "texture": [
    "grain-gradient",
    "elliptical-belt",
    "film-grain",
    "dot-screen",
    "watercolour-wash",
    "granulation",
    "edge-pooling"
   ],
   "engines": [
    "_engines/raster.js",
    "_engines/rng.js",
    "_engines/field.js",
    "_engines/halftone.js",
    "_engines/paper.js",
    "_engines/scene.js"
   ],
   "rules": [
    "Bodies are belts, not blobs. A chain of radial gradients is the AI-gradient tell and it has no field underneath.",
    "The blur IS the upscale. A separate blur pass is an effect looking for a cause.",
    "The film layer sits ABOVE the type, so the words are in the picture rather than on it."
   ],
   "entries": [
    "e4-masonry-cards",
    "e5-case-card"
   ]
  }
 ],
 "skills": [
  {
   "id": "composing-computational-material-systems",
   "title": "Composing computational material systems",
   "role": "critiques",
   "rung": 2,
   "note": "The material-systems rung: one source, several consequences, one read; the five tests (shared cause, distinct jobs, order dependence, single read, removal test) and the six anti-patterns."
  },
  {
   "id": "composing-computational-sound-systems",
   "title": "Composing computational sound systems",
   "role": "critiques",
   "rung": 2,
   "note": "The sound-systems rung: parallels the material-systems rung for audio. Its five tests are the visual ones translated (shared cause · distinct voices · signal path order · single listen · the MUTE TEST). REVIEW-SOUND §1: 34 of 47 inventory rows have no governing skill; the rung is unbuilt on the skill side, filed against on the entry side."
  },
  {
   "id": "body-of-work-variation",
   "title": "Body-of-work variation",
   "role": "critiques",
   "rung": 3,
   "stub": true,
   "note": "LATER RUNG · unbuilt. A brand of work carries a shape across pieces, not inside one. This rung is empty on purpose — it calls DOWN into the two rung-2 skills for per-piece coherence."
  },
  {
   "id": "type-as-material",
   "title": "Type as material · editorial motion",
   "role": "critiques",
   "rung": 3,
   "stub": true,
   "note": "LATER RUNG · unbuilt. Type as a material governed by the same tests as the field around it, and editorial motion that has a metre. Calls DOWN into material-systems."
  },
  {
   "id": "art-direct-to-supplied-canon",
   "title": "Art-direct to a supplied canon",
   "role": "critiques",
   "rung": 3,
   "stub": true,
   "note": "LATER RUNG · unbuilt. Reading a canon file (a brand, a client, an established body) and enforcing it as a hard constraint, not an inspiration. Calls DOWN into material-systems."
  },
  {
   "id": "production-and-handoff",
   "title": "Production and handoff",
   "role": "governs",
   "rung": 3,
   "stub": true,
   "note": "LATER RUNG · unbuilt. From critique to shipped artefact — colour management, DPI, print pass, engineering handoff, version discipline. Calls DOWN into all rung-1 skills."
  },
  {
   "id": "canvas-design",
   "title": "Canvas design",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "frontend-design",
   "title": "Frontend design",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "creative-hifi-frontend",
   "title": "Creative hi-fi frontend",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "technical-illustration",
   "title": "Technical illustration",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "patent-figure-drawing",
   "title": "Patent-figure drawing",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "technical-svg-diagrams",
   "title": "Technical SVG diagrams",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "headless-render",
   "title": "Headless render",
   "role": "governs",
   "rung": 1
  },
  {
   "id": "algorithmic-art",
   "title": "Algorithmic art",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "brand-world",
   "title": "Brand world",
   "role": "governs",
   "rung": 2
  },
  {
   "id": "dataviz",
   "title": "Data visualization",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "sell-sheet",
   "title": "Sell sheet",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "ki-brief",
   "title": "Ki brief",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "components-craft",
   "title": "Components craft",
   "role": "governs",
   "rung": 1
  },
  {
   "id": "material-systems-direction",
   "title": "Material systems direction",
   "role": "critiques",
   "rung": 3
  },
  {
   "id": "artifact-diagramming",
   "title": "Artifact diagramming",
   "role": "produces",
   "rung": 1
  },
  {
   "id": "proof-cleanup-upscale",
   "title": "Proof cleanup & upscale",
   "role": "produces",
   "rung": 1
  }
 ],
 "entries": [
  {
   "id": "paper-tooth",
   "title": "Paper tooth",
   "order": 1010,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "texture",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "components-craft",
    "composing-computational-material-systems"
   ],
   "description": "Mean-preserving fibre pattern at ~30% depth. The consequence of a substrate, not the substrate itself.",
   "params": [
    {
     "name": "depth",
     "min": 0,
     "max": 60,
     "value": 22,
     "step": 1,
     "note": "per-pixel amplitude ±"
    },
    {
     "name": "seed",
     "min": 1,
     "max": 9999,
     "value": 4141,
     "step": 1
    },
    {
     "name": "fibres",
     "min": 0,
     "max": 40,
     "value": 16,
     "step": 1,
     "note": "faint horizontal fibres"
    }
   ],
   "note": "Multiplied under the sheet — the tooth perturbs BOTH ways rather than only darkening (Ki-Landscapes/index.html:116-131). See W1 for the instance at 180 px / soft-light / mean-preserving true."
  },
  {
   "id": "dot-screen-20",
   "title": "Dot screen · 20°",
   "order": 1020,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "texture",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "components-craft"
   ],
   "description": "The register-tolerant halftone. 65 lpi at 20° — a reproduction, not a filter.",
   "params": [
    {
     "name": "cell",
     "min": 3,
     "max": 14,
     "value": 6,
     "step": 1,
     "note": "lattice pitch"
    },
    {
     "name": "angle",
     "min": 0,
     "max": 90,
     "value": 20,
     "step": 1,
     "note": "degrees"
    },
    {
     "name": "gain",
     "min": 0.4,
     "max": 1.2,
     "value": 0.72,
     "step": 0.02,
     "note": "dot radius multiplier"
    }
   ],
   "note": "The riso/xerox halftone. Six copies in the corpus (research/05 §7). 20° is the register-tolerant classic; other angles exist."
  },
  {
   "id": "bayer8",
   "title": "Bayer 8×8 threshold",
   "order": 1030,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "texture",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "description": "The ordered dither matrix. Decides which of two quantized levels a pixel takes.",
   "params": [
    {
     "name": "levels",
     "min": 2,
     "max": 8,
     "value": 2,
     "step": 1,
     "note": "quantization steps"
    },
    {
     "name": "scale",
     "min": 1,
     "max": 8,
     "value": 3,
     "step": 1,
     "note": "pixels per cell"
    }
   ],
   "note": "Two copies in the corpus. Chapter 20 (dithering) is the technique that uses it, W2 (depth-aware dither) is the exploration that pins it to depth."
  },
  {
   "id": "ink-chain",
   "title": "Ink chain (feDisplacementMap)",
   "order": 1035,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "texture",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "components-craft",
    "composing-computational-material-systems"
   ],
   "description": "feTurbulence + feDisplacementMap, opaque brush edge. Three tools from ONE parameterised generator.",
   "params": [
    {
     "name": "freq",
     "min": 0.005,
     "max": 0.08,
     "value": 0.02,
     "step": 0.001,
     "note": "turbulence base freq"
    },
    {
     "name": "amp",
     "min": 1,
     "max": 24,
     "value": 8,
     "step": 1,
     "note": "displacement scale"
    },
    {
     "name": "seed",
     "min": 1,
     "max": 999,
     "value": 42,
     "step": 1
    }
   ],
   "note": "Three copies in the corpus, differing only in freq and scale. The one thing this atom encodes: the edge stays opaque — a chain is a wobble on ink, not a fade in it."
  },
  {
   "id": "edge-bloom",
   "title": "Edge bloom",
   "order": 1050,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "texture",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "description": "Stamped crest strip that carries the pooling INSIDE it — pooling belongs after, not before.",
   "params": [
    {
     "name": "width",
     "min": 4,
     "max": 40,
     "value": 14,
     "step": 1
    },
    {
     "name": "seed",
     "min": 1,
     "max": 999,
     "value": 33,
     "step": 1
    }
   ],
   "note": "W1 pass 4 of 7."
  },
  {
   "id": "two-drum-riso",
   "title": "Two-drum offset",
   "order": 1300,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "process",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "components-craft",
    "composing-computational-material-systems"
   ],
   "description": "Two-colour riso pass. Drum 01 prints, drum 02 misses register by ~2.4 mm.",
   "params": [
    {
     "name": "offset-x",
     "min": 0,
     "max": 6,
     "value": 2.4,
     "step": 0.1,
     "note": "mm"
    },
    {
     "name": "offset-y",
     "min": -3,
     "max": 3,
     "value": 1.1,
     "step": 0.1,
     "note": "mm"
    },
    {
     "name": "twist",
     "min": -3,
     "max": 3,
     "value": 0.4,
     "step": 0.1,
     "note": "degrees"
    }
   ],
   "note": "Misregistration is the consequence of a second drum — its own seed, its own offset, its own twist. Never a drawn stroke or a copied layer (riso-xerox style rule 2)."
  },
  {
   "id": "xerox-degradation",
   "title": "Xerox degradation",
   "order": 1310,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "process",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "components-craft"
   ],
   "description": "Photocopy generational loss. Toner starve, edge burn, feed jitter — coverage fails where there is enough ink to fail.",
   "params": [
    {
     "name": "generations",
     "min": 1,
     "max": 8,
     "value": 3,
     "step": 1
    },
    {
     "name": "starve",
     "min": 0,
     "max": 60,
     "value": 24,
     "step": 1
    },
    {
     "name": "jitter",
     "min": 0,
     "max": 6,
     "value": 1.5,
     "step": 0.1
    }
   ],
   "note": "Coverage failure (pinholes, edge burn) belongs to the ink, so it happens where there is enough ink to fail. Small type does not starve."
  },
  {
   "id": "oklab-ramp",
   "title": "OKLab colour ramp",
   "order": 1400,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "colour",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "description": "A ramp interpolated in OKLab, never sRGB. Tuned for a downstream chain — she works in ramps, not hexes.",
   "params": [
    {
     "name": "stops",
     "min": 3,
     "max": 12,
     "value": 7,
     "step": 1,
     "note": "number of stops"
    },
    {
     "name": "lightness",
     "min": 0.2,
     "max": 0.85,
     "value": 0.55,
     "step": 0.01,
     "note": "midpoint L*"
    }
   ],
   "note": "A ramp interpolated in OKLab. `colour` holds ramps only. Two copies in the corpus; MIR-21 tunes an ATMOSPHERIC set for the downstream chain."
  },
  {
   "id": "fbm-noise",
   "title": "fBm value noise",
   "order": 1600,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "field",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "description": "Fractal-Brownian noise. Chapter 13 as a reusable field — four copies in the corpus.",
   "params": [
    {
     "name": "octaves",
     "min": 1,
     "max": 8,
     "value": 5,
     "step": 1
    },
    {
     "name": "lacunarity",
     "min": 1.5,
     "max": 3,
     "value": 2,
     "step": 0.1
    },
    {
     "name": "gain",
     "min": 0.2,
     "max": 0.9,
     "value": 0.5,
     "step": 0.05
    }
   ],
   "note": "The output of chapter 13 as a reusable field. Four copies (research/05 §7)."
  },
  {
   "id": "mulberry32",
   "title": "mulberry32(seed)",
   "order": 1700,
   "lane": "canvas2d",
   "entity": "atom",
   "kind": "engine",
   "section": "atoms",
   "status": "canonical",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "description": "Seeded PRNG. Fifteen copies in the monolith, one now — the strongest dedup case in the corpus.",
   "note": "The seeded PRNG under every field in the corpus. Fifteen copies in the monolith under fifteen names; the audit at research/05 §7 caught eleven and two more hid inside object literals. content/_engines/rng.js."
  },
  {
   "id": "freeverb-comb",
   "title": "Freeverb comb filter",
   "order": 1800,
   "lane": "audio",
   "entity": "atom",
   "kind": "space",
   "section": "atoms",
   "status": "canonical",
   "governed_by": [
    "composing-computational-sound-systems"
   ],
   "description": "A delay in a feedback loop, damped by a lowpass inside the loop. Six copies for parallel comb bank.",
   "params": [
    {
     "name": "delay",
     "min": 0.02,
     "max": 0.06,
     "value": 0.037,
     "step": 0.001,
     "note": "seconds"
    },
    {
     "name": "feedback",
     "min": 0.5,
     "max": 0.86,
     "value": 0.84,
     "step": 0.01,
     "note": "gain around the loop; cap 0.86 (see P1 fault)"
    },
    {
     "name": "damping",
     "min": 800,
     "max": 12000,
     "value": 4500,
     "step": 100,
     "note": "in-loop lowpass Hz"
    }
   ],
   "note": "One delay line + a gain node + a lowpass IN the feedback path. Eight of these summed at 1/8 is the Freeverb comb bank. reliquary-synth/src/audio/CathedralReverb.ts:58-84."
  },
  {
   "id": "allpass-diffuser",
   "title": "Allpass diffuser",
   "order": 1810,
   "lane": "audio",
   "entity": "atom",
   "kind": "space",
   "section": "atoms",
   "status": "canonical",
   "governed_by": [
    "composing-computational-sound-systems"
   ],
   "description": "Feed-forward + feed-back at −0.5 / +0.5 around one delay. Smears echo density without shifting spectrum.",
   "params": [
    {
     "name": "delay",
     "min": 0.003,
     "max": 0.02,
     "value": 0.011,
     "step": 0.001,
     "note": "seconds"
    },
    {
     "name": "feedback",
     "min": 0.3,
     "max": 0.7,
     "value": 0.5,
     "step": 0.01
    }
   ],
   "note": "Four in series after the comb bank; the point is to break up individual echoes without recolouring the room. reliquary-synth/src/audio/CathedralReverb.ts:86-111."
  },
  {
   "id": "master-limiter",
   "title": "Master compressor + limiter",
   "order": 1820,
   "lane": "audio",
   "entity": "atom",
   "kind": "bus",
   "section": "atoms",
   "status": "canonical",
   "governed_by": [
    "composing-computational-sound-systems"
   ],
   "description": "Two DynamicsCompressorNodes as two different devices, by parameters alone.",
   "params": [
    {
     "name": "comp-thresh",
     "min": -36,
     "max": -6,
     "value": -24,
     "step": 1,
     "note": "compressor threshold dBFS"
    },
    {
     "name": "lim-thresh",
     "min": -12,
     "max": 0,
     "value": -3,
     "step": 1,
     "note": "limiter threshold dBFS"
    },
    {
     "name": "trim",
     "min": 0.5,
     "max": 1,
     "value": 0.8,
     "step": 0.05,
     "note": "input trim"
    }
   ],
   "note": "Broadband glue → hard peak-catcher → destination. The smallest complete master chain in the corpus. reliquary-synth/src/audio/MasterChain.ts:1-33."
  },
  {
   "id": "sidechain-duck",
   "title": "Sidechain duck",
   "order": 1830,
   "lane": "audio",
   "entity": "atom",
   "kind": "bus",
   "section": "atoms",
   "status": "canonical",
   "governed_by": [
    "composing-computational-sound-systems"
   ],
   "description": "Heavy voices duck the room and the ambience. cancelScheduledValues + setTargetAtTime for click-free release.",
   "params": [
    {
     "name": "depth",
     "min": 0.1,
     "max": 1,
     "value": 0.3,
     "step": 0.05,
     "note": "gain at fully ducked"
    },
    {
     "name": "attack",
     "min": 0.001,
     "max": 0.03,
     "value": 0.005,
     "step": 0.001,
     "note": "seconds; tau"
    },
    {
     "name": "release",
     "min": 0.05,
     "max": 0.5,
     "value": 0.15,
     "step": 0.01,
     "note": "seconds; tau"
    }
   ],
   "note": "The click-free ducking pattern is `cancelScheduledValues` before `setTargetAtTime`, not before `setValueAtTime` — the release is a curve, not a jump. holy-ops-v2/index.html:2318-2345."
  },
  {
   "id": "banded-burst",
   "title": "Banded noise burst",
   "order": 1840,
   "lane": "audio",
   "entity": "atom",
   "kind": "voice",
   "section": "atoms",
   "status": "canonical",
   "governed_by": [
    "composing-computational-sound-systems"
   ],
   "description": "The corpus's whole percussion section: noise → bandpass → AR envelope. One atom carries every foley hit.",
   "params": [
    {
     "name": "freq",
     "min": 60,
     "max": 5000,
     "value": 1400,
     "step": 10
    },
    {
     "name": "Q",
     "min": 0.5,
     "max": 12,
     "value": 2.2,
     "step": 0.1
    },
    {
     "name": "duration",
     "min": 0.01,
     "max": 0.3,
     "value": 0.035,
     "step": 0.005,
     "note": "seconds"
    }
   ],
   "note": "src.buffer=whiteNoise → bandpass(freq,Q) → gain envelope (0→peak in 2ms, exp decay). The trailing setValueAtTime(0) at t+dur+0.001 is the fix for exp-never-reaches-zero click, present in her code. pussyphus/.../crowd.js:132-142 + foley.js:39-55."
  },
  {
   "id": "buzz-envelope",
   "title": "Buzz envelope",
   "order": 1850,
   "lane": "audio",
   "entity": "atom",
   "kind": "voice",
   "section": "atoms",
   "status": "exploration",
   "governed_by": [
    "composing-computational-sound-systems"
   ],
   "description": "Filtered noise + slow envelope. One primitive carries a whole class of insect/electrical drones.",
   "params": [
    {
     "name": "centre",
     "min": 200,
     "max": 4000,
     "value": 800,
     "step": 10,
     "note": "bandpass centre Hz"
    },
    {
     "name": "Q",
     "min": 1,
     "max": 20,
     "value": 8,
     "step": 0.5,
     "note": "sharpness"
    },
    {
     "name": "rate",
     "min": 0.1,
     "max": 8,
     "value": 2.5,
     "step": 0.1,
     "note": "amplitude LFO Hz"
    }
   ],
   "note": "Sound INVENTORY §5 addendum: buzz-envelope is one atom that carries a whole percussion section — reliquary-synth/src/audio/BuzzGenerator.ts."
  },
  {
   "id": "depth-aware-dither",
   "title": "Depth-aware dither",
   "order": 2020,
   "lane": "canvas2d",
   "entity": "technique",
   "section": "techniques",
   "status": "canonical",
   "layer": "IMAGE FORMATION",
   "description": "One depth term, four consequences. Bayer-8 threshold biased by scene depth.",
   "produces": [
    "bayer8"
   ],
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "tests": {
    "shared_cause": "Depth (a single per-pixel scalar) drives BOTH the dither threshold bias AND the two-level quantization step.",
    "distinct_job": "The Bayer matrix decides which of two levels a pixel takes; the depth bias decides which two.",
    "order": "Quantize AFTER the depth bias, or the dither picks between the wrong pair of levels.",
    "removal_test": "MIR-12 is this shader with the depth term deleted — a Bayer plate that never separates foreground from background. Kept as the ancestor.",
    "overuse": "A second dither pass over the result is dither without quantization behind it — noise, not a decision."
   },
   "critique": {
    "reads_as": "One room seen through one screen: a clear near figure and a field that becomes grainier, coarser and foggier with distance.",
    "coupling": "Linear depth drives dither strength, level count, scanline visibility and aerial fog. The ordered threshold is not a texture laid over the room; it is one reading of the room’s depth.",
    "pass_order": "Scene and depth → flow tint → bloom → ordered offset → quantization → scanline → vignette. Bloom and threshold must precede the floor or they spread banding and cease to select levels.",
    "operators": [
     "procedural scene + depth",
     "aerial fog",
     "bloom",
     "Bayer offset",
     "quantizer",
     "scanline",
     "vignette"
    ],
    "why_it_survives": "The ancestor with the depth term removed is already on the page: the treatment becomes uniform, the foreground no longer separates, and the filter loses its relation to the room."
   },
   "note": "One depth term, four consequences. W2 is the canonical instance; MIR-12 is its ancestor."
  },
  "b1-photocopy-collage",
  "b2-riso-brush",
  "c1-heavy-ink",
  "d4-riso-print-set",
  "d6-social-tiles",
  "e1-type-stack",
  "d3-interlocking-stack",
  "b4-program-spread",
  "d1-inline-annotation",
  "t1-type-specimen",
  "t8-blobby-display",
  "d2-circled-glyphs",
  "c5-spec-sheet",
  "c6-dossier",
  "c2-style-guide",
  "b5-brand-guide-grid",
  "crx01-instrument-typology",
  "birefringent-ray-bench",
  "c3-kinetic-type",
  "c4-ribbon-type",
  "e2-modular-grid",
  "e3-bento-grid",
  "e4-masonry-cards",
  "e5-case-card",
  "t5-brutalist-grid",
  "d5-story-triptych",
  "e6-device-mockups",
  "io-01",
  {
   "id": "oklab-ramp-driver",
   "title": "OKLab colour ramp as driver",
   "order": 1690,
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "lane": "canvas2d",
   "layer": "GRAPHIC COMPOSITION",
   "description": "Interpolate colour as perceived lightness plus opponent axes, so a field can cross hue without acquiring a false dark seam or a chalky midpoint.",
   "produces": [
    "oklab-ramp"
   ],
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "tests": {
    "shared_cause": "One pair of endpoints and one scalar t drive L, a and b together; every consumer reads the same perceptual path.",
    "distinct_job": "Lightness carries value structure while the a/b axes carry hue and chroma. Interpolation keeps those jobs legible instead of mixing them in gamma-encoded RGB.",
    "order": "Convert endpoints to OKLab → interpolate L/a/b → convert once to display RGB → clamp at the output boundary.",
    "removal_test": "Replace the ramp with a direct RGB lerp and the midpoint changes weight: dark seams or greyed colour appear where the field itself is smooth.",
    "overuse": "Independent ramps for every layer destroy the shared value structure. One field needs one colour grammar, with local deviations justified by a different job."
   }
  },
  {
   "id": "mulberry32-driver",
   "title": "mulberry32(seed) as driver",
   "order": 1700,
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "lane": "canvas2d",
   "layer": "SOURCE",
   "description": "Treat the seed as the plate identity. One repeatable sequence drives every stochastic decision, so a changed parameter produces a changed picture—not an untraceable new draw.",
   "produces": [
    "mulberry32"
   ],
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "tests": {
    "shared_cause": "One printed seed initializes the plate and feeds grain, placement, coverage failure and registration offsets through named streams.",
    "distinct_job": "The generator supplies a deterministic sequence; each consumer decides what a sample means. Randomness is a source, not a visual layer.",
    "order": "Create or derive each stream once → generate structure → reproduce it. Reseeding inside a loop repeats values instead of producing variation.",
    "removal_test": "Replace mulberry32 with Math.random and two renders with identical settings no longer agree; the plate loses both identity and debuggability.",
    "overuse": "Sharing the same sample between unrelated properties creates visible correlation. Derive stable sub-seeds for independent jobs instead of consuming one stream opportunistically."
   }
  },
  {
   "id": "dot-screen-20-driver",
   "title": "Dot screen · 20° as driver",
   "order": 1710,
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "lane": "canvas2d",
   "layer": "IMAGE FORMATION",
   "description": "Map image tone to dot area on one lattice turned 20°. Pitch decides detail, angle decides direction, and radius alone carries coverage.",
   "produces": [
    "dot-screen-20"
   ],
   "governed_by": [
    "components-craft"
   ],
   "tests": {
    "shared_cause": "One luminance or ink-coverage field drives the radius of every dot on a single 20° lattice.",
    "distinct_job": "Pitch sets the reproduction resolution, angle sets the screen direction, and dot radius encodes tone. Moving one must not impersonate another.",
    "order": "Read coverage → rotate into screen space → locate the lattice cell → compare distance to the tone-driven radius.",
    "removal_test": "Replace the dots with a solid alpha fill and the image keeps its silhouette but loses the declared reproduction process.",
    "overuse": "A second near-angle screen creates moiré. That interference is useful only when it is the subject, not a side effect of adding texture."
   }
  },
  {
   "id": "fbm-noise-driver",
   "title": "fBm value noise as driver",
   "order": 1720,
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "lane": "canvas2d",
   "layer": "SOURCE",
   "description": "Build one continuous field from weighted octaves, then let depth, shade, flow or atmosphere read that same terrain at different points in the chain.",
   "produces": [
    "fbm-noise"
   ],
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "tests": {
    "shared_cause": "One seeded value field, sampled at several frequencies, supplies every downstream reading of the terrain.",
    "distinct_job": "Octaves add scale to the field; consumers assign jobs such as height, direction or opacity. The noise does not decide the picture by itself.",
    "order": "Hash lattice values → interpolate each octave → weight and sum → normalize once → derive all downstream consequences.",
    "removal_test": "Give each effect an independent noise call and the image becomes a stack of unrelated textures: shade, flow and depth stop describing the same surface.",
    "overuse": "Octaves smaller than a pixel add aliasing and cost, not detail. Stop when the next frequency cannot survive the output resolution."
   }
  },
  {
   "id": "caustic-refraction-web",
   "title": "Caustic refraction web",
   "order": 2035,
   "lane": "fragment",
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "fragment": "fragment.html",
   "thumb": "thumb.png",
   "frame": {
    "designWidth": 1100,
    "aspect": "1100/760",
    "previewHeight": 760
   },
   "layer": "MATERIAL RESPONSE",
   "description": "A wavy interface refracts a sheet of light; where the ray map folds, light piles into the bright caustic web. One height field, all the folds and voids.",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "produces": [
    "edge-bloom"
   ],
   "tests": {
    "shared_cause": "A single seeded height field h(x,y) drives the whole ray map P = (x,y) + κ·∇h; the fold caustics and the divergence voids are both consequences of that one field.",
    "distinct_job": "The folds emit the bright edge (edge-bloom); the voids read as the dark ground. Different consequences, one map.",
    "order": "Refract first (accumulate the ray map), then read intensity as 1/|det J|. Painting bright lines directly, without the map, is decoration with no cause.",
    "removal_test": "Set κ to zero: the map is the identity and the plate is a flat grey — no folds, no web. The caustic exists only because the interface bends the rays.",
    "overuse": "Cranking κ past fold-over stacks so many sheets that the web closes into cells and the singularity is lost in ink — the field asked to prove it can do more."
   },
   "note": "Optics territory. The physical cause upstream of edge-bloom: a caustic is a refracted brightness edge. The working plate is content/caustic-refraction-web/fragment.html."
  },
  {
   "id": "keyline-coverage-chain",
   "title": "Keyline & coverage chain",
   "order": 2040,
   "lane": "fragment",
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "fragment": "fragment.html",
   "thumb": "thumb.png",
   "layer": "IMAGE FORMATION",
   "description": "Separate the ink run from the per-colour fill runs, then vary only the ink grammar. One keyline (hand-wavered, misregistered), each colour its own coverage plate, grain + tooth to finish.",
   "governed_by": [
    "components-craft",
    "composing-computational-material-systems"
   ],
   "produces": [
    "ink-chain"
   ],
   "tests": {
    "shared_cause": "One seed drives the whole sheet: keyline hand-waver, every coverage plate, grain and tooth all read from it.",
    "distinct_job": "The ink run carries the drawing (one keyline); coverage runs carry colour (one plate per ink); grain and tooth carry the substrate.",
    "order": "Fills first through their coverage plates, then the ONE keyline shifted off them, then grain, then tooth.",
    "removal_test": "Remove the misregistration + hand-waver and the plate collapses to grammar (a), clean vector clip-art.",
    "overuse": "Stacking two ink grammars on one plate is the vibe stack; the six are alternatives, not layers."
   },
   "note": "Material Studies II. Produces ink-chain. fragment.html houses the engine in the canonical plate frame."
  },
  {
   "id": "moire-aliasing",
   "title": "Moiré · sampling made visible",
   "order": 2045,
   "lane": "fragment",
   "entity": "technique",
   "section": "techniques",
   "status": "proposed",
   "fragment": "fragment.html",
   "thumb": "thumb.png",
   "frame": {
    "designWidth": 1100,
    "aspect": "1100/760",
    "previewHeight": 760
   },
   "layer": "IMAGE FORMATION",
   "description": "Overprint a fine ruling with a copy of itself turned a few degrees, and a slow light-and-dark banding appears at a pitch neither ruling contains. One periodic field sampling another — the act of sampling, drawn.",
   "governed_by": [
    "composing-computational-material-systems"
   ],
   "tests": {
    "shared_cause": "One ruling pitch p and one angle theta drive everything: grating A at 0 deg and grating B — the same grating — at theta. The bands are the beat of those two, not an overlay painted on top.",
    "distinct_job": "Coincidence bands read light (open gaps); interleave bands read dark (filled gaps). The same two rulings, opposite consequence a quarter-beat apart.",
    "order": "Rule both gratings first, then read their overprint union D = 1 - (1 - oA)(1 - oB). Painting the bands directly, without the two rulings underneath, is decoration with no cause.",
    "removal_test": "Set theta to 0: the two rulings coincide, the beat pitch P = p / 2 sin(theta/2) runs to infinity, and the banding is gone — the surest sign it was never in either grating alone.",
    "overuse": "Turn theta past a few degrees and the beat pitch collapses toward the carrier: the broad envelope dissolves into a rotated cross-hatch texture and the moiré reading is lost."
   },
   "note": "Image-processing / reflexive thread. Samples the archive's own screens — dot-screen-20 and bayer8 are periodic rulings this technique beats against a second ruling. Atom-free (no new swatch). The working plate is content/moire-aliasing/fragment.html."
  }
 ]
});
