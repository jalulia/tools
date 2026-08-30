/* PM-15 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:65-89
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-15',
  index: 'PM-15',
  title: `rAFLazy + drainPaints (viewport-gated paint scheduler)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:65-89`,
    author: 'Julia Compton',
    note: `This is the exact fix for Components' 65-simultaneous-canvas problem, already written, in Julia's own hand.`
  },
  thumb: 'thumb.png',
  text: `<p>IntersectionObserver with 1400 px rootMargin queues each heavy paint; whatever never scrolled into view drains one-by-one 240 ms apart after load, so nothing is ever blank and there is never a paint storm.</p>
    <p><b>Note.</b> This is the exact fix for Components' 65-simultaneous-canvas problem, already written, in Julia's own hand.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:65-89</code> · JS (architecture) · architecture — not a chapter
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
