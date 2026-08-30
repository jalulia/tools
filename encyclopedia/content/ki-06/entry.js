/* KI-06 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/tools-repo/ki-landscapes/index.html:614-641
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'ki-06',
  index: 'KI-06',
  title: `Live parameter panel bound to the running module`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/tools-repo/ki-landscapes/index.html:614-641`,
    author: 'Julia Compton',
    note: `The affordance the Book of Shaders playground lacks entirely. The new Function(...) + shared LIB harness is the 'drop in an example' contract, already working.`
  },
  thumb: 'thumb.png',
  text: `<p>Each module declares params [{key,min,max,step}]; sliders write into P; edits re-run the module through new Function(ctx, W, H, p, lib, code).</p>
    <p><b>Note.</b> The affordance the Book of Shaders playground lacks entirely. The new Function(...) + shared LIB harness is the 'drop in an example' contract, already working.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/tools-repo/ki-landscapes/index.html:614-641</code> · JS (architecture) · architecture
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
