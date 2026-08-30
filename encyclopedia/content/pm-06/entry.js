/* PM-06 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/printed-matter-studies_6.html:92-114
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'pm-06',
  index: 'PM-06',
  title: `Print-physics SVG ink filters (brush / stamp / marker)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted', 'svg'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/printed-matter-studies_6.html:92-114`,
    author: 'Julia Compton',
    note: `Three named tools from one parameterised generator (fine, freq, holes, holeFreq, seed) — a system, not three effects. The 'holes' composite is the non-obvious move.`
  },
  thumb: 'thumb.png',
  text: `<p>feTurbulence → feDisplacementMap for wobble, plus a second turbulence pushed through feColorMatrix alpha and composited 'out' to punch dry-brush holes.</p>
    <p><b>Note.</b> Three named tools from one parameterised generator (fine, freq, holes, holeFreq, seed) — a system, not three effects. The 'holes' composite is the non-obvious move.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/printed-matter-studies_6.html:92-114</code> · SVG filter · no BoS equivalent
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
