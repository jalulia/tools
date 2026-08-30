/* MM-08 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/artifacts/modemode-about-visual.html:276-292 + 596-609
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mm-08',
  index: 'MM-08',
  title: `Scene engine registry (init/frame) + ResizeObserver + IntersectionObserver gating`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/artifacts/modemode-about-visual.html:276-292 + 596-609`,
    author: 'Julia Compton',
    note: `This is the shell architecture both refreshed tools should adopt. It already exists in Julia's own most recent work.`
  },
  thumb: 'thumb.png',
  text: `<p>mkScene(stage,engine) factory; engines are {init(s),frame(s,t)}; one shared rAF; ResizeObserver re-inits; IntersectionObserver sets s.vis; reduced-motion renders a single static frame at t=9.2.</p>
    <p><b>Note.</b> This is the shell architecture both refreshed tools should adopt. It already exists in Julia's own most recent work.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/artifacts/modemode-about-visual.html:276-292 + 596-609</code> · Canvas2D (architecture) · architecture — not a chapter
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
