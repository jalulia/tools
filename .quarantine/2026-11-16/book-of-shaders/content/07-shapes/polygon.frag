#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

const float TAU = 6.28318530718;

float polygon(vec2 p, float n, float r) {
    float a   = atan(p.y, p.x + 0.000001);
    float seg = TAU / n;
    return cos(floor(0.5 + a / seg) * seg - a) * length(p) - r;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = polygon(p, max(u_sides, 3.0), u_radius);
    float w = max(u_edge, 0.0015);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);

    // Four readings of one number: the fill, an outline at d = 0.045, a set of
    // level rules further out, and nothing else. The rules are the field made
    // visible — they are what tells you this is not a polygon primitive.
    float fill  = 1.0 - smoothstep(-w, w, d);
    float rule  = 1.0 - smoothstep(0.0, w * 2.0, abs(d - 0.045));
    float level = (1.0 - smoothstep(0.0, 0.05, abs(fract(d * 9.0) - 0.5)))
                * step(0.06, d);

    vec3 col = mix(paper, ink, fill);
    col = mix(col, vec3(0.804, 0.267, 0.176), rule * 0.9);
    col = mix(col, ink, level * 0.18);
    gl_FragColor = vec4(col, 1.0);
}
