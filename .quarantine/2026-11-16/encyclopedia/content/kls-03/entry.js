/* KLS-03 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/Ki-Landscapes/index.html:195-228 (cellRnd 185-188, formAt 189-193)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'kls-03',
  index: 'KLS-03',
  title: `Ridge generation: Gaussian landform candidates on a hashed cell lattice with depth parallax`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/Ki-Landscapes/index.html:195-228 (cellRnd 185-188, formAt 189-193)`,
    author: 'Julia Compton',
    note: `The hashed cell lattice means landforms are stable under scroll and reproducible from the seed without keeping any list - the 1-D analogue of the cellular-noise chapter. The smoothstep birth gate is the craft detail that makes an infinite panorama not flicker.`
  },
  thumb: 'thumb.png',
  text: `<p>fBm base at a per-layer wavelength, plus discrete peak/valley candidates placed one per lattice cell; each candidate's existence is gated by margin = |m|*0.7 - rand, ramped through smoothstep(0,0.16,margin) so features fade in rather than pop, and added as f.h*exp(-dx*dx*0.5). Front bands scroll 8x faster than back ones.</p>
    <p><b>Note.</b> The hashed cell lattice means landforms are stable under scroll and reproducible from the seed without keeping any list - the 1-D analogue of the cellular-noise chapter. The smoothstep birth gate is the craft detail that makes an infinite panorama not flicker.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/Ki-Landscapes/index.html:195-228 (cellRnd 185-188, formAt 189-193)</code> · Canvas2D · 11 (noise) + 13 (fBm)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
