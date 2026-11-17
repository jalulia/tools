/* 13 Fractal Brownian Motion — rebuilt at checkpoint 4 to the full chapter
   anatomy (research/04 §5): a staged build-up that goes 1-D before 2-D, three
   named parameters, two plots, the four-rung ladder, and turbulence / ridge /
   clouds as a variant gallery.

   What was wrong with the migrated chapter, and is fixed here:
     · `st *= 2.0; amp *= 0.5;` was welded shut and neither number was named.
       They are lacunarity and gain, they are the only two knobs that decide
       the character of the material, and they are now sliders.
     · the 1-D build-up the book stages with three plotters was gone; a reader
       met fBm as a finished 2-D picture, which is the one form in which you
       cannot see what any single change did.
     · the shipped copy pointed at "the next chapter's domain warping" and no
       such chapter existed. It exists now — 21 — and the pointer is a real
       link in `related`, not a sentence.

   The shaders here are written for this tool. The chapter, the two names and
   the order of the argument are the book's. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '13-fractal-brownian-motion',
  index: '13',
  order: 130,
  title: 'Fractal Brownian Motion',
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ['fbm', 'octaves', 'lacunarity', 'gain'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 13',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/13/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The chapter and its argument are the book’s. Every shader on this page is written here; no upstream file is reproduced.'
  },
  thumb: 'thumb.png',

  text: `
    <p>fBm is not an effect. It is a way of building a field that has structure
    at more than one size at once — which is what almost everything outdoors
    does. A coastline has bays; inside a bay there are coves; inside a cove
    there are rocks. One noise function gives you one size of feature. Adding
    copies of it at different sizes gives you all of them.</p>

    <p>Two numbers decide the character, and the chapter is really about those
    two. <strong>Lacunarity</strong> is the gap in frequency between one octave
    and the next — how much finer each layer is than the one before.
    <strong>Gain</strong> is how much quieter it is. The classic pair is 2.0 and
    0.5: twice as fine, half as loud, which is what the word octave means. Move
    either off those values and you are not adjusting an effect, you are
    changing what the surface is made of. Gain above 0.5 gives grit with no
    dominant scale; below it, a long swell whose detail only shows up close.</p>

    <div class="note"><span class="lab">The loop does not get cheaper</span>
      <p>The octave slider masks the tail of an eight-iteration loop rather than
      breaking out of it. GLSL ES 1.00 wants a constant loop bound — and the
      honest reason is the same as the compiler's: the hardware runs every
      iteration for the whole group anyway. An early exit in a fragment shader
      is mostly a lie you tell yourself about cost.</p></div>

    <h2>One dimension first</h2>

    <p>The build-up above goes 1-D before 2-D on purpose. In two dimensions
    every change looks like weather and it is hard to say what moved. In one,
    amplitude is a height and frequency is a spacing, and you can watch five
    waves become one line with a shape.</p>

    <div class="note"><span class="lab">Why a raw fBm looks flat</span>
      <p>A sum of several independent values is more concentrated than any one
      of them — the central limit, doing what it always does — so five octaves
      of a uniform hash cluster hard around the middle. Read that straight into
      a two-colour ramp and you get grey mush, which is the reason most first
      attempts at this look like nothing. The shader opens the distribution
      with a <code>smoothstep</code> before it reads it, and says so in a
      comment, because a hidden contrast curve is the sort of thing that gets
      copied into the next piece without the reason.</p></div>

    <p>The sum is divided by the amplitudes actually used, not by a constant.
    That is a small decision with a large consequence: it keeps gain doing one
    job. Without it, turning gain up brightens the picture as well as roughening
    it, and you cannot tell which of the two you are looking at.</p>

    <h2>What it is for</h2>

    <p>Everything downstream in this book that looks like material rather than
    like pattern is standing on this: terrain, cloud, marble, rust, the paper
    under a print. The three variants in the gallery are the standard first
    three moves — take the absolute value of a signed sum and you get
    <em>turbulence</em>, with creases where it crosses zero; invert those creases
    and you get <em>ridges</em>; ramp the whole thing steeply and you get
    <em>clouds</em>. None of them is a different algorithm. Each is one line
    applied at a different point in the same chain, which is the lesson worth
    carrying: where you do a thing decides what it means.</p>

    <p>The move that follows this one is to feed the field back into its own
    input — <code>fbm(p + fbm(p))</code> — and that has its own chapter,
    <a href="#/21-domain-warping">21 Domain warping</a>, because warping the
    input and distorting the output are two different operations that look
    superficially alike.</p>`,

  /* --- the build-up ------------------------------------------------------ */
  stages: [
    { label: 'one wave', note: 'amplitude is the multiplier; frequency is what multiplies x',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

const float TAU = 6.28318530718;

// A curve drawn on paper: ink where the row is close to y, a wash below it.
vec3 draw(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float line = 1.0 - smoothstep(0.0, 0.007, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.10;
    return mix(mix(paper, ink, body), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float amplitude = 0.25;
    float frequency = 1.0;

    // One wave. Everything else in this chapter is a sum of these.
    float y = 0.5 + amplitude * sin(st.x * frequency * TAU + u_time * 0.4);

    gl_FragColor = vec4(draw(st, y), 1.0);
}` },

    { label: 'superposition', note: 'five waves, each twice as fine and half as loud — written out',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

const float TAU = 6.28318530718;

vec3 draw(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float line = 1.0 - smoothstep(0.0, 0.007, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.10;
    return mix(mix(paper, ink, body), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x + u_time * 0.03;

    // The same five terms the loop on the next stage will produce, unrolled so
    // the series is readable: frequency doubles, amplitude halves. The small
    // phase offsets stop the crests from all landing on the same column, which
    // is what makes a sum of sines read as one wave instead of as five.
    float y = 0.5
        + 0.2500 * sin(x *  1.0 * TAU + 0.0)
        + 0.1250 * sin(x *  2.0 * TAU + 1.3)
        + 0.0625 * sin(x *  4.0 * TAU + 2.7)
        + 0.0313 * sin(x *  8.0 * TAU + 0.6)
        + 0.0156 * sin(x * 16.0 * TAU + 3.9);

    gl_FragColor = vec4(draw(st, y), 1.0);
}` },

    { label: 'the loop, knobs named', note: 'lacunarity and gain as sliders, over 1-D value noise',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

float hash(float x) {
    return fract(sin(x * 127.1) * 43758.5453123);
}

// 1-D value noise: a random value per integer, eased between them.
float noise(float x) {
    float i = floor(x), f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

// Eight iterations, always. u_octaves masks the tail rather than breaking:
// GLSL ES 1.00 wants a constant bound, and the hardware pays for the whole
// loop either way.
float fbm(float x) {
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        sum  += on * amp * noise(x);
        norm += on * amp;
        x    *= u_lacunarity;      // LACUNARITY: the gap between octaves
        amp  *= u_gain;            // GAIN: how much quieter each one is
    }
    // Normalised by the amplitudes actually used, so gain changes the surface
    // and not the exposure.
    return sum / max(norm, 0.0001);
}

vec3 draw(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float line = 1.0 - smoothstep(0.0, 0.007, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.10;
    return mix(mix(paper, ink, body), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float y = 0.15 + 0.7 * fbm(st.x * 4.0 + u_time * 0.08);
    gl_FragColor = vec4(draw(st, y), 1.0);
}` },

    { label: 'two dimensions', note: 'the same loop, one line different — the destination',
      default: true,
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

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
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        sum  += on * amp * noise(p);
        norm += on * amp;
        p    *= u_lacunarity;
        amp  *= u_gain;
    }
    return sum / max(norm, 0.0001);
}

void main() {
    // Aspect-corrected, so a square feature is square and the octaves are
    // isotropic. A field stretched by the viewport is a different field.
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * 3.0;

    // A sum of several independent values is more concentrated than any of
    // them — the central limit, doing what it does — so a raw fbm() read
    // straight into a ramp is always flatter than the field really is. Open
    // the distribution before reading it, and say that you did.
    float h = smoothstep(0.24, 0.82, fbm(p + vec2(u_time * 0.03, 0.0)));

    vec3 deep  = vec3(0.078, 0.098, 0.161);
    vec3 warm  = vec3(0.612, 0.514, 0.404);
    vec3 paper = vec3(0.949, 0.933, 0.898);

    // one ramp, two stops apart: the warm mid is where the field spends most
    // of its time, so it is the colour the material actually is
    vec3 col = mix(deep, warm, smoothstep(0.0, 0.55, h));
    col = mix(col, paper, smoothstep(0.45, 1.0, h));
    gl_FragColor = vec4(col, 1.0);
}` }
  ],

  /* --- named knobs ------------------------------------------------------- */
  params: [
    { name: 'octaves', min: 1, max: 8, step: 1, value: 5,
      note: 'how many layers are summed. Detail accumulates; the loop cost does not change.' },
    { name: 'lacunarity', min: 1.2, max: 4, step: 0.01, value: 2,
      note: 'the gap in frequency between one octave and the next' },
    { name: 'gain', min: 0.15, max: 0.85, step: 0.01, value: 0.5,
      note: 'how much quieter each octave is than the one before' }
  ],

  /* --- the value, in one dimension --------------------------------------- */
  plots: [
    { title: 'One wave',
      expr: '0.5 + 0.25*sin(x*TAU + t)',
      domain: [0, 1], range: [0, 1],
      note: 'Amplitude is the number in front. Frequency is the number multiplying <code>x</code>. Drag <code>t</code> to move it; nothing else changes.' },
    { title: 'Five octaves, summed',
      expr: '0.5 + 0.25*sin(x*TAU) + 0.125*sin(x*2.0*TAU + 1.3*t) + 0.0625*sin(x*4.0*TAU + 2.7*t) + 0.031*sin(x*8.0*TAU + 0.6*t) + 0.016*sin(x*16.0*TAU + 3.9*t)',
      domain: [0, 1], range: [0, 1],
      note: 'The amplitude series is <code>0.25, 0.125, 0.0625 …</code> — each term halved, each frequency doubled. Move <code>t</code> to detune the upper octaves against the first: the large shape holds and only the surface changes, which is the whole property being bought.' }
  ],

  /* --- examples ---------------------------------------------------------- */
  examples: [
    { id: 'octaves', title: 'Five octaves', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Eight iterations, always. u_octaves masks the tail rather than breaking out:
// GLSL ES 1.00 wants a constant loop bound, and the hardware pays for the whole
// loop regardless of which lanes still care.
float fbm(vec2 p) {
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        sum  += on * amp * noise(p);
        norm += on * amp;
        p    *= u_lacunarity;      // LACUNARITY
        amp  *= u_gain;            // GAIN
    }
    // Normalised by the amplitudes actually used, so gain changes the surface
    // and not the exposure. Two jobs, kept apart.
    return sum / max(norm, 0.0001);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * 3.0;

    // A sum of several independent values is more concentrated than any of
    // them — the central limit, doing what it does — so a raw fbm() read
    // straight into a ramp is always flatter than the field really is. Open
    // the distribution before reading it, and say that you did.
    float h = smoothstep(0.24, 0.82, fbm(p + vec2(u_time * 0.03, 0.0)));

    vec3 deep  = vec3(0.078, 0.098, 0.161);
    vec3 warm  = vec3(0.612, 0.514, 0.404);
    vec3 paper = vec3(0.949, 0.933, 0.898);

    // one ramp, two stops apart: the warm mid is where the field spends most
    // of its time, so it is the colour the material actually is
    vec3 col = mix(deep, warm, smoothstep(0.0, 0.55, h));
    col = mix(col, paper, smoothstep(0.45, 1.0, h));
    gl_FragColor = vec4(col, 1.0);
}
` }
  ],

  /* --- the ladder -------------------------------------------------------- */
  exercises: [
    { rung: 'tune', text: 'Take <code>octaves</code> from 1 to 8 and watch where the detail stops arriving. Past six it is finer than a pixel: you are paying for structure you cannot see, which is the only performance argument this chapter needs.' },
    { rung: 'tune', text: 'Hold octaves at 5 and move <code>gain</code> from 0.2 to 0.8. At 0.2 there is one big shape with a little tooth on it; at 0.8 there is no dominant size at all and the surface reads as grit. Neither is more correct — but only one of them is the material you meant.' },
    { rung: 'substitute', text: 'Replace <code>on * amp * noise(p)</code> with <code>on * amp * abs(noise(p) * 2.0 - 1.0)</code>. That is turbulence: the sum is folded about zero before it accumulates, so every crossing becomes a crease. Fold it after the sum instead and you get one crease in the whole picture.' },
    { rung: 'generalise', text: 'Lift <code>ridge()</code> out as a function of its own — take the absolute value, invert it about 1.0, square it — with the octave loop unchanged. Then write the loop so the shaping function is the only thing you swap. That is the point at which you have a noise <em>library</em> rather than four copies of a loop.' },
    { rung: 'compose', text: 'Drive something that is not colour with the field: the width of a line, the spacing of a set of rules, the size of a mark on a grid. Make three of them where the field decides two things at once and the second is not a tint. If removing either one leaves the picture intact, you have a stack, not a system.' }
  ],

  /* --- variants ---------------------------------------------------------- */
  gallery: [
    { label: 'turbulence', thumb: 'turbulence.png', note: 'abs() inside the sum: every zero crossing becomes a crease',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// TURBULENCE. One character different from fbm(): the octave is folded about
// zero BEFORE it is added. Fold the finished sum instead and you get a single
// crease across the whole picture rather than a crease per octave.
float turbulence(vec2 p) {
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        sum  += on * amp * abs(noise(p) * 2.0 - 1.0);
        norm += on * amp;
        p    *= u_lacunarity;
        amp  *= u_gain;
    }
    return sum / max(norm, 0.0001);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * 3.0;
    float h = turbulence(p + vec2(u_time * 0.03, 0.0));

    vec3 deep  = vec3(0.078, 0.086, 0.117);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, deep, h), 1.0);
}` },

    { label: 'ridge', thumb: 'ridge.png', note: 'turbulence inverted and squared: the creases become the summits',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// RIDGE. Fold, invert about 1.0, square. The squaring is what sharpens the
// crest: it pushes everything that is not near the fold down, so the ridge
// line stays thin as octaves are added instead of thickening into a smear.
float ridged(vec2 p) {
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        float n  = 1.0 - abs(noise(p) * 2.0 - 1.0);
        sum  += on * amp * n * n;
        norm += on * amp;
        p    *= u_lacunarity;
        amp  *= u_gain;
    }
    return sum / max(norm, 0.0001);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * 4.0;
    float h = ridged(p + vec2(u_time * 0.02, 0.0));

    vec3 rock = vec3(0.129, 0.137, 0.149);
    vec3 lit  = vec3(0.949, 0.925, 0.882);
    gl_FragColor = vec4(mix(rock, lit, pow(h, 1.6)), 1.0);
}` },

    { label: 'clouds', thumb: 'clouds.png', note: 'the same field, ramped hard and read as coverage rather than height',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

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
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        sum  += on * amp * noise(p);
        norm += on * amp;
        p    *= u_lacunarity;
        amp  *= u_gain;
    }
    return sum / max(norm, 0.0001);
}

// CLOUDS. Nothing here is a new field. The same sum is read as COVERAGE — how
// much of the sky this column is holding — so it goes through a hard ramp and
// then decides an opacity, not a tone. The light term uses the field's own
// value a second time, which is why the tops brighten and the bases do not.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * 2.6;

    float f = fbm(p + vec2(u_time * 0.02, u_time * 0.006));
    float cover = smoothstep(0.42, 0.78, f);
    float light = smoothstep(0.40, 0.92, f);

    vec3 sky   = vec3(0.353, 0.451, 0.545);
    vec3 body  = mix(vec3(0.541, 0.565, 0.600), vec3(0.980, 0.965, 0.933), light);
    gl_FragColor = vec4(mix(sky, body, cover), 1.0);
}` }
  ],

  related: [
    { entry: '21-domain-warping', relation: 'answers',
      label: '21 Domain warping' },
    { entry: '11-noise', relation: 'source-of', label: '11 Noise' },
    { entry: '05-shaping-functions', relation: 'technique-of',
      label: '05 Shaping functions' },
    { entry: 'w1-seven-pass-band-chain', relation: 'technique-of',
      label: 'W1 Seven passes on one ridge' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/13/' },
    { label: 'Quilez — fBm', url: 'https://iquilezles.org/articles/fbm/' },
    { label: 'Quilez — domain warping', url: 'https://iquilezles.org/articles/warp/' }
  ]
});
