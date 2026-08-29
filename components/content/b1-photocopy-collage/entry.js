/* B1 · Photocopy collage — ref ANYDAY Studio
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "b1-photocopy-collage",
  "index": "B1",
  "order": 10,
  "title": "Photocopy collage",
  "section": "print-reproduction",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Collage",
    "Riso/Xerox",
    "Halftone"
  ],
  "source": {
    "kind": "reference-study",
    "title": "ANYDAY Studio"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1012",
    "previewHeight": 1012
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A flat-lay of xeroxed photographs, label tape and a mis-registered riso block. The photographs are not images: each is a generated greyscale scene — a box of caps, a garment rack — put through a copier and then screened at 20°, so the tonal structure belongs to an object rather than to a gradient.</p> <p>The thing to watch is the ink chain. Toner starve, feed jitter and edge burn all run off one filter at three amplitudes, so the tape, the card and the photos fail in the same way. The hand layer — the arrow, the rounded chip — sits outside it, because a pen mark made after printing has no business carrying the press's faults.</p>",
  "reference": {
    "title": "ANYDAY Studio — photocopy collage",
    "cells": [
      {
        "k": "Ground",
        "v": "Rotated periwinkle riso block with \"ANY/DAY\" knocked out large, visibly mis-registered. → blue block, offset ghost knockout, screen grain."
      },
      {
        "k": "Photos",
        "v": "B&W xerox photocopies (denim caps in a box, garment rack), rough white borders, angled. → canvas halftone: organic tonal field, rotated variable-dot screen, xerox curve."
      },
      {
        "k": "Tape",
        "v": "Narrow label-tape strips at steep angles, \"ANY/DAY ®\" heavy grotesque, \"STUDIO\" small. → four strips, Anton scaled, ® marks, toner grain."
      },
      {
        "k": "Hero card",
        "v": "Cream-yellow rectangle, wide, heavy condensed grotesque, tight leading, title case. → Saira Condensed 800, .94 leading, wide card."
      },
      {
        "k": "Marks",
        "v": "Black rounded-square \"a\" chip; small ↙ arrow bottom-right; ® on strips. → all present."
      },
      {
        "k": "Texture",
        "v": "Toner grain over everything; paper ground warm-grey. → feTurbulence multiply grain across lens; canvas noise on photos."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "warm-grey copier stock, cream card, white label tape; flat-lay under one soft top-left light"
    },
    {
      "k": "Process",
      "v": "xerox: toner starve (pinholes), feed jitter, edge burn on the photos; riso block = 2 blue runs mis-registered"
    },
    {
      "k": "Type",
      "v": "Anton tape \"ANY/DAY ®\" + Saira \"STUDIO\"; Saira 800 hero card; giant knockout ANYDAY cropped by the block"
    },
    {
      "k": "Hardware",
      "v": "label-tape strips at steep angles w/ contact shadows; rounded \"a\" chip; ↙ arrow; ® marks"
    },
    {
      "k": "Skeleton",
      "v": "block low-left, hero card centre-left, four xerox photos pinned to the corners, tape crossing everything critique of previous build: photos were blob fields (no scene), misregistration was a css copy, shadows boilerplate, tape/card type never went through the ink chain, edges too clean."
    }
  ],
  "critique": {
    "reads_as": "A flat-lay of photocopies and tape that someone assembled and then re-copied, not a set of images with filters on them.",
    "coupling": "One ink chain — feed jitter into toner starve — drives the tape, the hero card and the four photographs at three amplitudes, so the whole flat-lay fails in one voice; the riso block’s two runs share the same displacement seed.",
    "pass_order": "scene → xerox (edge burn, roller streaks) → dot screen → paper grain → hand layer last. Screening before the copier would print a clean halftone of a dirty photograph, which is backwards.",
    "operators": [
      "dot screen",
      "toner starve",
      "edge burn",
      "misregistration",
      "paper grain"
    ],
    "why_it_survives": "Remove the scenes and the halftone has nothing to reproduce; remove the hand layer and the collage has no author.",
    "faults": [
      "photos were blob fields (no scene), misregistration was a css copy, shadows boilerplate, tape/card type never went through the ink chain, edges too clean"
    ]
  },
  "related": [
    {
      "entry": "b2-riso-brush",
      "relation": "variant-of"
    },
    {
      "entry": "c1-heavy-ink",
      "relation": "technique-of"
    }
  ]
});
