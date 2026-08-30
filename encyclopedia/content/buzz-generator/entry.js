/* buzz-generator — from corpus/repos/reliquary-synth/src/audio/BuzzGenerator.ts.
   Filtered noise + slow envelope. The point of this entry: ONE atom
   (buzz-envelope) carries a whole percussion section — sound INVENTORY.md
   §5 addendum. An exploration, not canonical: the timbres are useful but
   the piece-scale design (when to fire, how many at once) is still open. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'buzz-generator',
  index: 'S-BUZZ',
  order: 3040,
  title: 'Buzz generator — one primitive, a section',
  section: 'sound',
  status: 'exploration',
  lane: 'audio',
  tags: ['noise', 'envelope', 'graph', 'percussion'],
  governed_by: ['composing-computational-sound-systems'],
  uses: ['buzz-envelope', 'banded-burst', 'master-limiter'],

  source: {
    kind: 'adapted',
    title: 'reliquary-synth/src/audio/BuzzGenerator.ts',
    author: 'Julia Compton',
    note: 'The centre frequency and LFO rate are wired to the two knobs that carry the timbre. Duration control is deliberately hidden — a buzz is an interval, not a hit.'
  },

  text: `
    <p>Noise into a bandpass into an amplitude LFO. The whole primitive fits
    inside eight lines. What the entry is <b>for</b>: it is one atom
    (<code>buzz-envelope</code>) that carries a whole percussion section —
    tune the centre from 200 Hz to 4 kHz and the same graph reads as a low
    room drone, a wasp, a fluorescent tube, or a tape hiss. The lesson is
    that the timbre is <b>in the filter</b>, not in the source.</p>

    <p>Not canonical because the <b>piece-scale</b> design — how many buzzes
    fire together, how their envelopes overlap, when they duck — is still
    open. The atom is proven; the composition around it is a question this
    entry does not answer.</p>
  `,

  critique: {
    reads_as: 'A held, filtered noise that breathes.',
    coupling: 'Centre frequency IS the character, and its Q IS how much of that character you commit to. Rate scales the whole thing in time without changing what it is.',
    pass_order: 'noise → bandpass(centre, Q) → gain·LFO(rate) → master. Any of the three moved between passes changes the sound: an LFO after the master would duck everything else too.'
  },
  headroom: 'A bandpass at Q=8 concentrates energy near centre; the summed voice level sits at 0.18 with a 0.5 Hz–8 Hz amplitude LFO. Peak lands around −11 dBFS across the parameter range.',

  params: [
    { name: 'centre', min: 200, max: 4000, value: 800, step: 10, note: 'bandpass centre Hz — the timbre.' },
    { name: 'Q',      min: 1,   max: 20,   value: 8,   step: 0.5, note: 'sharpness. Above 12 it starts to whistle.' },
    { name: 'rate',   min: 0.1, max: 8,    value: 2.5, step: 0.1, note: 'amplitude LFO Hz — the breath.' }
  ],
  duration: 8, tail: 0.4,
  readout: ['wave', 'spectrum'],

  build: function (c, out, p) {
    var LIB = window.Shell && window.Shell.audioLib;
    var noise = c.createBufferSource();
    noise.buffer = LIB ? LIB.whiteNoise(c) : (function () {
      var b = c.createBuffer(1, c.sampleRate, c.sampleRate);
      var d = b.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return b;
    })();
    noise.loop = true;

    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = p.centre;
    bp.Q.value = p.Q;

    var gain = c.createGain(); gain.gain.value = 0.18;
    var vca  = c.createGain(); vca.gain.value = 0.5;

    /* LFO — an oscillator into vca.gain, offset so it stays positive. */
    var lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = p.rate;
    var lfoDepth = c.createGain(); lfoDepth.gain.value = 0.4;
    lfo.connect(lfoDepth); lfoDepth.connect(vca.gain);

    noise.connect(bp); bp.connect(vca); vca.connect(gain); gain.connect(out);

    return {
      nodes: { noise: noise, bp: bp, vca: vca, lfo: lfo, gain: gain },
      start: function (when) {
        try { noise.start(when || 0); } catch (e) { }
        try { lfo.start(when || 0);   } catch (e) { }
      },
      update: function () { /* stateless; the LFO drives the picture */ },
      set: function (name, v, t) {
        var when = t || (c.currentTime + 0.01);
        if (name === 'centre') bp.frequency.setTargetAtTime(v, when, 0.02);
        if (name === 'Q')      bp.Q.setTargetAtTime(v, when, 0.05);
        if (name === 'rate')   lfo.frequency.setTargetAtTime(v, when, 0.05);
      },
      stop: function (when) {
        try { noise.stop(when === undefined ? 0 : when); } catch (e) { }
        try { lfo.stop(when === undefined ? 0 : when);   } catch (e) { }
      }
    };
  }
});
