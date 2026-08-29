/* Injected as a classic <script src> by the shell. */
Shell.registerEntry({
    "id": "c1-heavy-ink",
    "index": "C1",
    "order": 30,
    "title": "Heavy-ink riso block",
    "section": "print-reproduction",
    "style": "riso-xerox",
    "status": "canonical",
    "tags": [
      "riso",
      "two-drum",
      "toner grain",
      "bone stock"
    ],
    "source": {
      "kind": "reference-study",
      "title": "Heavy Texture"
    },
    "frame": {
      "designWidth": 1100,
      "aspect": "1100/900",
      "previewHeight": 900
    },
    "thumb": {
      "crop": [1.15, 40]
    },
    "text": "<p>The paper is a bone 120 gsm with its own tooth; the toner starve is a hole punch\n    through the ink layer rather than a noise overlay, which is why the pinholes sit on the\n    fibre and not on top of the whole frame.</p>\n    <p>The edition stamp is over-inked by running the same filter at a higher amplitude —\n    the same operator at a different setting, not a second operator.</p>",
    "reference": {
      "title": "Heavy Texture — 2-colour riso edition",
      "cells": [
        {
          "k": "Ground",
          "v": "Bone stock, visible fibre, the sheet larger than the printed area → 120 gsm bone, procedural tooth at two pitches, 6 mm bleed of paper on four sides."
        },
        {
          "k": "Drum 01",
          "v": "Flat black over two-thirds of the sheet, torn where the ink runs out → Single fill plus a per-pixel starve mask; the tear is the mask boundary."
        },
        {
          "k": "Drum 02",
          "v": "Brick red, printed second, out of register by a couple of millimetres → Same geometry offset 2.4 mm, multiplied, clipped by the inverse of drum 01."
        },
        {
          "k": "Type",
          "v": "Heavy condensed display knocked out of the black → Knockout, with the red showing in the counters because it is the layer beneath."
        },
        {
          "k": "Edition mark",
          "v": "Hand-stamped 01/50 in a circle, over-inked and slightly rotated → The same ink filter at a higher amplitude, rotated −4°."
        },
        {
          "k": "Margin note",
          "v": "Vertical spec type up the right edge, drum 01 only → Mono at 90°, no ink filter."
        }
      ]
    },
    "pass0": [
      {
        "k": "Substrate",
        "v": "Bone 120 gsm, uncoated, tooth visible at 100%."
      },
      {
        "k": "Process",
        "v": "Two-drum risograph, black then brick, deliberate 2.4 mm misregistration."
      },
      {
        "k": "Type",
        "v": "Condensed display for the word, mono for the machine labels. Nothing in between."
      },
      {
        "k": "Hardware",
        "v": "Trim marks, edition stamp, drawdown chit."
      },
      {
        "k": "Skeleton",
        "v": "One full-bleed block, one margin column, one stamp. Three objects, no grid."
      }
    ],
    "critique": {
      "reads_as": "One printed sheet with too much ink on it, not a black rectangle with textures applied.",
      "coupling": "The starve mask decides both where the black thins AND where the brick drum shows, so the two inks cannot disagree about where the ink ran out.",
      "pass_order": "paper tooth → drum 01 → starve → drum 02 clipped by the inverse → stamp. Starve after drum 02 would punch holes in the red as well, which a press does not do.",
      "operators": [
        "toner starve",
        "misregistration",
        "paper tooth",
        "knockout"
      ],
      "why_it_survives": "Remove the starve and the misregistration has nothing to be visible through; remove the tooth and the starve reads as noise.",
      "faults": [
        "The starve mask ran at the same frequency as the paper tooth, so the pinholes moiréd. Fixed by separating the two by an octave.",
        "The brick drum was originally drawn as a stroke, which made the misregistration a decision rather than a consequence.",
        "The edition stamp had a drop shadow. A stamp is ink on paper; it has no shadow. Removed."
      ]
    },
    "ruling": {
      "text": "The knockout stays crisp — solid to 94% and then nothing. Do not soften the counters to \"integrate\" the type: the softness in this plate belongs to the ink, and giving it to the letterform as well is one job done twice.",
      "by": "julia",
      "date": "2026-06-10"
    },
    "related": [
      {
        "tool": "course-stub",
        "entry": "13-fbm",
        "relation": "shader-behind",
        "href": "../course/#/13-fbm",
        "label": "13 Fractal Brownian Motion"
      },
      {
        "entry": "b2-riso-brush",
        "relation": "variant-of"
      }
    ]
  });
