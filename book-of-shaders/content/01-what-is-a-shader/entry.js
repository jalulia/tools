/* 01 What is a shader? — adapted from the book, chapter 01.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '01-what-is-a-shader',
  index: '01',
  order: 10,
  title: "What is a shader?",
  section: 'getting-started',
  status: 'canonical',
  lane: 'glsl',
  tags: ["pixel","parallel","gl_FragColor"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 01',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/01/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>A fragment shader is a tiny program that runs <em>once for every pixel</em>, all in parallel on the GPU. Its single job is to output a color into <code>gl_FragColor</code> — a <code>vec4</code> of red, green, blue, alpha, each from 0.0 to 1.0.</p>
    <p>Here every pixel returns the same color, so you get a flat field. The power comes later, when each pixel decides its own color based on <em>where</em> it is.</p>`,

  examples: [
    { id: 'flat-field', title: "A flat field", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

void main() {
    // R, G, B, Alpha  — each from 0.0 to 1.0
    gl_FragColor = vec4(0.78, 0.31, 0.25, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Change the three numbers. <code>vec4(0.0, 0.0, 1.0, 1.0)</code> is pure blue. Values clamp to 0–1." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/01/' }
  ]
});
