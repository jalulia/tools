/* MIR-18 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/mir-818-strand.html:413-421
   The researcher's grade (B) and editorial_status
   (promising_exploration) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-18',
  index: 'MIR-18',
  title: `HalftonePass as a screen system (angles, radius, blending) over a bloomed render`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B · promising_exploration',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/mir-818-strand.html:413-421`,
    author: 'Julia Compton',
    note: `Pass ORDER is right and deliberate; mir-fano-spiral.html:413 documents the decision not to use it at all ('No halftone pass - clean rendering only'), which is the kind of note the manifest should carry. But blending:0.4 mixes the halftone back over an un-quantized original, so the dots decorate rather than reproduce - the same critique as CSS-filter-as-material. Also at eversion:288-305 and fano-helix-null:410-415.`
  },
  thumb: 'thumb.png',
  text: `<p>Bloom then halftone, in that order, so the dots quantize the already-toned image; screen angles at PI/12, 2*PI/12, 3*PI/12 for R/B/G, radius 2, scatter 0, blending 0.4.</p>
    <p><b>Note.</b> Pass ORDER is right and deliberate; mir-fano-spiral.html:413 documents the decision not to use it at all ('No halftone pass - clean rendering only'), which is the kind of note the manifest should carry. But blending:0.4 mixes the halftone back over an un-quantized original, so the dots decorate rather than reproduce - the same critique as CSS-filter-as-material. Also at eversion:288-305 and fano-helix-null:410-415.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/mir-818-strand.html:413-421</code> · GLSL (three.js addon, configured) · 09 (patterns) + 17/18
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
