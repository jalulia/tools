/* 07 Shapes — rebuilt at checkpoint 4.

   research/04 §3 named this the chapter most worth rebuilding: the book covers
   rectangles, circles, the distance field AS A CONCEPT, the useful properties
   of one, polar shapes, and the N-sided polygon — thirteen worked examples —
   and the migrated chapter drew a disc and a ring. The words "distance field"
   appeared in the tags and nowhere in the prose, and "SDF" appeared nowhere in
   the tool at all.

   Six examples, five stages and four variants, all written here. The book's
   argument — that a shape is a threshold taken across a field, and that the
   field is the useful object — is the book's. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '07-shapes',
  index: '07',
  order: 70,
  title: 'Shapes',
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ['distance field', 'sdf', 'polar', 'threshold'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 07',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/07/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The chapter and its sequence are the book’s. Every shader here is written for this tool; no upstream file is reproduced.'
  },
  thumb: 'thumb.png',

  text: `
    <p>A shader cannot draw a circle. It has no pen and no canvas — it is asked,
    at one pixel, what colour that pixel is, and it has to answer without
    knowing what any other pixel decided. So the way to get a shape is to answer
    a different question first: <em>how far is this pixel from the thing?</em>
    That answer is a number at every point on the plane, and a number at every
    point is a field. Threshold it and you have an edge; the shape is what the
    threshold cut out of the field.</p>

    <p>This is called a <strong>signed distance field</strong> — signed because
    the useful version is negative inside and positive outside, so the sign
    tells you which side you are on and the magnitude tells you how far. It is
    the most transferable idea in the book, and the reason is that the field
    keeps working after the shape is drawn. An outline is the same field
    thresholded twice. A glow is the field ramped instead of cut. A shadow is
    the field offset. Two shapes combined are two fields with
    <code>min</code> and <code>max</code> between them. None of those is a new
    drawing operation — they are all readings of one number.</p>

    <div class="note"><span class="lab">What an edge is</span>
      <p>An edge is not a line. It is the width over which the field crosses the
      threshold. <code>step</code> makes it zero pixels wide, which is why a
      stepped circle has staircase edges; <code>smoothstep</code> gives the
      crossing a width, and if that width is about one pixel the shape simply
      looks correct. The plot below is that decision on its own.</p></div>

    <h2>Polar, and the N-sided shape</h2>

    <p>Rectangles and circles are the two shapes you can get without thinking
    about angle. Everything else is easier in polar: convert the position to a
    distance and an angle, then let the <em>radius depend on the angle</em>.
    A constant radius is a circle. A radius that oscillates with the angle is a
    flower. A radius that follows the reciprocal of a cosine, folded into N
    equal wedges, is a regular polygon with N straight sides — which is one line
    of arithmetic, and is the fifth stage above.</p>

    <p>Watch what the <code>sides</code> slider does at the extremes. At 3 it is
    a triangle; at 9 it is visibly a nonagon; keep going and it converges on the
    circle it was always a description of. The shape is not a special case. It
    is a parameter.</p>`,

  stage: { mouse: true },

  /* --- the build-up ------------------------------------------------------ */
  stages: [
    { label: 'the field', note: 'no shape yet — just the distance, drawn as a tone',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    // Centred coordinates, aspect corrected, so one unit is one unit in both
    // directions and a circle is round.
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    // The whole idea, in one line: a number at every point on the plane.
    float d = length(p);

    // Drawn as a tone, and banded every 0.05 so the SHAPE of the field is
    // visible rather than just its brightness. Nothing has been thresholded.
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float band = 0.06 * step(0.5, fract(d * 20.0));
    gl_FragColor = vec4(mix(paper, ink, clamp(d * 1.6, 0.0, 1.0) + band), 1.0);
}` },

    { label: 'a decision', note: 'step(): the edge is zero pixels wide, and it shows',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = length(p);

    // step() answers "which side of 0.3 is this?" and nothing else. The result
    // is a shape with an edge of zero width, so every pixel is fully in or
    // fully out and the boundary staircases.
    float inside = 1.0 - step(0.3, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    gl_FragColor = vec4(mix(paper, ink, inside), 1.0);
}` },

    { label: 'an edge with a width', note: 'smoothstep(), and the width is a decision',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_edge;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = length(p);

    // The crossing is given a width. At about one pixel it reads as a clean
    // edge; wider and it reads as a soft object; at zero it is step() again.
    // The width is the only difference between a cut and a glow.
    float w = max(u_edge, 0.0015);
    float inside = 1.0 - smoothstep(0.3 - w, 0.3 + w, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    gl_FragColor = vec4(mix(paper, ink, inside), 1.0);
}` },

    { label: 'polar', note: 'let the radius depend on the angle',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_sides;
uniform float u_edge;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float r = length(p);
    float a = atan(p.y, p.x + 0.000001);

    // A radius that varies with the angle. u_sides here counts petals, which
    // is the same number doing a different job than it does on the next stage
    // — the shape is in the FUNCTION, not in the parameter.
    float wobble = u_radius * (0.72 + 0.28 * cos(a * u_sides));

    float w = max(u_edge, 0.0015);
    float inside = 1.0 - smoothstep(wobble - w, wobble + w, r);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    gl_FragColor = vec4(mix(paper, ink, inside), 1.0);
}` },

    { label: 'N sides', note: 'the same polar move, snapped to N wedges — a real SDF', default: true,
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

const float TAU = 6.28318530718;

// Regular N-sided polygon, signed: negative inside, positive outside, and the
// magnitude is a real distance so everything downstream keeps working.
//
// Fold the angle into one of N equal wedges, then measure along the wedge's
// own axis instead of along the ray to the centre. cos(snapped - a) is exactly
// that projection, and projecting onto a fixed direction is what makes the
// side straight rather than curved.
float polygon(vec2 p, float n, float r) {
    float a   = atan(p.y, p.x + 0.000001);
    float seg = TAU / n;
    return cos(floor(0.5 + a / seg) * seg - a) * length(p) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = polygon(p, max(u_sides, 3.0), u_radius);

    float w = max(u_edge, 0.0015);
    float fill = 1.0 - smoothstep(-w, w, d);
    // The field is still there after the fill, so the outline costs one more
    // reading of the same number rather than a second shape.
    float rule = (1.0 - smoothstep(0.0, w * 2.0, abs(d - 0.045)));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    vec3 col   = mix(paper, ink, fill);
    col = mix(col, vec3(0.804, 0.267, 0.176), rule * 0.9);
    gl_FragColor = vec4(col, 1.0);
}` }
  ],

  /* --- named knobs ------------------------------------------------------- */
  params: [
    { name: 'sides', min: 3, max: 9, step: 1, value: 5,
      note: 'how many wedges the angle is folded into' },
    { name: 'radius', min: 0.08, max: 0.44, step: 0.005, value: 0.28,
      note: 'the distance at which the field is cut' },
    { name: 'edge', min: 0, max: 0.06, step: 0.001, value: 0.004,
      note: 'the width of the crossing. At zero it is step(); wide, it is a glow.' }
  ],

  /* --- the value, in one dimension --------------------------------------- */
  plots: [
    { title: 'What an edge is', expr: '1.0 - smoothstep(0.3 - t*0.05, 0.3 + t*0.05, x)',
      domain: [0, 0.7], range: [0, 1],
      note: 'Ink as a function of distance. <code>x</code> is the distance from the centre; <code>t</code> widens the crossing. At <code>t = 0</code> this is a vertical cliff — that is <code>step</code>, and that is the staircase. Everything from a hard cut to a soft glow is this one number.' },
    { title: 'A polygon is a radius that depends on the angle',
      expr: '0.3 * cos(PI/5.0) / cos(mod(x*TAU + PI/5.0, TAU/5.0) - PI/5.0)',
      domain: [0, 1], range: [0, 0.5],
      note: 'The pentagon\'s radius, plotted against angle (<code>x</code> is one full turn). Five identical arcs, each bulging out to a corner and back. A circle would be a flat line at 0.3; the polygon is what happens when you divide by the cosine of the angle within a wedge.' }
  ],

  /* --- examples ---------------------------------------------------------- */
  examples: [
    { id: 'field', title: 'The field itself', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;

// The chapter's whole claim in one shader: before there is a shape there is a
// NUMBER at every point, and everything else is a reading of it. Nothing is
// thresholded here. The contours are the field's own level sets, drawn so the
// structure is visible; move the cursor and watch them travel with it.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 m  = (u_mouse / u_resolution - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = length(p - m * 0.6);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);

    float tone     = clamp(d * 1.5, 0.0, 1.0);
    float contour  = 1.0 - smoothstep(0.0, 0.04, abs(fract(d * 14.0) - 0.5));
    vec3 col = mix(paper, ink, tone * 0.85);
    col = mix(col, paper, contour * 0.35);
    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'disc-and-ring', title: 'Two thresholds, one field', lane: 'glsl', file: 'disc-ring.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

// A disc and a ring are not two shapes. They are one distance read twice: once
// cut at the radius, once cut on both sides of a slightly larger radius. Delete
// the second reading and the first is unchanged, which is the test that says
// these are two jobs and not two copies of one.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = length(p);
    float w = max(u_edge, 0.0015);

    float disc = 1.0 - smoothstep(u_radius - w, u_radius + w, d);
    float ring = smoothstep(u_radius + 0.07 - w, u_radius + 0.07 + w, d)
               - smoothstep(u_radius + 0.09 - w, u_radius + 0.09 + w, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col = mix(paper, vec3(0.804, 0.267, 0.176), disc);
    col = mix(col, vec3(0.043, 0.043, 0.047), ring);
    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'rectangle', title: 'A rectangle, as a distance', lane: 'glsl', file: 'rectangle.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

// The rectangle SDF. The inside term (min of the two axes, negative) and the
// outside term (length of the positive part) are separate on purpose: the
// naive max(abs(p) - b) is right inside and WRONG diagonally outside, where it
// reports the axis distance rather than the corner distance. Get that wrong and
// every downstream reading — the outline, the shadow, the union — is wrong at
// exactly the corners a reader will look at first.
float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = roundBox(p, vec2(u_radius * 1.4, u_radius * 0.85), 0.03);
    float w = max(u_edge, 0.0015);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);

    float fill   = 1.0 - smoothstep(-w, w, d);
    float shadow = (1.0 - smoothstep(-w, 0.05, roundBox(p - vec2(0.012, -0.012),
                        vec2(u_radius * 1.4, u_radius * 0.85), 0.03))) * 0.22;

    vec3 col = mix(paper, ink, shadow);
    col = mix(col, ink, fill);
    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'polar-petal', title: 'Polar — radius from angle', lane: 'glsl', file: 'polar.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

// Once the position is an angle and a distance, the shape is a one-line
// function of the angle. Three terms at different multiples of the angle give
// a form that is not obviously a formula — the same trick as an octave sum,
// applied to a boundary instead of to a surface.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float r = length(p);
    float a = atan(p.y, p.x + 0.000001) + u_time * 0.15;

    float edge = u_radius * (0.78
               + 0.20 * cos(a * u_sides)
               + 0.06 * cos(a * u_sides * 2.0 + 1.1)
               + 0.03 * cos(a * u_sides * 3.0 + 2.4));

    float w = max(u_edge, 0.0015);
    float fill = 1.0 - smoothstep(edge - w, edge + w, r);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.129, 0.180, 0.235), fill), 1.0);
}
` },

    { id: 'polygon', title: 'N sides', lane: 'glsl', file: 'polygon.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

const float TAU = 6.28318530718;

float polygon(vec2 p, float n, float r) {
    float a   = atan(p.y, p.x + 0.000001);
    float seg = TAU / n;
    return cos(floor(0.5 + a / seg) * seg - a) * length(p) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = polygon(p, max(u_sides, 3.0), u_radius);
    float w = max(u_edge, 0.0015);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);

    // Four readings of one number: the fill, an outline at d = 0.045, a set of
    // level rules further out, and nothing else. The rules are the field made
    // visible — they are what tells you this is not a polygon primitive.
    float fill  = 1.0 - smoothstep(-w, w, d);
    float rule  = 1.0 - smoothstep(0.0, w * 2.0, abs(d - 0.045));
    float level = (1.0 - smoothstep(0.0, 0.05, abs(fract(d * 9.0) - 0.5)))
                * step(0.06, d);

    vec3 col = mix(paper, ink, fill);
    col = mix(col, vec3(0.804, 0.267, 0.176), rule * 0.9);
    col = mix(col, ink, level * 0.18);
    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'booleans', title: 'min, max, and a hole', lane: 'glsl', file: 'booleans.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

// Because the field is a distance and not a mask, combining two shapes is
// arithmetic on numbers rather than compositing of pictures:
//
//   union         min(a, b)      whichever surface is nearer
//   intersection  max(a, b)      the farther of the two, so both must agree
//   subtraction   max(a, -b)     b flipped inside out, then intersected
//
// A mask can only ever do the first of those, and only at the resolution it was
// rasterised at. This is why the field is the useful object.
float circle(vec2 p, vec2 c, float r) { return length(p - c) - r; }

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    float w = max(u_edge, 0.0015);

    float a = circle(p, vec2(-0.34, 0.0), u_radius);
    float b = circle(p, vec2(-0.20, 0.0), u_radius * 0.75);
    float c = circle(p, vec2( 0.06, 0.0), u_radius);
    float d = circle(p, vec2( 0.20, 0.0), u_radius * 0.75);
    float e = circle(p, vec2( 0.44, 0.0), u_radius);
    float f = circle(p, vec2( 0.58, 0.0), u_radius * 0.75);

    float uni = min(a, b);
    float sec = max(c, d);
    float sub = max(e, -f);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    vec3 col = paper;
    col = mix(col, ink, 1.0 - smoothstep(-w, w, uni));
    col = mix(col, vec3(0.804, 0.267, 0.176), 1.0 - smoothstep(-w, w, sec));
    col = mix(col, vec3(0.129, 0.180, 0.235), 1.0 - smoothstep(-w, w, sub));
    gl_FragColor = vec4(col, 1.0);
}
` }
  ],

  /* --- the ladder -------------------------------------------------------- */
  exercises: [
    { rung: 'tune', text: 'Set <code>edge</code> to 0 and look at the boundary of the polygon at 1:1. That staircase is what <code>step</code> costs. Then take it to 0.05: the same field, the same threshold, and now it is a lamp rather than a plate.' },
    { rung: 'substitute', text: 'In <em>Two thresholds, one field</em>, replace <code>length(p)</code> with <code>max(abs(p.x), abs(p.y))</code>. The disc becomes a square and the ring becomes a square frame, because neither of them ever knew what shape it was drawing — they only ever knew a number.' },
    { rung: 'generalise', text: 'Write <code>float outline(float d, float at, float w)</code> that returns ink for a field at any offset, and use it for the fill, the outline and the level rules in <em>N sides</em>. Three visibly different marks from one function is the test that the field is doing the work.' },
    { rung: 'compose', text: 'Take a geometric logo — a monogram, a transit sign, a shipping mark — and rebuild it out of nothing but <code>min</code>, <code>max</code> and negation of these fields. Then make the edge width a function of position, so the mark is crisp where you want it read and soft where you want it to sit back. You will find you cannot fake that with a mask.' }
  ],

  /* --- variants ---------------------------------------------------------- */
  gallery: [
    { label: 'cross', thumb: 'cross.png', note: 'a union of two rectangles, thresholded once',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

float box(vec2 p, vec2 b) {
    vec2 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = min(box(p, vec2(u_radius * 1.5, u_radius * 0.34)),
                  box(p, vec2(u_radius * 0.34, u_radius * 1.5)));
    float w = max(u_edge, 0.0015);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047),
                            1.0 - smoothstep(-w, w, d)), 1.0);
}` },

    { label: 'star', thumb: 'star.png', note: 'the polygon fold, with the radius alternating between wedges',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

const float TAU = 6.28318530718;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float n = max(u_sides, 3.0);
    float a = atan(p.y, p.x + 0.000001);
    float r = length(p);

    // The same wedge fold as the polygon; the radius simply pulls in halfway
    // across each wedge instead of staying put.
    float seg  = TAU / n;
    float loc  = mod(a + seg * 0.5, seg) - seg * 0.5;
    float edge = u_radius * mix(0.44, 1.0, abs(loc) / (seg * 0.5));

    float w = max(u_edge, 0.0015);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047),
                            1.0 - smoothstep(edge - w, edge + w, r)), 1.0);
}` },

    { label: 'crescent', thumb: 'crescent.png', note: 'one subtraction: max(a, -b)',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float a = length(p) - u_radius;
    float b = length(p - vec2(u_radius * 0.42, u_radius * 0.20)) - u_radius * 0.92;
    float d = max(a, -b);

    float w = max(u_edge, 0.0015);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047),
                            1.0 - smoothstep(-w, w, d)), 1.0);
}` },

    { label: 'gear', thumb: 'gear.png', note: 'a polygon field with a periodic term added to the distance',
      code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

const float TAU = 6.28318530718;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float a = atan(p.y, p.x + 0.000001) + u_time * 0.2;
    float r = length(p);
    float n = max(u_sides, 3.0) * 2.0;

    // Teeth are a square wave ADDED to the radius, not a second shape drawn on
    // top. The bore is one subtraction. Two operations, one field.
    float teeth = u_radius * 0.10 * step(0.5, fract(a * n / TAU));
    float body  = r - (u_radius + teeth);
    float bore  = u_radius * 0.34 - r;
    float d     = max(body, bore);

    float w = max(u_edge, 0.0015);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047),
                            1.0 - smoothstep(-w, w, d)), 1.0);
}` }
  ],

  related: [
    { entry: '05-shaping-functions', relation: 'source-of', label: '05 Shaping functions' },
    { entry: '09-patterns', relation: 'answers', label: '09 Patterns' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/07/' },
    { label: 'Quilez — 2D distance functions', url: 'https://iquilezles.org/articles/distfunctions2d/' }
  ]
});
