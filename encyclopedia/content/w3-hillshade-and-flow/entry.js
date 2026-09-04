/* W3 — one field, two jobs. Canvas2D.

   Adapted from MM-04 and MM-05, corpus/artifacts/modemode-about-the-field.html
   :148-162 (RELIEF — smooth tonal hillshade) and :173-186 (FLOW — strokes
   stream along the iso-lines). Two functions of fourteen lines each, over the
   same six-source influence field, doing two genuinely different jobs: one
   shades, one points. research/05 §4 calls it the best small demonstration of
   distinct jobs in the corpus and that assessment holds up — the whole
   argument fits on one screen.

   The fourth example is not in the source. It is the counter-example this page
   needs: the same field, treated twice in ways that do the same job. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  instance_of: ["hillshade-and-flow", "fbm-noise-driver"],
  uses: ["fbm-noise"],
  governed_by: ["composing-computational-material-systems"],
  id: 'w3-hillshade-and-flow',
  index: 'W3',
  order: 420,
  title: 'One field, two jobs',
  section: 'worked-examples',
  status: 'canonical',
  lane: 'canvas2d',
  tags: ['shared cause', 'distinct jobs', 'gradient', 'canvas2d'],
  source: {
    kind: 'adapted',
    title: 'MM-04 + MM-05 — modemode-about-the-field.html:148–162, 173–186',
    author: 'Julia Compton',
    date: '2026',
    note: 'Ported to this stage and made static; the source animates the six sources and breathes their strengths. The field, the finite-difference gradient and both renderers are the original’s.'
  },
  thumb: 'thumb.png',

  text: `
    <p>Six sources sit on a plane. Each contributes a soft falloff around its
    own position, and the sum of them is a scalar field: one number everywhere,
    with hills where sources agree and saddles between them. Nothing about that
    field is a picture yet. It is the thing two pictures are about to be made
    from.</p>

    <p>The first reads it as <strong>height</strong>. Take the gradient — the
    difference between the field a little to the left and a little to the
    right, and the same vertically — dot it with a light direction, and darken
    or lighten each cell accordingly. That is a hillshade, and it is fourteen
    lines. The second reads it as <strong>direction</strong>. Take the same
    gradient, turn it ninety degrees, and draw a short stroke along the result:
    now every mark lies along a contour, so the marks wrap the hills instead of
    climbing them. That is also fourteen lines, and it shares eleven of them.</p>

    <div class="note"><span class="lab">Same derivative, two readings</span>
      <p>The gradient is a vector. It has a length, which is <em>how steeply</em>
      the field is changing, and a direction, which is <em>which way</em>. The
      hillshade uses the length against a light; the flow uses the direction
      against nothing at all. Neither could be substituted for the other, and
      that is what makes them two jobs rather than one job done twice.</p></div>

    <h2>What the composite is for</h2>

    <p>The third example is both at once, and it is the one worth looking at
    longest. The shading carries tone — where the ground is high, where the
    light is coming from, which regions are separate. The strokes carry
    structure — the shape of the level sets, and the fact that they are level
    sets at all. Cover either one with your hand and something specific goes:
    without the shading there is no depth and the strokes read as decoration;
    without the strokes there is no articulation and the shading reads as a
    blurred photograph.</p>

    <p>They also do not fight, and the reason is not taste. They are separated
    by frequency: the shading is smooth and low, the strokes are thin and high,
    so they occupy different parts of the image's spectrum and the eye can
    attend to either without losing the other. Two operators at the same
    frequency compete no matter how carefully they are tuned.</p>

    <h2>The counter-example</h2>

    <p>The fourth is the same field, treated twice with the same job. The
    hillshade shades; then a second pass darkens by the field value again, from
    a different constant, on the argument that it adds depth. It does not add
    depth — it adds contrast to the shading that was already there. Both passes
    are functions of the same cause, which is meant to be the thing this
    framework wants; sharing a cause is necessary and it is not sufficient.
    The test that catches this one is <em>distinct jobs</em>, and it is the test
    people skip because a shared driver feels like it should be enough.</p>`,

  params: [
    { name: 'sources', min: 2, max: 6, step: 1, value: 6,
      note: 'how many sources sum into the field' },
    { name: 'light', min: 0, max: 6.28, step: 0.01, value: 2.2,
      note: 'the light direction, in radians. Only the hillshade reads it — the flow does not have a light.' },
    { name: 'density', min: 0.6, max: 2, step: 0.05, value: 1,
      note: 'stroke and cell density. Coarser is a different drawing, not a lower-quality one.' }
  ],

  examples: [
    { id: 'both', title: 'Both, from one field', lane: 'canvas2d', file: 'main.js', code:
`/* One field. Two readings of its gradient. Nothing else.

   Read \`field\` and \`grad\` first — everything below them is a consumer, and
   neither consumer knows the other exists. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const LIGHT   = p.light   == null ? 2.2 : p.light;
const DENSITY = p.density == null ? 1   : p.density;

const AR  = W / H;
const INK = '22,22,15';
const PAPER = '#efece2';

/* ------------------------------------------------------------------ field
   Six soft sources on a plane. Positions are in (u in 0..AR, v in 0..1) so the
   falloff is round rather than stretched by the viewport. */
