// CMYK halftone.
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
