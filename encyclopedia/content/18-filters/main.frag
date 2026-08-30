#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  vec3 c = texture2D(u_tex0, uv).rgb;

  float g = dot(c, vec3(0.299,0.587,0.114));
  vec3 gray = vec3(g);
  vec3 sepia = vec3(g)*vec3(1.07,0.85,0.62);
  float levels = 4.0;
  vec3 poster = floor(c*levels)/levels;

  // thirds of the screen
  vec3 outc = c;
  if(uv.x < 0.333)      outc = gray;
  else if(uv.x < 0.666) outc = sepia;
  else                  outc = poster;
  gl_FragColor = vec4(outc, 1.0);
}
