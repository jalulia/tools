#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

// Because the field is a distance and not a mask, combining two shapes is
// arithmetic on numbers rather than compositing of pictures:
//
//   union         min(a, b)      whichever surface is nearer
//   intersection  max(a, b)      the farther of the two, so both must agree
//   subtraction   max(a, -b)     b flipped inside out, then intersected
//
// A mask can only ever do the first of those, and only at the resolution it was
// rasterised at. This is why the field is the useful object.
float circle(vec2 p, vec2 c, float r) { return length(p - c) - r; }

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    float w = max(u_edge, 0.0015);

    float a = circle(p, vec2(-0.34, 0.0), u_radius);
    float b = circle(p, vec2(-0.20, 0.0), u_radius * 0.75);
    float c = circle(p, vec2( 0.06, 0.0), u_radius);
    float d = circle(p, vec2( 0.20, 0.0), u_radius * 0.75);
    float e = circle(p, vec2( 0.44, 0.0), u_radius);
    float f = circle(p, vec2( 0.58, 0.0), u_radius * 0.75);

    float uni = min(a, b);
    float sec = max(c, d);
    float sub = max(e, -f);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    vec3 col = paper;
    col = mix(col, ink, 1.0 - smoothstep(-w, w, uni));
    col = mix(col, vec3(0.804, 0.267, 0.176), 1.0 - smoothstep(-w, w, sec));
    col = mix(col, vec3(0.129, 0.180, 0.235), 1.0 - smoothstep(-w, w, sub));
    gl_FragColor = vec4(col, 1.0);
}
