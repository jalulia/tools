/* Injected as a classic <script src> by the shell. No fetch, no module. */
Shell.registerEntry({
  id: 'c-canvas',
  index: '02',
  title: 'A canvas2d plate',
  section: 'lanes',
  status: 'exploration',
  lane: 'canvas2d',
  tags: ['canvas2d'],
  text: '<p>The canvas2d lane, declared per entry rather than per tool.</p>',
  examples: [
    { id: 'bands', title: 'Bands', code: 'for(var i=0;i<8;i++){ ctx.fillStyle="rgb("+(i*30)+","+(i*24)+","+(i*20)+")"; ctx.fillRect(0,i*H/8,W,H/8); }' }
  ]
});
