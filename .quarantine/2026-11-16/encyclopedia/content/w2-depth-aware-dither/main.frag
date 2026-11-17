#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_flow;
uniform float u_dither;
uniform float u_pitch;

const float NEAR_SUBJECT = 1.2;
const float FAR          = 40.0;

/* ------------------------------------------------------------------ noise */
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

/* ---------------------------------------------------------- Bayer 4 x 4
   The original tabulates this as sixteen nested ifs. The recursion is the same
   matrix and three lines shorter, and it says why the matrix is what it is:
   each level is the level below, scaled into every cell of a 2x2. */
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

/* ------------------------------------------------------- scene and depth
   Drawn and measured in one function, so that every pixel's colour and its
   distance come from the same place and cannot disagree. In the original this
   is a rendered frame plus a DepthTexture; the contract downstream is the
   same — a colour and a linear depth in metres. */
vec3 scene(vec2 st, out float lin) {
    float ar = u_resolution.x / u_resolution.y;
    float horizon = 0.58;

    vec3 col;

    if (st.y < horizon) {
        // ---- ground plane, in perspective ----
        // depth goes as 1/(horizon - y), which is what a plane does.
        lin = clamp(0.85 / (horizon - st.y + 0.012), NEAR_SUBJECT, FAR);

        // floor markings, spaced in WORLD units, so they crowd toward the
        // horizon by themselves rather than by a hand-tuned gradient
        float rung  = smoothstep(0.42, 0.50, abs(fract(lin * 0.55) - 0.5));
        float lane  = smoothstep(0.44, 0.50, abs(fract((st.x - 0.5) * ar * 6.0) - 0.5));
        vec3  floorCol = mix(vec3(0.196, 0.208, 0.235), vec3(0.310, 0.322, 0.353), rung * 0.7);
        col = mix(floorCol, vec3(0.482, 0.443, 0.365), lane * 0.35);
    } else {
        // ---- ridge against the sky ----
        float x  = (st.x - 0.5) * ar;
        float r  = horizon + 0.20 * ridgeAt(x * 2.2 + 3.0) + 0.05 * ridgeAt(x * 7.0);
        float on = step(st.y, r);

        vec3 sky = mix(vec3(0.353, 0.404, 0.478), vec3(0.184, 0.220, 0.290),
                       smoothstep(horizon, 1.0, st.y));
        vec3 rock = vec3(0.145, 0.157, 0.180);

        lin = mix(FAR, 18.0, on);
        col = mix(sky, rock, on);
    }

    // ---- the subject, near ----
    vec2 p = (st - vec2(0.5, 0.20)) * vec2(ar, 1.0);
    float body = length(p / vec2(0.115, 0.155)) - 1.0;
    float lit  = 0.5 + 0.5 * dot(normalize(vec3(p / 0.14, 0.7)), normalize(vec3(-0.5, 0.7, 0.6)));
    if (body < 0.0) {
        lin = NEAR_SUBJECT;
        col = mix(vec3(0.298, 0.176, 0.145), vec3(0.937, 0.780, 0.588), lit);
    }

    // aerial perspective: the SAME depth, doing an optical job rather than a
    // reproduction job. Two jobs from one cause is the point; one job done
    // twice would be the fault.
    col = mix(col, vec3(0.412, 0.451, 0.514), smoothstep(8.0, 34.0, lin) * 0.55);
    return col;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 px = gl_FragCoord.xy;

    float lin;
    vec3  c = scene(st, lin);

    // ---- the three zones, from the one value ----
    float boZone   = 1.0 - smoothstep(1.0, 3.5, lin);     // the subject
    float nearZone = 1.0 - smoothstep(2.0, 8.0, lin);     // near environment
    float farFade  = smoothstep(6.0, 16.0, lin);          // the distance

    // ---- flow: warmth ----
    c.r += u_flow * 0.02;
    c.g += u_flow * 0.006;
    c.b -= u_flow * 0.008;

    // ---- flow: bloom, four taps, BEFORE quantization ----
    // After it, the taps would be averaging values that have already been
    // rounded, and the bloom would carry the banding outward with it.
    float bloom = u_flow * 0.07;
    if (bloom > 0.001) {
        float d0;
        vec2 o = vec2(0.004);
        vec3 bl = scene(st + o, d0) + scene(st - o, d0)
                + scene(st + vec2(o.x, -o.y), d0) + scene(st - vec2(o.x, -o.y), d0);
        c = mix(c, (bl * 0.25) * 1.08, bloom);
    }

    // ---- the ordered threshold ----
    float th = bayer4(px / max(u_pitch, 1.0));

    // ---- consequence 1: dither strength rises with distance ----
    float strength = mix(0.2, 0.55, 1.0 - boZone);
    strength = mix(strength, 0.8, farFade);
    strength *= u_dither;

    // ---- consequence 2: level count, from the same zones ----
    float levels = mix(8.0, 12.0, nearZone);   // fewer far away
    levels = mix(levels, 7.0, boZone);         // the subject: fewer still, and
                                               // that is CLARITY, not economy
    levels += u_flow * 5.0;

    // The offset goes in BEFORE the floor. Swap these two lines and the picture
    // is banding with speckle over it — see chapter 20, which is this argument
    // with nothing else in the frame.
    c += (th - 0.5) * strength * (1.0 / levels);
    c  = floor(c * levels + 0.5) / levels;

    // ---- consequence 3: the scanline is a near-field artefact ----
    float scan = 0.03 * (1.0 - u_flow * 0.5) * nearZone;
    c *= 1.0 - step(0.5, mod(px.y, 2.0)) * scan;

    // ---- consequence 4: the frame, opening with flow ----
    vec2 v = st * 2.0 - 1.0;
    c *= 1.0 - dot(v, v) * (0.22 - u_flow * 0.12);

    gl_FragColor = vec4(c, 1.0);
}
