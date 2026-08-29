#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

mat2 rot(float a){ return mat2(cos(a),-sin(a),sin(a),cos(a)); }
float box(vec2 st, vec2 s){
  s = vec2(0.5) - s*0.5;
  vec2 uv = smoothstep(s, s+0.02, st)*smoothstep(s, s+0.02, 1.0-st);
  return uv.x*uv.y;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st *= 5.0;              // subdivide into 5x5
  vec2 ipos = floor(st);  // which cell
  st = fract(st);         // local 0..1 inside the cell

  st -= 0.5;
  st = rot(u_time + ipos.x + ipos.y) * st;
  st += 0.5;

  float b = box(st, vec2(0.6));
  gl_FragColor = vec4(vec3(b), 1.0);
}
