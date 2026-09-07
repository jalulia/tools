#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// The other trade. A hash has no periodicity, so there is no weave anywhere —
// and no evenness either, so it clumps: two pixels that happen to draw similar
// thresholds sit next to each other and the tone goes lumpy. Compare a flat
// mid-grey region here against the 4x4 and the difference is not subtle.
//
// Real blue noise is the answer that has neither fault: a tile whose thresholds
// are arranged so that neighbours are dissimilar without the arrangement
// repeating. It costs a texture to ship, which is why this chapter does not
// have one, and it is exactly the sort of cost that should be a decision rather
// than a default.
float hash(vec2 p) {
    return fract(sin(dot(floor(p), vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = hash(gl_FragCoord.xy / max(u_pitch, 1.0));
    float r  = mix(0.5, th, clamp(u_dither, 0.0, 1.0));

    gl_FragColor = vec4(floor(c * L + r) / L, 1.0);
}
