/* 06 Colors — adapted from the book, chapter 06.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '06-colors',
  index: '06',
  order: 60,
  title: "Colors",
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["hsb","mix","atan"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 06',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/06/',
    license: 'All rights reserved (linking and citation only)'
  },
  thumb: 'thumb.png',

  text: `
    <p>Colors are just <code>vec3</code>s, so all the vector math applies. <code>mix(a, b, t)</code> blends linearly between two colors. But for hue work, the HSB (hue-saturation-brightness) model is far more intuitive.</p>
    <p>This is the classic color wheel: convert each pixel's <em>angle</em> from center into hue, and its <em>radius</em> into saturation.</p>`,

  examples: [
    { id: 'hsb-wheel', title: "The colour wheel", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
#define TWO_PI 6.28318530718

vec3 hsb2rgb(vec3 c){
  vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0),
                   6.0) - 3.0) - 1.0, 0.0, 1.0);
  rgb = rgb*rgb*(3.0 - 2.0*rgb);   // smooth it
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution;
  vec2 toCenter = vec2(0.5) - st;
  float angle  = atan(toCenter.y, toCenter.x);
  float radius = length(toCenter) * 2.0;

  vec3 color = hsb2rgb(vec3((angle/TWO_PI) + 0.5, radius, 1.0));
  gl_FragColor = vec4(color, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Add <code>+ u_time * 0.1</code> to the hue to spin the wheel." },
    { rung: 'substitute', text: "Swap <code>radius</code> for a constant to flatten saturation." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/06/' }
  ]
});
