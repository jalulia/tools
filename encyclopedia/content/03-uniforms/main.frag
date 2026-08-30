#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;

void main() {
    // u_time advances every frame -> animation
    float r = abs(sin(u_time));
    float g = abs(sin(u_time * 0.7));
    float b = abs(sin(u_time * 1.3));
    gl_FragColor = vec4(r, g, b, 1.0);
}
