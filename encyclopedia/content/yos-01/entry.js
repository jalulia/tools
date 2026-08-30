/* YOS-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/YoshiOS/Documents/YoshiOS/index.html:46-84 (BAYER8 table at 46)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'yos-01',
  index: 'YOS-01',
  title: `Bayer-8 ordered dither used as a transition wipe`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/YoshiOS/Documents/YoshiOS/index.html:46-84 (BAYER8 table at 46)`,
    author: 'Julia Compton',
    note: `Dither as TIME rather than texture - nothing else in the corpus or the book does this. Small, self-contained, immediately legible, and it makes the point that an ordered threshold matrix is a comparison operator, not a look.`
  },
  thumb: 'thumb.png',
  text: `<p>A 30px band sweeps the frame over 280ms; within it the dither threshold is distance-from-band-centre * 64, so the leading edge is sparse, the centre solid and the trailing edge sparse. 2px cells, one fill colour.</p>
    <p><b>Note.</b> Dither as TIME rather than texture - nothing else in the corpus or the book does this. Small, self-contained, immediately legible, and it makes the point that an ordered threshold matrix is a comparison operator, not a look.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/YoshiOS/Documents/YoshiOS/index.html:46-84 (BAYER8 table at 46)</code> · Canvas2D · 09 (patterns) + new dithering chapter
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
