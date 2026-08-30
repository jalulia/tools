/* RS-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/resort.html:47-52
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'rs-02',
  index: 'RS-02',
  title: `Stippled canopy (density from area, tone from height)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/resort.html:47-52`,
    author: 'Julia Compton',
    note: `sqrt(rnd()) for uniform disc sampling is a real technique taught in one line.`
  },
  thumb: 'thumb.png',
  text: `<p>Ellipse plus sqrt-distributed stipples whose count scales with rx*ry and whose colour depends on whether the point is above or below centre.</p>
    <p><b>Note.</b> sqrt(rnd()) for uniform disc sampling is a real technique taught in one line.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/resort.html:47-52</code> · Canvas2D · 9 (patterns with variation)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
