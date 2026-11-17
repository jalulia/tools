// THE FIX. One qualifier gone, and one line that keeps the promise here rather
// than asking another stage to keep it.
//
// In the three.js original the repair goes the other way — the material gains
// vertexColors: true and the VERTEX shader starts providing the value. Both
// repairs are the same repair: the two halves of the contract are made to
// agree. Which half you change is an architecture decision, and it is worth
// noticing that you are making one.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

// ↓ no longer a promise about somebody else
vec3 v_ink;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // and here is the line that keeps it
    v_ink = mix(vec3(0.129, 0.180, 0.235), vec3(0.804, 0.267, 0.176), st.y);

    float band  = 0.5 + 0.5 * sin((st.x + st.y) * 8.0 + u_time * 0.6);
    float shade = mix(0.35, 1.0, band);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, v_ink, shade), 1.0);
}
