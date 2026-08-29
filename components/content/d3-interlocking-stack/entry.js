/* D3 · Interlocking stack + script overlay — ref Ampera
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "d3-interlocking-stack",
  "index": "D3",
  "order": 80,
  "title": "Interlocking stack + script overlay",
  "section": "type-specimen",
  "style": "display-specimen",
  "status": "canonical",
  "tags": [
    "Type stack",
    "Knockout script",
    "Marker"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Ampera"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/1353",
    "previewHeight": 1353
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.1,
      60
    ]
  },
  "text": "<p>Sand riso stock, two drums — black, then fluorescent orange with its own registration, its own twist and its own pinhole seed. The inks are translucent and multiply, so where they overlap you get a third colour that neither drum contains.</p> <p>The script is knocked <em>out</em> of the letterforms rather than laid over them: the sand shows through, and a hairline outline keeps the word legible. The marker ellipse around TYPE is post-print — opaque, wavering, dilated — and sits on top of everything, including the paper.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "sand riso stock (uncoated, visible tooth + fibres), photographed flat under one soft light — a PRINT, not a screen"
    },
    {
      "k": "Process",
      "v": "riso 2-colour: BLACK drum (run 1) and FLUORESCENT ORANGE drum (run 2, its own registration: +5.5u,+3.5u, .4° twist, sloppier feed, its own pinhole seed); inks translucent → multiply; the outlined 2026 is a thin keyline that starves at the edges"
    },
    {
      "k": "Type",
      "v": "Anton condensed stack with negative leading, lines interlocking via weave bands; Yellowtail script \"everyday\" knocked OUT of the letterforms (sand shows through) with a hairline outline so the whole word reads — the knockout is part of the plate: crisp"
    },
    {
      "k": "Hardware",
      "v": "a hand-drawn orange paint-marker ellipse around TYPE — post-print, opaque, waver + dilate, on top of everything"
    },
    {
      "k": "Skeleton",
      "v": "rule / stack of five lines / rule; corner mono labels critique of previous build: flat digital fills (no paper, no ink texture, no misregistration), marker circle was a thin uniform vector ellipse under the display type, 2026 outline was CAD-clean."
    }
  ],
  "critique": {
    "reads_as": "A two-colour riso print on sand stock that somebody has since drawn on with a paint marker.",
    "coupling": "The orange drum has its own registration, twist and pinhole seed, so every orange mark is late in the same way; the knockout script is cut from the same plate as the stack, so it moves with it.",
    "pass_order": "stock → black drum → orange drum offset → multiply → keyline starve → marker ellipse on top, opaque.",
    "operators": [
      "two-drum misregistration",
      "multiply ink",
      "knockout",
      "marker dilate"
    ],
    "why_it_survives": "Draw the script over the letters instead of out of them and the plate becomes two layers; give the marker the ink filter and it stops being a hand.",
    "faults": [
      "flat digital fills (no paper, no ink texture, no misregistration), marker circle was a thin uniform vector ellipse under the display type, 2026 outline was CAD-clean"
    ]
  },
  "related": [
    {
      "entry": "d2-circled-glyphs",
      "relation": "technique-of"
    }
  ]
});
