/* B4 · Program type spread — ref Soundtrack of America
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "b4-program-spread",
  "index": "B4",
  "order": 90,
  "title": "Program type spread",
  "section": "type-specimen",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Grotesque",
    "Knockout",
    "Print"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Soundtrack of America"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/880",
    "previewHeight": 880
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A chrome-yellow booklet spread photographed flat. Offset litho, so the only failure allowed is a sub-pixel feed jitter on the heavy dates — no toner starve, because offset does not starve.</p> <p>Two things do the work. The gutter is a <em>valley</em> — a dark core with asymmetric shoulders and a lit rise on the right page — not a one-pixel line; and the show-through is a mirrored, blurred ghost of the previous page's giant type at about four percent, which is ink seen through 120 gsm rather than a decorative watermark.</p>",
  "reference": {
    "title": "Soundtrack of America — program booklet spread",
    "cells": [
      {
        "k": "Format",
        "v": "Two-page printed spread on chrome-yellow stock, centre gutter, folios 4 / 5 at outer corners. → split pages, gutter shadow, folios."
      },
      {
        "k": "Date bands",
        "v": "White bands bounded by heavy black rules top and bottom, full column width. → .bar with .34cqw black borders."
      },
      {
        "k": "Variants",
        "v": "APR 7 in a free white ellipse; APR 9 & 12 with semicircular ticket-notch bites; 5 & 14 plain. → .oval / .notch / plain."
      },
      {
        "k": "Type",
        "v": "Ultra-heavy condensed grotesque dates, very tight; artist names title-case bold, extremely tight tracking, packed leading. → Archivo Black scaleX(.86); Archivo 800 −.045em, .96 leading."
      },
      {
        "k": "Show-through",
        "v": "Reversed ghost of the previous page's giant text visible through the paper. → mirrored Archivo Black at low opacity behind."
      },
      {
        "k": "Copy",
        "v": "Bold intro paragraph top-left; small right-column column of caption text. → intro block; masthead + vol/season."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "chrome-yellow uncoated booklet stock, photographed flat under one soft key from top-left; corners fall off, gutter valley reads as a soft bulge not a line, bottom-right corner lifts a touch."
    },
    {
      "k": "Process",
      "v": "offset litho — crisp black + white knockouts; only failure allowed is sub-pixel feed jitter on the heavy dates (no toner starve). Show-through = mirrored ghost of the previous page's giant type at ~4%, slightly blurred (ink seen through 120gsm)."
    },
    {
      "k": "Type",
      "v": "dates ultra-condensed heavy (Anton ≈ Druk Cond); names title-case grotesque 800, tracking −.05em, packed leading; kicker/masthead spaced caps."
    },
    {
      "k": "Hardware",
      "v": "none — paper only: gutter valley, page-edge light, corner curl."
    },
    {
      "k": "Skeleton",
      "v": "two equal pages, header band, top rule, white date bands bounded by heavy black rules (rect / ellipse / ticket-notch), cast lists, folios 4|5 outer corners."
    }
  ],
  "critique": {
    "reads_as": "A booklet lying open under a lamp — a photographed object with a spine, not two pages side by side.",
    "coupling": "One key light drives the corner falloff, the gutter’s lit rise and the corner curl together, so the sheet is a single surface; the show-through is derived from the facing page’s own type.",
    "pass_order": "stock → litho black and knockouts → feed jitter on the heavy dates only → show-through ghost → paper tooth → light, gutter and curl last.",
    "operators": [
      "feed jitter",
      "show-through",
      "gutter valley",
      "paper tooth"
    ],
    "why_it_survives": "Make the gutter a line and the spread becomes a rectangle; sharpen the ghost and it reads as a watermark rather than as ink seen through paper.",
    "faults": [
      "gutter was a 1px line",
      "ghost 9% sharp (too loud, no blur)",
      "SVG-turbulence grain not paper tooth",
      "no light falloff, no curl",
      "dates Archivo Black scaleX(.86) not condensed",
      "casts wrapped with orphans"
    ]
  },
  "related": [
    {
      "entry": "t1-type-specimen",
      "relation": "technique-of"
    }
  ]
});
