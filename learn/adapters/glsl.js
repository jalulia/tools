/* ============================================================================
   adapters/glsl.js — the WebGL stage.

   Lifted from book-of-shaders/index.html:800-917, keeping the three parts of
   that file worth keeping:
     · the authored procedural default texture (:860-880) — a high-contrast
       scene with deliberately hard edges, so the convolution chapters have
       something to find, and no asset ships;
     · the mouse-to-gl_FragCoord mapping (:911-917) — drawing-buffer pixels,
       origin bottom-left, which is what the shader actually sees;
     · the DPR cap (:884).

   Added here, all absent from the original:
     · u_tex0 bound as primary with u_tex kept as an alias, so shaders move
       between this tool and glslCanvas in both directions (the old tool bound
       u_tex only, which broke every upstream example);
     · a webglcontextlost handler and a null-context guard;
     · the errored line connected to the gutter — the driver already says
       "ERROR: 0:14:" and the editor already has line numbers; the tool never
       joined them up;
     · a compile status readout in the drawdown strip;
     · named parameters bound as uniforms;
     · prefers-reduced-motion: render one frame and stop, rather than animating
       behind a visibility trick.
   ============================================================================ */
(function () {
  'use strict';
  var S = window.Shell;

  var cv = null, gl = null, program = null, uloc = {}, raf = null, quad = null, tex = null;
  var clock = 0, lastT = 0, playing = true, lost = false;
  var mouse = [0, 0], res = [1, 1];
  var host = null, bar = null, entry = null, example = null;
  var buffer = '', params = {}, uniformNames = [], paramDefs = [];
  var errLine = -1, status = 'compiled', log = '';
  var compileTimer = null;

  var VERT = 'attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }';

  /* ------------------------------------------------------------- context */
  function ensureContext(stage) {
    cv = document.createElement('canvas');
    cv.className = 'gl';
    stage.innerHTML = '';
    stage.appendChild(cv);
    gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
    if (!gl) {
      // Null-context guard. A machine without WebGL should say so, in the
      // vocabulary of the page, not throw into the console.
      stage.innerHTML = '<p class="glnote">NO WEBGL CONTEXT ON THIS MACHINE</p>';
      return false;
    }
    cv.addEventListener('webglcontextlost', onLost, false);
    cv.addEventListener('webglcontextrestored', onRestored, false);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    tex = gl.createTexture();
    defaultTexture();
    cv.addEventListener('mousemove', onMouse);
    return true;
  }

  function onLost(ev) {
    ev.preventDefault();
    lost = true;
    stopLoop();
    setStatus('error', 'WebGL context lost. It will recompile when the browser restores it.');
  }
  function onRestored() {
    lost = false;
    if (!host) return;
    if (ensureContext(host)) { compile(buffer); startLoop(); }
  }

  /* ------------------------------------------------------------- shaders */
  function makeShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var l = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      return { err: l };
    }
    return { shader: s };
  }

  function compile(src) {
    if (!gl || lost) return;
    var vs = makeShader(gl.VERTEX_SHADER, VERT);
    var fs = makeShader(gl.FRAGMENT_SHADER, src);
    if (fs.err) {
      if (vs.shader) gl.deleteShader(vs.shader);
      return fail(fs.err);
    }
    var p = gl.createProgram();
    gl.attachShader(p, vs.shader);
    gl.attachShader(p, fs.shader);
    gl.bindAttribLocation(p, 0, 'a_pos');
    gl.linkProgram(p);
    gl.deleteShader(vs.shader);
    gl.deleteShader(fs.shader);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      var pl = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      return fail(pl || 'program did not link');
    }
    if (program) gl.deleteProgram(program);
    program = p;
    uloc = {
      res:   gl.getUniformLocation(p, 'u_resolution'),
      time:  gl.getUniformLocation(p, 'u_time'),
      mouse: gl.getUniformLocation(p, 'u_mouse'),
      // u_tex0 is primary; u_tex is kept as an alias so a shader written for
      // either convention runs here unchanged.
      tex0:  gl.getUniformLocation(p, 'u_tex0'),
      tex:   gl.getUniformLocation(p, 'u_tex')
    };
    uniformNames.forEach(function (n) { uloc[n] = gl.getUniformLocation(p, n); });
    markParams();
    errLine = -1;
    var lines = src.split('\n').length;
    setStatus('compiled', 'No errors · ' + lines + ' lines');
    return true;
  }

  /* A declared parameter whose uniform is not in the program that is actually
     running — because the lane is per example and chapter 05's fourteen curves
     each read the two or three knobs they need. The panel says so rather than
     offering a slider that does nothing. */
  function markParams() {
    paramDefs.forEach(function (d) {
      var inp = document.getElementById('par-' + d.name);
      if (!inp) return;
      var box = inp.parentNode;
      while (box && box.className !== 'par') box = box.parentNode;
      if (box) box.setAttribute('data-inactive', String(!uloc[d.uniform]));
    });
  }

  function fail(l) {
    log = String(l || '').replace(/\0/g, '').trim();
    var m = /ERROR:\s*\d+:(\d+)/.exec(log);
    errLine = m ? parseInt(m[1], 10) : -1;
    setStatus('error', log);
    return false;
  }

  function setStatus(kind, message) {
    status = kind; log = message;
    var r = document.getElementById('compile');
    if (r) {
      r.textContent = kind === 'error' ? 'FAILED' : 'COMPILED';
      if (kind === 'error') r.parentNode.setAttribute('data-state', 'error');
      else r.parentNode.removeAttribute('data-state');
    }
    var con = document.getElementById('con');
    if (con) {
      if (kind === 'error') { con.setAttribute('data-state', 'error'); con.textContent = 'FAILED · ' + message; }
      else { con.removeAttribute('data-state'); con.textContent = message; }
    }
    paintGutter();
  }

  /* ------------------------------------------------------------- texture */
  function bindTexImage(img) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  /* The authored default scene: hard edges on purpose, so a convolution or a
     quantization chapter has something to find. No asset ships with the tool. */
  function defaultTexture() {
    var c = document.createElement('canvas'); c.width = c.height = 512;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#1a2740'); g.addColorStop(0.55, '#3a4f6e');
    g.addColorStop(0.56, '#c9a36b'); g.addColorStop(1, '#e6c79a');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
    x.fillStyle = '#ffd98a'; x.beginPath(); x.arc(150, 150, 55, 0, 7); x.fill();
    x.fillStyle = '#243b2e'; x.beginPath(); x.moveTo(0, 360);
    for (var i = 0; i <= 512; i += 8) x.lineTo(i, 360 - 60 * Math.sin(i * 0.012) - 25 * Math.sin(i * 0.05));
    x.lineTo(512, 512); x.lineTo(0, 512); x.fill();
    x.fillStyle = '#172a20'; x.beginPath(); x.moveTo(0, 420);
    for (var j = 0; j <= 512; j += 8) x.lineTo(j, 420 - 40 * Math.cos(j * 0.018));
    x.lineTo(512, 512); x.lineTo(0, 512); x.fill();
    x.fillStyle = '#c8503f'; x.fillRect(360, 70, 90, 90);
    x.strokeStyle = '#e9e6e1'; x.lineWidth = 6; x.strokeRect(60, 250, 120, 70);
    x.fillStyle = '#6fa8c7'; x.beginPath(); x.moveTo(300, 300); x.lineTo(360, 300); x.lineTo(330, 250); x.fill();
    bindTexImage(c);
  }

  /* Bring-your-own-image. Chapters 00 and 15-19 read a source image; the tool
     ships no asset, because the scene above is drawn. But being able to point
     a convolution at your own photograph is one of the five things research/04
     §4 names as better here than in the book, and losing it in the migration
     would be a regression, so it lands with the chapters that need it
     (checkpoint 3, deferred from checkpoint 1).

     Read as a data: URL, not as a blob: URL the way the old tool did
     (index.html:1067). Under file:// this document's origin is opaque, and an
     <img> from a blob: URL can taint the WebGL upload; a data: URL never does.
     Nothing is fetched — FileReader reads a file the user chose. */
  function wantsTexture(e) {
    var c = (e && e.stage && e.stage.controls) || [];
    return !!(e && e.stage && e.stage.texture) || c.indexOf('texture-upload') >= 0;
  }

  function textureControl() {
    return '<button type="button" class="lnk" id="tex-pick">Image</button>' +
           '<input type="file" id="tex-file" accept="image/*" hidden ' +
           'aria-label="Use your own image on this stage">';
  }

  function wireTexture() {
    var btn = document.getElementById('tex-pick'), inp = document.getElementById('tex-file');
    if (!btn || !inp) return;
    btn.addEventListener('click', function () { inp.click(); });
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var img = new Image();
        img.onload = function () {
          if (!gl || lost) return;
          bindTexImage(img);
          drawOnce();
          btn.textContent = f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name;
        };
        img.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }

  /* ---------------------------------------------------------- render loop */
  function resize() {
    if (!gl || !cv) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);   // the DPR cap
    var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (w < 1 || h < 1) return;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    res = [cv.width, cv.height];
    gl.viewport(0, 0, cv.width, cv.height);
  }

  function drawOnce() {
    if (!gl || lost || !program) return;
    resize();
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    if (uloc.res) gl.uniform2f(uloc.res, res[0], res[1]);
    if (uloc.time) gl.uniform1f(uloc.time, clock);
    if (uloc.mouse) gl.uniform2f(uloc.mouse, mouse[0], mouse[1]);
    if (uloc.tex0 || uloc.tex) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      if (uloc.tex0) gl.uniform1i(uloc.tex0, 0);
      if (uloc.tex) gl.uniform1i(uloc.tex, 0);
    }
    uniformNames.forEach(function (n) {
      if (uloc[n] && params[n] !== undefined) gl.uniform1f(uloc[n], params[n]);
    });
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    readout();
  }

  function tickLoop(now) {
    raf = requestAnimationFrame(tickLoop);
    var dt = (now - lastT) / 1000; lastT = now;
    if (playing) clock += dt;
    drawOnce();
  }

  function startLoop() {
    // Reduced motion: render one frame and stop. Not "animate behind a
    // visibility trick" — the callbacks actually go away, which is what
    // criterion 4 measures.
    if (S.reduced()) { playing = false; resize(); drawOnce(); return; }
    if (raf) return;
    lastT = performance.now();
    raf = requestAnimationFrame(tickLoop);
  }
  function stopLoop() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  function readout() {
    var cells = document.getElementById('glread');
    if (!cells) return;
    cells.innerHTML =
      '<span><span class="k">res</span> ' + res[0] + ' × ' + res[1] + '</span>' +
      '<span><span class="k">t</span> ' + clock.toFixed(2) + '</span>' +
      '<span class="opt"><span class="k">mouse</span> ' +
        Math.round(mouse[0]) + ', ' + Math.round(mouse[1]) + '</span>' +
      (uniformNames.length
        ? '<span class="opt">' + uniformNames.map(function (n) {
            var v = params[n];
            return '<span class="k">' + n.replace(/^u_/, '') + '</span> ' +
                   (v != null ? (+v).toFixed(Math.abs(+v) < 0.1 && +v !== 0 ? 3 : 2) : '—');
          }).join(' ') + '</span>'
        : '');
  }

  /* mouse in drawing-buffer pixels, origin bottom-left — what gl_FragCoord is */
  function onMouse(e) {
    var r = cv.getBoundingClientRect();
    var sx = cv.width / r.width, sy = cv.height / r.height;
    mouse = [(e.clientX - r.left) * sx, (r.height - (e.clientY - r.top)) * sy];
  }

  /* ---------------------------------------------------------- the editor */
  var TYPES = ['void','float','int','bool','vec2','vec3','vec4','mat2','mat3','mat4','sampler2D','samplerCube'];
  var KEYS = ['if','else','for','while','return','break','continue','const','uniform','attribute',
              'varying','precision','highp','mediump','lowp','struct','discard','in','out','inout','true','false'];

  function highlight(src) {
    var re = /(\/\/[^\n]*)|(^[ \t]*#[^\n]*)$|(\b\d+\.?\d*\b|\.\d+)|([A-Za-z_]\w*)|("[^"]*")/gm;
    return src.replace(/[&<>]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]; })
      .replace(re, function (m, com, pre, num, word, str) {
        if (com !== undefined) return '<span class="cm">' + com + '</span>';
        if (pre !== undefined) return '<span class="pp">' + pre + '</span>';
        if (num !== undefined) return '<span class="num">' + num + '</span>';
        if (str !== undefined) return '<span class="str">' + str + '</span>';
        if (word !== undefined) {
          if (TYPES.indexOf(word) >= 0 || KEYS.indexOf(word) >= 0) return '<span class="kw">' + word + '</span>';
          return word;
        }
        return m;
      });
  }

  function paintGutter() {
    var ed = document.getElementById('ed');
    if (!ed) return;
    var lines = buffer.split('\n');
    ed.innerHTML = lines.map(function (l, i) {
      var n = i + 1;
      return '<div class="ln' + (n === errLine ? ' err' : '') + '">' +
        '<b>' + n + '</b><code>' + (highlight(l) || '&nbsp;') + '</code></div>';
    }).join('');
  }

  function buildEditor() {
    var body = document.getElementById('app-body');
    if (!body) return;
    body.innerHTML = '<div class="edwrap"><div class="ed" id="ed" aria-hidden="true"></div>' +
      '<textarea id="ta" spellcheck="false" aria-label="Fragment shader source"></textarea></div>';
    var ta = document.getElementById('ta');
    ta.value = buffer;
    paintGutter();

    ta.addEventListener('input', function () {
      buffer = ta.value;
      paintGutter();
      clearTimeout(compileTimer);
      compileTimer = setTimeout(function () { compile(buffer); S.markEdited(true); }, 200);
    });
    // Tab indents; Escape is handled by the shell's one central guard and
    // blurs the field, which is how you get out of the editor.
    ta.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Tab') return;
      ev.preventDefault();
      var a = ta.selectionStart, b = ta.selectionEnd;
      ta.value = ta.value.slice(0, a) + '    ' + ta.value.slice(b);
      ta.selectionStart = ta.selectionEnd = a + 4;
      buffer = ta.value; paintGutter();
      clearTimeout(compileTimer);
      compileTimer = setTimeout(function () { compile(buffer); }, 200);
    });

    var file = document.getElementById('app-file');
    if (file) {
      file.textContent = (entry.path || ('content/' + entry.id + '/')) +
        ((example && example.file) || 'main.frag');
    }
    var foot = document.getElementById('app-foot');
    if (foot) {
      foot.innerHTML =
        '<button type="button" class="ctl" id="ed-reset">Reset</button>' +
        '<button type="button" class="ctl" id="ed-copy">Copy link</button>' +
        '<button type="button" class="ctl" id="ed-run" aria-pressed="' + String(playing) + '">' +
        (playing ? 'Pause' : 'Play') + '</button>';
      document.getElementById('ed-reset').addEventListener('click', function () {
        buffer = sourceOf(entry, example);
        document.getElementById('ta').value = buffer;
        paintGutter(); compile(buffer); S.markEdited(false);
      });
      document.getElementById('ed-copy').addEventListener('click', function (ev) {
        var link = S.shareLink(buffer);
        if (navigator.clipboard) navigator.clipboard.writeText(link);
        ev.target.textContent = 'Copied';
        setTimeout(function () { ev.target.textContent = 'Copy link'; }, 1400);
      });
      document.getElementById('ed-run').addEventListener('click', function () { adapter.toggleRun(); });
    }
    setStatus(status, log);
  }

  function sourceOf(e, ex) {
    if (ex && ex.code) return ex.code;
    if (e.code) return e.code;
    return '#ifdef GL_ES\nprecision mediump float;\n#endif\n' +
           'uniform vec2 u_resolution;\nvoid main(){\n' +
           '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n' +
           '  gl_FragColor = vec4(vec3(uv.x), 1.0);\n}\n';
  }

  /* ------------------------------------------------------------- adapter */
  var adapter = {
    mount: function (o) {
      adapter.unmount();
      host = o.stage; bar = o.bar; entry = o.entry; example = o.example;
      params = o.params || {};
      uniformNames = []; paramDefs = [];
      ((o.entry.params) || []).concat((o.example && o.example.params) || [])
        .forEach(function (p) {
          var u = p.uniform || ('u_' + p.name);
          uniformNames.push(u);
          paramDefs.push({ name: p.name, uniform: u });
          // The caller may hand us the values the sliders are actually at —
          // switching stages must not silently reset the uniforms to the
          // declared defaults while the panel still shows the moved value.
          params[u] = (o.params && o.params[p.name] !== undefined)
            ? o.params[p.name] : p.value;
        });
      // the shared edit in the URL wins over the file, and the strip says so
      var shared = S.readSharedSource(o.query);
      buffer = shared || sourceOf(o.entry, o.example);

      if (!ensureContext(o.stage)) return;
      compile(buffer);

      if (bar) {
        bar.innerHTML =
          '<span class="rd" id="glread"></span>' +
          (shared ? '<span class="opt"><span class="k">source</span> shared edit</span>' : '') +
          (wantsTexture(o.entry) ? textureControl() : '') +
          '<span class="r"><span id="compile">COMPILED</span></span>';
        setStatus(status, log);
        wireTexture();
      }
      playing = !S.reduced();
      startLoop();
      window.addEventListener('resize', resize);
    },

    unmount: function () {
      stopLoop();
      clearTimeout(compileTimer);
      window.removeEventListener('resize', resize);
      if (cv) {
        cv.removeEventListener('mousemove', onMouse);
        cv.removeEventListener('webglcontextlost', onLost);
        cv.removeEventListener('webglcontextrestored', onRestored);
        if (cv.parentNode) cv.parentNode.removeChild(cv);
      }
      if (gl && program) { gl.deleteProgram(program); }
      program = null; cv = null; gl = null; host = null; clock = 0;
    },

    fillSource: buildEditor,

    toggleRun: function () {
      playing = !playing;
      if (playing) startLoop(); else stopLoop();
      var b = document.getElementById('ed-run');
      if (b) { b.textContent = playing ? 'Pause' : 'Play'; b.setAttribute('aria-pressed', String(playing)); }
      if (!playing) drawOnce();
    },

    setParam: function (name, value) {
      // Resolve through the declared parameters, so a param that names its own
      // `uniform` still lands on the right key. The old lookup guessed
      // u_<name> and silently wrote to a key nothing reads when it was wrong.
      var key = null;
      for (var i = 0; i < paramDefs.length; i++) {
        if (paramDefs[i].name === name) { key = paramDefs[i].uniform; break; }
      }
      if (!key) key = params.hasOwnProperty('u_' + name) ? 'u_' + name : name;
      params[key] = value;
      if (!playing) drawOnce();
    },

    onApparatusOpen: function () { if (S.views) S.views.fillPane(); },

    /* Contact-sheet preview for a course tool: a still frame, not a live
       context. Twenty-seven WebGL contexts is not a thumbnail strategy. */
    preview: function (el, entry, on) {
      if (!on) return;
      if (el.getAttribute('data-mounted')) return;
      el.setAttribute('data-mounted', 'true');
    }
  };

  S.registerAdapter('glsl', adapter);
})();
