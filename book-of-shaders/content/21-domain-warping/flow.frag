#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_warp;
uniform float u_scale;
uniform float u_tint;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v / 0.96875;
}

// q is a vector and vectors have a direction. Here the SAME q does two jobs
// that are genuinely different: it displaces the ruling that draws the picture,
// and its angle tints it. Delete either and something specific is lost — the
// lines straighten, or the material stops telling you which way it is running.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.02, u_time * 0.01);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(4.7, 2.1) + t)) - 0.5;

    // a ruling, displaced
    float rule = sin((p.y + u_warp * 4.0 * q.y) * 22.0);
    float ink  = smoothstep(0.1, 0.75, abs(rule));

    // the same q, read as an angle
    float ang = atan(q.y, q.x + 0.000001);
    vec3  a   = vec3(0.196, 0.298, 0.361);
    vec3  b   = vec3(0.784, 0.412, 0.239);
    vec3  tint = mix(a, b, 0.5 + 0.5 * sin(ang));

    vec3 paper = vec3(0.941, 0.929, 0.898);
    vec3 col = mix(mix(paper, tint, u_tint * 0.8), vec3(0.086, 0.094, 0.106), 1.0 - ink);
    gl_FragColor = vec4(col, 1.0);
}
