#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_time;
uniform float u_pitch;

// A threshold matrix does not have to threshold a tone. Here it thresholds a
// TRAVELLING BAND: the front's position gives every pixel a number, the matrix
// says how far the front has to get before that pixel flips, and the result is
// a wipe that dissolves rather than sweeps. Every pixel flips exactly once, and
// which ones go early is decided by the same evenness that makes the matrix a
// good dither.
//
// The idea is from a transition in YoshiOS (index.html:46-84) where a Bayer-8
// is used as time in precisely this way. It is the only place in either corpus
// where a threshold matrix is a clock, and it is worth more than another
// gradient.
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

    // One full pass every six seconds, with a soft leading edge. lead is 1
    // where the front has already gone by and 0 ahead of it; the matrix decides
    // what happens in the band between, which is the whole transition.
    float front = fract(u_time / 6.0) * 1.6 - 0.3;
    float lead  = 1.0 - smoothstep(front - 0.22, front + 0.22, uv.y);

    float th = bayer8(gl_FragCoord.xy / max(u_pitch, 1.0));
    float on = step(th, lead);

    gl_FragColor = vec4(mix(vec3(0.086, 0.090, 0.098), c, on), 1.0);
}
