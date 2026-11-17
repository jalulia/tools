/* YOS-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/yoshi/yoshi-hill-run.html:100-140
   The researcher's grade (B+) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'yos-02',
  index: 'YOS-02',
  title: `Fixed internal resolution + nearest-neighbour upscale + declarative sprite arrays`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B+ · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/yoshi/yoshi-hill-run.html:100-140`,
    author: 'Julia Compton',
    note: `Resolution as a material decision rather than a performance accident - the Canvas2D twin of pussyphus's DITHER_SCALE render target (MIR-11). The named palette object is also the cleanest small colour-system declaration in the addendum.`
  },
  thumb: 'thumb.png',
  text: `<p>Everything renders into a 384x216 backing store with imageSmoothingEnabled=false and CSS scales it up; sprites are 2-D arrays of palette keys drawn by one drawSprite(data,x,y,flipX) helper against a named 20-entry palette.</p>
    <p><b>Note.</b> Resolution as a material decision rather than a performance accident - the Canvas2D twin of pussyphus's DITHER_SCALE render target (MIR-11). The named palette object is also the cleanest small colour-system declaration in the addendum.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/yoshi/yoshi-hill-run.html:100-140</code> · Canvas2D · implementation-lane appendix
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
