#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_tiles;
uniform float u_weight;

float hash(vec2 p) {
    return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453123);
}

// TRUCHET. One tile — two quarter-arcs joining the midpoints of opposite edges
// — flipped by a coin toss per cell. Because every arc meets every edge at its
// midpoint at a right angle, ANY two neighbours connect, so the tiling produces
// long continuous curves that no single tile contains.
//
// Five lines, and it is the best argument in the book for the cell index: the
// variation is not decoration, it is what makes the curve.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st);

    // the coin toss
    if (hash(id) > 0.5) f.x = 1.0 - f.x;

    // two quarter circles of radius 0.5, centred on opposite corners
    float d = min(abs(length(f - vec2(0.0, 0.0)) - 0.5),
                  abs(length(f - vec2(1.0, 1.0)) - 0.5));

    float w = u_weight * 0.5;
    float ink = 1.0 - smoothstep(w, w + 0.02, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.043, 0.043, 0.047), ink), 1.0);
}
