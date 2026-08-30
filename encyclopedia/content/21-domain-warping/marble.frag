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

// Marble is not a marble function. It is a set of PARALLEL STRIPES whose
// address has been warped — sin(x) with a displaced x. The stripes carry all
// the crispness, the warp carries all the character, and the two never have to
// negotiate because they are not the same operation.
//
// Note what stays sharp: the veins have exactly the edge that sin() has. Add
// the noise to the stripe instead and that edge is the first thing to go.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.01, 0.0);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(3.1, 7.4) + t));

    float bands = sin((p.x + u_warp * 3.0 * q.x) * 6.0);
    float vein  = 1.0 - abs(bands);
    vein = pow(clamp(vein, 0.0, 1.0), 3.0);

    vec3 stone = vec3(0.878, 0.867, 0.843);
    vec3 dark  = vec3(0.192, 0.204, 0.220);
    vec3 blush = vec3(0.573, 0.400, 0.353);

    vec3 col = mix(stone, dark, vein * 0.85);
    col = mix(col, blush, clamp(q.y - 0.55, 0.0, 1.0) * u_tint);
    gl_FragColor = vec4(col, 1.0);
}
