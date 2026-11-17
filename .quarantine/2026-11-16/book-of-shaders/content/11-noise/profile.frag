#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

float hash(float x) { return fract(sin(x * 127.1) * 43758.5453123); }
float noise(float x) {
    float i = floor(x), f = fract(x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(hash(i), hash(i + 1.0), u);
}

// Noise driving a SHAPE rather than tinting a surface. The field decides the
// height of a horizon and nothing else; every other mark on the page — the
// rules, the fill, the edge — is a consequence of that one number.
//
// This is the honest use of the technique, and it is the one to reach for
// before reaching for the other one.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x * (u_resolution.x / u_resolution.y) * u_scale + u_time * u_speed;

    float h = 0.30 + 0.34 * pow(noise(x), u_contrast);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.078, 0.086, 0.110);

    // the ruled ground, which stops at the horizon rather than running under it
    float rule = 1.0 - smoothstep(0.0, 0.03, abs(fract(st.y * 26.0) - 0.5));
    float below = 1.0 - step(h, st.y);

    vec3 col = mix(paper, ink, rule * 0.16 * below);
    col = mix(col, ink, below * 0.12);
    // and the horizon itself, crisp
    col = mix(col, ink, 1.0 - smoothstep(0.0, 2.5 / u_resolution.y, abs(st.y - h)));

    gl_FragColor = vec4(col, 1.0);
}
