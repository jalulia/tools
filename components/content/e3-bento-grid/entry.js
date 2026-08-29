/* E3 · Bento grid — ref Bento
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "e3-bento-grid",
  "index": "E3",
  "order": 210,
  "title": "Bento grid",
  "section": "layout-systems",
  "style": "swiss-modular",
  "status": "historical",
  "tags": [
    "Grid",
    "Tiles",
    "Modular"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Bento"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/679",
    "previewHeight": 679
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A four-by-three bento of hairline tiles with square corners and a twelve-pixel gap, one filled accent tile, and a one-pixel SVG sparkline with an accent endpoint.</p> <p>Kept for the record rather than recommended. The bento is a layout that arranges attention by tile size and then gives every tile the same weight of rule, so the hierarchy it promises is not one it can deliver; <em>E2</em> does the same job with a grid that can actually be argued with.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "white screen page"
    },
    {
      "k": "Process",
      "v": "digital-clean; 1px hairline tiles, square corners, gap 12"
    },
    {
      "k": "Type",
      "v": "Fraunces display, mono keys, one filled accent tile"
    },
    {
      "k": "Hardware",
      "v": "none"
    },
    {
      "k": "Skeleton",
      "v": "4×3, integer column widths (JS snap → --bt-w). Faults fixed: X-placeholder media → generated grey architecture scene; chunky bar \"sparkline\" → crisp 1px SVG sparkline with hairline grid + accent endpoint; fractional columns → snapped."
    }
  ],
  "related": [
    {
      "entry": "e2-modular-grid",
      "relation": "variant-of"
    }
  ]
});
