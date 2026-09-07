#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 m  = u_mouse / u_resolution;

    float d = distance(st, m);
    float glow = 0.4 / (d + 0.05);
    glow *= 0.8 + 0.2 * sin(u_time * 2.0);

    vec3 color = vec3(glow) * vec3(1.0, 0.55, 0.4);
    gl_FragColor = vec4(color, 1.0);
}
