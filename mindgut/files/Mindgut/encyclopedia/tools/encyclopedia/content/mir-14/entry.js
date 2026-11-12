/* MIR-14 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/harmonic-field.html:583-604
   The researcher's grade (A-) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-14',
  index: 'MIR-14',
  title: `Pin-halo point shader with world-position phase offset`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · canonical',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/harmonic-field.html:583-604`,
    author: 'Julia Compton',
    note: `The position-keyed phase is the whole idea and it is one term. Smallest good demonstration in the addendum of 'derive variation from the data you already have instead of adding a random'.`
  },
  thumb: 'thumb.png',
  text: `<p>vAlpha = 0.5+0.3*sin(uTime*2.0+position.x*0.1) - the pulse phase is keyed to world X so a constellation shimmers out of phase rather than blinking in unison; fragment is an annulus (smoothstep(0.48,0.42,d)-smoothstep(0.38,0.32,d)) plus exp(-d*4.0)*0.15 glow.</p>
    <p><b>Note.</b> The position-keyed phase is the whole idea and it is one term. Smallest good demonstration in the addendum of 'derive variation from the data you already have instead of adding a random'.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/harmonic-field.html:583-604</code> · GLSL (vertex + fragment) · 05 (shaping functions) + 07 (shapes)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
