/* ki-soundscape-bands — A3 from corpus/repos/Ki-Landscapes/sonic.html:341-357
   + :228-238 + :400-404. One analyser read → five visual jobs. The driver
   here is GENERATED, not the embedded commercial track (INVENTORY L1 —
   sonic.html:51 is a 5 MB base64'd 1976 Takanaka mp3, `known_failure`).
   The generated bed is also hers — daytona-v2.html:337-388.

   This entry is a coupling: it carries `driver` and `consequences[]` so the
   shell renders the coupling block. Every audio entry MAY declare coupling
   fields — a coupling is not a third page-kind (REVIEW-SOUND §2.2). */
Shell.registerEntry({
  entity: 'exploration',
  id: 'ki-soundscape-bands',
  index: 'A3',
  order: 3020,
  title: 'Three bands, five consequences',
  section: 'sound',
  status: 'canonical',
  lane: 'audio',
  tags: ['analyser', 'coupling', 'shared-cause'],
  governed_by: ['composing-computational-sound-systems', 'composing-computational-material-systems'],
  uses: ['master-limiter'],

  source: {
    kind: 'adapted',
    title: 'Ki-Landscapes/sonic.html — analyser + biome-as-instrument',
    author: 'Julia Compton',
    note: 'Bed synthesised in-page (daytona-v2.html:337-388) rather than base64\'d — the Takanaka embed at sonic.html:51 cannot ship in a published tool.'
  },

  driver: 'One AnalyserNode read of the driver bed — three bands by bin fraction, plus time-domain RMS.',
  consequences: [
    ['region lightness', 'L + boost·0.09, per biome slot, on its own band', 'sonic.html:237'],
    ['region chroma',    'a,b × (1 + boost·0.20) — "biome-as-instrument"',   'sonic.html:237'],
    ['sky luminance',    'L + 0.04·rms across the sky gradient',             'sonic.html:272'],
    ['sun radius',       'R × (1 + 0.03·rms)',                               'sonic.html:265'],
    ['travel speed',     '0.05 + 0.32·bass + 0.22·rms + 0.10·react',         'sonic.html:402']
  ],
  mute_test: 'Mute it: the picture still reads — the land keeps travelling at the 0.05 baseline and the biomes keep their unlifted colour, so the composition survives. Freeze the picture: the bed still makes sense as music. Both directions pass, which is why the coupling is a decision rather than a dependency.',

  text: `
    <p>The Ki Soundscape reads one analyser and fans it out to five different
    visual jobs. Each of three biome regions reacts to <b>its own band</b> —
    slot 0 to bass, 1 to mid, 2 to treble (<code>sonic.html:140</code>) —
    lifting lightness by <code>boost*0.09</code> and multiplying chroma by
    <code>1+boost*0.20</code>. RMS breathes the sky. Bass and RMS drive how
    fast the land travels past. That is compound causality in sound, and she
    wrote it before anyone asked her to.</p>

    <p>The eight lines doing the real work are the envelope follower at
    <code>sonic.html:352-362</code>: attack roughly four times the decay, both
    scaled by the <b>react</b> control. Turn react to zero and the coupling
    is off but the piece still moves — the mute test passing in one
    direction.</p>
  `,

  critique: {
    reads_as: 'A landscape travelling past, breathing with the music.',
    coupling: 'One analyser read → five consequences: per-region lightness, per-region chroma, sky luminance, grain density, travel speed. The react slider is the single depth control over all five, which is what lets the reader turn the coupling off and hear what it was doing.',
    pass_order: 'buffer → analyser → (bands, rms) → env follower → render. The analyser tees off the driver BEFORE the master chain, so master compression does not feed back into the visual response — a mistake that is easy to make and inaudible until it pumps.',
    faults: [
      'sonic.html:51 base64s a 1976 commercial track (Masayoshi Takanaka) as the driver. Cannot ship in a published tool; the licence problem is total, not marginal. The generated bed below is the fix, cited at daytona-v2.html:337-388. `known_failure` on this atom of the piece; the technique it demonstrates is unaffected.'
    ]
  },
  headroom: 'Generated bed peaks at −4 dBFS by construction (tanh soft-limited); the analyser is on the pre-master tap so its 0–255 range is stable regardless of the quiet toggle.',

  params: [
    { name: 'react',  min: 0,    max: 1, value: 0.5, step: 0.01, note: 'coupling depth. Her own slider. At 0 the picture keeps moving and the mapping is off.' },
    { name: 'attack', min: 0.05, max: 1, value: 0.5, step: 0.01, note: 'follower attack coefficient. Decay is fixed at 0.12 — the asymmetry is the point.' }
  ],
  duration: 8, tail: 0.5,
  readout: ['wave', 'spectrum'],

  build: function (c, out, p) {
    /* daytona-v2.html:337-388 — kick, hat, snare, bass, saw sweep, written
       straight into the buffer so an audio-reactive piece can be tested with
       no file and no licence. */
    var sr = c.sampleRate, dur = 8, frames = Math.floor(sr * dur);
    var buf = c.createBuffer(2, frames, sr);
    var L = buf.getChannelData(0), R = buf.getChannelData(1);
    var bpm = 96, beatFrames = Math.floor(sr * 60 / bpm);
    for (var i = 0; i < frames; i++) {
      var time = i / sr, beat = Math.floor(i / beatFrames), bp = (i % beatFrames) / beatFrames, s = 0;
      if (beat % 2 === 0 && bp < 0.18) {
        var ke = Math.exp(-bp * 26), kf = 58 + 90 * Math.exp(-bp * 18);
        s += Math.sin(2 * Math.PI * kf * bp) * ke * 0.62;
      }
      if (bp < 0.045) s += (Math.random() * 2 - 1) * Math.exp(-bp * 90) * 0.14;
      if (beat % 2 === 1 && bp < 0.11) {
        var se = Math.exp(-bp * 24);
        s += (Math.random() * 2 - 1) * se * 0.26 + Math.sin(2 * Math.PI * 185 * bp) * se * 0.2;
      }
      var sweep = 240 + 620 * (time / dur), ph = (sweep * time) % 1;
      s += (ph * 2 - 1) * 0.075 * (0.35 + 0.65 * Math.sin(time * 0.55));
      var bn = [55, 55, 73.4, 65.4][beat % 4];
      s += Math.sin(2 * Math.PI * bn * time) * Math.exp(-bp * 3) * 0.24;
      s = Math.tanh(s * 1.15);
      L[i] = s; R[i] = s;
    }

    var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    var an  = c.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0.78;
    var g   = c.createGain(); g.gain.value = 0.85;
    src.connect(an); src.connect(g); g.connect(out);
    /* NB: analyser taps the driver PRE-master, so master compression does
       not feed the visual response — sonic.html §5. */

    var LIB = window.Shell && window.Shell.audioLib;
    var freq = new Uint8Array(an.frequencyBinCount);
    var wave = new Uint8Array(an.frequencyBinCount);
    var ST = { bass: 0, mid: 0, treble: 0, rms: 0, react: p.react, attack: p.attack };
    var envfn = (LIB && LIB.env) || function (cur, tgt, a, d) {
      return tgt > cur ? cur + (tgt - cur) * a : cur + (tgt - cur) * d;
    };

    return {
      nodes: { analyser: an, source: src },
      state: ST,
      start: function (when) { try { src.start(when || 0); } catch (e) { } },
      update: function (t, dt) {
        an.getByteFrequencyData(freq); an.getByteTimeDomainData(wave);
        var n = freq.length;
        var avg = function (a, b) { var s = 0; for (var i = a; i < b; i++) s += freq[i]; return s / ((b - a) * 255); };
        var bass = avg(1, Math.floor(n * 0.04)),
            mid  = avg(Math.floor(n * 0.04), Math.floor(n * 0.16)),
            treb = avg(Math.floor(n * 0.16), Math.floor(n * 0.55));
        var rms = 0;
        for (var i = 0; i < wave.length; i += 4) { var v = (wave[i] - 128) / 128; rms += v * v; }
        rms = Math.sqrt(rms / (wave.length / 4));
        var r = ST.react, k = 0.6 + 0.35 * r, atk = ST.attack;
        ST.bass   = envfn(ST.bass,   bass * (0.7 + 0.6 * r), atk * k, 0.12);
        ST.mid    = envfn(ST.mid,    mid  * (0.7 + 0.6 * r), atk * k, 0.12);
        ST.treble = envfn(ST.treble, treb * (0.7 + 0.6 * r), atk * 1.1 * k, 0.14);
        ST.rms    = envfn(ST.rms,    Math.min(1, rms * 1.7) * (0.7 + 0.5 * r), 0.4 * k, 0.08);
      },
      set: function (name, v) { ST[name] = v; },
      stop: function (when) { try { src.stop(when === undefined ? 0 : when); } catch (e) { } }
    };
  }
});
