/* CRX-01 — imported by scripts/import-inventory.mjs at ck-e7.
   Source: corpus/repos/cross/Cross_Instrument_Typology_CRX-TYP-001_1.html:437-470 (radiusAt / penExtent / samplePts), 1556+ (drawElevation), pen data 800-1180
   The researcher's grade (A) and editorial_status
   (canonical) live in `proposed_grade` — a proposal,
   never a ruling. Status is 'unsorted' until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  id: 'crx-01',
  index: 'CRX-01',
  title: `Parametric instrument profile: a segment grammar in millimetres -> elevations, sections, callouts`,
  section: 'unfiled',
  status: 'unsorted',
  proposed_grade: 'A · canonical',
  lane: 'canvas2d',
  tags: ['imported', 'unsorted', 'svg'],
  source: {
    kind: 'reference-study',
    title: `corpus/repos/cross/Cross_Instrument_Typology_CRX-TYP-001_1.html:437-470 (radiusAt / penExtent / samplePts), 1556+ (drawElevation), pen data 800-1180`,
    author: 'Julia Compton',
    note: `Joins CR-01 and is stronger: the data is declarative, in real units, and one function turns it into every view. This is also the architecture argument for the tools shell in miniature - drop a data file, get a page. The tangent-continuity choice at 450-451 is the non-obvious craft move.`
  },
  thumb: 'thumb.png',
  text: `<p>A pen is an array of {t:'cone'|'arc'|'dome', x0,x1,r0,r1,bow} segments left to right in mm; radiusAt samples the profile at any x, with the arc case choosing sin(u*PI/2) or 1-cos(u*PI/2) so the curve leaves the barrel tangentially at whichever end it meets. One sampler then feeds silhouette rows, scaled elevations, clipped section views, dimension lines and numbered callouts.</p>
    <p><b>Note.</b> Joins CR-01 and is stronger: the data is declarative, in real units, and one function turns it into every view. This is also the architecture argument for the tools shell in miniature - drop a data file, get a page. The tangent-continuity choice at 450-451 is the non-obvious craft move.</p>
    <p class="cite" style="font-family:var(--f-mach);font-size:12px;color:var(--ink-3)">
      Source: <code>corpus/repos/cross/Cross_Instrument_Typology_CRX-TYP-001_1.html:437-470 (radiusAt / penExtent / samplePts), 1556+ (drawElevation), pen data 800-1180</code> · SVG (generated) · new chapter (drawing without raster)
    </p>
    <p><b>Status: unsorted.</b> Imported from the corpus inventory at ck-e7. The researcher's proposed grade sits in the metadata as <code>proposed_grade</code>; it is a proposal, not a ruling (DECISION-FRAMING D5). Awaiting julia.</p>`
});
