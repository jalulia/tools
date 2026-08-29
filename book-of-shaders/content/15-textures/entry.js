/* 15 Textures — adapted from the book, chapter 15.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '15-textures',
  index: '15',
  order: 150,
  title: "Textures",
  section: 'image-processing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["sampler2D","texture2D","uv"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 15',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/15/',
    license: 'CC BY-NC-SA 4.0'
  },
  stage: { texture: true },
  thumb: 'thumb.png',

  text: `
    <p>Now we read an image. A texture is sampled with <code>texture2D(tex, uv)</code> where <code>uv</code> runs 0→1. WebGL's vertical axis is flipped, so we invert <code>y</code> to display it upright.</p>
    <p>Upload your own image below — every shader in this section will run on it.</p>`,

  examples: [
    { id: 'sample', title: "Reading an image", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;
uniform float u_time;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;                 // flip to upright
  gl_FragColor = texture2D(u_tex0, uv);
}
` }
  ],

  exercises: [
    { rung: 'substitute', text: "Distort the lookup: <code>uv.x += sin(uv.y*40.0 + u_time)*0.02;</code> warps the image like water." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/15/' }
  ]
});
