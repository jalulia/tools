/* W2 — depth-aware dither, and its own ancestor as the before-picture.

   Adapted from MIR-11, pussyphus_prototype/src/render/dither.js:10-90 — a
   full-screen post pass that reconstructs linear depth from a three.js
   DepthTexture and then spends that one value four times. PLAN §6 flagged the
   risk: the original needs a rendered scene, a depth buffer and three.js from a
   CDN, and this stage is a single quad with none of the three. The fix, as the
   plan directs, is to rebuild it so that the depth is procedural — a scene and
   its depth computed together in one function — so that the same four
   consequences still hang off one value and the lesson survives intact.

   The second example is MIR-12,
   archive/pussyphus_v1_monolithic_825L.html:431-453 — the author's own earlier
   version of the same shader with the depth term absent. It is the removal
   test already performed, by the person who wrote both, and it is the reason
   this is a worked example rather than a demo. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  instance_of: ["depth-aware-dither", "fbm-noise-driver"],
  uses: ["bayer8","fbm-noise"],
  governed_by: ["composing-computational-material-systems"],
  id: 'w2-depth-aware-dither',
  index: 'W2',
  order: 410,
  title: 'Depth-aware dither, and its ancestor',
  section: 'worked-examples',
  status: 'canonical',
  lane: 'glsl',
  tags: ['dither', 'depth', 'compound causality', 'removal test'],
  source: {
    kind: 'adapted',
    title: 'MIR-11 — pussyphus_prototype/src/render/dither.js:10–90',
    author: 'Julia Compton',
    date: '2026',
    note: 'Rebuilt for a single quad: the depth that the original reconstructs from a DepthTexture is here computed procedurally alongside the scene it belongs to. The four consequences, their thresholds and their order are the original’s. Ancestor: archive/pussyphus_v1_monolithic_825L.html:431–453.'
  },
  thumb: 'thumb.png',

  text: `
    <p>The shader this is rebuilt from carries its own read in its third line:
    <em>Bo gets clarity. The mall gets grain. Distance dissolves.</em> That is
    one sentence about a material condition and it is not a list of effects,
    which is the difference this page exists to show.</p>

    <p>Underneath it there is one number. The original reconstructs linear depth
    from the depth buffer of a rendered frame; this version computes it in the
    same function that draws the scene, because a stage with one quad has no
    depth buffer and inventing one would have been the point at which the
    example stopped being true. Everything after that is unchanged: the same
    three zones, the same thresholds, the same four consequences, in the same
    order.</p>

    <p>The four are worth naming individually, because each does a job no other
    one does:</p>

    <ul>
      <li><strong>Dither strength</strong> rises with distance — 0.2 on the near
      subject, 0.55 in the middle ground, 0.8 in the far. Near, it is almost
      absent, so the silhouette stays clean. Far, it is most of the image, so
      the scene comes apart into grain rather than into bands.</li>
      <li><strong>Level count</strong> falls at both ends — twelve levels in the
      near environment, eight in the middle, seven on the subject, and fewer
      again in the distance. The subject is <em>more</em> posterized than the
      environment behind it, on purpose: fewer levels is a stronger read, not a
      cheaper one.</li>
      <li><strong>The scanline</strong> is a near-field artefact only. It fades
      out with the same <code>nearZone</code> that raises the level count, so
      the CRT is something the foreground has and the distance does not.</li>
      <li><strong>The vignette</strong> frames, and opens as flow rises.</li>
    </ul>

    <div class="note"><span class="lab">Two causes, both named</span>
      <p>Depth is one. <code>flow</code> — the game's own state, a scalar
      between 0 and 1 — is the other, and it moves independently: warmer
      colour, a four-tap bloom, more levels, a more open vignette, a quieter
      scanline. Two causes, five consequences, and every consequence is a
      function of a cause rather than a number someone liked.</p></div>

    <h2>The removal test, already run</h2>

    <p>The second example is not a hypothetical. It is the same shader from six
    months earlier, before the depth texture existed: a fixed level count of
    <code>10.0 + flow * 6.0</code>, a constant dither, a flat scanline over the
    whole frame. Everything else — the flow tint, the bloom, the Bayer matrix,
    the vignette — is identical, line for line.</p>

    <p>Switch between them. The ancestor is a retro filter: it is applied to the
    picture and it is the same everywhere, so it says nothing about the scene
    and the scene says nothing back. The depth-aware version is a material
    condition: the same operators, driven by something the scene has. That is
    the whole of the difference between a stack and a system, and it happens to
    be documented as two files in one repository, six months apart.</p>

    <p>The one place the rebuild is weaker than the original: there, the depth
    is real, and a character walking toward the camera drags the dither
    threshold across their own silhouette. Here the scene is static and the
    depth is a function of screen position, so the coupling is demonstrable but
    not lived. That is stated here rather than hoped past.</p>`,

  params: [
    { name: 'flow', min: 0, max: 1, step: 0.01, value: 0.25,
      note: 'the game’s own state. Warmth, bloom, level count, vignette, scanline — five consequences, one cause.' },
    { name: 'dither', min: 0, max: 1.6, step: 0.01, value: 1,
      note: 'a multiplier on the depth-derived strength. At 0 the depth still sets the level count; at 0 with the ancestor, nothing does.' },
    { name: 'pitch', min: 1, max: 5, step: 1, value: 2,
      note: 'device pixels per matrix cell' }
  ],

  examples: [
    { id: 'depth-aware', title: 'Depth-aware', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_flow;
uniform float u_dither;
uniform float u_pitch;

const float NEAR_SUBJECT = 1.2;
const float FAR          = 40.0;

/* ------------------------------------------------------------------ noise */
float hash(float x) { return fract(sin(x * 127.1) * 43758.5453123); }
float n1(float x) {
    float i = floor(x), f = fract(x);
    return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
}
float ridgeAt(float x) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * n1(x); x *= 2.0; a *= 0.5; }
    return v / 0.9375;
}

