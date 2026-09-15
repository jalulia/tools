window.STUDY={
  id:'ts-04-stacked-card-scroll', code:'TS-04', fig:'1.4',
  title:'Stacked card scroll',
  kicker:'Technique · TS-04',
  lede:'Rounded cards pin to the top and stack; each one a different ground.',
  body:[
    'A column of full-height cards on black. Every card is sticky at the same top offset, so the card on screen holds while the next slides over it; the covered card clips at the incoming edge and shrinks a few percent. Each card is one flat color, 36 u corners, 24 u margin, and carries one thing — a headline panel, a specimen grid, a blurred plate.',
    'The still draws the stacked state as one frame: card 1 cut short by card 2, card 2 full, cards 3 and 4 arriving from the bottom. Press L for the live scroll.'
  ],
  source:'Reference 04 · phone-height screenshot of a stacked card page, 670 × 1666',
  spot:[201,56,46], ref:{w:670,h:1666},
  variantLabel:'Color',
  variants:[
    { id:'ref',   label:'As reference',  sw:['#C9382E','#DBDBFB','#B8B5B7'], spot:[201,56,46],  ground:'#050505', c1:'#CF3020', panel:'#DADBFC', head:'#CF3020', c2:'#D9D9D9', tileL:'#FFFFFF', tileD:'#0A0A0A', mono:'#5A5A5A', plate:'#B8B5B7', plateHi:'#FFFFFF', plateLo:'#8E8C8E', c4:'#FFFFFF', c5:'#101014', bars:['#2A5FD6','#5AB6E6','#CF3020','#E8792A','#E6C83A','#4C9C48'] },
    { id:'io',    label:'Ember / white', sw:['#F4551E','#FFFFFF','#101014'], spot:[244,85,30],  ground:'#101014', c1:'#F4551E', panel:'#FFFFFF', head:'#F4551E', c2:'#FFFFFF', tileL:'#FFFFFF', tileD:'#101014', mono:'#101014', plate:'#1A1A20', plateHi:'#F4551E', plateLo:'#101014', c4:'#F4551E', c5:'#FFFFFF', bars:['#F4551E','#2F5AE6','#101014','#FFFFFF','#F4551E','#2F5AE6'] },
    { id:'paper', label:'Paper',         sw:['#101014','#F6F5F2','#E7E4DD'], spot:[16,16,20],   ground:'#101014', c1:'#E7E4DD', panel:'#F6F5F2', head:'#101014', c2:'#F6F5F2', tileL:'#FFFFFF', tileD:'#101014', mono:'#101014', plate:'#E7E4DD', plateHi:'#FFFFFF', plateLo:'#B9B4A8', c4:'#101014', c5:'#F6F5F2', bars:['#101014','#8C8880','#101014','#B9B4A8','#101014','#8C8880'] }
  ],
  points:[
    {u:0.50,v:0.270,d:'STCK',label:'Stack seam · card 1 is clipped at 670 u where card 2 covers it; 34 u of ground between',t:'sticky-stack',dir:[1,0]},
    {u:0.50,v:0.960,d:'STCK',label:'Card 4 arriving · only 70 u of it is on screen yet',t:'sticky-stack',dir:[1,-1]},
    {u:0.06,v:0.150,d:'GRND',label:'Card 1 ground · flat red, no gradient, no border',t:'card-ground',dir:[1,1]},
    {u:0.50,v:0.320,d:'GRND',label:'Card 2 ground · flat gray 217; the tiles sit on it without shadow',t:'card-ground',dir:[1,1]},
    {u:0.04,v:0.283,d:'FRME',label:'Corner · 36 u radius on all four corners, 24 u side margin',t:'rounded-frame',dir:[1,1]},
    {u:0.13,v:0.045,d:'FRME',label:'Inset panel · 66 u inside the card, runs past the clip on the right and bottom',t:'rounded-frame',dir:[1,1]},
    {u:0.28,v:0.410,d:'SPEC',label:'Specimen tile · 2 columns × 3 rows, tiles 425 × 242 u, gutter 28 / 39 u',t:'specimen-grid',dir:[1,-1]},
    {u:0.72,v:0.520,d:'SPEC',label:'Type sizes · one display numeral, three mono rows on a light tile',t:'specimen-grid',dir:[1,1]},
    {u:0.70,v:0.845,d:'BLUR',label:'Plate · two bright radial blobs and one dark, blurred 14 u',t:'soft-blur-plate',dir:[1,-1]},
    {u:0.25,v:0.905,d:'BLUR',label:'Plate grain · mono noise, amp 0.04, so the blur does not band',t:'soft-blur-plate',dir:[-1,1]}
  ],
  spec:{
    reference:{ file:'ref.png', px:[670,1666], grammar:'black page ground; full-width rounded cards, each a flat color, pinned with position: sticky and stacking as the page scrolls; card 1 red with an inset lavender panel and a red display headline, card 2 gray with a 2 × 3 specimen grid, card 3 gray with a blurred plate' },
    units:'design units, 1000 = page width (670 px); canvas height 2487 u',
    palette:{ ground:'#050505', card_1:'#CF3020', panel:'#DADBFC', card_2:'#D9D9D9', tile_light:'#FFFFFF', tile_dark:'#0A0A0A', plate:'#B8B5B7' },
    techniques:[
      { id:'sticky-stack', short:'STCK', name:'Sticky card stack', layer:0, pass:0, atoms:['sticky','stack','clip'],
        params:{ top_offset_u:19, gap_u:34, card_1_visible_u:650, card_2_u:1198, card_3_u:440, card_4_visible_u:70, scale_under:0.95, css:'position: sticky; top: 1.9vw; height: calc(100vh − 1.9vw − 3.4vw); margin: 0 2.4vw 3.4vw' },
        implementation:'Every card is sticky at the same top offset, each a direct child of the scrolling body; the incoming card covers the pinned one, which is clipped at the seam and scaled to 0.95 as it goes under; cards are siblings of one scroll container, not wrapped in sections, so each stays pinned until the end of the page.' },
      { id:'card-ground', short:'GRND', name:'Flat card ground', layer:1, pass:1, atoms:['flat-fill','color-per-card'],
        params:{ colors:['#CF3020','#D9D9D9','#B8B5B7','#FFFFFF'], shadow:'none', border:'none' },
        implementation:'Each card is one flat fill; nothing separates cards but the ground showing through the gap and the corner radius.' },
      { id:'rounded-frame', short:'FRME', name:'Rounded frame', layer:1, pass:1, atoms:['rounded-rect','inset','clip'],
        params:{ radius_u:36, side_margin_u:24, panel_inset_u:66, panel_radius_u:0 },
        implementation:'rrect(24, y, 952, h, 36) filled then used as a clip for everything on the card; the inset panel is a plain rectangle that the clip cuts.' },
      { id:'specimen-grid', short:'SPEC', name:'Specimen grid', layer:2, pass:2, atoms:['grid','type-specimen','lettering'],
        params:{ columns:2, rows:3, tile_u:[425,242], gutter_u:[28,39], grid_top_u:188, inset_u:43, headline:{font:'Archivo 800',size_u:58,line_u:54}, caption:{font:'Inter 400',size_u:10,line_u:11.5}, mono:{font:'JetBrains Mono 400',size_u:11} },
        implementation:'Six tiles, alternately light and dark, each showing one type size: a wide word, a two-line condensed heading, a staggered mono list, a display numeral with mono alphabet rows, cropped display letters, a color-bar table.' },
      { id:'soft-blur-plate', short:'BLUR', name:'Soft blur plate', layer:2, pass:3, atoms:['radial-gradient','blur','grain'],
        params:{ base:'#B8B5B7', blobs:[{c:[700,300],r:110,tone:'+white'},{c:[720,120],r:40,tone:'+white'},{c:[380,330],r:260,tone:'−0.25'}], blur_u:14, grain_amp:0.04, grain_seed:404 },
        implementation:'Radial gradients on a flat gray, blurred with a 2-D gaussian, then multiplied by mono grain so the gradient does not band.' }
    ],
    pass_order:['ground · flat black','cards · rrect fill + clip, bottom to top so the upper card is covered','card 1 · panel, captions, headline in Archivo 800','card 2 · six specimen tiles','card 3 · plate: gradients → blur → grain','card 4 · white peek with a mono metadata row'],
    notes:['Measured on ref.png: side margin 16 px (24 u), corner radius 24 px (36 u), gap between cards 23–28 px (34–42 u), panel inset 44 px (66 u), headline cap height 28 px on a 36 px line (58 u / 54 u), caption line 7.5 px (11.5 u). Plate gray 184 with σ 9.','Seed 404.']
  },
  render(canvas,w,h,dpr,V){
    const A=window.ART; const W=canvas.width,H=canvas.height; const u=W/1000; const x=canvas.getContext('2d');
    const T=()=>x.setTransform(u,0,0,u,0,0); T();
    const Hu=H/u; const M=24, R=36, CW=1000-2*M;
    x.fillStyle=V.ground; x.fillRect(0,0,1000,Hu);
    const card=(y,hh,col,draw)=>{ x.save(); A.rrect(x,M,y,CW,hh,R); x.fillStyle=col; x.fill(); x.clip(); draw&&draw(y,hh); x.restore(); };
    const font=(wt,sz,fam,st)=>{ x.font=`${wt} ${sz}px ${fam}`; x.fontStretch=st||'normal'; };
    const lines=(arr,X,Y,lh,align)=>{ x.textAlign=align||'left'; arr.forEach((s,i)=>x.fillText(s,X,Y+i*lh)); x.textAlign='left'; };
    /* ---- card geometry (u) ---- */
    const y1=19, h1=650, y2=y1+h1+34, h2=1198, y3=y2+h2+42, h3=440, y4=y3+h3+34;
    /* ---- card 4 (white peek) ---- */
    card(y4,700,V.c4,(y)=>{ x.fillStyle=V.c5; font(400,11,"'JetBrains Mono', monospace"); x.textBaseline='top'; x.fillText('04 / 05   INDEX',M+43,y+26); x.textAlign='right'; x.fillText('SCROLL · 2 OF 5 PINNED',1000-M-43,y+26); x.textAlign='left'; });
    /* ---- card 3 (plate) ---- */
    card(y3,h3,V.plate,(y,hh)=>{
      const off=A.off(W,Math.ceil((hh+80)*u)); const o=off.getContext('2d'); o.setTransform(u,0,0,u,0,0);
      o.fillStyle=V.plate; o.fillRect(0,0,1000,hh+80);
      const blob=(cx,cy,r,col,a0)=>{ const g=o.createRadialGradient(cx,cy,0,cx,cy,r); g.addColorStop(0,A.rgb(A.hex(col),a0)); g.addColorStop(1,A.rgb(A.hex(col),0)); o.fillStyle=g; o.fillRect(cx-r,cy-r,2*r,2*r); };
      blob(380,330,300,V.plateLo,0.4); blob(560,40,300,V.plateLo,0.2); blob(700,300,90,V.plateHi,0.5); blob(700,300,36,V.plateHi,1); blob(720,120,30,V.plateHi,0.9); blob(180,120,260,V.plateHi,0.14); blob(900,400,220,V.plateHi,0.22);
      const b=A.blur(off,14*u); const bc=b.getContext('2d'); A.grain(bc,{amp:0.04,pitch:1,seed:404,mono:true,corr:0.3});
      x.setTransform(1,0,0,1,0,0); x.drawImage(b,0,(y-40)*u); T(); });
    /* ---- card 2 (specimen grid) ---- */
    card(y2,h2,V.c2,(y)=>{
      x.textBaseline='top'; x.fillStyle=V.mono; font(400,11,"'JetBrains Mono', monospace");
      x.fillText('02 / 05   SPECIMEN',M+43,y+40); x.textAlign='right'; x.fillText('SIX TILES · 2 × 3',1000-M-43,y+40); x.textAlign='left';
      const gx=M+43, gy=y+188, tw=425, th=242, gxg=28, gyg=39; const ink=V.tileD, pap=V.tileL;
      const tile=(c,r,col,draw)=>{ const X=gx+c*(tw+gxg), Y=gy+r*(th+gyg); x.save(); x.fillStyle=col; x.fillRect(X,Y,tw,th); x.beginPath(); x.rect(X,Y,tw,th); x.clip(); draw(X,Y); x.restore(); };
      /* tile 1 · wide word */
      tile(0,0,pap,(X,Y)=>{ x.fillStyle=ink; font(900,44,'Archivo, sans-serif','expanded'); x.textAlign='center'; x.textBaseline='middle'; x.fillText('LOMBA',X+tw/2,Y+th/2+2); x.textAlign='left'; x.textBaseline='top'; });
      /* tile 2 · two-line condensed heading */
      tile(1,0,ink,(X,Y)=>{ x.fillStyle=pap; font(800,58,'Archivo, sans-serif','condensed'); x.textBaseline='alphabetic'; x.textAlign='right'; x.fillText('HALF TYPE',X+tw-28,Y+82); x.textAlign='left'; x.fillText('STRAIT',X+14,Y+134); x.textAlign='right'; x.fillText('MONO',X+tw-14,Y+134); x.textAlign='left'; font(400,8,"'JetBrains Mono', monospace"); x.textAlign='center'; x.fillText('SET 01 · 12 STYLES · WIDTH 62–125 · WEIGHT 400–900',X+tw/2,Y+th-22); x.textAlign='left'; x.textBaseline='top'; });
      /* tile 3 · staggered mono list on black */
      tile(0,1,ink,(X,Y)=>{ const names=['SORREL','CHIVE','TARRAGON','FENNEL','LOVAGE','BASIL','PARSLEY']; const offs=[10,60,150,90,30,4,100]; x.fillStyle=pap; font(700,27,"'JetBrains Mono', monospace"); x.textBaseline='alphabetic'; x.globalAlpha=0.55; for(let i=1;i<7;i++)x.fillRect(X+14,Y+14+i*31-1,tw-28,1.2); x.globalAlpha=1; names.forEach((n,i)=>x.fillText(n,X+18+offs[i],Y+38+i*31)); x.textBaseline='top'; });
      /* tile 4 · display numeral + alphabet rows */
      tile(1,1,pap,(X,Y)=>{ x.fillStyle=ink; font(400,9,"'JetBrains Mono', monospace"); x.fillText('HALF TYPE',X+14,Y+12); x.textAlign='right'; x.fillText('STRAIT MONO',X+tw-14,Y+12); x.textAlign='left';
        font(900,190,'Archivo, sans-serif','condensed'); x.textBaseline='alphabetic'; x.fillText('01',X+6,Y+th-14); x.textBaseline='top';
        font(400,10.5,"'JetBrains Mono', monospace"); const rows=[['ABCDEFGHIJKLMN','OPQRSTUVWXYZ'],['abcdefghijklmn','opqrstuvwxyz'],['0123456789½¼¾','@£$€(&).?!#']]; rows.forEach((r,i)=>{ x.fillRect(X+262,Y+62+i*56-6,60,1); x.fillText(r[0],X+262,Y+62+i*56); x.fillText(r[1],X+262,Y+62+i*56+13); }); });
      /* tile 5 · cropped display letters with handles */
      tile(0,2,pap,(X,Y)=>{ x.fillStyle=ink; font(900,360,'Archivo, sans-serif','condensed'); x.textBaseline='alphabetic'; x.fillText('UMB',X-14,Y+th+96); x.textBaseline='top'; x.strokeStyle=ink; x.lineWidth=1.5; x.fillStyle=pap; [[X+22,Y+58],[X+120,Y+58],[X+150,Y+150],[X+300,Y+58],[X+240,Y+200],[X+400,Y+150]].forEach(p=>{ x.fillRect(p[0]-5,p[1]-5,10,10); x.strokeRect(p[0]-5,p[1]-5,10,10); }); });
      /* tile 6 · color-bar table */
      tile(1,2,pap,(X,Y)=>{ x.fillStyle=ink; font(400,7,"'JetBrains Mono', monospace"); [['A','Plate 1','+0.4'],['B','Plate 2','+0.1'],['C','Plate 3','−0.2']].forEach((r,i)=>{ x.fillText(r[0],X+16,Y+16+i*11); x.fillText(r[1],X+50,Y+16+i*11); x.fillText(r[2],X+110,Y+16+i*11); }); x.fillText('SPOT / 6',X+16,Y+120); x.fillText('P 12 ',X+50,Y+120);
        const bw=98, bh=th/6; V.bars.forEach((c,i)=>{ x.fillStyle=c; x.fillRect(X+tw-bw,Y+i*bh,bw,bh+0.5); x.fillStyle=(i%2?ink:pap); font(400,6.5,"'JetBrains Mono', monospace"); x.fillText('0'+(i+1)+'  ·  '+['C','M','Y','K','S1','S2'][i],X+tw-bw+8,Y+i*bh+9); }); });
      /* small guide marks in the blank foot */
      x.fillStyle=V.mono; font(400,8,"'JetBrains Mono', monospace"); x.fillText('TILE 425 × 242 · GUTTER 28 / 39',gx,y+h2-40);
    });
    /* ---- card 1 (red, inset panel, headline) ---- */
    card(y1,h1,V.c1,(y)=>{
      x.fillStyle=V.panel; x.fillRect(M+66,y+66,1000-M-2-(M+66),h1+400);
      x.fillStyle=V.head; x.textBaseline='top';
      font(400,10,'Inter, sans-serif'); lines(['Signal Room Design Office','Type and Layout Standards','Working Manual'],M+80,y+85,11.5); lines(['Set by the office','and two outside hands','Edition four, 2026'],306,y+85,11.5);
      font(800,60,'Archivo, sans-serif','normal'); x.textBaseline='alphabetic'; x.letterSpacing='-1.2px'; lines(['The manual collects','every plate of the first set','at full size, plus the notes','that went with each print','run and a second, revised','key to the whole series.'],306,y+165+42,54); x.letterSpacing='0px';
      x.textBaseline='top'; font(400,10,'Inter, sans-serif'); x.fillText('Details',M+80,y+575); lines(['184 pages','96 plates','24 × 30 cm','two spot inks on gray','stochastic screen','120 gsm uncoated'],306,y+575,11.5);
    });
    x.setTransform(1,0,0,1,0,0);
  },
  live(V){
    const esc=s=>s.replace(/</g,'&lt;');
    let faces=''; try{ for(const ss of document.styleSheets){ let rules; try{ rules=ss.cssRules; }catch(e){ continue; } for(const r of rules){ if(r.type===CSSRule.FONT_FACE_RULE)faces+=r.cssText+'\n'; } } }catch(e){}
    const F="Archivo, Inter, 'Helvetica Neue', Arial, sans-serif", MONO="'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";
    const cards=[
      { bg:V.c1, fg:V.head, kind:'panel' },
      { bg:V.c2, fg:V.mono, kind:'grid' },
      { bg:V.c5, fg:V.c4, kind:'black' },
      { bg:V.plate, fg:V.tileD, kind:'plate' },
      { bg:V.c4, fg:V.c5, kind:'white' }
    ];
    const body=cards.map((c,i)=>{ let inner='';
      if(c.kind==='panel') inner=`<div class="panel" style="background:${V.panel};color:${V.head}"><div class="caps"><div>Signal Room Design Office<br>Type and Layout Standards<br>Working Manual</div><div>Set by the office<br>and two outside hands<br>Edition four, 2026</div></div><h1>The manual collects every plate of the first set at full size, plus the notes that went with each print run and a second, revised key to the whole series.</h1><div class="caps foot"><div>Details</div><div>184 pages<br>96 plates<br>24 × 30 cm<br>two spot inks on gray<br>stochastic screen<br>120 gsm uncoated</div></div></div>`;
      else if(c.kind==='grid') inner=`<div class="meta"><span>02 / 05 &nbsp; SPECIMEN</span><span>SIX TILES · 2 × 3</span></div><div class="grid">
        <div class="tile l"><span class="wide">LOMBA</span></div>
        <div class="tile d"><span class="cond">HALF TYPE<br>STRAIT&nbsp;&nbsp;MONO</span></div>
        <div class="tile d list"><i style="margin-left:4%">SORREL</i><i style="margin-left:18%">CHIVE</i><i style="margin-left:34%">TARRAGON</i><i style="margin-left:22%">FENNEL</i><i style="margin-left:10%">LOVAGE</i><i>BASIL</i><i style="margin-left:26%">PARSLEY</i></div>
        <div class="tile l num"><b>01</b><small>ABCDEFGHIJKLMN<br>OPQRSTUVWXYZ<br><br>abcdefghijklmn<br>opqrstuvwxyz<br><br>0123456789½¼¾<br>@£$€(&amp;).?!#</small></div>
        <div class="tile l crop"><span>UMB</span></div>
        <div class="tile l bars">${V.bars.map((b,k)=>`<i style="background:${b}"></i>`).join('')}</div></div>`;
      else if(c.kind==='black') inner=`<div class="meta" style="color:${V.c4}"><span>03 / 05 &nbsp; INK</span><span>FLAT GROUND</span></div><h2 style="color:${V.c4}">One flat color per card. Nothing else separates them.</h2>`;
      else if(c.kind==='plate') inner=`<div class="plate"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><i class="b5"></i></div><div class="meta" style="color:${V.tileD};position:relative"><span>04 / 05 &nbsp; PLATE</span><span>BLUR 14 U</span></div>`;
      else inner=`<div class="meta"><span>05 / 05 &nbsp; INDEX</span><span>END OF STACK</span></div><h2>Five cards, one sticky offset. Scroll back up to see the stack undo.</h2>`;
      return `<div class="card" data-i="${i}" style="background:${c.bg};color:${c.fg}">${inner}</div>`; }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stacked card scroll</title><style>
${faces}
:root{--m:2.4vw;--r:3.6vw;--gap:3.4vw}
html,body{margin:0;height:100%;background:${V.ground};color:${V.c4};font-family:${F};-webkit-font-smoothing:antialiased}
body{overflow-y:auto;overflow-x:hidden;padding-top:1.9vw;box-sizing:border-box}
.card{position:sticky;top:1.9vw;height:calc(100vh - 1.9vw - var(--gap));margin:0 var(--m) var(--gap);border-radius:var(--r);overflow:hidden;box-sizing:border-box;transform-origin:50% 0;will-change:transform}
.card:last-child{margin-bottom:0}
.panel{position:absolute;left:6.6vw;top:6.6vw;right:0.2vw;bottom:-10vw;padding:1.9vw 0 0 1.4vw;box-sizing:border-box}
.caps{display:grid;grid-template-columns:20.2vw 1fr;font-family:Inter,${F};font-size:1.05vw;line-height:1.15;letter-spacing:0}
.caps.foot{position:absolute;left:1.4vw;right:0;top:51vw}
h1{font-family:${F};font-weight:800;font-stretch:100%;font-size:6vw;line-height:0.9;letter-spacing:-0.02em;margin:6.6vw 0 0 20.2vw;width:76vw}
h2{font-family:${F};font-weight:800;font-stretch:90%;font-size:5.2vw;line-height:0.95;margin:0;position:absolute;left:4.3vw;right:4.3vw;bottom:5vw;letter-spacing:-0.01em}
.meta{display:flex;justify-content:space-between;font-family:${MONO};font-size:1.1vw;letter-spacing:0.02em;padding:4vw 4.3vw 0}
.grid{position:absolute;left:4.3vw;right:4.3vw;top:18.8vw;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:24.2vw;column-gap:2.8vw;row-gap:3.9vw}
.tile{position:relative;overflow:hidden;font-family:${F}}
.tile.l{background:${V.tileL};color:${V.tileD}}
.tile.d{background:${V.tileD};color:${V.tileL}}
.wide{position:absolute;inset:0;display:grid;place-items:center;font-weight:900;font-stretch:125%;font-size:4.4vw}
.cond{position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-weight:800;font-stretch:75%;font-size:5.8vw;line-height:0.9}
.list{display:flex;flex-direction:column;justify-content:center;padding:1vw 1.8vw;font-family:${MONO};font-weight:700;font-size:2.3vw;line-height:1.25}
.list i{font-style:normal;white-space:nowrap}
.num b{position:absolute;left:0.4vw;bottom:-2.6vw;font-weight:900;font-stretch:75%;font-size:19vw;line-height:1}
.num small{position:absolute;left:26vw;top:2.2vw;font-family:${MONO};font-size:1.05vw;line-height:1.25}
.crop span{position:absolute;left:-1vw;bottom:-11vw;font-weight:900;font-stretch:75%;font-size:30vw;line-height:1}
.bars{display:grid;grid-template-columns:1fr 9.8vw}
.bars i{grid-column:2;display:block}
.plate{position:absolute;inset:-10%;filter:blur(1.4vw)}
.plate i{position:absolute;border-radius:50%;display:block}
.plate i{width:var(--d);height:var(--d);margin:calc(var(--d) / -2) 0 0 calc(var(--d) / -2)}
.plate .b1{--d:20vw;left:70%;top:52%;background:radial-gradient(circle,${V.plateHi} 0,${V.plateHi} 18%,transparent 70%)}
.plate .b2{--d:7vw;left:72%;top:30%;background:radial-gradient(circle,${V.plateHi} 0,transparent 70%)}
.plate .b3{--d:64vw;left:38%;top:60%;background:radial-gradient(circle,${V.plateLo} 0,transparent 70%);opacity:.5}
.plate .b4{--d:46vw;left:90%;top:80%;background:radial-gradient(circle,${V.plateHi} 0,transparent 70%);opacity:.25}
.plate .b5{--d:52vw;left:18%;top:25%;background:radial-gradient(circle,${V.plateHi} 0,transparent 70%);opacity:.16}
.hint{position:fixed;left:50%;bottom:1.2vw;transform:translateX(-50%);font-family:${MONO};font-size:1.1vw;color:${V.c4};opacity:.7;pointer-events:none}
</style></head><body>${body}<div class="hint" id="hint">SCROLL ↓</div>
<script>
(function(){
  var cards=[].slice.call(document.querySelectorAll('.card')), hint=document.getElementById('hint');
  var scroller=document.scrollingElement||document.documentElement;
  function update(){
    var st=scroller.scrollTop, vh=window.innerHeight, top=window.innerWidth*0.019;
    for(var i=0;i<cards.length;i++){
      // p: how far the NEXT card has risen over this one — 0 while this card is on top, 1 once it is fully covered
      var p=0; if(cards[i+1]){ var r=cards[i+1].getBoundingClientRect(); p=Math.max(0,Math.min(1,1-(r.top-top)/(vh-top))); }
      var s=1-0.05*p, ty=-p*0.02*vh;
      cards[i].style.transform='translateY('+ty.toFixed(1)+'px) scale('+s.toFixed(4)+')';
    }
    hint.style.opacity=st>40?'0':'0.7';
  }
  window.addEventListener('scroll',update,{passive:true}); window.addEventListener('resize',update); update();
})();
</script></body></html>`;
  }
};
