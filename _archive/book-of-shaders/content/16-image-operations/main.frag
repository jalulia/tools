#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;
uniform float u_time;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  vec4 c = texture2D(u_tex0, uv);
  vec3 inverted = 1.0 - c.rgb;

  float seam = 0.5 + 0.25*sin(u_time);
  vec3 outc = mix(c.rgb, inverted, step(seam, uv.x));
  gl_FragColor = vec4(outc, 1.0);
}
