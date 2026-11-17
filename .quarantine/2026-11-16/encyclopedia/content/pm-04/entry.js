/* PM-04 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:138-146
   The researcher's grade (B) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-04',
  index: 'PM-04',
  title: `Per-pixel monochrome grain`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B · technical_reference',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:138-146`,
    author: 'Julia Compton',
    note: `Honest as a print-reproduction step. Would fail Julia's critique if presented as 'texture' — it must be framed as the last stage of a reproduction chain, never as a look.`
  },
  thumb: 'thumb.png',
  text: `<p>getImageData → add uniform noise to RGB → putImageData.</p>
    <p><b>Note.</b> Honest as a print-reproduction step. Would fail Julia's critique if presented as 'texture' — it must be framed as the last stage of a reproduction chain, never as a look.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:138-146</code> · Canvas2D · 18 (filters); 18/grain.frag exists but unwritten
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
