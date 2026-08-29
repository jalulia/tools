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

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * u_scale;
    vec2 t  = vec2(u_time * 0.015, u_time * 0.004);

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t));
    vec2 r = vec2(fbm(p + u_warp * 2.0 * q + vec2(1.7, 9.2)),
                  fbm(p + u_warp * 2.0 * q + vec2(8.3, 2.8)));

    float f = fbm(p + u_warp * 2.0 * r);

    vec3 deep  = vec3(0.075, 0.094, 0.145);
    vec3 warm  = vec3(0.752, 0.478, 0.278);
    vec3 paper = vec3(0.949, 0.933, 0.898);
    vec3 col = mix(deep, paper, f);
    col = mix(col, warm, clamp(length(r) - 0.55, 0.0, 1.0) * u_tint);

    gl_FragColor = vec4(col, 1.0);
}
