/* 18 Filters — ORIGINAL. The book lists this chapter and never wrote it. What follows is ours.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '18-filters',
  index: '18',
  order: 180,
  title: "Filters",
  section: 'image-processing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["grayscale","sepia","posterize"],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    note: "Upstream chapter 18 is a stub: the single line \"## Filters\". This chapter fills it."
  },
  stage: { texture: true },
  thumb: 'thumb.png',

  text: `
    <div class="note"><span class="lab">Not the book's</span>
      <p>Upstream, chapter 18 is the single line <code>## Filters</code>. Nothing else. This chapter is ours.</p></div>

    <p>Filters remap colors for mood. Here are three classics composited side by side: <strong>grayscale</strong> (luminance), <strong>sepia</strong> (warm tonemap) and <strong>posterize</strong> (quantize each channel into steps).</p>`,

  examples: [
    { id: 'three-tone-maps', title: "Grayscale · sepia · posterize", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  vec3 c = texture2D(u_tex0, uv).rgb;

  float g = dot(c, vec3(0.299,0.587,0.114));
  vec3 gray = vec3(g);
  vec3 sepia = vec3(g)*vec3(1.07,0.85,0.62);
  float levels = 4.0;
  vec3 poster = floor(c*levels)/levels;

  // thirds of the screen
  vec3 outc = c;
  if(uv.x < 0.333)      outc = gray;
  else if(uv.x < 0.666) outc = sepia;
  else                  outc = poster;
  gl_FragColor = vec4(outc, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Change <code>levels</code> for posterize strength. Two is a stencil; sixteen is invisible." },
    { rung: 'generalise', text: "Build your own lookup by mixing tints against luminance bands, and keep it as a function you would use again." }
  ],

  links: [
    { label: "Upstream chapter 18 (a stub)", url: 'https://thebookofshaders.com/18/' }
  ]
});
