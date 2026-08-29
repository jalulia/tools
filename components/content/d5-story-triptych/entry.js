/* D5 · Editorial story triptych — ref XENO
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "d5-story-triptych",
  "index": "D5",
  "order": 260,
  "title": "Editorial story triptych",
  "section": "in-situ",
  "style": "editorial-serif",
  "status": "canonical",
  "tags": [
    "9:16 story",
    "Archival",
    "Hairline",
    "Justified"
  ],
  "source": {
    "kind": "reference-study",
    "title": "XENO"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/630",
    "previewHeight": 630
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.5,
      0
    ]
  },
  "text": "<p>Three 9:16 cards on a pale desk under one lamp: a bone card, a gold ring-bound notebook, a slate card. Archival print, not riso — hairline rules, small caps, true justification with hyphenation.</p> <p>The binding is the test. Twin-wire loops are metal — a banded gradient with a specular and a rim — passing through punched holes that cast a shadow into the page, and the page sits on the cover with a lip shadow. An SVG pattern of rings would have been half the work and would have read as clip-art.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "three printed cards on a pale desk under one soft lamp (top-left) — bone card, gold ring-bound notebook, slate card; each card has tooth; the desk has a radial falloff; shadows are tight, cool-tinted, contact + short ambient"
    },
    {
      "k": "Process",
      "v": "digital-clean archival print (no riso here): hairline rules, small caps, true justification with hyphenation"
    },
    {
      "k": "Type",
      "v": "Fraunces light display, EB Garamond text, JetBrains Mono metadata (crisp, always outside filters), Caveat-free — the signature is a drawn pen path through markerInk"
    },
    {
      "k": "Hardware",
      "v": "twin-wire ring binding: METAL wire loops (banded gradient + specular + rim) through punched holes that cast a shadow into the page; the page sits on the cover with a lip shadow"
    },
    {
      "k": "Skeleton",
      "v": "row of three · caption line."
    }
  ],
  "critique": {
    "reads_as": "Three printed cards on a desk, one of them ring-bound, photographed under one lamp.",
    "coupling": "One lamp drives the desk falloff, each card’s tooth and every shadow; the ring holes, their shadow into the page and the page’s lip on the cover all come from one binding geometry.",
    "pass_order": "desk → cards → tooth → archival type → punched holes → wire loops → shadows last.",
    "operators": [
      "twin-wire binding",
      "paper tooth",
      "true justification",
      "pen path"
    ],
    "why_it_survives": "Draw the rings as an SVG pattern and the notebook becomes clip-art; drop the stage light and the three cards become floating cutouts.",
    "faults": [
      "rings were a flat SVG pattern (clip-art)",
      "papers had no stage light or shadow (floating cutouts)",
      "frame 3 footer inherited the gallery's global .foot rule (jumped into the passage)",
      "frame 2 page header inherited the global .ph placeholder background",
      "the signature was a clean vector"
    ]
  }
});
