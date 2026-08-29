/* B5 · Minimal brand-guide grid — ref PixelTruck
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "b5-brand-guide-grid",
  "index": "B5",
  "order": 170,
  "title": "Minimal brand-guide grid",
  "section": "document-system",
  "style": "swiss-modular",
  "status": "canonical",
  "tags": [
    "Grid",
    "Grayscale",
    "Restraint"
  ],
  "source": {
    "kind": "reference-study",
    "title": "PixelTruck"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/900",
    "previewHeight": 900
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [1.05, 0]
  },
  "text": "<p>A flat mid-grey board with square-cornered white slides on a strict twelve-column grid. Digital-clean: no tooth, no grain, no shadow on the slides.</p> <p>The restraint is the point, so the only place effort shows is the merch renders — they are structured greyscale product forms lit from the top-left with a soft contact shadow, because a flat vector silhouette in this company would read as a placeholder. One neutral grotesque, three sizes, nothing else.</p>",
  "reference": {
    "title": "PixelTruck — minimal grayscale brand-guide board",
    "cells": [
      {
        "k": "Ground",
        "v": "Flat mid-grey board; large square-cornered white slides in a strict grid, generous and even. → #dcdcdc board, 12-col grid, 12px gaps, no radius, no shadow."
      },
      {
        "k": "Devices",
        "v": "Row of three dark iPhone story mockups (\"brand.name\", \"Send message…\"), and a row of three white outlined phone frames. → CSS phones with island, status, home bar; dark + white variants."
      },
      {
        "k": "KPI",
        "v": "Full-width white slide: tiny \"Key performance metric\" top-left, logo top-right, giant \"$2.5M\" bottom-left in heavy grotesque, small superscript $. → 9.6cqw Inter 700, −.05em."
      },
      {
        "k": "Slides",
        "v": "Black \"Next Steps\" slide (light weight); \"Introduction / Rebrand goals / 01\"; type-specimen alphabet rows; \"Moodboard One\" note + adjective chips. → all present."
      },
      {
        "k": "Merch",
        "v": "Grey hoodie, tote, bottle, tee on flat grey canvases with the pixel-mark logo. → canvas greyscale product renders (one top-left light, contact shadow on the flat canvas), centred, single item per slide."
      },
      {
        "k": "Type",
        "v": "One clean neutral grotesque throughout, quiet weights, wide tracking on captions. → Inter only; nothing decorative."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "none — a screen. Flat mid-grey board, square-cornered white slides on a strict 12-col grid; DIGITAL-CLEAN: no tooth, no grain, no shadow on slides."
    },
    {
      "k": "Process",
      "v": "digital; the only \"photographs\" are the merch renders → structured greyscale product forms (light from top-left, soft contact shadow on the flat canvas), never flat vector."
    },
    {
      "k": "Type",
      "v": "one neutral grotesque (Inter): captions quiet grey, KPI $2.5M heavy (700, −.05em) with a small raised $, headings 500/600 tight."
    },
    {
      "k": "Hardware",
      "v": "phones = exact frames (island, status, home bar), dark + outlined variants."
    },
    {
      "k": "Skeleton",
      "v": "12-col, 9.2cqw rows, 12px gaps; KPI 6-wide, dark 6-wide, merch 3-wide squares, specimen 3×2, logo lockup slide."
    }
  ],
  "critique": {
    "reads_as": "A presentation board that is confident enough to be plain.",
    "coupling": "Every slide sits on the same twelve-column grid at the same row height, so the board’s rhythm is one decision; the merch renders share one light.",
    "pass_order": "board → grid → slides → renders. Nothing is added afterwards — restraint here is precision, not absence.",
    "operators": [
      "12-column grid",
      "greyscale product render",
      "exact device frames"
    ],
    "why_it_survives": "Add a texture and the restraint becomes timidity; flatten the merch to silhouettes and the only crafted element on the board is gone.",
    "faults": [
      "merch was flat vector silhouettes",
      "moodboard note inherited the shell's .note padding and clipped",
      "KPI fine",
      "phones fine. Restraint = precision, so no texture added"
    ]
  }
});
