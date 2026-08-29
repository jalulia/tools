#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
  // centered, aspect-correct coordinate
  vec2 st = (gl_FragCoord.xy - 0.5*u_resolution) / u_resolution.y;
  vec2 z = st * 1.6;

  // c walks a slow circle -> the fractal morphs
  vec2 c = vec2(0.7885*cos(u_time*0.3), 0.7885*sin(u_time*0.3));

  float it = 0.0;
  const int MAX = 96;
  for(int i=0;i<MAX;i++){
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if(dot(z,z) > 4.0) break;
    it += 1.0;
  }
  float t = it / float(MAX);
  vec3 color = 0.5 + 0.5*cos(6.2831*(t + vec3(0.0,0.33,0.6)));
  gl_FragColor = vec4(color, 1.0);
}
