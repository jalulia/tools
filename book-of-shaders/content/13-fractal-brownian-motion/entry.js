/* 13 Fractal Brownian Motion — adapted from the book, chapter 13.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '13-fractal-brownian-motion',
  index: '13',
  order: 130,
  title: "Fractal Brownian Motion",
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ["fbm","octaves","domain warp"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 13',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/13/',
    license: 'CC BY-NC-SA 4.0'
  },
  note: "Marked for the checkpoint-4 rebuild: lacunarity and gain are welded shut at 2.0 and 0.5 in this shader and are never named.",
  thumb: 'thumb.png',

  text: `
    <p>Layer noise at doubling frequencies and halving amplitudes and you get <strong>fBm</strong> — fractal Brownian motion. Each "octave" adds finer detail, the way real clouds and mountains have structure at every scale.</p>
    <p>More octaves = richer detail (and more cost). This is the engine behind most procedural terrain and texture.</p>`,

  examples: [
    { id: 'octaves', title: "Five octaves", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float random(vec2 st){
  return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453);
}
float noise(vec2 st){
  vec2 i = floor(st), f = fract(st);
  float a=random(i), b=random(i+vec2(1.0,0.0)),
        c=random(i+vec2(0.0,1.0)), d=random(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}

#define OCTAVES 5
float fbm(vec2 st){
  float v = 0.0, amp = 0.5;
  for(int i=0;i<OCTAVES;i++){
    v += amp * noise(st);
    st *= 2.0; amp *= 0.5;
  }
  return v;
}

void main(){
  vec2 st = gl_FragCoord.xy / u_resolution * 3.0;
  float f = fbm(st + u_time*0.1);
  vec3 color = mix(vec3(0.1,0.12,0.2), vec3(0.95,0.7,0.4), f);
  gl_FragColor = vec4(color, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: "Change <code>OCTAVES</code> from 1 up to 8 and watch detail accumulate and cost rise with it." },
    { rung: 'compose', text: "Warp the domain with itself: <code>fbm(st + fbm(st))</code>. Warping the input is not the same operation as distorting the output, and telling those two apart is the whole lesson." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/13/' }
  ]
});
