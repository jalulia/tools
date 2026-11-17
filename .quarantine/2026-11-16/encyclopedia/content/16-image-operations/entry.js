/* 16 Image operations — ORIGINAL. The book lists this chapter and never wrote it. What follows is ours.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '16-image-operations',
  index: '16',
  order: 160,
  title: "Image operations",
  section: 'image-processing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["invert","contrast","mix"],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    note: "Upstream chapter 16 is a stub: 504 bytes of README with no prose. This chapter fills it."
  },
  stage: { texture: true },
  thumb: 'thumb.png',

  text: `
    <div class="note"><span class="lab">Not the book's</span>
      <p>Upstream, chapter 16 is 504 bytes of README with eight <code>.frag</code> files and no prose to hold them together. This chapter is ours.</p></div>

    <p>Once a pixel's color is in a <code>vec4</code>, operate on it freely. Invert is <code>1.0 - color</code>. Brightness is multiplication. Contrast pushes values away from 0.5.</p>
    <p>This splits the screen: left half original, right half inverted, with a moving seam.</p>`,

  examples: [
    { id: 'invert-seam', title: "Invert, with a moving seam", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;
uniform float u_time;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  vec4 c = texture2D(u_tex0, uv);
  vec3 inverted = 1.0 - c.rgb;

  float seam = 0.5 + 0.25*sin(u_time);
  vec3 outc = mix(c.rgb, inverted, step(seam, uv.x));
  gl_FragColor = vec4(outc, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'substitute', text: "Try grayscale: <code>dot(c.rgb, vec3(0.299, 0.587, 0.114))</code>." },
    { rung: 'generalise', text: "Boost saturation by mixing the colour <em>away</em> from its own grey — write it as a function that takes an amount." }
  ],

  links: [
    { label: "Upstream chapter 16 (a stub)", url: 'https://thebookofshaders.com/16/' }
  ]
});
