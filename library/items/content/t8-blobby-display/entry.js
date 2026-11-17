/* T8 · Rounded blobby display — ref Normal / Type Mafia
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "t8-blobby-display",
  "index": "T8",
  "order": 120,
  "title": "Rounded blobby display",
  "section": "type-specimen",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Playful",
    "Variable",
    "Green"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Normal / Type Mafia"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/682",
    "previewHeight": 682
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.4,
      0,
      157
    ]
  },
  "text": "<p>A flat digital green tile. No texture at all: grain was rejected here because it would fake a print that does not exist.</p> <p>The craft is in the drawing. The smiley that replaces the O is measured to the letterforms — cap height .615em plus stroke, stem .17em plus stroke, so the ring's weight matches the stem and its box matches the cap. The stylistic alternates are a real unicase set, not a rotation gimmick, which is the difference between a typeface and a filter.</p>",
  "reference": {
    "title": "Normal — Type Mafia rounded display",
    "cells": [
      {
        "k": "Tile",
        "v": "Flat green tile, wordmark fills it nearly edge to edge. → green ground, 17vw word, scaleY(1.06)."
      },
      {
        "k": "Letters",
        "v": "Blobby, inflated, very heavy rounded sans; low contrast; soft terminals; tight. → Baloo 2 800 + text-stroke fatten, −.045em."
      },
      {
        "k": "The O",
        "v": "A smiley face replaces the O — bold ring, two dot eyes, curved mouth, baseline-aligned. → inline SVG measured to the font: box .64em = cap height, ring 30/100 = stem weight; blinks/wobbles motion-safe."
      },
      {
        "k": "Sets",
        "v": "\"w/ 2 stylistic sets — rotating\": alternate glyph personality. → SS01 caps / SS02 unicase per-glyph alternates (n r m a at cap height) + wink O."
      },
      {
        "k": "Marks",
        "v": "Small mono caption bottom-left; \"Type Mafia\" script bottom-right. → present."
      },
      {
        "k": "Feel",
        "v": "Bouncy, friendly, confident — a toy-like wordmark. → idle wobble + blink; SS02 bounce."
      }
    ]
  },
  "pass0": [
    {
      "k": "Substrate",
      "v": "flat digital green tile — screen piece, no texture (grain rejected: it would fake a print)."
    },
    {
      "k": "Process",
      "v": "none; the craft is in the drawing — inflated heavy rounded sans (Baloo 2 800 + .022em outer stroke), tracked tight (-.06em), the O replaced by a smiley whose ring is measured to the letters: Baloo 2 800 cap = .615em (+.011 stroke = .626), stem = .17em (+.022 = .19em) → O box .64em, ring stroke 30/100 units, sits on the baseline with a round overshoot."
    },
    {
      "k": "Type",
      "v": "SS01 = caps; SS02 = a real per-glyph alternate set (unicase: n r m a at cap height + wink O), not a rotation gimmick. Mono caption + script signature stay crisp."
    }
  ],
  "critique": {
    "reads_as": "A drawn typeface on a flat tile — the craft is in the letterforms, and there is nowhere to hide.",
    "coupling": "The smiley’s ring weight is derived from the stem and its box from the cap height, so the O belongs to the alphabet instead of being pasted into it.",
    "pass_order": "tile → wordmark → alternate set → caption. No reproduction pass: grain was rejected because it would fake a print.",
    "operators": [
      "measured ring",
      "unicase alternates",
      "outer stroke"
    ],
    "why_it_survives": "Set the ring to an arbitrary weight and the O reads as an icon; the rejection of grain is the removal test applied before the fact.",
    "faults": [
      "O was .92em (towered over cap-height)",
      "ring stroke 12/100 ≠ stem",
      "tracking loose",
      "SS02 was rotation only"
    ]
  }
});
