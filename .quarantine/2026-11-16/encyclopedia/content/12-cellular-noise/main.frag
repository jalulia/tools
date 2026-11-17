#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec2 random2(vec2 p){
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),
                        dot(p,vec2(269.5,183.3)))) * 43758.5453);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution * 5.0;
  vec2 i_st = floor(st), f_st = fract(st);
  float m_dist = 1.0;

  for(int y=-1;y<=1;y++)
  for(int x=-1;x<=1;x++){
    vec2 nb = vec2(float(x), float(y));
    vec2 p  = random2(i_st + nb);
    p = 0.5 + 0.5*sin(u_time + 6.2831*p);    // animate point
    float d = length(nb + p - f_st);
    m_dist = min(m_dist, d);
  }

  vec3 color = vec3(m_dist);
  color += 1.0 - step(0.02, m_dist);          // dot at the cores
  gl_FragColor = vec4(color, 1.0);
}
