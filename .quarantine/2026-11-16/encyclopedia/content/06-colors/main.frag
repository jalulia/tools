#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
#define TWO_PI 6.28318530718

vec3 hsb2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0),
                   6.0) - 3.0) - 1.0, 0.0, 1.0);
  rgb = rgb*rgb*(3.0 - 2.0*rgb);   // smooth it
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  vec2 toCenter = vec2(0.5) - st;
  float angle  = atan(toCenter.y, toCenter.x);
  float radius = length(toCenter) * 2.0;

  vec3 color = hsb2rgb(vec3((angle/TWO_PI) + 0.5, radius, 1.0));
  gl_FragColor = vec4(color, 1.0);
}
