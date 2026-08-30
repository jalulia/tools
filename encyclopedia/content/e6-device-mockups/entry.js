/* E6 · Device & social mockups — ref in-situ minimal
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  governed_by: ["components-craft"],
  "id": "e6-device-mockups",
  "index": "E6",
  "order": 270,
  "title": "Device & social mockups",
  "section": "in-situ",
  "style": "swiss-modular",
  "status": "canonical",
  "tags": [
    "Devices",
    "Instagram",
    "X",
    "Spec sheet"
  ],
  "source": {
    "kind": "reference-study",
    "title": "in-situ minimal"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1168",
    "previewHeight": 1168
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A cool grey presentation board of in-situ mockups: phones with correct bezels, island, buttons and home bar; a browser plate; social posts; a spec sheet. One accent colour in the whole sheet.</p> <p>Every photo area is a generated greyscale scene — a still life, an interior, an architecture shot — lit once, with soft cast shadows and a faint sensor grain. A CSS gradient standing in for a photograph is the single most common failure in an in-situ sheet, because it makes the mockup look finished while proving nothing.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "cool grey presentation board (screen, digital-clean)"
    },
    {
      "k": "Process",
      "v": "none — 1px chrome hairlines, 1.5px icon strokes, precise device geometry"
    },
    {
      "k": "Type",
      "v": "Inter UI at native sizes, mono captions"
    },
    {
      "k": "Hardware",
      "v": "bezels, island, buttons, home bar"
    },
    {
      "k": "Skeleton",
      "v": "230/230/1fr sheet at 1000px scaled to fit."
    }
  ],
  "critique": {
    "reads_as": "A presentation board of in-situ mockups where the screens contain photographs rather than gradients.",
    "coupling": "Every photo area is a generated scene under one light with the same sensor grain, so nine screens across four devices look like they came from one camera; a single accent colour marks every interactive element.",
    "pass_order": "board → device geometry → screen scenes → UI chrome → cast shadows last.",
    "operators": [
      "generated greyscale scene",
      "exact device geometry",
      "single accent",
      "sensor grain"
    ],
    "why_it_survives": "Fill the screens with CSS gradients and the sheet looks finished while proving nothing — which is the failure mode of every in-situ board.",
    "faults": [
      "every photo area was a flat CSS gradient (a gradient standing in for a photograph) → each is now a generated greyscale scene (still life / interior / architecture)",
      "one light",
      "soft cast shadows",
      "faint sensor grain",
      "ONE accent (#2F5FD6) kept",
      "the global .hero chrome rule was leaking padding into the browser plate (squashed headline) — neutralised"
    ]
  },
  "related": [
    {
      "tool": "book-of-shaders",
      "entry": "10-random",
      "relation": "shader-behind",
      "label": "The Book of Shaders — 10 Random"
    }
  ]
});
