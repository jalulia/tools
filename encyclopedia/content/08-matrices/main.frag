#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

mat2 rotate2d(float a){
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}
float box(vec2 st, vec2 size){
  size = vec2(0.5) - size*0.5;
  vec2 uv = smoothstep(size, size+0.002, st)
          * smoothstep(size, size+0.002, vec2(1.0)-st);
  return uv.x * uv.y;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st -= 0.5;                  // origin to center
  st = rotate2d(u_time) * st; // rotate
  st += 0.5;                  // origin back

  float b = box(st, vec2(0.45));
  gl_FragColor = vec4(vec3(b) * vec3(0.86,0.4,0.32), 1.0);
}
