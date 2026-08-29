#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2  u_resolution;
uniform float u_levels;
uniform float u_dither;
uniform float u_pitch;

// Ordered dither over a real image. The source on this stage is the scene the
// tool draws for itself — hard edges on purpose — or your own file, if you have
// pointed the Image control at one.

float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1.0 - uv.y;
    vec3 c = texture2D(u_tex0, uv).rgb;

    float L  = max(u_levels, 2.0) - 1.0;
    float th = bayer4(gl_FragCoord.xy / max(u_pitch, 1.0));
    float r  = mix(0.5, th, clamp(u_dither, 0.0, 1.0));

    // The three channels share one threshold, which is what keeps the result a
    // reproduction of a colour rather than three unrelated screens beating
    // against each other. Give each channel its own matrix offset and you have
    // invented a misregistration.
    gl_FragColor = vec4(floor(c * L + r) / L, 1.0);
}
