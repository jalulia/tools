#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_scale;
uniform float u_contrast;

// TILEABLE NOISE. Wrap the lattice index with mod() before hashing it, and the
// field repeats exactly every N cells — so the right edge meets the left. It
// costs one mod and it is the difference between noise you can print as a
// repeating stock and noise you cannot.
//
// The seam is drawn on so you can check: the pattern crosses it without a
// discontinuity, which is the only proof that matters.
float hash(vec2 p, float n) {
    p = mod(p, n);                                   // ← the whole trick
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 p, float n) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0), n), hash(i + vec2(1.0, 0.0), n), u.x),
               mix(hash(i + vec2(0.0, 1.0), n), hash(i + vec2(1.0, 1.0), n), u.x), u.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float cells = max(floor(u_scale), 2.0);

    // two full periods across the stage, so the repeat is visible as a repeat
    vec2 p = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * cells * 1.2;

    float v = pow(clamp(noise(p, cells), 0.0, 1.0), u_contrast);

    vec3 deep  = vec3(0.098, 0.110, 0.145);
    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 col = mix(deep, paper, v);

    // the period boundary, marked
    float seam = 1.0 - smoothstep(0.0, 0.012, abs(fract(p.x / cells) - 0.5));
    col = mix(col, vec3(0.804, 0.267, 0.176), seam * 0.45);

    gl_FragColor = vec4(col, 1.0);
}
