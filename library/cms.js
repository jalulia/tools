/* library/cms.js · the library's CMS: saves edits straight to GitHub. Loaded by library/index.html after library.js.
   Edits live in one file, library/_build/edits.json (schema tools-edits/1). Every save is one commit to main, which
   redeploys the site (about two minutes). The token never leaves this browser except in requests to api.github.com.
   Remove also copies the record's page folder to the private repo jalulia/tools-archive first.
   Docs: docs/CMS.md. */
(function () {
  'use strict';
  var OWNER = 'jalulia', REPO = 'tools', ARCHIVE = 'tools-archive', BRANCH = 'main', EDITS = 'library/_build/edits.json';
  var API = 'https://api.github.com/repos/';
  var LS_TOKEN = 'tools.token';

  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }
  function token() { return lsGet(LS_TOKEN); }

  // UTF-8 safe base64
  function b64(s) { var u = new TextEncoder().encode(s), out = '', i; for (i = 0; i < u.length; i += 0x8000) out += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(out); }
  function unb64(s) { var bin = atob(String(s).replace(/\s/g, '')), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }

  function gh(repo, path, opt) {
    opt = opt || {};
    var t = opt.token || token();
    return fetch(API + OWNER + '/' + repo + path, {
      method: opt.method || 'GET', cache: 'no-store',
      headers: Object.assign({ Authorization: 'Bearer ' + t, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opt.body ? { 'Content-Type': 'application/json' } : {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined
    }).then(function (res) {
      return res.text().then(function (txt) {
        var j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) {}
        if (!res.ok) { var err = new Error((j && j.message) || ('GitHub said ' + res.status)); err.status = res.status; throw err; }
        return j;
      });
    });
  }

  /** Checks a token against both repos. Resolves { tools: bool, archive: bool, login }. */
  function check(t) {
    return Promise.all([
      gh(REPO, '/contents/' + EDITS + '?ref=' + BRANCH, { token: t }).then(function () { return true; }, function (e) { return e.status === 404 ? true : false; }),
      gh(ARCHIVE, '', { token: t }).then(function () { return true; }, function () { return false; })
    ]).then(function (r) { return { tools: r[0], archive: r[1] }; });
  }

  /** The current edits file from GitHub: { E, sha }. */
  function readEdits() {
    return gh(REPO, '/contents/' + EDITS + '?ref=' + BRANCH).then(function (j) { return { E: JSON.parse(unb64(j.content)), sha: j.sha }; }, function (e) {
      if (e.status === 404) return { E: { schema: 'tools-edits/1', projects: [], records: {}, log: [] }, sha: null };
      throw e;
    });
  }

  /* An op: { op, ids, patch, note }. patch keys with null are deleted from the record's entry. */
  function applyOp(E, o, at) {
    E.records = E.records || {}; E.log = E.log || [];
    o.ids.forEach(function (id) {
      var cur = E.records[id] || {}, k;
      for (k in o.patch) { if (o.patch[k] == null) delete cur[k]; else cur[k] = o.patch[k]; }
      if (o.per && o.per[id]) for (k in o.per[id]) { if (o.per[id][k] == null) delete cur[k]; else cur[k] = o.per[id][k]; }
      if (Object.keys(cur).filter(function (x) { return x !== 'at'; }).length) { cur.at = at; E.records[id] = cur; } else delete E.records[id];
    });
    // a project: { id, set: { title, private, note } } adds or changes it; { id, drop: true } deletes it (only when empty)
    if (o.projectDef) {
      var P = E.projects = E.projects || [], d = o.projectDef, i = -1;
      P.forEach(function (x, j) { if (x.id === d.id) i = j; });
      if (d.drop) { if (i >= 0) P.splice(i, 1); }
      else {
        var cur = i >= 0 ? P[i] : { id: d.id };
        for (var k in d.set) { if (d.set[k] == null || d.set[k] === false || d.set[k] === '') delete cur[k]; else cur[k] = d.set[k]; }
        if (i < 0) { var at2 = -1; P.forEach(function (x, j) { if (!x.private && !x.retiring) at2 = j; }); P.splice(cur.private || cur.retiring ? P.length : at2 + 1, 0, cur); }
      }
    }
    E.log.push({ at: at, op: o.op, ids: o.ids, patch: o.patch, project: o.projectDef || undefined, note: o.note || undefined, by: 'cms' });
  }

  /** Saves one op as one commit. Retries when the file moved under us. Resolves the commit sha. */
  function save(o, message) {
    var tries = 0;
    function once() {
      return readEdits().then(function (x) {
        var at = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        applyOp(x.E, o, at);
        var body = { message: message + '\n\nSaved by the library CMS (library/cms.js).', content: b64(JSON.stringify(x.E, null, 1) + '\n'), branch: BRANCH };
        if (x.sha) body.sha = x.sha;
        return gh(REPO, '/contents/' + EDITS, { method: 'PUT', body: body }).then(function (j) { return { commit: j.commit.sha, E: x.E }; });
      }).catch(function (e) {
        if ((e.status === 409 || e.status === 422) && ++tries < 4) return once();
        throw e;
      });
    }
    return once();
  }

  /* ---------------------------------------------------------------- copying to the private repo */
  // every file under a folder of jalulia/tools, as [{ path, sha, size }]
  function listFolder(path) {
    return gh(REPO, '/contents/' + encodeURI(path.replace(/\/$/, '')) + '?ref=' + BRANCH).then(function (items) {
      if (!Array.isArray(items)) items = [items];
      return Promise.all(items.map(function (it) {
        if (it.type === 'dir') return listFolder(it.path);
        if (it.type === 'file') return [{ path: it.path, sha: it.sha, size: it.size }];
        return [];
      })).then(function (lists) { return [].concat.apply([], lists); });
    });
  }
  function fileAt(path) { return gh(REPO, '/contents/' + encodeURI(path) + '?ref=' + BRANCH).then(function (j) { return [{ path: j.path, sha: j.sha, size: j.size }]; }, function () { return []; }); }

  function archiveHead() {
    return gh(ARCHIVE, '/git/ref/heads/' + BRANCH).then(function (r) { return r.object.sha; }, function (e) {
      if (e.status !== 404 && e.status !== 409) throw e;
      // an empty repository has no branch yet: the contents API can make the first commit
      return gh(ARCHIVE, '/contents/README.md', { method: 'PUT', body: { message: 'Start the archive', branch: BRANCH, content: b64('# tools-archive\n\nPrivate. Copies of work removed from jalulia/tools by the library CMS, under removed/<date>/<original path>. Restore from the library (Edit → Removed).\n') } })
        .then(function (j) { return j.commit.sha; });
    });
  }

  /** Copies files (from listFolder) into jalulia/tools-archive under prefix, plus extra JSON files. Resolves the archive commit sha. */
  function copyToArchive(files, prefix, extra, message, progress) {
    var done = 0, out = [];
    function next(i) {
      if (i >= files.length) return Promise.resolve();
      var f = files[i];
      return gh(REPO, '/git/blobs/' + f.sha).then(function (b) {
        return gh(ARCHIVE, '/git/blobs', { method: 'POST', body: { content: b.content, encoding: 'base64' } });
      }).then(function (nb) { out.push({ path: prefix + f.path, mode: '100644', type: 'blob', sha: nb.sha }); if (progress) progress(++done, files.length); return next(i + 1); });
    }
    return next(0).then(function () {
      return Promise.all(Object.keys(extra || {}).map(function (p) {
        return gh(ARCHIVE, '/git/blobs', { method: 'POST', body: { content: b64(JSON.stringify(extra[p], null, 1) + '\n'), encoding: 'base64' } }).then(function (nb) { out.push({ path: prefix + p, mode: '100644', type: 'blob', sha: nb.sha }); });
      }));
    }).then(archiveHead).then(function (head) {
      return gh(ARCHIVE, '/git/commits/' + head).then(function (c) {
        return gh(ARCHIVE, '/git/trees', { method: 'POST', body: { base_tree: c.tree.sha, tree: out } });
      }).then(function (tree) {
        return gh(ARCHIVE, '/git/commits', { method: 'POST', body: { message: message, tree: tree.sha, parents: [head] } });
      }).then(function (cm) {
        return gh(ARCHIVE, '/git/refs/heads/' + BRANCH, { method: 'PATCH', body: { sha: cm.sha } }).then(function () { return cm.sha; });
      });
    });
  }

  window.LibCMS = {
    token: token, setToken: function (t) { lsSet(LS_TOKEN, t); }, check: check,
    readEdits: readEdits, save: save, listFolder: listFolder, fileAt: fileAt, copyToArchive: copyToArchive,
    repo: OWNER + '/' + REPO, archive: OWNER + '/' + ARCHIVE
  };
})();
