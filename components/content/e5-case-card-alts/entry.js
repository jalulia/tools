/* E5·ALT · Case-study card — two alternates — ref What's in the Bag / Vacation®
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "e5-case-card-alts",
  "index": "E5·ALT",
  "order": 240,
  "title": "Case-study card — two alternates",
  "section": "layout-systems",
  "style": "riso-xerox",
  "status": "canonical",
  "tags": [
    "Card",
    "Collage",
    "Screenprint",
    "Halftone"
  ],
  "source": {
    "kind": "reference-study",
    "title": "What's in the Bag / Vacation®"
  },
  "frame": {
    "designWidth": 1100,
    "aspect": "1100/769",
    "previewHeight": 769
  },
  "thumb": {
    "file": "thumb.png",
    "crop": [
      1.25,
      0
    ]
  },
  "text": "<p>Two alternates of the same brief, side by side. <b>A</b> is a flatbed scan of found ephemera: every fragment is itself a print, so every fragment carries feed jitter and toner pinholes, and the coral is a genuinely separate press run — its own seed, sloppier displacement, a 0.4° twist, multiplied underneath the main pass. <b>B</b> is a two-colour screenprint on newsprint, with the green ink misregistered by a pixel and a half and the previous page showing through at five percent.</p> <p>This lens is why the library needed a manifest. It was in the document and in the top nav and had no gallery card, so the discovery surface the tool told you to use could not reach it.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "scanned white stock (canvas tooth + scanner vignette)"
    },
    {
      "k": "Process",
      "v": "flatbed SCAN of found ephemera — every fragment is a print (feed-jitter + toner pinholes via #ca-scan); the coral is a genuinely separate press run (#ca-mis: own seed, sloppier displacement, +0.4° and 2px off, multiply, UNDER the main pass); 3 fragments (green pill, blue licence, orange price dot) carry a real dot-screen interior (canvas halftone → background) · type-as-layout: bubble headline (heavy stroke, per-glyph bulge), caps standfirst, mono field-notes on a sticker"
    },
    {
      "k": "Hardware",
      "v": "cellophane tape (object layer: translucent, gloss ridge, torn ends, contact shadow), kiss-cut vinyl sticker with white lip (no print filter, own sheen + light-stage shadow), taped photocopy plate"
    },
    {
      "k": "Skeleton",
      "v": "eyebrow / head / row / sticker."
    }
  ],
  "critique": {
    "reads_as": "Two alternates of one brief: a scan of found ephemera, and a two-colour screenprint on newsprint.",
    "coupling": "In A, every fragment is itself a print, so one scan pass applies feed jitter and pinholes to all of them and the coral run carries its own seed and offset; in B, one misregistration vector moves the whole green plate.",
    "pass_order": "A: fragment prints → coral run under → assemble → flatbed scan (vignette, tooth) → tape and vinyl last. B: newsprint → show-through → blue plate → green plate offset → ink bleed.",
    "operators": [
      "scan vignette",
      "per-fragment feed jitter",
      "separate press run",
      "dot-screen interiors",
      "show-through"
    ],
    "why_it_survives": "Scan the collage as one flat image and the fragments stop being prints; put the coral run on top and the misregistration reads as a drop shadow."
  },
  "related": [
    {
      "entry": "e5-case-card",
      "relation": "variant-of"
    },
    {
      "tool": "book-of-shaders",
      "entry": "00-introduction",
      "relation": "shader-behind",
      "label": "The Book of Shaders — 00 Introduction"
    }
  ]
});
