/* 00 Introduction — written for this tool, condensed from the book's own
   chapter 00 (README.md), which is an essay rather than a shader chapter. The
   playground this replaces had no 00 at all: it opened on "What is a shader?"
   with nothing said about why anyone would want one.

   LICENCE (decided 2026-08-29). The upstream book is all-rights-reserved: it
   permits linking and citation, not redistribution. Checkpoint 3 shipped the
   book's own two chapter-00 fragments here, by two third-party authors under
   two further sets of terms. Both are gone. The two shaders below are written
   here and make the same point — a halftone reproduction of a simple scene —
   and they are better on one axis than the pair they replace: the dots are
   area-true, so a cell that is 40% inked is 40% covered. The book is credited
   as the source of the IDEA, in `source`, and never as the source of code. No
   upstream .frag file exists anywhere in this repository. */
Shell.registerEntry({
  id: '00-introduction',
  index: '00',
  order: 0,
  title: 'Introduction',
  section: 'getting-started',
  status: 'canonical',
  lane: 'glsl',
  tags: ['halftone', 'parallel', 'reproduction'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 00',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/00/',
    license: 'All rights reserved (linking and citation only)',
    note: 'The prose is condensed from the book’s essay; the argument is the book’s. Both shaders are written here — the upstream chapter’s two fragments are by third-party authors under their own terms and are not reproduced.'
  },
  stage: { texture: true, mouse: true },
  thumb: 'thumb.png',

  text: `
    <p>The book this tool adapts opens by putting two pictures of the same thing
    side by side. One is a Van Gogh: a hand, laying paint over paint, for hours.
    The other is that painting reproduced in seconds out of four matrices of dots
    — cyan, magenta, yellow, black — every dot decided at the same moment as every
    other. The difference the authors are pointing at is not speed. It is that the
    second picture was never made step by step.</p>

    <p>A fragment shader is a program that runs once for every pixel, in parallel,
    and answers with one colour. It knows where it is and whatever you hand it, and
    nothing else: not what the pixel beside it decided, not what it decided a frame
    ago. Everything in the chapters that follow is a way of working inside that —
    turning a position into a value, and a value into a colour.</p>

    <div class="note"><span class="lab">Why the stage looks like a bench</span>
      <p>Gonzalez Vivo and Lowe call the technique a Gutenberg press for graphics.
      That is a claim about reproduction, not about speed — a plate, inked and
      pulled, against a drawing made once. This tool takes it at its word: every
      chapter is a specimen at a stated size on a neutral ground, labelled by the
      machine and explained beside it.</p></div>

    <p>The stage above is the argument, running. On the left is the source
    untouched; on the right the same source through four rotated dot screens,
    one per ink. Move the cursor: the horizontal axis sets the dot pitch and the
    vertical turns all four screens together. There is no image file — the source
    is a scene drawn procedurally by the stage, with deliberately hard edges, so
    that the chapters about convolution and quantization later on have something
    to find.</p>

    <p>The dots are area-true. A cell that is forty per cent inked gets a dot
    covering forty per cent of the cell, which means the radius goes as the
    square root of the coverage and not as the coverage. That is what a press
    does, and it is the difference between a reproduction whose midtones are
    right and one whose midtones are wrong in a way that is hard to point at.
    Chapter 20 is the same argument with the dots replaced by a threshold
    matrix.</p>

    <h2>What you need</h2>
    <p>A browser with WebGL. There is no build step, no server and no network
    request: this page opens by double-clicking the file. Every chapter is given the
    same four things — <code>u_resolution</code>, <code>u_time</code>,
    <code>u_mouse</code>, and an image on <code>u_tex0</code> — which the book
    itself does not do; it drifts between conventions chapter by chapter. Press
    <kbd>e</kbd> to open the editor. The shader recompiles as you type, and the
    compile log points at the line it means.</p>

    <h2>Whose work this is</h2>
    <p>Chapters 01 to 13, and 15, follow the book, condensed. Chapters 14, 16, 17
    and 18 are ours: upstream, all four are stubs — chapter 17 is the string
    <code>## Kernel convolutions</code> and nothing else — and 19 is listed in the
    book's contents and was never given a page. Chapters 20 and 21 are ours
    outright: the book has no dithering chapter, and the domain-warping chapter
    that its own chapter 13 promises does not exist. Every chapter states which
    it is, in the line under its title, and links the upstream chapter so you can
    check.</p>

    <p>Every shader in this tool is written here. The book is
    all-rights-reserved and permits citation rather than redistribution, so what
    is adapted is the argument — the sequence of ideas, and which idea comes
    next — and never a file. Where a chapter is built on someone else's
    technique, the technique is named and linked under <em>Elsewhere</em>.</p>

    <p>Four entries at the end are not chapters at all. They are worked
    examples: real pieces out of this studio's own repositories, ported to this
    stage, each one carrying the critique it had to survive before it could be
    shown here — what it reads as, what drives what, what order the passes are
    in, and what would collapse if any of them were removed. One of them does
    not work, on purpose.</p>

    <p>This is not a WebGL reference and it is not a maths book. It is a bench
    with the book's chapters on it, six more where the book stops, and four
    pieces of finished work with their reasoning attached.</p>`,

  examples: [
    { id: 'four-screens', title: 'Four screens, four angles', lane: 'glsl',
      file: 'main.frag',
      source: { kind: 'original', title: 'Written for this tool', author: 'Julia Compton' },
      code:
`// FOUR SCREENS — written for this tool.
//
// The book opens on a colour halftone and that idea is the book's; this shader
// is not. It is a four-plate screen written here, and it differs from the usual
// demonstration in one way that matters: the dots are AREA-TRUE. A cell that is
// forty per cent inked gets a dot covering forty per cent of the cell, because
// the radius is sqrt(coverage / PI) rather than the coverage itself. That is
// what a press does. Thresholding a tone against a raster is easier and gives
// you a picture whose midtones are wrong in a way that is hard to name.
//
// LEFT: the source, untouched. RIGHT: the same source, screened.
// Move the cursor: x sets the dot pitch, y rotates all four screens together.

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;

const float PI = 3.14159265359;

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// Ink coverage per plate. k is taken first and the three chromatic plates are
// what is left over, which is why a black area prints as one dense plate rather
// than as three overlapping ones.
vec4 rgb2cmyk(vec3 c) {
    float k = 1.0 - max(max(c.r, c.g), c.b);
    vec3 cmy = (1.0 - c - k) / max(1.0 - k, 0.0001);
    return vec4(clamp(cmy, 0.0, 1.0), k);
}

// One plate. Rotate into the screen's own frame, find the cell, and grow a dot
// at its centre whose AREA is the coverage.
float plate(vec2 px, float angle, float pitch, float coverage) {
    vec2 q    = rot(angle) * px / pitch;
    vec2 cell = floor(q) + 0.5;
    float d   = length(q - cell);
    float r   = sqrt(max(coverage, 0.0) / PI);   // area -> radius
    float w   = 0.75 / pitch;                    // ~one device pixel, in cells
    return 1.0 - smoothstep(r - w, r + w, d);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = vec2(st.x, 1.0 - st.y);

    if (st.x < 0.5) {
        gl_FragColor = vec4(texture2D(u_tex0, uv).rgb, 1.0);
        return;
    }

    // the cursor: pitch across, screen angle up
    float pitch = mix(4.0, 16.0, u_mouse.x / u_resolution.x);
    float turn  = (u_mouse.y / u_resolution.y) * PI * 0.5;

    vec4 ink = rgb2cmyk(texture2D(u_tex0, uv).rgb);
    vec2 px  = gl_FragCoord.xy - 0.5 * u_resolution.xy;

    // 15 / 75 / 0 / 45 degrees. The offsets are not decoration: four screens at
    // the same angle beat against each other and produce a moire that is
    // coarser than any of them. Set them equal and watch it appear.
    float dc = plate(px, turn + radians(15.0), pitch, ink.x);
    float dm = plate(px, turn + radians(75.0), pitch, ink.y);
    float dy = plate(px, turn + radians( 0.0), pitch, ink.z);
    float dk = plate(px, turn + radians(45.0), pitch, ink.w);

    // subtractive: each plate multiplies what the paper reflects
    vec3 col = vec3(0.968, 0.957, 0.933);
    col *= mix(vec3(1.0), vec3(0.000, 0.674, 0.933), dc);
    col *= mix(vec3(1.0), vec3(0.925, 0.000, 0.549), dm);
    col *= mix(vec3(1.0), vec3(1.000, 0.937, 0.000), dy);
    col *= mix(vec3(1.0), vec3(0.086, 0.078, 0.086), dk);

    gl_FragColor = vec4(col, 1.0);
}
` },

    { id: 'one-screen', title: 'One screen, one angle', lane: 'glsl',
      file: 'single-screen.frag',
      source: { kind: 'original', title: 'Written for this tool', author: 'Julia Compton' },
      code:
`// ONE SCREEN — written for this tool.
//
// The same move with one ink. Everything that is hard about reproduction is
// already here: a continuous tone on the left, and on the right a field of
// dots that has thrown away all of it except the local average.
//
// Two decisions are exposed. PITCH (cursor x) is how much the screen is allowed
// to discard — coarse enough and the picture becomes the dots. ANGLE (cursor y)
// decides whether the screen reads as texture or as stripes: at 0 and 90
// degrees the rows line up with the pixel grid and the eye locks onto them,
// which is why a single-plate press sets its screen at 45.

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

const float PI = 3.14159265359;

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = vec2(st.x, 1.0 - st.y);
    vec3 src = texture2D(u_tex0, uv).rgb;

    if (st.x < 0.5) {
        gl_FragColor = vec4(src, 1.0);
        return;
    }

    // Rec. 709 luminance: the plate is being asked how dark this is, and the
    // three channels do not contribute equally to that question.
    float tone     = dot(src, vec3(0.2125, 0.7154, 0.0721));
    float coverage = 1.0 - tone;

    float pitch = mix(3.0, 18.0, u_mouse.x / u_resolution.x);
    float angle = radians(45.0) + (u_mouse.y / u_resolution.y - 0.5) * PI * 0.5;

    vec2 q    = rot(angle) * (gl_FragCoord.xy - 0.5 * u_resolution.xy) / pitch;
    vec2 cell = floor(q) + 0.5;
    float d   = length(q - cell);
    float r   = sqrt(max(coverage, 0.0) / PI);
    float w   = 0.75 / pitch;
    float dot_ = 1.0 - smoothstep(r - w, r + w, d);

    vec3 stock = vec3(0.968, 0.957, 0.933);
    vec3 ink   = vec3(0.078, 0.075, 0.086);
    gl_FragColor = vec4(mix(stock, ink, dot_), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Drag the cursor across the stage. The horizontal axis is dot pitch: the one number that decides how much of the picture the screen is allowed to throw away. Take it to the coarse end and the picture becomes the dots — which is not a failure, it is a decision about viewing distance.' },
    { rung: 'tune', text: 'On <em>One screen, one angle</em>, run the cursor up and down. At 0° and 90° the rows line up with the pixel grid and the screen stops being a texture and becomes a stripe. That is why a single-plate press sets its screen at 45.' },
    { rung: 'substitute', text: 'Replace <code>sqrt(coverage / PI)</code> with <code>coverage * 0.5</code> — the dot radius proportional to the ink instead of its area. The picture still looks like a halftone and its midtones are now wrong by about fifteen per cent. Compare the two halves of the stage in a flat grey region.' },
    { rung: 'compose', text: 'Set all four angles in the first example to the same value. The moire that appears is coarser than any of the four screens that made it, and it is why those offsets exist. Then choose four angles of your own and find a set that beats worse than 15/75/0/45 — it is easier than you expect.' }
  ],

  related: [
    { entry: '20-dithering-and-quantization', relation: 'source-of',
      label: '20 Dithering and quantization' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/00/' },
    { label: 'The book’s licence — what may and may not be reproduced',
      url: 'https://github.com/patriciogonzalezvivo/thebookofshaders/blob/master/license.md' }
  ]
});
