/* 04 Running your shader — adapted from the book, chapter 04.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '04-running-your-shader',
  index: '04',
  order: 40,
  title: "Running your shader",
  section: 'getting-started',
  status: 'canonical',
  lane: 'glsl',
  tags: ["u_mouse","distance","interaction"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 04',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/04/',
    license: 'All rights reserved (linking and citation only)'
  },
  stage: { mouse: true },
  thumb: 'thumb.png',

  text: `
    <p>Put coordinates, mouse and time together and the canvas becomes interactive. Here we measure each pixel's <code>distance()</code> to the mouse and use it to draw a soft spotlight that follows your cursor.</p>
    <p>Move your mouse over the canvas — <code>u_mouse</code> updates live. The time term makes the halo breathe.</p>`,

  examples: [
    { id: 'spotlight', title: "A spotlight on the cursor", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 m  = u_mouse / u_resolution;

    float d = distance(st, m);
    float glow = 0.4 / (d + 0.05);
    glow *= 0.8 + 0.2 * sin(u_time * 2.0);

    vec3 color = vec3(glow) * vec3(1.0, 0.55, 0.4);
    gl_FragColor = vec4(color, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Hover the canvas. Change <code>0.4</code> to resize the glow." },
    { rung: 'substitute', text: "Feed the distance into a colour instead of into grayscale." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/04/' }
  ]
});
