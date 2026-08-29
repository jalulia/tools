// One-screen halftone.
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
