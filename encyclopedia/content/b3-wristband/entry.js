/* B3 · Event wristband / calendar — ref Festa Solar
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "b3-wristband",
  "index": "B3",
  "order": 50,
  "title": "Event wristband / calendar",
  "section": "print-reproduction",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Save-the-date",
    "Tyvek",
    "Doodle"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Festa Solar"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1078",
    "previewHeight": 1078
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.1,
      40
    ]
  },
  "text": "<p>Three tyvek wristbands lying across a printed hairline calendar, photographed under one soft light. Spun polyethylene is not paper: it gets thousands of short curved fibres, a diagonal sheen and two crinkle creases, and its perforations are punched rather than drawn.</p> <p>Two layers, two logics. The calendar and the band artwork are press — hairlines, light sans, mono serials. The doodles, the handwriting and the circled 27 are marker and fineliner <em>on the photograph</em>, added after the fact, so they take the light but not the ink.</p>",
  "reference": {
    "title": "Festa Solar — event save-the-date",
    "cells": [
      {
        "k": "Ground",
        "v": "A photographed printed calendar: warm grey paper, fine hairline cells, slightly off-square. → hairline grid rotated −2.4°, paper grain."
      },
      {
        "k": "Focal",
        "v": "Three near-identical orange tyvek wristbands, tightly stacked with small offsets, \"FESTA✷SOLAR\" in heavy condensed black with a blue 8-point burst. → Anton bands, SVG burst, drop shadows, fibre noise + sheen."
      },
      {
        "k": "Stubs",
        "v": "White perforated stubs at BOTH ends: left with a printed serial \"#45895#\", right with a zigzag/barcode. → .lstub serial (vertical) + .stub barcode + serrated seam."
      },
      {
        "k": "Handwriting",
        "v": "\"SALVE A DATA\" and \"PRAIA DE IRACEMA\" hand-lettered all-caps in thin marker, tilted. → Caveat caps, tracked, −7°."
      },
      {
        "k": "Days",
        "v": "Light sans day labels \"quarta 27\", \"quinta 28\", \"quarta 04\", \"quinta 05\"; the 27 hand-circled. → Archivo 400; roughened orange ring."
      },
      {
        "k": "Doodles",
        "v": "Thin-ink wireframe globe with ✦ sparkles; martini w/ olive + tiny sparkles; a dotted connector. → inline SVG, single stroke weight, twinkle motion-safe."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "a printed hairline calendar on warm-grey stock, PHOTOGRAPHED: slight skew, paper tooth, one soft light top-left with falloff"
    },
    {
      "k": "Process",
      "v": "offset hairlines + light sans days (press); doodles / handwriting / the circled 27 = marker & fineliner ON the photo (hand layer)"
    },
    {
      "k": "Type",
      "v": "Archivo days; Anton \"FESTA ✷ SOLAR\" printed on tyvek; Caveat caps handwriting; mono serials on the stubs"
    },
    {
      "k": "Hardware",
      "v": "three tyvek wristbands (fibre grain, soft sheen, crinkle) with white perforated stubs at both ends, real punched perforation"
    },
    {
      "k": "Skeleton",
      "v": "bands stacked with small offsets across the middle third; days in the four corners; doodles in the margins."
    }
  ],
  "critique": {
    "reads_as": "Three tyvek bands lying on a printed calendar that somebody has already written on.",
    "coupling": "The photograph’s single light drives the paper tooth, the band sheen and every shadow; the hand layer is deliberately NOT coupled to the press — that decoupling is what separates marker from ink.",
    "pass_order": "calendar print → photograph (tooth, skew, falloff) → bands with their own fibre and crinkle → punched perforation → marker and fineliner last, on top of the photograph.",
    "operators": [
      "tyvek fibre",
      "paper tooth",
      "punched perforation",
      "marker waver"
    ],
    "why_it_survives": "Give the doodles the paper’s tooth and they become printed ornament; make the perforation a drawn zigzag and the band stops being a physical object.",
    "faults": [
      "bands were flat orange + generic noise",
      "drop-shadow was a straight-down blur",
      "perforation was a zigzag drawing",
      "calendar had no tooth or light",
      "doodles used a low-frequency wobble (not a marker)",
      "burst wore a shadow though it is print"
    ]
  },
  "related": [
    {
      "entry": "d6-social-tiles",
      "relation": "technique-of"
    },
    {
      "tool": "book-of-shaders",
      "entry": "10-random",
      "relation": "shader-behind",
      "label": "The Book of Shaders — 10 Random"
    }
  ]
});
