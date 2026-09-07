#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;
uniform float u_phase;

// The cell index as TIME. Every dot runs the same little animation, and the
// index sets how far along it is — so nothing is choreographed and a wave
// crosses the grid anyway. The diagonal is the sum of the two indices; use the
// difference for the other diagonal, or the distance from a cell for a ripple.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st) - 0.5;

    float march = u_time * 1.2 - (id.x + id.y) * 0.5 + u_phase;
    float pulse = 0.5 + 0.5 * sin(march);

    float r   = u_weight * (0.6 + 1.6 * pulse);
    float ink = 1.0 - smoothstep(r, r + 0.02, length(f));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col   = mix(vec3(0.129, 0.180, 0.235), vec3(0.804, 0.267, 0.176), pulse);
    gl_FragColor = vec4(mix(paper, col, ink), 1.0);
}