const rnd = lib.mulberry32(11);
const src = [];
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2 + 0.4;
  src.push({
    ox: AR * 0.5 + Math.cos(a) * AR * 0.31,
    oy: 0.5 + Math.sin(a) * 0.29,
    str: 0.85 + 0.4 * rnd()
  });
}
function field(u, v) {
  let s = 0;
  for (let k = 0; k < N; k++) {
    const dx = u - src[k].ox, dy = v - src[k].oy;
    s += src[k].str * Math.exp(-(dx * dx + dy * dy) / 0.038);
  }
  return s;
}
const at = (x, y) => field(x / H, y / H);        // pixels -> field units

/* --------------------------------------------------------------- gradient
   One finite difference, used twice below and computed once here. Its LENGTH
   is how steeply the field changes; its DIRECTION is which way. The two
   renderers take one each. */
function grad(x, y, h) {
  return [at(x + h, y) - at(x - h, y), at(x, y + h) - at(x, y - h)];
}

ctx.fillStyle = PAPER;
ctx.fillRect(0, 0, W, H);

/* ------------------------------------------- JOB 1: shade — read as height */
const step = Math.max(3, Math.round(Math.min(W, H) / (170 * DENSITY)));
const lx = Math.cos(LIGHT), ly = Math.sin(LIGHT);
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const g = grad(x, y, step);
    const sh = -g[0] * lx - g[1] * ly;            // the light, against the slope
    let a = lib.clamp(v / 1.9, 0, 1) * 0.26 + lib.clamp(sh * 1.5, -0.15, 0.15);
    a = lib.clamp(a, 0, 0.38);
    if (a < 0.01) continue;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}

