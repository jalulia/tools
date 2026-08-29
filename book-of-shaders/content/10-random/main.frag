#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float random(vec2 st){
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st *= 12.0;                  // grid resolution
  float r = random(floor(st)); // one value per cell
  gl_FragColor = vec4(vec3(r), 1.0);
}
