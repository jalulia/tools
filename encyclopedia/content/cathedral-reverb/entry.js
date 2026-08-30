/* cathedral-reverb — P1 Freeverb ported from
   corpus/repos/reliquary-synth/src/audio/CathedralReverb.ts:1-111 +
   src/data/tuning.ts:14-20. See team2/sound/INVENTORY.md P1 for the fault
   the sound lead measured. The excitation atom (banded noise burst) is
   pussyphus/.../src/audio/foley.js:39-55 — one atom, whole percussion
   section.

   The build function takes A context (live AudioContext OR
   OfflineAudioContext) so the still-frame path and the WAV export path
   share one mechanism with playback. update(t) takes an absolute time,
   which is what makes the offline loop reproduce it exactly. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'cathedral-reverb',
  index: 'P1',
  order: 3010,
  title: 'Freeverb — space from delay',
  section: 'sound',
  status: 'canonical',
  lane: 'audio',
  tags: ['reverb', 'space', 'graph', 'web audio'],
  governed_by: ['composing-computational-sound-systems'],
  uses: ['freeverb-comb', 'allpass-diffuser', 'master-limiter', 'banded-burst'],

  source: {
    kind: 'adapted',
    title: 'reliquary-synth/src/audio/CathedralReverb.ts:1-111',
    author: 'Julia Compton',
    note: 'Ported to the shared audio adapter. The Q=1 → Q=0.5 correction below is the sound lead\'s (proto/audio-adapter.html + INVENTORY §P1).'
  },

  text: `
    <p>Her cathedral is built, not loaded. Eight parallel comb filters at 30–53 ms
    with 0.84 feedback are summed and scaled by 1/8, then passed through four
    allpass filters in series at 5–13.7 ms. The detail most Web Audio Freeverbs
    omit is the <b>lowpass inside each comb's feedback loop</b>
    (<code>CathedralReverb.ts:71-73</code>) — without it the tail stays bright
    forever and sounds like a metal pipe rather than stone.</p>

    <p>The excitation is a second atom of hers: one banded noise burst, the
    shape that produces every sneaker, paw step, escalator clatter and rim hit
    in the corpus. <b>Damping</b> is the whole far-field / near-field decision;
    move it and the same room changes material.</p>
  `,

  critique: {
    reads_as: 'A stone room, struck once every two seconds, decaying darker than it started.',
    coupling: 'One number — feedback — sets both the tail length and the density of the late field. Damping and feedback are not independent knobs: damping decides what the feedback keeps.',
    pass_order: 'burst → [dry → out] and [8 combs ∥ → ×1/8 → 4 allpass series] → wet → out. The combs are parallel because they must not multiply each other; the allpasses are in series because each one is smearing the previous one\'s output.',
    faults: [
      'Original leaves the in-loop damping filter at Web Audio\'s default Q=1, a resonant peak of about +1.25 dB inside a loop already at 0.84 feedback. Measured in headless Chrome (single comb, unit impulse): peak 3480 over 8 s — runs away. Inaudible in reliquary-synth only because the sends are low and a limiter sits downstream. This port sets Q=0.5 and caps feedback at 0.86, where the loop is stable across the whole 800–12000 Hz damping range. CathedralReverb.ts:71-73.'
    ]
  },
  headroom: 'The tail\'s peak is set by the DECAY, not the excitation — halving the burst gain barely moves it. So the headroom decision lives in an output trim after the wet/dry sum, not in the source. Measured at the master output across renders: roughly −8 to −11 dBFS peak at feedback 0.84.',

  params: [
    { name: 'feedback', min: 0.5, max: 0.86, value: 0.84, step: 0.01, note: 'comb feedback — the tail length. Capped at 0.86: above that the loop runs away.' },
    { name: 'damping',  min: 800, max: 12000, value: 4500, step: 100, note: 'lowpass inside the feedback loop. Stone low, tile high.' },
    { name: 'wet',      min: 0, max: 1, value: 0.35, step: 0.01, note: 'wet against a fixed 0.65 dry.' }
  ],
  duration: 6, tail: 4,
  readout: ['wave', 'spectrum'],

  build: function (c, out, p) {
    var LIB = window.Shell && window.Shell.audioLib;
    var COMB = [0.030, 0.033, 0.037, 0.041, 0.043, 0.047, 0.051, 0.053];
    var ALLP = [0.005, 0.0073, 0.011, 0.0137];

    var input = c.createGain();
    var trim  = c.createGain(); trim.gain.value = 1.0;
    trim.connect(out);
    var wet   = c.createGain(); wet.gain.value = p.wet;
    var dry   = c.createGain(); dry.gain.value = 0.65;
    input.connect(dry); dry.connect(trim);

    var combSum = c.createGain(); combSum.gain.value = 1 / COMB.length;
    var lpfs = [], fbs = [];
    COMB.forEach(function (dt) {
      var d = c.createDelay(dt + 0.01); d.delayTime.value = dt;
      var g = c.createGain(); g.gain.value = Math.min(0.86, p.feedback);
      var lp = c.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.value = p.damping; lp.Q.value = 0.5;   /* NOT the default 1 — see faults */
      input.connect(d); d.connect(combSum);
      d.connect(lp); lp.connect(g); g.connect(d);
      lpfs.push(lp); fbs.push(g);
    });

    var node = combSum;
    ALLP.forEach(function (dt) {
      var i2 = c.createGain(), o2 = c.createGain();
      var d  = c.createDelay(dt + 0.01); d.delayTime.value = dt;
      var fb = c.createGain(); fb.gain.value = 0.5;
      var ff = c.createGain(); ff.gain.value = -0.5;
      i2.connect(d); i2.connect(ff); ff.connect(o2);
      d.connect(o2); d.connect(fb); fb.connect(d);
      node.connect(i2); node = o2;
    });
    node.connect(wet); wet.connect(trim);

    var nextHit = 0;
    return {
      nodes: { input: input, wet: wet, trim: trim, combs: fbs, lpfs: lpfs },
      start: function (when) { nextHit = (when || 0) + 0.15; },
      update: function (t) {
        while (nextHit < t + 0.2) {
          if (LIB) {
            LIB.bandedBurst(c, input, nextHit,
              { freq: 1400, Q: 2.2, gain: 0.95, dur: 0.035, attack: 0.002 });
            LIB.bandedBurst(c, input, nextHit + 0.004,
              { freq: 320,  Q: 1.6, gain: 0.55, dur: 0.06,  attack: 0.003 });
          }
          nextHit += 2.0;
        }
      },
      set: function (name, v, t) {
        var when = t || (c.currentTime + 0.01);
        if (name === 'feedback') {
          var safe = Math.min(0.86, v);
          fbs.forEach(function (g) { g.gain.setTargetAtTime(safe, when, 0.05); });
        }
        if (name === 'damping') lpfs.forEach(function (l) { l.frequency.setTargetAtTime(v, when, 0.03); });
        if (name === 'wet')     wet.gain.setTargetAtTime(v, when, 0.05);
      },
      stop: function () { }
    };
  }
});
