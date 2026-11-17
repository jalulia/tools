/* 17 Kernel convolutions — ORIGINAL. The book lists this chapter and never wrote it. What follows is ours.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '17-kernel-convolutions',
  index: '17',
  order: 170,
  title: "Kernel convolutions",
  section: 'image-processing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["convolution","sobel","kernel"],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    note: "Upstream chapter 17 is a stub: the single line \"## Kernel convolutions\". This chapter fills it."
  },
  stage: { texture: true },
  thumb: 'thumb.png',

  text: `
    <div class="note"><span class="lab">Not the book's</span>
      <p>Upstream, chapter 17 is the single line <code>## Kernel convolutions</code>. Nothing else. This chapter is ours.</p></div>

    <p>Convolution samples a pixel's <em>neighbors</em> and combines them with a small matrix (kernel). Different kernels = different effects: blur averages, sharpen exaggerates, and a Sobel kernel detects edges by finding where color changes fastest.</p>
    <p>This runs a Sobel edge detector — the image becomes its own outline.</p>`,

  examples: [
    { id: 'sobel', title: "A Sobel edge detector", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform sampler2D u_tex0;

float lum(vec2 uv){
  vec3 c = texture2D(u_tex0, uv).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  vec2 px = 1.0 / u_resolution;

  // Sobel gradients
  float gx =
     -lum(uv+px*vec2(-1,-1)) -2.0*lum(uv+px*vec2(-1,0)) -lum(uv+px*vec2(-1,1))
     +lum(uv+px*vec2( 1,-1)) +2.0*lum(uv+px*vec2( 1,0)) +lum(uv+px*vec2( 1,1));
  float gy =
     -lum(uv+px*vec2(-1,-1)) -2.0*lum(uv+px*vec2(0,-1)) -lum(uv+px*vec2(1,-1))
     +lum(uv+px*vec2(-1, 1)) +2.0*lum(uv+px*vec2(0, 1)) +lum(uv+px*vec2(1, 1));

  float edge = sqrt(gx*gx + gy*gy);
  gl_FragColor = vec4(vec3(edge), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Scale <code>px</code> up — <code>px * 3.0</code> — to sample wider, for chunkier edges." },
    { rung: 'tune', text: "Tint the edges by multiplying the result by a colour instead of writing it into all three channels." }
  ],

  links: [
    { label: "Upstream chapter 17 (a stub)", url: 'https://thebookofshaders.com/17/' }
  ]
});
