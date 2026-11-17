#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

// A random DIRECTION per lattice point rather than a random value.
vec2 hash2(vec2 p) {
    float n = sin(dot(p, vec2(41.0, 289.0)));
    return fract(vec2(262144.0, 32768.0) * n) * 2.0 - 1.0;
}

// GRADIENT NOISE. Each corner contributes the dot product of its own random
// direction with the offset from that corner to here — so every lattice point
// evaluates to exactly zero and the extremes land BETWEEN the points. That is
// the whole difference from value noise, and it is why this one has no grid.
//
// The quintic easing is used rather than the cubic: it makes the second
// derivative continuous as well as the first, which is invisible here and very
// visible the moment you take a gradient of this field to light it.
float noise(vec2 p) {
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

    float n = noise(p + vec2(u_time * u_speed, 0.0));
    n = pow(clamp(n, 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(deep, paper, n), 1.0);
}
