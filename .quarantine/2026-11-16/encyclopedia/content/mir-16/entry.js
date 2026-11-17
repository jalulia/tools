/* MIR-16 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/harmonic-field.html:817-828 (bright), 838-848 (dim wireframe)
   The researcher's grade (A) and editorial_status
   (technical_reference) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-16',
  index: 'MIR-16',
  title: `onBeforeCompile chunk injection: per-instance colour + alpha on MeshStandardMaterial`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · technical_reference',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/harmonic-field.html:817-828 (bright), 838-848 (dim wireframe)`,
    author: 'Julia Compton',
    note: `The honest answer to 'how do I get my shader into a library's lighting model without forking it'. Worth teaching precisely because it is the lane decision SKILL.md section 5 asks for: extend the library material, do not rebuild it.`
  },
  thumb: 'thumb.png',
  text: `<p>Injects attribute vec3 instanceColor / attribute float instanceAlpha into the standard material by replacing #include <common>, <begin_vertex>, <color_fragment> and <dithering_fragment>, so 926 instanced star meshes keep full PBR lighting while carrying per-star blackbody colour and magnitude-derived opacity.</p>
    <p><b>Note.</b> The honest answer to 'how do I get my shader into a library's lighting model without forking it'. Worth teaching precisely because it is the lane decision SKILL.md section 5 asks for: extend the library material, do not rebuild it.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/harmonic-field.html:817-828 (bright), 838-848 (dim wireframe)</code> · GLSL (three.js shader-chunk string replacement) · no BoS equivalent - implementation-lane appendix
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
