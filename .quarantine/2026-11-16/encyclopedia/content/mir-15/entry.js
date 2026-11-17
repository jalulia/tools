/* MIR-15 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/mir-gallery/artifacts/harmonic-field.html:565-572
   The researcher's grade (C) and editorial_status
   (known_failure) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'mir-15',
  index: 'MIR-15',
  title: `Full-frame film-noise ShaderPass (fract(sin(dot)) hash added after tone mapping)`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'C · known_failure',
  lane: 'glsl',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/mir-gallery/artifacts/harmonic-field.html:565-572`,
    author: 'Julia Compton',
    note: `The exact hash the Book of Shaders teaches in ch 10, used as a pinned film: uncoupled to depth, scene, motion or camera; boils per frame because uTime is the only argument; survives the removal test in the wrong direction (take it out and nothing about the image changes except mood). Pair it with MIR-11 and KLS-02 and the dithering chapter writes itself.`
  },
  thumb: 'thumb.png',
  text: `<p>rand(vUv+uTime) is added to rgb at uIntensity 0.08 across the whole frame, as the last pass after RenderPass -> UnrealBloomPass and after ReinhardToneMapping.</p>
    <p><b>Note.</b> The exact hash the Book of Shaders teaches in ch 10, used as a pinned film: uncoupled to depth, scene, motion or camera; boils per frame because uTime is the only argument; survives the removal test in the wrong direction (take it out and nothing about the image changes except mood). Pair it with MIR-11 and KLS-02 and the dithering chapter writes itself.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/mir-gallery/artifacts/harmonic-field.html:565-572</code> · GLSL (fragment, EffectComposer pass) · 10 (random) - as the chapter's counter-example
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
