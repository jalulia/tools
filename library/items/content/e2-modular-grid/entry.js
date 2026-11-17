/* E2 · 12-column modular grid — ref Swiss modular
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "e2-modular-grid",
  "index": "E2",
  "order": 200,
  "title": "12-column modular grid",
  "section": "layout-systems",
  "style": "swiss-modular",
  "status": "canonical",
  "tags": [
    "Grid",
    "Swiss",
    "System"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Swiss modular"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/928",
    "previewHeight": 928
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.01,
      0
    ]
  },
  "text": "<p>A twelve-track, twenty-four-gutter modular grid on a white page, with every edge landing on a track. Digital-clean: one-pixel hairlines and tinted tracks.</p> <p>The track widths are snapped to integers in script and published as a custom property, so the hairlines are pixel-exact instead of half-covering two device pixels. A grid whose own rules are blurry is not a grid.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "white screen page"
    },
    {
      "k": "Process",
      "v": "digital-clean; 1px hairlines, tinted tracks"
    },
    {
      "k": "Type",
      "v": "Fraunces italic display + Archivo body + mono meta, every edge on a track"
    },
    {
      "k": "Hardware",
      "v": "none"
    },
    {
      "k": "Skeleton",
      "v": "12 tracks / 24 gutter, integer track widths (JS snap → --md-w) so hairlines are pixel-exact."
    }
  ],
  "critique": {
    "reads_as": "A grid you could hand to someone and have them build the page.",
    "coupling": "One measured track width, snapped to an integer and published as a custom property, drives every column, gutter and rule position.",
    "pass_order": "measure → snap → lay out → draw hairlines. Drawing before snapping is what makes half-pixel rules.",
    "operators": [
      "integer track snap",
      "hairline rule",
      "tinted track"
    ],
    "why_it_survives": "Leave the tracks fractional and every rule blurs, which makes the grid an illustration of a grid.",
    "faults": [
      "X-placeholder figure → generated grey still life",
      "fractional track widths (blurred hairlines) → snapped"
    ]
  },
  "related": [
    {
      "entry": "e3-bento-grid",
      "relation": "variant-of"
    }
  ]
});
