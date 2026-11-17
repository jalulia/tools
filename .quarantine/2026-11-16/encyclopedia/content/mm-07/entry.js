/* MM-07 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/artifacts/modemode-about-visual.html:443-487 + 488-530
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mm-07',
  index: 'MM-07',
  title: `Type sampled to a point cloud then rendered four ways`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/artifacts/modemode-about-visual.html:443-487 + 488-530`,
    author: 'Julia Compton',
    note: `Has a try/catch around getImageData and an empty-points guard. One source, four reads, ordered crossfade.`
  },
  thumb: 'thumb.png',
  text: `<p>Offscreen canvas draws the word, alpha>128 thresholds to a point set; the same set is drawn as grain stipple / quantized pixels / nearest-neighbour wireframe / bloom field with crossfade.</p>
    <p><b>Note.</b> Has a try/catch around getImageData and an empty-points guard. One source, four reads, ordered crossfade.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/artifacts/modemode-about-visual.html:443-487 + 488-530</code> · Canvas2D · no BoS equivalent (type as source)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
