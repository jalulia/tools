#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_radius;
uniform float u_edge;

// A disc and a ring are not two shapes. They are one distance read twice: once
// cut at the radius, once cut on both sides of a slightly larger radius. Delete
// the second reading and the first is unchanged, which is the test that says
// these are two jobs and not two copies of one.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = length(p);
    float w = max(u_edge, 0.0015);

    float disc = 1.0 - smoothstep(u_radius - w, u_radius + w, d);
    float ring = smoothstep(u_radius + 0.07 - w, u_radius + 0.07 + w, d)
               - smoothstep(u_radius + 0.09 - w, u_radius + 0.09 + w, d);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col = mix(paper, vec3(0.804, 0.267, 0.176), disc);
    col = mix(col, vec3(0.043, 0.043, 0.047), ring);
    gl_FragColor = vec4(col, 1.0);
}
