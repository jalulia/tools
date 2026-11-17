/* KLS-09 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/Ki-Landscapes/ki_landscape_visualizer.html:510-528
   The researcher's grade (A-) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'kls-09',
  index: 'KLS-09',
  title: `Paintable composition map: feathered region masks with a live per-pixel OKLab preview`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/Ki-Landscapes/ki_landscape_visualizer.html:510-528`,
    author: 'Julia Compton',
    note: `The parameter affordance the Book of Shaders lacks and KI-06 only half-solves: a direct-manipulation surface that is literally the renderer at low resolution, so it cannot drift from what you get.`
  },
  thumb: 'thumb.png',
  text: `<p>A small offscreen buffer is filled per pixel by evaluating the same colorLab() the renderer uses, then upscaled with smoothing; the selected region's mask 0.5 contour is stroked over it. Regions are painted by the user and feathered by rebuildFeather.</p>
    <p><b>Note.</b> The parameter affordance the Book of Shaders lacks and KI-06 only half-solves: a direct-manipulation surface that is literally the renderer at low resolution, so it cannot drift from what you get.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/Ki-Landscapes/ki_landscape_visualizer.html:510-528</code> · Canvas2D · 06 (colour) + the shell's parameter affordance
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
