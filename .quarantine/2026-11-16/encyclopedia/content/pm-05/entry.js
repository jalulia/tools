/* PM-05 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:115-130
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-05',
  index: 'PM-05',
  title: `Film-grain overlay plane above the type layer`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:115-130`,
    author: 'Julia Compton',
    note: `The idea is the point: grain must sit above BOTH layers or the type reads as pasted on. Genuine art-direction lesson.`
  },
  thumb: 'thumb.png',
  text: `<p>A separate absolutely-positioned canvas of random pixels at z-index 8 so the generated field AND the HTML type age together under one grain.</p>
    <p><b>Note.</b> The idea is the point: grain must sit above BOTH layers or the type reads as pasted on. Genuine art-direction lesson.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:115-130</code> · Canvas2D · no BoS equivalent (compositing)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
