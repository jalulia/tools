#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    // normalized pixel coordinate: 0..1 in both axes
    vec2 st = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}
