#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_tiles;
uniform float u_weight;

// The other way to make a seam disappear: reflect alternate cells, so every
// boundary is a line of symmetry and the element does not have to wrap. The
// price is that the pattern acquires an axis — mirrored tilings always read as
// having a grain, because they do.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= u_tiles;

    vec2 id = floor(st);
    vec2 f  = fract(st);

    // abs(fract * 2 - 1) is the fold; doing it per axis mirrors alternate rows
    // AND alternate columns.
    if (mod(id.x, 2.0) > 0.5) f.x = 1.0 - f.x;
    if (mod(id.y, 2.0) > 0.5) f.y = 1.0 - f.y;

    float wave = sin((f.x * 2.4 + f.y * 1.1) * 3.1416 + u_time * 0.4);
    float w    = u_weight * 2.0;
    float ink  = 1.0 - smoothstep(w * 0.5, w, abs(wave));

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, vec3(0.176, 0.243, 0.290), ink), 1.0);
}
