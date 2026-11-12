/* MIR-20 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/mir-818-strand.html:270-305 (zone -> tube radius, drift), 340-372 (six connection rules), 440-478 (size), 517-535 (drift -> ring radius and opacity)
   The researcher's grade (A-) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-20',
  index: 'MIR-20',
  title: `One dataset, many reads: 818 strands -> geometry, size, colour, rings and six typed edge rules`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/mir-818-strand.html:270-305 (zone -> tube radius, drift), 340-372 (six connection rules), 440-478 (size), 517-535 (drift -> ring radius and opacity)`,
    author: 'Julia Compton',
    note: `Genuine compound causality from real data rather than from noise, and the geometry itself carries meaning (the throat narrows where the data says it narrows). Marked down only because most reads are encodings rather than material: nothing in the render changes what a surface IS, only what it means. Verified in shots-addendum/mir-818-strand.png.`
  },
  thumb: 'thumb.png',
  text: `<p>Each strand carries zone, drift, coset, anchor weight and flags. Zone sets the torus minor radius (nullcode band constricted to 0.55x, post-zone 1.08x); anchor weight, ghost and terminal flags set point size; |drift| above 0.14 mints a ring whose radius AND opacity are both the normalised drift; six independent rules (anchor spokes, ghost absorption, terminal cascade, drift echoes by nearest drift value, Z3 coset siblings, nullcode chain) generate typed, differently coloured edges.</p>
    <p><b>Note.</b> Genuine compound causality from real data rather than from noise, and the geometry itself carries meaning (the throat narrows where the data says it narrows). Marked down only because most reads are encodings rather than material: nothing in the render changes what a surface IS, only what it means. Verified in shots-addendum/mir-818-strand.png.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/mir-818-strand.html:270-305 (zone -> tube radius, drift), 340-372 (six connection rules), 440-478 (size), 517-535 (drift -> ring radius and opacity)</code> · JS + three.js · 12 (cellular / partition) adjacent
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
