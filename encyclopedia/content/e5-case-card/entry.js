/* E5 · Case-study card on field — ref Silva / Design Some Moore
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  uses: ["paper-tooth","oklab-ramp"],
  governed_by: ["components-craft"],
  "id": "e5-case-card",
  "index": "E5",
  "order": 230,
  "title": "Case-study card on field",
  "section": "layout-systems",
  "style": "atmospheric",
  "status": "canonical",
  "tags": [
    "Card",
    "Editorial",
    "Tactile"
  ],
  "source": {
    "kind": "reference-study",
    "title": "Silva / Design Some Moore"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/917",
    "previewHeight": 917
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.1,
      40
    ]
  },
  "text": "<p>A bone card on a black flat-lay stage with a cool centre lift. The plate taped to it is a photocopy: a generated timber-yard scene put through an S-curve, screened at 45° on warm copy paper, with the copier's edge burn.</p> <p>The card's own type is offset and stays crisp — two reproduction processes on one object, and you can tell which is which. The tape is an object layer: translucent body, torn ends, a gloss ridge, a contact shadow, and no print filter at all.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "black flat-lay stage with a cool centre lift; one bone card (dark-stage light: key top-left)"
    },
    {
      "k": "Process",
      "v": "the plate is a PHOTOCOPY — a generated timber-yard scene (stacked lumber, shed void, sky) → S-curve → toner dot screen on warm copy paper, copier edge-burn; card type is offset litho (crisp) · type-as-layout: Fraunces head with one italic, italic standfirst / grotesque body in two columns, hand signature"
    },
    {
      "k": "Hardware",
      "v": "two strips of cellophane tape (object layer: translucent body, torn ends, gloss ridge, contact shadow — no print filter), ghost outline frame + registration ticks"
    },
    {
      "k": "Skeleton",
      "v": "eyebrow / head / taped plate / cols / foot."
    }
  ],
  "critique": {
    "reads_as": "A card on a dark stage with a photocopy taped to it — two reproduction processes on one object.",
    "coupling": "The stage’s key light drives the card shadow, the tape’s contact shadow and the gloss ridge together; the copier’s S-curve and its edge burn come from the same transfer model.",
    "pass_order": "stage → card → scene → S-curve → dot screen → edge burn → tape as an object, last and unfiltered.",
    "operators": [
      "S-curve",
      "45° dot screen",
      "copier edge burn",
      "cellophane tape"
    ],
    "why_it_survives": "Make the plate a grey gradient and there is nothing to reproduce; filter the tape and it stops being on top of the card.",
    "faults": [
      "plate was a grey gradient",
      "tape was a multiplied strip with no shadow",
      "card floated with no shadow"
    ]
  },
  "related": [
    {
      "entry": "e5-case-card-alts",
      "relation": "variant-of"
    },
    {
      "entry": "e4-masonry-cards",
      "relation": "technique-of"
    },
    {
      "tool": "book-of-shaders",
      "entry": "00-introduction",
      "relation": "shader-behind",
      "label": "The Book of Shaders — 00 Introduction"
    },
    {
      "entry": "w1-seven-pass-band-chain",
      "relation": "source-of"
    }
  ]
});
