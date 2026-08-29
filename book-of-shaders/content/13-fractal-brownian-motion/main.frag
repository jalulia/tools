#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 st){
  return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453);
}
float noise(vec2 st){
  vec2 i = floor(st), f = fract(st);
  float a=random(i), b=random(i+vec2(1.0,0.0)),
        c=random(i+vec2(0.0,1.0)), d=random(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}

#define OCTAVES 5
float fbm(vec2 st){
  float v = 0.0, amp = 0.5;
  for(int i=0;i<OCTAVES;i++){
    v += amp * noise(st);
    st *= 2.0; amp *= 0.5;
  }
  return v;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution * 3.0;
  float f = fbm(st + u_time*0.1);
  vec3 color = mix(vec3(0.1,0.12,0.2), vec3(0.95,0.7,0.4), f);
  gl_FragColor = vec4(color, 1.0);
}
