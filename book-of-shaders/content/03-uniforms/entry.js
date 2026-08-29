/* 03 Uniforms — adapted from the book, chapter 03.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '03-uniforms',
  index: '03',
  order: 30,
  title: "Uniforms",
  section: 'getting-started',
  status: 'canonical',
  lane: 'glsl',
  tags: ["uniform","u_time","sin"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 03',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/03/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>Uniforms are values passed <em>into</em> every pixel from the outside — the same ("uniform") for all of them on a given frame. The three you'll use constantly: <code>u_resolution</code> (canvas size), <code>u_mouse</code> (cursor in pixels) and <code>u_time</code> (seconds elapsed).</p>
    <p>Because <code>u_time</code> changes each frame, anything built on it <em>moves</em>. <code>sin()</code> oscillates between −1 and 1, so <code>abs(sin(u_time))</code> pulses smoothly from 0 to 1.</p>`,

  examples: [
    { id: 'pulse', title: "Three channels, three rates", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;

void main() {
    // u_time advances every frame -> animation
    float r = abs(sin(u_time));
    float g = abs(sin(u_time * 0.7));
    float b = abs(sin(u_time * 1.3));
    gl_FragColor = vec4(r, g, b, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Multiply <code>u_time</code> by a number to change speed: <code>sin(u_time * 3.0)</code>." },
    { rung: 'tune', text: "Drive the three channels at different rates and watch them come apart." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/03/' }
  ]
});
