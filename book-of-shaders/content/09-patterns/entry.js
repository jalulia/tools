/* 09 Patterns — adapted from the book, chapter 09.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '09-patterns',
  index: '09',
  order: 90,
  title: "Patterns",
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["fract","floor","tiling"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 09',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/09/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>Tiling repeats a space. Multiply <code>st</code> to subdivide, then take <code>fract()</code> — the fractional part — to wrap each cell back to a 0→1 coordinate. Every tile now runs the same little program.</p>
    <p><code>floor(st)</code> gives you the cell <em>index</em>, useful for varying tiles. Here we draw a rotating box inside each cell.</p>`,

  examples: [
    { id: 'tiled-boxes', title: "A grid of rotating boxes", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
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
` }
  ],

  exercises: [
    { rung: 'tune', text: "Change <code>5.0</code> to make more or fewer tiles." },
    { rung: 'generalise', text: "Use the cell index <code>ipos</code> to offset the rotation per tile, so the element is a function of where it sits." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/09/' }
  ]
});
