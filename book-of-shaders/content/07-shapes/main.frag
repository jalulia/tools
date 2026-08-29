#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  float d = distance(st, vec2(0.5));

  // filled soft circle
  float disc = 1.0 - smoothstep(0.29, 0.31, d);
  // a thin ring around it
  float ring = smoothstep(0.36, 0.37, d) - smoothstep(0.39, 0.40, d);

  vec3 color = vec3(disc) * vec3(0.85,0.32,0.26)
             + vec3(ring) * vec3(0.45,0.6,0.7);
  gl_FragColor = vec4(color, 1.0);
}
