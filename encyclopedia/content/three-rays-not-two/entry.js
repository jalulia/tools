/* Three rays, not two — a real trirefringent dispersion surface.
   ck-drop · excluded-terms series (X-index). Injected as a classic <script src>
   by the shell when this entry is routed to; the block below is the entry body.

   The word "trirefringence" is kept ONLY in tags[] and source[] (it is the
   literature term used to cite the paper). Julia's call: it stays out of the
   title, the reading copy and the on-stage readout — those say "three rays".

   Numbers were confirmed BEFORE the plot was written. With μ=1, ε⊥=1.4872,
   ε∥=−5.4166, σ=−0.4894 the branch set at θ=π/16 reproduces the paper to four
   decimals: {v_o, v_e+, v_e−} = {0.8200, 0.7600, 0.2000}; the cone edge is
   tan²θ = ε⊥/|ε∥| → θ_max = 27.654°. See BRIEF.md for the re-run script. */
Shell.registerEntry({
  entity: "exploration",
  governed_by: ["material-systems-direction", "algorithmic-art", "dataviz", "headless-render"],
  id: "three-rays-not-two",
  index: "X1",
  order: 260,
  title: "Three rays, not two",
  section: "excluded-terms",      /* excluded-terms section */
  status: "canonical",
  lane: "fragment",
  tags: ["dispersion", "birefringence", "magnetoelectric", "trirefringence", "optics", "canvas2d"],
  source: {
    kind: "adapted",
    title: "Trirefringence in nonlinear magnetoelectric metamaterials revisited",
    url: "https://arxiv.org/abs/1901.07087",
    note: "Phys. Rev. A 99, 053841 (2019). Branch equations and the four validation values reproduced numerically to four decimals before building; the plot is written here. The vacuum / black-hole extension follows Drummond & Hathaway, QED vacuum polarization in a background gravitational field, Phys. Rev. D 22, 343 (1980)."
  },
  frame: { designWidth: 1100, aspect: "1100/1200", previewHeight: 1200 },
  thumb: "thumb.png",

  text: `
    <p>This plots how fast light travels through the material against the direction
    it is heading. Pick a direction — the ray you can steer — and there are up to
    three speeds, so up to three rays. The steel circle is the ordinary ray: 0.82,
    the same in every direction. The other two, the extraordinary rays, change with
    the angle.</p>

    <p>Most materials only send two of these forward. That is ordinary birefringence —
    the doubling you get in calcite or quartz. Three is unusual, and it takes two
    things being true at once.</p>

    <h2>Why there are three</h2>
    <p>First, the material has to be <strong>hyperbolic</strong>: its permittivity goes
    negative along one axis. Second, there is a <strong>magnetoelectric coupling</strong> —
    the σ slider — a field-dependent term that links the electric and magnetic response.
    Without σ, the two extraordinary speeds come out as a symmetric ± pair: one forward,
    one backward, so only two rays go forward. σ shifts that whole pair up by about 0.48
    and pushes both of them forward at once. That is the third ray. Slide σ back to zero
    on the stage and it retracts.</p>

    <div class="note"><span class="lab">The numbers, checked first</span>
      <p>With μ=1, ε⊥=1.4872, ε∥=−5.4166, σ=−0.4894, the three speeds at θ=11.25° come out
      {v<sub>o</sub>, v<sub>e+</sub>, v<sub>e−</sub>} = {0.8200, 0.7600, 0.2000} — the paper's
      values to four decimals. The edge of the cone is where tan²θ = ε⊥/|ε∥|, which works
      out to 27.654°.</p></div>

    <h2>The flip at 27.65°</h2>
    <p>The third ray only exists in a cone around the optic axis. Steer past 27.65° and its
    speed hits zero; beyond that it goes negative — the ray reverses and runs backward against
    the wave. The amber curve shows it: a bright loop inside the cone, then it threads through
    the center and comes out the other side. Nothing breaks at the boundary. The solution is
    still there, it just points the other way.</p>

    <h2>The same thing in vacuum</h2>
    <p>This is not only a lab material. In QED the vacuum itself acts like a field-dependent
    medium — strong-field corrections give it a permittivity and permeability that depend on
    the background E and B, and the <code>μ′</code> the whole thing started from is part of that
    response. One loop gives plain birefringence, two rays, because the response is built from
    only two field combinations (F and E·B). A third ray needs extra structure: a background
    where E and B are not perpendicular (so E·B ≠ 0), or spacetime curvature. A charged black
    hole's magnetosphere has both — an electric field from the charge, a magnetic field angled
    across it, and strong curvature near the horizon (the Drummond–Hathaway <code>R F F</code>
    coupling that ties photon paths to the Riemann tensor). Put those together and three
    separate light cones — three polarization-dependent paths for the same beam — are
    genuinely possible.</p>

    <p style="opacity:.7"><strong>Equations.</strong>
    v<sub>o</sub> = 1/√(με⊥);
    v<sub>e±</sub> = −σq̂<sub>z</sub> ± √(σ²q̂<sub>z</sub>² + (1/με∥)((ε∥/ε⊥)q̂<sub>x</sub>² + q̂<sub>z</sub>²)).
    Refs: [1] Phys. Rev. A 99, 053841 (2019), arXiv:1901.07087. [2] Drummond &amp; Hathaway,
    Phys. Rev. D 22, 343 (1980).</p>
  `
});
