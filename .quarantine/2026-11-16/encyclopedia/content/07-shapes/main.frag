#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;

// The chapter's whole claim in one shader: before there is a shape there is a
// NUMBER at every point, and everything else is a reading of it. Nothing is
// thresholded here. The contours are the field's own level sets, drawn so the
// structure is visible; move the cursor and watch them travel with it.
void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = (st - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 m  = (u_mouse / u_resolution - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float d = length(p - m * 0.6);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    vec3 ink   = vec3(0.043, 0.043, 0.047);

    float tone     = clamp(d * 1.5, 0.0, 1.0);
    float contour  = 1.0 - smoothstep(0.0, 0.04, abs(fract(d * 14.0) - 0.5));
    vec3 col = mix(paper, ink, tone * 0.85);
    col = mix(col, paper, contour * 0.35);
    gl_FragColor = vec4(col, 1.0);
}
