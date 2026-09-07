#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_octaves;
uniform float u_lacunarity;
uniform float u_gain;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Eight iterations, always. u_octaves masks the tail rather than breaking out:
// GLSL ES 1.00 wants a constant loop bound, and the hardware pays for the whole
// loop regardless of which lanes still care.
float fbm(vec2 p) {
    float sum = 0.0, amp = 0.5, norm = 0.0;
    for (int i = 0; i < 8; i++) {
        float on = step(float(i), u_octaves - 0.5);
        sum  += on * amp * noise(p);
        norm += on * amp;
        p    *= u_lacunarity;      // LACUNARITY
        amp  *= u_gain;            // GAIN
    }
    // Normalised by the amplitudes actually used, so gain changes the surface
    // and not the exposure. Two jobs, kept apart.
    return sum / max(norm, 0.0001);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = vec2(st.x * (u_resolution.x / u_resolution.y), st.y) * 3.0;

    // A sum of several independent values is more concentrated than any of
    // them — the central limit, doing what it does — so a raw fbm() read
    // straight into a ramp is always flatter than the field really is. Open
    // the distribution before reading it, and say that you did.
    float h = smoothstep(0.24, 0.82, fbm(p + vec2(u_time * 0.03, 0.0)));

    vec3 deep  = vec3(0.078, 0.098, 0.161);
    vec3 warm  = vec3(0.612, 0.514, 0.404);
    vec3 paper = vec3(0.949, 0.933, 0.898);

    // one ramp, two stops apart: the warm mid is where the field spends most
    // of its time, so it is the colour the material actually is
    vec3 col = mix(deep, warm, smoothstep(0.0, 0.55, h));
    col = mix(col, paper, smoothstep(0.45, 1.0, h));
    gl_FragColor = vec4(col, 1.0);
}
