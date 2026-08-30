// ONE SCREEN — written for this tool.
//
// The same move with one ink. Everything that is hard about reproduction is
// already here: a continuous tone on the left, and on the right a field of
// dots that has thrown away all of it except the local average.
//
// Two decisions are exposed. PITCH (cursor x) is how much the screen is allowed
// to discard — coarse enough and the picture becomes the dots. ANGLE (cursor y)
// decides whether the screen reads as texture or as stripes: at 0 and 90
// degrees the rows line up with the pixel grid and the eye locks onto them,
// which is why a single-plate press sets its screen at 45.

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_tex0;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

const float PI = 3.14159265359;

mat2 rot(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = vec2(st.x, 1.0 - st.y);
    vec3 src = texture2D(u_tex0, uv).rgb;

    if (st.x < 0.5) {
        gl_FragColor = vec4(src, 1.0);
        return;
    }

    // Rec. 709 luminance: the plate is being asked how dark this is, and the
    // three channels do not contribute equally to that question.
    float tone     = dot(src, vec3(0.2125, 0.7154, 0.0721));
    float coverage = 1.0 - tone;

    float pitch = mix(3.0, 18.0, u_mouse.x / u_resolution.x);
    float angle = radians(45.0) + (u_mouse.y / u_resolution.y - 0.5) * PI * 0.5;

    vec2 q    = rot(angle) * (gl_FragCoord.xy - 0.5 * u_resolution.xy) / pitch;
    vec2 cell = floor(q) + 0.5;
    float d   = length(q - cell);
    float r   = sqrt(max(coverage, 0.0) / PI);
    float w   = 0.75 / pitch;
    float dot_ = 1.0 - smoothstep(r - w, r + w, d);

    vec3 stock = vec3(0.968, 0.957, 0.933);
    vec3 ink   = vec3(0.078, 0.075, 0.086);
    gl_FragColor = vec4(mix(stock, ink, dot_), 1.0);
}
