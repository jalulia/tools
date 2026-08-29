/* The Canvas2D lane, in a course tool whose default lane is glsl — the lane is
   per entry, not per tool. This is the order-dependence worked example. */
Shell.registerEntry({
  id: '20-ridge-paint',
  index: '20',
  order: 200,
  title: 'Seven passes on one ridge',
  section: 'generative',
  status: 'canonical',
  lane: 'canvas2d',
  stub: false,
  tags: ['order dependence', 'canvas2d', 'paper'],
  source: { kind: 'own-work', title: 'Ki Landscapes — adapted', date: '2026-06-10' },
  text: `
    <p>The same seven operations in a different order are a different picture. Here the
    ridge path is built once and then clipped to; every band after it is a reading of that
    one path. Move the grain above the haze and the haze stops being atmosphere and starts
    being a filter over a photograph.</p>`,
  params: [
    { name: 'bands', min: 3, max: 14, step: 1, value: 9 },
    { name: 'haze',  min: 0,  max: 1, step: 0.01, value: 0.55 },
    { name: 'grain', min: 0,  max: 0.5, step: 0.01, value: 0.18 }
  ],
  examples: [
    { id: 'ridges', title: 'Ridges', code:
`var N = Math.round(p.bands);
ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, W, H);

for (var i = 0; i < N; i++){
  var t = i / (N - 1);
  var ridge = lib.fbm1D(4021 + i * 977, 6, 4, 0.5);
  var ground = lib.lerp(H * 0.30, H * 0.98, t);
  var v = lib.lerp(0.10, 0.72, 1 - t);
  var hz = p.haze * (1 - t) * (1 - t);
  var g = Math.round(255 * lib.lerp(v, 0.93, hz));

  ctx.beginPath(); ctx.moveTo(0, H);
  for (var x = 0; x <= W; x += 2){
    ctx.lineTo(x, ground - ridge(x / W) * H * 0.32 * (0.3 + 0.8 * t));
  }
  ctx.lineTo(W, H); ctx.closePath();
  ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + Math.min(255, g + 6) + ')';
  ctx.fill();
}

// pass 7: the paper, last, over everything — it is the sheet, not a filter
if (p.grain > 0){
  ctx.globalAlpha = p.grain;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(lib.grainTile(), 'repeat');
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}` }
  ],
  critique: {
    reads_as: 'A printed landscape plate — one sheet with atmosphere in it, not a stack of translucent shapes.',
    coupling: 'One 1-D fBm generates every band; depth drives the value, the haze and the amplitude of the same path, so a band cannot be near and pale at once.',
    pass_order: 'ridge → fill by depth → haze toward the sky → paper last. The paper is the sheet the whole thing is printed on; put it under the haze and it becomes a texture on an object instead.',
    operators: ['1-D fBm', 'depth-graded value', 'haze', 'paper tooth'],
    why_it_survives: 'Remove the haze and the bands stop being distances. Remove the paper and it is a vector illustration of a landscape rather than a print of one.',
    faults: [
      'The grain ran at the same frequency as the ridge detail and moiréd. Separated by an octave.',
      'Haze was originally applied per band as opacity, which made the far bands transparent rather than distant — you could see through a mountain.'
    ]
  },
  pass0: [
    { k: 'Substrate', v: 'Warm white 120 gsm, tooth visible at 100%.' },
    { k: 'Process', v: 'Single-pass paint, seven ordered fills, one overlay.' },
    { k: 'Type', v: 'None. The plate carries no words.' },
    { k: 'Hardware', v: 'Trim marks only, drawn by the chrome, not the plate.' },
    { k: 'Skeleton', v: 'One horizon, N bands, one sheet. No grid.' }
  ],
  ruling: {
    text: 'The ridge line stays crisp — solid to 94% and then nothing. Do not soften it to blend the bands; the softness belongs to the haze, and giving it to the edge as well is one job done twice.',
    by: 'julia', date: '2026-06-10'
  },
  related: [{ entry: '13-fbm', relation: 'technique-of' }]
});
