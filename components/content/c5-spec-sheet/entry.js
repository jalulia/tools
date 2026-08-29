/* C5 · Brutalist spec sheet — ref Functional by Default / Brass Hands
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "c5-spec-sheet",
  "index": "C5",
  "order": 140,
  "title": "Brutalist spec sheet",
  "section": "document-system",
  "style": "technical-doc",
  "status": "canonical",
  "tags": [
    "Technical",
    "Mono + Display",
    "Document"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Functional by Default / Brass Hands"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/874",
    "previewHeight": 874
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.12,
      30
    ]
  },
  "text": "<p>A white grid-paper card on a grey studio field: hairline squares, seven binder punches, a gutter rule, a barcode, corner ticks. A spec sheet is a document that looks like the machine that made it, so there is no ornament anywhere on it.</p> <p>The punches are real holes — the stage colour shows through, with an inner shadow at the top for the thickness of the card and a one-pixel lit lip at the bottom. The signatures are fineliner and never starve.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "grey studio field with a white grid-paper card (hairline squares, 7 binder punches, gutter rule)"
    },
    {
      "k": "Process",
      "v": "offset/laser — cobalt banner is a solid ink block that starves at pinholes; display caps take the same ink chain; mono table text and pills stay crisp (functional) · type-as-layout: FUNCTIONAL / BY DEFAULT knocked out of the banner; oversized DEFAULT ghost really cropped by the field edges; rotated sheet note; bracketed meta row"
    },
    {
      "k": "Hardware",
      "v": "real punch holes (stage colour through, top inner shadow = paper thickness, 1px lit bottom lip), corner ticks, barcode, three fineliner signatures (markerInk, never starved)"
    },
    {
      "k": "Skeleton",
      "v": "meta row / card / footer band where the ghost surfaces."
    }
  ],
  "critique": {
    "reads_as": "A working document — a punched card on a studio field — rather than a page designed to look technical.",
    "coupling": "The punches, their inner shadow and their lit lip all come from one card thickness, so the card has a real edge everywhere it is cut.",
    "pass_order": "field → card → grid → punches → barcode and ticks → signatures last.",
    "operators": [
      "punched hole",
      "hairline grid",
      "barcode",
      "fineliner"
    ],
    "why_it_survives": "Draw the holes as dots and the card becomes a picture of a card; add any ornament at all and it stops being a spec sheet.",
    "faults": [
      "dots-for-holes",
      "dot grid instead of hairlines",
      "ghost hidden behind the card (crop was theatre)",
      "signatures crisp vector",
      "banner flat digital blue",
      "global .foot chrome rule leaked 80px of padding into the card"
    ]
  }
});
