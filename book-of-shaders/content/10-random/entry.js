/* 10 Random — adapted from the book, chapter 10.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '10-random',
  index: '10',
  order: 100,
  title: "Random",
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ["hash","deterministic","fract"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 10',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/10/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>GPUs have no real random number generator, so we fake one: take a coordinate, run it through a high-frequency <code>sin</code> and keep only the chaotic fractional part. Same input always gives the same output — it's <em>deterministic</em> noise.</p>
    <p>Feeding <code>floor(st)</code> in means every grid cell draws one stable random value: TV static.</p>`,

  examples: [
    { id: 'static', title: "Deterministic static", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

float random(vec2 st){
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  st *= 12.0;                  // grid resolution
  float r = random(floor(st)); // one value per cell
  gl_FragColor = vec4(vec3(r), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'substitute', text: "Remove <code>floor()</code> for a per-pixel hash." },
    { rung: 'tune', text: "Add <code>+ floor(u_time*8.0)</code> inside <code>random()</code> to reshuffle over time." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/10/' }
  ]
});
