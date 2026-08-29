/* A known-failure entry: it is shown BECAUSE it fails, and the failure is the
   lesson. The shader below does not link, in exactly the way the prose says. */
Shell.registerEntry({
  id: '17-kernel',
  index: '17',
  order: 170,
  title: 'A shader that does not link',
  section: 'image-processing',
  status: 'known-failure',
  lane: 'glsl',
  tags: ['convolution', 'precision', 'compile error'],
  source: { kind: 'original', title: 'Written for this tool' },
  text: `
    <p>Every other chapter shows you something that works. This one does not, on purpose:
    the book has nowhere to put a failure, and a person learning shaders spends most of
    their time looking at a compile log.</p>
    <p>The shader below declares <code>uniform sampler2D u_tex0;</code> and then samples it
    with <code>texture()</code>. That is the GLSL 3 spelling. This context is GLSL ES 1.0,
    where the function is <code>texture2D()</code>. One word, and the whole program refuses
    to link — which is what the drawdown strip says, and what the hatched line in the
    gutter points at.</p>`,
  note: 'Asserted to fail: no such function texture(sampler2D, vec2).',
  examples: [
    { id: 'wrong-call', title: 'As written', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2      u_resolution;
uniform sampler2D u_tex0;

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    // GLSL 3 spelling in a GLSL ES 1.0 context. One word.
    vec4 c = texture(u_tex0, uv);
    gl_FragColor = c;
}` },
    { id: 'fixed', title: 'The one word', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2      u_resolution;
uniform sampler2D u_tex0;

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec4 c = texture2D(u_tex0, uv);
    gl_FragColor = c;
}` }
  ],
  exercises: [
    { rung: 'tune', text: 'Fix line 10 in the editor and watch the status change from FAILED to COMPILED without leaving the page.' }
  ]
});
