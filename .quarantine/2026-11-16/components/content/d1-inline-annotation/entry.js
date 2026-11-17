/* D1 · Inline-annotation statement — ref Elliot Ulm / Grilli specimen
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "d1-inline-annotation",
  "index": "D1",
  "order": 100,
  "title": "Inline-annotation statement",
  "section": "type-specimen",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Type",
    "Flat colour",
    "Inline shapes",
    "B&W alt"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Elliot Ulm / Grilli specimen"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/620",
    "previewHeight": 620
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [2.0, 0]
  },
  "text": "<p>Two panels, flat process yellow and plain white, zero texture. A statement set in heavy caps with four inline annotation forms — pill, tab, bracket, lozenge — threaded through the sentence.</p> <p>The forms are measured, not placed: each is sized to the headline's x-height and sits on its baseline, which is why they read as punctuation rather than as stickers. The black-and-white alternate replaces them with torn paper strips, and that is the only print idea anywhere in the lens.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "flat process yellow (#f4c20d) and plain white — SCREEN/vector, zero texture, zero tooth."
    },
    {
      "k": "Process",
      "v": "digital-clean; the only \"print\" idea is the B&W alt where words are torn paper strips."
    },
    {
      "k": "Type",
      "v": "Archivo Black caps, tracking tight (-.035em), leading .95; annotations are JetBrains Mono hairline (1px) shapes sized to the x-HEIGHT (.525em of headline) and sitting on the BASELINE."
    },
    {
      "k": "Hardware",
      "v": "4 inline forms (pill / tab / bracket / lozenge) + a stacked pair reaching cap-height; tears."
    },
    {
      "k": "Skeleton",
      "v": "two equal panels, corner labels, statement block left-aligned, sub + credit below. faults found: pills .35–.41em tall (under x-height) and 1–2.6px BELOW baseline; tears .97em zigzags sitting 6px below baseline, no fibre, no paper edge; tracking timid; corner squares fine."
    }
  ],
  "critique": {
    "reads_as": "A sentence with its own annotation system, set in two flat colours and nothing else.",
    "coupling": "Every inline form is sized from the headline’s x-height and sits on its baseline, so changing the type size moves all four shapes correctly; script measures the lift rather than hard-coding it.",
    "pass_order": "panels → statement → forms measured against the rendered type → sub and credit. Measuring before the font loads gives the wrong lift, which is why the calibration waits on fonts.ready.",
    "operators": [
      "x-height metric",
      "hairline inline forms",
      "torn strip alternate"
    ],
    "why_it_survives": "Place the pills by eye and they sit under the baseline, which is exactly the fault the previous build shipped."
  },
  "related": [
    {
      "entry": "e1-type-stack",
      "relation": "variant-of"
    }
  ]
});
