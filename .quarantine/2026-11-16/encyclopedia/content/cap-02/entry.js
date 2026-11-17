/* CAP-02 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/capschiz/index.html:1834-1870 (flow 1840, snap 1841, autopilot 1847)
   The researcher's grade (A-) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'cap-02',
  index: 'CAP-02',
  title: `Flow field vs. snapped grid, with an idle autopilot`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A- · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/capschiz/index.html:1834-1870 (flow 1840, snap 1841, autopilot 1847)`,
    author: 'Julia Compton',
    note: `Two things at once: the cheapest legible flow field in the corpus, and the self-demoing rule the tools shell should adopt everywhere - a demo that has not been touched for 1.4s starts demonstrating itself. Put the autopilot in the shell runtime, not in each example.`
  },
  thumb: 'thumb.png',
  text: `<p>One traveller is steered by either flow(x,y)=sin(x*.009)+cos(y*.011)+0.6*sin((x+y)*.006) mapped to an angle, or by snapping to a 40px lattice; the same pointer target feeds both, so the two space regimes are directly comparable. If the pointer has been idle 1400ms an autopilot drives the target on two slow cosines.</p>
    <p><b>Note.</b> Two things at once: the cheapest legible flow field in the corpus, and the self-demoing rule the tools shell should adopt everywhere - a demo that has not been touched for 1.4s starts demonstrating itself. Put the autopilot in the shell runtime, not in each example.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/capschiz/index.html:1834-1870 (flow 1840, snap 1841, autopilot 1847)</code> · Canvas2D · 11 (noise/fields)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
