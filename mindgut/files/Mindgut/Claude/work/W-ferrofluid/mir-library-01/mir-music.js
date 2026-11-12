/* Mir · music layer (M.music). Loads after mir-audio.js.
   A piece composes a Score from its own data: a tempo grid, a chord progression, tuned notes, and visual hits.
   The frame plays the score on the piece's bus and drives the animation from the audio clock, so picture and sound land together.
   The score is built whether or not sound is on, so the visuals (which read hits through M.music.env) never depend on sound.

   The library's harmonic meaning, everywhere:
   - the person is the root (D), the model is the fifth (A), Mir is the third (F#): the interval that appears between them;
   - loose = suspended (the fourth, G, where the third should be), detuned, off the grid;
   - settling = the suspension leaning in, beats slowing, timing pulling onto the grid;
   - in tune = the third arrives (sus4 → 3), the chord is pure (4:5:6), everything on the grid;
   - Ground sets the mode (a mood) and never changes the motif (the meaning). */
(function(G){
'use strict';
const M=G.MIR||(G.MIR={});
const A=()=>M.audio;

/* ── pitch names ── */
const NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const SH=['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'];
const midi=n=>{ if(typeof n==='number') return n; const m=/^([A-G])([#b]?)(-?\d)$/.exec(n); if(!m) throw new Error('M.music: bad note '+n); return 12*(+m[3]+1)+NN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0); };
const name=m=>SH[((m%12)+12)%12]+(Math.floor(m/12)-1);
const pcOf=s=>(NN[s[0]]+(s[1]==='#'?1:s[1]==='b'?-1:0)+12)%12;

/* ── modes over D. Ground picks one; the motif stays. ── */
const MODES={ ionian:[0,2,4,5,7,9,11], dorian:[0,2,3,5,7,9,10], mixolydian:[0,2,4,5,7,9,10], lydian:[0,2,4,6,7,9,11],
  aeolian:[0,2,3,5,7,8,10], harmonic:[0,2,3,5,7,8,11], pentatonic:[0,2,4,7,9], minpent:[0,3,5,7,10] };
const GROUND={ paper:'ionian', night:'dorian', olive:'mixolydian', cobalt:'lydian', ultramarine:'lydian', ultra:'lydian', sky:'lydian', plum:'aeolian', current:'ionian', mixed:'ionian', product:'ionian' };
const groundMode=g=>{ const k=String(g||'paper').toLowerCase().split(/[ ·]/)[0]; return GROUND[k]||'ionian'; };
/* register and air per ground: night sits lower and wetter, sky higher and drier */
const GROUND_FEEL={ paper:{oct:0,send:1}, night:{oct:-1,send:1.35}, olive:{oct:0,send:1.1}, cobalt:{oct:0,send:1.2}, ultramarine:{oct:-1,send:1.25}, ultra:{oct:-1,send:1.25}, sky:{oct:1,send:.9}, plum:{oct:-1,send:1.3}, current:{oct:0,send:1}, mixed:{oct:0,send:1} };

/* ── chords. symbol = root + quality: '', m, 7, maj7, m7, sus4, sus2, add9, maj9, m9, 9, 6, m6, dim, m7b5, 13, 7sus4 ── */
const Q={ '':[0,4,7], m:[0,3,7], '7':[0,4,7,10], maj7:[0,4,7,11], m7:[0,3,7,10], sus4:[0,5,7], sus2:[0,2,7], add9:[0,4,7,14], maj9:[0,4,7,11,14],
  m9:[0,3,7,10,14], '9':[0,4,7,10,14], '6':[0,4,7,9], m6:[0,3,7,9], dim:[0,3,6], m7b5:[0,3,6,10], '13':[0,4,7,10,21], '7sus4':[0,5,7,10], '6/9':[0,4,7,9,14] };
function parse(sym){ const m=/^([A-G][#b]?)(.*)$/.exec(sym); if(!m||!(m[2] in Q)) throw new Error('M.music: bad chord '+sym); return {root:m[1], q:m[2], pcs:Q[m[2]].map(x=>(pcOf(m[1])+x)%12), iv:Q[m[2]]}; }
const dominant=q=>q==='7'||q==='9'||q==='13'||q==='7sus4';
/* the chord symbol's root as M.audio.tune expects it ('A7' marks a dominant seventh, tuned 7/4) */
const tuneRoot=c=>c.root+(dominant(c.q)?'7':'');
/* tuned Hz for a note (midi or name) heard over chord symbol sym */
function hz(n,sym){ const c=parse(sym||'D'); return A().tune(name(midi(n)),tuneRoot(c)); }
/* chord tones in [lo,hi] (midi), ascending */
function tones(sym,lo,hi){ const c=parse(sym), out=[]; for(let m=midi(lo);m<=midi(hi);m++) if(c.pcs.includes(((m%12)+12)%12)) out.push(m); return out; }
/* the k-th chord tone at or above `from` (k may be negative: below) */
function ct(sym,from,k){ const c=parse(sym); let m=midi(from), n=0; const s=k>=0?1:-1; k=Math.abs(k);
  while(!c.pcs.includes(((m%12)+12)%12)) m+=s; while(n<k){ m+=s; if(c.pcs.includes(((m%12)+12)%12)) n++; } return m; }
/* nearest chord tone to m */
function snap(sym,m){ m=midi(m); const c=parse(sym); for(let d=0;d<7;d++){ for(const s of [1,-1]){ const x=m+s*d; if(c.pcs.includes(((x%12)+12)%12)) return x; } } return m; }
/* scale degree d (0-based, any integer) of mode, from D in octave `oct` (D4 = oct 4) */
function deg(mode,d,oct){ const S=MODES[mode]||MODES.ionian, n=S.length, o=Math.floor(d/n); return 12*((oct==null?4:oct)+1)+2+S[((d%n)+n)%n]+12*o; }
/* nearest scale tone to m in mode */
function inMode(mode,m){ const S=MODES[mode]||MODES.ionian; m=midi(m); for(let d=0;d<7;d++) for(const s of [0,-1,1]){ const x=m+s*d; if(S.includes((((x-2)%12)+12)%12)) return x; } return m; }
/* voicing: n chord tones between lo and hi, moved as little as possible from prev (voice leading) */
function voice(sym,lo,hi,n,prev){ const pool=tones(sym,lo,hi); if(!pool.length) return []; n=Math.min(n||3,pool.length);
  if(!prev||!prev.length){ const mid=Math.floor((pool.length-n)/2); return pool.slice(mid,mid+n); }
  const out=[], used=new Set(); prev.slice(0,n).forEach(p=>{ let b=null; for(const m of pool) if(!used.has(m)&&(b==null||Math.abs(m-p)<Math.abs(b-p))) b=m; if(b!=null){ used.add(b); out.push(b); } });
  /* make sure the chord's third (or sus tone) is present: it carries the meaning */
  const c=parse(sym), third=(pcOf(c.root)+c.iv[1])%12; if(!out.some(m=>((m%12)+12)%12===third)){ const t=pool.find(m=>((m%12)+12)%12===third&&!used.has(m)); if(t!=null) out[out.length-1]=t; }
  return out.sort((a,b)=>a-b); }

/* the Mir motif: 5 ↑ 1 ↑ 3. Loose, the 3 is a 4 (sus); in tune it resolves. Transposable by octave. */
const MOTIF={ loose:['A3','D4','G4'], tuned:['A3','D4','F#4'] };

/* ── Score: a small composition on a tempo grid. Times are in ms from the piece's own t = 0. ── */
function score(o){ o=o||{}; const bpm=o.bpm||100, meter=o.meter||[4,4], swing=o.swing||0, beat=60000/bpm*(4/meter[1]), bar=beat*meter[0];
  const ev=[], hits=[], prog=[]; let ids=0, dur=o.dur||0;
  const mode=o.mode||groundMode(o.ground), feel=GROUND_FEEL[String(o.ground||'paper').toLowerCase().split(/[ ·]/)[0]]||GROUND_FEEL.paper;
  const S={ bpm, meter, beat, bar, swing, mode, feel,
    /* time of bar b, beat k (k may be fractional; 8ths after the beat take the swing) */
    at(b,k){ k=k||0; const w=Math.floor(k), f=k-w, sp=.5+swing*.5; return b*bar+(w+(f<.5?f/.5*sp:sp+(f-.5)/.5*(1-sp)))*beat; },
    /* quantize t to a division of the beat (div 1 = beat, 2 = 8th, 4 = 16th) */
    q(t,div){ const u=beat/(div||2); return Math.round(t/u)*u; },
    /* harmony: S.harm([[t, 'D'], [t2, 'Bm7'], …]) — the chord sounding from each time */
    harm(list){ list.forEach(([t,s])=>{ parse(s); prog.push([t,s]); }); prog.sort((a,b)=>a[0]-b[0]); return S; },
    chordAt(t){ let s=prog.length?prog[0][1]:'D'; for(const [ti,si] of prog){ if(ti<=t+1e-6) s=si; else break; } return s; },
    /* a note: n = midi, name, Hz (≥ 128) or {hz}; tuned against the chord at t (or opts.over) */
    note(t,ins,n,d,opts,hit){ const sym=(opts&&opts.over)||S.chordAt(t), f=n&&n.hz?n.hz:(typeof n==='number'&&n>=128?n:hz(n,sym)), id=(opts&&opts.id)||('n'+(ids++));
      const op=Object.assign({},opts||{}); delete op.over; delete op.id; op.freq=f; if(d!=null) op.dur=d/1000;
      if(op.send!=null||feel.send!==1) op.send=(op.send!=null?op.send:(A().sends[ins]||0))*feel.send;
      if(op.from!=null&&(typeof op.from==='string'||op.from<128)) op.from=hz(op.from,sym);
      ev.push({t:t/1000,play:ins,opts:op,id}); if(hit) S.hit(t,hit[0],hit[1]); dur=Math.max(dur,t+(d||0)); return id; },
    /* a chord: notes = midi/names (tuned together over sym) or a symbol (voiced in [lo,hi]) */
    chord(t,ins,notes,d,opts,hit){ const sym=(opts&&opts.over)||S.chordAt(t); const ns=typeof notes==='string'?voice(notes,(opts&&opts.lo)||'A3',(opts&&opts.hi)||'A4',(opts&&opts.n)||3):notes;
      const op=Object.assign({},opts||{}); delete op.over; delete op.lo; delete op.hi; delete op.n; op.chord=ns.map(m=>hz(m,typeof notes==='string'?notes:sym)); if(d!=null) op.dur=d/1000;
      if(feel.send!==1) op.send=(op.send!=null?op.send:(A().sends[ins]||0))*feel.send;
      const id=op.id||('c'+(ids++)); delete op.id; ev.push({t:t/1000,play:ins,opts:op,id}); if(hit) S.hit(t,hit[0],hit[1]); dur=Math.max(dur,t+(d||0)); return id; },
    /* an unpitched event (foley, rhythm box) */
    hitSound(t,ins,opts,hit){ const id='u'+(ids++); ev.push({t:t/1000,play:ins,opts:Object.assign({},opts||{}),id}); if(hit) S.hit(t,hit[0],hit[1]); dur=Math.max(dur,t); return id; },
    /* glide a sounding voice to note n (tuned over the chord at t) */
    glide(t,id,n,ms,param){ const f=n&&n.hz?n.hz:(typeof n==='number'&&n>=128?n:hz(n,S.chordAt(t))); ev.push({t:t/1000,set:id,param:param||'freq',value:f,ms:ms||120}); return S; },
    set(t,id,param,value,ms){ ev.push({t:t/1000,set:id,param,value,ms:ms||60}); return S; },
    stop(t,id,rel){ ev.push({t:t/1000,stop:id,rel:rel==null?.3:rel}); return S; },
    /* a visual hit: key (any string the render asks for), strength 0..1 */
    hit(t,key,s){ hits.push([t,String(key),s==null?1:s]); return S; },
    end(t){ dur=Math.max(dur,t); return S; },
    get dur(){ return dur; },
    out(){ ev.sort((a,b)=>a.t-b.t); hits.sort((a,b)=>a[0]-b[0]); return {events:ev, hits, dur:Math.max(dur,o.dur||0), bpm, beat, bar, mode, prog:prog.slice(), loop:!!o.loop}; } };
  return S; }

/* ── visual pairing: a deterministic envelope of the hits for key at t (ms). Works with sound off. ──
   attack 18 ms, exponential decay tau ms; several hits add and clip at 1. key may end with '*' to match a prefix. */
function env(st,key,t,tau){ const sc=st&&st._mus; if(!sc||!sc.hits.length) return 0; tau=tau||240; const pre=key.endsWith('*')?key.slice(0,-1):null; let v=0;
  for(const [ti,k,s] of sc.hits){ if(ti>t) break; if(pre!=null?!k.startsWith(pre):k!==key) continue; const d=t-ti; if(d>tau*6) continue; v+=s*Math.min(1,d/18+.05)*Math.exp(-d/tau); }
  return Math.min(1,v); }
/* the chord sounding at t in the piece's current score (for interaction sounds and drawing) */
function chordAt(st,t){ const sc=st&&st._mus; if(!sc||!sc.prog.length) return 'D'; let s=sc.prog[0][1]; for(const [ti,si] of sc.prog){ if(ti<=t) s=si; else break; } return s; }
/* ── listening bands: what an analyser would hear, computed from the score itself (deterministic, works with sound off).
   bands(st, t) → {bass, mid, treble, rms} in 0..1, sampled at 60 Hz once per score. After Ki's Soundscape (biome as
   instrument: each band drives its own part of the picture), but read from the composition, so picture and music agree exactly. ── */
const UNP={kick:'b',tap:'b',stamp:'b',drop:'m',rim:'m',clave:'t',hat:'t',snap:'t',tick:'t',click:'t',flap:'m',paper:'t',shutter:'t',needle:'t',scratch:'t',knot:'m',emboss:'m',roller:'m',breath:'m',noise:'m'};
const DEC={pad:1.2,organ:.5,drone:2,vox:.8,ober:.5,glide:.4,bass:.35,pluck:.2,mallet:.6,bell:.9,pulse:.15,meet:.9};
function bandsOf(sc){ if(sc._bands) return sc._bands; const fps=60, n=Math.ceil((sc.dur+1500)/1000*fps)+1, B=[new Float32Array(n),new Float32Array(n),new Float32Array(n)];
  const vg=v=>{ v=v==null?.7:v; return Math.pow(10,(Math.max(0,Math.min(1,v))-1)*1.5); };
  for(const e of sc.events){ if(!e.play) continue; const o=e.opts||{}, a=vg(o.vel)*(o.level!=null?o.level:1), t0=e.t, d=(o.dur!=null?o.dur:.12), tau=DEC[e.play]||.12;
    const parts=[]; if(UNP[e.play]) parts.push([UNP[e.play]==='b'?0:UNP[e.play]==='m'?1:2,a]);
    else { const fs=o.chord||(o.freq?[o.freq]:[]); fs.forEach(f=>parts.push([f<200?0:f<1100?1:2,a/Math.sqrt(fs.length||1)])); }
    for(const [b,amp] of parts){ const i0=Math.max(0,Math.floor(t0*fps)), i1=Math.min(n-1,Math.ceil((t0+d+tau*5)*fps));
      for(let i=i0;i<=i1;i++){ const tt=i/fps-t0; if(tt<0) continue; const env=tt<.012?tt/.012:(tt<d?1:Math.exp(-(tt-d)/tau)); B[b][i]+=amp*env; } } }
  const out=B.map(arr=>{ for(let i=0;i<arr.length;i++) arr[i]=1-Math.exp(-arr[i]*1.6); return arr; });
  const rms=new Float32Array(n); for(let i=0;i<n;i++) rms[i]=Math.min(1,(out[0][i]*.5+out[1][i]*.35+out[2][i]*.25));
  sc._bands={fps,n,b:out[0],m:out[1],t:out[2],r:rms}; return sc._bands; }
function bands(st,t){ const sc=st&&st._mus; if(!sc) return {bass:0,mid:0,treble:0,rms:0}; const B=bandsOf(sc), x=Math.max(0,t)/1000*B.fps, i=Math.min(B.n-2,Math.floor(x)), f=x-i;
  const L=a=>a[i]+(a[i+1]-a[i])*f; return {bass:L(B.b),mid:L(B.m),treble:L(B.t),rms:L(B.r)}; }
/* attach a score to a piece's state without making it part of Copy settings (non-enumerable) */
function attach(st,sc){ try{ Object.defineProperty(st,'_mus',{value:sc,writable:true,configurable:true,enumerable:false}); }catch(_){} return sc; }

/* ── the audio clock as heard: the context time now leaving the speakers ── */
function heard(){ const a=A(), c=a&&a.context; if(!c) return 0; try{ const ts=c.getOutputTimestamp&&c.getOutputTimestamp(); if(ts&&ts.contextTime>0) return ts.contextTime+Math.max(0,(performance.now()-ts.performanceTime)/1000); }catch(_){}
  return c.currentTime-(c.outputLatency||c.baseLatency||0); }

/* ── parameters as music: the default feedback when a control moves (pieces may override with music.param) ──
   range: the value walks a two-octave ladder in the piece's mode, one note per step crossed (at most one per 45 ms);
   select: each option is a chord of the progression (I, IV, vi, V, ii, iii, bVII), played as a short rising arpeggio. */
const LADDER_STEPS=14, OPT_CH=[['D','D4'],['G','D4'],['Bm','D4'],['A','C#4'],['Em','E4'],['F#m','F#4'],['C','E4']];
function param(Ab,id,ctl,oldV,newV,o){ if(!Ab||!ctl) return; o=o||{}; const mode=o.mode||'ionian', ins=o.ins||'mallet', base=o.oct||4, now=Ab.now(); if(!now) return;
  const st=o.st||{}; st._pm=st._pm||{};
  if(ctl.type==='range'){ const lo=+ctl.min, hi=+ctl.max, step=v=>Math.round((Math.max(lo,Math.min(hi,+v))-lo)/((hi-lo)||1)*LADDER_STEPS);
    const a=step(oldV), b=step(newV); if(a===b) return; const dir=b>a?1:-1, last=st._pm[ctl.id]||0, n=Math.min(Math.abs(b-a),4);
    for(let i=1;i<=n;i++){ const k=a+dir*Math.round(i*Math.abs(b-a)/n), m=deg(mode,k,base-1), when=Math.max(now+.004,last+.045*i);
      Ab.play(ins,{freq:A().tune(name(m),'D'),dur:.5,vel:.42+.2*(k/LADDER_STEPS),when,pan:(k/LADDER_STEPS-.5)*.6,trem:ins==='mallet'?5:undefined}); st._pm[ctl.id]=when; } }
  else if(ctl.type==='select'&&/^(ground|film)$/.test(ctl.id)){ /* a ground is a mood: the motif (5 ↑ 1 ↑ 3) heard in the new mode */
    const md=groundMode(newV), fl=GROUND_FEEL[String(newV).toLowerCase()]||GROUND_FEEL.paper, o3=base-1+fl.oct;
    [deg(md,-3,o3+1),deg(md,0,o3+1),deg(md,2,o3+1)].forEach((m,k)=>Ab.play(ins,{freq:A().tune(name(m),'D'),dur:k===2?1.6:.8,vel:.5-.03*k,when:now+.006+k*.11,pan:(k-1)*.18,trem:ins==='mallet'?5:undefined,send:(A().sends[ins]||.3)*fl.send})); }
  else if(ctl.type==='select'){ const opts=ctl.options||[], i=Math.max(0,opts.findIndex(x=>String(x.value)===String(newV))), [sym,from]=OPT_CH[i%OPT_CH.length];
    [0,1,2,3].forEach(k=>{ const m=ct(sym,from,k); Ab.play(ins,{freq:hz(m,sym),dur:.9,vel:.5-.04*k,when:now+.006+k*.07,pan:(k-1.5)*.15,trem:ins==='mallet'?5:undefined}); }); } }

M.music={ midi, name, pcOf, MODES, GROUND, groundMode, GROUND_FEEL, Q, parse, hz, tones, ct, snap, deg, inMode, voice, MOTIF, score, env, bands, chordAt, attach, heard, param };
})(window);
