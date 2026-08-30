/* crowd-and-dither-shared-cause — the coupling entry that shows both sides
   of one variable. In pussyphus, `uFlow` (the player's flow state, 0..1)
   drives BOTH the audio crowd filter (crowd.js:25-83 → cutoff + Q) AND the
   depth-aware dither shader (dither.js: uFlow raises level count, opens
   the vignette, shifts colour warm). Two files, two files' worth of
   consequences, one variable.

   Per REVIEW-SOUND §2.2 and DECISION-FRAMING D3, a coupling is NOT a third
   page kind. It is an entry with entity: 'coupling', a driver line, a
   consequences[] table, a `shared-cause` relation to the piece on the
   other side, and a two-pane readout. The audio pane plays a crowded
   room being filtered by flow; the visual pane is the shader from the
   sibling entry, driven by the same slider. That is the whole point.

   No FAULTS block: the coupling is the point of the piece, not a bug
   inside one — the fault would be `uFlow` living in two files and
   diverging, which is the thing filing them as one record fixes. */
Shell.registerEntry({
  entity: 'coupling',
  id: 'crowd-and-dither-shared-cause',
  index: 'C-FLOW',
  order: 3050,
  title: 'uFlow — one variable, two files, one entry',
  section: 'sound',
  status: 'canonical',
  lane: 'audio',                     /* the audio adapter is the primary lane */
  tags: ['coupling', 'shared-cause', 'sidechain', 'shader-and-sound'],
  governed_by: ['composing-computational-sound-systems', 'composing-computational-material-systems'],
  uses: ['banded-burst', 'sidechain-duck', 'master-limiter'],

  source: {
    kind: 'adapted',
    title: 'pussyphus/.../src/audio/crowd.js:25-83 + src/render/dither.js:10-90',
    author: 'Julia Compton',
    note: 'The audio side is real: banded crowd bursts filtered by the flow-driven cutoff. The visual side draws a compact schematic of the dither pass — the shader itself is entry `mir-11-depth-dither` in the shader lane; here it is the shared-cause counterpart.'
  },

  driver: 'uFlow — a single 0..1 scalar (the player\'s flow state) read once per frame and consumed by two subsystems that live in two different files.',
  consequences: [
    ['crowd.js filter cutoff', 'lerp(800 Hz, 8000 Hz, flow) — the room opens as flow rises', 'pussyphus/.../src/audio/crowd.js:25-83'],
    ['crowd.js filter Q',      'lerp(0.5, 1.2, flow) — high flow adds a nasal peak', 'pussyphus/.../src/audio/crowd.js:25-83 + design doc §5.1'],
    ['per-NPC absorption',     'attenuated by (1 − FLOW_OCCLUSION_ATTEN·flow) — high flow tunes the crowd out', 'pussyphus/.../src/audio/crowd.js:60-83'],
    ['dither.js level count',  '10 + uFlow·6 — the picture posterises finer as flow rises', 'pussyphus/.../src/render/dither.js:10-90'],
    ['dither.js dither strength','falls with flow — noise gives way to clean bands', 'pussyphus/.../src/render/dither.js:10-90'],
    ['dither.js vignette',     'opens with flow — the frame widens as attention widens', 'pussyphus/.../src/render/dither.js:10-90']
  ],
  mute_test: 'Mute the audio: the visual crossfade from grainy → posterised still reads and still means the same thing. Freeze the picture: the room brightening under the same slider still lands as a change in attention. Both directions pass. That is the argument for filing this as ONE entry, not two.',

  /* The `shared-cause` relation would resolve to `mir-11` (depth-aware
     dither shader) when the ck-e7 inventory import lands it. Declared
     inline in the driver/consequences table above until then; adding a
     `related[]` pointer to an id the manifest does not yet carry would
     fail verifyManifests, and a dangling promise is worse than a stated
     absence. Turn on when mir-11 is on the roster. */

  text: `
    <p>Two files, one variable. <code>src/audio/crowd.js</code> opens the
    room filter as flow rises: cutoff climbs from 800 Hz to 8 kHz, Q from
    0.5 to 1.2, and per-NPC absorption is attenuated so the physics of the
    crowd fades out of the way. <code>src/render/dither.js</code> raises the
    posterise level count from 10 to 16, dims the dither noise, and opens
    the vignette. Both files read the same 0..1 scalar; nothing coordinates
    them beyond that.</p>

    <p>This is what compound causality looks like when it survives being
    split across two lanes: <b>the variable is the coupling</b>, not any
    edge in the code. The right test is the mute test in both directions:
    turn off the sound, does the picture still mean the same thing? Turn
    off the picture, does the sound? Here both pass.</p>

    <p>The audio pane below plays banded crowd bursts filtered by the flow
    scrubber. The visual pane draws a schematic of the shader — level count
    and vignette — driven by the same slider. Move flow and both change; if
    they moved independently the shared-cause claim would be false, and
    this file would not be one entry.</p>
  `,

  critique: {
    reads_as: 'A room that thins and opens as focus tightens.',
    coupling: 'uFlow is the whole point. Every consequence in the table above reads it; nothing else does. That is what "shared cause" means as a testable claim.',
    pass_order: 'flow → (audio: cutoff, Q, absorb attenuation) and (visual: levels, dither, vignette) — two branches from one source, each with its own downstream chain, meeting again in the reader.'
  },
  headroom: 'The audio pane is banded crowd bursts summed through a lowpass — a filter is a level control here, not an effect. Peak lands near −10 dBFS across the flow range because the cutoff climbs faster than the burst level.',

  params: [
    { name: 'flow',    min: 0,  max: 1,   value: 0.4, step: 0.01, note: 'THE shared cause. Move it; watch both panes.' },
    { name: 'density', min: 2,  max: 12,  value: 6,   step: 1,    note: 'crowd bursts per second — a distinct knob, deliberately.' }
  ],
  duration: 6, tail: 0.5,
  readout: ['wave', 'spectrum', 'coupling-schematic'],

  build: function (c, out, p) {
    var LIB = window.Shell && window.Shell.audioLib;

    /* the room filter — the audio consequence of uFlow */
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 800 + p.flow * 7200;
    lp.Q.value = 0.5 + p.flow * 0.7;
    var g = c.createGain(); g.gain.value = 0.7;
    lp.connect(g); g.connect(out);

    var ST = { flow: p.flow, density: p.density, nextHit: 0 };

    return {
      nodes: { lp: lp, g: g },
      state: ST,
      start: function (when) { ST.nextHit = (when || 0) + 0.05; },
      update: function (t) {
        if (!LIB) return;
        var interval = 1 / Math.max(1, ST.density);
        while (ST.nextHit < t + 0.2) {
          /* two banded bursts per hit — the crowd's low and high thump */
          var jitter = (Math.random() - 0.5) * 0.15 * interval;
          LIB.bandedBurst(c, lp, ST.nextHit,
            { freq: 400 + Math.random() * 200, Q: 3, gain: 0.55, dur: 0.05, attack: 0.003 });
          LIB.bandedBurst(c, lp, ST.nextHit + 0.008,
            { freq: 1500 + Math.random() * 800, Q: 2.5, gain: 0.35, dur: 0.03, attack: 0.002 });
          ST.nextHit += interval + jitter;
        }
      },
      set: function (name, v, t) {
        var when = t || (c.currentTime + 0.01);
        ST[name] = v;
        if (name === 'flow') {
          lp.frequency.setTargetAtTime(800 + v * 7200, when, 0.06);
          lp.Q.setTargetAtTime(0.5 + v * 0.7, when, 0.06);
        }
      },
      stop: function () { }
    };
  }
});
