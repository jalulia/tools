/* ck-e1 · this tool's content has folded into ../encyclopedia/. Every hash
   that names a lens redirects to the encyclopedia's #/entry/<id>. The one
   special case: kls01-ki-landscape folded into w1-seven-pass-band-chain,
   and that redirect lives in the encyclopedia's own manifest.redirects
   (so the encyclopedia is the single source of truth). */
(function () {
  var BASE = '../encyclopedia/';
  function apply() {
    var h = String(location.hash || '').replace(/^#\/?/, '').split('?')[0];
    if (!h) { location.replace(BASE); return; }
    var parts = h.split('/').filter(Boolean);
    var seg = parts[0];
    if (seg === 'index' || seg === 'style') {
      location.replace(BASE + '#/' + parts.join('/'));
      return;
    }
    /* Every lens becomes an exploration in the encyclopedia. */
    location.replace(BASE + '#/entry/' + parts[0] +
      (parts.slice(1).length ? '/' + parts.slice(1).join('/') : ''));
  }
  if (location.hash) apply();
  else location.replace(BASE);
})();
