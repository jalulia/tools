/* CMP-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/components/index.html:6019-6106 (scene), 6107-6127 (xerox), 5997-6018 (halftone)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'cmp-01',
  index: 'CMP-01',
  title: `ANYDAY xerox pipeline: scene → photocopy → dot screen`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/components/index.html:6019-6106 (scene), 6107-6127 (xerox), 5997-6018 (halftone)`,
    author: 'Julia Compton',
    note: `Order-dependent by construction. The xerox and halftone stages lift out cleanly at ~45 lines total.`
  },
  thumb: 'thumb.png',
  text: `<p>Three ordered stages — build a structured greyscale scene; degrade it as a photocopy (edge burn, roller streaks, toner starve); then screen it at 20 degrees.</p>
    <p><b>Note.</b> Order-dependent by construction. The xerox and halftone stages lift out cleanly at ~45 lines total.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/components/index.html:6019-6106 (scene), 6107-6127 (xerox), 5997-6018 (halftone)</code> · Canvas2D · 15/16/17
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
