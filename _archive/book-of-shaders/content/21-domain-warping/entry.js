/* 21 Domain warping — written for this tool. This is the chapter the migrated
   chapter 13 pointed at: its shipped copy read "feed the result into the next
   chapter's domain warping" and the next chapter was 14 Fractals. The forward
   reference was removed at checkpoint 3 and the chapter it wanted is written
   here, so 13 can point at a real thing again.

   The whole chapter exists to hold one distinction apart: warping the INPUT of
   a field is not the same operation as distorting its OUTPUT, and the two look
   superficially alike in a still. Every stage, plot and variant is one more
   angle on that. */
Shell.registerEntry({
  id: '21-domain-warping',
  index: '21',
  order: 210,
  title: 'Domain warping',
  section: 'beyond',
  status: 'canonical',
  lane: 'glsl',
  tags: ['warp', 'fbm', 'order dependence'],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    author: 'Julia Compton',
    note: 'The book has no domain-warping chapter; chapter 13 promised one. The technique is standard and is credited to Iñigo Quilez under Elsewhere.'
  },
  thumb: 'thumb.png',

  text: `
    <p>Everything so far has evaluated a field at the position it was given.
    Domain warping is the move where you change your mind about the position
    first: compute something, add it to the coordinate, and evaluate the field
    <em>there</em> instead. <code>fbm(p + fbm(p))</code>. Two lines, and it is
    the single largest jump in apparent complexity available anywhere in this
    book — a plain octave sum looks like static that has been smoothed, and the
    same sum, warped by itself, looks like marble, or smoke, or the surface of a
    planet.</p>

    <p>The reason it is worth a chapter of its own is not the picture. It is
    that warping the input and distorting the output are two different
    operations that a still image can make look similar, and only one of them
    keeps its structure. Distorting the output adds a second signal on top of
    the first: both are visible, both compete, and the result tends toward
    mush — the average of two fields is flatter than either. Warping the input
    moves the first field's own features without changing what they are. The
    edges stay as sharp as they were. The bands stay bands. They simply arrive
    somewhere else.</p>

    <div class="note"><span class="lab">The same test as the dither</span>
      <p>Chapter 20 turns on which side of a <code>floor</code> a term sits.
      This one turns on which side of a function call a term sits. In both cases
      the two versions have identical operators, identical cost, and produce
      pictures that are not related to each other. That is what order dependence
      means, and it is why "which passes, in which order" is a design question
      and not a plumbing question.</p></div>

    <h2>How far to take it</h2>

    <p>The standard construction is two levels. Compute a vector field
    <code>q</code> from two copies of the noise, offset from each other so they
    are not the same field twice. Compute a second vector field <code>r</code>
    at <code>p + 4q</code>. Then read the noise at <code>p + 4r</code>. The
    reason for two rather than one is that a single warp displaces features and
    a double warp displaces the <em>displacement</em>, which is what produces
    the long swirling filaments that a single warp cannot make.</p>

    <p>Three levels is available and is almost never worth it. By then the
    features have been moved so far from where the first field put them that the
    large structure is gone, and what is left is expensive and shapeless. The
    <code>warp</code> slider will take you there: turn it past about 1.5 and
    watch the composition stop having a subject.</p>

    <p>Two things worth doing with <code>q</code> other than displacing with it.
    It is a vector, so it has a direction — you can shade with it, which is what
    <a href="#/w3-hillshade-and-flow">W3</a> does with a different field. And it
    is available <em>before</em> the final read, so it can decide colour as well
    as position, which is the difference between a warped texture and a material
    that knows where its own grain is running.</p>`,

  /* --- the build-up ------------------------------------------------------ */
  stages: [
    { label: 'the field', note: 'plain fBm — the thing about to be warped',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;

    float f = fbm(p + vec2(u_time * 0.02, 0.0));

    vec3 deep  = vec3(0.086, 0.105, 0.157);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, f), 1.0);
}` },

    { label: 'distort the output', note: 'the counter-example: a second field ADDED to the first',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_warp;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// The second field is added to the RESULT. Both fields are now visible at once
// and neither is legible; turning u_warp up does not increase the structure, it
// averages it away. This is the version that people mean when they say noise
// looks muddy, and it is one character away from the next stage.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.02, 0.0);

    float f = fbm(p + t) + u_warp * (fbm(p * 1.7 + 5.2 + t) - 0.5);

    vec3 deep  = vec3(0.086, 0.105, 0.157);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, clamp(f, 0.0, 1.0)), 1.0);
}` },

    { label: 'warp the input', note: 'the same two fields — one of them moved inside the call',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_warp;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// One character of difference from the previous stage: the second field is
// inside the parentheses. It is now a displacement of the position rather than
// a contribution to the value, so the first field's features keep their shape
// and change their address. Nothing has been softened; everything has moved.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.02, 0.0);

    // q is a VECTOR: two fields, offset from one another so they are not the
    // same field twice. Offsetting by a constant is the cheapest way to get an
    // independent-looking field out of one function.
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));

    float f = fbm(p + u_warp * q);

    vec3 deep  = vec3(0.086, 0.105, 0.157);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, f), 1.0);
}` },

    { label: 'two levels', note: 'warp the displacement as well — the standard construction',
      default: true,
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_warp;
uniform float u_tint;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.015, u_time * 0.004);

    // Level one: a displacement.
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
    // Level two: a displacement OF THE DISPLACEMENT. This is where the long
    // filaments come from — one warp moves features, two warps move the thing
    // that was moving them, and the result has structure at a scale neither
    // field contains.
    vec2 r = vec2(fbm(p + u_warp * 2.0 * q + vec2(1.7, 9.2)),
                  fbm(p + u_warp * 2.0 * q + vec2(8.3, 2.8)));

    float f = fbm(p + u_warp * 2.0 * r);

    // r is available before the final read, so it can decide colour as well as
    // position. The tint follows the direction the material is running in, which
    // is a second job for a value that was computed anyway — not a second pass.
    vec3 deep  = vec3(0.075, 0.094, 0.145);
    vec3 warm  = vec3(0.752, 0.478, 0.278);
    vec3 paper = vec3(0.949, 0.933, 0.898);
    vec3 col = mix(deep, paper, f);
    col = mix(col, warm, clamp(length(r) - 0.55, 0.0, 1.0) * u_tint);

    gl_FragColor = vec4(col, 1.0);
}` }
  ],

  /* --- named knobs ------------------------------------------------------- */
  params: [
    { name: 'warp', min: 0, max: 2, step: 0.01, value: 0.6,
      note: 'how far the position is allowed to move. At 0 this is chapter 13 again.' },
    { name: 'scale', min: 1, max: 8, step: 0.1, value: 3,
      note: 'the size of the feature the warp is acting on' },
    { name: 'tint', min: 0, max: 1, step: 0.01, value: 0.55,
      note: 'how much of the colour is decided by the displacement rather than by the height' }
  ],

  /* --- the value, in one dimension --------------------------------------- */
  plots: [
    { title: 'Warping the input moves the features',
      expr: '0.5 + 0.4*sin((x + t*0.10*sin(x*9.0)) * TAU * 2.0)',
      domain: [0, 1], range: [0, 1],
      note: 'Drag <code>t</code>. The peaks stay peaks and keep their height; what changes is <em>where</em> they are and how far apart. Nothing has been softened, because nothing has been added to the value.' },
    { title: 'Distorting the output changes them',
      expr: '0.5 + 0.4*sin(x * TAU * 2.0) + t*0.06*sin(x*9.0)',
      domain: [0, 1], range: [0, 1],
      note: 'The same two waves, added instead of substituted. The peaks move up and down, the troughs fill in, and at any real amount the first wave stops being readable. Two signals at once is not more structure — it is less.' }
  ],

  /* --- examples ---------------------------------------------------------- */
  examples: [
    { id: 'warped', title: 'Two-level warp', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;
uniform float u_tint;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.015, u_time * 0.004);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
    vec2 r = vec2(fbm(p + u_warp * 2.0 * q + vec2(1.7, 9.2)),
                  fbm(p + u_warp * 2.0 * q + vec2(8.3, 2.8)));

    float f = fbm(p + u_warp * 2.0 * r);

    vec3 deep  = vec3(0.075, 0.094, 0.145);
    vec3 warm  = vec3(0.752, 0.478, 0.278);
    vec3 paper = vec3(0.949, 0.933, 0.898);
    vec3 col = mix(deep, paper, f);
    col = mix(col, warm, clamp(length(r) - 0.55, 0.0, 1.0) * u_tint);

    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'marble', title: 'Marble — a stripe with a warped address', lane: 'glsl',
      file: 'marble.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;
uniform float u_tint;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// Marble is not a marble function. It is a set of PARALLEL STRIPES whose
// address has been warped — sin(x) with a displaced x. The stripes carry all
// the crispness, the warp carries all the character, and the two never have to
// negotiate because they are not the same operation.
//
// Note what stays sharp: the veins have exactly the edge that sin() has. Add
// the noise to the stripe instead and that edge is the first thing to go.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.01, 0.0);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.1, 7.4) + t));

    float bands = sin((p.x + u_warp * 3.0 * q.x) * 6.0);
    float vein  = 1.0 - abs(bands);
    vein = pow(clamp(vein, 0.0, 1.0), 3.0);

    vec3 stone = vec3(0.878, 0.867, 0.843);
    vec3 dark  = vec3(0.192, 0.204, 0.220);
    vec3 blush = vec3(0.573, 0.400, 0.353);

    vec3 col = mix(stone, dark, vein * 0.85);
    col = mix(col, blush, clamp(q.y - 0.55, 0.0, 1.0) * u_tint);
    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'flow', title: 'The warp as a direction', lane: 'glsl', file: 'flow.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;
uniform float u_tint;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// q is a vector and vectors have a direction. Here the SAME q does two jobs
// that are genuinely different: it displaces the ruling that draws the picture,
// and its angle tints it. Delete either and something specific is lost — the
// lines straighten, or the material stops telling you which way it is running.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.02, u_time * 0.01);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(4.7, 2.1) + t)) - 0.5;

    // a ruling, displaced
    float rule = sin((p.y + u_warp * 4.0 * q.y) * 22.0);
    float ink  = smoothstep(0.1, 0.75, abs(rule));

    // the same q, read as an angle
    float ang = atan(q.y, q.x + 0.000001);
    vec3  a   = vec3(0.196, 0.298, 0.361);
    vec3  b   = vec3(0.784, 0.412, 0.239);
    vec3  tint = mix(a, b, 0.5 + 0.5 * sin(ang));

    vec3 paper = vec3(0.941, 0.929, 0.898);
    vec3 col = mix(mix(paper, tint, u_tint * 0.8), vec3(0.086, 0.094, 0.106), 1.0 - ink);
    gl_FragColor = vec4(col, 1.0);
}
` }
  ],

  /* --- the ladder -------------------------------------------------------- */
  exercises: [
    { rung: 'tune', text: 'Set <code>warp</code> to 0 on <em>Two-level warp</em>. You are looking at chapter 13. Bring it to 0.6 and the same five octaves are now a material. Nothing was added: the position moved.' },
    { rung: 'tune', text: 'Take <code>warp</code> past 1.5 and stay there for a moment. The filaments become uniform, the picture stops having a large shape, and there is nowhere for the eye to go. The upper end of that slider is what over-warping costs and it is not subtle once you have seen it.' },
    { rung: 'substitute', text: 'In <em>Marble</em>, replace <code>sin((p.x + w*q.x) * 6.0)</code> with <code>sin(p.x * 6.0) + w * q.x</code> — the same two terms, added rather than substituted. The veins lose their edge in one keystroke, and that keystroke is the entire chapter.' },
    { rung: 'generalise', text: 'Write <code>vec2 warp(vec2 p, float amount)</code> that returns a displacement rather than a value, and build all three examples on it. A function that returns a position is a different kind of object from one that returns a tone, and having both in a library is what makes the distinction hard to lose.' },
    { rung: 'compose', text: 'Drive the warp with something that is not noise — the distance to a point, the cursor, a scroll position, a piece of data. Then make the tint follow the same vector. When one field decides both where the material is and which way it runs, you have compound causality with a single read; when they are two hand-tuned fields, you have a stack that happens to look expensive.' }
  ],

  /* --- variants ---------------------------------------------------------- */
  gallery: [
    { label: 'ridged warp', thumb: 'ridged-warp.png', note: 'the warped field folded — creases that follow the flow',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}
float ridged(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        float n = 1.0 - abs(noise(p) * 2.0 - 1.0);
        v += a * n * n; p *= 2.0; a *= 0.5;
    }
    return v / 0.96875;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.012, 0.0);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(2.8, 6.1) + t));
    float f = ridged(p + u_warp * 2.0 * q);

    vec3 rock = vec3(0.114, 0.125, 0.129);
    vec3 lit  = vec3(0.937, 0.918, 0.878);
    gl_FragColor = vec4(mix(rock, lit, pow(f, 1.4)), 1.0);
}` },

    { label: 'one level', thumb: 'one-level.png', note: 'the same shader with the second level deleted — the removal test',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;
uniform float u_tint;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// The removal test on the default shader, as a variant you can flip to. The
// second warp level is gone and nothing else has changed. What collapses is
// specific: the long filaments, which were made by displacing the displacement
// and cannot be made any other way. What survives is also specific: the
// material still reads as material. One level is not wrong — it is a different,
// cheaper, calmer picture, and knowing that is worth more than the default.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.015, u_time * 0.004);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
    float f = fbm(p + u_warp * 2.0 * q);

    vec3 deep  = vec3(0.075, 0.094, 0.145);
    vec3 warm  = vec3(0.752, 0.478, 0.278);
    vec3 paper = vec3(0.949, 0.933, 0.898);
    vec3 col = mix(deep, paper, f);
    col = mix(col, warm, clamp(length(q) - 0.55, 0.0, 1.0) * u_tint);
    gl_FragColor = vec4(col, 1.0);
}` },

    { label: 'warped by the cursor', thumb: 'cursor-warp.png', note: 'the displacement driven by something that is not noise',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// Nothing says the displacement has to come from noise. Here it is a radial
// push away from the cursor, falling off with distance — so the material is
// dragged rather than stirred, and the drag has an author. Move the cursor
// across the stage.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float ar = u_resolution.x / u_resolution.y;
    vec2 p  = vec2(st.x * ar, st.y) * u_scale;
    vec2 m  = vec2((u_mouse.x / u_resolution.x) * ar, u_mouse.y / u_resolution.y) * u_scale;

    vec2  d    = p - m;
    float fall = exp(-dot(d, d) * 0.8);
    vec2  push = normalize(d + 0.0001) * fall * u_warp * 2.2;

    float f = fbm(p + push + vec2(u_time * 0.02, 0.0));

    vec3 deep  = vec3(0.086, 0.105, 0.157);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, f), 1.0);
}` }
  ],

  stage: { mouse: true },

  critique: {
    reads_as: 'One material photographed close: a stone or a slow fluid with grain running through it, not a noise texture with a distortion applied.',
    coupling: 'A single vector field q — two offsets of one fbm — decides where the final field is read AND, through r, what colour it takes. The tint is not a second decision: it is the length of the displacement that was computed anyway.',
    pass_order: 'Warp inside the call, always. The third and fourth stages compute exactly the same two fields as the second and differ only in whether the second one is inside the parentheses. Outside, it is a signal added to a signal and the result is flatter than either. Inside, it is a change of address and the first field keeps its edges.',
    operators: ['fbm', 'vector displacement (q)', 'second-level displacement (r)', 'tint from |r|'],
    why_it_survives: 'Remove the second warp level (the gallery has it as a variant) and the long filaments go — specifically those, and nothing else. Remove the tint and the material stops declaring a direction, so the composition loses its axis. Remove the warp entirely and this is chapter 13, which is a different and lesser chapter.',
    faults: [
      'Five octaves evaluated five times per pixel. It is honest and it is not cheap; at full screen on integrated graphics this is the most expensive shader in the tool.',
      'The tint threshold (length(r) - 0.55) is hand-set. It should be derived from the field’s own distribution, and it is not — which means changing `scale` a long way moves the colour, and that is a coupling that was not designed.',
      'The animation is a constant drift of the domain. It is honest motion, but it is not authored motion: nothing here has a hold, an attack or a rest.'
    ]
  },

  related: [
    { entry: '13-fractal-brownian-motion', relation: 'variant-of',
      label: '13 Fractal Brownian Motion' },
    { entry: 'w3-hillshade-and-flow', relation: 'technique-of', label: 'W3 One field, two jobs' }
  ],

  links: [
    { label: 'Quilez — domain warping', url: 'https://iquilezles.org/articles/warp/' },
    { label: 'The chapter this answers — 13 in the book', url: 'https://thebookofshaders.com/13/' }
  ]
});
