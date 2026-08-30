/* MM-09 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/artifacts/modemode-about-visual.html:296-340
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mm-09',
  index: 'MM-09',
  title: `3D lattice convergence with perspective divide`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/artifacts/modemode-about-visual.html:296-340`,
    author: 'Julia Compton',
    note: `The envelope (dwell / pull / hold / release) is authored, not just animated — good temporal-composition example.`
  },
  thumb: 'thumb.png',
  text: `<p>6x4x3 jittered node lattice, per-node flux phases, lerp toward a tight cluster on a 17 s envelope, Y-rotate then X-tilt then f/(f+z) perspective.</p>
    <p><b>Note.</b> The envelope (dwell / pull / hold / release) is authored, not just animated — good temporal-composition example.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/artifacts/modemode-about-visual.html:296-340</code> · Canvas2D · 8 (matrices) in 3D
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
