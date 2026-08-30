// THIS SHADER IS MEANT TO FAIL. It is the point of the page.
//
// Every line here is legal GLSL ES 1.00 and the fragment compiler accepts all
// of it. The program then fails to LINK, because the declaration below is a
// promise that the vertex stage will provide v_ink, and the vertex stage this
// tool supplies — a full-screen quad, two attributes, no varyings — has never
// heard of it.
//
// The stage is empty. The chip reads FAILED. The console has the driver's own
// sentence in it. That is the whole lesson: an absent picture, and one line in
// a log.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

// ↓ the promise nobody keeps
varying vec3 v_ink;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float band  = 0.5 + 0.5 * sin((st.x + st.y) * 8.0 + u_time * 0.6);
    float shade = mix(0.35, 1.0, band);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, v_ink, shade), 1.0);
}
