#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;

float lum(vec2 uv){
  vec3 c = texture2D(u_tex0, uv).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  vec2 px = 1.0 / u_resolution;

  // Sobel gradients
  float gx =
     -lum(uv+px*vec2(-1,-1)) -2.0*lum(uv+px*vec2(-1,0)) -lum(uv+px*vec2(-1,1))
     +lum(uv+px*vec2( 1,-1)) +2.0*lum(uv+px*vec2( 1,0)) +lum(uv+px*vec2( 1,1));
  float gy =
     -lum(uv+px*vec2(-1,-1)) -2.0*lum(uv+px*vec2(0,-1)) -lum(uv+px*vec2(1,-1))
     +lum(uv+px*vec2(-1, 1)) +2.0*lum(uv+px*vec2(0, 1)) +lum(uv+px*vec2(1, 1));

  float edge = sqrt(gx*gx + gy*gy);
  gl_FragColor = vec4(vec3(edge), 1.0);
}
