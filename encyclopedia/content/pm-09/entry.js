/* PM-09 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:1638-1731
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-09',
  index: 'PM-09',
  title: `Spectral ribbons (faceted hue keyframes + diagonal refraction)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:1638-1731`,
    author: 'Julia Compton',
    note: `The refraction is a sampling OFFSET, not a distortion filter — exactly the 'body vs filter' distinction in the material skill.`
  },
  thumb: 'thumb.png',
  text: `<p>Per-column hue ramp with smoothstep between keyframe stops (facets hold then pivot); the column top samples the ramp ~0.035 behind the bottom, which reads as refraction; two blur passes fuse columns.</p>
    <p><b>Note.</b> The refraction is a sampling OFFSET, not a distortion filter — exactly the 'body vs filter' distinction in the material skill.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:1638-1731</code> · Canvas2D · 6 (colors) + 5 (shaping functions)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
