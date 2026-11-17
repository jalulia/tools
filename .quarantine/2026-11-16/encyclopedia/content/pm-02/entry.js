/* PM-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:147-152
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-02',
  index: 'PM-02',
  title: `1-D value noise + fBm ridgelines`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:147-152`,
    author: 'Julia Compton',
    note: `The 1-D framing is exactly how the original ch.13 teaches fBm and exactly what the playground dropped.`
  },
  thumb: 'thumb.png',
  text: `<p>vnoise1() builds a 256-entry table with smoothstep interpolation; fbm1(n,oct) sums octaves; abs(n-0.5) makes ridged spikes.</p>
    <p><b>Note.</b> The 1-D framing is exactly how the original ch.13 teaches fBm and exactly what the playground dropped.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:147-152</code> · Canvas2D · 11 (noise) + 13 (fBm)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
