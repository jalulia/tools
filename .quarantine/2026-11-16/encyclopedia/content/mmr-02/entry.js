/* MMR-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/modemode-repo/assets/mm-menu.js:1-90
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mmr-02',
  index: 'MMR-02',
  title: `Anchored index menu (mm-menu)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/modemode-repo/assets/mm-menu.js:1-90`,
    author: 'Julia Compton',
    note: `Her house pattern for an index that scales without occupying layout. Directly reusable as the mobile navigation both tools are missing.`
  },
  
  text: `<p>A fixed bottom-left pill that expands into the full index; built-in roster renders instantly, then refreshes from the live store; Escape and click-outside close it.</p>
    <p><b>Note.</b> Her house pattern for an index that scales without occupying layout. Directly reusable as the mobile navigation both tools are missing.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/modemode-repo/assets/mm-menu.js:1-90</code> · JS (architecture) · architecture
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
