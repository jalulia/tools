/* KI-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/ki-landscapes/index.html:187-191
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'ki-02',
  index: 'KI-02',
  title: `Quintic-fade 1-D value noise + fBm with lacunarity/persistence`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/ki-landscapes/index.html:187-191`,
    author: 'Julia Compton',
    note: `Names lacunarity and persistence, which the shipped Book of Shaders playground hard-codes and never mentions. Straight swap-in for a corrected chapter 13.`
  },
  thumb: 'thumb.png',
  text: `<p>makeNoise uses the 6t^5-15t^4+10t^3 fade (true Perlin fade, not smoothstep); fbm1D exposes octaves and persistence as named parameters and normalises by the amplitude sum.</p>
    <p><b>Note.</b> Names lacunarity and persistence, which the shipped Book of Shaders playground hard-codes and never mentions. Straight swap-in for a corrected chapter 13.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/ki-landscapes/index.html:187-191</code> · Canvas2D · 11 + 13
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
