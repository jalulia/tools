/* 07 Shapes — adapted from the book, chapter 07.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '07-shapes',
  index: '07',
  order: 70,
  title: "Shapes",
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["distance field","step","smoothstep"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 07',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/07/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>Shapes come from <em>distance fields</em>: for each pixel compute its distance to something, then threshold it. <code>distance(st, center)</code> gives a circle. <code>step()</code> makes a hard edge; <code>smoothstep()</code> makes a smooth one.</p>
    <p>Here a circle, a ring, and a soft glow are built purely from one distance value.</p>`,

  examples: [
    { id: 'disc-and-ring', title: "Disc, ring, glow", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  float d = distance(st, vec2(0.5));

  // filled soft circle
  float disc = 1.0 - smoothstep(0.29, 0.31, d);
  // a thin ring around it
  float ring = smoothstep(0.36, 0.37, d) - smoothstep(0.39, 0.40, d);

  vec3 color = vec3(disc) * vec3(0.85,0.32,0.26)
             + vec3(ring) * vec3(0.45,0.6,0.7);
  gl_FragColor = vec4(color, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Change <code>0.3</code> for size." },
    { rung: 'substitute', text: "Replace <code>distance()</code> with <code>max(abs(st.x-0.5), abs(st.y-0.5))</code> to get a square." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/07/' }
  ]
});
