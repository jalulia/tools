/* HOP-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/holy-ops-v2/index.html:5370-5392 (throttle 5385, write 5389); consumer CSS at 220
   The researcher's grade (A-) and editorial_status
   (promising_exploration) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'hop-01',
  index: 'HOP-01',
  title: `One audio energy scalar -> a CSS custom property -> two distinct reads, frame-throttled`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · promising_exploration',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/holy-ops-v2/index.html:5370-5392 (throttle 5385, write 5389); consumer CSS at 220`,
    author: 'Julia Compton',
    note: `One cause, two genuinely different jobs (tone and size), and the throttle comment names the real reason ('reduce main thread contention during audio scheduling'). The pattern generalises: publish the cause as a custom property, let CSS decide the reads. Near-identical code at reliquary/index.html:4974+.`
  },
  thumb: 'thumb.png',
  text: `<p>bass (bins 0-8) and mid (bins 8-32) are mixed 0.6/0.4 into one pulse value written to --zone-pulse on the active zones every 4th frame; CSS then derives BOTH filter:brightness(1+p*0.4) and transform:scale(1+p*0.02) from it.</p>
    <p><b>Note.</b> One cause, two genuinely different jobs (tone and size), and the throttle comment names the real reason ('reduce main thread contention during audio scheduling'). The pattern generalises: publish the cause as a custom property, let CSS decide the reads. Near-identical code at reliquary/index.html:4974+.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/holy-ops-v2/index.html:5370-5392 (throttle 5385, write 5389); consumer CSS at 220</code> · Canvas2D / CSS · adjacent - shared cause outside the canvas
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
