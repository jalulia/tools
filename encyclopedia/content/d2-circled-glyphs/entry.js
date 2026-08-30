/* D2 · Circled-glyph specimen — ref Konsumed
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "d2-circled-glyphs",
  "index": "D2",
  "order": 130,
  "title": "Circled-glyph specimen",
  "section": "type-specimen",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Type specimen",
    "Hand-marked",
    "Dark tile"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Konsumed"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/681",
    "previewHeight": 681
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.4,
      0,
      157
    ]
  },
  "text": "<p>One near-black screen-printed tile: cream display caps in a dead-even 9×4 grid, mono index tags, hairline rules. That is the press layer, and it is crisp.</p> <p>Over it, a hand layer in orange paint marker — circles, an underline, an arrow, four scrawled notes. Each stroke has pressure (thick and thin along its length), a waver, and sometimes a doubled pass, and no two circles are alike. The marks are opaque and never take the screen mottle, because they were made after the tile was printed.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "one near-black screen-printed tile (matte black ink on board: faint mottled screen grain, cream ink laid on top)"
    },
    {
      "k": "Process",
      "v": "press layer = cream display caps in a dead-even 9×4 grid + mono index tags (crisp); HAND layer = orange paint-marker circles, underline, arrow, four scrawled notes — drawn AFTER printing: waver, pressure ribbon (thick/thin along the stroke), doubled passes, no two alike; marks are opaque and never take the print grain"
    },
    {
      "k": "Type",
      "v": "Archivo Black caps (Konsumed stand-in), JetBrains Mono captions, Caveat notes"
    },
    {
      "k": "Hardware",
      "v": "none — the tile is the object; hairline rules top/bottom"
    },
    {
      "k": "Skeleton",
      "v": "head row / grid / foot row; circles spill over cell edges but never over the rules."
    }
  ],
  "critique": {
    "reads_as": "A printed tile that has been marked up by hand, with the two layers plainly different.",
    "coupling": "Every marker stroke shares one pressure model — thickness follows speed along the path — so the circles, the underline and the arrow are the same pen; the press layer shares one screen mottle.",
    "pass_order": "tile → screen mottle → press type and rules → marker layer, opaque, on top.",
    "operators": [
      "screen mottle",
      "pressure ribbon",
      "stroke waver",
      "doubled pass"
    ],
    "why_it_survives": "Draw the circles at uniform width and they become SVG ellipses; give them the print grain and the hand disappears into the press.",
    "faults": [
      "circles were uniform-width vector strokes (no pressure, no waver → \"SVG ellipse\")",
      "footer row inherited the gallery's global .foot padding (indented 100px)",
      "note collided with an index tag",
      "grain was flat white noise (no screen mottle)"
    ]
  },
  "related": [
    {
      "entry": "d3-interlocking-stack",
      "relation": "technique-of"
    }
  ]
});
