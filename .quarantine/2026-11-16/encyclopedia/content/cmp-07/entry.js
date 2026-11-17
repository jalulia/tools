/* CMP-07 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/components/index.html:7253-7303
   The researcher's grade (B) and editorial_status
   (promising_exploration) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'cmp-07',
  index: 'CMP-07',
  title: `Case-study atmospheric field (radial + cast shading)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B · promising_exploration',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/components/index.html:7253-7303`,
    author: 'Julia Compton',
    note: `Reads well but the light has no single source of truth; several gradients are hand-placed. Fix the coupling before promoting.`
  },
  thumb: 'thumb.png',
  text: `<p>Layered radial gradients with an explicit light direction and contact shadows to give flat cards a sense of a lit interior.</p>
    <p><b>Note.</b> Reads well but the light has no single source of truth; several gradients are hand-placed. Fix the coupling before promoting.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/components/index.html:7253-7303</code> · Canvas2D · 6 (colors) + lighting
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
