#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_flow;
uniform float u_dither;
uniform float u_pitch;

// THE BEFORE-PICTURE. This is the same pass six months earlier, from
// archive/pussyphus_v1_monolithic_825L.html:431-453, before there was a depth
// texture to read. Identical scene, identical matrix, identical flow tint,
// identical bloom, identical vignette. Three things are missing and only three:
//
//   · the level count is a constant, 10.0 + flow*6.0
//   · the dither strength is a constant
//   · the scanline covers the whole frame instead of fading with distance
//
// It is a perfectly good retro filter. It is applied TO the picture, it is the
// same everywhere, and it therefore tells you nothing about the scene — which
// is precisely what the removal test is for. Switch back and forth and note
// that the difference is not quality. It is whether the treatment is caused.

const float NEAR_SUBJECT = 1.2;
const float FAR          = 40.0;

float hash(float x) { return fract(sin(x * 127.1) * 43758.5453123); }
float n1(float x) {
    float i = floor(x), f = fract(x);
    return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
}
float ridgeAt(float x) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * n1(x); x *= 2.0; a *= 0.5; }
    return v / 0.9375;
}
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

vec3 scene(vec2 st, out float lin) {
    float ar = u_resolution.x / u_resolution.y;
    float horizon = 0.58;
    vec3 col;

    if (st.y < horizon) {
        lin = clamp(0.85 / (horizon - st.y + 0.012), NEAR_SUBJECT, FAR);
        float rung = smoothstep(0.42, 0.50, abs(fract(lin * 0.55) - 0.5));
        float lane = smoothstep(0.44, 0.50, abs(fract((st.x - 0.5) * ar * 6.0) - 0.5));
        vec3 floorCol = mix(vec3(0.196, 0.208, 0.235), vec3(0.310, 0.322, 0.353), rung * 0.7);
        col = mix(floorCol, vec3(0.482, 0.443, 0.365), lane * 0.35);
    } else {
        float x  = (st.x - 0.5) * ar;
        float r  = horizon + 0.20 * ridgeAt(x * 2.2 + 3.0) + 0.05 * ridgeAt(x * 7.0);
        float on = step(st.y, r);
        vec3 sky = mix(vec3(0.353, 0.404, 0.478), vec3(0.184, 0.220, 0.290),
                       smoothstep(horizon, 1.0, st.y));
        lin = mix(FAR, 18.0, on);
        col = mix(sky, vec3(0.145, 0.157, 0.180), on);
    }

    vec2 p = (st - vec2(0.5, 0.20)) * vec2(ar, 1.0);
    float body = length(p / vec2(0.115, 0.155)) - 1.0;
    float lit  = 0.5 + 0.5 * dot(normalize(vec3(p / 0.14, 0.7)), normalize(vec3(-0.5, 0.7, 0.6)));
    if (body < 0.0) {
        lin = NEAR_SUBJECT;
        col = mix(vec3(0.298, 0.176, 0.145), vec3(0.937, 0.780, 0.588), lit);
    }
    col = mix(col, vec3(0.412, 0.451, 0.514), smoothstep(8.0, 34.0, lin) * 0.55);
    return col;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 px = gl_FragCoord.xy;

    float lin;                 // computed, and then never used again
    vec3  c = scene(st, lin);

    c.r += u_flow * 0.02;
    c.g += u_flow * 0.006;
    c.b -= u_flow * 0.008;

    float bloom = u_flow * 0.07;
    if (bloom > 0.001) {
        float d0;
        vec2 o = vec2(0.004);
        vec3 bl = scene(st + o, d0) + scene(st - o, d0)
                + scene(st + vec2(o.x, -o.y), d0) + scene(st - vec2(o.x, -o.y), d0);
        c = mix(c, (bl * 0.25) * 1.08, bloom);
    }

    float th = bayer4(px / max(u_pitch, 1.0));

    float levels = 10.0 + u_flow * 6.0;        // a constant, everywhere
    c += (th - 0.5) * u_dither * (1.0 / levels);
    c  = floor(c * levels + 0.5) / levels;

    c *= 1.0 - step(0.5, mod(px.y, 2.0)) * (0.025 * (1.0 - u_flow * 0.5));

    vec2 v = st * 2.0 - 1.0;
    c *= 1.0 - dot(v, v) * (0.22 - u_flow * 0.12);

    gl_FragColor = vec4(c, 1.0);
}
