#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_sides;
uniform float u_radius;
uniform float u_edge;

// Once the position is an angle and a distance, the shape is a one-line
// function of the angle. Three terms at different multiples of the angle give
// a form that is not obviously a formula — the same trick as an octave sum,
// applied to a boundary instead of to a surface.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float r = length(p);
    float a = atan(p.y, p.x + 0.000001) + u_time * 0.15;

    float edge = u_radius * (0.78
               + 0.20 * cos(a * u_sides)
               + 0.06 * cos(a * u_sides * 2.0 + 1.1)
               + 0.03 * cos(a * u_sides * 3.0 + 2.4));

    float w = max(u_edge, 0.0015);
    float fill = 1.0 - smoothstep(edge - w, edge + w, r);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.129, 0.180, 0.235), fill), 1.0);
}