/* ---------------------------------------------------------- Bayer 4 x 4
   The original tabulates this as sixteen nested ifs. The recursion is the same
   matrix and three lines shorter, and it says why the matrix is what it is:
   each level is the level below, scaled into every cell of a 2x2. */
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

/* ------------------------------------------------------- scene and depth
   Drawn and measured in one function, so that every pixel's colour and its
   distance come from the same place and cannot disagree. In the original this
   is a rendered frame plus a DepthTexture; the contract downstream is the
   same — a colour and a linear depth in metres. */
vec3 scene(vec2 st, out float lin) {
    float ar = u_resolution.x / u_resolution.y;
    float horizon = 0.58;

    vec3 col;

    if (st.y < horizon) {
        // ---- ground plane, in perspective ----
        // depth goes as 1/(horizon - y), which is what a plane does.
        lin = clamp(0.85 / (horizon - st.y + 0.012), NEAR_SUBJECT, FAR);

        // floor markings, spaced in WORLD units, so they crowd toward the
        // horizon by themselves rather than by a hand-tuned gradient
        float rung  = smoothstep(0.42, 0.50, abs(fract(lin * 0.55) - 0.5));
        float lane  = smoothstep(0.44, 0.50, abs(fract((st.x - 0.5) * ar * 6.0) - 0.5));
        vec3  floorCol = mix(vec3(0.196, 0.208, 0.235), vec3(0.310, 0.322, 0.353), rung * 0.7);
        col = mix(floorCol, vec3(0.482, 0.443, 0.365), lane * 0.35);
    } else {
        // ---- ridge against the sky ----
        float x  = (st.x - 0.5) * ar;
        float r  = horizon + 0.20 * ridgeAt(x * 2.2 + 3.0) + 0.05 * ridgeAt(x * 7.0);
        float on = step(st.y, r);

        vec3 sky = mix(vec3(0.353, 0.404, 0.478), vec3(0.184, 0.220, 0.290),
                       smoothstep(horizon, 1.0, st.y));
        vec3 rock = vec3(0.145, 0.157, 0.180);

        lin = mix(FAR, 18.0, on);
        col = mix(sky, rock, on);
    }

    // ---- the subject, near ----
    vec2 p = (st - vec2(0.5, 0.20)) * vec2(ar, 1.0);
    float body = length(p / vec2(0.115, 0.155)) - 1.0;
    float lit  = 0.5 + 0.5 * dot(normalize(vec3(p / 0.14, 0.7)), normalize(vec3(-0.5, 0.7, 0.6)));
    if (body < 0.0) {
        lin = NEAR_SUBJECT;
        col = mix(vec3(0.298, 0.176, 0.145), vec3(0.937, 0.780, 0.588), lit);
    }

    // aerial perspective: the SAME depth, doing an optical job rather than a
    // reproduction job. Two jobs from one cause is the point; one job done
    // twice would be the fault.
    col = mix(col, vec3(0.412, 0.451, 0.514), smoothstep(8.0, 34.0, lin) * 0.55);
    return col;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 px = gl_FragCoord.xy;

    float lin;
    vec3  c = scene(st, lin);

    // ---- the three zones, from the one value ----
    float boZone   = 1.0 - smoothstep(1.0, 3.5, lin);     // the subject
    float nearZone = 1.0 - smoothstep(2.0, 8.0, lin);     // near environment
    float farFade  = smoothstep(6.0, 16.0, lin);          // the distance

    // ---- flow: warmth ----
    c.r += u_flow * 0.02;
    c.g += u_flow * 0.006;
    c.b -= u_flow * 0.008;

    // ---- flow: bloom, four taps, BEFORE quantization ----
    // After it, the taps would be averaging values that have already been
    // rounded, and the bloom would carry the banding outward with it.
    float bloom = u_flow * 0.07;
    if (bloom > 0.001) {
        float d0;
        vec2 o = vec2(0.004);
        vec3 bl = scene(st + o, d0) + scene(st - o, d0)
                + scene(st + vec2(o.x, -o.y), d0) + scene(st - vec2(o.x, -o.y), d0);
        c = mix(c, (bl * 0.25) * 1.08, bloom);
    }

    // ---- the ordered threshold ----
    float th = bayer4(px / max(u_pitch, 1.0));

    // ---- consequence 1: dither strength rises with distance ----
    float strength = mix(0.2, 0.55, 1.0 - boZone);
    strength = mix(strength, 0.8, farFade);
    strength *= u_dither;

    // ---- consequence 2: level count, from the same zones ----
    float levels = mix(8.0, 12.0, nearZone);   // fewer far away
    levels = mix(levels, 7.0, boZone);         // the subject: fewer still, and
                                               // that is CLARITY, not economy
    levels += u_flow * 5.0;

    // The offset goes in BEFORE the floor. Swap these two lines and the picture
    // is banding with speckle over it — see chapter 20, which is this argument
    // with nothing else in the frame.
    c += (th - 0.5) * strength * (1.0 / levels);
    c  = floor(c * levels + 0.5) / levels;

    // ---- consequence 3: the scanline is a near-field artefact ----
    float scan = 0.03 * (1.0 - u_flow * 0.5) * nearZone;
    c *= 1.0 - step(0.5, mod(px.y, 2.0)) * scan;

    // ---- consequence 4: the frame, opening with flow ----
    vec2 v = st * 2.0 - 1.0;
    c *= 1.0 - dot(v, v) * (0.22 - u_flow * 0.12);

    gl_FragColor = vec4(c, 1.0);
}
` },

    { id: 'ancestor', title: 'The ancestor — no depth term', lane: 'glsl', file: 'ancestor.frag',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_flow;
uniform float u_dither;
uniform float u_pitch;

// THE BEFORE-PICTURE. This is the same pass six months earlier, from
// archive/pussyphus_v1_monolithic_825L.html:431-453, before there was a depth
// texture to read. Identical scene, identical matrix, identical flow tint,
// identical bloom, identical vignette. Three things are missing and only three:
//
//   · the level count is a constant, 10.0 + flow*6.0
//   · the dither strength is a constant
//   · the scanline covers the whole frame instead of fading with distance
//
// It is a perfectly good retro filter. It is applied TO the picture, it is the
// same everywhere, and it therefore tells you nothing about the scene — which
// is precisely what the removal test is for. Switch back and forth and note
// that the difference is not quality. It is whether the treatment is caused.

const float NEAR_SUBJECT = 1.2;
const float FAR          = 40.0;

float hash(float x) { return fract(sin(x * 127.1) * 43758.5453123); }
float n1(float x) {
    float i = floor(x), f = fract(x);
    return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
}
float ridgeAt(float x) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * n1(x); x *= 2.0; a *= 0.5; }
    return v / 0.9375;
}
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

vec3 scene(vec2 st, out float lin) {
    float ar = u_resolution.x / u_resolution.y;
    float horizon = 0.58;
    vec3 col;

    if (st.y < horizon) {
        lin = clamp(0.85 / (horizon - st.y + 0.012), NEAR_SUBJECT, FAR);
        float rung = smoothstep(0.42, 0.50, abs(fract(lin * 0.55) - 0.5));
        float lane = smoothstep(0.44, 0.50, abs(fract((st.x - 0.5) * ar * 6.0) - 0.5));
        vec3 floorCol = mix(vec3(0.196, 0.208, 0.235), vec3(0.310, 0.322, 0.353), rung * 0.7);
        col = mix(floorCol, vec3(0.482, 0.443, 0.365), lane * 0.35);
    } else {
        float x  = (st.x - 0.5) * ar;
        float r  = horizon + 0.20 * ridgeAt(x * 2.2 + 3.0) + 0.05 * ridgeAt(x * 7.0);
        float on = step(st.y, r);
        vec3 sky = mix(vec3(0.353, 0.404, 0.478), vec3(0.184, 0.220, 0.290),
                       smoothstep(horizon, 1.0, st.y));
        lin = mix(FAR, 18.0, on);
        col = mix(sky, vec3(0.145, 0.157, 0.180), on);
    }

    vec2 p = (st - vec2(0.5, 0.20)) * vec2(ar, 1.0);
    float body = length(p / vec2(0.115, 0.155)) - 1.0;
    float lit  = 0.5 + 0.5 * dot(normalize(vec3(p / 0.14, 0.7)), normalize(vec3(-0.5, 0.7, 0.6)));
    if (body < 0.0) {
        lin = NEAR_SUBJECT;
        col = mix(vec3(0.298, 0.176, 0.145), vec3(0.937, 0.780, 0.588), lit);
    }
    col = mix(col, vec3(0.412, 0.451, 0.514), smoothstep(8.0, 34.0, lin) * 0.55);
    return col;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 px = gl_FragCoord.xy;

    float lin;                 // computed, and then never used again
    vec3  c = scene(st, lin);

    c.r += u_flow * 0.02;
    c.g += u_flow * 0.006;
    c.b -= u_flow * 0.008;

    float bloom = u_flow * 0.07;
    if (bloom > 0.001) {
        float d0;
        vec2 o = vec2(0.004);
        vec3 bl = scene(st + o, d0) + scene(st - o, d0)
                + scene(st + vec2(o.x, -o.y), d0) + scene(st - vec2(o.x, -o.y), d0);
        c = mix(c, (bl * 0.25) * 1.08, bloom);
    }

    float th = bayer4(px / max(u_pitch, 1.0));

    float levels = 10.0 + u_flow * 6.0;        // a constant, everywhere
    c += (th - 0.5) * u_dither * (1.0 / levels);
    c  = floor(c * levels + 0.5) / levels;

    c *= 1.0 - step(0.5, mod(px.y, 2.0)) * (0.025 * (1.0 - u_flow * 0.5));

    vec2 v = st * 2.0 - 1.0;
    c *= 1.0 - dot(v, v) * (0.22 - u_flow * 0.12);

    gl_FragColor = vec4(c, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Take <code>flow</code> from 0 to 1 on the depth-aware version and watch five things move together: the warmth, the bloom, the level count, the vignette and the scanline. Five consequences, one slider, and none of them is a second opinion about the same job.' },
    { rung: 'tune', text: 'Set <code>dither</code> to 0 on each example in turn. On the depth-aware version the depth is still doing work — the level count still falls with distance, so the far ground still bands more coarsely than the near. On the ancestor, nothing is left. That is the removal test asked of the depth term alone.' },
    { rung: 'substitute', text: 'In the depth-aware shader, swap the two lines under <em>the offset goes in BEFORE the floor</em>. Quantize first, then add the offset. You have converted the best pass in the corpus into the counter-example from chapter 20 without changing a single constant.' },
    { rung: 'generalise', text: 'Pull the three zone terms into <code>vec3 zones(float lin)</code> and return them together. Once they are one function, adding a fifth consequence means finding a zone rather than inventing a threshold — which is the difference between extending a system and adding to a pile.' },
    { rung: 'compose', text: 'Replace the depth with a different scalar the scene already has — ink coverage, distance from a focal point, time since an event — and rewire all four consequences to it. If the picture still reads as one condition, the structure was sound and the depth was one instance of it. If it falls apart, you have learned that the thresholds were tuned to metres and not to a shape.' }
  ],

  critique: {
    reads_as: 'One place, seen through one screen: a lit figure standing clear in the foreground of a room that gets grainier as it recedes, and dissolves at the back. Not a scene with a dither pass on it.',
    coupling: 'Two named causes and nothing else. Linear depth drives dither strength, level count, scanline visibility and aerial fog — four consequences, three thresholds, all from one number that the scene function produces alongside the colour. Flow drives warmth, bloom, level count and vignette aperture. The two causes overlap on exactly one consequence, the level count, and that overlap is deliberate: it is where the game’s state is allowed to argue with the room.',
    pass_order: 'Scene and depth together, then flow tint, then bloom, then the ordered offset, then the floor, then the scanline, then the vignette. Two of those positions are load-bearing. Bloom must precede quantization: after it, the four taps average values that have already been rounded and the bloom spreads the banding rather than the light. The dither offset must precede the floor: after it, every band edge stays where it was and the matrix becomes texture over banding. The scanline and the vignette are last because they are the screen and the frame, and they are the only two operators here whose order could move without a consequence — which is worth noticing, because it is the honest limit of the claim.',
    operators: ['procedural scene + linear depth', 'aerial fog', 'flow tint', 'four-tap bloom', 'Bayer 4×4 offset', 'quantizer', 'scanline', 'vignette'],
    why_it_survives: 'Removal has been run on the biggest term already, by the author, six months apart: the ancestor is this shader with the depth deleted, and what collapses is the entire relationship between the treatment and the room — the picture becomes uniformly filtered and the foreground stops reading as nearer. Remove the bloom and flow loses its only optical consequence and becomes a colour grade. Remove the scanline and the near field loses the one artefact that identifies the screen it is on. Remove the vignette and nothing collapses, which is why it is the term to argue about.',
    faults: [
      'The depth is a function of screen position, so nothing moves through the zones. In the original a character walking toward the camera drags the threshold across their own silhouette; that is the demonstration this rebuild cannot make and the reason PLAN §6 called it a risk.',
      'The scene is evaluated five times when the bloom is on. In the original the bloom taps a render target; here they are re-renders, and that is the honest cost of not having one.',
      'The zone thresholds are in metres — 1.0, 3.5, 2.0, 8.0, 6.0, 16.0 — and they came from a specific room in a specific game. They are not general, and any reuse has to re-derive them rather than copy them.',
      'The vignette does not survive its own removal test cleanly. It is kept because it is the original’s and this is a port; in new work it would have to argue for itself.'
    ]
  },

  ruling: {
    // CK8 · AUDIT. Written during the build, signed 'julia', not traceable to
    // any comment in her repositories. Proposed until she makes it.
    text: 'The rebuild states in `source` that the depth is procedural and that the original reads a DepthTexture. A worked example that quietly changes its own premise is worth less than no worked example.',
    by: 'proposed',
    date: '2026-08-29'
  },

  related: [
    { entry: '20-dithering-and-quantization', relation: 'variant-of',
      label: '20 Dithering and quantization' },
    { entry: '10-random', relation: 'technique-of', label: '10 Random' }
  ],

  links: [
    { label: 'Quilez — dithering and banding', url: 'https://iquilezles.org/articles/dither/' }
  ]
});
