#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;
uniform float u_time;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;                 // flip to upright
  gl_FragColor = texture2D(u_tex0, uv);
}
