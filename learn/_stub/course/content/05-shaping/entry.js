/* Twelve examples in one strip, to test the strip at something like the scale
   upstream chapter 09 will bring (23). */
var SHAPE = function (body, note) {
  return `#ifdef GL_ES
precision mediump float;
#endif
uniform vec2  u_resolution;
uniform float u_time;

// ${note}
float plot(vec2 st, float pct){
    // the line's weight is in PIXELS, not in normalised units — otherwise a
    // wide stage draws a fat line and a tall one draws a hair
    float w = 2.5 / u_resolution.y;
    return smoothstep(pct - w, pct, st.y) - smoothstep(pct, pct + w, st.y);
}

void main(){
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float y = ${body};
    vec3 paper = vec3(0.906, 0.890, 0.851);
    vec3 ink   = vec3(0.043, 0.043, 0.047);
    vec3 c = mix(paper, paper * 0.86, step(0.5, fract(st.x * 8.0)) * 0.25);
    c = mix(c, ink, plot(st, y));
    gl_FragColor = vec4(c, 1.0);
}`;
};

var CASES = [
  ['linear',      'st.x',                                  'y = x'],
  ['squared',     'pow(st.x, 2.0)',                        'y = x^2'],
  ['cubed',       'pow(st.x, 3.0)',                        'y = x^3'],
  ['root',        'sqrt(st.x)',                            'y = sqrt(x)'],
  ['step',        'step(0.5, st.x)',                       'a hard edge'],
  ['smoothstep',  'smoothstep(0.1, 0.9, st.x)',            'a soft edge with a declared width'],
  ['sine',        '0.5 + 0.5 * sin(st.x * 6.2831)',        'one period'],
  ['abs',         'abs(sin(st.x * 6.2831))',               'the bounce'],
  ['fract',       'fract(st.x * 3.0)',                     'a sawtooth'],
  ['floor',       'floor(st.x * 5.0) / 5.0',               'quantized'],
  ['impulse',     'st.x * 8.0 * exp(1.0 - st.x * 8.0)',    'Quilez impulse'],
  ['cubic-pulse', '1.0 - pow(abs(st.x - 0.5) / 0.25, 3.0)','Quilez cubic pulse']
];

Shell.registerEntry({
  id: '05-shaping',
  index: '05',
  order: 50,
  title: 'Shaping functions',
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ['smoothstep', 'curve', 'interpolation'],
  source: { kind: 'adapted', title: 'The Book of Shaders — chapter 05',
            url: 'https://thebookofshaders.com/05/', license: 'CC BY-NC-SA 4.0' },
  text: `
    <p>Control comes from shaping values, not from selecting effects. A shaping function
    takes the interval 0 to 1 and gives it a different personality — fast then slow, hard
    at the middle, flat then a spike — and everything downstream inherits it.</p>
    <p>The book puts four of these in a row so you watch one deform into the next. Step
    through the strip below in the same order and the family is obvious; jump straight to
    the last one and it is a recipe.</p>`,
  plots: [
    { title: 'The one you will use most', expr: 'smoothstep(0.1, 0.9, x)', domain: [0, 1], range: [0, 1],
      note: 'Move the two edges and the whole curve moves. <code>smoothstep</code> is a hard edge with a declared width — the width is the design decision.' },
    { title: 'A digital wave', expr: '(ceil(sin(x*6.2831 + t)) + floor(sin(x*6.2831 + t))) * 0.5 + 0.5',
      domain: [0, 1], range: [-0.2, 1.2],
      note: 'Ceil plus floor of the same value: everything positive goes to 1, everything negative to 0, and the crossing is exact.' }
  ],
  examples: CASES.map(function (c) {
    return { id: c[0], title: c[0].replace('-', ' '), code: SHAPE(c[1], c[2]) };
  }),
  exercises: [
    { rung: 'tune', text: 'Try exponents 20.0, 2.0, 1.0, 0.0, 0.2 and 0.02 in <code>squared</code>.' },
    { rung: 'substitute', text: 'Replace the power function with <code>exp()</code>, <code>log()</code>, <code>sqrt()</code>.' },
    { rung: 'generalise', text: 'Choose the one you like most and make it a function you would reuse — flexible, and cheap enough to call per pixel.' },
    { rung: 'compose', text: 'Use two different shaping functions on the same value to drive two different things, and make the pair read as one decision rather than two.' }
  ]
});