/* --------------------------------------- JOB 2: point — read as direction */
const gap = Math.max(11, Math.round(Math.min(W, H) / (42 * DENSITY)));
ctx.lineCap = 'round';
for (let y = gap * 0.5; y < H; y += gap) {
  for (let x = gap * 0.5; x < W; x += gap) {
    const v = at(x, y);
    if (v < 0.05) continue;
    const g = grad(x, y, 3);
    const gl = Math.hypot(g[0], g[1]) || 1e-4;
    // ninety degrees off the gradient IS the contour direction. No contour was
    // extracted, traced or stored: every stroke works it out locally.
    const ux = -g[1] / gl, uy = g[0] / gl;
    const a = lib.clamp(v * 0.42, 0, 0.5);
    const len = gap * 0.82 * Math.min(1, 0.35 + v);
    ctx.strokeStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.lineWidth = 0.8 + v * 1.1;
    ctx.beginPath();
    ctx.moveTo(x - ux * len * 0.5, y - uy * len * 0.5);
    ctx.lineTo(x + ux * len * 0.5, y + uy * len * 0.5);
    ctx.stroke();
  }
}
` },

    { id: 'relief', title: 'Shade only', lane: 'canvas2d', file: 'relief.js', code:
`/* MM-04. The gradient's LENGTH, against a light direction.
   Fourteen lines of consumer over the field below. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const LIGHT   = p.light   == null ? 2.2 : p.light;
const DENSITY = p.density == null ? 1   : p.density;

const AR = W / H, INK = '22,22,15';
const rnd = lib.mulberry32(11);
const src = [];
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2 + 0.4;
  src.push({ ox: AR * 0.5 + Math.cos(a) * AR * 0.31,
             oy: 0.5 + Math.sin(a) * 0.29, str: 0.85 + 0.4 * rnd() });
}
function field(u, v) {
  let s = 0;
  for (let k = 0; k < N; k++) {
    const dx = u - src[k].ox, dy = v - src[k].oy;
    s += src[k].str * Math.exp(-(dx * dx + dy * dy) / 0.038);
  }
  return s;
}
const at = (x, y) => field(x / H, y / H);

ctx.fillStyle = '#efece2';
ctx.fillRect(0, 0, W, H);

const step = Math.max(3, Math.round(Math.min(W, H) / (170 * DENSITY)));
const lx = Math.cos(LIGHT), ly = Math.sin(LIGHT);
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const gx = at(x + step, y) - at(x - step, y);
    const gy = at(x, y + step) - at(x, y - step);
    const sh = -gx * lx - gy * ly;
    let a = lib.clamp(v / 1.9, 0, 1) * 0.26 + lib.clamp(sh * 1.5, -0.15, 0.15);
    a = lib.clamp(a, 0, 0.38);
    if (a < 0.01) continue;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}

// Tone, and nothing else. There is no edge anywhere in this picture: the field
// is smooth, so its shading is smooth, and where two hills meet you get a
// gentle saddle rather than a boundary. That absence is the job the strokes do.
` },

    { id: 'flow', title: 'Point only', lane: 'canvas2d', file: 'flow.js', code:
`/* MM-05. The gradient's DIRECTION, turned ninety degrees.
   The same field, the same derivative, an unrelated reading of it. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const DENSITY = p.density == null ? 1 : p.density;

const AR = W / H, INK = '22,22,15';
const rnd = lib.mulberry32(11);
const src = [];
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2 + 0.4;
  src.push({ ox: AR * 0.5 + Math.cos(a) * AR * 0.31,
             oy: 0.5 + Math.sin(a) * 0.29, str: 0.85 + 0.4 * rnd() });
}
function field(u, v) {
  let s = 0;
  for (let k = 0; k < N; k++) {
    const dx = u - src[k].ox, dy = v - src[k].oy;
    s += src[k].str * Math.exp(-(dx * dx + dy * dy) / 0.038);
  }
  return s;
}
const at = (x, y) => field(x / H, y / H);

ctx.fillStyle = '#efece2';
ctx.fillRect(0, 0, W, H);

const gap = Math.max(11, Math.round(Math.min(W, H) / (42 * DENSITY)));
ctx.lineCap = 'round';
for (let y = gap * 0.5; y < H; y += gap) {
  for (let x = gap * 0.5; x < W; x += gap) {
    const v = at(x, y);
    if (v < 0.05) continue;
    const gx = at(x + 3, y) - at(x - 3, y);
    const gy = at(x, y + 3) - at(x, y - 3);
    const gl = Math.hypot(gx, gy) || 1e-4;
    const ux = -gy / gl, uy = gx / gl;
    const a = lib.clamp(v * 0.42, 0, 0.5);
    const len = gap * 0.82 * Math.min(1, 0.35 + v);
    ctx.strokeStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.lineWidth = 0.8 + v * 1.1;
    ctx.beginPath();
    ctx.moveTo(x - ux * len * 0.5, y - uy * len * 0.5);
    ctx.lineTo(x + ux * len * 0.5, y + uy * len * 0.5);
    ctx.stroke();
  }
}

// Structure, and nothing else. Every level set is legible and there is no
// indication anywhere of which side of a ridge is lit, or which hill is taller.
// That absence is the job the shading does.
` },

    { id: 'one-job-twice', title: 'The counter-example', lane: 'canvas2d', file: 'twice.js',
      code:
`/* NOT FROM THE SOURCE. This is the failure the page needs in order to make its
   claim falsifiable.

   Both passes below are driven by the same field. Both are therefore "coupled",
   in the sense that people usually mean when they say a piece is coupled — and
   the picture is still worse than the hillshade on its own, because the two
   passes do the SAME JOB. The second darkens by the field value; the first
   already darkens by the field value with a slope term on top. Adding them
   deepens the contrast of the shading and contributes no information that was
   not already in it.

   Shared cause is necessary. It is not sufficient. The test that catches this
   is DISTINCT JOBS, and it is the one people skip precisely because the shared
   driver feels like it should have settled the question. */

const N       = Math.max(2, Math.round(p.sources == null ? 6 : p.sources));
const LIGHT   = p.light   == null ? 2.2 : p.light;
const DENSITY = p.density == null ? 1 : p.density;

const AR = W / H, INK = '22,22,15';
const rnd = lib.mulberry32(11);
const src = [];
for (let k = 0; k < 6; k++) {
  const a = (k / 6) * Math.PI * 2 + 0.4;
  src.push({ ox: AR * 0.5 + Math.cos(a) * AR * 0.31,
             oy: 0.5 + Math.sin(a) * 0.29, str: 0.85 + 0.4 * rnd() });
}
function field(u, v) {
  let s = 0;
  for (let k = 0; k < N; k++) {
    const dx = u - src[k].ox, dy = v - src[k].oy;
    s += src[k].str * Math.exp(-(dx * dx + dy * dy) / 0.038);
  }
  return s;
}
const at = (x, y) => field(x / H, y / H);

ctx.fillStyle = '#efece2';
ctx.fillRect(0, 0, W, H);

const step = Math.max(3, Math.round(Math.min(W, H) / (170 * DENSITY)));
const lx = Math.cos(LIGHT), ly = Math.sin(LIGHT);

