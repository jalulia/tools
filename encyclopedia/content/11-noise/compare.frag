#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

// LEFT: value noise. RIGHT: gradient noise. Same lattice, same scale, same
// drift. Take u_scale down to 2 or 3 and the difference is unmistakable: the
// value-noise half has its light and dark centres ON the lattice, in rows and
// columns, and the gradient half does not. Take it up to 12 and the difference
// stops being visible at all, which is the honest reason value noise is still
// worth having.
//
// The rules across both halves are level sets of each field, so you are
// comparing the SHAPE of the two rather than their tone.

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }
vec2 hash2(vec2 p) {
    float n = sin(dot(p, vec2(41.0, 289.0)));
    return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

float valueNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float gradNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    float a = dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
    float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
    float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
    float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 0.7 + 0.5;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 d  = vec2(u_time * u_speed, 0.0);

    float n = (st.x < 0.5) ? valueNoise(p + d) : gradNoise(p + d);
    n = pow(clamp(n, 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col = mix(deep, paper, n);

    // level sets, so the SHAPE is comparable and not just the tone
    float lv = 1.0 - smoothstep(0.0, 0.045, abs(fract(n * 7.0) - 0.5));
    col = mix(col, vec3(0.804, 0.267, 0.176), lv * 0.5);

    // the seam
    col = mix(col, vec3(0.043, 0.043, 0.047),
              1.0 - smoothstep(0.0, 1.5 / u_resolution.x, abs(st.x - 0.5)));

    gl_FragColor = vec4(col, 1.0);
}
