/* Register · sync — Supabase over plain fetch. No SDK, no build step.
 *
 * Every request carries X-Register-Key. The page is public; the workspace is not. The key
 * lives in this browser (or in ?k=) and in the database's RLS policy — never in the repo.
 * Without it PostgREST returns 401 on writes and an empty set on reads, which is exactly
 * what a stranger who found the URL should see.
 *
 * Saves are optimistic-concurrency: PATCH … &rev=eq.<n>. Zero rows back means someone else
 * (me, from a Claude session) moved it under you, and the caller resolves rather than
 * clobbers. Every save also appends an immutable revision, so a Claude pass can be diffed
 * and rolled back.
 */

export const SB = {
  url: 'https://ycolvxmvcmxfnuicgfay.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljb2x2eG12Y214Zm51aWNnZmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NzI5MzgsImV4cCI6MjEwNDE0ODkzOH0.2cYOpAVu50pqmrJkQDB60p-xdx8L2Xw7oQCD-nSGkIU',
  bucket: 'register-images',
};

const LS_KEY = 'register.key';
let KEY = null;
let LOCAL_ONLY = false;

export function setKey(k) { KEY = k || null; try { KEY ? localStorage.setItem(LS_KEY, KEY) : localStorage.removeItem(LS_KEY); } catch (e) {} }
export function getKey() {
  if (KEY) return KEY;
  const q = new URLSearchParams(location.search).get('k');
  if (q) { setKey(q); return KEY; }
  try { KEY = localStorage.getItem(LS_KEY) || null; } catch (e) {}
  return KEY;
}
export function goLocal() { LOCAL_ONLY = true; }
export function isLocal() { return LOCAL_ONLY || !getKey(); }

function headers(extra) {
  return Object.assign({
    apikey: SB.anon,
    Authorization: 'Bearer ' + SB.anon,
    'X-Register-Key': getKey() || '',
    'Content-Type': 'application/json',
  }, extra || {});
}
async function rest(path, opts = {}) {
  const r = await fetch(SB.url + '/rest/v1/' + path, Object.assign({}, opts, { headers: headers(opts.headers) }));
  if (!r.ok) {
    let msg = r.status + ' ' + r.statusText;
    try { const j = await r.json(); if (j && (j.message || j.hint)) msg = j.message || j.hint; } catch (e) {}
    const err = new Error(msg); err.status = r.status; throw err;
  }
  if (r.status === 204) return null;
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

/** true if the key is accepted — a cheap probe used by the gate */
export async function verifyKey(k) {
  const prev = KEY; KEY = k;
  try { await rest('register_docs?select=id&limit=1'); return true; }
  catch (e) { KEY = prev; return false; }
}

/* ------------------------------------------------------------------ docs */

const COLS = 'id,title,slug,profile,image_url,image_w,image_h,doc,rev,state,ask,ask_at,reply,reply_at,updated_at';

export async function listDocs(limit = 60) {
  return rest(`register_docs?select=id,title,slug,profile,image_url,rev,state,updated_at&archived=is.false&order=updated_at.desc&limit=${limit}`);
}
export async function getDoc(id) {
  const rows = await rest(`register_docs?select=${COLS}&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows && rows[0] ? rows[0] : null;
}
export async function createDoc(row) {
  const rows = await rest('register_docs', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) });
  return rows && rows[0];
}
/** Save with an expected rev. Returns {ok:true,row} or {ok:false,current} on conflict. */
export async function saveDoc(id, patch, expectedRev) {
  const body = Object.assign({}, patch, { rev: expectedRev + 1 });
  const rows = await rest(`register_docs?id=eq.${encodeURIComponent(id)}&rev=eq.${expectedRev}`,
    { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(body) });
  if (rows && rows.length) return { ok: true, row: rows[0] };
  return { ok: false, current: await getDoc(id) };
}
export async function deleteDoc(id) {
  return rest(`register_docs?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ archived: true }) });
}

/* -------------------------------------------------------------- revisions */

export async function pushRev(docId, rev, doc, author = 'julia', note = null) {
  return rest('register_revs', { method: 'POST', body: JSON.stringify({ doc_id: docId, rev, doc, author, note }) });
}
export async function listRevs(docId, limit = 40) {
  return rest(`register_revs?select=id,rev,author,note,created_at&doc_id=eq.${encodeURIComponent(docId)}&order=rev.desc&limit=${limit}`);
}
export async function getRev(docId, rev) {
  const rows = await rest(`register_revs?select=rev,author,note,doc,created_at&doc_id=eq.${encodeURIComponent(docId)}&rev=eq.${rev}&limit=1`);
  return rows && rows[0] ? rows[0] : null;
}
/** the newest revision Claude wrote, and the newest of hers before it */
export async function claudePair(docId) {
  const rows = await rest(`register_revs?select=rev,author,note,doc,created_at&doc_id=eq.${encodeURIComponent(docId)}&order=rev.desc&limit=20`);
  if (!rows || !rows.length) return null;
  const mine = rows.find(r => r.author === 'claude');
  if (!mine) return null;
  const base = rows.find(r => r.author !== 'claude' && r.rev < mine.rev);
  return { claude: mine, base: base || null };
}

/* ---------------------------------------------------------------- storage */

export async function uploadImage(file) {
  const ext = (file.name.match(/\.(png|jpe?g|webp|gif|avif)$/i) || [, 'png'])[1].toLowerCase();
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = await fetch(`${SB.url}/storage/v1/object/${SB.bucket}/${name}`, {
    method: 'POST',
    headers: { apikey: SB.anon, Authorization: 'Bearer ' + SB.anon, 'X-Register-Key': getKey() || '',
               'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
    body: file,
  });
  if (!r.ok) { let m = r.status + ''; try { m = (await r.json()).message || m; } catch (e) {} throw new Error('upload failed: ' + m); }
  return `${SB.url}/storage/v1/object/public/${SB.bucket}/${name}`;
}

/* ------------------------------------------------------- local fallback */

const LS_DOC = id => 'register.doc.' + id;
export function localSave(doc) { try { localStorage.setItem(LS_DOC(doc.id || 'draft'), JSON.stringify(doc)); } catch (e) {} }
export function localLoad(id) { try { const s = localStorage.getItem(LS_DOC(id || 'draft')); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
export function localList() {
  const out = [];
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i);
    if (k && k.startsWith('register.doc.')) { const d = JSON.parse(localStorage.getItem(k));
      out.push({ id: d.id || k.slice(13), title: d.title, local: true, updated_at: d._at || null }); } } } catch (e) {}
  return out;
}
