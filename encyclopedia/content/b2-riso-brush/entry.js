/* B2 · Riso brush poster — ref Creative Church
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  uses: ["paper-tooth","mulberry32"],
  governed_by: ["components-craft"],
  "id": "b2-riso-brush",
  "index": "B2",
  "order": 20,
  "title": "Riso brush poster",
  "section": "print-reproduction",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Risograph",
    "Brush lettering",
    "Toner grain"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Creative Church"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/990",
    "previewHeight": 990
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.15,
      60
    ]
  },
  "text": "<p>A cream poster on a fan of orange riso sheets, photographed on a black stage. Two marks share one baseline: a giant orange ghost of the word, printed as its own run with its own registration, and a black wet-brush version of the same word drawn by hand.</p> <p>The brush is built from bristle paths with dry-brush tails and ink starve, not from a smooth ribbon — which is what makes it read as a hand mark next to a press mark rather than as a second typeface. The stickers are vinyl and therefore take no print grain: they get a sheen and a physical shadow instead.</p>",
  "reference": {
    "title": "GRACE — Creative Church riso poster",
    "cells": [
      {
        "k": "Ground",
        "v": "Black field; white poster on a fanned stack of orange riso sheets. → #0a0a0a ground, three rotated orange sheets, grain multiply."
      },
      {
        "k": "Hero",
        "v": "Raw dry-brush \"GRACE\" in black laid directly over a giant orange ghost \"GRACE\" so they interlock. → SVG brush paths w/ displacement + ink mottle; Saira Condensed 800 ghost on the same line."
      },
      {
        "k": "Stickers",
        "v": "Multiple orange riso labels w/ tiny white/black text (\"Beauty has the purpose…\"), rotated, plus a boxed \"COME More & REMAIN\". → four stickers, boxed outline, mono captions."
      },
      {
        "k": "Editorial",
        "v": "Small caps \"CREATIVE CHURCH\", ©2024, ®JESUS; italic \"Created to Create®\"; mono \"TRANSFORMED FOR CONTEMPLATION\". → all set in mono/Garamond italic."
      },
      {
        "k": "Marks",
        "v": "Halftone plate + ■■□ squares. → canvas halftone plate; three squares."
      },
      {
        "k": "Texture",
        "v": "Riso paper grain, toner ink mottle inside the brush strokes. → feTurbulence multiply grain; screen mottle clipped to letters."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "black flat-lay stage; a cream poster on a fan of orange riso sheets, photographed under one soft top-left light"
    },
    {
      "k": "Process",
      "v": "riso: giant orange ghost GRACE (one run, coarse grain, own registration) + black wet-brush GRACE (a hand mark, dry-brush tails)"
    },
    {
      "k": "Type",
      "v": "Saira Condensed 800 ghost; brush ribbons for the mark; EB Garamond italic + mono captions; small caps CREATIVE CHURCH"
    },
    {
      "k": "Hardware",
      "v": "orange vinyl stickers, kiss-cut with a white lip, crisp print, physical shadows; a small halftone plate; ■■□"
    },
    {
      "k": "Skeleton",
      "v": "ghost + brush share ONE baseline inside the poster; body copy anchored to the poster's foot; stickers spill past the edges."
    }
  ],
  "critique": {
    "reads_as": "A cream poster lying on a fan of orange sheets, photographed — an object under a light, not a composition on a background.",
    "coupling": "The ghost and the brush share one baseline inside the poster, so the hand mark and the press mark are the same word rather than two words; the stage light drives every shadow on sheets, poster and stickers.",
    "pass_order": "stage → sheets → poster → orange run → black brush → vinyl stickers on top. The stickers go last and outside the press filters, because vinyl is applied after printing.",
    "operators": [
      "riso grain",
      "dry-brush ink starve",
      "kiss-cut vinyl",
      "stage light"
    ],
    "why_it_survives": "Take the dry-brush tails away and the black mark becomes a second typeface; take the shared baseline away and the ghost is wallpaper.",
    "faults": [
      "brush was a smooth ribbon (no dry-brush, no ink starve)",
      "the ghost floated on its own line",
      "stickers wore a print grain (they're vinyl)",
      "sheets/poster/stickers all had one boilerplate 0 16px 34px shadow",
      "orange had no riso grain"
    ]
  },
  "related": [
    {
      "entry": "b1-photocopy-collage",
      "relation": "variant-of"
    }
  ]
});
