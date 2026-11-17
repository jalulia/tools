/* fidelity-lotus-tinytv — "One Standard, Two Subjects." Written for this library by Julia;
   housed here verbatim (her line painter untouched) in the technical-doc frame. A drawing
   standard tested against its worst case: a sacred lotus in the ukiyo-e woodblock manner and
   a manufactured object (TinyTV 2) drawn to workshop orthographic standard — one stroke
   hierarchy, line describing form rather than light, no tone, no shadow. Proposed until Julia rules. */
Shell.registerEntry({
  entity: 'exploration',
  governed_by: ['technical-illustration', 'composing-computational-material-systems'],
  id: 'fidelity-lotus-tinytv',
  index: 'F1',
  order: 168,
  title: 'One standard, two subjects',
  section: 'document-system',
  style: 'technical-doc',
  status: 'proposed',
  tags: ['Technical illustration', 'Line', 'SVG', 'No raster', 'Botanical', 'Orthographic'],
  source: {
    kind: 'original',
    title: 'Fidelity Test — Two Subjects',
    date: '2026',
    note: 'A drawing method is only as good as its worst subject. The same discipline — measured ' +
          'construction, one stroke hierarchy, line describing form rather than light — applied to a ' +
          'botanical study (Nelumbo nucifera, ukiyo-e manner) and to a manufactured object (TinyTV 2, ' +
          'third-angle projection). Seven plates, line + tinted layers, no tone, no shadow.'
  },
  frame: { designWidth: 1180, aspect: '1180/2400', previewHeight: 1200 },
  thumb: 'thumb.png',
  text: `
    <p>A fidelity test for the archive's line standard: hold one drawing discipline constant and
    change only the subject — organic then mechanical. The lotus is built the woodblock way (every
    petal on its own curved spine, the vein fan following the petal's twist; depth by four tints held
    at the threshold of visibility, and by rank — nothing shaded). The TinyTV is drawn to workshop
    standard (shared projection axes, dimension chains, REF marks and sections). Both spend detail
    the same way: base plates prove silhouette and assembly; magnified plates prove local construction.</p>
    <p>It sits beside CRX-01 and the ray-benches as the line dialect's reference: no raster, no grain,
    the drafting language carrying the whole picture.</p>`,
  ruling: {
    text: 'Line describing form, not light. No tone, no shadow on a drawing sheet — the method must survive its worst subject.',
    by: 'proposed',
    date: '2026-09-02'
  },
  related: [
    { entry: 'crx01-instrument-typology', relation: 'variant-of' },
    { entry: 'c5-spec-sheet', relation: 'technique-of' }
  ]
});
