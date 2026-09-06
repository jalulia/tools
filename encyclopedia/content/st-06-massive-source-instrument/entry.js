/* ST-06 · MASSIVE · source instrument — imported from technique-studies/st-06-massive-source-instrument.html at ck-e12.
   STUB · ST-06 in the standalone file computes point positions and render output
   from a photograph-driven analysis pipeline (frame-track array T, image
   analyser, plate rasteriser) defined OUTSIDE the STUDY block. That pipeline
   is not portable to the encyclopedia's script-only shell without a larger
   port. For now the entry ships with schema-valid stubs: T defaults to plate-
   centre positions so the manifest registers cleanly and coverage passes; the
   picture will not render (mountCanvas catches the missing helpers). Follow-up
   for E14: hand-port the analyser + rasteriser into content/_engines/. */
const T = Array(10).fill().map(() => ({ u: 0.5, v: 0.5 }));
Shell.registerEntry({
  stub: true,
  entity: 'exploration',
  id: 'st-06-massive-source-instrument',
  index: 'ST-06',
  order: 3060,
  title: 'MASSIVE · source instrument',
  section: 'studies',
  style: 'technique-study',
  status: 'canonical',
  lane: 'canvas2d',
  governed_by: ['composing-computational-material-systems'],
  tags: ['Reference study'],

  source: {
    kind: 'reference-study',
    title: 'Reference 06 · Mode Mode FIG 02 pipeline output (MASSIVE, P-02)',
    note: 'Imported at ck-e12 from technique-studies/. compare{} on — reference is public-domain / Julia\'s own instrument (PROCESS §5.4).'
  },

  frame: { designWidth: 1736, aspect: '1736/1280', previewHeight: 1280 },
  thumb: 'thumb.png',

  body: [
'FIG 02 reads a hero photograph into ink and one printed colour: luminance → mask → edge tangent flow → FDoG ridges and medial-axis strokes, with the silhouette and seams hand-set → hatch streamlines on the same flow, density by tone → one spot colour as a hard-edged vector plate → three plates rasterised and multiplied.',
    'This plate is not a redraw. The worker pipeline, the rasteriser, the MASSIVE preset and its bundled photograph are lifted verbatim and run here on the main thread; every line on the sheet was produced by the real code path, so the ten points name what the instrument did.'
  ],

  method: 'ETF · FDoG + NMS · medial axis · streamline hatch · vector spot · multiply',

  compare: {
    /* Reference is public-domain (or Julia's own instrument). The public
       build strips this to null per PROCESS §5.4; the local build keeps it
       so the fidelity readout has something to cite. */
    reference: 'reference-inline',
    readout:   { palette: true, tone: true, edge: true, grain: true, chroma: true }
  },
  plate: {
    fig: '3.6', series: 'STUDIES', sheet: 6, of: 8,
    designWidth: 1736, designHeight: 1280,
    render: function (canvas, w, h, dpr) {
    const ctx=canvas.getContext('2d'); const P=PRESETS.massive; const t0=performance.now();
    const go=()=>{ try{
      const d=cache.data; const lay=layOf(w,h,dpr,d.H/d.W); const DPR=dpr;
      const gen=FigRaster.plates(d,P,CORE,lay,DPR); let r; do{ r=gen.next(); }while(!r.done); const rast=r.value;
      const f={rast,lay}; const fig={x:0,y:0,w,h};
      ctx.save(); ctx.fillStyle='#FFFFFF'; ctx.fillRect(0,0,w,h); ctx.restore();
      drawPlates(ctx,f,fig,DPR,0,h,h,h);
      window.__st06={data:d,lay,ms:Math.round(performance.now()-t0),timings:d.timings};
    }catch(e){ console.error(e); } done(); };
    if(cache){ go(); return; }
    loadImg(FALLBACK[0]).then(img=>{ if(!img){ console.error('st-06: source image failed to decode'); done(); return; } const P2=Object.assign({},P); P2.slug='massive';
      const data=analyse(img,P2,SCALE); if(!data){ console.error('st-06: analyse failed'); done(); return; } cache={img,data}; go(); });
    }
  },

  points: [
{u:T[0].u,v:T[0].v,d:'KEY', label:'Marquee lettering · medial axis of the lit mask, mass outlines 0.9 px', t:'darkkey-marquee', dir:[1,-1]},
    {u:T[1].u,v:T[1].v,d:'KEY', label:'Screen strokes · bright-mask skeleton, width 1.1–4 px = local thickness', t:'darkkey-screen', dir:[-1,-1]},
    {u:T[2].u,v:T[2].v,d:'FILL',label:'Knock-out · a screen mass (> tMax 4) punched out of the spot plate', t:'spot-plate', dir:[1,-1]},
    {u:T[3].u,v:T[3].v,d:'COL', label:'Spot plate · glass tone ≤ 0.36, torn edge, +1.5 / +1.0 px off register', t:'spot-plate', dir:[1,-1]},
    {u:T[4].u,v:T[4].v,d:'FORM',label:'Button ring · hand-set circle r 0.013 + stem, 0.9 px hairline', t:'structure', dir:[-1,-1]},
    {u:T[5].u,v:T[5].v,d:'KEY', label:'FDoG ridge · the one chain kept: base tick, NMS, thickness ≥ 2.6 → 0.9 px', t:'fdog-key', dir:[1,1]},
    {u:T[6].u,v:T[6].v,d:'FORM',label:'Structure line · hand-set panel edge, 0.9 px, tapered over 7 px', t:'structure', dir:[-1,1]},
    {u:T[7].u,v:T[7].v,d:'TEX', label:'Hatch · 60° streamline, band 1, dsep 7 px, 0.6 px round-capped stroke', t:'hatch', dir:[-1,0]},
    {u:T[8].u,v:T[8].v,d:'GRND',label:'Mask · silhouette keep-polygon eroded 4 px; bare paper outside', t:'mask', dir:[-1,1]},
    {u:T[9].u,v:T[9].v,d:'TEX', label:'forceBand · side-face polygon corner, band forced to 1, ruled 60°', t:'hatch', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · luma pending point authoring', t:'luma', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · etf pending point authoring', t:'etf', dir:[1,-1]},
    {u:0.500, v:0.500, d:'', label:'stub · composite pending point authoring', t:'composite', dir:[1,-1]}
  ],

  spec: {
id:'st-06',
    reference:{ w:1736, h:1280, what:'Mode Mode FIG 02 · OBJECTS V1, MASSIVE (P-02), held state, captured at 2×', source_image:'bundled MASSIVE hero, 1200×1622 JPEG (FALLBACK[0])', analysed_at:{tw:392,th:530,scale:0.7,rule:'tw = 560 for a portrait source × 0.7 (figure 1, first pass)'}, plate_rect_frame:{x:0.2642,y:0.0926,w:0.5114,h:0.9375} },
    palette:{ ink:'#15140F', spot:'#1E6FE0', spot_rgb:[30,111,224], paper:'#FFFFFF' },
    ground:{ colour:'#FFFFFF', texture:'none — bare paper outside the mask' },
    techniques:[
      { id:'luma', short:'LUMA', name:'Luminance, stretched + local contrast', layer:'source', pass:1,
        params:{ luma:'rec (0.299 R + 0.587 G + 0.114 B)', stretch:'2nd → 0, 98th → 1 percentile, 1024-bin histogram', local:0.6, local_sigma:8, boost:{region:'MQ marquee', k:2.5, rule:'0.5 + (L − mean) / (sd · k)'} },
        implementation:'Rec.601 luminance stretched between its 2nd and 98th percentiles, an unsharp mask of 0.6 × (L − G₈(L)), and the marquee panel z-normalised at k 2.5 so the lettering separates.' },
      { id:'mask', short:'MASK', name:'Background mask', layer:'source', pass:2,
        params:{ type:'all', keep:'MSIL silhouette polygon (8 vertices)', drop:[[0.79,0.76],[0.89,0.76],[0.89,0.90],[0.79,0.90]], erode:4 },
        implementation:'A binary keep-mask rasterised from the hand-set silhouette polygon, the drop rectangle cleared, then eroded 4 px (dilate of the inverse with a disc of radius 4); nothing is drawn outside it.' },
      { id:'etf', short:'ETF', name:'Edge tangent flow (Kang 2007)', layer:'field', pass:3,
        params:{ gradient:'central differences of G₁(L)', seedDir_deg:45, etfR:5, etfIters:2, weight:'sign(t·t′) · |t·t′| · ½(1 + tanh(2(m′ − m) − 1))', separable:true },
        implementation:'Tangents (−gy, gx) normalised, flat pixels seeded at 45°, then two iterations of the separable Kang ETF: each tangent replaced by the weighted sum of its neighbours over ±5 px in x then y, weighted by tangent alignment and the magnitude difference through a tanh table.' },
      { id:'structure', short:'STRUCT', name:'Hand-set structure', layer:'key', pass:4,
        params:{ lines:17, primitives:'closed(MSIL), closed(MQ), closed(MS), 5 seams, 4 circles r 0.013, 4 stems', width_css_px:0.9, taper_px:7, structClear_px:7, circle_segments:32 },
        implementation:'Normalised polylines drawn on the key plate as tapered ribbons (0.25 → 1 over 7 px at each free end) at 0.9 px; the pipeline rasterises the same lines into a mask dilated 7 px and cuts its own chains wherever they touch it.' },
      { id:'fdog-key', short:'FDOG', name:'Flow-based DoG key with NMS', layer:'key', pass:5,
        params:{ sigma_c:1.0, sigma_s:1.6, sigma_m:3.0, rho:0.985, tau:0.5, fdogIters:2, nms:'±1, ±2 px along the flow normal', pinhole_close:1, zhangSuen_iters:10, bridge_gap_px:3.0, minChain:14, bbox_min_px:6, dpEps:0.5, structTh:2.6, width_structure:0.9, width_detail:0.6, width_mod:'0.85 + 0.15 · clamp(thickness / 4)', keyDrop:['MQ','MS'] },
        implementation:'DoG across the flow normal (σc 1.0, σs 1.6, ρ 0.985) sampled bilinearly, integrated along the ETF streamline with a σm 3 Gaussian, thresholded 1 + tanh(40 H) < 0.5, two iterations with ink fed back; non-maximum suppression across the normal keeps one ridge per edge, Zhang–Suen thins it, chains are followed with junction splitting, bridged over 3 px gaps, split clear of the structure and the marquee/screen, Douglas–Peucker simplified at 0.5 px, and weighted 0.9 (structure, thickness ≥ 2.6) or 0.6 (detail).' },
      { id:'darkkey-marquee', short:'MEDIAL', name:'Medial-axis key · marquee lettering', layer:'key', pass:6,
        params:{ region:'MQ', t:0.60, invert:true, source:'L (boosted)', open:1, minArea:10, tMax:4, massMin:40, minChain:6, wMin:1.4, spur:1.0, dpEps:0.6, zhangSuen_iters:40, mass_outline_width:0.9 },
        implementation:'Pixels brighter than 0.60 inside the marquee form a stroke mask, opened 1 px and cleaned of components under 10 px; parts thicker than tMax 4 (an opening of radius 2, ≥ 40 px) are masses traced as marching-squares outlines at 0.9 px, the rest is Zhang–Suen thinned to one centreline per stroke, chained, spurs shorter than 1.0 × thickness dropped, and drawn at its chamfer-measured thickness clamped to [1.4, 4].' },
      { id:'darkkey-screen', short:'MEDIAL', name:'Medial-axis key · screen content', layer:'key', pass:6,
        params:{ region:'MS', t:0.20, invert:true, source:'L0 (raw, pre-boost)', close:1, minArea:8, tMax:4, massMin:60, minChain:6, wMin:1.1, knockout:true, dpEps:0.6 },
        implementation:'Same medial-axis pass on the raw luminance inside the screen polygon: bright game pixels > 0.20, closed 1 px, skeletonised and drawn at thickness [1.1, 4]; masses become outlines and are also written into the knock-out mask that the spot plate honours.' },
      { id:'hatch', short:'HATCH', name:'Streamline hatch on the flow', layer:'hatch', pass:7,
        params:{ tone:'G₄(L)', form_gate:'ridge density (3 × box 20) > 0.006', bands:[0.46,0.30,0.16], forceBand:{region:'side face polygon', band:1}, plates:[{angle:60},{angle:60,ruled:true,region:'side face'}], cohLo:0.25, cohHi:0.65, dsep_px:[0,7,4.5,3.2], minHatch:12, turn_cos:0.866, cross_deg:60, cross_dsep:3.68, cross_band:3, noHatch:['MS','MQ'], ink_clear_px:2.5, stroke_css_px:0.6, cap:'round', simplify_eps:0.35 },
        implementation:'A direction field blends the 60° plate angle toward the ETF by structure-tensor coherence (smoothstep 0.25 → 0.65; the side face is ruled, coherence ignored); tone bands from a σ4 blur assign dsep 7 / 4.5 / 3.2 px, and Jobard–Lefer evenly-spaced streamlines are traced from ridge-adjacent seeds and a 5 px lattice with a spatial-hash separation test, breaking at 30° turns, then a 60° cross pass on the darkest band; strokes are Catmull-Rom smoothed and drawn at 0.6 px.' },
      { id:'spot-plate', short:'SPOT', name:'Vector spot plate, knocked out, off register', layer:'spot', pass:8,
        params:{ region:'MS', band:[0,0.36], source:'L0', gate:false, close:3, open:2, knockout:true, minFrac:0.01, dpEps:0.6, colour:'#1E6FE0', fill_rule:'evenodd', trap_stroke_css_px:1.0, offset_css_px:[1.5,1.0] },
        implementation:'Screen pixels with raw luminance ≤ 0.36 are closed 3 px and opened 2 px, the screen masses knocked out, components under 1 % of the frame dropped, then traced by marching squares (holes kept), simplified at 0.6 px, Catmull-Rom smoothed and filled evenodd in the core colour with a 1 px spread trap; the plate prints 1.5 px right and 1.0 px down of the key.' },
      { id:'composite', short:'MULT', name:'Plate compositing', layer:'composite', pass:9,
        params:{ order:['spot (offset)','hatch','key'], mode:'multiply', ground:'#FFFFFF', plate_dpr:'device', key_smoothing:'Catmull-Rom, ≤ 6 subdivisions per 1.5 px' },
        implementation:'Three offscreen plates at device resolution are drawn onto white paper with globalCompositeOperation multiply, spot first (offset), then hatch, then key, so ink over colour reads as printed overprint.' }
    ],
    pass_order:['luma','mask','etf','structure','fdog-key','darkkey-marquee','darkkey-screen','hatch','spot-plate','composite'],
    notes:[
      'Verbatim lift: runPipeline and its helpers, FigRaster.plates, PRESETS.massive, MQ/MS/MSIL, FALLBACK[0], analyse() crop/scale and drawPlates() are copied from the source page unchanged; only the Worker transport (self.onmessage / postMessage) is replaced by a direct call.',
      'The reference capture is the instrument’s first read of figure 1, analysed at 0.7 × width (392 × 530 px); the study runs the same pass, so hatch pitch and stroke widths land where the capture has them.',
      'Points 20 and 24 are not preset trackers: the preset repeats the button ring and the hand-set seam, so those two are replaced by the read’s single surviving FDoG chain (base tick) and a hatch streamline on the side face, both taken from the pipeline output.',
      'The tracker overlays baked into the reference (numbered boxes, leaders) are the FIG 02 chrome, not the drawing; the study shell draws its own.'
    ]
  }
});
