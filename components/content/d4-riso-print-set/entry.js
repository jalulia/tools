/* D4 · Riso print artifacts — ref circulus / now·then / light
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "d4-riso-print-set",
  "index": "D4",
  "order": 40,
  "title": "Riso print artifacts",
  "section": "print-reproduction",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Print set",
    "Riso 2C",
    "Halftone",
    "Duotone"
  ],
  "source": {
    "kind": "reference-study",
    "title": "circulus / now·then / light"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/704",
    "previewHeight": 704
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1,
      0
    ]
  },
  "text": "<p>A two-colour riso print set on a warm grey table: poster, ticket, two-up, cards, a drawdown chit. Ultramarine and orange, each its own drum, each its own registration.</p> <p>The sphere is the argument. It is a halftone of a <em>structured</em> field — lambert body, terminator, a tight specular, a rim of bounce — so it reads as an object that was photographed and then screened, not as a circle with a gradient in it. Everything small (the barcode guards, the mono captions, the die-line) stays crisp: the press only fails where there is enough ink to fail.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "a warm grey table (light stage: one soft lamp top-left, falloff to the bottom-right), 350gsm uncoated white stock"
    },
    {
      "k": "Process",
      "v": "riso 2C ultramarine + orange: halftone sphere (structured — lit from top-left, terminator, specular, rim), misregistered display"
    },
    {
      "k": "Type",
      "v": "Archivo Black display, JetBrains Mono captions, Fraunces italic wordmark; small text crisp, never filtered"
    },
    {
      "k": "Hardware",
      "v": "ticket with a perforated die-line (dashed rule + punched half-round notches), barcode (crisp EAN-like guards), business-card foil spectrum strip (subtle sheen), badge, dimension ticks"
    },
    {
      "k": "Skeleton",
      "v": "poster + ticket left column; two-up + cards centre; chit right; annotations on the table critique of previous build: poster foot and card-b foot inherited the gallery's global .foot padding (jumped into the title), the drawdown chit was two flat swatches, shadows were soft/uniform with no contact core, the sphere lacked a highlight, the spectrum strip was a flat bar."
    }
  ],
  "critique": {
    "reads_as": "A set of printed pieces photographed together on a table, with one lamp and one press.",
    "coupling": "One light vector (top-left) sets every cast shadow and the sphere’s own terminator, so the printed object and the photograph of it agree; both inks screen the same field at two angles.",
    "pass_order": "field → sphere shading → screen clipped to the sphere → second ink offset → stock → table light and shadows. Shading after screening would smooth the dots into a gradient.",
    "operators": [
      "two-ink halftone",
      "lambert shading",
      "die-line perforation",
      "contact shadow"
    ],
    "why_it_survives": "Flatten the sphere’s shading and the halftone becomes a texture on a circle; remove the crisp small type and the whole sheet reads as one filter.",
    "faults": [
      "poster foot and card-b foot inherited the gallery's global .foot padding (jumped into the title), the drawdown chit was two flat swatches, shadows were soft/uniform with no contact core, the sphere lacked a highlight, the spectrum strip was a flat bar"
    ]
  },
  "related": [
    {
      "entry": "c1-heavy-ink",
      "relation": "technique-of"
    }
  ]
});
