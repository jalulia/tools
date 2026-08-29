Shell.registerEntry({
  id: '07-shapes',
  index: '07',
  order: 70,
  title: 'Shapes',
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ['sdf', 'distance field', 'polar'],
  source: { kind: 'adapted', title: 'The Book of Shaders — chapter 07',
            url: 'https://thebookofshaders.com/07/', license: 'All rights reserved (linking and citation only)' },
  text: `
    <p>A shape here is not drawn. It is a <em>field</em> — a number defined everywhere,
    which happens to be zero along the outline you wanted — and then a threshold. Once
    you have the field you can move the threshold, and moving the threshold gives you the
    outline, the fill, the ring, the glow and the shadow for free.</p>
    <p>That is the highest-transfer idea in the book, and the word for it is a signed
    distance field.</p>`,
  examples: [
    { id: 'disc', title: 'Disc', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;

void main(){
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float d = length(st) - 0.28;               // the field
    float ink = 1.0 - smoothstep(0.0, 0.004, d);
    gl_FragColor = vec4(mix(vec3(0.906,0.890,0.851), vec3(0.043), ink), 1.0);
}` },
    { id: 'ring', title: 'Ring', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;

void main(){
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float d = abs(length(st) - 0.28) - 0.012;  // the SAME field, offset
    float ink = 1.0 - smoothstep(0.0, 0.004, d);
    gl_FragColor = vec4(mix(vec3(0.906,0.890,0.851), vec3(0.043), ink), 1.0);
}` },
    { id: 'polygon', title: 'N-sided', code:
`#ifdef GL_ES
precision mediump float;
#endif
uniform vec2  u_resolution;
uniform float u_time;

void main(){
    vec2 st = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    float a = atan(st.y, st.x), r = length(st);
    float n = 6.0;
    float poly = cos(floor(0.5 + a * n / 6.2831) * 6.2831 / n - a) * r;
    float d = poly - 0.26;
    float ink = 1.0 - smoothstep(0.0, 0.004, d);
    gl_FragColor = vec4(mix(vec3(0.906,0.890,0.851), vec3(0.043), ink), 1.0);
}` }
  ],
  plots: [
    { title: 'The threshold is the picture', expr: '1.0 - smoothstep(0.0, 0.05, abs(x - 0.5) - 0.2)',
      domain: [0, 1], range: [-0.1, 1.1],
      note: 'One field, one threshold, one width. Widen the third argument and the edge softens without the shape moving.' }
  ],
  exercises: [
    { rung: 'tune', text: 'Take the smoothstep width from 0.004 to 0.08. The shape does not move; only its edge does.' },
    { rung: 'generalise', text: 'Make <code>sdCircle(p, r)</code> and <code>sdBox(p, b)</code>, then combine them with <code>min</code> and <code>max</code>.' },
    { rung: 'compose', text: 'Choose a geometric logo and replicate it using distance fields only — no drawn strokes.' }
  ],
  related: [{ entry: '13-fbm', relation: 'answers' }]
});
