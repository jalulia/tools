#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // A diagonal ramp with one hard step in it, so that both halves of the
    // stage's job — a continuous value and a decision made about it — are
    // visible before anything real is written here.
    float v = (st.x + st.y) * 0.5;
    float band = step(0.5, fract(v * 3.0 + u_time * 0.05));

    vec3 paper = vec3(0.906, 0.890, 0.851);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    gl_FragColor = vec4(mix(ink, paper, mix(v, band, 0.35)), 1.0);
}
