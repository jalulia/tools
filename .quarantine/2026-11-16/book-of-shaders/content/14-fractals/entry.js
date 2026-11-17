/* 14 Fractals — ORIGINAL. The book lists this chapter and never wrote it. What follows is ours.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '14-fractals',
  index: '14',
  order: 140,
  title: "Fractals",
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ["julia set","escape time","iteration"],
  source: {
    kind: 'original',
    title: 'Written for this tool',
    note: "Upstream chapter 14 is a stub: \"Coming soon ...\" and ten Shadertoy links. This chapter fills it."
  },
  thumb: 'thumb.png',

  text: `
    <div class="note"><span class="lab">Not the book's</span>
      <p>Upstream, chapter 14 is the words <em>Coming soon …</em> and ten Shadertoy links. The Julia set below is ours.</p></div>

    <p>True fractals are self-similar at every zoom. The Julia set iterates <code>z = z² + c</code> for each pixel and asks: does it escape to infinity, or stay bounded? Coloring by <em>how fast</em> it escapes paints these infinitely intricate shapes.</p>
    <p>Here <code>c</code> drifts on a circle over time, morphing the fractal continuously.</p>`,

  examples: [
    { id: 'julia', title: "The Julia set", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main(){
  // centered, aspect-correct coordinate
  vec2 st = (gl_FragCoord.xy - 0.5*u_resolution) / u_resolution.y;
  vec2 z = st * 1.6;

  // c walks a slow circle -> the fractal morphs
  vec2 c = vec2(0.7885*cos(u_time*0.3), 0.7885*sin(u_time*0.3));

  float it = 0.0;
  const int MAX = 96;
  for(int i=0;i<MAX;i++){
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
    if(dot(z,z) > 4.0) break;
    it += 1.0;
  }
  float t = it / float(MAX);
  vec3 color = 0.5 + 0.5*cos(6.2831*(t + vec3(0.0,0.33,0.6)));
  gl_FragColor = vec4(color, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Slow the morph: change <code>* 0.3</code>." },
    { rung: 'tune', text: "Raise <code>MAX</code> for sharper detail, and watch the frame rate pay for it." },
    { rung: 'tune', text: "Shift the palette in the final <code>cos()</code>." }
  ],

  links: [
    { label: "Upstream chapter 14 (a stub)", url: 'https://thebookofshaders.com/14/' }
  ]
});
