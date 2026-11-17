/* Two poles, never one — the magnetic monopole, drawn as the forbidden object.
   ck-drop · excluded-terms series (X2). Sibling of X1 (three-rays-not-two).

   Plain names in the title / copy / stage. The word "monopole" is kept only in
   tags[] and source[] (the term needed to cite the physics). */
Shell.registerEntry({
  entity: "exploration",
  governed_by: ["material-systems-direction", "algorithmic-art", "headless-render"],
  id: "two-poles-never-one",
  index: "X2",
  order: 262,
  title: "Two poles, never one",
  section: "excluded-terms",       /* excluded-terms section */
  status: "exploration",           /* genuinely forbidden; shown because it can't exist */
  lane: "fragment",
  tags: ["magnetism", "monopole", "field lines", "gauss law", "canvas2d"],
  source: {
    kind: "original",
    note: "Magnetic field lines from point sources, integrated in the plane. The forbidden object is a magnetic monopole: a source with ∇·B ≠ 0. Standard result — a monopole would quantize electric charge (Dirac, 1931); none has been observed."
  },
  frame: { designWidth: 1100, aspect: "1100/1200", previewHeight: 1200 },
  thumb: "thumb.png",

  text: `
    <p>A magnet has two poles, and you cannot separate them. The field lines leave
    the north pole and curve back into the south — every line closes on itself.
    That is the whole content of ∇·B = 0: magnetism has no isolated sources.</p>

    <p>Switch the stage to <strong>Cut it</strong> and that becomes tactile. Cutting a
    magnet does not hand you a north in one piece and a south in the other; it gives
    you two whole magnets, each with its own pair. Cut those and you get four. The
    single pole never appears, no matter how far you go.</p>

    <h2>The forbidden object</h2>
    <p>Switch to <strong>Lone pole</strong> and the rule is broken by hand: a single
    north with no south. The lines pour out and never come back — a source with
    nothing to sink into, ∇·B ≠ 0. This is the excluded term for magnetism. Unlike
    the third optic ray of the sibling entry, it is <em>not</em> quietly allowed
    somewhere: no magnetic monopole has ever been found, and one would force every
    electric charge in the universe to come in whole multiples of a fixed unit
    (Dirac). It is drawn here precisely because it cannot be built.</p>

    <div class="note"><span class="lab">Same engine, one operator</span>
      <p>The three excluded-terms entries share a point-source field engine. The
      difference is the combination rule: this field, like gravity, <em>adds</em> —
      superposition — where the optics entry <em>multiplies</em>. Add sources and
      you always get closed loops; the only way to an open line is to remove a pole
      that physics will not let you remove.</p></div>

    <p style="opacity:.7">Series: X1 <em>Three rays, not two</em> (allowed) · X2 this entry
    (forbidden) · X3 <em>One sign, never two</em> (speculative).</p>
  `
});
