/* 09 Patterns — extended at checkpoint 4.

   Upstream chapter 09 has twenty-three worked examples — Truchet tiles,
   mirrored tiles, rotated tiles, brick offsets, zigzag, marching dots. The
   licence forbids reproducing any of them and does not forbid the ideas, so
   this chapter carries six examples written here that cover the same ground.
   research/04 §3 singles out Truchet as "a five-line idea with enormous yield";
   it is the fourth chip in the strip. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '09-patterns',
  index: '09',
  order: 90,
  title: 'Patterns',
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ['fract', 'floor', 'tiling', 'truchet'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 09',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/09/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The chapter and its sequence are the book’s; the six shaders are written for this tool.'
  },
  thumb: 'thumb.png',

  text: `
    <p>Tiling is not a loop. There is no loop available — every pixel is
    answered once, alone — so repetition has to be a property of the
    <em>coordinate</em>. Multiply the position to subdivide the plane, then take
    <code>fract()</code>, and every cell is handed the same 0-to-1 coordinate as
    every other. One little program, drawn everywhere at once.</p>

    <p>The other half of the move is <code>floor()</code>, which gives the cell's
    <em>index</em>. That is what stops a tiling from being wallpaper. Feed the
    index to a hash and each cell gets a stable number of its own; use that
    number to rotate the element, to flip it, to advance its phase, and the
    pattern acquires variation without acquiring a second pattern.</p>

    <div class="note"><span class="lab">The generalisation worth having</span>
      <p>Rotate the element <em>by its own position</em>. It is one line, it
      turns a grid into a weave, and it is the idea that Truchet tiles are built
      from: identical tiles, each turned by a coin flip, producing a continuous
      curve that no single tile contains.</p></div>

    <h2>What breaks at the seams</h2>

    <p>The thing to watch in all six is the cell boundary. A pattern is judged
    at its seams: an element that runs off the edge of its cell either has to
    wrap, or has to be drawn again by the neighbour, or has to stop. Truchet
    works because its arcs meet the edge at the midpoint at a right angle every
    time, so any two neighbours connect regardless of how they were turned. The
    mirrored tiling works because reflection makes the boundary a line of
    symmetry. When a tiling looks wrong, the fault is almost always at the
    boundary and almost never in the element.</p>`,

  params: [
    { name: 'tiles', min: 2, max: 14, step: 1, value: 6,
      note: 'how many cells across the short side' },
    { name: 'weight', min: 0.02, max: 0.4, step: 0.005, value: 0.13,
      note: 'the thickness of the element, in cell units' },
    { name: 'phase', min: 0, max: 6.28, step: 0.01, value: 0,
      note: 'a constant added to every cell’s own angle — the pattern turning as one' }
  ],

  plots: [
    { title: 'fract() is the repeat',
      expr: 'fract(x * (2.0 + t))', domain: [0, 1], range: [0, 1],
      note: 'Every tiling in this chapter is this function applied to a coordinate. Drag <code>t</code> to subdivide: the ramp is unchanged, and there are simply more of it.' }
  ],

  examples: [
    { id: 'tiles', title: 'The grid', lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;
uniform float u_phase;

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// A rounded square, as a distance — chapter 07's field, used as an element.
float box(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);          // WHICH cell
    vec2 f  = fract(st) - 0.5;    // WHERE in it, centred

    // rotate the element by its own position: one line, and the grid stops
    // being wallpaper.
    f = rot(u_time * 0.3 + u_phase + (id.x + id.y) * 0.6) * f;

    float d = box(f, vec2(0.30), 0.06);
    float w = u_weight * 0.25;
    float ink = 1.0 - smoothstep(-w, w, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047), ink), 1.0);
}
` },

    { id: 'brick', title: 'Offset rows', lane: 'glsl', file: 'brick.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_tiles;
uniform float u_weight;

// A brick bond is one line: shift alternate rows by half a cell BEFORE taking
// the fractional part. The element does not know it has been offset — the
// coordinate was offset, which is the same trick as domain warping in
// chapter 21, at its simplest possible setting.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= vec2(u_tiles * 0.5, u_tiles);

    float row = floor(st.y);
    st.x += 0.5 * mod(row, 2.0);          // ← the whole bond

    vec2 f = fract(st);
    vec2 e = vec2(u_weight * 0.5, u_weight);
    float mortar = min(min(f.x, 1.0 - f.x) / e.x, min(f.y, 1.0 - f.y) / e.y);
    float ink = 1.0 - smoothstep(0.6, 1.0, mortar);

    vec3 stock = vec3(0.878, 0.855, 0.808);
    vec3 clay  = vec3(0.573, 0.318, 0.243);
    gl_FragColor = vec4(mix(clay, stock, ink), 1.0);
}
` },

    { id: 'per-cell', title: 'The index decides', lane: 'glsl', file: 'per-cell.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;
uniform float u_phase;

float hash(vec2 p) {
    return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453123);
}
mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// floor(st) is the cell index; hash it and every cell has one stable number of
// its own. Here that number does three jobs — the turn, the size and the ink —
// which is why the field reads as one population rather than as three
// overlapping patterns.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st) - 0.5;
    float h = hash(id);

    f = rot(h * 6.2831 + u_phase + u_time * 0.15 * (h - 0.5)) * f;

    float len = mix(0.18, 0.44, h);
    float w   = u_weight * 0.5;
    float d   = max(abs(f.x) - len, abs(f.y) - w);
    float ink = 1.0 - smoothstep(0.0, 0.02, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col   = mix(vec3(0.129, 0.180, 0.235), vec3(0.804, 0.267, 0.176), h);
    gl_FragColor = vec4(mix(paper, col, ink), 1.0);
}
` },

    { id: 'truchet', title: 'Truchet', lane: 'glsl', file: 'truchet.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_tiles;
uniform float u_weight;

float hash(vec2 p) {
    return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453123);
}

// TRUCHET. One tile — two quarter-arcs joining the midpoints of opposite edges
// — flipped by a coin toss per cell. Because every arc meets every edge at its
// midpoint at a right angle, ANY two neighbours connect, so the tiling produces
// long continuous curves that no single tile contains.
//
// Five lines, and it is the best argument in the book for the cell index: the
// variation is not decoration, it is what makes the curve.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st);

    // the coin toss
    if (hash(id) > 0.5) f.x = 1.0 - f.x;

    // two quarter circles of radius 0.5, centred on opposite corners
    float d = min(abs(length(f - vec2(0.0, 0.0)) - 0.5),
                  abs(length(f - vec2(1.0, 1.0)) - 0.5));

    float w = u_weight * 0.5;
    float ink = 1.0 - smoothstep(w, w + 0.02, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047), ink), 1.0);
}
` },

    { id: 'mirrored', title: 'Mirrored tiles', lane: 'glsl', file: 'mirrored.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;

// The other way to make a seam disappear: reflect alternate cells, so every
// boundary is a line of symmetry and the element does not have to wrap. The
// price is that the pattern acquires an axis — mirrored tilings always read as
// having a grain, because they do.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st);

    // abs(fract * 2 - 1) is the fold; doing it per axis mirrors alternate rows
    // AND alternate columns.
    if (mod(id.x, 2.0) > 0.5) f.x = 1.0 - f.x;
    if (mod(id.y, 2.0) > 0.5) f.y = 1.0 - f.y;

    float wave = sin((f.x * 2.4 + f.y * 1.1) * 3.1416 + u_time * 0.4);
    float w    = u_weight * 2.0;
    float ink  = 1.0 - smoothstep(w * 0.5, w, abs(wave));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.176, 0.243, 0.290), ink), 1.0);
}
` },

    { id: 'marching', title: 'Marching dots', lane: 'glsl', file: 'marching.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;
uniform float u_phase;

// The cell index as TIME. Every dot runs the same little animation, and the
// index sets how far along it is — so nothing is choreographed and a wave
// crosses the grid anyway. The diagonal is the sum of the two indices; use the
// difference for the other diagonal, or the distance from a cell for a ripple.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st) - 0.5;

    float march = u_time * 1.2 - (id.x + id.y) * 0.5 + u_phase;
    float pulse = 0.5 + 0.5 * sin(march);

    float r   = u_weight * (0.6 + 1.6 * pulse);
    float ink = 1.0 - smoothstep(r, r + 0.02, length(f));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col   = mix(vec3(0.129, 0.180, 0.235), vec3(0.804, 0.267, 0.176), pulse);
    gl_FragColor = vec4(mix(paper, col, ink), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Take <code>tiles</code> from 2 to 14 on <em>Truchet</em>. At 2 you can see the individual tile and the trick is obvious; at 14 the tiles have disappeared and what you see is a curve. The number at which one becomes the other is a composition decision and it is different on a phone.' },
    { rung: 'substitute', text: 'In <em>The index decides</em>, replace <code>hash(id)</code> with <code>hash(id * 0.5)</code>. Neighbouring cells now share values in pairs and the field grows correlated regions — the same variation, with a length scale. That is the difference between a hash and noise, and it is chapter 11.' },
    { rung: 'generalise', text: 'Write <code>vec2 cell(vec2 st, float n, out vec2 id)</code> that does the multiply, the floor and the fract in one place. Every pattern in this chapter is then three lines: get the cell, decide something from the index, draw the element. Getting the cell right once is worth more than getting it right six times.' },
    { rung: 'compose', text: 'Build a tartan: several offset stripe systems at different frequencies, over and under each other with different weights, in three inks. It is entirely made of <code>fract</code> and <code>step</code>, and the reason it is hard is that a tartan is a set of proportions rather than a set of stripes — which is a composition problem wearing a coding problem\'s clothes.' }
  ],

  related: [
    { entry: '07-shapes', relation: 'source-of', label: '07 Shapes' },
    { entry: '20-dithering-and-quantization', relation: 'answers',
      label: '20 Dithering and quantization' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/09/' }
  ]
});
