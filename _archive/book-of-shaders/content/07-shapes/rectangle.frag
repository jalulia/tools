#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

// The rectangle SDF. The inside term (min of the two axes, negative) and the
// outside term (length of the positive part) are separate on purpose: the
// naive max(abs(p) - b) is right inside and WRONG diagonally outside, where it
// reports the axis distance rather than the corner distance. Get that wrong and
// every downstream reading — the outline, the shadow, the union — is wrong at
// exactly the corners a reader will look at first.
float roundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = roundBox(p, vec2(u_radius * 1.4, u_radius * 0.85), 0.03);
    float w = max(u_edge, 0.0015);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);

    float fill   = 1.0 - smoothstep(-w, w, d);
    float shadow = (1.0 - smoothstep(-w, 0.05, roundBox(p - vec2(0.012, -0.012),
                        vec2(u_radius * 1.4, u_radius * 0.85), 0.03))) * 0.22;

    vec3 col = mix(paper, ink, shadow);
    col = mix(col, ink, fill);
    gl_FragColor = vec4(col, 1.0);
}
