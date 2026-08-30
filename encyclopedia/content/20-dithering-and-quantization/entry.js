/* 20 Dithering and quantization — written for this tool. The book has no
   chapter on it: quantization appears nowhere and the word dither appears
   nowhere, which leaves the clearest available demonstration of pass-order
   dependence unmade (research/04 §5, priority 7).

   The three corpus assets behind it, all under forty lines:
     YOS-01  YoshiOS/Documents/YoshiOS/index.html:46-84
             a Bayer-8 matrix used as TIME — the threshold decides which pixels
             have flipped yet, so the wipe dissolves instead of sweeping.
     MIR-11  pussyphus_prototype/src/render/dither.js:52-78
             the ordered matrix as the rounding rule, with the strength and the
             level count both functions of depth. Its own chapter is W2.
     KLS-02  Ki-Landscapes/index.html:116-131
             why the perturbation is centred rather than added. Chapter 10.

   Everything here is written for this tool; the assets above are the argument's
   evidence, not its source code. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '20-dithering-and-quantization',
  index: '20',
  order: 200,
  title: 'Dithering and quantization',
  section: 'beyond',
  status: 'canonical',
  lane: 'glsl',
  tags: ['bayer', 'ordered dither', 'error diffusion', 'pass order'],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    author: 'Julia Compton',
    note: 'The book has no dithering chapter. This one is ours end to end.'
  },
  stage: { texture: true },
  thumb: 'thumb.png',

  text: `
    <p>Every picture leaves the shader as an integer. Eight bits a channel is
    generous enough that you can pretend otherwise for most of a career, but the
    moment a gradient is wide and shallow, or the moment the output is two inks
    on paper or four greys on a panel, the pretence ends and you have to decide
    what happens to the values that fall between the levels you are allowed.</p>

    <p><strong>Quantization</strong> is that decision made the obvious way:
    round each value to the nearest available level. It is correct, and it puts
    a visible edge everywhere the rounding flips, because the rounding flips
    along a contour of the image and contours are exactly what the eye is built
    to find. That is banding.</p>

    <p><strong>Dithering</strong> is the same decision made with a different
    rounding rule — one that varies from pixel to pixel. Instead of rounding at
    the halfway point everywhere, round at a threshold that comes from a small
    matrix tiled across the screen. Now a region that sits four-tenths of the
    way between two levels sends four pixels in ten to the upper level, in a
    fixed, even, non-clumping arrangement, and the average is right where the
    contour would have been. The eye integrates it and reads the tone the
    original had.</p>

    <div class="note"><span class="lab">The sentence to keep</span>
      <p>Dither is not noise added to a picture. It is the rounding rule, made
      spatial. Everything else in this chapter follows from that — including
      why it has to happen <em>before</em> the rounding and not after.</p></div>

    <h2>Order is the whole lesson</h2>

    <p>Take the last two stages above. Both contain the identical threshold
    matrix and the identical quantizer. In one the threshold replaces the
    halfway point inside <code>floor</code>; in the other the picture is
    quantized first and the matrix is added to the result. The first is
    dithering. The second is banding with speckle on it — every band edge is
    still exactly where it was, and now there is a texture sitting over the top
    of it that cannot move it, because the decision it was supposed to influence
    has already been taken.</p>

    <p>This is the cleanest example in the book of an operator whose meaning is
    its position. Neither version has more code. Neither has an extra pass. The
    difference is one line of arithmetic on one side of a <code>floor</code>.</p>

    <h2>The matrix, and why it is built the way it is</h2>

    <p>The Bayer matrix is self-similar: an 8×8 is a 4×4 with a 2×2 inside every
    cell, and a 4×4 is the same trick one level up. That is why the shaders
    here compute it rather than looking it up — three lines of recursion give
    any size, and the recursion is the thing worth understanding. Its property
    is that the thresholds are spread as evenly as possible, so the pixels that
    flip first are maximally far apart and the pattern never clumps. That
    evenness is also its cost: it is a <em>pattern</em>, and at low level counts
    you see it as a weave.</p>

    <p>Hashing the pixel gives you the opposite trade — no weave, because there
    is no structure, but clumps, because a hash has no memory of where it put
    the last one. Real blue noise is the third answer: a precomputed tile whose
    values are arranged so that nearby pixels have dissimilar thresholds without
    being periodic. It costs a texture, which is why it is not here.</p>

    <h2>Error diffusion, which a shader cannot do</h2>

    <p>There is a fourth answer, and it is the best-looking one. Instead of
    deciding each pixel against a threshold, quantize it, measure how much you
    got wrong, and hand that error to the neighbours that have not been decided
    yet. Floyd–Steinberg gives 7/16 of it to the pixel on the right, and 3/16,
    5/16 and 1/16 to the three below. Nothing tiles, nothing weaves, and the
    error never accumulates — it is paid off, locally, as you go.</p>

    <p>It also cannot be written as a fragment shader, and the reason is the
    first thing this book says. A fragment shader answers for one pixel with no
    knowledge of what any other pixel decided; error diffusion is a chain in
    which every pixel depends on the one before it. The fifth example is
    therefore in the other lane — Canvas2D, one pass over an
    <code>ImageData</code>, serial on purpose — and it is worth reading beside
    the shaders as an argument about implementation lanes rather than about
    dithering. Some ideas choose their machine.</p>`,

  /* --- the build-up ------------------------------------------------------ */
  stages: [
    { label: 'continuous tone', note: 'the ramp before anything is decided',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // A shallow ramp with a soft shape in it: the two things that band worst.
    float v = st.x * 0.9 + 0.05;
    v -= 0.18 * (1.0 - smoothstep(0.0, 0.55, distance(st, vec2(0.5, 0.55))));

    gl_FragColor = vec4(vec3(v), 1.0);
}` },

    { label: 'quantize', note: 'round to the nearest allowed level — and there is the banding',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_levels;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float v = st.x * 0.9 + 0.05;
    v -= 0.18 * (1.0 - smoothstep(0.0, 0.55, distance(st, vec2(0.5, 0.55))));

    // L levels means L-1 steps between them. Adding 0.5 before the floor is
    // what makes this round-to-nearest rather than round-down; that constant
    // 0.5 is the rounding RULE, and the next stage is what happens when it
    // stops being constant.
    float L = max(u_levels, 2.0) - 1.0;
    float q = floor(v * L + 0.5) / L;

    gl_FragColor = vec4(vec3(q), 1.0);
}` },

    { label: 'ordered dither', note: 'the matrix replaces the 0.5 — same operation, spatial rule',
      default: true,
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// The Bayer matrix, computed rather than tabulated. It is self-similar: each
// level is the level below, scaled into every cell of a 2x2 and added to it.
// bayer2 returns 0, 2, 3, 1 over four — the most even four thresholds there
// are — and everything larger is that arrangement of that arrangement.
float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float v = st.x * 0.9 + 0.05;
    v -= 0.18 * (1.0 - smoothstep(0.0, 0.55, distance(st, vec2(0.5, 0.55))));

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer4(gl_FragCoord.xy / max(u_pitch, 1.0));

    // The threshold replaces the 0.5. At u_dither = 0 it IS 0.5 and this is the
    // previous stage exactly; at 1 the rounding point is the matrix. Nothing is
    // added to the picture at any point.
    float q = floor(v * L + mix(0.5, th, clamp(u_dither, 0.0, 1.0))) / L;

    gl_FragColor = vec4(vec3(q), 1.0);
}` },

    { label: 'after, not before',
      note: 'the same two operators in the other order: banding with speckle on it',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

// THE COUNTER-EXAMPLE, and it is one line moved.
//
// Here the picture is quantized with a constant rounding rule first, and the
// matrix is added to the RESULT. Every band edge is still exactly where it was
// — the decision it was meant to influence has already been taken — so what
// the matrix contributes is a texture laid over banding. Nothing about the code
// is more expensive or less careful. It is simply in the wrong place, and this
// is what "order dependence" means when it is not an abstraction.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float v = st.x * 0.9 + 0.05;
    v -= 0.18 * (1.0 - smoothstep(0.0, 0.55, distance(st, vec2(0.5, 0.55))));

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer4(gl_FragCoord.xy / max(u_pitch, 1.0));

    float q = floor(v * L + 0.5) / L;
    q += (th - 0.5) * clamp(u_dither, 0.0, 1.0) / L;

    gl_FragColor = vec4(vec3(q), 1.0);
}` }
  ],

  /* --- named knobs ------------------------------------------------------- */
  params: [
    { name: 'levels', min: 2, max: 12, step: 1, value: 4,
      note: 'how many values a channel is allowed. Two is one bit.' },
    { name: 'dither', min: 0, max: 1, step: 0.01, value: 1,
      note: 'how far the rounding point moves from 0.5 toward the matrix. At 0 this is plain quantization.' },
    { name: 'pitch', min: 1, max: 6, step: 1, value: 2,
      note: 'device pixels per matrix cell — the size of the screen, in the printer’s sense' }
  ],

  /* --- the value, in one dimension --------------------------------------- */
  plots: [
    { title: 'Quantization is a staircase',
      expr: 'floor(x*(2.0 + floor(t)) + 0.5)/(2.0 + floor(t))',
      domain: [0, 1], range: [0, 1],
      note: 'Drag <code>t</code> to add levels. The straight line is the tone the picture had; the staircase is what it is allowed to be. Every riser is a band edge, and in two dimensions it lands along a contour.' },
    { title: 'The rounding point, made to vary',
      expr: 'floor(x*4.0 + fract(x*60.0))/4.0',
      domain: [0, 1], range: [0, 1],
      note: 'The same four levels, with a sawtooth standing in for the matrix — one dimension has no rows to disperse into, so this is the honest 1-D version. The staircase is gone; what replaces it is a scatter whose local average follows the line. Nothing was added to the signal: only the point at which it rounds.' }
  ],

  /* --- examples ---------------------------------------------------------- */
  examples: [
    { id: 'ordered', title: 'Ordered, 4×4', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// Ordered dither over a real image. The source on this stage is the scene the
// tool draws for itself — hard edges on purpose — or your own file, if you have
// pointed the Image control at one.

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer4(gl_FragCoord.xy / max(u_pitch, 1.0));
    float r  = mix(0.5, th, clamp(u_dither, 0.0, 1.0));

    // The three channels share one threshold, which is what keeps the result a
    // reproduction of a colour rather than three unrelated screens beating
    // against each other. Give each channel its own matrix offset and you have
    // invented a misregistration.
    gl_FragColor = vec4(floor(c * L + r) / L, 1.0);
}
` },

    { id: 'bayer-8', title: 'Ordered, 8×8', lane: 'glsl', file: 'bayer8.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// One more level of the same recursion: 64 thresholds instead of 16, so the
// tone steps are finer and the weave is coarser. Whether that is better is a
// judgement about viewing distance, not about quality — at arm's length the 8x8
// is smoother; at 2x zoom it is more obviously a pattern.
float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer8(gl_FragCoord.xy / max(u_pitch, 1.0));
    float r  = mix(0.5, th, clamp(u_dither, 0.0, 1.0));

    gl_FragColor = vec4(floor(c * L + r) / L, 1.0);
}
` },

    { id: 'hashed', title: 'Hashed threshold', lane: 'glsl', file: 'hashed.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// The other trade. A hash has no periodicity, so there is no weave anywhere —
// and no evenness either, so it clumps: two pixels that happen to draw similar
// thresholds sit next to each other and the tone goes lumpy. Compare a flat
// mid-grey region here against the 4x4 and the difference is not subtle.
//
// Real blue noise is the answer that has neither fault: a tile whose thresholds
// are arranged so that neighbours are dissimilar without the arrangement
// repeating. It costs a texture to ship, which is why this chapter does not
// have one, and it is exactly the sort of cost that should be a decision rather
// than a default.
float hash(vec2 p) {
    return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = hash(gl_FragCoord.xy / max(u_pitch, 1.0));
    float r  = mix(0.5, th, clamp(u_dither, 0.0, 1.0));

    gl_FragColor = vec4(floor(c * L + r) / L, 1.0);
}
` },

    { id: 'wipe', title: 'The matrix as time', lane: 'glsl', file: 'wipe.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_time;
uniform float u_pitch;

// A threshold matrix does not have to threshold a tone. Here it thresholds a
// TRAVELLING BAND: the front's position gives every pixel a number, the matrix
// says how far the front has to get before that pixel flips, and the result is
// a wipe that dissolves rather than sweeps. Every pixel flips exactly once, and
// which ones go early is decided by the same evenness that makes the matrix a
// good dither.
//
// The idea is from a transition in YoshiOS (index.html:46-84) where a Bayer-8
// is used as time in precisely this way. It is the only place in either corpus
// where a threshold matrix is a clock, and it is worth more than another
// gradient.
float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    // One full pass every six seconds, with a soft leading edge. lead is 1
    // where the front has already gone by and 0 ahead of it; the matrix decides
    // what happens in the band between, which is the whole transition.
    float front = fract(u_time / 6.0) * 1.6 - 0.3;
    float lead  = 1.0 - smoothstep(front - 0.22, front + 0.22, uv.y);

    float th = bayer8(gl_FragCoord.xy / max(u_pitch, 1.0));
    float on = step(th, lead);

    gl_FragColor = vec4(mix(vec3(0.086, 0.090, 0.098), c, on), 1.0);
}
` },

    { id: 'error-diffusion', title: 'Error diffusion (Canvas2D)', lane: 'canvas2d',
      file: 'error-diffusion.js', code:
`// FLOYD-STEINBERG, and why it is not a shader.
//
// Every pixel is quantized, its error measured, and that error handed forward
// to neighbours that have not been decided yet — 7/16 right, then 3/16, 5/16,
// 1/16 on the row below. The loop cannot be reordered and it cannot be run in
// parallel: pixel n+1 is not answerable until pixel n has been answered.
// That is the exact property a fragment shader is defined not to have, which is
// why this example is in the other lane rather than in GLSL with a trick.
//
// The pay-off is that nothing tiles. There is no matrix, so there is no weave,
// and the error is settled locally instead of being spread by a pattern.

const levels = Math.max(2, Math.round(p.levels || 4));
const amount = Math.min(1, Math.max(0, p.dither == null ? 1 : p.dither));
const cell   = Math.max(1, Math.round(p.pitch || 2));

// ---- the source: drawn here, so no asset ships ----
const g = ctx.createLinearGradient(0, 0, W, 0);
g.addColorStop(0.00, '#141821');
g.addColorStop(0.55, '#8d8577');
g.addColorStop(1.00, '#f2ece0');
ctx.fillStyle = g;
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = 'rgba(255,255,255,0.55)';
ctx.beginPath(); ctx.arc(W * 0.30, H * 0.42, Math.min(W, H) * 0.26, 0, 7); ctx.fill();
ctx.fillStyle = 'rgba(10,10,12,0.75)';
ctx.fillRect(W * 0.62, H * 0.20, W * 0.22, H * 0.60);

// ---- one serial pass ----
// Worked at 1/cell resolution so the result is legible at any DPR: the dot is a
// decision about the output device, not about the buffer that happens to exist.
const w = Math.max(1, Math.floor(W / cell)), h = Math.max(1, Math.floor(H / cell));
const src = ctx.getImageData(0, 0, W, H);
const buf = new Float32Array(w * h);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const o = ((y * cell) * W + x * cell) * 4;
    buf[y * w + x] = (0.2125 * src.data[o] + 0.7154 * src.data[o + 1] + 0.0721 * src.data[o + 2]) / 255;
  }
}

const step = levels - 1;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const old = buf[i];
    const q = Math.round(old * step) / step;
    buf[i] = q;
    const err = (old - q) * amount;
    if (x + 1 < w)                buf[i + 1]         += err * 7 / 16;
    if (x > 0     && y + 1 < h)   buf[i + w - 1]     += err * 3 / 16;
    if (             y + 1 < h)   buf[i + w]         += err * 5 / 16;
    if (x + 1 < w && y + 1 < h)   buf[i + w + 1]     += err * 1 / 16;
  }
}

// ---- paint the decided values back, one cell to one cell ----
// Written into a w x h buffer and blown up with smoothing off, rather than
// w*h fillRect calls: at 1440 with DPR 2 that would be half a million draw
// calls for a picture that is painted once.
const out = ctx.createImageData(w, h);
for (let i = 0; i < w * h; i++) {
  const v = Math.round(lib.clamp(buf[i], 0, 1) * 255);
  out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = v;
  out.data[i * 4 + 3] = 255;
}
const off = document.createElement('canvas');
off.width = w; off.height = h;
off.getContext('2d').putImageData(out, 0, 0);
ctx.imageSmoothingEnabled = false;
ctx.clearRect(0, 0, W, H);
ctx.drawImage(off, 0, 0, w, h, 0, 0, w * cell, h * cell);
` }
  ],

  /* --- the ladder -------------------------------------------------------- */
  exercises: [
    { rung: 'tune', text: 'Set <code>levels</code> to 2 and move <code>dither</code> from 0 to 1. At 0 you have a black-and-white threshold of the image — a stencil. At 1 you have the same two inks reproducing continuous tone. Nothing between those two states is a filter; it is the rounding rule moving.' },
    { rung: 'tune', text: 'Take <code>pitch</code> to 6 on the 8×8 example. The matrix becomes furniture: you can read the weave, and you can see that it is the same weave everywhere regardless of what the picture is doing. That is the argument for blue noise in one screenshot.' },
    { rung: 'substitute', text: 'In <em>Ordered, 4×4</em>, give each channel its own matrix offset — <code>bayer4(px + vec2(0.0, 0.0))</code>, <code>+ vec2(1.0, 2.0)</code>, <code>+ vec2(3.0, 1.0)</code>. You have just invented misregistration, which is either a fault or a whole print aesthetic depending on whether you did it on purpose.' },
    { rung: 'generalise', text: 'Write <code>float rounding(vec2 px, float amount)</code> and use it in all four shaders so the only thing any of them can vary is where it is called. Once the rule is a function, "before or after the floor" is a question you cannot fail to notice you are answering.' },
    { rung: 'compose', text: 'Make the level count a function of something in the picture rather than a constant — depth, distance from a focal point, ink coverage — so that a region gets crunchier for a reason. That is what W2 does with a depth field, and it is the whole difference between a retro filter and a material.' }
  ],

  /* --- variants ---------------------------------------------------------- */
  gallery: [
    { label: 'one bit, two inks', thumb: 'one-bit.png', note: 'levels = 2, and the tone is entirely in the arrangement',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_pitch;

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// Two inks, chosen rather than assumed: warm black on a bone stock. At one bit
// there is no tone left anywhere in the file — every pixel is one ink or the
// other — and the tone you see is entirely a property of the arrangement.
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;
    float v = dot(c, vec3(0.2125, 0.7154, 0.0721));

    float th = bayer8(gl_FragCoord.xy / max(u_pitch, 1.0));
    float on = step(th, v);

    vec3 stock = vec3(0.929, 0.914, 0.878);
    vec3 ink   = vec3(0.078, 0.075, 0.086);
    gl_FragColor = vec4(mix(ink, stock, on), 1.0);
}` },

    { label: 'levels driven by the picture', thumb: 'levels-driven.png',
      note: 'the level count is a function of tone, so the shadows crunch and the highlights hold',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_pitch;

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

// The level count stops being a constant. Here it is a function of the local
// tone — few levels in the shadows, more in the highlights — so the image is
// coarse where there is nothing to lose and fine where the eye is looking.
// One value decides two things: the quantization AND the dither strength that
// goes with it, so they cannot disagree.
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;
    float v = dot(c, vec3(0.2125, 0.7154, 0.0721));

    float L        = mix(2.0, max(u_levels, 3.0), smoothstep(0.15, 0.85, v)) - 1.0;
    float strength = mix(1.0, 0.45, smoothstep(0.15, 0.85, v));

    float th = bayer4(gl_FragCoord.xy / max(u_pitch, 1.0));
    gl_FragColor = vec4(floor(c * L + mix(0.5, th, strength)) / L, 1.0);
}` },

    { label: 'the screen at an angle', thumb: 'screen-angle.png',
      note: 'the matrix rotated 30° — the same rule, off the pixel grid',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_pitch;

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

// Rotating the matrix takes the weave off the horizontal and the vertical,
// where the eye is most sensitive to it — the same reason a printer sets the
// black plate at 45 degrees. The rotation is applied to the THRESHOLD
// coordinate only; the picture is untouched, which is the difference between
// screening an image and distorting it.
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer4(rot(0.5236) * gl_FragCoord.xy / max(u_pitch, 1.0));

    gl_FragColor = vec4(floor(c * L + th) / L, 1.0);
}` }
  ],

  critique: {
    reads_as: 'A continuous-tone photograph reproduced on a device that has four greys — a printed halftone rather than a picture with a texture applied to it.',
    coupling: 'One value decides the rounding: the matrix threshold enters the same expression as the tone, inside the same floor. In the gallery variant the local tone drives the level count and the dither strength together, so the two cannot be set against each other.',
    pass_order: 'Threshold before floor. Reversed — floor, then add the matrix — every band edge stays exactly where it was and the matrix becomes a texture on top of banding. The two stages differ by moving one term across a floor and by nothing else, which is the shortest available proof that pass order is not a preference.',
    operators: ['tone', 'Bayer threshold', 'quantizer'],
    why_it_survives: 'Remove the quantizer and there is no chapter — the image was already continuous. Remove the dither and the banding returns, along contours, exactly where the eye looks. Remove the pitch control and the screen is locked to the buffer resolution rather than to the output device, which is the one decision a reproduction is actually about.',
    faults: [
      'The ordered matrix weaves. At pitch 4 and above it is furniture, and no amount of tuning fixes that — it wants blue noise, which wants a texture, which this chapter deliberately does not ship.',
      'The GLSL examples dither the three channels against one threshold. That is right for a reproduction and wrong for a plate-per-ink screen; the misregistration exercise is the honest way in, and there is no worked version of it here.',
      'The Canvas2D pass runs a full getImageData and a per-cell fillRect. It is correct and it is not fast; at 1440 it is a visible beat on mount. It is a print, painted once, which is the only reason that is acceptable.'
    ]
  },

  related: [
    { entry: '10-random', relation: 'variant-of', label: '10 Random' },
    { entry: '09-patterns', relation: 'technique-of', label: '09 Patterns' },
    { entry: 'w2-depth-aware-dither', relation: 'source-of', label: 'W2 Depth-aware dither' },
    { entry: '00-introduction', relation: 'technique-of', label: '00 Introduction' }
  ],

  links: [
    { label: 'Quilez — dithering and banding', url: 'https://iquilezles.org/articles/dither/' },
    { label: 'The book’s contents — where this would have been', url: 'https://thebookofshaders.com/' }
  ]
});
