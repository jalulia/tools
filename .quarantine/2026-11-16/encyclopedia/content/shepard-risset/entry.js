/* shepard-risset — S8 from corpus/repos/pussyphus/.../src/audio/shepard.js:23-66
   + constants.js:243-246. The illusion IS the premise of that piece (a cat
   walking up a down escalator), which is why the sound lead calls this the
   entry the sound section should open with. */
Shell.registerEntry({
  entity: 'exploration',
  instance_of: ['master-limiter-driver'],
  id: 'shepard-risset',
  index: 'S8',
  order: 3030,
  title: 'Shepard–Risset glissando',
  section: 'sound',
  status: 'canonical',
  lane: 'audio',
  tags: ['illusion', 'oscillator', 'graph'],
  governed_by: ['composing-computational-sound-systems'],
  uses: ['master-limiter'],

  source: {
    kind: 'adapted',
    title: 'pussyphus/.../src/audio/shepard.js:23-66',
    author: 'Julia Compton',
    note: 'Phase advance rewritten to take an absolute time so an offline loop reproduces it exactly.'
  },

  text: `
    <p>A cat walking up a down escalator. The illusion is not decoration on
    that premise — it <b>is</b> the premise, which is why this is the entry
    the sound section should open with.</p>

    <p>Each voice holds a normalised phase offset by <code>i / voices</code>.
    Frequency is <code>base · 2^(p · octaves)</code> and amplitude is a
    Gaussian centred at <code>p = 0.5</code>, so a voice is loudest in the
    middle of its sweep and silent at both ends. The composite has no seam
    because nothing is ever audible at the moment it wraps. <b>Sigma</b> is
    the whole trick: widen it and you hear the wrap, narrow it and you hear
    six separate tones instead of one rising thing.</p>
  `,

  critique: {
    reads_as: 'One tone rising forever.',
    coupling: 'Phase is the single shared cause: it sets each voice\'s frequency AND its amplitude. Decouple them — a fixed amplitude, or an envelope on a different clock — and the illusion collapses into six audible glissandi. That is the removal test with a hard answer.',
    pass_order: 'six [osc → gain] → summed gain → out. Deliberately bypasses the crowd filter and reverb in the parent game (shepard.js:8): the illusion is non-diegetic, so occluding it would be a category error.'
  },
  headroom: 'Six voices at Gaussian weights sum to roughly 2.2 at worst alignment; the summed gain is the level control and sits at 0.16 here so the peak lands near −9 dBFS.',

  params: [
    { name: 'period', min: 4,    max: 30,   value: 11,   step: 0.5, note: 'seconds for one full cycle. shepard.js clamps at 2 minimum.' },
    { name: 'voices', min: 3,    max: 10,   value: 6,    step: 1,   note: 'her constant is 6. Fewer and you hear the individuals.' },
    { name: 'sigma',  min: 0.08, max: 0.5,  value: 0.25, step: 0.01, note: 'Gaussian envelope width. The whole illusion is here.' }
  ],
  duration: 12, tail: 0.2,
  readout: ['wave', 'spectrum'],

  build: function (c, out, p) {
    var BASE = 55, OCT = 6;
    var master = c.createGain(); master.gain.value = 0; master.connect(out);
    var voices = [], n = Math.round(p.voices);
    for (var i = 0; i < n; i++) {
      var o = c.createOscillator(); o.type = 'sine'; o.frequency.value = BASE;
      var g = c.createGain(); g.gain.value = 0;
      o.connect(g); g.connect(master);
      voices.push({ osc: o, gain: g, offset: i / n });
    }
    var st = { period: p.period, sigma: p.sigma, level: 0.16, t0: null };
    return {
      nodes: { master: master, voices: voices },
      start: function (when) {
        st.t0 = when;
        voices.forEach(function (v) { try { v.osc.start(when); } catch (e) { } });
        master.gain.setTargetAtTime(st.level, when, 0.4);
      },
      update: function (t) {
        if (st.t0 === null) st.t0 = t;
        var phase = ((t - st.t0) / st.period) % 1;
        for (var i = 0; i < voices.length; i++) {
          var v = voices[i];
          var pp = (phase + v.offset) % 1;
          var f = BASE * Math.pow(2, pp * OCT);
          var d = pp - 0.5;
          var amp = Math.exp(-(d * d) / (2 * st.sigma * st.sigma));
          v.osc.frequency.setTargetAtTime(f, t, 0.02);
          v.gain.gain.setTargetAtTime(amp, t, 0.05);
        }
      },
      set: function (name, val, t) {
        if (name === 'period') st.period = Math.max(2, val);
        if (name === 'sigma')  st.sigma  = val;
        if (name === 'voices') return 'rebuild';
      },
      stop: function (when) {
        master.gain.setTargetAtTime(0, when, 0.03);
        voices.forEach(function (v) { try { v.osc.stop(when + 0.2); } catch (e) { } });
      }
    };
  }
});
