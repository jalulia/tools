/* CMP-04 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/components/index.html:6175-6235 (widthAt/cat/densify/ribbon/bristles)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'cmp-04',
  index: 'CMP-04',
  title: `Brush-stroke ribbon with bristle separation`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted', 'svg'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/components/index.html:6175-6235 (widthAt/cat/densify/ribbon/bristles)`,
    author: 'Julia Compton',
    note: `widthAt() is a shaping function applied to arc length — the clearest 'shaping functions are the design' example in the Components set.`
  },
  thumb: 'thumb.png',
  text: `<p>Catmull-Rom through loose control points, densified, given a width profile, and split into individual bristle strands with per-strand offsets.</p>
    <p><b>Note.</b> widthAt() is a shaping function applied to arc length — the clearest 'shaping functions are the design' example in the Components set.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/components/index.html:6175-6235 (widthAt/cat/densify/ribbon/bristles)</code> · Canvas2D → SVG path · 7 (shapes) + 5 (shaping functions)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
