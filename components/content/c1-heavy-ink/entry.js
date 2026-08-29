/* C1 · Heavy-ink riso block — ref Heavy Texture
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "c1-heavy-ink",
  "index": "C1",
  "order": 30,
  "title": "Heavy-ink riso block",
  "section": "print-reproduction",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Riso",
    "Heavy ink",
    "Line art",
    "Misregistration"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Heavy Texture"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1298",
    "previewHeight": 1298
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      250
    ]
  },
  "text": "<p>Two drums on 120 gsm bone stock: a heavy black run, then brick, mis-registered by about four pixels under it. The paper is a fibre mottle and a fine grain multiplied over everything, so nothing sits on top of the sheet.</p> <p>The screen here is <em>inverted</em>. Instead of dots that grow as the field darkens, the plate is solid and the dots are the places the ink did not take — un-inked holes at the same 20° pitch as the wordmark's line screen. That is why the starve and the misregistration cannot disagree about where the ink ran out: they are reading the same field.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "120gsm bone stock, untrimmed, hairline frame + reg marks; fibre mottle + fine grain multiplied over everything."
    },
    {
      "k": "Process",
      "v": "two-drum riso: black run heavy (toner grain, roller banding, un-inked dot screen at 20°), brick second run mis-registered ~4px under it; solid edges bleed into fibres (edge burn) and coverage fails as pinpricks; the giant cream wordmark is ink-starved → line screen at the SAME 20° pitch as the dot screen, solid only where the squeegee catches at the baseline."
    },
    {
      "k": "Type",
      "v": "Anton stacked wordmark (Druk-Cond stand-in), mono margin metadata spaced caps, Anton edition disc."
    },
    {
      "k": "Hardware",
      "v": "none — the mascot is a hand layer (one 0.15mm pen), crisp, ink copy under the block, cream copy clipped to it."
    },
    {
      "k": "Skeleton",
      "v": "block 64×74 at (8,12); disc overlapping top-right; colophon + control strip + scale bar under; side spine text."
    }
  ],
  "critique": {
    "reads_as": "One sheet with too much ink on it, not a black rectangle with textures applied.",
    "coupling": "The starve field decides both where the black thins and where the brick drum shows through, so the two inks cannot disagree about where the ink ran out. The wordmark’s line screen runs at the same 20° pitch as the dot screen — one screen angle for the whole plate.",
    "pass_order": "paper fibre → drum 01 heavy → inverted screen (the un-inked holes) → drum 02 mis-registered under it → edge burn → grain over everything. Starving after the second drum would punch holes in the brick as well, which a press does not do.",
    "operators": [
      "inverted dot screen",
      "toner starve",
      "misregistration",
      "edge burn",
      "paper fibre"
    ],
    "why_it_survives": "Remove the starve and the misregistration has nothing to be visible through; remove the fibre and the starve reads as noise.",
    "faults": [
      "block edges displaced but no coverage failure (no pinpricks, no edge burn)",
      "wordmark was a solid cream text with a clean text-shadow-like brick copy",
      "second run had no rotation"
    ]
  },
  "related": [
    {
      "entry": "b1-photocopy-collage",
      "relation": "technique-of"
    },
    {
      "entry": "d4-riso-print-set",
      "relation": "technique-of"
    }
  ]
});
