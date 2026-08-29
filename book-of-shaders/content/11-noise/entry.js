/* 11 Noise — extended at checkpoint 4.

   Upstream chapter 11 has sixteen worked examples and two plotters. The licence
   forbids reproducing the files and does not forbid the argument, so this
   chapter carries six examples written here covering the same ground: value
   noise, gradient noise, the two side by side, noise as a displacement, noise
   as a profile rather than a texture, and a tileable lattice.

   The third example exists because "value noise vs gradient noise" is the sort
   of difference that is obvious once seen and invisible when described. */
Shell.registerEntry({
  id: '11-noise',
  index: '11',
  order: 110,
  title: 'Noise',
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ['value noise', 'gradient noise', 'interpolation', 'lattice'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 11',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/11/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The chapter and its sequence are the book’s; the six shaders are written for this tool.'
  },
  thumb: 'thumb.png',

  text: `
    <p>A hash gives a different number at every point, and points next to each
    other know nothing about one another. Noise is what you get when you insist
    that they do: place random values on a lattice, and for any position in
    between, interpolate. The result is continuous, which means it has a
    <em>feature size</em> — and a feature size is the thing a hash does not have
    and that everything made of material does.</p>

    <p>There are two standard ways to do it and the difference is worth seeing
    rather than reading. <strong>Value noise</strong> stores a value at each
    lattice point and blends between them. <strong>Gradient noise</strong>
    stores a random <em>direction</em> at each lattice point and blends the
    contribution each one makes to your position. Value noise is cheaper and its
    extremes always land exactly on the lattice, so it has a faint blockiness
    you can see once you know it is there. Gradient noise is zero at every
    lattice point and gets its extremes in between, so it has no grid — and it
    is what most people mean when they say Perlin.</p>

    <div class="note"><span class="lab">Not a texture</span>
      <p>Noise is a source of continuously varying structure. It is there to
      <em>drive</em> something — a height, a displacement, a width, a threshold.
      A layer of it laid over a finished picture to add interest is the
      anti-pattern chapter 10 spends its second half on, and knowing how to make
      noise is exactly what makes that mistake available.</p></div>

    <h2>The interpolation curve is a decision</h2>

    <p>Both kinds interpolate, and how they interpolate shows. A straight lerp
    leaves a crease at every lattice line, because the slope changes abruptly
    there. The cubic <code>f*f*(3-2f)</code> — the same curve
    <code>smoothstep</code> uses — makes the slope zero at the lattice points, so
    the creases go. The quintic <code>f*f*f*(f*(f*6-15)+10)</code> makes the
    <em>curvature</em> zero too, which stops the second derivative jumping and
    matters the moment you take a gradient of the field to light it with. That
    is not an abstraction: it is the difference between a hillshade with faint
    grid lines in it and one without.</p>`,

  params: [
    { name: 'scale', min: 1, max: 16, step: 0.25, value: 5,
      note: 'lattice cells across the stage — the feature size' },
    { name: 'speed', min: 0, max: 1, step: 0.01, value: 0.25,
      note: 'how fast the field drifts. Zero is a still specimen.' },
    { name: 'contrast', min: 0.3, max: 3, step: 0.05, value: 1,
      note: 'an exponent on the result. It changes the character and not the structure.' }
  ],

  plots: [
    { title: 'Lerp leaves creases; the cubic does not',
      expr: 'mix(mix(fract(sin(floor(x*8.0)*127.1)*43758.5), fract(sin((floor(x*8.0)+1.0)*127.1)*43758.5), fract(x*8.0)), mix(fract(sin(floor(x*8.0)*127.1)*43758.5), fract(sin((floor(x*8.0)+1.0)*127.1)*43758.5), fract(x*8.0)*fract(x*8.0)*(3.0-2.0*fract(x*8.0))), step(0.5, t))',
      domain: [0, 1], range: [0, 1],
      note: 'One-dimensional value noise over eight cells. Drag <code>t</code> past the middle to switch the interpolation from a straight lerp to the cubic: the values at the lattice points are identical and every corner between them disappears.' }
  ],

  examples: [
    { id: 'value-noise', title: 'Value noise', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// VALUE NOISE. One random number per lattice point, bilinearly blended, with
// the cubic easing curve on both axes so the lattice lines have no crease.
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;

    float n = noise(p + vec2(u_time * u_speed, 0.0));
    n = pow(clamp(n, 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, n), 1.0);
}
` },

    { id: 'gradient-noise', title: 'Gradient noise', lane: 'glsl', file: 'gradient.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

// A random DIRECTION per lattice point rather than a random value.
vec2 hash2(vec2 p) {
    float n = sin(dot(p, vec2(41.0, 289.0)));
    return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

// GRADIENT NOISE. Each corner contributes the dot product of its own random
// direction with the offset from that corner to here — so every lattice point
// evaluates to exactly zero and the extremes land BETWEEN the points. That is
// the whole difference from value noise, and it is why this one has no grid.
//
// The quintic easing is used rather than the cubic: it makes the second
// derivative continuous as well as the first, which is invisible here and very
// visible the moment you take a gradient of this field to light it.
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.7 + 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;

    float n = noise(p + vec2(u_time * u_speed, 0.0));
    n = pow(clamp(n, 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, n), 1.0);
}
` },

    { id: 'side-by-side', title: 'The two, side by side', lane: 'glsl', file: 'compare.frag',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

// LEFT: value noise. RIGHT: gradient noise. Same lattice, same scale, same
// drift. Take u_scale down to 2 or 3 and the difference is unmistakable: the
// value-noise half has its light and dark centres ON the lattice, in rows and
// columns, and the gradient half does not. Take it up to 12 and the difference
// stops being visible at all, which is the honest reason value noise is still
// worth having.
//
// The rules across both halves are level sets of each field, so you are
// comparing the SHAPE of the two rather than their tone.

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }
vec2 hash2(vec2 p) {
    float n = sin(dot(p, vec2(41.0, 289.0)));
    return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

float valueNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float gradNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.7 + 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 d  = vec2(u_time * u_speed, 0.0);

    float n = (st.x < 0.5) ? valueNoise(p + d) : gradNoise(p + d);
    n = pow(clamp(n, 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col = mix(deep, paper, n);

    // level sets, so the SHAPE is comparable and not just the tone
    float lv = 1.0 - smoothstep(0.0, 0.045, abs(fract(n * 7.0) - 0.5));
    col = mix(col, vec3(0.804, 0.267, 0.176), lv * 0.5);

    // the seam
    col = mix(col, vec3(0.043, 0.043, 0.047),
              1.0 - smoothstep(0.0, 1.5 / u_resolution.x, abs(st.x - 0.5)));

    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'profile', title: 'Noise as a profile', lane: 'glsl', file: 'profile.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

float hash(float x) { return fract(sin(x * 127.1) * 43758.5453123); }
float noise(float x) {
    float i = floor(x), f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

// Noise driving a SHAPE rather than tinting a surface. The field decides the
// height of a horizon and nothing else; every other mark on the page — the
// rules, the fill, the edge — is a consequence of that one number.
//
// This is the honest use of the technique, and it is the one to reach for
// before reaching for the other one.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x * (u_resolution.x / u_resolution.y) * u_scale + u_time * u_speed;

    float h = 0.30 + 0.34 * pow(noise(x), u_contrast);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.078, 0.086, 0.110);

    // the ruled ground, which stops at the horizon rather than running under it
    float rule = 1.0 - smoothstep(0.0, 0.03, abs(fract(st.y * 26.0) - 0.5));
    float below = 1.0 - step(h, st.y);

    vec3 col = mix(paper, ink, rule * 0.16 * below);
    col = mix(col, ink, below * 0.12);
    // and the horizon itself, crisp
    col = mix(col, ink, 1.0 - smoothstep(0.0, 2.5 / u_resolution.y, abs(st.y - h)));

    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'displaced', title: 'Noise as a displacement', lane: 'glsl', file: 'displaced.frag',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// The field moves a set of rules rather than tinting them. The rules keep the
// edge that sin() gives them — nothing has been blurred — and what changes is
// where each one is. Chapter 21 is this move taken seriously.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;

    float n = noise(p + vec2(u_time * u_speed, 0.0)) - 0.5;
    float rule = sin((st.y + n * 0.28 * u_contrast) * 78.0);
    float ink  = 1.0 - smoothstep(0.15, 0.65, abs(rule));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.078, 0.086, 0.110), ink), 1.0);
}
` },

    { id: 'tileable', title: 'A lattice that wraps', lane: 'glsl', file: 'tileable.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_scale;
uniform float u_contrast;

// TILEABLE NOISE. Wrap the lattice index with mod() before hashing it, and the
// field repeats exactly every N cells — so the right edge meets the left. It
// costs one mod and it is the difference between noise you can print as a
// repeating stock and noise you cannot.
//
// The seam is drawn on so you can check: the pattern crosses it without a
// discontinuity, which is the only proof that matters.
float hash(vec2 p, float n) {
    p = mod(p, n);                                   // ← the whole trick
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 p, float n) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0), n), hash(i + vec2(1.0, 0.0), n), u.x),
               mix(hash(i + vec2(0.0, 1.0), n), hash(i + vec2(1.0, 1.0), n), u.x), u.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float cells = max(floor(u_scale), 2.0);

    // two full periods across the stage, so the repeat is visible as a repeat
    vec2 p = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * cells * 1.2;

    float v = pow(clamp(noise(p, cells), 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col = mix(deep, paper, v);

    // the period boundary, marked
    float seam = 1.0 - smoothstep(0.0, 0.012, abs(fract(p.x / cells) - 0.5));
    col = mix(col, vec3(0.804, 0.267, 0.176), seam * 0.45);

    gl_FragColor = vec4(col, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Set <code>scale</code> to 2 on <em>The two, side by side</em>. The value-noise half has its light and dark centres arranged in rows and columns because they land on the lattice; the gradient half does not. Then take it to 12 and note that the difference has gone, which is why the cheaper one is still worth having.' },
    { rung: 'substitute', text: 'In <em>Value noise</em>, replace <code>f * f * (3.0 - 2.0 * f)</code> with plain <code>f</code>. The lattice appears as a grid of creases, because the slope now jumps at every cell boundary. Put the quintic in instead and nothing visible changes here — the difference only shows once you take a gradient of the field.' },
    { rung: 'generalise', text: 'Write one <code>noise()</code> you are willing to keep, with the lattice wrap of the sixth example built in and the easing curve as the only thing you would ever change. Every octave loop in chapters 13 and 21 stands on it, and a noise function you have to re-derive is a noise function you will get slightly wrong twice.' },
    { rung: 'compose', text: 'Take <em>Noise as a profile</em> and give the field a second job: let the same value that sets the horizon height also set the density of the rules beneath it, so where the land is high it is also darker. Then remove the second job and say what was lost. If the answer is only "it was richer", put it back the other way round and try again.' }
  ],

  related: [
    { entry: '10-random', relation: 'variant-of', label: '10 Random' },
    { entry: 'w3-hillshade-and-flow', relation: 'source-of',
      label: 'W3 One field, two jobs' },
    { entry: '13-fractal-brownian-motion', relation: 'answers',
      label: '13 Fractal Brownian Motion' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/11/' },
    { label: 'Quilez — gradient noise derivatives',
      url: 'https://iquilezles.org/articles/gradientnoise/' }
  ]
});
