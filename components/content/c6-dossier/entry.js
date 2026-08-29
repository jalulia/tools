/* C6 · Dossier / correspondence — ref AgentMail
   Injected as a classic <script src> by the shell when this entry is routed to.
   PASS 0 and FAULTS below were promoted out of the CSS comment that carried
   them in the monolith; the REFERENCE STUDY (where there is one) out of the
   .refstrip that followed the section. */
Shell.registerEntry({
  "id": "c6-dossier",
  "index": "C6",
  "order": 150,
  "title": "Dossier / correspondence",
  "section": "document-system",
  "style": "editorial-serif",
  "status": "canonical",
  "tags": [
    "Envelope",
    "Foil seal",
    "Bone paper",
    "Mono"
  ],
  "source": {
    "kind": "reference-study",
    "title": "AgentMail"
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
  "text": "<p>A deep-green envelope on a bone desk, a letter, three dispatch slips and a foil seal. The type is digital-clean throughout; the physics is all in the objects.</p> <p>The seal is spun brushed metal painted per pixel, with pressure darkening where it was struck and a contact shadow under its rim. The flap has an occlusion strip along the crease and a one-pixel lit edge. One light, top-left; every shadow falls down and right.</p>",
  "reference": null,
  "pass0": [
    {
      "k": "Substrate",
      "v": "light bone desk field, a deep-green envelope stock (tooth + fibre), bone letter paper, three thin dispatch slips"
    },
    {
      "k": "Process",
      "v": "digital-clean type on paper; the seal is a stamped foil disc (spun brushed metal, painted per-pixel on canvas) · type-as-layout: DOSSIER · 07 runs vertically up the envelope; Fraunces headline on the paper; mono corner labels"
    },
    {
      "k": "Hardware",
      "v": "envelope flap with an occlusion strip along the crease + 1px lit edge, foil seal with pressure darkening + contact shadow, peeking slips with contact shadows and translucent edges · one light: top-left, every shadow falls down-right. Faults fixed: seal was a smooth conic gradient + boilerplate \"0 6px 16px\" drop; flap crease had no occlusion / lit edge; slips and paper used straight-down soft shadows; envelope tooth was faint."
    }
  ],
  "critique": {
    "reads_as": "An envelope, a letter and a seal on a desk, lit once.",
    "coupling": "One light vector, top-left: the flap’s occlusion, the seal’s pressure darkening and every slip’s contact shadow are the same lamp, so the objects share a table.",
    "pass_order": "desk → envelope stock and tooth → flap crease → paper and slips → foil seal struck last, with its own contact shadow.",
    "operators": [
      "brushed foil",
      "crease occlusion",
      "contact shadow",
      "envelope tooth"
    ],
    "why_it_survives": "Replace the seal with a conic gradient and it floats; give everything a straight-down blur and the lamp disappears."
  }
});
