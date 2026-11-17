#ifdef GL_ES
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
