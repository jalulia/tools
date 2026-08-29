/* E4 · Masonry · atmospheric cards — ref Editorial gradient
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "e4-masonry-cards",
  "index": "E4",
  "order": 220,
  "title": "Masonry · atmospheric cards",
  "section": "layout-systems",
  "style": "atmospheric",
  "status": "canonical",
  "tags": [
    "Masonry",
    "Cards",
    "Atmosphere"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Editorial gradient"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/658",
    "previewHeight": 658
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A four-column masonry of hairline-ruled cards on a bone page. The five photographs are grain-gradient fields: soft colour painted at one-tenth scale, upscaled — the upscale <em>is</em> the blur — then given per-pixel mono grain.</p> <p>The bodies inside them are rotated elliptical belts rather than chains of blobs, which is what stops them reading as an AI gradient; and one film-grain canvas sits above the type so the field and the words share a single emulsion instead of the type floating on a picture.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "bone editorial page, hairline-ruled cards, 4-col masonry"
    },
    {
      "k": "Process",
      "v": "the five \"photographs\" are grain-gradient FIELDS (riso/film-poster genre): soft colour painted at 1/10 scale → upscaled (the upscale is the blur) → per-pixel mono grain 40–55; bodies are rotated elliptical BELTS (never blob chains); one film-grain canvas ABOVE the type unifies field +"
    },
    {
      "k": "Type",
      "v": "type-as-layout: Fraunces light titles bottom-left, mono tags top/bottom-right, italic quotes with one blue word"
    },
    {
      "k": "Hardware",
      "v": "none — only 1px ink hairlines"
    },
    {
      "k": "Skeleton",
      "v": "masonry columns, gutter 16, cards flush. Faults of the previous build: CSS radial-gradient blobs (AI-gradient tell), SVG turbulence \"grain\" as a soft-light overlay (an effect without a cause), no belt structure, no film layer over the type."
    }
  ],
  "critique": {
    "reads_as": "A page of cards whose pictures were printed on the same stock as the type.",
    "coupling": "One film-grain canvas sits above both the fields and the type, so the picture and the words share an emulsion; the fields’ blur is the upscale, so softness and grain come from the same operation.",
    "pass_order": "paint at 1/10 → upscale (this is the blur) → per-pixel grain → type → one film layer over everything.",
    "operators": [
      "low-res paint",
      "upscale blur",
      "elliptical belts",
      "film grain"
    ],
    "why_it_survives": "Replace the belts with CSS radial gradients and the fields become the AI-gradient tell; put the grain under the type and the type floats on the picture."
  },
  "related": [
    {
      "entry": "e5-case-card",
      "relation": "technique-of"
    }
  ]
});
