#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;
uniform float u_phase;

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// A rounded square, as a distance — chapter 07's field, used as an element.
float box(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);          // WHICH cell
    vec2 f  = fract(st) - 0.5;    // WHERE in it, centred

    // rotate the element by its own position: one line, and the grid stops
    // being wallpaper.
    f = rot(u_time * 0.3 + u_phase + (id.x + id.y) * 0.6) * f;

    float d = box(f, vec2(0.30), 0.06);
    float w = u_weight * 0.25;
    float ink = 1.0 - smoothstep(-w, w, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047), ink), 1.0);
}
