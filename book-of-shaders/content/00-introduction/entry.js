/* 00 Introduction — written for this tool, condensed from the book's own
   chapter 00 (README.md), which is an essay rather than a shader chapter. The
   playground this replaces had no 00 at all: it opened on "What is a shader?"
   with nothing said about why anyone would want one.

   The two shaders below are the two runnable fragments the book puts on that
   page. They are other people's work, named in the header of each file and in
   `source` on each example. They are lightly adapted — the adaptations are
   listed at the top of main.frag and halftone.frag and nowhere else. */
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
    license: 'CC BY-NC-SA 4.0',
    note: 'Condensed. The two shaders on that page are by other authors and are credited per example.'
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

    <p>The stage above is the argument, running. On the left is the source image
    untouched; on the right the same image through a rotated CMYK screen. Move the
    cursor: the horizontal axis sets the dot pitch and the vertical sets the screen
    angle. There is no image file — the source is a scene drawn procedurally by the
    stage, with deliberately hard edges, so that the chapters about convolution and
    quantization later on have something to find.</p>

    <h2>What you need</h2>
    <p>A browser with WebGL. There is no build step, no server and no network
    request: this page opens by double-clicking the file. Every chapter is given the
    same four things — <code>u_resolution</code>, <code>u_time</code>,
    <code>u_mouse</code>, and an image on <code>u_tex0</code> — which the book
    itself does not do; it drifts between conventions chapter by chapter. Press
    <kbd>e</kbd> to open the editor. The shader recompiles as you type, and the
    compile log points at the line it means.</p>

    <h2>Whose work this is</h2>
    <p>Chapters 01 to 13, and 15, are the book's, condensed. Chapters 14, 16, 17 and
    18 are ours: upstream, all four are stubs — chapter 17 is the string
    <code>## Kernel convolutions</code> and nothing else — and 19 is listed in the
    book's contents and was never given a page. Every chapter states which it is, in
    the line under its title, and links the upstream chapter so you can check.</p>

    <p>This is not a WebGL reference and it is not a maths book. It is a bench with
    the book's chapters on it, and four more where the book stops.</p>`,

  examples: [
    { id: 'cmyk-halftone', title: 'Four screens, four angles', lane: 'glsl',
      file: 'main.frag',
      source: { kind: 'adapted', title: 'cmyk-halftone.frag', author: 'tsone',
                url: 'https://www.shadertoy.com/view/Mdf3Dn',
                note: 'The book ships this as 00/cmyk-halftone.frag. Adapted only where GLSL ES 1.00 required it and where the stage is a different shape; see the header of main.frag.' },
      code:
`// CMYK halftone.
// Author: tsone — https://www.shadertoy.com/view/Mdf3Dn
// Reproduced in The Book of Shaders, chapter 00, as 00/cmyk-halftone.frag.
//
// Adapted here in three places and nowhere else:
//   1. S / R / ORIGIN are declared at global scope and ASSIGNED IN main().
//      The original initialises them at global scope from uniforms, which is
//      not a constant expression and is therefore not guaranteed to compile
//      under GLSL ES 1.00. Several drivers accept it. Ours must not depend on
//      which one you have.
//   2. px2uv maps drawing-buffer pixels to 0..1 across the whole stage and
//      flips y. The original maps into the top half of a 700x320 canvas,
//      because that is the shape the book's page gave it.
//   3. fc is centred on the stage rather than doubled.
// The screen — grid, dot size, the four rotated matrices at 15/75/0/45
// degrees, the CMYK round trip — is the author's, unchanged.

#ifdef GL_ES
precision mediump float;
#endif

#define DOTSIZE 1.48
#define D2R(d) radians(d)
#define MIN_S 07.5
#define MAX_S 15.0
#define SPEED 0.3

#define SST 0.888
#define SSQ 0.288

uniform sampler2D u_tex0;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2  ORIGIN;
float S;
float R;

vec4 rgb2cmyki (in vec4 c) {
    float k = max(max(c.r, c.g), c.b);
    return min(vec4(c.rgb / k, k), 1.0);
}

vec4 cmyki2rgb (in vec4 c) {
    return vec4(c.rgb * c.a, 1.0);
}

vec2 px2uv (in vec2 px) {
    return vec2(px.x, u_resolution.y - px.y) / u_resolution.xy;
}

vec2 grid (in vec2 px) {
    return px - mod(px, S);
}

vec4 ss (in vec4 v) {
    return smoothstep(SST - SSQ, SST + SSQ, v);
}

vec4 halftone (in vec2 fc, in mat2 m) {
    vec2  smp = (grid(m * fc) + 0.5 * S) * m;
    float s   = min(length(fc - smp) / (DOTSIZE * 0.5 * S), 1.0);
    vec4  c   = rgb2cmyki(texture2D(u_tex0, px2uv(smp + ORIGIN)));
    return c + s;
}

mat2 rotm (in float r) {
    float cr = cos(r);
    float sr = sin(r);
    return mat2(cr, -sr,
                sr,  cr);
}

void main() {
    ORIGIN = 0.5 * u_resolution.xy;
    S = MIN_S + (MAX_S - MIN_S) * (0.5 - 0.5 * cos(SPEED * u_time));
    R = SPEED * 0.333 * u_time;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    if (st.x > 0.5) {
        // the plate: four screens, one per ink, each at its own angle
        R = 3.14 - (u_mouse.y / u_resolution.y) * (3.14 / 180.0);
        S = 12.0 - (u_mouse.x / u_resolution.x) * 7.0;

        vec2 fc = gl_FragCoord.xy - ORIGIN;
        mat2 mc = rotm(R + D2R(15.0));
        mat2 mm = rotm(R + D2R(75.0));
        mat2 my = rotm(R);
        mat2 mk = rotm(R + D2R(45.0));

        gl_FragColor = cmyki2rgb(ss(vec4(
            halftone(fc, mc).r,
            halftone(fc, mm).g,
            halftone(fc, my).b,
            halftone(fc, mk).a
        )));
    } else {
        // the source, untouched, so the two are one picture
        gl_FragColor = texture2D(u_tex0, px2uv(gl_FragCoord.xy));
    }
}
` },

    { id: 'halftone', title: 'One screen, one angle', lane: 'glsl',
      file: 'halftone.frag',
      source: { kind: 'adapted', title: 'halftone.frag', author: 'Tomek Augustyn',
                url: 'https://github.com/og2t/HiSlope',
                note: 'The book ships this as 00/halftone.frag, ported by its author from a PixelBender kernel. Adapted only for constant-expression rules and the stage shape.' },
      code:
`// One-screen halftone.
// Author: Tomek Augustyn, 2010 — ported by him from a PixelBender kernel,
// https://github.com/og2t/HiSlope/blob/master/src/hislope/pbk/fx/halftone/Halftone.pbk
// Reproduced in The Book of Shaders, chapter 00, as 00/halftone.frag.
//
// Adapted here in two places:
//   1. PI and PI180 are const, so their initialisers are constant expressions.
//   2. the coordinate maps across the whole stage and flips y, rather than
//      into the top half of the book's 700x320 canvas.
// The raster — two cosines at 45 degrees, thresholded against luminance — is
// the author's, unchanged.

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

const float PI    = 3.1415926535897932384626433832795;
const float PI180 = PI / 180.0;

float sind (float a) { return sin(a * PI180); }
float cosd (float a) { return cos(a * PI180); }

float added (vec2 sh, float sa, float ca, vec2 c, float d) {
    return 0.5 + 0.25 * cos((sh.x * sa + sh.y * ca + c.x) * d)
               + 0.25 * cos((sh.x * ca - sh.y * sa + c.y) * d);
}

void main () {
    float threshold = 0.5;

    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.y = 1.0 - st.y;

    if (st.x > 0.5) {
        vec2 coord = st;
        vec2 rotationCenter = vec2(0.5);
        vec2 shift = coord - rotationCenter;

        // dot pitch and screen angle. Drag the cursor across the stage: the
        // pitch is the one number that decides how much of the picture the
        // screen is allowed to throw away.
        float dotSize = 3.0 + 7.0 * (u_mouse.x / u_resolution.x);
        float angle   = 45.0;

        float raster = added(shift, sind(angle), cosd(angle),
                             rotationCenter, PI / dotSize * 680.0);

        vec4  srcPixel = texture2D(u_tex0, coord);
        float avg  = 0.2125 * srcPixel.r + 0.7154 * srcPixel.g + 0.0721 * srcPixel.b;
        float gray = (raster * threshold + avg - threshold) / (1.0 - threshold);

        gl_FragColor = vec4(vec3(gray), 1.0);
    } else {
        gl_FragColor = texture2D(u_tex0, st);
    }
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Drag the cursor across the stage on the first example. The horizontal axis is dot pitch: the one number that decides how much of the picture the screen is allowed to throw away.' },
    { rung: 'substitute', text: 'In the second example, take <code>angle</code> off 45°. At 0° and 90° the screen stops being a texture and becomes a stripe — which is why print uses 45° for the black plate.' },
    { rung: 'compose', text: 'Set all four angles in the first example to the same value and look at what appears. The offsets between the plates are not decoration; they are what stops the four screens from beating against each other.' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/00/' },
    { label: 'tsone — the CMYK halftone on Shadertoy', url: 'https://www.shadertoy.com/view/Mdf3Dn' }
  ]
});
