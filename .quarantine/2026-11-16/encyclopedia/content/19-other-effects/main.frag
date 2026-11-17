#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_tex0;
uniform float u_time;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  // wave warp
  uv.x += sin(uv.y*22.0 + u_time*2.0) * 0.006;

  // chromatic aberration, stronger near the mouse
  vec2 m = u_mouse / u_resolution; m.y = 1.0 - m.y;
  float amt = 0.004 + 0.02*distance(uv, m);
  float r = texture2D(u_tex0, uv + vec2(amt, 0.0)).r;
  float g = texture2D(u_tex0, uv).g;
  float b = texture2D(u_tex0, uv - vec2(amt, 0.0)).b;

  vec3 outc = vec3(r,g,b);
  outc *= 0.92 + 0.08*sin(uv.y*u_resolution.y*0.7); // scanlines
  gl_FragColor = vec4(outc, 1.0);
}
