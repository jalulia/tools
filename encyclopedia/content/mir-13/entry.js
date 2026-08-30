/* MIR-13 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/mir-818-strand.html:485-511
   The researcher's grade (A-) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-13',
  index: 'MIR-13',
  title: `Perspective-scaled point-sprite impostor (ring + core, gl_PointCoord distance field)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · canonical',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/mir-818-strand.html:485-511`,
    author: 'Julia Compton',
    note: `Four near-identical copies: eversion:399-424, mir-fano-spiral:477-502, fano-helix-null:479-504. Extract once. Verified rendering in shots-addendum/mir-818-strand.png - the ring+core reads as a lit bead at every depth, which a plain disc would not.`
  },
  thumb: 'thumb.png',
  text: `<p>gl_PointSize = size * (200.0/-mvPos.z) gives real perspective falloff; the fragment discards outside d>0.5 and composes a bright core (1-smoothstep(0,0.35,d)) with a thin ring (smoothstep(0.38,0.42,d)*0.6), scaled by a per-vertex alpha attribute.</p>
    <p><b>Note.</b> Four near-identical copies: eversion:399-424, mir-fano-spiral:477-502, fano-helix-null:479-504. Extract once. Verified rendering in shots-addendum/mir-818-strand.png - the ring+core reads as a lit bead at every depth, which a plain disc would not.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/mir-818-strand.html:485-511</code> · GLSL (vertex + fragment) · 07 (shapes) - the book's circle/smoothstep lesson, used in production
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
