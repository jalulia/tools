/* 10 Random — rebuilt at checkpoint 4 as the chapter that carries the critique
   framework (PLAN §3, research/07 §2).

   The migrated chapter taught `fract(sin(dot(...)))` and stopped. That is the
   mechanism and none of the judgement, and it leaves the reader one line away
   from the single most common failure in computational image-making: a noise
   layer pinned over a finished picture, caused by nothing, moving with nothing.

   Every asset for the argument is a real file with a line number:
     KLS-02  corpus/repos/Ki-Landscapes/index.html:116-131 + :120-123
             mean-preserving tooth, and the author's own note saying why
     MIR-15  mir-gallery/artifacts/harmonic-field.html:565-572
             fract(sin(dot(...))) added to rgb across the whole frame, as the
             last pass after bloom and tone mapping
     MIR-19  mir-gallery/artifacts/harmoniac.html:535-557
             full-frame getImageData -> Math.random() on every 8th byte ->
             putImageData, every frame, unseeded

   The removal test is run on the page rather than described. */
Shell.registerEntry({
  id: '10-random',
  index: '10',
  order: 100,
  title: 'Random',
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ['hash', 'deterministic', 'grain', 'removal test'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 10',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/10/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The hash and the chapter are the book’s. The argument after it — tooth against film, and the removal test — is ours, and every case in it is a file in this studio’s own repositories.'
  },
  thumb: 'thumb.png',

  text: `
    <p>A GPU has no random number generator and would not want one. A shader is
    asked the same question at millions of points at once and has to answer each
    without consulting the others, so the only kind of randomness available is
    the kind you can compute from the position: take the coordinate, multiply it
    by something awkward, run it through a function that varies fast, and keep
    the part that has lost all memory of the input's order. That is a
    <strong>hash</strong>. It looks like noise and it is not noise — it is a
    function. Same coordinate, same value, on every machine, forever.</p>

    <p>That property is not a technicality. It is the difference between a
    picture you can reproduce and a picture you cannot. Feed a hash the cell
    index and every cell has a stable value; feed it the pixel and every pixel
    does; feed it the clock and you have given up the only guarantee the
    technique had.</p>

    <h2>The part the book does not get to</h2>

    <p>Once you can make a random value per pixel, the obvious next move is to
    add a little of it to the finished picture. It looks like film. It looks
    like paper. It looks, to be honest, like almost anything is better with it,
    and that impression is worth about four minutes of scepticism.</p>

    <p>Compare the last two stages above. They differ in three lines. One is a
    <em>tooth</em>: the grain is centred on mid-grey, so it perturbs luminance
    upward as often as downward and the mean of the image survives; its
    coordinate is offset by the same scroll that moves the material, so it
    travels with the surface it belongs to; and it is a function of position,
    so it is the same every time you open the page. The other is a
    <em>film</em>: it multiplies, so it can only ever darken; it is pinned to
    the viewport, so the material slides underneath it; and it is reseeded from
    the clock, so it boils, and no two frames agree about what the surface is.</p>

    <div class="note"><span class="lab">Where those two come from</span>
      <p>Both are real. The tooth is <code>Ki-Landscapes/index.html:116–131</code>,
      applied per depth band and offset by that band's own parallax. The film is
      <code>harmonic-field.html:565–572</code> — a full-frame hash added to rgb
      as the last pass after bloom and tone mapping — and
      <code>harmoniac.html:535–557</code>, which reads the whole frame back to
      the CPU every frame to do it with <code>Math.random()</code>.</p></div>

    <h2>The removal test, run in public</h2>

    <p>The test is one question asked of every layer: <em>what specifically
    collapses if this is removed?</em> Not "it looks less rich" — what stops
    working.</p>

    <p>Remove the tooth and the surface goes plastic: the flat regions read as
    fills rather than as a material with a mean and a variance, and the
    banding in the ramp becomes visible because there is nothing left to break
    it up. Something specific collapses, so it stays. Remove the film and the
    image is identical except in mood, which is the definition of the layer
    that should go — and this is the direction in which the failure is
    diagnosable rather than a matter of taste. The vibe stack does not fail
    because it is ugly. It fails because nothing in it is answerable.</p>

    <p>The two shaders you are switching between are the same picture. That is
    the point: the grain is not the variable, the <em>coupling</em> is.</p>`,

  /* --- the build-up ------------------------------------------------------ */
  stages: [
    { label: 'the hash', note: 'a function that has lost its memory of order',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

// The classic. dot() collapses two coordinates into one number; sin() varies
// so fast that neighbouring inputs land far apart; fract() throws away the
// part that still remembers the input's magnitude. Nothing here is random —
// this is a function, and that is the whole value of it.
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(vec3(hash(st)), 1.0);
}` },

    { label: 'one value per cell', note: 'floor() first: the hash is fed an index, not a position',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Quantise the position before hashing it and every cell in the grid gets
    // one stable value. This is the move that every later chapter is built on:
    // noise interpolates BETWEEN these, cellular noise measures distances to
    // points placed by these, fBm sums several grids of them at once.
    vec2 cell = floor(st * 18.0);
    gl_FragColor = vec4(vec3(hash(cell)), 1.0);
}` },

    { label: 'a tooth', note: 'centred on mid-grey, and travelling with the material', default: true,
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tooth;
uniform float u_pitch;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Soft light, per channel, about mid-grey. A blend value of exactly 0.5 leaves
// the base untouched and the curve is symmetric either side of it, so a tooth
// whose own mean is 0.5 perturbs luminance both ways and the mean of the image
// survives. That is what makes this a tooth rather than a dirty film, and it
// is the whole of the difference.
float softLight(float a, float b) {
    return (b < 0.5) ? (2.0 * a * b + a * a * (1.0 - 2.0 * b))
                     : (2.0 * a * (1.0 - b) + sqrt(a) * (2.0 * b - 1.0));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // ---- the material: one slow swell, scrolling ----
    float scroll = u_time * 0.05;
    float land   = 0.62 - 0.24 * sin((st.x + scroll) * 3.2) - 0.10 * sin((st.x + scroll) * 7.7);
    float body   = 1.0 - smoothstep(land - 0.06, land + 0.01, st.y);
    // The ground is a ramp, not a fill, so the tooth can be judged across a
    // range of tones rather than against one — which is the only way to see
    // that it perturbs both ways.
    vec3  ground = mix(vec3(0.180, 0.212, 0.216), vec3(0.404, 0.443, 0.416),
                       smoothstep(0.0, land, st.y));
    vec3  col    = mix(vec3(0.925, 0.910, 0.871), ground, body);

    // ---- the tooth ----
    // Its coordinate is offset by the SAME scroll that moves the land, so the
    // surface texture travels with the surface. Pin it to the viewport instead
    // and the material slides underneath its own grain.
    vec2  gp = gl_FragCoord.xy / max(u_pitch, 0.5)
             + vec2(scroll * u_resolution.x / max(u_pitch, 0.5), 0.0);
    float g  = hash(floor(gp));

    // 0.5 + (g - 0.5) * amount keeps the blend centred on mid-grey whatever the
    // amount is: turning the tooth up roughens the surface and does not darken
    // it. One knob, one job.
    float b = 0.5 + (g - 0.5) * u_tooth;
    col = vec3(softLight(col.r, b), softLight(col.g, b), softLight(col.b, b));

    gl_FragColor = vec4(col, 1.0);
}` },

    { label: 'a film',
      note: 'the counter-example: multiplied, pinned to the viewport, reseeded from the clock',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tooth;
uniform float u_pitch;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// THE COUNTER-EXAMPLE. Same material, same hash, three lines different.
// Ship this and it will pass most reviews. It fails all five tests:
//   shared cause   nothing drives it
//   distinct jobs  it does the job the tooth already does, worse
//   order          it is last, and could be anywhere
//   single read    it adds a second thing to notice
//   removal        take it out and the image is unchanged except in mood
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float scroll = u_time * 0.05;
    float land   = 0.62 - 0.24 * sin((st.x + scroll) * 3.2) - 0.10 * sin((st.x + scroll) * 7.7);
    float body   = 1.0 - smoothstep(land - 0.06, land + 0.01, st.y);
    // The ground is a ramp, not a fill, so the tooth can be judged across a
    // range of tones rather than against one — which is the only way to see
    // that it perturbs both ways.
    vec3  ground = mix(vec3(0.180, 0.212, 0.216), vec3(0.404, 0.443, 0.416),
                       smoothstep(0.0, land, st.y));
    vec3  col    = mix(vec3(0.925, 0.910, 0.871), ground, body);

    // 1. pinned to the viewport — no scroll term, so the land slides under it
    // 2. reseeded from the clock — it boils, and cannot be reproduced
    // 3. multiplied — it has no upward half, so it can only ever darken
    vec2  gp = gl_FragCoord.xy / max(u_pitch, 0.5);
    float g  = hash(floor(gp) + floor(u_time * 24.0));

    col *= 1.0 - g * u_tooth * 0.45;

    gl_FragColor = vec4(col, 1.0);
}` }
  ],

  /* --- named knobs ------------------------------------------------------- */
  params: [
    { name: 'tooth', min: 0, max: 1, step: 0.01, value: 0.55,
      note: 'how far the grain is allowed to perturb the surface. On the tooth it roughens; on the film it darkens.' },
    { name: 'pitch', min: 1, max: 6, step: 0.5, value: 2,
      note: 'the size of one grain cell, in device pixels' }
  ],

  /* --- the value, in one dimension --------------------------------------- */
  plots: [
    { title: 'A hash is a function',
      expr: 'fract(sin(floor(x*24.0)*127.1)*43758.5453)',
      domain: [0, 1], range: [0, 1],
      note: 'Twenty-four cells, twenty-four values, and the same twenty-four every time this page is opened. Drop the <code>floor</code> and the plot fills solid — that is the per-pixel version, and it is still a function.' },
    { title: 'A tooth is centred on the surface',
      expr: '0.5 + (fract(sin(floor(x*90.0)*127.1)*43758.5453) - 0.5) * (0.15 + 0.15*sin(t))',
      domain: [0, 1], range: [0, 1],
      note: 'The same hash, re-centred: it goes above the line as often as below it. Drag <code>t</code> to take the amount up and down. The line does not move, because the mean is preserved — that is the property being bought, and it is why the surface can be roughened without being dimmed.' },
    { title: 'A film hangs below it',
      expr: '0.5 * (1.0 - fract(sin(floor(x*90.0)*127.1)*43758.5453) * (0.3 + 0.3*sin(t)))',
      domain: [0, 1], range: [0, 1],
      note: 'The same hash again, multiplied instead of centred. Every sample is at or below the surface, so turning the amount up does two things at once — it roughens <em>and</em> it darkens — and the two can no longer be separated by anyone looking at the result.' }
  ],

  /* --- examples ---------------------------------------------------------- */
  examples: [
    { id: 'static', title: 'Deterministic static', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st *= 12.0;                     // grid resolution
    float r = random(floor(st));    // one value per cell
    gl_FragColor = vec4(vec3(r), 1.0);
}
` },

    { id: 'tooth-and-film', title: 'The removal test, side by side', lane: 'glsl',
      file: 'tooth-and-film.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tooth;
uniform float u_pitch;

// One material, two treatments, one picture, so the comparison is not a memory
// test. LEFT is the tooth: centred on mid-grey, offset by the same scroll as
// the land, a function of position. RIGHT is the film: multiplied, pinned to
// the viewport, reseeded from the clock.
//
// Take u_tooth to 0 and the two halves become identical, which is the removal
// test performed with a slider. Then take it back up and watch which half you
// can still describe.

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float softLight(float a, float b) {
    return (b < 0.5) ? (2.0 * a * b + a * a * (1.0 - 2.0 * b))
                     : (2.0 * a * (1.0 - b) + sqrt(a) * (2.0 * b - 1.0));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float scroll = u_time * 0.05;
    float land   = 0.62 - 0.24 * sin((st.x + scroll) * 3.2) - 0.10 * sin((st.x + scroll) * 7.7);
    float body   = 1.0 - smoothstep(land - 0.06, land + 0.01, st.y);
    // The ground is a ramp, not a fill, so the tooth can be judged across a
    // range of tones rather than against one — which is the only way to see
    // that it perturbs both ways.
    vec3  ground = mix(vec3(0.180, 0.212, 0.216), vec3(0.404, 0.443, 0.416),
                       smoothstep(0.0, land, st.y));
    vec3  col    = mix(vec3(0.925, 0.910, 0.871), ground, body);

    float pitch = max(u_pitch, 0.5);

    if (st.x < 0.5) {
        vec2  gp = gl_FragCoord.xy / pitch
                 + vec2(scroll * u_resolution.x / pitch, 0.0);
        float b  = 0.5 + (hash(floor(gp)) - 0.5) * u_tooth;
        col = vec3(softLight(col.r, b), softLight(col.g, b), softLight(col.b, b));
    } else {
        vec2  gp = gl_FragCoord.xy / pitch;
        col *= 1.0 - hash(floor(gp) + floor(u_time * 24.0)) * u_tooth * 0.45;
    }

    // the seam, so the two halves are read as one specimen rather than two
    col = mix(col, vec3(0.043, 0.043, 0.047),
              1.0 - smoothstep(0.0, 1.5 / u_resolution.x, abs(st.x - 0.5)));

    gl_FragColor = vec4(col, 1.0);
}
` }
  ],

  /* --- the ladder -------------------------------------------------------- */
  exercises: [
    { rung: 'tune', text: 'On <em>The removal test, side by side</em>, take <code>tooth</code> to 0 and then back to 0.55. At zero the two halves are the same picture. That is the removal test, performed with a slider, and it is the only version of it that cannot be argued with.' },
    { rung: 'substitute', text: 'In the film, replace <code>floor(u_time * 24.0)</code> with <code>0.0</code>. It stops boiling, and one of the three faults is gone — it is now reproducible. It is still pinned and it still only darkens. Fixing one third of a failure is worth knowing how to do, and worth knowing is not enough.' },
    { rung: 'generalise', text: 'Write <code>float tooth(vec2 px, vec2 drift, float amount)</code> that returns a blend value centred on 0.5, and use it in both halves. Once the mean-preservation is inside a function, the only way to make the failure again is to write it on purpose.' },
    { rung: 'compose', text: 'Make a picture in which the grain amount is driven by something the picture already has — depth, slope, distance from a light, ink coverage — so that where the grain is coarse means something. Then delete the grain and write down, in one sentence, exactly what stopped working. If you cannot finish the sentence, do not put the grain back.' }
  ],

  /* --- the editorial layer ------------------------------------------------ */
  critique: {
    reads_as: 'A ground with a tooth: a single scrolling landform on stock that has a surface of its own, seen at the size a printed sheet is seen at. Not a picture with noise over it.',
    coupling: 'One scroll value drives the landform and the grain coordinate together, so the tooth travels with the material rather than sitting in front of it. One amount drives the perturbation symmetrically about mid-grey, so it changes roughness and nothing else. The hash takes the quantised device pixel, so grain size is a decision in device pixels rather than an accident of viewport.',
    pass_order: 'Material first, tooth last, and the tooth is a blend rather than an addition. Reversed — grain first, then the tonal ramp over it — the ramp averages the tooth away in the dark half and leaves it in the light half, so the surface changes character with tone for no reason anyone can name. The film in the fourth stage is also last, which is exactly why its position tells you nothing: an operator whose order does not matter is not part of a pipeline.',
    operators: ['landform (two sines)', 'tonal ramp', 'per-cell hash', 'soft-light blend about mid-grey'],
    why_it_survives: 'Remove the tooth: the flat regions read as fills, and the banding in the ramp has nothing left to break it. Something specific collapses, so it stays. Remove the film in the fourth stage and the image is unchanged except in mood — nothing collapses, so it goes. Both answers are on the page, one slider apart.',
    faults: [
      'The grain is a single octave. Real stock has fibre under the tooth; Ki-Landscapes adds a low-frequency fbm term under the per-pixel speckle for exactly that reason, and this chapter leaves it out to keep the shader to one page.',
      'sqrt() in the soft-light branch is per-channel and not cheap. At full-screen it is fine; inside a loop it would not be.',
      'The material is two sines, not a field. It is standing in for the landform so the chapter can be about the grain — which is itself the sort of substitution that should be declared rather than hoped past.'
    ]
  },

  ruling: {
    text: 'paper grain — FINE tooth, MID-GREY (128) so SOFT-LIGHT perturbs luminance both ways (mean preserved) = tooth, NOT a darkening film. razor grain — PER-PIXEL speckle (sharp 1px tooth), NOT smooth value-noise (which made soft ~2px blobs = "clunky"). — Ki-Landscapes/index.html:120',
    by: 'julia'
  },

  related: [
    { entry: '11-noise', relation: 'answers', label: '11 Noise' },
    { entry: 'w1-seven-pass-band-chain', relation: 'source-of',
      label: 'W1 Seven passes on one ridge' },
    { entry: 'w2-depth-aware-dither', relation: 'source-of',
      label: 'W2 Depth-aware dither' },
    { entry: '20-dithering-and-quantization', relation: 'technique-of',
      label: '20 Dithering and quantization' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/10/' }
  ]
});
