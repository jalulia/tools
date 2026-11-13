/* ============================================================
   ST.16 — GLASSDOOR  (flat brand frames, panels that crop the headline)
============================================================ */
BUILDERS.push(function(){
  const stage=study("st16",reg("16","GLASSDOOR","flat brand fields · labeled statement panels · deliberate overlap crop"));
  const W=Math.min(700,window.innerWidth*.88),H=W*1.12;
  stage.style.cssText=`width:${W}px;height:${H}px`;
  const GRN="#00B264",YEL="#F5DB1C",INK="#0F1210";
  // frame A: wordmark field
  const fa=div("paper",`left:0;top:0;width:100%;height:${W*.54}px;background:${GRN};overflow:hidden`);
  fa.innerHTML=`<div style="position:absolute;inset:0;display:grid;place-items:center;
    font-family:'Archivo Black';font-size:${W*.098}px;color:${INK};letter-spacing:.005em">
    <span><span style="display:inline-block;transform:translateY(-.30em) skewX(-6deg);font-size:.62em">&rsquo;</span>GLASSDOOR<span
      style="display:inline-block;transform:translateY(-.30em) scaleX(-1) skewX(-6deg);font-size:.62em">&rsquo;</span></span></div>`;
  stage.appendChild(fa);
  // frame B: overlapping statements
  const fb=div("paper",`left:0;top:${W*.56}px;width:100%;height:${H-W*.56}px;background:#F4F3F0;overflow:hidden`);
  fb.innerHTML=`
    <div style="position:absolute;left:5%;top:5.5%;font-size:${W*.014}px;font-weight:600;
      letter-spacing:.14em;color:${INK}">BRAND IDEA</div>
    <div style="position:absolute;left:5%;top:11%;right:4%;font-family:Inter;font-weight:500;
      font-size:${W*.088}px;line-height:1.06;letter-spacing:-.03em;color:${INK}">Your work story starts here</div>`;
  const vision=div("",`position:absolute;left:0;top:37%;width:76%;height:44%;background:${GRN};
    padding:${W*.035}px ${W*.05}px;color:${INK}`);
  vision.innerHTML=`<div style="font-size:${W*.013}px;font-weight:600;letter-spacing:.14em">VISION</div>
    <div style="font-family:Inter;font-weight:500;font-size:${W*.056}px;line-height:1.16;
      letter-spacing:-.02em;margin-top:${W*.02}px">A healthier, more transparent work community for all</div>`;
  fb.appendChild(vision);
  const mission=div("",`position:absolute;left:50%;top:59%;width:50%;height:41%;background:${YEL};
    padding:${W*.032}px ${W*.04}px;color:${INK}`);
  mission.innerHTML=`<div style="font-size:${W*.013}px;font-weight:600;letter-spacing:.14em">MISSION</div>
    <div style="font-family:Inter;font-weight:500;font-size:${W*.042}px;line-height:1.2;
      letter-spacing:-.015em;margin-top:${W*.016}px">To make work better through real conversation</div>`;
  fb.appendChild(mission);
  stage.appendChild(fb);
});


