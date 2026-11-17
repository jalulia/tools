/* TL-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/ki_tokyo_lounge.html:335-372 (drawSun/addLift/updateSwell/swellAt/applySwell/drawBlooms)
   The researcher's grade (B+) and editorial_status
   (promising_exploration) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'tl-01',
  index: 'TL-01',
  title: `Metaball field + swell/bloom interaction`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'B+ · promising_exploration',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/ki_tokyo_lounge.html:335-372 (drawSun/addLift/updateSwell/swellAt/applySwell/drawBlooms)`,
    author: 'Julia Compton',
    note: `Genuinely coupled to interaction, but tangled with a large Web Audio subsystem (lines 499-667) that makes lifting it awkward.`
  },
  thumb: 'thumb.png',
  text: `<p>Additive Gaussian sources with a user-driven swell term that lifts the field locally and decays.</p>
    <p><b>Note.</b> Genuinely coupled to interaction, but tangled with a large Web Audio subsystem (lines 499-667) that makes lifting it awkward.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/ki_tokyo_lounge.html:335-372 (drawSun/addLift/updateSwell/swellAt/applySwell/drawBlooms)</code> · Canvas2D · 11 + 12
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
