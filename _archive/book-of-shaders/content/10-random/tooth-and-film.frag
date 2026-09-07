#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tooth;
uniform float u_pitch;

// One material, two treatments, one picture, so the comparison is not a memory
// test. LEFT is the tooth: centred on mid-grey, offset by the same scroll as
// the land, a function of position. RIGHT is the film: multiplied, pinned to
// the viewport, reseeded from the clock.
//
// Take u_tooth to 0 and the two halves become identical, which is the removal
// test performed with a slider. Then take it back up and watch which half you
// can still describe.

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float softLight(float a, float b) {
    return (b < 0.5) ? (2.0 * a * b + a * a * (1.0 - 2.0 * b))
                     : (2.0 * a * (1.0 - b) + sqrt(a) * (2.0 * b - 1.0));
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float scroll = u_time * 0.05;
    float land   = 0.62 - 0.24 * sin((st.x + scroll) * 3.2) - 0.10 * sin((st.x + scroll) * 7.7);
    float body   = 1.0 - smoothstep(land - 0.06, land + 0.01, st.y);
    // The ground is a ramp, not a fill, so the tooth can be judged across a
    // range of tones rather than against one — which is the only way to see
    // that it perturbs both ways.
    vec3  ground = mix(vec3(0.180, 0.212, 0.216), vec3(0.404, 0.443, 0.416),
                       smoothstep(0.0, land, st.y));
    vec3  col    = mix(vec3(0.925, 0.910, 0.871), ground, body);

    float pitch = max(u_pitch, 0.5);

    if (st.x < 0.5) {
        vec2  gp = gl_FragCoord.xy / pitch
                 + vec2(scroll * u_resolution.x / pitch, 0.0);
        float b  = 0.5 + (hash(floor(gp)) - 0.5) * u_tooth;
        col = vec3(softLight(col.r, b), softLight(col.g, b), softLight(col.b, b));
    } else {
        vec2  gp = gl_FragCoord.xy / pitch;
        col *= 1.0 - hash(floor(gp) + floor(u_time * 24.0)) * u_tooth * 0.45;
    }

    // the seam, so the two halves are read as one specimen rather than two
    col = mix(col, vec3(0.043, 0.043, 0.047),
              1.0 - smoothstep(0.0, 1.5 / u_resolution.x, abs(st.x - 0.5)));

    gl_FragColor = vec4(col, 1.0);
}
