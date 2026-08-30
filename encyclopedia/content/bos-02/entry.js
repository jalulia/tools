/* BOS-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/book-of-shaders/index.html:609-617
   The researcher's grade (B) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'bos-02',
  index: 'BOS-02',
  title: `fBm (playground implementation)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B · technical_reference',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/book-of-shaders/index.html:609-617`,
    author: 'Julia Compton',
    note: `Hard-codes lacunarity 2.0 and gain 0.5 and never names them; the chapter text then points forward to a domain-warping chapter that does not exist. Must be rewritten.`
  },
  thumb: 'thumb.png',
  text: `<p>Five octaves at fixed doubling frequency and halving amplitude.</p>
    <p><b>Note.</b> Hard-codes lacunarity 2.0 and gain 0.5 and never names them; the chapter text then points forward to a domain-warping chapter that does not exist. Must be rewritten.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/book-of-shaders/index.html:609-617</code> · GLSL · 13
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
