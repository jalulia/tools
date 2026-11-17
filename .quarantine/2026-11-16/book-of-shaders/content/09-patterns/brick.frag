#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_tiles;
uniform float u_weight;

// A brick bond is one line: shift alternate rows by half a cell BEFORE taking
// the fractional part. The element does not know it has been offset — the
// coordinate was offset, which is the same trick as domain warping in
// chapter 21, at its simplest possible setting.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;
    st *= vec2(u_tiles * 0.5, u_tiles);

    float row = floor(st.y);
    st.x += 0.5 * mod(row, 2.0);          // ← the whole bond

    vec2 f = fract(st);
    vec2 e = vec2(u_weight * 0.5, u_weight);
    float mortar = min(min(f.x, 1.0 - f.x) / e.x, min(f.y, 1.0 - f.y) / e.y);
    float ink = 1.0 - smoothstep(0.6, 1.0, mortar);

    vec3 stock = vec3(0.878, 0.855, 0.808);
    vec3 clay  = vec3(0.573, 0.318, 0.243);
    gl_FragColor = vec4(mix(clay, stock, ink), 1.0);
}
