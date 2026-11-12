/* MIR-19 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/harmoniac.html:535-557
   The researcher's grade (D) and editorial_status
   (known_failure) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-19',
  index: 'MIR-19',
  title: `Unseeded per-frame getImageData grain plus white scanlines`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'D · known_failure',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/harmoniac.html:535-557`,
    author: 'Julia Compton',
    note: `The Canvas2D form of MIR-15, with a performance failure attached: a full-frame readback plus writeback every frame to stir unseeded noise. Unseeded means it boils and cannot be reproduced; 'every 8th pixel' means it is really a sparse RGB-channel-shifted speckle, not grain. Useful only as the before half of a before/after with KLS-02.`
  },
  thumb: 'thumb.png',
  text: `<p>drawScanlines fills every 3rd row white at alpha 0.008; drawGrain does a full-frame getImageData, adds (Math.random()-0.5)*12 to every 8th pixel, and putImageData's it back, each frame.</p>
    <p><b>Note.</b> The Canvas2D form of MIR-15, with a performance failure attached: a full-frame readback plus writeback every frame to stir unseeded noise. Unseeded means it boils and cannot be reproduced; 'every 8th pixel' means it is really a sparse RGB-channel-shifted speckle, not grain. Useful only as the before half of a before/after with KLS-02.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/harmoniac.html:535-557</code> · Canvas2D · 10 (random) - as the counter-example
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