/* ============================================================
   ST.17 — WE MISS YOU  (uniform-stroke spot illustration, all SVG)
============================================================ */
BUILDERS.push(function(){
  const stage=study("st17",reg("17","WE MISS YOU","uniform-stroke spot illustration · flat fills · drawn entirely in svg"));
  const W=Math.min(830,window.innerWidth*.92),H=W*(624/830);
  stage.style.cssText=`width:${W}px;height:${H}px`;
  const wrap=div("paper",`left:0;top:0;width:100%;height:100%;background:#FBF6EC`);
  stage.appendChild(wrap);
  const S=el("svg",{viewBox:"0 0 830 624",style:"position:absolute;inset:0;width:100%;height:100%"});
  wrap.appendChild(S);

  const K="#26190D";                     // warm ink
  const CO={coral:"#DF5C39",rust:"#C6482C",ochre:"#E4A428",gold:"#EDBE4A",sage:"#5E9064",
    pine:"#3D6B47",blue:"#83A9C6",sky:"#B4D0E4",blush:"#E6A0AC",plum:"#B9647E",
    brown:"#9C6B3E",brownD:"#6B4626",cream:"#F1E6CE",cream2:"#F6EEDB",white:"#FDFBF3",lav:"#B9AED6"};
  const LW=3.05;
  // three layers: back doodles (soft), contact shadows (flat), line art (hand-wavered)
  const back=el("g",{opacity:.9});S.appendChild(back);
  const shad=el("g",{});S.appendChild(shad);
  const art=el("g",{filter:"url(#markerInk)"});S.appendChild(art);

  const P=(d,f,g,par)=>{const p=el("path",Object.assign({d,fill:f||"none",stroke:K,"stroke-width":LW,
    "stroke-linejoin":"round","stroke-linecap":"round"},g||{}));(par||art).appendChild(p);return p};
  const C=(cx,cy,r,f,g,par)=>{const c=el("circle",Object.assign({cx,cy,r,fill:f||"none",stroke:K,
    "stroke-width":LW},g||{}));(par||art).appendChild(c);return c};
  const E=(cx,cy,rx,ry,rot,f,g,par)=>{const e=el("ellipse",Object.assign({cx,cy,rx,ry,fill:f||"none",stroke:K,
    "stroke-width":LW,transform:`rotate(${rot} ${cx} ${cy})`},g||{}));(par||art).appendChild(e);return e};
  const grp=(tr,par)=>{const g=el("g",tr?{transform:tr}:{});(par||art).appendChild(g);return g};
  const shadow=(cx,cy,rx,ry)=>E(cx,cy,rx,ry,0,"rgba(74,52,30,.13)",{stroke:"none"},shad);

  const BASE=560;                        // resting surface

  /* ---- drawing vocabulary ---------------------------------- */
  function leaf(x,y,ang,L,Wd,f,par){
    const a=ang*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca;
    const tx=x+ca*L,ty=y+sa*L,mx=x+ca*L*.5,my=y+sa*L*.5;
    P(`M ${x} ${y} Q ${mx+px*Wd} ${my+py*Wd} ${tx} ${ty} Q ${mx-px*Wd} ${my-py*Wd} ${x} ${y} Z`,f,{},par);
    P(`M ${x} ${y} L ${mx+ca*L*.32} ${my+sa*L*.32}`,"none",{"stroke-width":1.5},par);
  }
  function spiralRose(cx,cy,R,f,par){
    C(cx,cy,R,f,{},par);
    P(`M ${cx+R*.52} ${cy-R*.14} A ${R*.56} ${R*.56} 0 1 1 ${cx-R*.2} ${cy-R*.5}`,"none",{"stroke-width":1.9},par);
    P(`M ${cx+R*.28} ${cy+R*.04} A ${R*.33} ${R*.33} 0 1 1 ${cx-R*.12} ${cy-R*.28}`,"none",{"stroke-width":1.8},par);
    P(`M ${cx-R*.04} ${cy+R*.14} a ${R*.15} ${R*.15} 0 1 1 ${R*.16} ${-R*.06}`,"none",{"stroke-width":1.7},par);
  }
  function daisy(cx,cy,r,pf,cf,n,par){n=n||10;
    for(let i=0;i<n;i++){const a=i/n*6.283;E(cx+Math.cos(a)*r,cy+Math.sin(a)*r,r*.66,r*.3,a*57.3,pf,{},par);}
    C(cx,cy,r*.46,cf,{},par);
  }
  function blossom(cx,cy,r,f,par){
    for(let i=0;i<5;i++){const a=i/5*6.283-1.5708;
      E(cx+Math.cos(a)*r*.9,cy+Math.sin(a)*r*.9,r*.66,r*.46,a*57.3+90,f,{},par);}
    C(cx,cy,r*.32,CO.gold,{"stroke-width":1.5},par);
  }
  function tulip(cx,cy,w,h,f,par){
    P(`M ${cx-w} ${cy} C ${cx-w} ${cy-h*.78} ${cx-w*.34} ${cy-h} ${cx} ${cy-h}
       C ${cx+w*.34} ${cy-h} ${cx+w} ${cy-h*.78} ${cx+w} ${cy}
       C ${cx+w*.5} ${cy+h*.34} ${cx-w*.5} ${cy+h*.34} ${cx-w} ${cy} Z`,f,{},par);
    P(`M ${cx-w*.42} ${cy-h*.66} C ${cx-w*.3} ${cy-h*.2} ${cx-w*.16} ${cy-h*.05} ${cx-w*.12} ${cy+h*.1}
       M ${cx+w*.42} ${cy-h*.66} C ${cx+w*.3} ${cy-h*.2} ${cx+w*.16} ${cy-h*.05} ${cx+w*.12} ${cy+h*.1}`,
       "none",{"stroke-width":1.6},par);
  }
  function berrySprig(x,y,ang,L,f,par){
    const a=ang*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
    P(`M ${x} ${y} Q ${x+ca*L*.5-sa*10} ${y+sa*L*.5+ca*10} ${x+ca*L} ${y+sa*L}`,"none",{"stroke-width":2,stroke:CO.pine},par);
    for(let i=1;i<=5;i++){const t=i/5,bx=x+ca*L*t-sa*10*Math.sin(t*3.14),by=y+sa*L*t+ca*10*Math.sin(t*3.14);
      C(bx,by,4.2,f,{"stroke-width":2},par);}
  }
  function doodleHeart(cx,cy,s,col){
    P(`M ${cx} ${cy+s*.5} C ${cx-s} ${cy-s*.35} ${cx-s*.55} ${cy-s} ${cx} ${cy-s*.32}
       C ${cx+s*.55} ${cy-s} ${cx+s} ${cy-s*.35} ${cx} ${cy+s*.5} Z`,"none",{stroke:col,"stroke-width":2.4},back);
  }
  function sparkle(cx,cy,s,col){
    P(`M ${cx} ${cy-s} C ${cx+s*.18} ${cy-s*.18} ${cx+s*.18} ${cy-s*.18} ${cx+s} ${cy}
       C ${cx+s*.18} ${cy+s*.18} ${cx+s*.18} ${cy+s*.18} ${cx} ${cy+s}
       C ${cx-s*.18} ${cy+s*.18} ${cx-s*.18} ${cy+s*.18} ${cx-s} ${cy}
       C ${cx-s*.18} ${cy-s*.18} ${cx-s*.18} ${cy-s*.18} ${cx} ${cy-s} Z`,col,{stroke:col,"stroke-width":1.4},back);
  }

  /* ---- contact shadows ------------------------------------- */
  [[100,BASE+8,60,13],[196,BASE+9,66,13],[322,BASE+11,120,16],[440,BASE+9,52,12],
   [576,BASE+11,96,16],[706,BASE+10,58,13],[772,BASE+10,44,11],[712,BASE+22,66,12]].forEach(s=>shadow(...s));

  /* ===================== FLOWERING BRANCH (far left) =======
     A woody blossom branch in a terracotta pot — raises the left mass
     into the upper field with real botanical content, not doodles. */
  {const cx=108;
   shadow(cx,BASE+8,56,12);
   // terracotta pot
   P(`M ${cx-32} ${BASE} L ${cx-26} ${BASE-48} L ${cx+26} ${BASE-48} L ${cx+32} ${BASE} Z`,CO.brown);
   P(`M ${cx-29} ${BASE-40} L ${cx+29} ${BASE-40}`,"none",{"stroke-width":2,stroke:CO.brownD});
   P(`M ${cx-40} ${BASE-48} L ${cx+40} ${BASE-48} L ${cx+32} ${BASE-36} L ${cx-32} ${BASE-36} Z`,CO.brown); // pot lip
   // woody main branch reaching up-left, plus two side branches
   P(`M ${cx} ${BASE-48} C ${cx-14} ${BASE-128} ${cx+18} ${BASE-198} ${cx-4} ${BASE-268}
      C ${cx-18} ${BASE-322} ${cx+6} ${BASE-372} ${cx-16} ${BASE-416}`,"none",{stroke:CO.brownD,"stroke-width":3.2});
   P(`M ${cx-6} ${BASE-262} C ${cx+28} ${BASE-286} ${cx+52} ${BASE-300} ${cx+70} ${BASE-330}`,"none",{stroke:CO.brownD,"stroke-width":2.5});
   P(`M ${cx+4} ${BASE-196} C ${cx-28} ${BASE-214} ${cx-46} ${BASE-240} ${cx-56} ${BASE-274}`,"none",{stroke:CO.brownD,"stroke-width":2.5});
   // leaves along the branches
   leaf(cx+6,BASE-150,-44,32,8,CO.sage);leaf(cx-10,BASE-232,-152,30,8,CO.pine);
   leaf(cx+34,BASE-300,-32,28,7,CO.sage);leaf(cx-40,BASE-244,-140,26,7,CO.sage);
   // blossoms at the tips
   blossom(cx-16,BASE-420,15,CO.blush);blossom(cx+72,BASE-334,13,CO.coral);
   blossom(cx-58,BASE-278,12,CO.blush);blossom(cx-4,BASE-300,11,CO.coral);
   blossom(cx+30,BASE-250,9,CO.gold);
  }

  /* ===================== COFFEE MUG ========================= */
  {const l=152,r=236,t=BASE-70;
   P(`M ${l} ${BASE} L ${l+3} ${t} L ${r-3} ${t} L ${r} ${BASE} Z`,CO.cream2);
   P(`M ${r-4} ${t+10} Q ${r+24} ${t+10} ${r+22} ${t+34} Q ${r+20} ${t+58} ${r-6} ${t+54}`,"none");
   // wavy cocoa band + rim
   P(`M ${l+2} ${t} L ${r-2} ${t}`,"none",{"stroke-width":2});
   P(`M ${l+4} ${t+22} Q ${l+22} ${t+12} ${l+40} ${t+22} Q ${l+58} ${t+32} ${l+76} ${t+22}`,"none",{stroke:CO.rust,"stroke-width":4});
   // steam
   P(`M ${l+26} ${t-6} q -9 -14 2 -24 q 11 -10 2 -24`,"none",{"stroke-width":2,stroke:CO.brownD,opacity:.8});
   P(`M ${l+52} ${t-6} q -9 -14 2 -24 q 11 -10 2 -24`,"none",{"stroke-width":2,stroke:CO.brownD,opacity:.8});
  }

  /* ===================== VASE + BOUQUET (centre) ============ */
  {const cx=576;
   // stems first (behind vase mouth)
   const stem=(x0,y0,x1,y1,x2,y2)=>P(`M ${x0} ${y0} C ${x1} ${y1} ${x2} ${y2} ${x2} ${y2}`,"none",{stroke:CO.pine,"stroke-width":2.6});
   P(`M ${cx-10} ${BASE-108} C ${cx-40} ${BASE-190} ${cx-70} ${BASE-280} ${cx-78} ${BASE-360}`,"none",{stroke:CO.pine,"stroke-width":2.6});
   P(`M ${cx} ${BASE-108} C ${cx+4} ${BASE-210} ${cx-2} ${BASE-320} ${cx-6} ${BASE-408}`,"none",{stroke:CO.pine,"stroke-width":2.6});
   P(`M ${cx+12} ${BASE-108} C ${cx+50} ${BASE-190} ${cx+78} ${BASE-262} ${cx+92} ${BASE-330}`,"none",{stroke:CO.pine,"stroke-width":2.6});
   P(`M ${cx+2} ${BASE-108} C ${cx+34} ${BASE-180} ${cx+40} ${BASE-236} ${cx+34} ${BASE-286}`,"none",{stroke:CO.pine,"stroke-width":2.4});
   P(`M ${cx-6} ${BASE-108} C ${cx-30} ${BASE-160} ${cx-46} ${BASE-206} ${cx-46} ${BASE-250}`,"none",{stroke:CO.pine,"stroke-width":2.4});
   // foliage
   leaf(cx-40,BASE-210,-118,54,13,CO.pine);leaf(cx+44,BASE-198,-54,50,12,CO.sage);
   leaf(cx-16,BASE-250,-96,46,11,CO.sage);
   berrySprig(cx+30,BASE-150,-40,120,CO.ochre);
   // blooms (back to front)
   tulip(cx-78,BASE-372,16,30,CO.ochre);
   spiralRose(cx-6,BASE-424,32,CO.coral);
   daisy(cx+92,BASE-344,22,CO.white,CO.gold,12);
   spiralRose(cx+40,BASE-300,22,CO.blush);
   daisy(cx-52,BASE-296,17,CO.blush,CO.gold,10);
   tulip(cx+70,BASE-236,14,26,CO.plum);
   // the vase — a rounded ceramic urn
   P(`M ${cx-56} ${BASE-104} C ${cx-72} ${BASE-64} ${cx-64} ${BASE-16} ${cx-40} ${BASE}
      L ${cx+40} ${BASE} C ${cx+64} ${BASE-16} ${cx+72} ${BASE-64} ${cx+56} ${BASE-104}
      C ${cx+40} ${BASE-118} ${cx-40} ${BASE-118} ${cx-56} ${BASE-104} Z`,CO.cream);
   P(`M ${cx-56} ${BASE-104} C ${cx-40} ${BASE-92} ${cx+40} ${BASE-92} ${cx+56} ${BASE-104}`,"none",{"stroke-width":2});
   P(`M ${cx-58} ${BASE-58} Q ${cx} ${BASE-40} ${cx+58} ${BASE-58}`,"none",{"stroke-width":1.8,stroke:CO.brown,opacity:.7});
  }

  /* ===================== GLASS + BENDY STRAW =============== */
  {const l=414,r=470,t=BASE-150;
   P(`M ${l} ${BASE} L ${l+5} ${t} L ${r-5} ${t} L ${r} ${BASE} Z`,CO.sky,{fill:CO.sky,"fill-opacity":.55});
   P(`M ${l+3} ${BASE-96} L ${r-3} ${BASE-96}`,"none",{"stroke-width":2});   // liquid line
   // straw with a bend
   P(`M ${r-16} ${t+6} L ${r-8} ${t-52} Q ${r-6} ${t-66} ${r-20} ${t-66} L ${r-52} ${t-70}`,"none");
   P(`M ${r-24} ${t+6} L ${r-16} ${t-50}`,"none",{"stroke-width":2});
  }

  /* ===================== GREETING CARD (hero) ============== */
  {const g=grp(`rotate(-6 322 402)`);
   const cx=322,l=cx-86,r=cx+86,t=252,b=552;
   P(`M ${l} ${t+8} Q ${l} ${t} ${l+8} ${t} L ${r-8} ${t} Q ${r} ${t} ${r} ${t+8}
      L ${r} ${b-8} Q ${r} ${b} ${r-8} ${b} L ${l+8} ${b} Q ${l} ${b} ${l} ${b-8} Z`,CO.white,{},g);
   P(`M ${l+10} ${t+10} L ${r-10} ${t+10} L ${r-10} ${b-10} L ${l+10} ${b-10} Z`,"none",{"stroke-width":1.3,stroke:CO.coral,"stroke-dasharray":"1.5 5"},g);
   // clouds
   const cloud=(ccx,ccy,s)=>P(`M ${ccx-24*s} ${ccy} Q ${ccx-28*s} ${ccy-14*s} ${ccx-11*s} ${ccy-13*s}
     Q ${ccx-7*s} ${ccy-26*s} ${ccx+8*s} ${ccy-18*s} Q ${ccx+24*s} ${ccy-22*s} ${ccx+22*s} ${ccy-5*s}
     Q ${ccx+31*s} ${ccy+3*s} ${ccx+18*s} ${ccy+6*s} L ${ccx-18*s} ${ccy+6*s} Q ${ccx-30*s} ${ccy+6*s} ${ccx-24*s} ${ccy} Z`,CO.white,{"stroke-width":2.4},g);
   cloud(cx-60,454,1.05);cloud(cx+64,450,.82);
   // rainbow
   const rb=[[CO.rust,60],[CO.ochre,49],[CO.sage,38],[CO.blue,27]];
   for(const[c,rr]of rb)P(`M ${cx-rr} 452 A ${rr} ${rr} 0 0 1 ${cx+rr} 452`,"none",{stroke:c,"stroke-width":8.5},g);
   P(`M ${cx-60} 452 L ${cx-20} 452 M ${cx+20} 452 L ${cx+60} 452`,"none",{"stroke-width":2.4,stroke:K},g);
   // little sun + hand lettering
   C(cx+72,300,10,CO.gold,{},g);
   for(let i=0;i<8;i++){const a=i/8*6.283;P(`M ${cx+72+Math.cos(a)*14} ${300+Math.sin(a)*14} L ${cx+72+Math.cos(a)*20} ${300+Math.sin(a)*20}`,"none",{"stroke-width":2,stroke:CO.ochre},g);}
   const T=(x,y,s,txt)=>{const e=el("text",{x,y,fill:CO.rust,"font-family":"'Permanent Marker'","font-size":s,
     "text-anchor":"middle",stroke:K,"stroke-width":.7,"paint-order":"stroke"});e.textContent=txt;g.appendChild(e);};
   T(cx-8,330,31,"WE MISS");T(cx,528,36,"YOU");
  }

  /* ===================== FOREGROUND SCATTER ================ */
  // keys on a ring
  {const g=grp(`rotate(-8 300 574)`);
   C(300,574,16,"none",{"stroke-width":4},g);
   const key=(x,rot,f)=>{const k=grp(`rotate(${rot} ${x} 576)`,g);
     P(`M ${x} 576 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0`,f,{},k);
     P(`M ${x+9} 576 L ${x+44} 576 L ${x+44} 583 L ${x+37} 583 L ${x+37} 578 L ${x+30} 578 L ${x+30} 583 L ${x+22} 583 L ${x+22} 578 L ${x+9} 578 Z`,f,{},k);};
   key(310,20,CO.gold);key(306,-12,CO.cream);}
  // wrapped candy
  {const g=grp(`rotate(12 250 588)`);
   P("M 236 580 L 266 580 L 262 598 L 240 598 Z",CO.blush,{"stroke-width":2.6},g);
   P("M 236 580 L 224 574 L 228 589 L 224 601 L 240 598 Z",CO.blush,{"stroke-width":2.6},g);
   P("M 266 580 L 278 574 L 274 589 L 278 601 L 262 598 Z",CO.blush,{"stroke-width":2.6},g);
   P("M 246 584 L 256 596 M 256 584 L 246 596","none",{"stroke-width":1.6},g);}
  // pen
  {const g=grp(`rotate(-4 430 588)`);
   P("M 386 590 L 470 582 L 478 586 L 470 590 L 386 598 Z",CO.blue,{"stroke-width":2.6},g);
   P("M 470 582 L 470 590","none",{"stroke-width":1.6},g);
   P("M 386 592 L 378 593 L 386 596 Z",CO.ochre,{"stroke-width":2},g);}

  /* ===================== CARE CLUSTER (right) ============== */
  // sanitizer pump
  {const l=680,r=734,t=BASE-100;
   P(`M ${l} ${BASE} L ${l} ${t+10} Q ${l} ${t} ${l+12} ${t} L ${r-12} ${t} Q ${r} ${t} ${r} ${t+10} L ${r} ${BASE} Z`,CO.blue);
   P(`M ${l+22} ${t} L ${l+22} ${t-20} L ${l+38} ${t-20} L ${l+38} ${t}`,CO.cream);
   P(`M ${l+20} ${t-20} L ${l+20} ${t-34} L ${l+52} ${t-34} L ${l+52} ${t-27} L ${l+30} ${t-27} L ${l+30} ${t-20} Z`,CO.blue);
   P(`M ${l+8} ${t+22} L ${r-8} ${t+22} L ${r-8} ${BASE-16} L ${l+8} ${BASE-16} Z`,CO.white);
   P(`M ${(l+r)/2} ${t+38} q 9 13 0 19 q -9 -6 0 -19`,CO.sky,{"stroke-width":2});
   P(`M ${(l+r)/2-13} ${t+64} q 5 -8 9 -1 q 4 -7 8 -1 l 0 12 q -12 6 -17 0 Z`,"none",{"stroke-width":1.8});
  }
  // pill bottle
  {const l=750,r=792,t=BASE-70;
   P(`M ${l} ${BASE} L ${l} ${t} L ${r} ${t} L ${r} ${BASE} Z`,CO.coral);
   P(`M ${l-3} ${t} L ${l-3} ${t-16} L ${r+3} ${t-16} L ${r+3} ${t} Z`,CO.cream);
   P(`M ${l+2} ${t-14} L ${l+2} ${t-2} M ${l+10} ${t-14} L ${l+10} ${t-2} M ${l+18} ${t-14} L ${l+18} ${t-2}
      M ${l+26} ${t-14} L ${l+26} ${t-2} M ${l+34} ${t-14} L ${l+34} ${t-2}`,"none",{"stroke-width":1.5});
   P(`M ${l+4} ${t+16} L ${r-4} ${t+16} L ${r-4} ${BASE-14} L ${l+4} ${BASE-14} Z`,CO.white,{"stroke-width":2});
   const mx=(l+r)/2,my=t+34;   // red medical cross
   P(`M ${mx-2.5} ${my-8} h5 v5.5 h5.5 v5 h-5.5 v5.5 h-5 v-5.5 h-5.5 v-5 h5.5 Z`,CO.coral,{"stroke-width":1.5});
  }
  // folded mask (front)
  {const g=grp(`rotate(-12 712 ${BASE+8})`);
   P(`M 676 ${BASE-2} Q 712 ${BASE-16} 748 ${BASE-2} L 744 ${BASE+30} Q 712 ${BASE+40} 680 ${BASE+30} Z`,CO.cream2,{},g);
   P(`M 684 ${BASE+8} Q 712 ${BASE-1} 740 ${BASE+8} M 683 ${BASE+18} Q 712 ${BASE+9} 741 ${BASE+18}`,"none",{"stroke-width":1.8},g);
   P(`M 676 ${BASE-2} C 650 ${BASE-8} 650 ${BASE+26} 680 ${BASE+30}`,"none",{"stroke-width":2.2},g);
   P(`M 748 ${BASE-2} C 774 ${BASE-8} 774 ${BASE+26} 744 ${BASE+30}`,"none",{"stroke-width":2.2},g);
  }
  // thermometer (front)
  {const g=grp(`rotate(-3 640 ${BASE+34})`);
   P(`M 610 ${BASE+30} h 66 l 8 4 -8 4 h -66 Z`,CO.white,{},g);
   C(616,BASE+34,5,CO.rust,{"stroke-width":2},g);
   P(`M 628 ${BASE+34} h 22`,"none",{stroke:CO.rust,"stroke-width":3},g);
   P(`M 656 ${BASE+31} v 6 M 664 ${BASE+31} v 6`,"none",{"stroke-width":1.5},g);
  }
});


