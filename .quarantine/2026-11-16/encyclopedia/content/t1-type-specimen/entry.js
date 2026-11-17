/* T1 · Type-specimen hero — ref Shamgod / Latinotype
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "t1-type-specimen",
  "index": "T1",
  "order": 110,
  "title": "Type-specimen hero",
  "section": "type-specimen",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Display",
    "Specimen",
    "Orange/Black"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Shamgod / Latinotype"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/998",
    "previewHeight": 998
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.2,
      60
    ]
  },
  "text": "<p>A specimen hero on coated white: a dense black flat, a signal orange band, a cool grey block. The display word is oversized so that the O is genuinely cropped by the panel edge — a real overflow crop, not a letter drawn short.</p> <p>The word carries a faint ink chain and the small labels do not, which is the correct asymmetry: a 300-point letter has enough ink on it to fail and an eight-point label does not. The orange dots on the photograph are kiss-cut vinyl — crisp edge, white halo, a tiny contact shadow — and therefore take no screen.</p>",
  "reference": {
    "title": "Shamgod — Latinotype type specimen",
    "cells": [
      {
        "k": "Structure",
        "v": "Metadata bar (foundry®, designer, publisher, year, LTT—2024®) → giant condensed hero word on black → 3-panel band → 84.5%° stat band → orange weight strip. → same stack, square print blocks."
      },
      {
        "k": "Hero",
        "v": "Ultra-condensed heavy grotesque, huge, tight, with pill tags \"New · Signing\", \":)\", \"Ovr®\". → Anton scaleY(1.06), oversized + real crop, ink chain on the word only; pills above, crisp."
      },
      {
        "k": "Panels",
        "v": "Orange panel with italic-black slogan \"WINNING IS NOT FOR ANYBODY.↗\"; grey panel with a halftoned athlete + orange dot overlays + tiny labels. → Archivo Black italic; procedural runner scene → 45° halftone; vinyl dot stickers; mono labels."
      },
      {
        "k": "Stat",
        "v": "\"84.5%°\" giant orange condensed on black over a faded halftone athlete; \"New York vs. Los Angeles\" italic white. → Anton 17vw; light-ink halftone of a victory figure on black."
      },
      {
        "k": "Strip",
        "v": "Orange weight strip: Bravado / Black / Bold / Default Set / LTT—2026® divided by hairlines. → present."
      },
      {
        "k": "Palette",
        "v": "Black · signal orange · light grey · white. → tokens; nothing else."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "coated white stock, dense black flat + signal orange + cool grey blocks; square, gutterless."
    },
    {
      "k": "Process",
      "v": "offset print — the giant word carries a faint ink chain (feed jitter + sparse toner pinholes), small labels/pills stay CRISP; photos = halftoned B&W athletes (structured figures), 45° screen."
    },
    {
      "k": "Type",
      "v": "Anton condensed hero, oversized so the O crops at the panel edge (real overflow:hidden crop); Archivo Black italic slogan; JetBrains Mono for meta; the 84.5%° stat over a faded halftone."
    },
    {
      "k": "Hardware",
      "v": "orange dot STICKERS on the photo — kiss-cut vinyl: crisp edge, white halo, tiny contact shadow."
    },
    {
      "k": "Skeleton",
      "v": "meta bar → black hero → orange|grey band → black stat band → orange weight strip."
    }
  ],
  "critique": {
    "reads_as": "A printed specimen sheet: a giant word with ink on it, and small labels without.",
    "coupling": "Ink chain amplitude follows type size — the display word starves, the eight-point labels do not — so one rule explains both. The 45° screen and the athlete scenes share one field.",
    "pass_order": "scene → screen → panels → display word with ink chain → vinyl dots last, unfiltered.",
    "operators": [
      "45° dot screen",
      "ink chain",
      "overflow crop",
      "kiss-cut vinyl"
    ],
    "why_it_survives": "Give the small labels the same chain and the sheet reads as a filter pass; take the crop off the O and the word stops being oversized.",
    "faults": [
      "photos were tonal smears (no figure)",
      "hero word timid (no bleed)",
      "no print physics on the word",
      "stat band photo greyed the black (paper-coloured halftone at .62)",
      "dots flat"
    ]
  },
  "related": [
    {
      "entry": "b4-program-spread",
      "relation": "technique-of"
    },
    {
      "tool": "book-of-shaders",
      "entry": "00-introduction",
      "relation": "shader-behind",
      "label": "The Book of Shaders — 00 Introduction"
    }
  ]
});
