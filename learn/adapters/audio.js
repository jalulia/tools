/* ============================================================================
   adapters/audio.js — the audio lane.

   Ported from team2/sound/proto/audio-adapter.html at ck-e0. The design
   decisions are the sound lead's; see SOUND-SECTION.md and REVIEW-SOUND.md.

   The contract this file implements is the phase-one one, plus one
   extension — `exportWav(cb)` — that the offline-render path needs:

     mount(o)     { entry, params, stage, bar }
     unmount()
     setParam(name, value)
     toggleRun()
     preview(el, entry, on)
     fillSource(el)         optional; textContent = entry.build source
     exportWav(cb)          cb({blob, buffer, peak}, err) — OfflineAudioContext WAV

   THE ONE-CONTEXT RULE.  Exactly one AudioContext lives on the page. Built
   inside the first user gesture (browser policy), never closed, never a
   second one — a contact sheet of many entries would exhaust the browser's
   context budget instantly, the same reason glsl.js refuses to give
   previews live WebGL contexts.

   REDUCED MOTION.  If prefers-reduced-motion is set the page ships in QUIET
   mode by default (−12 dB, not muted) and the readout draws one still frame
   from an OfflineAudioContext render — no rAF, no live analyser polling.
   That is the audio-lane analogue of the still-frame rule the other three
   adapters already follow.

   PAUSE.  The shell dispatches `lens:pause` when the entry becomes
   background — a rail scroll, an apparatus open. The adapter treats it as a
   toggleRun off, so a piece that is playing does not keep playing while its
   own picture is offscreen.

   The FIELD NAMES on the critique block are the shared schema's — `reads_as`
   and `pass_order` — so a sound entry and a visual entry are the same record
   and match the same search (REVIEW-SOUND §2.1). Only the LABELS change per
   lane and that is a job for views.js, not this file.
   ============================================================================ */
