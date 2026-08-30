/* D6 · Tactile duotone social tiles — ref GROW creative kit
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  uses: ["paper-tooth","dot-screen-20"],
  governed_by: ["components-craft"],
  "id": "d6-social-tiles",
  "index": "D6",
  "order": 60,
  "title": "Tactile duotone social tiles",
  "section": "print-reproduction",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Social",
    "Duotone",
    "Tape/Polaroid",
    "Handwriting"
  ],
  "source": {
    "kind": "reference-study",
    "title": "GROW creative kit"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/739",
    "previewHeight": 739
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.3,
      0
    ]
  },
  "text": "<p>Eight tiles of a social kit on a pale board. Each tile is a small collage — paper, polaroids, a spiral notepad, a postcard, washi tape — and each duotone photograph is a generated greyscale scene mapped periwinkle→yellow rather than a picture tinted two colours.</p> <p>The stuck-on objects are the reason this holds together. Tape is translucent with torn ends and a gloss ridge; the polaroid has a recessed window with a lip shadow; the spiral is painted wire with a cast shadow. One lamp, top-left, and every contact shadow falls the same way.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "eight printed tiles on a pale board, photographed flat under one lamp top-left; each tile is a little collage: paper, polaroids, a spiral notepad, a postcard, tape"
    },
    {
      "k": "Process",
      "v": "duotone \"photos\" = GENERATED greyscale scenes (bust, desk, plant, window) mapped periwinkle→yellow / paper with grain and soft posterisation; press type is digital-clean; hand marks are marker (waver) on top"
    },
    {
      "k": "Type",
      "v": "Fraunces display (roman + italic), Archivo grotesk, JetBrains Mono index tags, Caveat handwriting (never filtered by print)"
    },
    {
      "k": "Hardware",
      "v": "washi tape: translucent (multiply), TORN ends (jittered polygon), a glossy ridge along the length, contact shadow; polaroids: white frame, recessed photo window with a bottom lip shadow; spiral rings: painted metal wire loops with cast shadows; postcard stamp + cancel; every stuck-on object casts a contact shadow toward bottom-right"
    },
    {
      "k": "Skeleton",
      "v": "kit header row · 4×2 grid."
    }
  ],
  "critique": {
    "reads_as": "Eight small collages that were made by hand and then photographed, not eight cards laid out in a grid.",
    "coupling": "One lamp top-left drives every contact shadow — tape, polaroid, spiral, postcard — and one duotone map drives all four photographs, so the tiles read as one kit.",
    "pass_order": "greyscale scene → duotone map → posterise and grain → paper objects → tape and rings with their contact shadows → marker notes last.",
    "operators": [
      "duotone map",
      "posterisation",
      "torn washi tape",
      "contact shadow",
      "marker"
    ],
    "why_it_survives": "Replace the scenes with gradient blobs and the duotone has nothing to map; square the tape ends and the whole board flattens into vector.",
    "faults": [
      "photos were radial-gradient blobs (a \"bust\" made of two circles)",
      "tape was a flat rectangle with square ends",
      "rings were a broken SVG lollipop pattern",
      "scribbles were uniform vector strokes",
      "hand notes inherited the gallery's global .note padding (pushed 60px up into the bar chart / phone)",
      "polaroids collided with headlines (t4, t5) and lists (t8)",
      "shadows were generic"
    ]
  },
  "related": [
    {
      "entry": "b3-wristband",
      "relation": "technique-of"
    },
    {
      "tool": "book-of-shaders",
      "entry": "20-dithering-and-quantization",
      "relation": "shader-behind",
      "label": "The Book of Shaders — 20 Dithering and quantization"
    }
  ]
});
