# Register — how a Claude session works on a document

Julia hands over a line like:

> Register document `r_7fk2m9qx` — place the six column rects on their edges, leave the base alone.

Everything you need is in the `register` Supabase project (`ycolvxmvcmxfnuicgfay`). Use the
Supabase MCP for reads and writes; the anon key in `sync.js` is for the browser, and the RLS
gate (`X-Register-Key`) only applies to that path.

## The shape of a document

`register_docs` — one row per document.

| column | what |
|---|---|
| `id` | `r_…`, the handle she pastes |
| `title`, `slug` | `slug` is the preset key on export — `'chalice':{…}` |
| `profile` | `h-figures` or `generic`; it decides which layers exist |
| `image_url`, `image_w`, `image_h` | the source in the `register-images` bucket |
| `doc` | `{ editor, preset }` — **`preset` is literally the h-figures preset** |
| `rev` | bumped on every save; a write must match the rev it read |
| `state` | `idle` · `asked` (waiting on you) · `answered` (waiting on her) |
| `ask`, `reply` | her instruction, your note back |

`register_revs` — append-only history, `{doc_id, rev, author: julia|claude, note, doc}`.

## The loop

1. **Read.** `select * from register_docs where id = '<id>'`. Read `ask`. The geometry is
   `doc.preset` — normalised 0–1 over the source, exactly the arrays the instrument consumes:
   `structure`, `trackers`, `mask.keep`, `mask.drop`, `noHatch`, `forceBand[].poly`,
   `darkKey[].poly`, `plate[].poly`.

2. **Look at the source.** `image_url` is public. Fetch it, and measure — do not guess
   coordinates. A gridded magnification at 3–6× is the honest way to read edges off a small
   reference. `image_w`/`image_h` give you source pixels, and every number should be justified
   by something visible.

3. **Edit `doc.preset` only.** Round to 4 dp. Change the least you can: a diff of six entries
   she can read beats a wholesale rewrite she has to trust. If the drawing is symmetrical,
   `editor.mirror` holds the axis — mirror rather than measuring twice.

4. **Write, with the rev you read.**
   ```sql
   update register_docs
      set doc = <new>, rev = <rev+1>, state = 'answered',
          reply = '<one line: what you changed and what you left>',
          reply_at = now()
    where id = '<id>' and rev = <rev>;          -- zero rows means she moved it: re-read
   insert into register_revs (doc_id, rev, author, note, doc)
        values ('<id>', <rev+1>, 'claude', '<short note>', <new>);
   ```
   The revision is what the review panel diffs against, so it is not optional.

5. **Say what you did, in the chat too.** She opens the document and gets a per-primitive
   review — each change labelled with how far it moved in source pixels — and keeps or drops
   them one at a time. Write `reply` so that list makes sense before she reads a single row.

## Things that will bite

- **`scale` is capped.** `analyse()` limits the analysis width to the source width when the
  source is under 600 px, so `scale: 1.5` on a 304 px reference does nothing. Say so rather
  than raising it.
- **`noHatch` is applied after `forceBand`** and wins. Cut noHatch polygons around forced regions.
- **Structure is not masked** and is drawn before the pipeline's own chains.
- **A closed polyline repeats its first point last.** Keep both ends in step.
- **Circles take `r` in u units** (the v radius is `r·W/H`); ellipses take `ru, rv`.
- Never touch `editor` unless she asked — it holds her mirror axis, grid and spot colour.
- Never write `author: 'julia'` revisions.
