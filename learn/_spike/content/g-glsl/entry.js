/* Injected as a classic <script src> by the shell. No fetch, no module. */
Shell.registerEntry({
  id: 'g-glsl',
  index: '01',
  title: 'A fragment shader',
  section: 'lanes',
  status: 'canonical',
  lane: 'glsl',
  tags: ['glsl', 'webgl'],
  text: '<p>The glsl lane. The spike mounts a stub adapter; the real one arrives at checkpoint 1.</p>',
  examples: [
    { id: 'plain', title: 'Plain', code: 'void main(){ gl_FragColor = vec4(0.1); }' },
    { id: 'ramp',  title: 'Ramp',  code: 'void main(){ gl_FragColor = vec4(0.5); }' }
  ]
});