// pass 1 — hillshade, as before
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const gx = at(x + step, y) - at(x - step, y);
    const gy = at(x, y + step) - at(x, y - step);
    const sh = -gx * lx - gy * ly;
    let a = lib.clamp(v / 1.9, 0, 1) * 0.26 + lib.clamp(sh * 1.5, -0.15, 0.15);
    a = lib.clamp(a, 0, 0.38);
    if (a < 0.01) continue;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}

// pass 2 — "for depth". Same cause, same job, different constant.
for (let y = 0; y < H + step; y += step) {
  for (let x = 0; x < W + step; x += step) {
    const v = at(x, y);
    if (v < 0.06) continue;
    const a = lib.clamp(v / 1.4, 0, 1) * 0.20;
    ctx.fillStyle = 'rgba(' + INK + ',' + a.toFixed(3) + ')';
    ctx.fillRect(x - step * 0.5, y - step * 0.5, step + 1.2, step + 1.2);
  }
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Move <code>light</code> through a full turn on <em>Both</em>. The shading rotates and the strokes do not move at all — they have no light, because a direction is not lit. Two operators that respond to different controls are usually two jobs; two that move together usually are not.' },
    { rung: 'tune', text: 'Take <code>sources</code> from 6 down to 2. Both readings change at once and stay in agreement, because there is only one field. Nothing has to be re-tuned, which is the practical payoff of a shared cause and the reason it is worth the discipline.' },
    { rung: 'substitute', text: 'In the flow renderer, delete the ninety-degree turn — use <code>[gx, gy]</code> instead of <code>[-gy, gx]</code>. The strokes now point straight up the hills, and the picture becomes a diagram of the gradient rather than a drawing of the terrain. Same data, one sign, completely different claim.' },
    { rung: 'generalise', text: 'Write <code>function readings(x, y)</code> returning the value and the gradient once, and have every renderer take that. The field is currently evaluated five times per shaded cell and four per stroke; caching it is an obvious win, and the reason to do it is not speed — it is that a single point of evaluation is the only way to be sure the two readings are of the same thing.' },
    { rung: 'compose', text: 'Add a third reading that is genuinely a third job — a mark whose <em>size</em> or <em>count</em> follows the field, rather than its tone or its direction. Then run the removal test on all three. If your third one can be described with either of the first two sentences, it is the counter-example wearing new clothes.' }
  ],

  critique: {
    reads_as: 'A surveyed terrain: a lit ground with the shape of its contours drawn on it — one place, described two ways, not two pictures on top of each other.',
    coupling: 'One field and one finite difference. The hillshade takes the gradient’s length against a light vector; the flow takes its direction, turned ninety degrees, and reads nothing else. Both take the field value for weight, so a region that is not there is not drawn by either. Neither renderer knows the other exists, and neither has a parameter that has to be tuned against the other.',
    pass_order: 'Shade, then strokes. The shading is a tonal ground and the strokes are marks on it; reversed, the fills cover the strokes and the picture loses its articulation entirely. That is a weaker kind of order dependence than W1’s — this is figure over ground rather than a chain — and saying so is more useful than claiming otherwise. What is not weak is the frequency separation: low and smooth under thin and high, which is why they can occupy the same square inch without competing.',
    operators: ['six-source scalar field', 'finite-difference gradient', 'hillshade (length × light)', 'flow strokes (direction)'],
    why_it_survives: 'Remove the shading and the strokes read as pattern — there is no indication which hill is taller or where the light is, so the drawing stops being of a place. Remove the strokes and the shading reads as a blurred photograph — no level set is legible and the saddles between sources disappear. Each answer names something the other cannot supply, which is the definition of distinct jobs and the reason the fourth example is here to fail the same test.',
    faults: [
      'The field is evaluated five times per shaded cell and four times per stroke, with no caching. At the coarsest density that is around two hundred thousand exponentials; it paints once, so it is affordable and it is not defensible as written.',
      'The static port loses the source’s best property. There the six sources drift and breathe, so the saddles open and close and you can watch two hills fuse — which is the thing a field does that a picture of a field cannot.',
      'The hillshade is drawn as overlapping opaque cells rather than as a continuous surface, so at low density the squares are visible as squares. The original has the same fault and calls it "nested fills, no grid", which is a description rather than a defence.',
      'Both renderers are one ink at varying alpha. That is a real constraint honestly kept, and it is also why nothing here can distinguish a lit slope from a low one except by tone.'
    ]
  },

  related: [
    { entry: '21-domain-warping', relation: 'variant-of', label: '21 Domain warping' },
    { entry: '11-noise', relation: 'technique-of', label: '11 Noise' }
  ],

  links: [
    { label: 'Quilez — deriving normals from a field',
      url: 'https://iquilezles.org/articles/normalsSDF/' }
  ]
});
