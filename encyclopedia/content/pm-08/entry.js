/* PM-08 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:1050-1200
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-08',
  index: 'PM-08',
  title: `Procedural greyscale photograph → halftone/duotone`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:1050-1200`,
    author: 'Julia Compton',
    note: `Split it: the 'make a scene' half is bespoke, the 'reproduce it' half is a ~25-line reusable example. Print-physics realism without a single stock asset.`
  },
  thumb: 'thumb.png',
  text: `<p>Builds a believable greyscale scene from gradients + shade/cast primitives, then reproduces it through a 45-degree rotated dot grid (r = (1-lum)*cell*0.62) or a duotone lerp.</p>
    <p><b>Note.</b> Split it: the 'make a scene' half is bespoke, the 'reproduce it' half is a ~25-line reusable example. Print-physics realism without a single stock asset.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:1050-1200</code> · Canvas2D · 15/16 (textures + image ops)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
