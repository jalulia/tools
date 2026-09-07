/* ck-e1 · this tool's content has folded into ../encyclopedia/. The manifest
   still ships here so a paste of an old URL is not a 404, but every hash that
   names an entry redirects to the encyclopedia's route for the same thing.

   The rule is simple: a chapter (00–21) becomes a technique
   #/technique/<id>; a worked example (w1–w4) becomes an exploration
   #/entry/<id>. #/13-fbm (an old shortcut) resolves too. Bare #/ lands on
   the encyclopedia's front door. */
(function () {
  var BASE = '../encyclopedia/';
  var SHORTCUTS = { '13-fbm': 'technique/13-fractal-brownian-motion' };

  function classify(id) {
    if (!id) return '';
    if (SHORTCUTS[id]) return SHORTCUTS[id];
    if (/^w\d/.test(id)) return 'entry/' + id;         /* worked example */
    if (/^\d\d-/.test(id)) return 'technique/' + id;    /* chapter */
    return 'entry/' + id;
  }

  function apply() {
    var h = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
    if (!h) { location.replace(BASE); return; }
    var parts = h.split('/').filter(Boolean);
    var seg = parts[0];
    if (seg === 'index' || seg === 'style') {
      location.replace(BASE + '#/' + parts.join('/'));
      return;
    }
    var target = classify(parts[0]);
    location.replace(BASE + '#/' + target + (parts.slice(1).length ? '/' + parts.slice(1).join('/') : ''));
  }

  if (location.hash) apply();
  else location.replace(BASE);
})();
