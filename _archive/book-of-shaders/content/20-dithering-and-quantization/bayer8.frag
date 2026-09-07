#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// One more level of the same recursion: 64 thresholds instead of 16, so the
// tone steps are finer and the weave is coarser. Whether that is better is a
// judgement about viewing distance, not about quality — at arm's length the 8x8
// is smoother; at 2x zoom it is more obviously a pattern.
float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer8(gl_FragCoord.xy / max(u_pitch, 1.0));
    float r  = mix(0.5, th, clamp(u_dither, 0.0, 1.0));

    gl_FragColor = vec4(floor(c * L + r) / L, 1.0);
}
