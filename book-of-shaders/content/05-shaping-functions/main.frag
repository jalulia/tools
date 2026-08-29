#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

// draws a 2px-ish line where st.y == pct
float plot(vec2 st, float pct){
  return smoothstep(pct - 0.015, pct, st.y) -
         smoothstep(pct, pct + 0.015, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    // ---- the shaping function ----
    float y = smoothstep(0.1, 0.9, st.x);

    vec3 color = vec3(y);
    float line = plot(st, y);
    color = mix(color, vec3(0.36, 0.78, 0.45), line);
    gl_FragColor = vec4(color, 1.0);
}