(function () {
  'use strict';
  if (!window.Shell) { console.warn('[audio] Shell is not on the page yet'); return; }
  var S = window.Shell;

  /* ==========================================================================
     0. Shared subsystem — one context, one master chain, one analyser.

     Attached to Shell.audio at load. Idempotent: if a second copy of this
     file loaded (it should not), the second call is a no-op.
     ========================================================================== */
  if (!S.audio) {
    var _ctx = null, _master = null, _quiet = false;

    function buildMaster(c) {
      /* Ported verbatim in structure from
         reliquary-synth/src/audio/MasterChain.ts:1-33. Two
         DynamicsCompressorNodes used as two different devices by parameters
         alone: comp is a broadband glue, lim is a hard peak-catcher. */
      var input = c.createGain(); input.gain.value = 0.8;
      var trim = c.createGain(); trim.gain.value = 1;

      var comp = c.createDynamicsCompressor();
      comp.threshold.value = -24; comp.knee.value = 12; comp.ratio.value = 4;
      comp.attack.value = 0.003; comp.release.value = 0.25;

      var lim = c.createDynamicsCompressor();
      lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20;
      lim.attack.value = 0.001; lim.release.value = 0.1;

      var an = c.createAnalyser();
      an.fftSize = 2048; an.smoothingTimeConstant = 0.72;

      input.connect(trim); trim.connect(comp); comp.connect(lim);
      lim.connect(an); an.connect(c.destination);
      return { input: input, trim: trim, comp: comp, limiter: lim, analyser: an };
    }

    S.audio = {
      has: function () { return !!_ctx; },
      ctx: function () {
        if (_ctx) return _ctx;
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        _ctx = new AC();
        _master = buildMaster(_ctx);
        return _ctx;
      },
      master: function () { return _master ? _master.input : null; },
      analyser: function () { return _master ? _master.analyser : null; },
      resume: function () { if (_ctx && _ctx.state === 'suspended') _ctx.resume(); },
      setQuiet: function (on) {
        _quiet = !!on;
        if (!_master) return;
        /* −12 dB, not mute: quiet mode is a level decision, not an off switch. */
        _master.trim.gain.setTargetAtTime(_quiet ? 0.25 : 1, _ctx.currentTime, 0.05);
      },
      isQuiet: function () { return _quiet; }
    };
  }

  /* ==========================================================================
     1. WAV encoder — pussyphus/.../src/audio/fragments.generated.js:9-38,
     extended to stereo. Reused verbatim because it is hers and correct.
     ========================================================================== */
  function encodeWav(buffer) {
    var chans = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate;
    var data = [];
    for (var c = 0; c < chans; c++) data.push(buffer.getChannelData(c));
    var bytes = 44 + len * chans * 2;
    var ab = new ArrayBuffer(bytes), v = new DataView(ab);
    function w(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    w(0, 'RIFF'); v.setUint32(4, bytes - 8, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, chans, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * chans * 2, true);
    v.setUint16(32, chans * 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, len * chans * 2, true);
    var o = 44;
    for (var i = 0; i < len; i++) {
      for (var ch = 0; ch < chans; ch++) {
        var s = Math.max(-1, Math.min(1, data[ch][i]));
        v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); o += 2;
      }
    }
    return new Blob([ab], { type: 'audio/wav' });
  }

  /* ==========================================================================
     2. LIB — shared patch helpers, the audio equivalent of canvas2d.js's LIB.
     Every function is lifted from a specific file:line in Julia's corpus.
     Made available on Shell.audioLib for entry patches to reuse.
     ========================================================================== */
  var LIB = (function () {
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    var noiseCache = new WeakMap();
    /* holy-ops-v2/index.html:2359-2367 — one noise buffer, memoised per ctx. */
    function whiteNoise(c) {
      var b = noiseCache.get(c); if (b) return b;
      var len = Math.floor(c.sampleRate * 1);
      b = c.createBuffer(1, len, c.sampleRate);
      var d = b.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      noiseCache.set(c, b); return b;
    }

    /* pussyphus/.../crowd.js:132-142 + foley.js:39-55. */
    function bandedBurst(c, out, when, opt) {
      var src = c.createBufferSource(); src.buffer = whiteNoise(c);
      var bp = c.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = opt.freq; bp.Q.value = opt.Q || 4;
      var env = c.createGain();
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(opt.gain, when + (opt.attack || 0.002));
      env.gain.exponentialRampToValueAtTime(0.0001, when + opt.dur);
      env.gain.setValueAtTime(0, when + opt.dur + 0.001);
      src.connect(bp); bp.connect(env); env.connect(out);
      src.start(when); src.stop(when + opt.dur + 0.02);
    }

    /* Ki-Landscapes/sonic.html:26-38, verbatim in structure. */
    function s2l(x) { x /= 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
    function rgbToOklch(r, g, b) {
      r = s2l(r); g = s2l(g); b = s2l(b);
      var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b),
          m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b),
          s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
      var L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
          A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
          B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
      return { L: L, C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
    }
    function oklabToRgb(L, a, b) {
      var l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3),
          m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3),
          s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
      var r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
      var f = function (x) {
        x = clamp(x, 0, 1);
        return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255);
      };
      return [f(r), f(g), f(bl)];
    }
    var okToLab = function (ok) {
      return { L: ok.L, a: ok.C * Math.cos(ok.H * Math.PI / 180), b: ok.C * Math.sin(ok.H * Math.PI / 180) };
    };
    var hex2rgb = function (h) {
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    };
    var labStr = function (l) { return 'rgb(' + oklabToRgb(l.L, l.a, l.b).join(',') + ')'; };
    var lerpLab = function (p, q, t) {
      return { L: lerp(p.L, q.L, t), a: lerp(p.a, q.a, t), b: lerp(p.b, q.b, t) };
    };

    /* Ki-Landscapes/sonic.html:54-56 — mulberry32 + value noise, verbatim. */
    function mulberry32(a) {
      return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function makeNoise(seed, nodes) {
      var r = mulberry32(seed), a = new Array(nodes);
      for (var i = 0; i < nodes; i++) a[i] = r() * 2 - 1;
      return function (x) {
        var i2 = Math.floor(x), f = x - i2;
        var a0 = a[((i2 % nodes) + nodes) % nodes], a1 = a[(((i2 + 1) % nodes) + nodes) % nodes];
        var u = f * f * f * (f * (f * 6 - 15) + 10);
        return a0 + (a1 - a0) * u;
      };
    }
    function env(cur, tgt, atk, dec) { return tgt > cur ? cur + (tgt - cur) * atk : cur + (tgt - cur) * dec; }

    return { clamp: clamp, lerp: lerp, whiteNoise: whiteNoise, bandedBurst: bandedBurst,
             rgbToOklch: rgbToOklch, oklabToRgb: oklabToRgb, okToLab: okToLab, hex2rgb: hex2rgb,
             labStr: labStr, lerpLab: lerpLab, mulberry32: mulberry32, makeNoise: makeNoise, env: env };
  })();
  S.audioLib = LIB;

  /* ==========================================================================
     3. Offline render — the still-frame source and the WAV export share
     one mechanism. build() takes A context (a live AC or an OAC); update()
     takes an ABSOLUTE time. Offline loops it over virtual time.
     ========================================================================== */
  function renderOffline(entry, params, cb) {
    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) { cb(null, 'no OfflineAudioContext'); return; }
    var sr = 44100, total = (entry.duration || 4) + (entry.tail || 0.5);
    var oc;
    try { oc = new OAC(2, Math.ceil(sr * total), sr); }
    catch (err) { cb(null, String(err && err.message || err)); return; }

    var out = oc.createGain(); out.gain.value = 0.8;
    var comp = oc.createDynamicsCompressor();
    comp.threshold.value = -24; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.003; comp.release.value = 0.25;
    var lim = oc.createDynamicsCompressor();
    lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20;
    lim.attack.value = 0.001; lim.release.value = 0.1;
    out.connect(comp); comp.connect(lim); lim.connect(oc.destination);

    var pt;
    try { pt = entry.build(oc, out, params); } catch (err) { cb(null, 'build: ' + err.message); return; }
    try {
      pt.start(0);
      var STEP = 1 / 30;
      for (var t = 0; t < entry.duration; t += STEP) { if (pt.update) pt.update(t, STEP); }
      if (pt.stop) pt.stop(entry.duration);
    } catch (err) { cb(null, 'schedule: ' + err.message); return; }

    var p = oc.startRendering();
    if (p && p.then) p.then(function (b) { cb(b, null); }, function (err) { cb(null, String(err)); });
    else oc.oncomplete = function (ev) { cb(ev.renderedBuffer, null); };
  }

  function peakOf(buffer) {
    var pk = 0;
    for (var c = 0; c < buffer.numberOfChannels; c++) {
      var d = buffer.getChannelData(c);
      for (var i = 0; i < d.length; i += 17) { var a = Math.abs(d[i]); if (a > pk) pk = a; }
    }
    return pk;
  }
  function downsample(buffer, n) {
    var d = buffer.getChannelData(0), out = new Float32Array(n), step = d.length / n;
    for (var i = 0; i < n; i++) {
      var a = Math.floor(i * step), b = Math.min(d.length, Math.floor((i + 1) * step)), m = 0;
      for (var j = a; j < b; j++) { var v = Math.abs(d[j]); if (v > m) m = v; }
      out[i] = (i % 2 ? -m : m);
    }
    return out;
  }
  function spectrumOf(buffer, bins) {
    var d = buffer.getChannelData(0), sr = buffer.sampleRate, out = new Uint8Array(bins);
    var seg = Math.min(4096, d.length);
    for (var k = 0; k < bins; k++) {
      var f = (k + 0.5) / bins * (sr / 2);
      if (f < 20) { out[k] = 0; continue; }
      var re = 0, im = 0, w = 2 * Math.PI * f / sr;
      for (var i = 0; i < seg; i += 2) { re += d[i] * Math.cos(w * i); im += d[i] * Math.sin(w * i); }
      var mag = Math.sqrt(re * re + im * im) / (seg / 2);
      out[k] = Math.max(0, Math.min(255, Math.round((Math.log10(mag + 1e-6) + 4) / 4 * 255)));
    }
    return out;
  }

  /* ==========================================================================
     4. Drawing — waveform + spectrum. No hue.
     ========================================================================== */
  function fit(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w > 0 && h > 0 && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; }
    return dpr;
  }
  function drawWave(cv, data, live) {
    var g = cv.getContext('2d'); fit(cv);
    var W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(11,11,12,.10)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    if (!data || !data.length) return;
    g.strokeStyle = live ? '#0b0b0c' : 'rgba(11,11,12,.35)';
    g.lineWidth = Math.max(1, Math.round(W / 900));
    g.beginPath();
    var step = data.length / W;
    for (var x = 0; x < W; x++) {
      var i = Math.floor(x * step);
      var v = data.BYTES_PER_ELEMENT === 1 ? (data[i] - 128) / 128 : data[i];
      var y = H / 2 - v * (H / 2 - 3);
      if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  }
  function drawSpectrum(cv, freq, sampleRate, live) {
    var g = cv.getContext('2d'); fit(cv);
    var W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    if (!freq || !freq.length) return;
    var nyq = sampleRate / 2, fmin = 30, fmax = Math.min(18000, nyq);
    var lmin = Math.log10(fmin), lmax = Math.log10(fmax);
    g.strokeStyle = 'rgba(11,11,12,.07)'; g.lineWidth = 1;
    g.fillStyle = 'rgba(11,11,12,.30)';
    g.font = (10 * Math.min(window.devicePixelRatio || 1, 2)) + 'px ui-monospace,monospace';
    [100, 1000, 10000].forEach(function (f) {
      if (f > fmax) return;
      var x = Math.round((Math.log10(f) - lmin) / (lmax - lmin) * W) + 0.5;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
      g.fillText(f >= 1000 ? (f / 1000) + 'k' : String(f), x + 4, H - 5);
    });
    g.fillStyle = live ? 'rgba(11,11,12,.82)' : 'rgba(11,11,12,.28)';
    g.beginPath(); g.moveTo(0, H);
    for (var x = 0; x < W; x++) {
      var f = Math.pow(10, lmin + (x / W) * (lmax - lmin));
      var bin = Math.min(freq.length - 1, Math.max(0, Math.round(f / nyq * freq.length)));
      var v = freq[bin] / 255;
      g.lineTo(x, H - v * (H - 2));
    }
    g.lineTo(W, H); g.closePath(); g.fill();
  }

  /* ==========================================================================
     5. THE ADAPTER — mount / unmount / setParam / toggleRun / preview /
     fillSource / exportWav. Everything above is machinery.
     ========================================================================== */
  var entry = null, P = {}, patch = null, raf = null, playing = false;
  var canvases = {}, panesEl = null, barEl = null, lastT = 0, stillDrawn = false;
  var pauseHandler = null;

  function loop(now) {
    raf = requestAnimationFrame(loop);
    var c = S.audio.ctx();
    if (!c || !patch) return;
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;
    if (playing && patch.update) { try { patch.update(c.currentTime, dt); } catch (e) { } }

    var an = (patch.nodes && patch.nodes.analyser) || S.audio.analyser();
    if (an) {
      if (canvases.wave) {
        var wv = new Uint8Array(an.fftSize); an.getByteTimeDomainData(wv);
        drawWave(canvases.wave, wv, playing);
      }
      if (canvases.spectrum) {
        var fq = new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(fq);
        drawSpectrum(canvases.spectrum, fq, c.sampleRate, playing);
      }
    }
  }

  function defaults(e) {
    var o = {}; (e.params || []).forEach(function (p) { o[p.name] = p.value; }); return o;
  }

  var adapter = {
    __lane: 'audio',

    mount: function (o) {
      adapter.unmount();
      entry = o.entry; panesEl = o.stage; barEl = o.bar;
      P = {};
      (entry.params || []).forEach(function (p) {
        P[p.name] = (o.params && o.params[p.name] !== undefined) ? o.params[p.name] : p.value;
      });

      /* Readout panes. NO AudioContext is created here — only on gesture. */
      canvases = {};
      panesEl.innerHTML = '';
      var heights = { wave: 132, spectrum: 132 };
      var labels = { wave: 'waveform', spectrum: 'spectrum · log Hz' };
      (entry.readout || ['wave', 'spectrum']).forEach(function (kind) {
        if (!heights[kind]) return;    /* landscape and other bespoke panes are entry-owned */
        var d = document.createElement('div');
        d.className = 'audio-pane'; d.style.cssText = 'position:relative;border-bottom:1px solid #e3e3e5;height:' + heights[kind] + 'px;background:#fff';
        var cv = document.createElement('canvas'); cv.style.cssText = 'display:block;width:100%;height:100%';
        var tg = document.createElement('span');
        tg.style.cssText = 'position:absolute;left:9px;top:7px;font-family:ui-monospace,monospace;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;color:#74747a;pointer-events:none';
        tg.textContent = labels[kind];
        d.appendChild(cv); d.appendChild(tg); panesEl.appendChild(d);
        canvases[kind] = cv;
      });

      stillDrawn = false;
      adapter.still();
      window.addEventListener('resize', adapter.still);

      /* pause = lens:pause. If we are playing when the entry is backgrounded
         we stop; we do NOT auto-resume — the reader turns audio back on. */
      pauseHandler = function () { if (playing) adapter.toggleRun(); };
      window.addEventListener('lens:pause', pauseHandler);

      /* reduced-motion → quiet by default, and NO rAF loop. The still frame
         is what the reader sees; pressing Play still works. */
      if (S.reduced && S.reduced()) S.audio.setQuiet(true);
    },

    still: function () {
      if (!entry) return;
      if (stillDrawn) return;
      renderOffline(entry, P, function (buf, err) {
        if (err || !buf) return;
        stillDrawn = true;
        if (canvases.wave) drawWave(canvases.wave, downsample(buf, 1400), false);
        if (canvases.spectrum) drawSpectrum(canvases.spectrum, spectrumOf(buf, 256), buf.sampleRate, false);
      });
    },

    unmount: function () {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      window.removeEventListener('resize', adapter.still);
      if (pauseHandler) { window.removeEventListener('lens:pause', pauseHandler); pauseHandler = null; }
      if (patch) {
        var c = S.audio.has() ? S.audio.ctx() : null;
        try { patch.stop(c ? c.currentTime : 0); } catch (e) { }
        /* Disconnect the subgraph. NEVER close the context — the next entry
           needs it, and a closed context cannot be reopened. */
        var dead = patch;
        setTimeout(function () {
          try { Object.keys(dead.nodes || {}).forEach(function (k) {
            var n = dead.nodes[k]; if (n && n.disconnect) n.disconnect();
          }); } catch (e) { }
        }, 300);
        patch = null;
      }
      playing = false; lastT = 0; canvases = {};
    },

    /* Gesture unlock. The context is constructed HERE. */
    toggleRun: function () {
      if (!entry) return;
      var c = S.audio.ctx();
      if (!c) return;
      S.audio.resume();
      if (playing) {
        playing = false;
        try { patch.stop(c.currentTime); } catch (e) { }
        var dead = patch; patch = null;
        setTimeout(function () {
          try { Object.keys(dead.nodes || {}).forEach(function (k) {
            var n = dead.nodes[k]; if (n && n.disconnect) n.disconnect();
          }); } catch (e) { }
        }, 400);
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        return;
      }
      try {
        patch = entry.build(c, S.audio.master(), P);
        patch.start(c.currentTime + 0.02);
        playing = true;
        /* prefers-reduced-motion → no loop. Still frame + audio; the readout
           does not repaint on rAF (the sound lead's ruling). */
        if (!(S.reduced && S.reduced())) {
          if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); }
        }
      } catch (e) { /* build failed; stay silent, the caller updates its own UI */ }
    },

    setParam: function (name, value) {
      P[name] = value;
      stillDrawn = false;
      if (patch && patch.set) {
        var c = S.audio.ctx();
        var r = patch.set(name, value, c ? c.currentTime + 0.01 : 0);
        if (r === 'rebuild' && playing) { adapter.toggleRun(); adapter.toggleRun(); }
      }
      if (!playing) adapter.still();
    },

    fillSource: function (el) {
      if (!entry || !entry.build) return;
      /* textContent, so no HTML escaping needed — S.esc here double-escapes `<`. */
      el.textContent = entry.build.toString();
    },

    /* Contact-sheet preview: still waveform, never a live context. */
    preview: function (el, e, on) {
      if (!on || el.getAttribute('data-mounted')) return;
      if (!e || !e.build) return;
      el.setAttribute('data-mounted', 'true');
      renderOffline(e, defaults(e), function (buf) {
        if (!buf) return;
        var cv = document.createElement('canvas');
        cv.width = 232; cv.height = 98;
        cv.style.cssText = 'width:100%;height:98px;display:block;background:#fff';
        el.appendChild(cv);
        drawWave(cv, downsample(buf, 232), false);
      });
    },

    exportWav: function (cb) {
      if (!entry) { cb(null, 'no entry mounted'); return; }
      renderOffline(entry, P, function (buf, err) {
        if (err || !buf) { cb(null, err || 'render failed'); return; }
        cb({ blob: encodeWav(buf), buffer: buf, peak: peakOf(buf) }, null);
      });
    },

    /* how many contexts are alive — one, or zero. The shell polls this
       before deciding whether to unmount idle previews. */
    liveCount: function () { return S.audio.has() ? 1 : 0; },

    current: function () { return { entry: entry, params: P, playing: playing, patch: patch }; }
  };

  S.registerAdapter('audio', adapter);
})();
