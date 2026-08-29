// The parabola with two exponents instead of one, so the rise and the fall
// can differ, normalised so the peak is still 1. This is what an attack and
// a decay look like when they are not the same length — which is nearly
// always, in anything observed rather than assumed.

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
    float a = k;
    float b = k * 2.5;
    float n = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    float y = n * pow(x, a) * pow(1.0 - x, b);

    gl_FragColor = vec4(bench(st, clamp(y, -1.0, 2.0)), 1.0);
}
