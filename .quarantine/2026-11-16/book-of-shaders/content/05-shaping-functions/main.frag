// The identity. Nothing is being shaped, and it is here because every other
// curve in this strip is a departure from it — you cannot see a departure
// without the thing departed from.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_k;
uniform float u_bias;
uniform float u_freq;

const float TAU = 6.28318530718;

// The bench: paper, a wash under the curve, a rule at y = 0.5, and a line on
// top. It is identical in every example in this strip. The only thing that
// changes is the line marked SHAPE, which is the point of the strip.
vec3 bench(vec2 st, float y) {
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    float w    = 2.4 / u_resolution.y;
    float line = 1.0 - smoothstep(w, w * 2.4, abs(st.y - y));
    float body = (1.0 - step(y, st.y)) * 0.09;
    float rule = (1.0 - smoothstep(0.0, 1.4 / u_resolution.y, abs(st.y - 0.5))) * 0.20;
    return mix(mix(paper, ink, max(body, rule)), ink, line);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float x = st.x;
    float k = max(u_k, 0.01);

    // ---- SHAPE ----
    float y = x;

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
