/* RS-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/downloads/resort.html:14-20 (mk/paste/NZ/velvet/contact), 47-98 (canopy/bed/cypress/palm)
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'rs-01',
  index: 'RS-01',
  title: `Airbrushed travel poster with offscreen depth layers`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted'],
  source: {
    kind: 'reference-study',
    title: `corpus/downloads/resort.html:14-20 (mk/paste/NZ/velvet/contact), 47-98 (canopy/bed/cypress/palm)`,
    author: 'Julia Compton',
    note: `paste(canvas, blur, alpha, comp) is the cleanest depth-compositing primitive in the corpus. Whole file is 168 lines.`
  },
  thumb: 'thumb.png',
  text: `<p>Each depth plane is its own offscreen canvas pasted back with a per-layer blur, alpha and composite op; velvet() clips a noise pattern in multiply; contact() blurs an ellipse for ground contact.</p>
    <p><b>Note.</b> paste(canvas, blur, alpha, comp) is the cleanest depth-compositing primitive in the corpus. Whole file is 168 lines.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/downloads/resort.html:14-20 (mk/paste/NZ/velvet/contact), 47-98 (canopy/bed/cypress/palm)</code> · Canvas2D · no BoS equivalent (compositing/aerial perspective)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
