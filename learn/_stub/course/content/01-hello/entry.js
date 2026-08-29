Shell.registerEntry({
  id: '01-hello',
  index: '01',
  order: 10,
  title: 'What is a shader?',
  section: 'getting-started',
  status: 'canonical',
  lane: 'glsl',
  tags: ['pixel', 'parallel', 'gl_FragCoord'],
  source: { kind: 'adapted', title: 'The Book of Shaders — chapter 01',
            url: 'https://thebookofshaders.com/01/', license: 'CC BY-NC-SA 4.0' },
  text: `
    <p>A fragment shader is a tiny program that runs once for every pixel, all at the
    same time, and knows almost nothing. It does not know what the pixel next to it is
    doing. It knows where it is — <code>gl_FragCoord</code> — and whatever you hand it,
    and it must answer with one colour.</p>
    <p>That constraint is the whole medium. Everything else in this book is a way of
    turning a position into a value, and a value into a colour.</p>`,
  examples: [
    { id: 'position', title: 'Position', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(uv.x, uv.y, 0.35, 1.0);
}` },
    { id: 'time', title: 'Time', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2  u_resolution;
uniform float u_time;

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float v = 0.5 + 0.5 * sin(u_time + uv.x * 6.2831);
    gl_FragColor = vec4(vec3(v), 1.0);
}` }
  ],
  exercises: [
    { rung: 'tune', text: 'Change <code>0.35</code> to <code>uv.x * uv.y</code> and watch the corner go dark.' },
    { rung: 'substitute', text: 'Swap <code>sin</code> for <code>fract</code>. The wave becomes a sawtooth and the edge becomes hard.' }
  ]
});