/* ============================================================
   ST.18 — CHAIR SPEC STICKERS  (die-cut silhouettes, white-ink line art)
============================================================ */
BUILDERS.push(function(){
  const stage=study("st18",reg("18","DESIGN CHAIR STICKERS","die-cut silhouettes echo the subject · white-ink line drawings · spec ephemera"));
  stage.classList.add("lightstage");
  const W=Math.min(960,window.innerWidth*.94),H=W*.88;
  stage.style.cssText=`width:${W}px;height:${H}px`;
  const u=W/960;
  // warm paper desk, gentle top-left light
  stage.appendChild(div("",`position:absolute;inset:${-44*u}px ${-52*u}px;
    background:radial-gradient(135% 105% at 40% 24%, #F1EEE7 0%, #E8E4DB 56%, #D7D2C7 100%)`));
  const WHT="#F8F5EE", INKLINE="rgba(28,24,18,.16)";
  let SK=0;

  /* kiss-cut vinyl sticker: die halo → colour body → matte sheen → inner edge.
     shadow = tight contact + soft ambient (never a single boilerplate glow). */
  function sticker(x,y,vw,vh,rot,shape,fill,opt,build){
    opt=opt||{};
    const id="sk"+(SK++), sc=opt.scale||1;
    const sv=el("svg",{viewBox:`-16 -16 ${vw+32} ${vh+32}`,
      style:`left:${x*u}px;top:${y*u}px;width:${vw*sc*u}px;height:${vh*sc*u}px;position:absolute;overflow:visible;transform:rotate(${rot}deg)`});
    const dfs=el("defs");
    const f=el("filter",{id:id+"s",x:"-35%",y:"-35%",width:"170%",height:"175%"});
    f.appendChild(el("feDropShadow",{dx:0,dy:1.4,stdDeviation:1.3,"flood-color":"#39352D","flood-opacity":.32}));
    f.appendChild(el("feDropShadow",{dx:2,dy:8,stdDeviation:9,"flood-color":"#39352D","flood-opacity":.16}));
    dfs.appendChild(f);
    const lg=el("linearGradient",{id:id+"g",x1:0,y1:0,x2:.5,y2:1});
    [[0,"#fff",.22],[.34,"#fff",.05],[.72,"#000",.0],[1,"#000",.07]].forEach(([o,c,op])=>
      lg.appendChild(el("stop",{offset:o,"stop-color":c,"stop-opacity":op})));
    dfs.appendChild(lg);
    const cp=el("clipPath",{id:id+"c"});cp.appendChild(el("path",{d:shape}));dfs.appendChild(cp);
    sv.appendChild(dfs);
    const G=el("g",{filter:`url(#${id}s)`});sv.appendChild(G);
    G.appendChild(el("path",{d:shape,fill:"#FCFAF4",stroke:"#FCFAF4","stroke-width":14,"stroke-linejoin":"round"})); // die border
    G.appendChild(el("path",{d:shape,fill,stroke:INKLINE,"stroke-width":.9,"stroke-linejoin":"round"}));            // colour
    const CG=el("g",{});G.appendChild(CG);                                                                          // ink content
    build(CG,dfs,id);
    G.appendChild(el("path",{d:shape,fill:`url(#${id}g)`,"clip-path":`url(#${id}c)`,"pointer-events":"none"}));     // matte sheen
    G.appendChild(el("path",{d:shape,fill:"none",stroke:"rgba(255,255,255,.30)","stroke-width":2.4,"clip-path":`url(#${id}c)`,"pointer-events":"none"})); // die thickness
    if(opt.peel){const[px,py,dx,dy]=opt.peel;
      G.appendChild(el("path",{d:`M ${px} ${py} l ${dx} 0 l 0 ${dy} Z`,fill:"#E9E5DD"}));
      G.appendChild(el("path",{d:`M ${px} ${py} l ${dx} 0 l ${dx*0.5} ${-dy*0.5} Z`,fill:"#FCFAF4",stroke:INKLINE,"stroke-width":.6}));}
    stage.appendChild(sv);
    return sv;
  }
  // ---- white-ink type + line vocabulary ----
  const T=(G,x,y,txt,o={})=>{const t=el("text",Object.assign({x,y,
    fill:o.fill||WHT,"font-family":o.serif?"'DM Serif Display'":(o.mono?"'Space Mono'":"Inter"),
    "font-weight":o.w||600,"font-size":o.s||10,"letter-spacing":(o.ls==null?.6:o.ls),
    "text-anchor":o.a||"middle","font-style":o.i?"italic":"normal"},o.attrs||{}));
    t.textContent=txt;G.appendChild(t);return t};
  const L=(G,d,w,o)=>{G.appendChild(el("path",Object.assign({d,fill:"none",stroke:WHT,"stroke-width":w||2.4,
    "stroke-linejoin":"round","stroke-linecap":"round"},o||{})));};
  const CIR=(G,cx,cy,r,w,o)=>G.appendChild(el("circle",Object.assign({cx,cy,r,fill:"none",stroke:WHT,"stroke-width":w||2.4},o||{})));
  const boxW=(fs,pad)=>fs*0.82+pad*2;
  const box=(G,cx,y,txt,fs,pad)=>{const w2=boxW(fs,pad),tot=txt.length*(w2+3)-3;let x=cx-tot/2;
    for(const ch of txt){G.appendChild(el("rect",{x,y:y-fs*0.78,width:w2,height:fs*1.02,rx:2.2,fill:"none",stroke:WHT,"stroke-width":1.5}));
      const t=el("text",{x:x+w2/2,y,fill:WHT,"font-family":"'Space Mono'","font-weight":700,"font-size":fs,"text-anchor":"middle"});
      t.textContent=ch;G.appendChild(t);x+=w2+3;}};
  const arc=(G,dfs,id,d,txt,o)=>{dfs.appendChild(el("path",{id,d,fill:"none"}));
    const t=el("text",{fill:WHT,"font-size":o.s,"font-weight":o.w||700,"letter-spacing":o.ls||2,
      "font-family":o.serif?"'DM Serif Display'":"Inter"});
    const tp=el("textPath",{href:"#"+id,startOffset:"50%","text-anchor":"middle"});
    tp.textContent=txt;t.appendChild(tp);G.appendChild(t);};
  const microCol=(G,x,y,lh,per,txt,fs)=>{const ws=txt.split(" ");let ln="",row=0;
    for(const w of ws){if((ln+w).length>per){T(G,x,y+row*lh,ln.trim(),{s:fs,w:400,ls:.2,a:"start",mono:true,fill:"rgba(255,255,255,.82)"});row++;ln=""}ln+=w+" "}
    T(G,x,y+row*lh,ln.trim(),{s:fs,w:400,ls:.2,a:"start",mono:true,fill:"rgba(255,255,255,.82)"});return row;};

  /* =====================================================================
     CHAIR ICONS — confident single-hand line, correct proportions.
  ===================================================================== */
  // RIETVELD RED-BLUE, side elevation. Black timber frame (beams overshoot
  // their joints — the signature) holding a reclined back plank + tilted seat.
  function chairRietveld(G){
    const F=3.2, PL=2.7;
    // a timber beam with square end-caps — Rietveld's members overshoot every joint
    const beam=(x1,y1,x2,y2)=>{
      L(G,`M ${x1} ${y1} L ${x2} ${y2}`,F);
      const dx=x2-x1,dy=y2-y1,n=Math.hypot(dx,dy),px=-dy/n*4.6,py=dx/n*4.6;
      L(G,`M ${x1-px} ${y1-py} L ${x1+px} ${y1+py}`,F);
      L(G,`M ${x2-px} ${y2-py} L ${x2+px} ${y2+py}`,F);
    };
    beam(128,308,114,150);           // rear leg (tall, holds the back)
    beam(212,308,208,212);           // front leg
    beam(102,298,236,298);           // floor stretcher, overshoots both ends
    beam(108,212,244,212);           // arm rail, overshoots both ends
    // reclined back plank (broad slab, with a face edge for thickness)
    L(G,"M 150 274 L 180 264 L 150 160 L 120 170 Z",PL);
    L(G,"M 150 160 L 120 170 M 172 262 L 144 168",1.5,{"stroke-opacity":.7});
    // seat plank (tilts down toward the back), with a face edge
    L(G,"M 136 262 L 218 246 L 222 260 L 140 276 Z",PL);
    L(G,"M 218 246 L 222 260 M 138 269 L 220 253",1.5,{"stroke-opacity":.7});
  }
  // WASSILY B3, 3/4 side. Tubular-steel cat's-cradle with slung leather
  // for back (tall, reclined), seat, and arm.
  function chairWassily(G){
    const TU=2.9, LE=2.6, ST={"stroke-width":1,"stroke-dasharray":"1.4 2.6","stroke-opacity":.85};
    // --- chrome tube frame (clean side elevation) ---
    L(G,"M 94 300 L 168 300",TU);                       // floor runner
    L(G,"M 100 300 L 100 292 M 162 300 L 162 292",TU);  // feet
    L(G,"M 104 300 L 112 206",TU);                       // rear post (tall)
    L(G,"M 154 300 L 154 232",TU);                       // front post
    L(G,"M 108 268 L 160 262",TU);                       // seat-frame tube
    L(G,"M 154 232 L 154 224 M 112 224 L 112 208",1.8);           // arm posts tying strap to frame
    // --- slung leather with saddle stitching ---
    L(G,"M 110 262 L 162 256 L 162 270 L 110 276 Z",LE);          // seat strap
    L(G,"M 114 264 L 158 258 M 114 272 L 158 266",1,ST);
    L(G,"M 122 260 L 140 256 L 122 206 L 104 210 Z",LE);          // back strap (tall, reclined)
    L(G,"M 120 256 L 106 210 M 138 254 L 124 208",1,ST);
    L(G,"M 106 218 L 188 212 L 188 224 L 106 230 Z",LE);          // arm strap (cantilevers forward)
    L(G,"M 110 220 L 184 214 M 110 228 L 184 222",1,ST);
  }
  // KURAMATA 'Sofa with Arms', front elevation. Chromed tube: two round arm
  // scrolls, a back rail with bolster, a cushioned seat, tube feet.
  function chairKuramata(G){
    const TU=2.7;
    CIR(G,158,120,17,TU); CIR(G,158,120,11,1.5,{"stroke-opacity":.75}); CIR(G,158,120,6,1.5); // left arm — chromed tube doubled
    CIR(G,262,120,17,TU); CIR(G,262,120,11,1.5,{"stroke-opacity":.75}); CIR(G,262,120,6,1.5); // right arm
    L(G,"M 158 103 Q 210 92 262 103",TU);                // back rail sweeping between arms
    L(G,"M 158 109 Q 210 99 262 109",1.5,{"stroke-opacity":.6}); // rail chrome under-line
    G.appendChild(el("ellipse",{cx:210,cy:112,rx:30,ry:8,fill:"none",stroke:WHT,"stroke-width":2.2})); // bolster
    L(G,"M 160 128 Q 160 140 172 140 L 248 140 Q 260 140 260 128",TU);   // seat front tube
    L(G,"M 168 140 L 252 140 Q 262 140 262 150 L 262 156 L 158 156 L 158 150 Q 158 140 168 140 Z",2.4); // cushion
    L(G,"M 210 140 L 210 156",1.6);                      // cushion split
    // foam tufting
    [180,210,240].forEach(tx=>G.appendChild(el("circle",{cx:tx,cy:148,r:1.6,fill:WHT})));
    L(G,"M 164 156 L 162 172 M 256 156 L 258 172",TU);   // feet
    L(G,"M 156 172 L 170 172 M 250 172 L 264 172",2.2);  // foot glides
  }

  /* =====================================================================
     STICKER 1 — RIETVELD RED-BLUE  (red arch, upper-left)
  ===================================================================== */
  sticker(135,64,300,360,-4,
    "M 0 360 L 0 128 Q 0 0 150 0 Q 300 0 300 128 L 300 360 Z","#D8452C",{scale:1.18},(G,dfs,id)=>{
    arc(G,dfs,id+"arc","M 58 100 Q 150 32 242 100","GERRIT RIETVELD",{s:11.5,w:700,ls:2});
    T(G,150,124,"RED AND BLUE CHAIR",{s:12.5,w:800,ls:1.2});
    T(G,150,140,"· 1917 ·",{s:9.5,w:600,ls:3.4,mono:true});
    box(G,150,164,"DE·STIJL",10.5,2.6);
    // hero chair, centred (nudged down into the open middle)
    {const cg=el("g",{transform:"translate(0 14)"});G.appendChild(cg);chairRietveld(cg);}
    // spec column (right margin — clear of the chair)
    L(G,"M 268 156 L 268 168 M 262 162 L 268 169 L 274 162",1.8);
    [["W","66"],["D","83"],["H","88"]].forEach(([a,b],i)=>{
      T(G,268,192+i*30,a,{s:8,ls:1,mono:true});
      T(G,268,205+i*30,b,{s:11,w:700,mono:true});
      L(G,`M 250 ${212+i*30} L 286 ${212+i*30}`,1,{"stroke-opacity":.5});});
    T(G,268,300,"CM",{s:6.5,mono:true,ls:1});
    // maker quote (left margin — narrow column)
    microCol(G,24,190,8,13,"WHEN I SIT I DO NOT WISH TO SIT AS MY FLESH WOULD LIKE BUT AS MY MIND WOULD",5);
    // bottom band: monograms + years + ©
    T(G,44,318,"G",{s:24,w:800,serif:true});T(G,256,318,"R",{s:24,w:800,serif:true});
    T(G,44,342,"1918",{s:9,mono:true,w:700});T(G,256,342,"1923",{s:9,mono:true,w:700});
    CIR(G,150,314,12,1.4);T(G,150,318,"CE",{s:8.5,w:700,ls:1});
    T(G,150,346,"© WERK GRAPHIC · UTRECHT",{s:5.4,w:400,ls:1.2,mono:true,fill:"rgba(255,255,255,.8)"});
  });

  /* =====================================================================
     STICKER 2 — WASSILY B3  (yellow Bauhaus-stepped, right)
  ===================================================================== */
  sticker(548,100,274,384,3,
    "M 0 384 L 0 96 L 36 96 L 36 60 L 80 60 L 80 96 L 100 96 L 100 18 L 174 18 L 174 96 L 194 96 L 194 60 L 238 60 L 238 96 L 274 96 L 274 384 Z",
    "#E6AF22",{peel:[274,384,-30,-30],scale:1.18},(G,dfs,id)=>{
    T(G,137,48,"1919",{s:11,w:800,mono:true});
    T(G,137,64,"DESSAU",{s:7.5,w:600,ls:2,mono:true});
    box(G,137,112,"BAUHAUS",10.5,2.4);
    T(G,137,136,"MODEL B3",{s:9.5,w:700,ls:2.5});
    T(G,137,157,"WASSILY CHAIR",{s:15,w:800,ls:.6,serif:true});
    T(G,137,173,"MARCEL BREUER",{s:8.5,w:600,ls:2});
    // hero chair
    {const cg=el("g",{transform:"translate(-4 6)"});G.appendChild(cg);chairWassily(cg);}
    // monograms
    T(G,30,214,"M",{s:22,w:800,serif:true});T(G,244,214,"B",{s:22,w:800,serif:true});
    // spec column (left)
    [["W","79"],["D","68"],["H","73"]].forEach(([a,b],i)=>{
      T(G,40,250+i*28,a+" "+b,{s:8.5,w:700,mono:true,a:"start"});
      L(G,`M 30 ${256+i*28} L 84 ${256+i*28}`,1,{"stroke-opacity":.5});});
    T(G,40,238,"CENTIMETRES",{s:5.6,mono:true,a:"start",ls:.6,fill:"rgba(255,255,255,.8)"});
    // maker note (right)
    microCol(G,196,244,7,16,"INSPIRED BY THE FRAME OF A BICYCLE AND THE CONSTRUCTIVIST THEORIES OF DE STIJL",4.5);
    // bottom band
    T(G,52,330,"1925",{s:10,w:700,mono:true,a:"start"});T(G,52,344,"1926",{s:10,w:700,mono:true,a:"start"});
    T(G,220,332,"© Knoll",{s:13,serif:true,i:true,a:"end"});
    CIR(G,222,352,10,1.4);T(G,222,356,"UL",{s:7,w:700});
    T(G,137,372,"© WERK GRAPHIC · WEIL AM RHEIN",{s:5,w:400,ls:.9,mono:true,fill:"rgba(255,255,255,.8)"});
  });

  /* =====================================================================
     STICKER 3 — KURAMATA SOFA WITH ARMS  (green pill, lower-left)
  ===================================================================== */
  sticker(250,486,360,214,-2.5,
    "M 107 0 L 253 0 Q 360 0 360 107 Q 360 214 253 214 L 107 214 Q 0 214 0 107 Q 0 0 107 0 Z","#3F8A52",{scale:1.25},(G,dfs,id)=>{
    T(G,180,34,"✳  SHIRO KURAMATA  ✳",{s:14,w:800,ls:2,mono:true});
    T(G,88,56,"CAPPELLINI",{s:8.5,w:600,ls:2.4,a:"start"});
    T(G,272,56,'"Sofa with Arms"',{s:11,serif:true,i:true});
    // hero chair centred
    chairKuramata(G);
    // left text block
    T(G,40,108,"MID·CENTURY",{s:9,serif:true,a:"start"});
    T(G,40,124,"MODERN",{s:9,serif:true,a:"start"});
    T(G,40,150,"1982",{s:15,w:800,mono:true,a:"start"});
    T(G,40,166,"TOKYO",{s:9,i:true,a:"start",serif:true});
    // right spec block
    [["W","25 IN"],["D","36.5 IN"],["H","26 IN"]].forEach(([a,b],i)=>{
      T(G,320,110+i*17,a+"  "+b,{s:7.5,w:700,mono:true,a:"end"});
      L(G,`M 286 ${115+i*17} L 356 ${115+i*17}`,.9,{"stroke-opacity":.45});});
    CIR(G,320,168,11,1.4);T(G,320,172,"UL",{s:7,w:700});
    // monograms + bottom
    T(G,58,180,"S",{s:20,w:800,serif:true,a:"start"});T(G,300,180,"K",{s:20,w:800,serif:true,a:"end"});
    T(G,180,188,"CHROMED TUBULAR STEEL · POLYURETHANE FOAM CUSHION",{s:5,w:400,ls:.8,mono:true,fill:"rgba(255,255,255,.82)"});
    T(G,180,200,"© WERK GRAPHIC · MILANO · 2018",{s:5,w:400,ls:1,mono:true,fill:"rgba(255,255,255,.8)"});
  });

});
