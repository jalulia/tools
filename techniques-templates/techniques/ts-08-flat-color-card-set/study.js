window.STUDY={
  id:'ts-08-flat-color-card-set', code:'TS-08', fig:'1.8',
  title:'Flat-color card set',
  kicker:'Technique · TS-08',
  lede:'Six flat cards, condensed type at two scales, mono at the edges.',
  body:[
    'A 3 × 2 grid of rounded portrait cards on black; the middle column sits 57 u high. Each card is one flat fill. Display type is a heavy condensed grotesk — Archivo, width 62, weight 800–900 — at two scales: all-caps lines at 29 u, and single words fitted to the card at 95–165 u with leading under 0.8 so they touch.',
    'Metadata sits in 8–9 u mono pinned to the edges, in two or three columns. One card runs a gradient plate with a line drawing where the reference had a photo; one is a ledger of four events on dotted rules; one carries a barcode strip and a ticket row.'
  ],
  source:'Reference 08 · six flat-color typographic cards on black, 736 × 928',
  spot:[252,24,0], ref:{w:736,h:928},
  variantLabel:'Color',
  variants:[
    { id:'ref', label:'As reference', sw:['#FC1800','#FCE800','#009448','#ABF6CD','#0018E8'], spot:[252,24,0],
      ground:'#000000', frame:null,
      cards:['#FC1800','#7A2018','#FCE800','#009448','#ABF6CD','#0018E8'],
      ink:['#0A0A0A','#FCE800','#0A0A0A','#E8ECE4','#0A0A0A','#D0D8D4'],
      grad:['#4A1210','#F26A2A'], gradLine:'#F9C48A' },
    { id:'io', label:'Ø set', sw:['#F4551E','#2F5AE6','#101014','#F6F5F2'], spot:[244,85,30],
      ground:'#FFFFFF', frame:'#101014',
      cards:['#F4551E','#2F5AE6','#101014','#FFFFFF','#F6F5F2','#2F5AE6'],
      ink:['#FFFFFF','#FFFFFF','#FFFFFF','#101014','#101014','#FFFFFF'],
      grad:['#2F5AE6','#F4551E'], gradLine:'#FFFFFF' },
    { id:'mono', label:'Mono', sw:['#101014','#FFFFFF'], spot:[16,16,20],
      ground:'#101014', frame:'#FFFFFF',
      cards:['#FFFFFF','#101014','#FFFFFF','#101014','#FFFFFF','#101014'],
      ink:['#101014','#FFFFFF','#101014','#FFFFFF','#101014','#FFFFFF'],
      grad:['#101014','#6E6E74'], gradLine:'#FFFFFF' }
  ],
  points:[
    {u:0.50,v:0.03,d:'GRND',label:'Ground · flat black, margins 71 / 68 u, gutters 27 / 26 u',t:'card-ground',dir:[1,-1]},
    {u:0.075,v:0.10,d:'FRAM',label:'Card 269 × 537 u · corner radius 15 u, no border',t:'rounded-frame',dir:[-1,-1]},
    {u:0.20,v:0.25,d:'DISP',label:'Paragraph · Archivo 800 wdth 62, 29 u on 33 u, all caps',t:'condensed-display',dir:[-1,0]},
    {u:0.80,v:0.24,d:'DISP',label:'Fitted words · one word per line, 88 u pitch, leading 0.79',t:'condensed-display',dir:[1,0]},
    {u:0.20,v:0.50,d:'META',label:'Edge metadata · JetBrains Mono 8.5 u, three columns',t:'edge-metadata',dir:[-1,1]},
    {u:0.50,v:0.12,d:'GRAD',label:'Gradient plate · two stops, dark top to warm bottom',t:'gradient-plate',dir:[1,-1]},
    {u:0.66,v:0.22,d:'GRAD',label:'Arc illustration · 5 concentric arcs, 3 u stroke',t:'gradient-plate',dir:[1,0]},
    {u:0.80,v:0.60,d:'LEDG',label:'Ledger · four events, dotted rule 1 u between rows',t:'rule-ledger',dir:[1,0]},
    {u:0.20,v:0.68,d:'META',label:'Barcode strip · 34 bars, 1–3 u wide, 14 u tall',t:'edge-metadata',dir:[-1,0]},
    {u:0.50,v:0.83,d:'LEDG',label:'Ticket row · boxed fields, 0.8 u rule',t:'rule-ledger',dir:[1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[736,928], grammar:'3 × 2 grid of rounded flat-color cards on black; condensed heavy grotesk at paragraph and fitted-word scales; mono metadata pinned to card edges; one photo card; one ledger card' },
    units:'design units, 1000 = sheet width (1 u = 0.736 px on the reference)',
    palette:{ ground:'#000000', red:'#FC1800', yellow:'#FCE800', green:'#009448', mint:'#ABF6CD', blue:'#0018E8', ink:'#0A0A0A', chalk_on_green:'#E8ECE4', chalk_on_blue:'#D0D8D4' },
    techniques:[
      { id:'card-ground', short:'GRND', name:'Flat ground and grid', layer:0, pass:0, atoms:['ground','grid','margin'],
        params:{ ground:'#000000', columns:3, rows:2, card_u:[269,537], gutter_u:[27,26], margin_u:{left:71,top:110,right:68,bottom:51}, middle_column_offset_u:-57 },
        implementation:'Fill the sheet, then place six cards on a 3 × 2 grid; the middle column is translated up by 57 u so its cards straddle the row gap.' },
      { id:'rounded-frame', short:'FRAM', name:'Rounded card', layer:1, pass:1, atoms:['rounded-rect','clip','flat-fill'],
        params:{ radius_u:15, border:'none on a contrasting ground; 1 u hairline when card ≈ ground', fill:'one flat color per card', clip:'all card content is clipped to the rounded path' },
        implementation:'Each card is one rounded-rect path: fill flat, then clip so type can run to the edge and be cut by the corner.' },
      { id:'condensed-display', short:'DISP', name:'Condensed display at two scales', layer:2, pass:2, atoms:['lettering','condensed','fit-to-width','tight-leading'],
        params:{ font:'Archivo', width_pct:62, weight:[800,900], paragraph:{size_u:29,leading_u:33,tracking_em:-0.01,lines:11}, fitted:{size_u:[95,166],fit_width_u:'card width − 10 to 16',pitch_over_size:[0.70,0.80],tracking_em:-0.03,fit:'each word scaled to the card width minus 2 × 14 u'}, secondary:{size_u:[26,58]} },
        implementation:'Two set sizes: a wrapped all-caps paragraph, and single words each fitted to the inner width and stacked with leading below 0.8 so caps of adjacent lines touch.' },
      { id:'edge-metadata', short:'META', name:'Edge metadata', layer:3, pass:3, atoms:['mono','micro-type','columns','barcode'],
        params:{ font:'JetBrains Mono', size_u:[8,9], line_u:11, inset_u:{x:14,y:14}, columns:[2,3], secondary_font:'Inter 8 u for gray labels', barcode:{bars:34,width_u:[1,3],height_u:14,seed:808} },
        implementation:'Tiny mono rows pinned to the top and bottom edges in two or three columns; a barcode strip is a seeded run of bars with a mono number under it.' },
      { id:'gradient-plate', short:'GRAD', name:'Gradient plate with line illustration', layer:2, pass:2, atoms:['linear-gradient','arc','line-illustration'],
        params:{ stops:['#4A1210 at 0','#F26A2A at 1'], angle_deg:100, arcs:{count:5,center_u:[0.78,0.30],radius_step_u:38,stroke_u:3,alpha:0.85}, disc_u:22 },
        implementation:'Where the reference carries a photograph the card fills with a two-stop linear gradient, then five concentric arcs and a disc are stroked in one tint over it; display type sits on top as on the other cards.' },
      { id:'rule-ledger', short:'LEDG', name:'Rule ledger', layer:3, pass:3, atoms:['rule','dotted-rule','table-row','ticket'],
        params:{ rows:4, row_pitch_u:82, title:'Archivo 800 wdth 62, 12 u', body:'JetBrains Mono 9 u on 15 u', rule:'dotted, 1 u, dot pitch 3 u', ticket:{height_u:17,rule_u:0.8,cells:5}, stamp:{ellipse_u:[150,40],rule_u:1.2} },
        implementation:'A vertical list of event rows: bold title, two or three mono lines, a dotted rule between rows; the ticket row is a boxed strip of five cells with hairline rules and a lozenge stamp under it.' }
    ],
    pass_order:['ground · flat fill','grid · six rounded paths, middle column −57 u','fills · one flat color per card, gradient on card 2','display · paragraph then fitted words, clipped to card','ledger · rows, dotted rules, ticket, stamp','metadata · mono rows pinned to edges, barcode'],
    notes:['Measured on ref.png: cards 198 × 395 px, gutters 20 / 19 px, left margin 52 px, top 81 px, middle column top 39 px; corner radius 11 px; paragraph line pitch 24 px with 15 px caps; fitted words pitch 64–85 px with 58–87 px caps; mono metadata 6–7 px.','Card colors read as modes: red (252,24,0), yellow (252,232,0), green (0,148,72), mint (171,246,205), blue (0,24,232); ground (0,0,0).','The second card is a photograph in the reference; the rebuild replaces it with a gradient plate and arcs. Words are invented. Seed 808.']
  },
  /* ---------- shared layout (used by render and live) ---------- */
  _L:{ W:1000, H:1261, CW:269, CH:537, GX:27, GY:26, X0:71, Y0:110, MID:-57, R:15, PAD:14 },
  _copy:{
    para:'THE SHOP OPENS AT NINE AND CLOSES AT SIX. WE CUT, FOLD AND PRESS BY HAND. NO RUSH ORDERS, NO #4 STOCK, NO {GLOSS} FINISH. PLAIN SHEETS, PLAIN INK, ONE COLOUR PER RUN. IF A SHEET TEARS* WE PRINT IT AGAIN AND SAY SO. THE WORK© IS SLOW AND IT SHOWS.',
    paraMeta:[['Plain (March 03)','Ed.— 41920775']], paraBig:['TURIN','MARCH.03.27'],
    plateMeta:['HARBOUR LIGHT','ATELIER NORTH','OSLO'], plateUrl:'harbour.no', plateEd:'Ed.— 20611844',
    plateLines:['LOW TIDE','— R. AUGUST VANE','OSLO.11.02/'], plateLines2:['SMALL & STEADY®','A. REPORT.'], plateBig:'N.312', plateMail:'R.VANE@HARBOUR.NO', plateTel:'(047)210-4481',
    words:['SLATE','RIVER','PLAIN','NORTH','STONE','FIELD'], wordsMeta:['Field Report — 0312'],
    greenTop:[['(Ed.—0312.7)','Experience'],['Porto','Lisbon, Faro'],['Est. 1958','Paper']], greenBig1:['PORTO','NORTE.'], greenUrl:'//PORTOLINE.CO', greenBar:'8 041955 300121 4', greenBig2:['THE*','SMALL','—PRESS.'], greenBot:[['Copyright©','P.N.'],['03/09','Ana Moura'],['Info','Overview']],
    mintPairs:[['HAUS MERLE','STUDIO ORO'],['  ATELIER KOLB®','NINE'],['PRESS—     OFFICE','LOAM'],['      VORN*','03.11.2027'],['HOUSE OF LINDT!','ARBO']], mintBig:['OCT','NOV'], mintTicket:['Neu Haus','OCT','B.04412','NOV','Grotesk'], mintStamp:['2024','{QUIET PRINT PRIZE®}','PORTO'], mintStampSide:['EST.','1931'], mintLines:['OCTOBER BATCH NO. 1180425','ED.—— 55021873 HAND PRESSED','FLAT SHEET'],
    blueTop:['Edition (04)','Display','2027'], events:[['THE STILL*** ROOM! MAR.02','DIRECTED BY: ANNIKA HOLT','OLD MILL, PORTO'],['GREY® LINE APR.19','DIRECTED BY: TOMAS VELDE','VENUE: SALT STORE, BERGEN'],['NEXT FIELD VII MAY.27','DIRECTED BY: IRIS KALDER','VENUE: THE PUMP HOUSE,','TURIN']
      ,['OPEN & CLOSE! JUL.08','DIRECTED BY: OLA FINSEN','VENUE: BACK ROOM GALLERY,','OSLO']], blueBig:['OFF©','DUTY!'], blueBot:['March','Variable','Condensed']
  },
  _cards(){ const L=this._L; const xs=[L.X0,L.X0+L.CW+L.GX,L.X0+2*(L.CW+L.GX)]; const out=[]; for(let r=0;r<2;r++)for(let c=0;c<3;c++){ out.push({i:r*3+c,x:xs[c],y:L.Y0+r*(L.CH+L.GY)+(c===1?L.MID:0),w:L.CW,h:L.CH}); } return out; },
  render(canvas,w,h,dpr,V){
    const A=window.ART, L=this._L, C=this._copy; const S=w/1000; const x=canvas.getContext('2d'); x.setTransform(dpr*S,0,0,dpr*S,0,0);
    const hasLS='letterSpacing' in x; const hasFS='fontStretch' in x;
    const font=(o)=>{ const fam=o.fam||'Archivo'; const st=fam==='Archivo'?'extra-condensed ':''; x.font=`${o.wt||800} ${st}${o.sz}px ${fam==='Archivo'?'Archivo':fam==='Mono'?'"JetBrains Mono"':'Inter'}`; if(hasFS){ try{ x.fontStretch=fam==='Archivo'?'extra-condensed':'normal'; }catch(e){} } if(hasLS)x.letterSpacing=((o.ls||0)*o.sz).toFixed(2)+'px'; };
    const T=(s,X,Y,o)=>{ font(o); x.fillStyle=o.c; x.textAlign=o.al||'left'; x.textBaseline='alphabetic'; x.fillText(s,X,Y); };
    const fit=(s,o,maxW)=>{ let sz=o.sz; for(let i=0;i<40;i++){ font(Object.assign({},o,{sz})); if(x.measureText(s).width<=maxW)break; sz*=0.96; } return sz; };
    const wrap=(s,o,maxW)=>{ font(o); const words=s.split(' '); const lines=[]; let cur=''; for(const wd of words){ const t=cur?cur+' '+wd:wd; if(x.measureText(t).width<=maxW||!cur)cur=t; else { lines.push(cur); cur=wd; } } if(cur)lines.push(cur); return lines; };
    const rule=(X0,Y,X1,c,wd,dotted)=>{ x.strokeStyle=c; x.lineWidth=wd||0.8; x.beginPath(); if(dotted)x.setLineDash([1,2]); x.moveTo(X0,Y); x.lineTo(X1,Y); x.stroke(); x.setLineDash([]); };
    const near=(a,b)=>{ const p=A.hex(a),q=A.hex(b); return Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+Math.abs(p[2]-q[2])<40; };
    const r=A.rng(808);
    /* 0 · ground */
    x.fillStyle=V.ground; x.fillRect(0,0,L.W,L.H);
    const cards=this._cards(); const P=L.PAD;
    for(const k of cards){ const ink=V.ink[k.i], fill=V.cards[k.i]; const inner=k.w-2*P; const cx=k.x+k.w/2;
      x.save(); A.rrect(x,k.x,k.y,k.w,k.h,L.R); x.clip();
      /* 1 · flat fill or gradient plate */
      if(k.i===1){ const g=x.createLinearGradient(k.x,k.y,k.x+k.w*0.35,k.y+k.h); g.addColorStop(0,V.grad[0]); g.addColorStop(1,V.grad[1]); x.fillStyle=g; x.fillRect(k.x,k.y,k.w,k.h);
        /* arcs + disc */
        const ac=[k.x+k.w*0.78,k.y+k.h*0.30]; x.strokeStyle=V.gradLine; x.globalAlpha=0.85; x.lineWidth=3; for(let i=1;i<=5;i++){ x.beginPath(); x.arc(ac[0],ac[1],i*38,Math.PI*0.55,Math.PI*1.75); x.stroke(); } x.beginPath(); x.arc(ac[0],ac[1],22,0,Math.PI*2); x.fillStyle=V.gradLine; x.fill(); x.globalAlpha=1;
        /* horizon rule */ rule(k.x,k.y+k.h*0.64,k.x+k.w,V.gradLine,1);
      } else { x.fillStyle=fill; x.fillRect(k.x,k.y,k.w,k.h); }
      const meta={fam:'Mono',wt:400,sz:8.5,c:ink,ls:0.02}, metaB={fam:'Mono',wt:700,sz:8.5,c:ink,ls:0.02}, lab={fam:'Inter',wt:400,sz:8,c:ink};
      const tx=k.x+P, ty=k.y, bx=k.x+k.w-P;
      if(k.i===0){ /* paragraph card */
        const o={sz:29,wt:800,c:ink,ls:-0.01}; const lines=wrap(C.para,o,inner); let Y=ty+22+21; for(const ln of lines.slice(0,11)){ T(ln,tx,Y,o); Y+=33; }
        T(C.paraMeta[0][0],tx,ty+387,lab); T(C.paraMeta[0][1],bx,ty+387,Object.assign({},meta,{al:'right'}));
        const s1=fit(C.paraBig[0],{sz:86,wt:900,ls:-0.03},inner); T(C.paraBig[0],tx-1,k.y+k.h-20-41-8,{sz:s1,wt:900,c:ink,ls:-0.03});
        const s2=fit(C.paraBig[1],{sz:58,wt:900,ls:-0.03},inner); T(C.paraBig[1],tx-1,k.y+k.h-20,{sz:s2,wt:900,c:ink,ls:-0.03});
      }
      if(k.i===1){ /* gradient plate card */
        C.plateMeta.forEach((s,i)=>T(s,tx,ty+16+i*14,meta)); T(C.plateUrl,bx,ty+16,Object.assign({},meta,{al:'right'})); T(C.plateEd,tx,ty+205,meta);
        const o={sz:28,wt:800,c:ink,ls:-0.015}; let Y=ty+219+20; for(const s of C.plateLines){ T(s,tx,Y,o); Y+=24; } Y+=14; for(const s of C.plateLines2){ T(s,tx,Y,o); Y+=24; }
        const sb=fit(C.plateBig,{sz:82,wt:900,ls:-0.03},inner); T(C.plateBig,tx-1,ty+461,{sz:sb,wt:900,c:ink,ls:-0.03});
        T(C.plateMail,tx,ty+490,{sz:26,wt:800,c:ink,ls:-0.015}); T(C.plateTel,tx,ty+512,meta);
        T('new',bx,ty+205,Object.assign({},lab,{al:'right'}));
      }
      if(k.i===2){ /* fitted words */
        let Y=ty+84; for(const wd of C.words){ const s=fit(wd,{sz:132,wt:900,ls:-0.035},k.w-10); T(wd,cx,Y,{sz:s,wt:900,c:ink,ls:-0.035,al:'center'}); Y+=88; }
        x.save(); x.translate(k.x+k.w-6,ty+k.h/2); x.rotate(-Math.PI/2); T(C.wordsMeta[0],0,0,Object.assign({},lab,{al:'center'})); x.restore();
        x.save(); x.translate(k.x+6,ty+k.h/2); x.rotate(-Math.PI/2); T('0312 — Plain',0,0,Object.assign({},lab,{al:'center'})); x.restore();
      }
      if(k.i===3){ /* green: two big blocks, barcode row */
        const cols=[tx,cx-10,bx]; const als=['left','center','right'];
        C.greenTop.forEach((pair,i)=>{ T(pair[0],cols[i],ty+20,Object.assign({},lab,{al:als[i]})); T(pair[1],cols[i],ty+30,Object.assign({},lab,{al:als[i]})); });
        let Y=ty+140; for(const wd of C.greenBig1){ const s=fit(wd,{sz:128,wt:900,ls:-0.035},k.w-16); T(wd,tx-2,Y,{sz:s,wt:900,c:ink,ls:-0.035}); Y+=90; }
        /* globes + url + barcode */
        const ry=ty+248; x.strokeStyle=ink; x.lineWidth=0.9; for(let i=0;i<3;i++){ const gx=tx+7+i*17; x.beginPath(); x.arc(gx,ry,6,0,Math.PI*2); x.stroke(); x.beginPath(); x.ellipse(gx,ry,2.6,6,0,0,Math.PI*2); x.stroke(); x.beginPath(); x.moveTo(gx-6,ry); x.lineTo(gx+6,ry); x.moveTo(gx-5.2,ry-3); x.lineTo(gx+5.2,ry-3); x.moveTo(gx-5.2,ry+3); x.lineTo(gx+5.2,ry+3); x.stroke(); }
        T(C.greenUrl,tx+58,ry+3.5,metaB);
        const bx0=tx+140, bw=inner-140; let X=bx0; x.fillStyle=ink; const rr=A.rng(808); while(X<bx0+bw){ const wd=1+(rr()*2.4|0); if(rr()<0.55)x.fillRect(X,ry-9,wd,14); X+=wd+1; }
        T(C.greenBar,bx0,ry+11,Object.assign({},meta,{sz:6.5}));
        Y=ty+330; for(const wd of C.greenBig2){ const s=fit(wd,{sz:100,wt:900,ls:-0.035},k.w-16); T(wd,tx-2,Y,{sz:s,wt:900,c:ink,ls:-0.035}); Y+=74; }
        C.greenBot.forEach((pair,i)=>{ T(pair[0],cols[i],ty+505,Object.assign({},lab,{al:als[i]})); T(pair[1],cols[i],ty+515,Object.assign({},lab,{al:als[i]})); });
      }
      if(k.i===4){ /* mint: pairs, two huge months, ticket, stamp, mono */
        const o={sz:21,wt:800,c:ink,ls:-0.005}; let Y=ty+18+15; for(const [a,b] of C.mintPairs){ T(a,tx,Y,o); T(b,bx,Y,Object.assign({},o,{al:'right'})); Y+=22; }
        Y=ty+255; for(const wd of C.mintBig){ const s=fit(wd,{sz:166,wt:900,ls:-0.04},inner+8); T(wd,cx,Y,{sz:s,wt:900,c:ink,ls:-0.04,al:'center'}); Y+=116; }
        /* ticket row */
        const tyy=ty+391, th=17; x.strokeStyle=ink; x.lineWidth=0.8; const cellsX=[tx+52,tx+92,tx+150,tx+190]; x.strokeRect(cellsX[0],tyy,cellsX[3]-cellsX[0],th); x.beginPath(); x.moveTo(cellsX[1],tyy); x.lineTo(cellsX[1],tyy+th); x.moveTo(cellsX[2],tyy); x.lineTo(cellsX[2],tyy+th); x.stroke();
        x.fillStyle=ink; x.fillRect(cellsX[1],tyy,cellsX[2]-cellsX[1],th);
        T(C.mintTicket[0],tx,tyy+11.5,Object.assign({},lab,{sz:7.5})); T(C.mintTicket[1],(cellsX[0]+cellsX[1])/2,tyy+11.5,Object.assign({},metaB,{al:'center'})); T(C.mintTicket[2],(cellsX[1]+cellsX[2])/2,tyy+11.5,Object.assign({},metaB,{al:'center',c:fill})); T(C.mintTicket[3],(cellsX[2]+cellsX[3])/2,tyy+11.5,Object.assign({},metaB,{al:'center'})); T(C.mintTicket[4],bx,tyy+11.5,Object.assign({},lab,{sz:7.5,al:'right'}));
        /* stamp: ellipse with side lozenges */
        const sy=ty+440; x.strokeStyle=ink; x.lineWidth=1.2; x.beginPath(); x.ellipse(cx,sy,75,20,0,0,Math.PI*2); x.stroke(); x.fillStyle=ink; x.beginPath(); x.ellipse(k.x+8,sy,9,20,0,0,Math.PI*2); x.fill(); x.beginPath(); x.ellipse(k.x+k.w-8,sy,9,20,0,0,Math.PI*2); x.fill();
        x.beginPath(); x.moveTo(k.x+17,sy); x.lineTo(cx-75,sy); x.moveTo(cx+75,sy); x.lineTo(k.x+k.w-17,sy); x.stroke();
        T(C.mintStamp[0],cx,sy-6,Object.assign({},metaB,{al:'center',sz:8})); T(C.mintStamp[1],cx,sy+3,Object.assign({},metaB,{al:'center',sz:8})); T(C.mintStamp[2],cx,sy+12,Object.assign({},metaB,{al:'center',sz:8}));
        T(C.mintStampSide[0],cx-58,sy+2.5,Object.assign({},lab,{sz:6.5,al:'center'})); T(C.mintStampSide[1],cx+58,sy+2.5,Object.assign({},lab,{sz:6.5,al:'center'}));
        C.mintLines.forEach((s,i)=>T(s,cx,ty+483+i*20,Object.assign({},metaB,{al:'center',sz:9})));
      }
      if(k.i===5){ /* blue ledger */
        const cols=[tx,cx,bx]; const als=['left','center','right'];
        C.blueTop.forEach((s,i)=>T(s,cols[i],ty+18,Object.assign({},lab,{al:als[i]})));
        let Y=ty+42; C.events.forEach((ev,i)=>{ T(ev[0],tx,Y,Object.assign({},metaB,{sz:9,ls:0.06})); let y2=Y+15; for(const s of ev.slice(1)){ T(s,tx,y2,Object.assign({},meta,{sz:9})); y2+=15; } if(i<3)rule(tx,y2+4,bx,ink,1,true); Y=y2+18; });
        Y=ty+390; for(const wd of C.blueBig){ const s=fit(wd,{sz:96,wt:900,ls:-0.03},inner+4); T(wd,tx-2,Y,{sz:s,wt:900,c:ink,ls:-0.03}); Y+=82; }
        C.blueBot.forEach((s,i)=>T(s,cols[i],ty+518,Object.assign({},lab,{al:als[i]})));
      }
      x.restore();
      /* hairline frame when the card sits on a ground of its own color */
      if(V.frame&&near(fill,V.ground)){ x.strokeStyle=V.frame; x.lineWidth=1; A.rrect(x,k.x+0.5,k.y+0.5,k.w-1,k.h-1,L.R); x.stroke(); }
    }
  },
  live(V){
    const L=this._L, C=this._copy; const cards=this._cards();
    const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    let ff=''; try{ if(typeof document!=='undefined'){ for(const sh of document.styleSheets){ let rules; try{ rules=sh.cssRules; }catch(e){ continue; } for(const r of rules){ if(r.type===5)ff+=r.cssText+'\n'; } } } }catch(e){}
    const fontLink=ff?'<style>'+ff+'</style>':'<link rel="stylesheet" href="../../_shared/fonts.css">';
    const near=(a,b)=>{ const h=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)); const p=h(a),q=h(b); return Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+Math.abs(p[2]-q[2])<40; };
    const vars=cards.map(k=>`--c${k.i}:${V.cards[k.i]};--i${k.i}:${V.ink[k.i]};`).join('');
    const bars=(()=>{ let s=808|0; const rr=()=>{ s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; let out='',X=0; while(X<86){ const wd=1+(rr()*2.4|0); if(rr()<0.55)out+=`<i style="left:calc(var(--u)*${X});width:calc(var(--u)*${wd})"></i>`; X+=wd+1; } return out; })();
    const cardStyle=k=>`left:calc(var(--u)*${k.x});top:calc(var(--u)*${k.y});background:var(--c${k.i});color:var(--i${k.i});${V.frame&&near(V.cards[k.i],V.ground)?`box-shadow:inset 0 0 0 calc(var(--u)*1) ${V.frame};`:''}`;
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>TS-08 · live</title>${fontLink}<style>
:root{--u:calc(100vw/1000);${vars}--ground:${V.ground};--grad0:${V.grad[0]};--grad1:${V.grad[1]};--line:${V.gradLine};--radius:15}
html,body{margin:0;height:100%;background:var(--ground);overflow:hidden}
.sheet{text-rendering:geometricPrecision;-webkit-font-smoothing:antialiased;position:relative;width:100vw;height:calc(var(--u)*${L.H});font-family:Archivo,'Arial Narrow',Arial,sans-serif;font-stretch:62%}
.card{position:absolute;width:calc(var(--u)*${L.CW});height:calc(var(--u)*${L.CH});border-radius:calc(var(--u)*var(--radius));overflow:hidden;padding:0 calc(var(--u)*${L.PAD});box-sizing:border-box}
.card *{margin:0}
.disp{font-weight:900;letter-spacing:-0.03em;line-height:0.79;text-transform:uppercase;white-space:nowrap}
.para{font-weight:800;font-size:calc(var(--u)*29);line-height:calc(var(--u)*33);letter-spacing:-0.01em;position:absolute;left:calc(var(--u)*14);right:calc(var(--u)*14);top:calc(var(--u)*22);max-height:calc(var(--u)*330);overflow:hidden}
.meta{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:calc(var(--u)*8.5);line-height:calc(var(--u)*11);letter-spacing:0.02em;position:absolute;left:calc(var(--u)*14);right:calc(var(--u)*14)}
.meta.b{font-weight:700}.meta.top{top:calc(var(--u)*8)}.meta.bot{bottom:calc(var(--u)*10)}
.lab{font-family:Inter,system-ui,sans-serif;font-size:calc(var(--u)*8);line-height:calc(var(--u)*10)}
.cols{display:flex;justify-content:space-between}.cols>span{display:block}.cols>span:nth-child(2){text-align:center}.cols>span:last-child{text-align:right}
.big{position:absolute;left:calc(var(--u)*12);right:calc(var(--u)*12)}
.fitw{display:block}
.plate{background:linear-gradient(100deg,var(--grad0),var(--grad1))}
.plate svg{position:absolute;inset:0;width:100%;height:100%}
.ledger{position:absolute;left:calc(var(--u)*14);right:calc(var(--u)*14);top:calc(var(--u)*30);font-family:'JetBrains Mono',ui-monospace,monospace;font-size:calc(var(--u)*9);line-height:calc(var(--u)*15)}
.ledger .row{padding:calc(var(--u)*3) 0 calc(var(--u)*4);border-bottom:1px dotted currentColor}.ledger .row:last-child{border-bottom:0}
.ledger b{display:block;letter-spacing:0.06em}
.ticket{position:absolute;left:calc(var(--u)*14);right:calc(var(--u)*14);top:calc(var(--u)*391);height:calc(var(--u)*17);display:flex;align-items:center;font-size:calc(var(--u)*8.5);font-family:'JetBrains Mono',monospace;font-weight:700}
.ticket .cell{border:calc(var(--u)*0.8) solid currentColor;padding:0 calc(var(--u)*6);height:100%;display:flex;align-items:center}.ticket .cell+.cell{border-left:0}.ticket .inv{background:currentColor}.ticket .inv span{color:var(--c4)}
.ticket .lab{flex:1}.ticket .lab:last-child{text-align:right}
.stamp{position:absolute;left:0;right:0;top:calc(var(--u)*420);height:calc(var(--u)*40)}
.stamp svg{width:100%;height:100%;display:block}
.bar{position:relative;height:calc(var(--u)*14);width:calc(var(--u)*86)}.bar i{position:absolute;top:0;bottom:0;background:currentColor}
.row3{position:absolute;left:calc(var(--u)*14);right:calc(var(--u)*14);top:calc(var(--u)*241);display:flex;align-items:center;gap:calc(var(--u)*6)}
.vert{position:absolute;top:50%;transform-origin:center;white-space:nowrap}
</style></head><body><div class="sheet">
<div class="card" style="${cardStyle(cards[0])}">
  <p class="para">${esc(C.para)}</p>
  <div class="meta cols" style="top:calc(var(--u)*378)"><span class="lab">${esc(C.paraMeta[0][0])}</span><span></span><span>${esc(C.paraMeta[0][1])}</span></div>
  <div class="big" style="bottom:calc(var(--u)*12)"><div class="disp fitw" data-fit="86">${C.paraBig[0]}</div><div class="disp fitw" data-fit="58">${C.paraBig[1]}</div></div>
</div>
<div class="card plate" style="${cardStyle(cards[1])}">
  <svg viewBox="0 0 ${L.CW} ${L.CH}" preserveAspectRatio="none"><g fill="none" stroke="var(--line)" stroke-width="3" opacity="0.85">${[1,2,3,4,5].map(i=>`<path d="${(()=>{const cx=L.CW*0.78,cy=L.CH*0.30,r=i*38,a0=Math.PI*0.55,a1=Math.PI*1.75;return `M${(cx+r*Math.cos(a0)).toFixed(1)} ${(cy+r*Math.sin(a0)).toFixed(1)} A${r} ${r} 0 1 1 ${(cx+r*Math.cos(a1)).toFixed(1)} ${(cy+r*Math.sin(a1)).toFixed(1)}`;})()}"/>`).join('')}<line x1="0" x2="${L.CW}" y1="${(L.CH*0.64).toFixed(1)}" y2="${(L.CH*0.64).toFixed(1)}" stroke-width="1" opacity="1"/></g><circle cx="${L.CW*0.78}" cy="${L.CH*0.30}" r="22" fill="var(--line)" opacity="0.85"/></svg>
  <div class="meta top" style="top:calc(var(--u)*8);line-height:calc(var(--u)*14)">${C.plateMeta.map(esc).join('<br>')}<span style="position:absolute;right:0;top:0">${esc(C.plateUrl)}</span></div>
  <div class="meta" style="top:calc(var(--u)*197)"><span>${esc(C.plateEd)}</span><span class="lab" style="position:absolute;right:0">new</span></div>
  <div style="position:absolute;left:calc(var(--u)*14);top:calc(var(--u)*219);font-weight:800;font-size:calc(var(--u)*28);line-height:calc(var(--u)*24);letter-spacing:-0.015em;white-space:nowrap">${C.plateLines.map(esc).join('<br>')}<br><span style="display:block;height:calc(var(--u)*14)"></span>${C.plateLines2.map(esc).join('<br>')}</div>
  <div class="big" style="top:calc(var(--u)*399)"><div class="disp fitw" data-fit="82">${C.plateBig}</div></div>
  <div style="position:absolute;left:calc(var(--u)*14);top:calc(var(--u)*468);font-weight:800;font-size:calc(var(--u)*26);line-height:1;letter-spacing:-0.015em;white-space:nowrap">${esc(C.plateMail)}</div>
  <div class="meta" style="top:calc(var(--u)*504)">${esc(C.plateTel)}</div>
</div>
<div class="card" style="${cardStyle(cards[2])}">
  <div class="big" style="top:0;left:calc(var(--u)*11);right:calc(var(--u)*11);text-align:center;line-height:calc(var(--u)*88)">${C.words.map(w=>`<div class="disp fitw" data-fit="132" data-pitch="88">${w}</div>`).join('')}</div>
  <span class="lab vert" style="right:calc(var(--u)*-2);transform:rotate(-90deg) translate(50%,-50%)">${esc(C.wordsMeta[0])}</span>
</div>
<div class="card" style="${cardStyle(cards[3])}">
  <div class="meta top cols lab" style="top:calc(var(--u)*12)">${C.greenTop.map(p=>`<span>${esc(p[0])}<br>${esc(p[1])}</span>`).join('')}</div>
  <div class="big" style="top:calc(var(--u)*49);left:calc(var(--u)*12)">${C.greenBig1.map(w=>`<div class="disp fitw" data-fit="128" data-pitch="90">${w}</div>`).join('')}</div>
  <div class="row3"><svg width="${52}" height="14" viewBox="0 0 52 14" style="width:calc(var(--u)*52);height:calc(var(--u)*14);flex:none" fill="none" stroke="currentColor" stroke-width="0.9">${[0,1,2].map(i=>`<g transform="translate(${7+i*17},7)"><circle r="6"/><ellipse rx="2.6" ry="6"/><path d="M-6 0H6M-5.2 -3H5.2M-5.2 3H5.2"/></g>`).join('')}</svg><span class="meta b" style="position:static;white-space:nowrap">${esc(C.greenUrl)}</span><span class="bar" style="margin-left:auto">${bars}<span class="meta" style="position:absolute;left:0;top:100%;font-size:calc(var(--u)*6.5);white-space:nowrap">${esc(C.greenBar)}</span></span></div>
  <div class="big" style="top:calc(var(--u)*250);left:calc(var(--u)*12)">${C.greenBig2.map(w=>`<div class="disp fitw" data-fit="100" data-pitch="74">${w}</div>`).join('')}</div>
  <div class="meta bot cols lab" style="bottom:calc(var(--u)*12)">${C.greenBot.map(p=>`<span>${esc(p[0])}<br>${esc(p[1])}</span>`).join('')}</div>
</div>
<div class="card" style="${cardStyle(cards[4])}">
  <div style="position:absolute;left:calc(var(--u)*14);right:calc(var(--u)*14);top:calc(var(--u)*16);font-weight:800;font-size:calc(var(--u)*21);line-height:calc(var(--u)*22);letter-spacing:-0.005em;white-space:pre">${C.mintPairs.map(p=>`<div style="display:flex;justify-content:space-between"><span>${esc(p[0])}</span><span>${esc(p[1])}</span></div>`).join('')}</div>
  <div class="big" style="top:calc(var(--u)*138);left:calc(var(--u)*10);right:calc(var(--u)*10);text-align:center">${C.mintBig.map(w=>`<div class="disp fitw" data-fit="166" data-pitch="116" style="letter-spacing:-0.04em">${w}</div>`).join('')}</div>
  <div class="ticket"><span class="lab">${esc(C.mintTicket[0])}</span><span class="cell">${C.mintTicket[1]}</span><span class="cell inv"><span>${C.mintTicket[2]}</span></span><span class="cell">${C.mintTicket[3]}</span><span class="lab">${esc(C.mintTicket[4])}</span></div>
  <div class="stamp"><svg viewBox="0 0 ${L.CW} 40" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.2"><ellipse cx="${L.CW/2}" cy="20" rx="75" ry="20"/><ellipse cx="8" cy="20" rx="9" ry="20" fill="currentColor"/><ellipse cx="${L.CW-8}" cy="20" rx="9" ry="20" fill="currentColor"/><path d="M17 20H${L.CW/2-75}M${L.CW/2+75} 20H${L.CW-17}"/><g fill="currentColor" stroke="none" font-family="'JetBrains Mono',monospace" font-weight="700" font-size="8" text-anchor="middle"><text x="${L.CW/2}" y="14">${esc(C.mintStamp[0])}</text><text x="${L.CW/2}" y="23">${esc(C.mintStamp[1])}</text><text x="${L.CW/2}" y="32">${esc(C.mintStamp[2])}</text><text x="${L.CW/2-58}" y="22.5" font-family="Inter,sans-serif" font-weight="400" font-size="6.5">${C.mintStampSide[0]}</text><text x="${L.CW/2+58}" y="22.5" font-family="Inter,sans-serif" font-weight="400" font-size="6.5">${C.mintStampSide[1]}</text></g></svg></div>
  <div class="meta b" style="top:calc(var(--u)*474);text-align:center;font-size:calc(var(--u)*9);line-height:calc(var(--u)*20)">${C.mintLines.map(esc).join('<br>')}</div>
</div>
<div class="card" style="${cardStyle(cards[5])}">
  <div class="meta top cols lab" style="top:calc(var(--u)*10)">${C.blueTop.map(s=>`<span>${esc(s)}</span>`).join('')}</div>
  <div class="ledger">${C.events.map(ev=>`<div class="row"><b>${esc(ev[0])}</b>${ev.slice(1).map(esc).join('<br>')}</div>`).join('')}</div>
  <div class="big" style="top:calc(var(--u)*316);left:calc(var(--u)*12)">${C.blueBig.map(w=>`<div class="disp fitw" data-fit="96" data-pitch="82">${w}</div>`).join('')}</div>
  <div class="meta bot cols lab" style="bottom:calc(var(--u)*10)">${C.blueBot.map(s=>`<span>${esc(s)}</span>`).join('')}</div>
</div>
</div>
<script>
/* fit each .fitw word to its container width, capped at data-fit (design units); pitch sets the line box */
(function(){ const u=innerWidth/1000; const els=document.querySelectorAll('.fitw');
  function fit(){ for(const el of els){ const max=+el.dataset.fit*u; const w=el.parentElement.clientWidth; el.style.fontSize=max+'px'; el.style.display='inline-block'; el.style.whiteSpace='nowrap'; const tw=el.getBoundingClientRect().width; let s=max; if(tw>w)s=max*w/tw; el.style.fontSize=s+'px'; el.style.display='block'; const p=el.dataset.pitch; el.style.lineHeight=p?(+p*u)+'px':'0.79'; } }
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit); fit(); addEventListener('resize',fit); })();
</script></body></html>`;
    return html;
  }
};
