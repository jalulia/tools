/* KLS-08 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/Ki-Landscapes/ki_landscape_visualizer.html:496-508
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'kls-08',
  index: 'KLS-08',
  title: `SVG export of a Canvas2D painting (honest use of feTurbulence)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted', 'svg'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/Ki-Landscapes/ki_landscape_visualizer.html:496-508`,
    author: 'Julia Compton',
    note: `The counter-argument to HOP-03 from the same author. Here feTurbulence is a reproduction constraint of the output medium, not a mood layer, and it is the last thing added rather than a pinned film over the top. Teach the two together.`
  },
  thumb: 'thumb.png',
  text: `<p>Rebuilds the whole painting as vector: 17-stop OKLab-sampled linear gradient per band, ridge band paths, radial sun; then adds ONE feTurbulence+feColorMatrix rect at 0.05*grain purely to reproduce the paper tooth in a medium where the canvas grain tile cannot travel.</p>
    <p><b>Note.</b> The counter-argument to HOP-03 from the same author. Here feTurbulence is a reproduction constraint of the output medium, not a mood layer, and it is the last thing added rather than a pinned film over the top. Teach the two together.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/Ki-Landscapes/ki_landscape_visualizer.html:496-508</code> · SVG / Canvas2D · adjacent to 15-18
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
