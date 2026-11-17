/* E1 · Editorial type-stack — ref Athletics
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "e1-type-stack",
  "index": "E1",
  "order": 70,
  "title": "Editorial type-stack",
  "section": "type-specimen",
  "style": "editorial-serif",
  "status": "canonical",
  "tags": [
    "Editorial",
    "Type",
    "Asymmetric"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Athletics"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/939",
    "previewHeight": 939
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [1, 0]
  },
  "text": "<p>A near-black screen, hairlines at exactly 25% white, and a stack of Fraunces set at optical size 144 with negative leading. There is no texture on it at all: the 5% noise veil an earlier build wore was an effect with no cause, and removing it is the whole revision.</p> <p>Type is the layout. Mono superscript numerals hang at cap height, the highlighter blocks sit under the x-height, and the only other mark in the plate is a rule.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "near-black SCREEN (#0b0b0c), digital-clean — no grain (a screen has no tooth; the previous 5% SVG-noise veil was an effect without a cause and is removed)"
    },
    {
      "k": "Process",
      "v": "none; hairlines at exactly rgba(255,255,255,.25) · type-as-layout: Fraunces at optical size 144 (font-optical-sizing:auto resolves opsz from the 124px size; SOFT 0 / WONK 0 pinned so the stack stays crisp), leading .9, tracking −.03em, mono superscript numerals hung at cap height; Archivo body; accent highlighter blocks under x-height words"
    },
    {
      "k": "Hardware",
      "v": "none"
    },
    {
      "k": "Skeleton",
      "v": "top rule / stack / two-column band / meta rule."
    }
  ],
  "critique": {
    "reads_as": "A screen, admitted as a screen: black, crisp, and carrying nothing it did not earn.",
    "coupling": "Optical size is bound to the rendered size, so the display cut and the body cut are the same family answering the same question at two scales rather than two fonts.",
    "pass_order": "rule → stack → band → meta rule. There is no reproduction pass at all, and that absence is the decision.",
    "operators": [
      "optical sizing",
      "negative leading",
      "hairline rule"
    ],
    "why_it_survives": "The 5% noise veil was removed and nothing was lost — which is the removal test passing in the direction people find hardest."
  },
  "related": [
    {
      "entry": "c2-style-guide",
      "relation": "technique-of"
    }
  ]
});
