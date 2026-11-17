// FOUR SCREENS — written for this tool.
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
