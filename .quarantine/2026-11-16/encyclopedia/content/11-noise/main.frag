#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

// VALUE NOISE. One random number per lattice point, bilinearly blended, with
// the cubic easing curve on both axes so the lattice lines have no crease.
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;

    float n = noise(p + vec2(u_time * u_speed, 0.0));
    n = pow(clamp(n, 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, n), 1.0);
}
