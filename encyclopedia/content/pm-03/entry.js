/* PM-03 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:153-160
   The researcher's grade (B+) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-03',
  index: 'PM-03',
  title: `2-D value noise (memoised lattice hash)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B+ · technical_reference',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:153-160`,
    author: 'Julia Compton',
    note: `Object-key memoisation ('x_y' strings) is slow and unbounded; fine for one-shot paints, wrong for animation. Teach the array/hash version instead.`
  },
  thumb: 'thumb.png',
  text: `<p>Bilinear interpolation of a lazily-memoised per-lattice-point hash with smoothstep fade.</p>
    <p><b>Note.</b> Object-key memoisation ('x_y' strings) is slow and unbounded; fine for one-shot paints, wrong for animation. Teach the array/hash version instead.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:153-160</code> · Canvas2D · 11 (noise)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
