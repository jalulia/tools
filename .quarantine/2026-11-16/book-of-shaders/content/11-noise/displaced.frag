#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;
uniform float u_speed;
uniform float u_contrast;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// The field moves a set of rules rather than tinting them. The rules keep the
// edge that sin() gives them — nothing has been blurred — and what changes is
// where each one is. Chapter 21 is this move taken seriously.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;

    float n = noise(p + vec2(u_time * u_speed, 0.0)) - 0.5;
    float rule = sin((st.y + n * 0.28 * u_contrast) * 78.0);
    float ink  = 1.0 - smoothstep(0.15, 0.65, abs(rule));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.078, 0.086, 0.110), ink), 1.0);
}
