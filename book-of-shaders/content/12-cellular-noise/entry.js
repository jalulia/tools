/* 12 Cellular noise — adapted from the book, chapter 12.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '12-cellular-noise',
  index: '12',
  order: 120,
  title: "Cellular noise",
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ["worley","voronoi","cells"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 12',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/12/',
    license: 'All rights reserved (linking and citation only)'
  },
  thumb: 'thumb.png',

  text: `
    <p>Cellular (Worley / Voronoi) noise scatters feature points across a grid and colors each pixel by distance to the <em>nearest</em> one. You get cells, scales, cracked-mud and stained-glass patterns.</p>
    <p>For speed we only check the 9 neighboring cells. The points here orbit with <code>u_time</code>, so the cells gently shimmer.</p>`,

  examples: [
    { id: 'worley', title: "Nearest-point distance", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
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
` }
  ],

  exercises: [
    { rung: 'substitute', text: "Invert with <code>1.0 - m_dist</code> and the cells turn inside out." },
    { rung: 'substitute', text: "Threshold it: replace <code>vec3(m_dist)</code> with <code>vec3(step(0.35, m_dist))</code> and the shimmer becomes hard-edged cells." },
    { rung: 'generalise', text: "Colour each cell by its own point instead of by distance — keep <code>i_st + nb</code> for the winning neighbour and hash it." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/12/' }
  ]
});
