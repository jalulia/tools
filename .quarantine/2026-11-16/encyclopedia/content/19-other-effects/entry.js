/* 19 Other effects — ORIGINAL. The book lists this chapter and never wrote it. What follows is ours.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "technique",
  governed_by: ["composing-computational-material-systems"],
  id: '19-other-effects',
  index: '19',
  order: 190,
  title: "Other effects",
  section: 'image-processing',
  status: 'exploration',
  lane: 'glsl',
  tags: ["chromatic aberration","warp","scanlines"],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    note: "Upstream chapter 19 is a stub: listed in the book's contents and never given a page. This chapter fills it."
  },
  stage: { texture: true, mouse: true },
  thumb: 'thumb.png',

  text: `
    <div class="note"><span class="lab">Not the book's</span>
      <p>The book lists <em>Other effects</em> in its contents and never gave it a page, so there is no upstream chapter 19 to adapt. This one is ours, and it is filed as an exploration rather than as canon.</p></div>

    <p>Distortion effects move the lookup coordinate instead of the color. <strong>Chromatic aberration</strong> samples R/G/B at slightly offset positions; a <strong>wave</strong> warps the UVs with <code>sin</code>. Combined, you get a glitchy, lens-like finish that reacts to time.</p>`,

  examples: [
    { id: 'aberration-wave', title: "Aberration, wave, scanlines", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform sampler2D u_tex0;
uniform float u_time;

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  // wave warp
  uv.x += sin(uv.y*22.0 + u_time*2.0) * 0.006;

  // chromatic aberration, stronger near the mouse
  vec2 m = u_mouse / u_resolution; m.y = 1.0 - m.y;
  float amt = 0.004 + 0.02*distance(uv, m);
  float r = texture2D(u_tex0, uv + vec2(amt, 0.0)).r;
  float g = texture2D(u_tex0, uv).g;
  float b = texture2D(u_tex0, uv - vec2(amt, 0.0)).b;

  vec3 outc = vec3(r,g,b);
  outc *= 0.92 + 0.08*sin(uv.y*u_resolution.y*0.7); // scanlines
  gl_FragColor = vec4(outc, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "The aberration is already driven by distance from the cursor. Change <code>0.02</code> to set how fast it grows, and <code>0.004</code> to set the floor." },
    { rung: 'tune', text: "Take the scanline amount from <code>0.08</code> to <code>0.25</code> and the finish stops being a hint and becomes a CRT." },
    { rung: 'compose', text: "The three operators here are independent: warp, split, scan. Remove each in turn and decide which one the picture cannot lose." }
  ],

  links: [
    { label: "The book's contents, where this chapter is listed", url: 'https://thebookofshaders.com/' }
  ]
});
