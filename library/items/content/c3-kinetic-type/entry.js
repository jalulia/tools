/* C3 · Kinetic type repetition — ref Backspin
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "c3-kinetic-type",
  "index": "C3",
  "order": 180,
  "title": "Kinetic type repetition",
  "section": "motion-kinetic",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Kinetic",
    "Marquee",
    "Condensed caps"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Backspin"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/619",
    "previewHeight": 619
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.69,
      0
    ]
  },
  "text": "<p>A looping ident on a pure black tile: nine equal rows of condensed caps sheared to exactly −12°, alternating cream, hot orange and outline. The rows <em>are</em> the layout.</p> <p>Nothing is distorted to fit — the type is set at its own width and the rows are cropped by the tile, which is why the marquee reads as a printed strip moving rather than as text being stretched. One loop length for the whole plate; the vinyl sticker keeps its own grain and its own shadow and does not move.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "pure black screen tile (a looping ident, not print)"
    },
    {
      "k": "Process",
      "v": "digital-clean, no print filters · type-as-layout: nine equal rows of Anton BACKSPIN, exact −12° shear, alternating cream / hot orange / outline, the rows ARE the layout"
    },
    {
      "k": "Hardware",
      "v": "one round vinyl sticker, kiss-cut white border, physical dark-stage shadow, its own grain, never filtered"
    },
    {
      "k": "Skeleton",
      "v": "16:9, rows edge-to-edge and cropped by the tile, sticker at 64/22, two mono corner labels."
    }
  ],
  "critique": {
    "reads_as": "A loop ident: printed rows of type moving past a window.",
    "coupling": "One loop length and one shear angle govern all nine rows, so the marquee is one object; the row halves are identical, which is what makes −50% seamless.",
    "pass_order": "tile → rows → shear → crop → sticker last, unmoving and unfiltered.",
    "operators": [
      "shear",
      "seamless marquee",
      "kiss-cut vinyl"
    ],
    "why_it_survives": "Scale the glyphs to fill the row and the type distorts; speed the loop up and the rows stop reading as a printed strip.",
    "faults": [
      "ground was #141414 (grey, not black)",
      "scaleX(1.06) distorted glyphs",
      "type sat small in the row (.86) leaving timid gaps",
      "sticker shadow was a boilerplate soft drop",
      "motion too fast for a subtle loop"
    ]
  }
});
