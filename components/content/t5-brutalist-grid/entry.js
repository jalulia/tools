/* T5 · Brutalist editorial grid — ref BRUT.
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "t5-brutalist-grid",
  "index": "T5",
  "order": 250,
  "title": "Brutalist editorial grid",
  "section": "layout-systems",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Grid",
    "Heavy",
    "Yellow/Red"
  ],
  "source": {
    "kind": "reference-study",
    "title": "BRUT."
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1540",
    "previewHeight": 1540
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A white screen page with two-pixel structural rules and one-pixel interior rules, flat yellow and red blocks and black type. No paper, no grain, no print filter anywhere — this is a website, and it says so.</p> <p>Each headline line is set edge to edge by distributing its glyphs across the measure, so the rag is architectural rather than accidental. The thumbnails are structured grey scenes drawn digitally; halftoning them would have put print texture on a screen piece.</p>",
  "reference": {
    "title": "BRUT. — brutalist studio site",
    "cells": [
      {
        "k": "Frame",
        "v": "White page inside heavy black borders; every region divided by thick rules; all square. → 2px black wrap, hairline interior rules, zero radius."
      },
      {
        "k": "Nav",
        "v": "\"BRUT.\" wordmark · caps links · yellow \"START A PROJECT ↗\" cell. → same row."
      },
      {
        "k": "Hero",
        "v": "\"WE BUILD WITHOUT RULES.\" colossal black grotesque, leading almost touching; red square with globe icon top-right; yellow tag + outline button below. → Archivo Black, each line justified edge-to-edge by size, −.05em."
      },
      {
        "k": "Notice",
        "v": "\"(2024) WE DON'T FOLLOW TRENDS. WE SET DIRECTIONS. →\" + yellow \"Available for New Projects\". → Anton caps notice + tag."
      },
      {
        "k": "Work",
        "v": "Numbered rows 01/02/03 with big titles + thumbnails; row 02 inverted red. → digital-clean structured grey scenes; red row."
      },
      {
        "k": "Band + foot",
        "v": "Yellow asterisk ✱ panel · \"BUILT TO DISRUPT.\" · services accordion 01–04 with \"+\"; red footer \"Let's create something different ↗\" + newsletter + IG/TW/BE/LI. → present."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "SCREEN — white, digital-clean; no paper, no grain, no print filters anywhere."
    },
    {
      "k": "Process",
      "v": "none; only hard rules (2px structural / 1px interior), flat yellow + red blocks, black type."
    },
    {
      "k": "Type",
      "v": "Archivo Black grotesque, tracking tight (-.05em display), headline lines set EDGE-TO-EDGE (each line = flex space-between of glyphs); Anton caps notice; JetBrains Mono for indices."
    },
    {
      "k": "Hardware",
      "v": "none — the asterisk and the globe are vector, crisp; thumbnails are structured grey scenes (slabs, gridlines, arcs) drawn digitally, not tone smears."
    },
    {
      "k": "Skeleton",
      "v": "nav → hero (headline + red square/blurb) → notice → 3 work rows (02 inverted red) → band → foot."
    }
  ],
  "critique": {
    "reads_as": "A website, admitted as a website — hard rules, flat blocks, no paper anywhere.",
    "coupling": "Each headline line distributes its own glyphs across the full measure, so the rag is produced by the grid rather than by the words.",
    "pass_order": "nav → hero → notice → work rows → band → foot. Two rule weights and no third.",
    "operators": [
      "edge-to-edge letter distribution",
      "two-weight rules",
      "structured grey scene"
    ],
    "why_it_survives": "Halftone the thumbnails and you have put print texture on a screen piece — the fault the previous build shipped.",
    "faults": [
      "headline ragged (not architectural), timid tracking, thumbs were halftone tonal smears (print texture on a screen piece), loose nav tracking, soft padding"
    ]
  }
});
