/* MIR-17 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/mir-818-complete.html:299-303
   The researcher's grade (F) and editorial_status
   (known_failure) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-17',
  index: 'MIR-17',
  title: `818-point strand shader - BROKEN at HEAD (vertexColors never declared)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'F · known_failure',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/mir-818-complete.html:299-303`,
    author: 'Julia Compton',
    note: `Verified by render over HTTP with the real JSON: the vertex shader reads 'vColor = color' but the ShaderMaterial sets only {transparent:true}, so USE_COLOR is undefined and three never injects 'attribute vec3 color'. All 818 points are invisible; only the connection lines draw (shots-addendum/mir-818-complete.png). The fix is one word - the sibling at mir-818-strand.html:511 has vertexColors:true. Best available example of the class of bug the playground should let people hit safely.`
  },
  thumb: 'thumb.png',
  text: `<p>Intends per-point colour, size, opacity and a ghost variant (inner discard + 0.6 alpha); the fragment's fwidth(d) antialiasing is the good part.</p>
    <p><b>Note.</b> Verified by render over HTTP with the real JSON: the vertex shader reads 'vColor = color' but the ShaderMaterial sets only {transparent:true}, so USE_COLOR is undefined and three never injects 'attribute vec3 color'. All 818 points are invisible; only the connection lines draw (shots-addendum/mir-818-complete.png). The fix is one word - the sibling at mir-818-strand.html:511 has vertexColors:true. Best available example of the class of bug the playground should let people hit safely.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/mir-818-complete.html:299-303</code> · GLSL (vertex + fragment) · no BoS equivalent - implementation-lane appendix
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
