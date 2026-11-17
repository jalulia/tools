/* 08 Matrices — adapted from the book, chapter 08.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '08-matrices',
  index: '08',
  order: 80,
  title: "Matrices",
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["mat2","rotate","transform"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 08',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/08/',
    license: 'All rights reserved (linking and citation only)'
  },
  thumb: 'thumb.png',

  text: `
    <p>To transform space, multiply coordinates by a matrix. A 2×2 <code>mat2</code> can rotate and scale; translation is just addition. The trick: move the origin to the center, transform, then move back.</p>
    <p>Here a square is rotated by <code>u_time</code>, so it spins around the middle of the canvas.</p>`,

  examples: [
    { id: 'rotating-box', title: "A box that spins", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

mat2 rotate2d(float a){
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}
float box(vec2 st, vec2 size){
  size = vec2(0.5) - size*0.5;
  vec2 uv = smoothstep(size, size+0.002, st)
          * smoothstep(size, size+0.002, vec2(1.0)-st);
  return uv.x * uv.y;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st -= 0.5;                  // origin to center
  st = rotate2d(u_time) * st; // rotate
  st += 0.5;                  // origin back

  float b = box(st, vec2(0.45));
  gl_FragColor = vec4(vec3(b) * vec3(0.86,0.4,0.32), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Add <code>st *= 1.0 + 0.3*sin(u_time);</code> after the rotate line to pulse its scale." },
    { rung: 'tune', text: "Or translate with <code>st += vec2(0.1, 0.0);</code> and watch the origin move with it." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/08/' }
  ]
});
