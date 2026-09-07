/* 02 Hello world! — adapted from the book, chapter 02.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '02-hello-world',
  index: '02',
  order: 20,
  title: "Hello world!",
  section: 'getting-started',
  status: 'canonical',
  lane: 'glsl',
  tags: ["gl_FragCoord","u_resolution","normalize"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 02',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/02/',
    license: 'All rights reserved (linking and citation only)'
  },
  thumb: 'thumb.png',

  text: `
    <p>The "hello world" of shaders is a gradient. We read <code>gl_FragCoord</code> — the pixel's position in screen space — and divide by <code>u_resolution</code> to normalize it into a 0→1 coordinate we call <code>st</code>.</p>
    <p>Now <code>st.x</code> rises left→right and <code>st.y</code> rises bottom→top. Feed them straight into the red and green channels and the position <em>becomes</em> the color.</p>`,

  examples: [
    { id: 'gradient', title: "Position as colour", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

void main() {
    // normalized pixel coordinate: 0..1 in both axes
    vec2 st = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(st.x, st.y, 0.0, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Swap <code>st.x</code> and <code>st.y</code>." },
    { rung: 'tune', text: "Set blue to <code>st.x * st.y</code> to see the corners interact." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/02/' }
  ]
});
