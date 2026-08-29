/* 05 Shaping functions — extended at checkpoint 4.

   The migrated chapter had one shader and one exercise. Upstream has four
   editors in a row, two plotters, a gallery of six of Quilez's shaping
   functions and a table of nine utility functions to uncomment one at a time
   (research/04 §3). The licence forbids reproducing any of those files, and it
   does not forbid the argument, so this chapter carries FOURTEEN examples
   written here — one shaping function each, one bench, one line different.

   The strip is also the load test. PLAN §6 lists "the example strip at 23
   chips" as an untested risk; this is the chapter that tests it, and every
   measurement of the strip in CHECKPOINT-4 was taken here. */
Shell.registerEntry({
  id: '05-shaping-functions',
  index: '05',
  order: 50,
  title: 'Shaping functions',
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ['smoothstep', 'plot', 'remap', 'gallery'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 05',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/05/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The chapter and the idea of a shaping-function gallery are the book’s. All fourteen shaders here are written for this tool.'
  },
  thumb: 'thumb.png',

  text: `
    <p>A shaping function takes a number between 0 and 1 and gives back a
    different number between 0 and 1. That is all. It sounds like nothing, and
    it is where essentially all expressive control in a shader lives, because
    everything downstream — a colour, a threshold, a size, a speed — is
    ultimately something being handed a value, and the <em>shape</em> of that
    value decides what the picture is.</p>

    <p>This is the chapter to be greedy about. Fourteen curves are in the strip
    under the stage and they are the working vocabulary: a ramp, an exponent, a
    hard decision and a soft one, an oscillator, a repeat, a fold, a staircase,
    an event, a window, an arch, an asymmetric arch, a contrast curve and a
    fall-off. Every one of them is one line. Step along them with the arrow
    keys and watch the bench stay still while the line changes.</p>

    <div class="note"><span class="lab">Selecting effects vs shaping values</span>
      <p>The reason this chapter matters more than it looks is that most people
      reach for a new operator when what they wanted was a different curve on
      the one they had. "Make the glow tighter" is almost never a new pass; it
      is <code>pow</code> with a larger exponent. Learning to see the request as
      a curve is the difference between a stack of effects and a system with
      one cause.</p></div>

    <h2>How to read the bench</h2>

    <p>Every example draws the same thing: the horizontal axis is the input, the
    vertical is the output, the rule across the middle is 0.5, and the wash
    under the line is there so you can read the curve from the shape of the
    filled area as well as from the line itself. Where a curve is very steep the
    line thins out and at a true step it disappears entirely, because a line of
    fixed thickness has nothing to be thick across. That is not a defect of the
    plot; it is the reason a stepped edge staircases.</p>

    <h2>The three knobs</h2>

    <p>Every example is given the same three parameters and uses the ones it
    needs. <code>k</code> is the shape — an exponent, a level count, a width,
    depending on what the curve does with it. <code>bias</code> is where the
    interesting part of the curve sits. <code>freq</code> is how many times it
    repeats. Naming them by their job rather than by their letter is most of
    what separates a parameter from a magic number.</p>`,

  params: [
    { name: 'k', min: 0.1, max: 8, step: 0.05, value: 2,
      note: 'the shape: an exponent, a width, a level count — whatever this curve’s character is' },
    { name: 'bias', min: 0, max: 1, step: 0.01, value: 0.5,
      note: 'where on the input range the interesting part happens' },
    { name: 'freq', min: 0.5, max: 8, step: 0.1, value: 3,
      note: 'how many times it repeats across the range' }
  ],

  plots: [
    { title: 'The exponent, on its own',
      expr: 'pow(x, 0.2 + t)', domain: [0, 1], range: [0, 1],
      note: 'Below 1 the curve bulges up and most of the range is spent bright; above 1 it sags and most of it is spent dark. One number, and it is the difference between a hazy image and a contrasty one.' },
    { title: 'A window, not a door',
      expr: 'mix(smoothstep(0.0, 0.35, x), 1.0 - smoothstep(0.65, 1.0, x), step(0.5, x))',
      domain: [0, 1], range: [0, 1],
      note: '<code>smoothstep</code> opens; two of them back to back open and close. Whenever an operator should affect a <em>region</em> rather than everything past a point, this is the shape you actually wanted.' }
  ],

  examples: [
    { id: 'linear', title: 'Linear', lane: 'glsl', file: 'main.frag', code:
`// The identity. Nothing is being shaped, and it is here because every other
// curve in this strip is a departure from it — you cannot see a departure
// without the thing departed from.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = x;

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'exponent', title: 'Exponent', lane: 'glsl', file: 'exponent.frag', code:
`// pow(). The single most useful shaping function there is: k below 1 pushes
// values up (more of the range spent bright), k above 1 pushes them down.
// Take k through 0.2, 1.0, 2.0, 8.0 and watch the whole tonal character of
// anything downstream change without a single new operator.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = pow(x, k);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'step', title: 'Step', lane: 'glsl', file: 'step.frag', code:
`// A decision, with no width. Everything below the threshold is 0 and
// everything above is 1, and there is nothing in between — which is why a
// stepped edge staircases: the transition is narrower than a pixel and the
// pixel has to pick a side. The line vanishes at the jump for the same
// reason, and that is honest rather than a bug in the plot.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = step(u_bias, x);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'smoothstep', title: 'Smoothstep', lane: 'glsl', file: 'smoothstep.frag', code:
`// The same decision, given a width. Between the two edges it is a cubic that
// leaves both ends flat, so the transition has no corner at either end — it
// is the difference between a cut and an easing, and it is one call.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = smoothstep(u_bias - 0.25, u_bias + 0.25, x);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'sine', title: 'Sine', lane: 'glsl', file: 'sine.frag', code:
`// The oscillator. Two numbers do everything: the multiplier in front is
// AMPLITUDE and the multiplier on x is FREQUENCY. Every wave in chapter 13
// is a sum of these two decisions at different sizes.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = 0.5 + 0.5 * sin(x * TAU * u_freq + u_time * 0.5);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'sawtooth', title: 'Sawtooth', lane: 'glsl', file: 'sawtooth.frag', code:
`// fract() throws away the integer part, so the value resets. This is the
// function behind every tiled pattern in chapter 09: repeat is not a loop,
// it is a shaping function applied to the coordinate.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = fract(x * u_freq);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'triangle', title: 'Triangle', lane: 'glsl', file: 'triangle.frag', code:
`// The sawtooth folded about its own middle. abs() of a centred value is the
// cheapest way to get something that goes up and comes back, and it is the
// same fold that turns fBm into turbulence in chapter 13.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = abs(fract(x * u_freq) * 2.0 - 1.0);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'staircase', title: 'Staircase', lane: 'glsl', file: 'staircase.frag', code:
`// Quantization. floor() after a multiply gives a fixed number of levels, and
// the +0.5 is what makes it round to nearest rather than always down. This
// is the whole of chapter 20 in one line, before anything is done about the
// banding it causes.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float n = max(floor(k), 1.0);
    float y = floor(x * n + 0.5) / n;

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'impulse', title: 'Impulse', lane: 'glsl', file: 'impulse.frag', code:
`// A rise and a decay in one expression, peaking at 1/k. It is the shape of
// an event: something happens, and then it stops happening at a different
// rate than it started. Most motion that reads as alive is one of these
// rather than a linear ramp.
// After Iñigo Quilez's useful-functions collection — linked under Elsewhere.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float h = k * 3.0 * x;
    float y = h * exp(1.0 - h);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'cubic-pulse', title: 'Cubic pulse', lane: 'glsl', file: 'cubic-pulse.frag', code:
`// A window: zero outside a band, one at its centre, smooth at both seams.
// Where smoothstep opens a door, this opens and closes it, which is what you
// want whenever a thing should affect a REGION rather than a half-plane.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float w = 0.5 / k;
    float d = abs(x - u_bias);
    float t = clamp(d / w, 0.0, 1.0);
    float y = 1.0 - t * t * (3.0 - 2.0 * t);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'parabola', title: 'Parabola', lane: 'glsl', file: 'parabola.frag', code:
`// 4x(1-x) is the arch: zero at both ends, one in the middle, symmetric. The
// exponent then decides whether it is a dome or a needle. Reach for it when
// something must fade in and out over a span and be strongest at the centre.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = pow(4.0 * x * (1.0 - x), k);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'pcurve', title: 'Asymmetric curve', lane: 'glsl', file: 'pcurve.frag', code:
`// The parabola with two exponents instead of one, so the rise and the fall
// can differ, normalised so the peak is still 1. This is what an attack and
// a decay look like when they are not the same length — which is nearly
// always, in anything observed rather than assumed.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float a = k;
    float b = k * 2.5;
    float n = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    float y = n * pow(x, a) * pow(1.0 - x, b);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'gain', title: 'Gain', lane: 'glsl', file: 'gain.frag', code:
`// The S-curve with a knob. Below 1 it flattens the middle and steepens the
// ends; above 1 it does the reverse. It is symmetric about (0.5, 0.5), which
// is why it can be used as a contrast control on a value without moving its
// midpoint — the one property a plain pow() does not have.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float t = (x < 0.5) ? 2.0 * x : 2.0 - 2.0 * x;
    float s = pow(t, k) * 0.5;
    float y = (x < 0.5) ? s : 1.0 - s;

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` },

    { id: 'expstep', title: 'Exponential step', lane: 'glsl', file: 'expstep.frag', code:
`// exp(-k * x^n): a fall-off that never quite reaches zero, which is what
// real attenuation does — light through fog, a signal down a wire. The n
// decides how long it stays high before it goes, and that delay is usually
// the part that carries the character.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = exp(-k * pow(x, 2.5));

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
` }  ],

  exercises: [
    { rung: 'tune', text: 'Open <em>Exponent</em> and take <code>k</code> through 0.2, 1.0, 2.0 and 8.0, stopping at each. Those four settings are four different materials, and no operator was added between them.' },
    { rung: 'substitute', text: 'In any example, replace the <code>SHAPE</code> line with one from another. The bench does not change, the uniforms do not change, and the picture is completely different — which is the whole claim of the chapter, demonstrated by paste.' },
    { rung: 'generalise', text: 'Take the three curves you find yourself reaching for and write them as functions with named arguments — <code>gain(x, k)</code>, <code>pulse(x, centre, width)</code>, <code>impulse(x, k)</code>. A shaping function you have named is one you will use; a shaping function you have to re-derive is one you will replace with a new pass.' },
    { rung: 'compose', text: 'Make three pictures in which the SAME shaping function is applied to two different things — a tone and a size, a position and an opacity. When one curve governs two properties the piece reads as one decision; when two curves govern two properties it reads as two, however carefully they are matched.' }
  ],

  related: [
    { entry: '07-shapes', relation: 'answers', label: '07 Shapes' },
    { entry: '13-fractal-brownian-motion', relation: 'technique-of',
      label: '13 Fractal Brownian Motion' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/05/' },
    { label: 'Quilez — useful little functions', url: 'https://iquilezles.org/articles/functions/' },
    { label: 'GraphToy — plot these in the browser', url: 'https://graphtoy.com/' }
  ]
});
