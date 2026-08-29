/* 11 Noise — adapted from the book, chapter 11.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '11-noise',
  index: '11',
  order: 110,
  title: "Noise",
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ["value noise","interpolation","smoothstep"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 11',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/11/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>Random alone is too harsh. <em>Value noise</em> smooths it: sample random values at the four corners of each grid cell, then interpolate between them with an eased curve. The result is organic, continuous, controllable.</p>
    <p>This is the single most important building block in generative graphics — clouds, terrain, marble, smoke all start here.</p>`,

  examples: [
    { id: 'value-noise', title: "Value noise", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 st){
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
}
float noise(vec2 st){
  vec2 i = floor(st), f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0,0.0));
  float c = random(i + vec2(0.0,1.0));
  float d = random(i + vec2(1.0,1.0));
  vec2 u = f*f*(3.0 - 2.0*f);          // smoothstep curve
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution * 5.0;
  float n = noise(st + u_time * 0.25);
  gl_FragColor = vec4(vec3(n), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Change the <code>* 5.0</code> scale and watch the feature size change without the character changing." },
    { rung: 'tune', text: "Slow or reverse the <code>u_time * 0.25</code> term — the field scrolls like drifting fog." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/11/' }
  ]
});
