#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 st){
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
}
float noise(vec2 st){
  vec2 i = floor(st), f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0,0.0));
  float c = random(i + vec2(0.0,1.0));
  float d = random(i + vec2(1.0,1.0));
  vec2 u = f*f*(3.0 - 2.0*f);          // smoothstep curve
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution * 5.0;
  float n = noise(st + u_time * 0.25);
  gl_FragColor = vec4(vec3(n), 1.0);
}
