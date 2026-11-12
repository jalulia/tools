/* Mir · Listen section. One specimen per instrument family, grouped by lineage, and a short original phrase per lineage.
   Phrases are event lists for M.audio.score, so the same data plays live and renders offline. All melodies here were written for this library. */
(function(G){
'use strict';
const D3=146.832, J=(r,oct)=>D3*r*Math.pow(2,oct||0);   // just intonation on one root, D: every lineage agrees at the root
const seeded=s=>()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };

/* ── phrases ── */
/* ── adaptive just intonation: every note is tuned as a pure interval over the current chord's root, and the roots sit on a 5-limit lattice over D.
   So each chord is beatless inside, and common tones between chords keep their pitch (7ths are 9/5, a pure minor third over the fifth; tritones 64/45). ── */
const NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11}, MID=n=>{ const m=/^([A-G])([#b]?)(\d)$/.exec(n); return 12*(+m[3]+1)+NN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0); };
const IV=[1,16/15,9/8,6/5,5/4,4/3,64/45,3/2,8/5,5/3,9/5,15/8], ROOT={0:1,2:9/8,3:6/5,4:5/4,5:4/3,7:3/2,8:8/5,9:5/3,10:16/9,11:15/8};
/* tune(note, chordRoot): note and root as names ('F#5', 'A') */
function tune(n,root){ const rs=(NN[root[0]]+(root[1]==='#'?1:root[1]==='b'?-1:0)-2+12)%12, d=MID(n)-50-rs, o=Math.floor(d/12), iv=d-12*o;
  /* a root written with 7 ('A7') is a dominant seventh: its seventh is 7/4, the barbershop seventh, so the chord rings as 4:5:6:7 */
  return D3*ROOT[rs]*(iv===10&&/7$/.test(root)?7/4:IV[iv])*Math.pow(2,o); }

function sani(){ const E=[]; E.push({t:0,play:'drone',id:'dr',opts:{freq:J(1),ratio:3/2,level:.55,fade:1.6}});
  /* first take: a slow modal line; second take: a quiet fourth below, held */
  const A=[[.8,3/2,1,.95,.62],[1.85,4/3,1,.38,.5],[2.28,3/2,1,.38,.55],[2.72,9/5,1,1.35,.66],[4.3,3/2,1,.42,.52],[4.78,4/3,1,.42,.5],[5.26,6/5,1,1,.6],[6.5,9/8,1,.4,.5],[6.95,6/5,1,.4,.52],[7.4,1,1,2.4,.6]];
  for(const [t,r,o,d,v] of A) E.push({t,play:'organ',opts:{freq:J(r,o),dur:d,vel:v}});
  for(const [t,r,o,d] of [[2.72,4/3,1,1.35],[5.26,9/5,0,1],[7.4,3/2,0,2.4]]) E.push({t:t+.03,play:'organ',opts:{freq:J(r,o),dur:d,vel:.42,rate:4.9,pan:-.2}});
  E.push({t:9.7,stop:'dr',rel:1.4}); return E; }

function scott(){ const E=[], q=.66, sw=.62, T=(bar,beat)=>{ const w=Math.floor(beat), f=beat-w; return 1.05+bar*4*q+(w+(f>=.5?sw:f))*q; };
  /* 4/4 at 91 BPM with a soft swing: water, not machinery. D major with lush 7ths and 9ths, a tonic pedal under I and IV, then down the circle home.
     Its feel takes after Koji Kondo's Zora's Domain (lilting, aqueous, jazz-colored) and its tone after Raymond Scott; no melody or progression is quoted. */
  const H=[['D',['D4','F#4','A4','C#5','E5','F#5']],['G',['D4','G4','B4','F#5','A5','B5']],['D',['D4','F#4','A4','C#5','E5','F#5']],['G',['D4','G4','B4','F#5','A5','B5']],
           ['F#',['F#3','A3','C#4','E4','A4','C#5']],['B',['B3','D4','F#4','A4','C#5','D5']],['E',['E4','G4','B4','D5','F#5','G5']],['A7',['A3','C#4','E4','G4','B4','E5']],['D',['D4','F#4','A4','C#5','E5','A5']]];
  const BASS=[['D2','A2'],['D2','A2'],['D2','A2'],['D2','B2'],['F#2','C#3'],['B1','F#2'],['E2','B2'],['A1','E2'],['D2','D2']];
  /* opening: one sweep down the first chord on vibes, as if into water */
  ['A5','F#5','E5','C#5','A4','F#4','E4','D4'].forEach((n,i)=>E.push({t:.05+i*.11,play:'mallet',opts:{freq:tune(n,'D'),dur:1.6,vel:.52-.02*i,trem:5.5,pan:.35-.1*i}}));
  H.forEach(([r,tones],bar)=>{ const o=bar*4;
    /* the lamps: a swung eighth arpeggio over the chord, up then back, tube tones that glide a hair into each other, with tape echo */
    [0,2,1,3,4,3,5,2].forEach((k,i)=>{ if(bar===8&&i>3) return; const f=tune(tones[k],r), lit=.5+.5*Math.cos(i/8*6.283);
      E.push({t:T(0,o+i/2),play:'glide',opts:{freq:f,dur:.18,attack:.012,release:.55,vel:.34+.12*lit,tone:2200+1200*lit,vibrato:0,wow:2.2,echo:.24,echoTime:q*.75,pan:(i/7-.5)*.7}}); });
    /* comping: vibes chords on the 'and' of 2 and on 4, bossa-light */
    const cv=tones.slice(0,4).map(n=>tune(n,r)); if(bar<8) for(const bt of [1.5,3]) E.push({t:T(0,o+bt),play:'mallet',opts:{chord:cv,dur:1.1,vel:.4,trem:5.5,cutoff:3800,pan:-.15}});
    else E.push({t:T(0,o),play:'mallet',opts:{chord:cv,dur:3.2,vel:.46,trem:5.5,cutoff:3800}});
    /* bass: root on 1, fifth on 3, gliding a little into each, the Clavivox way */
    const [b1,b3]=BASS[bar]; E.push({t:T(0,o),play:'glide',opts:{freq:tune(b1,r),dur:q*1.7,attack:.03,release:.3,vel:.62,tone:700,vibrato:0,wow:2}});
    if(bar<8) E.push({t:T(0,o+2),play:'glide',opts:{freq:tune(b3,r),from:tune(b1,r),glide:90,dur:q*1.6,attack:.03,release:.3,vel:.56,tone:700,vibrato:0,wow:2}});
    /* brushes: a shaker on the swung eighths, a soft cross-stick on 2 and the 'and' of 3 */
    if(bar<8){ for(let i=0;i<8;i++) E.push({t:T(0,o+i/2),play:'hat',opts:{vel:i%2?.26:.34,decay:.03}}); for(const bt of [1,2.5]) E.push({t:T(0,o+bt),play:'rim',opts:{vel:.36,tune:.8}}); E.push({t:T(0,o),play:'kick',opts:{vel:.42}}); } });
  /* the voice: two phrases that ask and answer, sliding between notes; every note tuned to the chord under it */
  const MEL=[ [[0,0,'A5',3],[0,3,'F#5',1],[1,0,'E5',1.5],[1,1.5,'F#5',.5],[1,2,'D5',2],[2,0,'C#5',1],[2,1,'E5',1],[2,2,'A5',2],[3,0,'B5',3],[3,3,'A5',1]],
              [[4,0,'A5',2],[4,2,'E5',1],[4,3,'F#5',1],[5,0,'D6',2],[5,2,'C#6',1],[5,3,'B5',1],[6,0,'F#5',2],[6,2,'G5',1],[6,3,'B5',1],[7,0,'A5',2],[7,2,'G5',1],[7,3,'E5',1],[8,0,'F#5',4]] ];
  MEL.forEach((ph,j)=>{ const [b0,k0,n0]=ph[0], end=ph[ph.length-1], id='cl'+j, st=T(0,b0*4+k0), en=T(0,end[0]*4+end[1]+end[3]);
    E.push({t:st,play:'glide',id,opts:{freq:tune(n0,H[b0][0]),from:tune(n0,H[b0][0])*8/9,glide:180,dur:en-st-.08,attack:.14,release:j?2.4:.6,vel:.68,vibrato:12,rate:5.3,wow:3.2,tone:3600,echo:.22,echoTime:q*.75,pan:.05}});
    ph.slice(1).forEach(([b,k,n])=>E.push({t:T(0,b*4+k)-.05,set:id,param:'freq',value:tune(n,H[b][0]),ms:140})); });
  return E; }

function ymo(){ const E=[], s=60/118/4, sw=.08, T=n=>.1+n*s+(n%2?sw*s:0), R=[1,9/8,5/4,45/32,3/2,5/3,15/8], L=i=>J(R[i%7],1+Math.floor(i/7));
  for(let bar=0;bar<4;bar++){ const o=bar*16;
    for(const k of [0,6,8].concat(bar===3?[14]:[])) E.push({t:T(o+k),play:'kick',opts:{vel:k?.62:.72}});
    for(const k of [4,12]) E.push({t:T(o+k),play:'rim',opts:{vel:.55}});
    for(let k=0;k<16;k+=2) E.push({t:T(o+k),play:'hat',opts:{vel:k%4===2?.58:.42}});
    if(bar) for(const k of [3,10]) E.push({t:T(o+k),play:'clave',opts:{vel:.45,freq:J(3/2,4)}});
    if(bar%2) E.push({t:T(o+15),play:'tap',opts:{vel:.5}});
    const root=[1,1,4/3,3/2][bar]; [1,1,2,1,3/2,1,2,15/8].forEach((r,i)=>E.push({t:T(o+i*2),play:'pulse',opts:{freq:J(root*r,-1),dur:.1,pw:.5,cutoff:620,env:1.3,q:3,vel:i%2?.55:.66}})); }
  const lead=[[32,7,3],[35,6,1],[36,4,2],[38,5,2],[40,9,4],[44,8,2],[46,7,2],[48,5,3],[51,4,1],[52,2,4],[56,4,2],[58,6,2],[60,7,4]];
  for(const [n,i,l] of lead) E.push({t:T(n),play:'pulse',opts:{freq:L(i),dur:l*s*.92,pw:.3,cutoff:2100,vel:.6,pan:.12}});
  E.push({t:T(0),play:'bell',opts:{freq:J(5/4,2),vel:.5,pan:-.25}}); E.push({t:T(32),play:'bell',opts:{freq:J(3/2,2),vel:.46,pan:.25}});
  E.push({t:T(64),play:'kick',opts:{vel:.6}}); E.push({t:T(64),play:'bell',opts:{freq:J(1,3),vel:.42,dur:3}}); return E; }

function pfunk(){ const E=[], s=60/98/4, T=n=>.1+n*s+(n%2?.018:n%4===2?.01:0), B=(r,o)=>J(r,o==null?-1:o);
  const line=[[0,1,3],[3,1,1],[6,6/5,2,1],[8,4/3,3],[11,3/2,1],[12,9/5,2,3/2],[14,3/2,2],[16,1,3],[19,1,1,null,0],[22,9/5,2],[24,3/2,2],[26,4/3,2,3/2],[28,6/5,2],[30,9/8,1],[31,16/15,1]];
  for(const [n,r,l,from,o] of line){ const f=o===0?J(1,0):B(r); E.push({t:T(n),play:'bass',opts:{freq:f,dur:l*s*.9,vel:n%4?.6:.7,from:from?B(from):undefined,glide:from?70:undefined,cutoff:n%8===3?260:170}}); }
  for(let n=0;n<32;n++){ if(n%8===0||n===26) E.push({t:T(n),play:'kick',opts:{vel:.62}}); if(n%8===4) E.push({t:T(n),play:'snap',opts:{vel:.5}}); if(n%2===0) E.push({t:T(n),play:'hat',opts:{vel:.32}}); }
  /* renewal: the stack opens, the pad and a bell arrive together */
  const t=T(32); E.push({t,play:'bass',opts:{freq:B(1),from:B(1,-2),glide:90,dur:1.8,env:3.6,decay:.55,vel:.78}}); E.push({t,play:'kick',opts:{vel:.7}});
  E.push({t,play:'pad',opts:{chord:[J(1),J(6/5),J(3/2),J(9/5),J(9/4)],dur:2.2,attack:.35,release:1.2,vel:.62}}); E.push({t:t+.02,play:'bell',opts:{freq:J(3/2,2),vel:.45}}); return E; }

function reyes(){ const E=[], beat=.4, bar=beat*3, T=(b,k)=>.15+b*bar+k*beat;
  /* a waltz, 150 BPM, sixteen bars. The first eight are a ghostly carousel in D minor; the answer turns to D major and becomes a procession:
     glockenspiel doubling the tune, a wordless chant, toy-drum rolls. The feel takes after Susumu Hirasawa's parade music for Paprika; nothing is quoted. */
  const H=[['D','D2',['A3','D4','F4']],['D','A1',['A3','D4','F4']],['G','G2',['Bb3','D4','G4']],['A7','A1',['A3','C#4','G4']],
           ['D','D2',['A3','D4','F4']],['Bb','Bb1',['Bb3','D4','F4']],['G','E2',['Bb3','D4','G4']],['A7','A1',['A3','C#4','G4']],
           ['D','D2',['A3','D4','F#4']],['D7','D2',['A3','C4','F#4']],['G','G2',['B3','D4','G4']],['G','G2',['Bb3','D4','G4']],
           ['D','A1',['A3','D4','F#4']],['E','E2',['B3','E4','G4']],['A7','A1',['A3','C#4','G4']],['D','D2',['A3','D4','F#4']]];
  const MEL=[[0,0,'A4',2],[0,2,'D5',1],[1,0,'F5',2],[1,2,'E5',1],[2,0,'D5',2],[2,2,'Bb4',1],[3,0,'A4',3],
             [4,0,'A4',1],[4,1,'D5',1],[4,2,'F5',1],[5,0,'G5',2],[5,2,'F5',1],[6,0,'E5',2],[6,2,'D5',1],[7,0,'C#5',3],
             [8,0,'A4',2],[8,2,'D5',1],[9,0,'F#5',2],[9,2,'E5',1],[10,0,'G5',2],[10,2,'B5',1],[11,0,'Bb5',2],[11,2,'A5',1],
             [12,0,'A5',2],[12,2,'F#5',1],[13,0,'G5',1.5],[13,1.5,'F#5',.5],[13,2,'E5',1],[14,0,'C#5',1],[14,1,'E5',1],[14,2,'G5',1],[15,0,'F#5',3]];
  H.forEach(([r,bs,up],b)=>{ const par=b>=8;
    E.push({t:T(b,0),play:'pluck',opts:{chord:[tune(bs,r)],dur:.36,cutoff:par?520:380,env:1.1,vel:.68,hp:35}});
    for(const k of [1,2]) E.push({t:T(b,k),play:'pluck',opts:{chord:up.map(n=>tune(n,r)),dur:.12,cutoff:par?1100:820,vel:k===1?.5:.44,pan:k===1?-.16:.16}});
    E.push({t:T(b,0),play:'pad',opts:{chord:up.map(n=>tune(n,r)),dur:bar*.9,attack:.18,release:.5,cutoff:620,detune:3,vel:par?.24:.3}});
    if(par){ /* the procession: a chant on the chord, vowels opening a→o across each two bars; toy drum on 2 and 3, a roll into every fourth bar */
      E.push({t:T(b,0)+.02,play:'vox',opts:{chord:up.map(n=>tune(n,r)),dur:bar-.12,vowel:b%2?'o':'a',to:b%2?'u':'o',attack:.25,release:.3,vel:.5,pan:-.1}});
      for(const k of [1,2]) E.push({t:T(b,k),play:'snap',opts:{vel:.32,freq:2400}});
      if(b%4===3) for(let i=0;i<6;i++) E.push({t:T(b,2)+i*beat/6,play:'snap',opts:{vel:.18+.04*i,freq:2600}}); } });
  let prev=null; MEL.forEach(([b,k,n,l])=>{ const r=H[b][0], f=tune(n,r), leg=prev&&Math.abs(Math.log2(f/prev))<.3&&k!==0;
    E.push({t:T(b,k),play:'ober',opts:{freq:f,from:leg?prev:undefined,glide:70,dur:l*beat*.95,vel:l>=2?.7:.64,cutoff:l>=2?1150:1400,vibrato:l>=2?14:6,echoTime:beat*.75,pan:.06}}); prev=f;
    /* glockenspiel doubles the tune an octave up in the procession */
    if(b>=8) E.push({t:T(b,k),play:'bell',opts:{freq:f*2,dur:Math.min(1.2,l*beat*1.1),vel:.36,ratio:3.5,bright:.8,pan:.28}}); });
  E.push({t:T(7,0),play:'bell',opts:{freq:tune('C#6','A7'),vel:.22,dur:2.2,pan:-.3}}); E.push({t:T(15,0),play:'mallet',opts:{chord:['D5','F#5','A5','D6'].map(n=>tune(n,'D')),dur:3,vel:.46,trem:5}});
  E.push({t:0,play:'noise',id:'hs',opts:{color:.45,level:.07,fade:.6}}); E.push({t:T(16,0)+.4,stop:'hs',rel:1.2});
  return E; }

function mir(){ const E=[];
  E.push({t:0,play:'noise',id:'nz',opts:{color:.3,level:.45,fade:1.2}});
  E.push({t:.1,play:'drone',id:'dr',opts:{freq:J(1),ratio:3/2,detune:28,level:.6,fade:1.4}});
  for(const t of [.7,3.1,5.5]) E.push({t,play:'breath',opts:{dur:2}});
  E.push({t:2.2,set:'dr',param:'detune',value:9,ms:2400}); E.push({t:4.6,set:'dr',param:'detune',value:0,ms:1800});
  E.push({t:6.6,play:'meet',opts:{freq:J(3/2,1),spread:36,dur:1.9,vel:.66}});
  E.push({t:9,stop:'dr',rel:1.4}); E.push({t:9,stop:'nz',rel:1.2}); return E; }

const PHRASES={
  sani: {title:'Organ, two takes',  dur:11.4, events:sani,  about:'A slow modal line over a held fifth, then a quiet second take a fourth below.'},
  scott:{title:'Under water',       dur:28, events:scott, about:'Nine bars in D at a soft swing. Lamps arpeggiate each chord, vibes comp, the bass glides root to fifth, and one tube voice sings two phrases above, on tape.'},
  ymo:  {title:'Step sequence',     dur:10,   events:ymo,   about:'Four bars at 118 BPM with a little swing: rhythm box, sequenced pulse bass, a lead and bells.'},
  pfunk:{title:'The stack opens',   dur:9.2,  events:pfunk, about:'Two bars of sliding bass that lands on renewal, where the pad and a bell arrive.'},
  reyes:{title:'Carousel to parade',dur:21.8, events:reyes, about:'Sixteen bars in three. A ghostly carousel in D minor asks; the answer turns to D major and becomes a procession, with glockenspiel, a wordless chant and toy drums.'},
  mir:  {title:'Two voices meet',   dur:10.6, events:mir,   about:'Two voices beat against each other, slow down and lock; the accent sounds where they meet.'}
};

/* ── specimens ── */
const ev=(name,opts,t)=>({t:t||0,play:name,opts});
const GROUPS=[
  {id:'sani', name:'Organ room', after:'After Mamman Sani · Orla electronic organ, Niger national radio, 1978',
   role:'Listening and holding. Slow, patient tones for the states where nothing is asked of the person.',
   items:[
    {name:'organ', title:'Organ', l1:'Drawbar organ tone with a second rank slightly sharp, delayed vibrato and a small room.', l2:'Used for listening states and slow, held moments.',
     events:()=>[ev('organ',{freq:J(1,1),dur:1.8,vel:.6}),ev('organ',{freq:J(3/2,1),dur:1.4,vel:.5},.45),ev('organ',{freq:J(9/5,1),dur:.9,vel:.5},.95)]},
    {name:'drone', title:'Drone, two voices', l1:'Two held voices a fifth apart. Detuned, their shared partials beat; at 0 cents they lock.', l2:'Used as the bed under tuning states. Drag Detune to hear it.',
     drone:true}]},
  {id:'scott', name:'Manhattan Research', after:'After Raymond Scott · Clavivox and Circle Machine, 1950s',
   role:'Arrival and motion. Pure tones that glide, and circular sequences for anything that turns or repeats.',
   items:[
    {name:'mallet', title:'Vibes', l1:'An FM vibraphone: a bright strike that mellows fast, with a slow motor tremolo.', l2:'Used for watery arpeggios and soft comping chords.',
     events:()=>['D4','F#4','A4','C#5','E5'].map((n,i)=>ev('mallet',{freq:tune(n,'D'),dur:1.8,vel:.55,trem:5.5},i*.13))},
    {name:'glide', title:'Glide', l1:'A tube-like tone with portamento, a vibrato that deepens as the note is held, and a slow tape wow.', l2:'Used for strays drifting inward and for values that change.',
     events:()=>[ev('glide',{freq:440,from:330,glide:380,dur:2.3,vel:.62}),{t:1.1,set:'g',param:'freq',value:440*5/4,ms:300}].map((e,i)=>i===0?Object.assign(e,{id:'g'}):e)}]},
  {id:'ymo', name:'Rhythm machine', after:'After Yellow Magic Orchestra · MC-8 sequencer, Prophet-5, TR-808, found sounds, 1978 to 1983',
   role:'Count and precision. Sequenced steps, bright bells for arrivals, and found objects for the library’s analog things.',
   items:[
    {name:'pulse', title:'Pulse lead', l1:'Two pulse oscillators through a resonant low-pass with a short envelope.', l2:'Used for sequenced figures, counts and readouts.',
     events:()=>[[0,1],[.16,5/4],[.32,3/2],[.48,15/8],[.64,2]].map(([t,r],i)=>ev('pulse',{freq:J(r,1),dur:i===4?.7:.12,vel:.6},t))},
    {name:'bell', title:'Bell', l1:'Two-operator FM at 1 to 3.5, the brightness falling faster than the level.', l2:'Used for arrivals: a crossing that lands, a diamond that fills.',
     events:()=>[ev('bell',{freq:J(1,2),vel:.55}),ev('bell',{freq:J(3/2,2),vel:.45},.36)]},
    {name:'rhythm', title:'Rhythm box', l1:'Analog-style kick, rim, clave, hat and snap, all softened.', l2:'Used for steps and breaths in sequenced pieces. Tap a name to hear one.',
     chips:['kick','rim','clave','hat','snap'],
     events:()=>{ const s=60/118/4, E=[]; for(let n=0;n<16;n++){ const t=n*s+(n%2?.08*s:0); if(n===0||n===6||n===8) E.push(ev('kick',{vel:.66},t)); if(n===4||n===12) E.push(ev('rim',{vel:.55},t)); if(n%2===0) E.push(ev('hat',{vel:n%4===2?.56:.4},t)); if(n===3||n===10) E.push(ev('clave',{vel:.45,freq:J(3/2,4)},t)); if(n===14) E.push(ev('snap',{vel:.5},t)); } return E; }},
    {name:'foley', title:'Found objects', l1:'Synthesized sounds of the library’s things: paper, flaps, knots, needles, rollers, stamps.', l2:'Used for pointer and control events in the analog pairings. Tap a name to hear one.',
     chips:['tick','click','tap','flap','paper','shutter','needle','scratch','knot','stamp','emboss','roller','drop'],
     events:()=>['tick','flap','paper','shutter','knot','stamp','drop'].map((n,i)=>ev(n,{vel:.65,dur:n==='paper'?.32:undefined},i*.42))}]},
  {id:'pfunk', name:'The stack', after:'After Bernie Worrell and P-Funk · stacked Minimoog bass, 1977',
   role:'Lock and renewal only. The loudest, warmest sound in the system, kept for the moments that close a cycle.',
   items:[
    {name:'bass', title:'Stacked bass', l1:'Three detuned saws and a sub square, driven into a resonant low-pass that squelches open.', l2:'Used at lock and at the 21st breath. Rare by design.',
     events:()=>[ev('bass',{freq:J(1,-1),dur:.35,vel:.7}),ev('bass',{freq:J(4/3,-1),from:J(1,-1),glide:80,dur:.3,vel:.62},.42),ev('bass',{freq:J(1,-1),from:J(3/2,-1),glide:120,dur:1,env:3.5,decay:.5,vel:.72},.84)]}]},
  {id:'reyes', name:'Vals', after:'After Frankie Reyes · boleros and waltzes on one Oberheim, a sequencer and an effects pedal, 2016 and 2025',
   role:'Time and memory. One warm synth voice, steady and a little haunted, for keeping, remembering and looking back.',
   items:[
    {name:'ober', title:'Lead', l1:'Saw and pulse a few cents apart, a 12 dB low-pass with its own envelope, portamento, a late vibrato and a tape echo.', l2:'Used for melodies about time: the week, the archive, the strip that was chosen.',
     events:()=>[ev('ober',{freq:J(3/2,1),dur:.9,vel:.6}),ev('ober',{freq:J(6/5,1),from:J(3/2,1),glide:90,dur:.45,vel:.56},.5*1+.42),ev('ober',{freq:J(1,1),from:J(6/5,1),glide:90,dur:1.6,vel:.58},1.45)]},
    {name:'vox', title:'Chant', l1:'Two saws per note through three vowel formants that open from ah to oh, with a late vibrato. Wordless.', l2:'Used when a cycle turns into a procession.',
     events:()=>[ev('vox',{chord:['A3','D4','F#4'].map(n=>tune(n,'D')),dur:2.4,vowel:'a',to:'o',vel:.55})]},
    {name:'pluck', title:'Plucked chord', l1:'The same two oscillators with a short envelope, played as a chord: the oom-pah-pah of a sequenced waltz.', l2:'Used for counts in three and small confirmations.',
     events:()=>[ev('pluck',{chord:[J(1,-1)],dur:.42,cutoff:420,vel:.66}),ev('pluck',{chord:[J(6/5),J(3/2),J(2)],dur:.15,vel:.5},.52),ev('pluck',{chord:[J(6/5),J(3/2),J(2)],dur:.15,vel:.44},1.04)]},
    {name:'pad', title:'Two-oscillator pad', l1:'A saw and a pulse per note, slightly apart and drifting, under a 12 dB low-pass that opens with the swell.', l2:'Used for memory, weekly reflection and renewal.',
     events:()=>[ev('pad',{chord:[J(1),J(6/5),J(3/2),J(9/5),J(9/4)],dur:2.6,vel:.62})]}]},
  {id:'mir', name:'Mir’s own', after:'Tuning, two voices, breath and count',
   role:'The system’s own sounds. They carry the five ideas directly and sit under every lineage.',
   items:[
    {name:'meet', title:'Where two voices meet', l1:'Two pure voices start apart, beat slower as they glide together, and lock. A glass partial blooms at the lock.', l2:'The accent sound. Used once, where the two fields agree.',
     events:()=>[ev('meet',{freq:J(3/2,1),vel:.66})]},
    {name:'breath', title:'Breath', l1:'Air through two soft formants, one exhale long.', l2:'Used for breathing: one breath per exchange, 21 to a cycle.',
     events:()=>[ev('breath',{dur:1.8})]},
    {name:'noise', title:'Noise bed', l1:'Room rumble, soot hiss and dust crackle, mixed by one color control.', l2:'Used under smoked drum, lacquer and darkroom pieces. Here it moves from room to dust and back.',
     events:()=>[{t:0,play:'noise',id:'n',opts:{color:0,level:.6,fade:.5}},{t:.9,set:'n',param:'color',value:1,ms:1200},{t:2.6,set:'n',param:'color',value:.3,ms:900},{t:3.8,stop:'n',rel:.6}]}]}
];

/* ── UI ── */
const CSS=`
.lx{display:grid;gap:clamp(28px,4vw,44px)}
.lx-g{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,9fr);gap:16px 24px;padding-top:14px;border-top:2px solid var(--ink)}
.lx-g h3{font:600 19px/1.2 var(--display);letter-spacing:-.01em;margin:0 0 6px}
.lx-g .lab{display:block;margin-bottom:10px}
.lx-g .role{font-size:14px;line-height:1.45;color:var(--soft);margin:0}
.lx-items{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:0 24px}
.lx-sp{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;padding:12px 0 14px;border-bottom:1px solid var(--hair);align-content:start}
.lx-sp .btn{grid-row:1/span 3;align-self:start;min-width:64px}
.lx-sp b{font:500 11px/1.4 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink);display:block;padding-top:2px}
.lx-sp p{margin:0;font-size:13.5px;line-height:1.45;color:var(--soft)}
.lx-sp p+p{color:var(--ink)}
.lx-chips{grid-column:2;display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.lx-chips .btn{min-height:30px;padding:0 9px;font-size:10px}
.lx-tune{grid-column:2;display:flex;align-items:center;gap:10px;margin-top:8px;font:500 10.5px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--soft)}
.lx-tune input{width:140px;accent-color:var(--accent);margin:0}
.lx-tune output{color:var(--ink);font-variant-numeric:tabular-nums;min-width:7ch}
.lx-ph{grid-column:2;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;padding:12px 0 2px;align-items:start}
.lx-ph .btn{min-width:64px}
.lx-ph b{font:500 11px/1.4 var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--accent);display:block;padding-top:2px}
.lx-ph p{margin:0;font-size:13.5px;line-height:1.45;color:var(--soft)}
@media (max-width:760px){ .lx-g{grid-template-columns:minmax(0,1fr)} .lx-ph{grid-column:1} .lx-items{grid-template-columns:minmax(0,1fr)} }
`;
const BUS='listen';
let current=null;   // {btn, stop()}

function el(tag,attrs,html){ const e=document.createElement(tag); if(attrs) for(const k in attrs) e.setAttribute(k,attrs[k]); if(html!=null) e.innerHTML=html; return e; }
function setBtn(b,on){ if(!b) return; b.setAttribute('aria-pressed',on?'true':'false'); if(b.dataset.lab) b.textContent=on?'Stop':b.dataset.lab; }
function stopCurrent(){ if(!current) return; const c=current; current=null; try{ c.stop(); }catch(_){} setBtn(c.btn,false); }

/* the press is the consent: unlock inside the gesture, enable if needed, and tell the frame */
function withSound(fn){ const A=G.MIR&&G.MIR.audio; if(!A||!A.supported) return;
  const p=A.unlock(); if(!A.enabled){ A.setEnabled(true); G.dispatchEvent(new CustomEvent('mir:sound',{detail:{enabled:true}})); }
  p.then(ok=>{ if(ok) fn(A); }); }

function playEvents(btn,events,dur){ if(current&&current.btn===btn){ stopCurrent(); return; } stopCurrent();
  withSound(A=>{ A.bus(BUS).stopAll(60); const h=A.score(BUS,events); const len=dur||(h.dur+1.2); setBtn(btn,true);
    const timer=setTimeout(()=>{ if(current&&current.btn===btn){ current=null; setBtn(btn,false); } },len*1000);
    current={btn,stop:()=>{ clearTimeout(timer); h.stop(.2); }}; }); }

function oneShot(name){ withSound(A=>{ A.play(BUS,name,{vel:.66,dur:name==='paper'||name==='scratch'?.35:name==='roller'?1:undefined}); }); }

function droneSpecimen(btn,slider,out){ if(current&&current.btn===btn){ stopCurrent(); return; } stopCurrent();
  withSound(A=>{ A.bus(BUS).stopAll(60); const det=+slider.value; const h=A.play(BUS,'drone',{freq:J(1),ratio:3/2,detune:det,level:.6,fade:.9}); setBtn(btn,true);
    const on=()=>{ h.set('detune',+slider.value,120); };
    slider.addEventListener('input',on);
    /* untouched, the voices tune themselves: beating slows and stops over five seconds */
    let auto=null, iv=null; if(det>0){ auto=setTimeout(()=>{ if(!slider.dataset.touched){ h.set('detune',0,2400); let v=det; iv=setInterval(()=>{ v=Math.max(0,v-det/24); if(!slider.dataset.touched){ slider.value=Math.round(v); out.textContent=fmt(v); } if(v<=0) clearInterval(iv); },100); } },1600); }
    current={btn,stop:()=>{ clearTimeout(auto); clearInterval(iv); slider.removeEventListener('input',on); h.stop(null,.8); }}; }); }
const fmt=v=>(+v).toFixed(0)+' ct';

function render(container){ if(!container) return; const doc=container.ownerDocument||document;
  if(!doc.getElementById('lx-css')){ const s=el('style',{id:'lx-css'}); s.textContent=CSS; doc.head.appendChild(s); }
  container.innerHTML=''; const root=el('div',{class:'lx'});
  for(const g of GROUPS){ const sec=el('div',{class:'lx-g',id:'lx-'+g.id}); const head=el('div');
    head.appendChild(el('h3',null,g.name)); head.appendChild(el('span',{class:'lab'},g.after)); head.appendChild(el('p',{class:'role'},g.role)); sec.appendChild(head);
    const items=el('div',{class:'lx-items'});
    for(const it of g.items){ const sp=el('div',{class:'lx-sp'}); const b=el('button',{class:'btn',type:'button','aria-pressed':'false','data-lab':'Play','aria-label':'Play '+it.title},'Play');
      sp.appendChild(b); sp.appendChild(el('b',null,it.title)); sp.appendChild(el('p',null,it.l1)); sp.appendChild(el('p',null,it.l2));
      if(it.chips){ const row=el('div',{class:'lx-chips'}); for(const n of it.chips){ const c=el('button',{class:'btn quiet',type:'button','aria-label':'Play '+n},n); c.addEventListener('click',()=>oneShot(n)); row.appendChild(c); } sp.appendChild(row); }
      if(it.drone){ const lab=el('label',{class:'lx-tune'}), r=el('input',{type:'range',min:'0',max:'40',step:'1',value:'24','aria-label':'Detune in cents'}), o=el('output',null,fmt(24));
        lab.appendChild(document.createTextNode('Detune')); lab.appendChild(r); lab.appendChild(o); sp.appendChild(lab);
        r.addEventListener('input',()=>{ r.dataset.touched='1'; o.textContent=fmt(r.value); });
        b.addEventListener('click',()=>{ delete r.dataset.touched; droneSpecimen(b,r,o); }); }
      else b.addEventListener('click',()=>playEvents(b,it.events()));
      items.appendChild(sp); }
    sec.appendChild(items);
    const ph=PHRASES[g.id]; if(ph){ const row=el('div',{class:'lx-ph'}), b=el('button',{class:'btn',type:'button','aria-pressed':'false','data-lab':'Play','aria-label':'Play phrase: '+ph.title},'Play');
      const txt=el('div'); txt.appendChild(el('b',null,'A phrase · '+ph.title+' · '+Math.round(ph.dur)+' s')); txt.appendChild(el('p',null,ph.about)); row.appendChild(b); row.appendChild(txt);
      b.addEventListener('click',()=>playEvents(b,ph.events(),ph.dur)); sec.appendChild(row); }
    root.appendChild(sec); }
  container.appendChild(root);
  if(!G.__lxBound){ G.__lxBound=true; G.addEventListener('mir:sound',e=>{ if(e.detail&&e.detail.enabled===false) stopCurrent(); }); }
}

G.MIR_LISTEN={render, phrases:PHRASES, groups:GROUPS, root:D3, ratio:J};
})(window);
