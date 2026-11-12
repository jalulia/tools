/* Mir · sound engine and palette (M.audio). Loads after mir.js.
   Everything is synthesized with the Web Audio API: oscillators, FM, noise, filters, waveshaping and a generated impulse response.
   No samples, no quotations. Lineages and recipes are documented in SOUND.md.
   The engine is a factory over any BaseAudioContext, so the same instruments render live and offline (tests, WAV export). */
(function(G){
'use strict';
const M=G.MIR||(G.MIR={});
const AC=G.AudioContext||G.webkitAudioContext||null;
const OAC=G.OfflineAudioContext||G.webkitOfflineAudioContext||null;

/* ── small math ── */
const dbg=db=>Math.pow(10,db/20);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const cents=c=>Math.pow(2,c/1200);
/* velocity → gain: 0..1 maps onto a 30 dB range, so vel .5 is a soft note, not a silent one */
const velg=v=>{ v=v==null?.7:v; return v<=0?0:dbg((clamp(v,0,1)-1)*30); };
function srng(seed){ let a=seed>>>0||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ── pitch helpers ── */
const NOTE={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function midiOf(n){ if(typeof n==='number') return n; const m=/^([A-Ga-g])([#b]?)(-?\d+)$/.exec(String(n).trim()); if(!m) return 60;
  return 12*(+m[3]+1)+NOTE[m[1].toUpperCase()]+(m[2]==='#'?1:m[2]==='b'?-1:0); }
function hz(n){ if(typeof n==='number'&&n>=128) return n; return 440*Math.pow(2,(midiOf(n)-69)/12); }
const just=(base,ratio)=>hz(base)*ratio;
/* scales as just ratios. Each lineage has its own pitch world; all share the root, so they can sit together. */
const SCALES={
  sani:  [1,9/8,6/5,4/3,3/2,9/5],              // modal, minor-pentatonic leaning, with a soft 2nd; drones on 1 and 3/2
  ymo:   [1,9/8,5/4,45/32,3/2,5/3,15/8],        // bright lydian major for pulse leads and bells
  bolero:[1,9/8,6/5,4/3,3/2,8/5,15/8],          // harmonic minor, for tender cadences
  scott: [1,9/8,5/4,11/8,3/2,13/8,7/4,15/8],    // harmonics 8 to 15: pure tones that lock without beating
  just:  [1,16/15,9/8,6/5,5/4,4/3,45/32,3/2,8/5,5/3,9/5,15/8]
};
function scale(name,root,octaves){ const r=SCALES[name]||SCALES.just, f0=hz(root==null?'D3':root), o=octaves||2, out=[];
  for(let k=0;k<o;k++) for(const q of r) out.push(f0*q*Math.pow(2,k)); out.push(f0*Math.pow(2,o)); return out; }
/* adaptive just intonation: tune(note, chordRoot[, key]) → Hz. The note is a pure interval over the chord root; roots sit on a 5-limit lattice over the key (D).
   7ths are 9/5 (a pure minor third over the fifth) and tritones 64/45; most common tones keep their pitch from chord to chord. */
const IV5=[1,16/15,9/8,6/5,5/4,4/3,64/45,3/2,8/5,5/3,9/5,15/8], ROOT5={0:1,2:9/8,3:6/5,4:5/4,5:4/3,7:3/2,8:8/5,9:5/3,10:16/9,11:15/8,1:16/15,6:45/32};
function tune(n,root,key){ const k=midiOf(key||'D3'), m=midiOf(n), rs=((midiOf(String(root).replace(/\d+$/,'')+'4')-k)%12+12)%12, d=m-k-rs, o=Math.floor(d/12), iv=d-12*o; return hz(k)*ROOT5[rs]*(iv===10&&/7$/.test(String(root))?7/4:IV5[iv])*Math.pow(2,o); }   // 'A7' → dominant seventh at 7/4
function freqOf(o,def){ if(o.freq) return o.freq; if(o.note!=null) return hz(o.note); return hz(def); }

/* ── per-context caches: waves, curves, noise ── */
const CACHE=new WeakMap();
function cache(ctx){ let c=CACHE.get(ctx); if(!c){ c={wave:new Map(),curve:new Map(),buf:new Map()}; CACHE.set(ctx,c); } return c; }
function wave(ctx,key,fn){ const c=cache(ctx).wave; if(!c.has(key)){ const [re,im]=fn(); c.set(key,ctx.createPeriodicWave(re,im)); } return c.get(key); }
function harm(list){ const n=list.length+1, re=new Float32Array(n), im=new Float32Array(n); list.forEach((a,i)=>{ im[i+1]=a; }); return [re,im]; }
const WAVES={
  organ:ctx=>wave(ctx,'organ',()=>harm([1,.55,.30,.20,0,.07,0,.05])),             // 8' 4' 2⅔' 2' … 1': a drawbar registration
  clav: ctx=>wave(ctx,'clav', ()=>harm([1,.11,.055,.018,.01])),                     // near-sine with a little 2nd and 3rd: a tube oscillator, not a sine table
  drone:ctx=>wave(ctx,'drone',()=>harm([1,.26,.12,.05])),                           // soft partials so fifths can beat
  pulse:(ctx,pw)=>{ pw=Math.round(clamp(pw,.05,.5)*50)/50; return wave(ctx,'pulse'+pw,()=>{ const n=96, re=new Float32Array(n), im=new Float32Array(n);
    for(let k=1;k<n;k++) re[k]=2/(k*Math.PI)*Math.sin(k*Math.PI*pw); return [re,im]; }); }
};
function curve(ctx,key,fn){ const c=cache(ctx).curve; if(!c.has(key)){ const n=2048, a=new Float32Array(n); for(let i=0;i<n;i++) a[i]=fn(i/(n-1)*2-1); c.set(key,a); } return c.get(key); }
/* noise buffers are seeded, so offline renders are reproducible */
function noiseBuf(ctx,kind){ const c=cache(ctx).buf; if(c.has(kind)) return c.get(kind);
  const sr=ctx.sampleRate, len=Math.floor(sr*(kind==='crackle'?3.1:2.3)), b=ctx.createBuffer(1,len,sr), d=b.getChannelData(0), R=srng(kind==='white'?7:kind==='brown'?11:13);
  if(kind==='white'){ for(let i=0;i<len;i++) d[i]=R()*2-1; }
  else if(kind==='brown'){ let y=0; for(let i=0;i<len;i++){ y=(y+.02*(R()*2-1))*.998; d[i]=y*3.2; } let z=0; const k=1-Math.exp(-2*Math.PI*480/sr); for(let i=0;i<len;i++){ z+=k*(d[i]-z); d[i]=z; } /* baked 480 Hz one-pole: room rumble */ let m=0; for(let i=0;i<len;i++) m+=d[i]; m/=len; for(let i=0;i<len;i++) d[i]-=m; }
  else if(kind==='metal'){ /* six square waves at the 808 hat's inharmonic ratios, summed once per context */ const F=[205.3,304.4,369.6,522.7,540,800];
    for(let i=0;i<len;i++){ let x=0; for(const f of F) x+=((i*f/sr)%1)<.5?1:-1; d[i]=x/6; } }
  else { /* crackle: sparse soft impulses (soot, dust, paper fiber) */ for(let i=0;i<len;i++) d[i]=0; const n=Math.floor(len/sr*38);
    for(let k=0;k<n;k++){ const p=Math.floor(R()*(len-200)), a=(R()<.85?.25:.9)*(R()<.5?-1:1), tau=sr*(.0003+R()*.0012); for(let j=0;j<200;j++) d[p+j]+=a*Math.exp(-j/tau)*(j<3?j/3:1); } }
  c.set(kind,b); return b; }

/* generated impulse response: a short, soft plate-like room. Early taps, decorrelated L/R tail, darkening as it decays. */
function makeIR(ctx,rt60,len){ const sr=ctx.sampleRate, n=Math.floor(sr*len), b=ctx.createBuffer(2,n,sr), pre=Math.floor(sr*.009);
  for(let ch=0;ch<2;ch++){ const d=b.getChannelData(ch), R=srng(101+ch*17); let y=0, e=0;
    for(let i=pre;i<n;i++){ const t=(i-pre)/sr, env=Math.pow(10,-3*t/rt60), a=.25+.7*Math.min(1,t/rt60); y+= (1-a)*((R()*2-1)-y); d[i]=y*env*(i-pre<sr*.004?(i-pre)/(sr*.004):1); }
    [[.0071,.5],[.0113,.38],[.0172,.3],[.0236,.22],[.0311,.17],[.0419,.12]].forEach(([tt,g],k)=>{ const p=pre+Math.floor(sr*tt*(ch?1.07:1)); if(p<n) d[p]+=g*((k+ch)%2?-1:1); });
    for(let i=0;i<n;i++) e+=d[i]*d[i]; const s=1/Math.sqrt(e||1); for(let i=0;i<n;i++) d[i]*=s; const f=Math.floor(sr*.08); for(let i=0;i<f;i++) d[n-1-i]*=i/f; }
  return b; }

/* ── loudness calibration (dB at vel .7 before master). Set from offline measurements; see SOUND.md ── */
const LV={organ:-13,glide:-15,bell:-13,pulse:-13,bass:-11,pad:-7,ober:-7,pluck:-8,mallet:-11,vox:-6,kick:-8,rim:-15,clave:-15,hat:-14,snap:-10,
  tick:-14,click:-17,tap:-13,flap:-9,paper:-12,shutter:-9,needle:-13,scratch:-13,knot:-19,stamp:-12,emboss:-12,roller:-17,drop:-12,
  drone:-19,noise:-13,meet:-15,breath:-8};
const SEND={organ:.32,glide:.26,bell:.42,pulse:.16,bass:.04,pad:.38,ober:.24,pluck:.2,mallet:.42,vox:.5,kick:.04,rim:.14,clave:.2,hat:.08,snap:.22,
  tick:.1,click:.06,tap:.12,flap:.12,paper:.15,shutter:.12,needle:.1,scratch:.1,knot:.12,stamp:.14,emboss:.12,roller:.1,drop:.3,
  drone:0,noise:0,meet:.36,breath:.25};
const SUSTAINED={drone:1,noise:1};
const DEFCHAIN={};   // define(): an instrument's preferred lineage chain
/* tape echo send per instrument (the 'effects pedal'); 0 unless a piece or phrase asks with opts.echo */
const ECHO={ober:.3};

/* ── Voice: one sounding instrument instance. Output goes through a gate gain, so stop() can always fade from 1. ── */
class Voice{
  constructor(e,bus,name,t0,o){ const c=e.ctx; this.e=e; this.c=c; this.bus=bus; this.name=name; this.t0=t0; this.nodes=[]; this.srcs=[]; this.params={}; this.alive=true; this.tEnd=Infinity;
    this.gate=c.createGain(); this.out=this.gate; let tail=this.gate;
    if(o.pan){ const p=c.createStereoPanner?c.createStereoPanner():null; if(p){ p.pan.value=clamp(o.pan,-1,1); this.gate.connect(p); tail=p; this.nodes.push(p); this.params.pan=[p.pan]; } }
    tail.connect(bus.dry); const s=o.send!=null?o.send:(SEND[name]||0); if(s>0){ const sg=c.createGain(); sg.gain.value=s; tail.connect(sg); sg.connect(bus.wet); this.nodes.push(sg); }
    const ec=o.echo!=null?o.echo:(ECHO[name]||0); if(ec>0){ const eg=c.createGain(); eg.gain.value=ec; tail.connect(eg); eg.connect(e.echo(bus,o.echoTime)); this.nodes.push(eg); }
    this.nodes.push(this.gate); }
  n(x){ this.nodes.push(x); return x; }
  gain(v){ const g=this.c.createGain(); g.gain.value=v==null?1:v; return this.n(g); }
  filt(type,f,q){ const b=this.c.createBiquadFilter(); b.type=type; b.frequency.value=f; if(q!=null) b.Q.value=q; return this.n(b); }
  osc(type,f,t0,det){ const o=this.c.createOscillator(); if(typeof type==='string') o.type=type; else o.setPeriodicWave(type); o.frequency.value=f; if(det) o.detune.value=det; o.start(t0); this.srcs.push(o); return this.n(o); }
  cst(v,t0){ const s=this.c.createConstantSource(); s.offset.value=v; s.start(t0); this.srcs.push(s); return this.n(s); }
  noise(kind,t0,rate){ const s=this.c.createBufferSource(); s.buffer=noiseBuf(this.c,kind||'white'); s.loop=true; if(rate) s.playbackRate.value=rate;
    const off=(this.e.rnd()*s.buffer.duration*.9); s.start(t0,off); this.srcs.push(s); return this.n(s); }
  /* computed buffers: bank(key, sr => [Float32Array L, Float32Array R?]) → AudioBuffer, cached per context; buf(b, t0, gain, rate, dest) plays one */
  bank(key,make){ const c=cache(this.c).buf, k='bank|'+this.name+'|'+key; if(!c.has(k)){ const ch=make(this.c.sampleRate), b=this.c.createBuffer(ch.length,ch[0].length,this.c.sampleRate); ch.forEach((a,i)=>b.getChannelData(i).set(a)); c.set(k,b); } return c.get(k); }
  buf(b,t0,g,rate,dest){ const s=this.c.createBufferSource(); s.buffer=b; s.playbackRate.value=rate||1; const a=this.gain(g==null?1:g); s.connect(a); a.connect(dest||this.out); s.start(t0); this.srcs.push(s); this.n(s); return s; }
  shaper(key,fn){ const w=this.c.createWaveShaper(); w.curve=curve(this.c,key,fn); w.oversample='2x'; return this.n(w); }
  lfo(f,depth,t0,shape){ const o=this.osc(shape||'sine',f,t0), g=this.gain(depth); o.connect(g); return g; }
  /* AR envelope on a gain param: ≥5 ms linear attack, exponential settle, ≥5 ms linear release */
  ar(p,t0,peak,a,hold,r){ a=Math.max(a,.005); r=Math.max(r,.005); p.setValueAtTime(0,t0); p.linearRampToValueAtTime(peak,t0+a); p.setValueAtTime(peak,t0+a+hold); p.linearRampToValueAtTime(0,t0+a+hold+r); return t0+a+hold+r; }
  /* percussive envelope: 5 ms linear attack, exponential decay (tau), linear close to zero at the end */
  perc(p,t0,peak,tau,a){ a=Math.max(a||.005,.005); const end=t0+a+tau*7; p.setValueAtTime(0,t0); p.linearRampToValueAtTime(peak,t0+a); p.setTargetAtTime(0,t0+a,tau); p.setValueAtTime(peak*Math.exp(-(end-.006-t0-a)/tau),end-.006); p.linearRampToValueAtTime(0,end); return end; }
  finish(t){ this.tEnd=t; for(const s of this.srcs){ try{ s.stop(t); }catch(_){} } const last=this.srcs[this.srcs.length-1]; if(last) last.onended=()=>this.cleanup(); }
  stop(when,rel){ if(!this.alive) return; const c=this.c, t=Math.max(c.currentTime,when==null?c.currentTime:when), r=Math.max(.005,rel==null?.06:rel); if(t+r>=this.tEnd) return;
    const g=this.gate.gain; g.cancelScheduledValues(t); g.setValueAtTime(1,t); g.linearRampToValueAtTime(0,t+r); this.finish(t+r+.01); }
  cleanup(){ if(!this.alive) return; this.alive=false; for(const x of this.nodes){ try{ x.disconnect(); }catch(_){} } this.nodes.length=0; this.srcs.length=0; this.bus.voices.delete(this); this.e.voices.delete(this); }
  set(param,value,ms,when){ const f=this.params[param]; if(!f) return; const t=Math.max(this.c.currentTime,when||0), tau=Math.max(5,ms==null?60:ms)/3000;
    if(typeof f==='function') return f(value,t,tau);
    for(const p of f){ p.cancelScheduledValues(t); p.setTargetAtTime(value,t,tau); } }
}
/* glide a set of frequency params, keeping their ratios */
function glider(list){ return (v,t,tau)=>{ for(const [p,k] of list){ p.cancelScheduledValues(t); p.setTargetAtTime(v*k,t,tau); } }; }

/* ── the palette. Each instrument: (v, o, t0, g) → end time (Infinity for beds). g = calibrated gain. ── */
const INS={};

/* SANI · organ: drawbar registration, a second rank 4 cents sharp for slow chorus beating, delayed vibrato, soft key contact, room */
INS.organ=(v,o,t0,g)=>{ const f=freqOf(o,'D4'), d=o.dur??1.2, a=o.attack??.016, r=o.release??.18, c=v.c;
  const w=WAVES.organ(c), o1=v.osc(w,f,t0), o2=v.osc(w,f,t0,4+(o.detune||0)), m2=v.gain(.32), lp=v.filt('lowpass',o.cutoff||3600,.5), amp=v.gain(0);
  o1.connect(lp); o2.connect(m2); m2.connect(lp); lp.connect(amp); amp.connect(v.out);
  const vib=v.lfo(o.rate||5.4,0,t0); vib.connect(o1.detune); vib.connect(o2.detune); vib.gain.setValueAtTime(0,t0); vib.gain.linearRampToValueAtTime(o.vibrato??7,t0+Math.min(.7,d));
  const kc=v.noise('white',t0), kf=v.filt('bandpass',2600,1.2), kg=v.gain(0); kc.connect(kf); kf.connect(kg); kg.connect(v.out); v.perc(kg.gain,t0,g*.05,.004);
  const end=v.ar(amp.gain,t0,g,a,Math.max(0,d-a),r); v.params.freq=glider([[o1.frequency,1],[o2.frequency,1]]); v.params.cutoff=[lp.frequency]; return end; };

/* SCOTT · glide: near-sine with portamento (Clavivox), vibrato that deepens as the note is held */
INS.glide=(v,o,t0,g)=>{ const f=freqOf(o,'A4'), d=o.dur??1.4, gl=(o.glide??0)/1000, c=v.c;
  const os=v.osc(WAVES.clav(c),o.from||f,t0), tone=v.filt('lowpass',o.tone||5200,.5), amp=v.gain(0); os.connect(tone); tone.connect(amp); amp.connect(v.out);
  /* tape: a slow wow and a faint flutter, so held tones drift like Manhattan Research's tape, not a sine table */
  const ph=v.e.rnd(), wo=v.lfo(.31+ph*.22,o.wow??3.2,t0), fl=v.lfo(6.1+ph,o.flutter??1.1,t0); wo.connect(os.detune); fl.connect(os.detune);
  if(o.from&&gl>0){ os.frequency.setValueAtTime(o.from,t0); os.frequency.setTargetAtTime(f,t0,gl/3); }
  const vib=v.lfo(o.rate||5.2,0,t0); vib.connect(os.detune); vib.gain.setValueAtTime(0,t0+.12); vib.gain.linearRampToValueAtTime(o.vibrato??9,t0+.12+Math.min(.9,d));
  const end=v.ar(amp.gain,t0,g,o.attack??.03,Math.max(0,d-.03),o.release??.26); v.params.freq=glider([[os.frequency,1]]); v.params.vibrato=[vib.gain]; return end; };

/* YMO · bell: two-operator FM (1 : 3.5 by default), index decays faster than amplitude; a quiet octave partial for glass */
INS.bell=(v,o,t0,g)=>{ const f=freqOf(o,'A5'), d=o.dur??2.4, ratio=o.ratio??3.5, I=(o.bright??1)*2.2, c=v.c;
  const car=v.osc('sine',f,t0), mod=v.osc('sine',f*ratio,t0), mi=v.gain(0), amp=v.gain(0), lp=v.filt('lowpass',o.cutoff||6500,.4);
  mod.connect(mi); mi.connect(car.frequency); car.connect(amp); amp.connect(lp); lp.connect(v.out);
  mi.gain.setValueAtTime(I*f*ratio*.5,t0); mi.gain.setTargetAtTime(I*f*ratio*.03,t0,d*.12);
  const gl=v.osc('sine',f*2,t0), ga=v.gain(0); gl.connect(ga); ga.connect(lp); v.perc(ga.gain,t0,g*.16,d*.08);
  const end=v.perc(amp.gain,t0,g,d/6.5); return end; };

/* YMO · pulse: two pulse oscillators (pw), resonant low-pass with a short envelope, delayed vibrato on long notes */
INS.pulse=(v,o,t0,g)=>{ const f=freqOf(o,'A4'), d=o.dur??.3, c=v.c, w=WAVES.pulse(c,o.pw??.3);
  const o1=v.osc(w,f,t0), o2=v.osc(w,f,t0,6), m2=v.gain(.5), lp=v.filt('lowpass',1000,o.q??2.2), amp=v.gain(0);
  o1.connect(lp); o2.connect(m2); m2.connect(lp); lp.connect(amp); amp.connect(v.out);
  const base=o.cutoff||1900; lp.frequency.setValueAtTime(base*Math.pow(2,o.env??1.4),t0); lp.frequency.setTargetAtTime(base,t0+.006,.09);
  if(o.from&&o.glide){ for(const x of [o1,o2]){ x.frequency.setValueAtTime(o.from,t0); x.frequency.setTargetAtTime(f,t0,o.glide/3000); } }
  if(d>.4){ const vib=v.lfo(5.8,0,t0); vib.connect(o1.detune); vib.connect(o2.detune); vib.gain.setValueAtTime(0,t0+.3); vib.gain.linearRampToValueAtTime(8,t0+.3+Math.min(.6,d-.3)); }
  const a=.006, p=amp.gain; p.setValueAtTime(0,t0); p.linearRampToValueAtTime(g,t0+a); p.setTargetAtTime(g*.72,t0+a,.06); p.setValueAtTime(g*.72,t0+Math.max(a+.01,d)); const r=o.release??.08; p.linearRampToValueAtTime(0,t0+Math.max(a+.01,d)+r);
  v.params.freq=glider([[o1.frequency,1],[o2.frequency,1]]); v.params.cutoff=[lp.frequency]; return t0+Math.max(a+.01,d)+r; };

/* P-FUNK · bass: three detuned saws and a square an octave down, driven, then a resonant 24 dB low-pass with a squelch envelope; glide */
INS.bass=(v,o,t0,g)=>{ const f=freqOf(o,'D2'), d=o.dur??.4, c=v.c;
  const fq=v.cst(o.from||f,t0); if(o.from){ fq.offset.setValueAtTime(o.from,t0); fq.offset.setTargetAtTime(f,t0,(o.glide??60)/3000); }
  const mix=v.gain(.36), oscs=[['sawtooth',-8],['sawtooth',0],['sawtooth',7],['square',-1200]];
  for(const [t,dt] of oscs){ const x=v.osc(t,0,t0,dt); fq.connect(x.frequency); if(t==='square'){ const s=v.gain(.42); x.connect(s); s.connect(mix); } else x.connect(mix); }
  const sh=v.shaper('bassdrive',x=>Math.tanh(1.7*x)/Math.tanh(1.7)), l1=v.filt('lowpass',200,.7), l2=v.filt('lowpass',200,o.res??5.5), hp=v.filt('highpass',32,.6), amp=v.gain(0);
  mix.connect(sh); sh.connect(l1); l1.connect(l2); l2.connect(hp); hp.connect(amp); amp.connect(v.out);
  const base=o.cutoff||170, pk=base*Math.pow(2,o.env??3.1); for(const L of [l1,l2]){ L.frequency.setValueAtTime(base,t0); L.frequency.linearRampToValueAtTime(pk,t0+.008); L.frequency.setTargetAtTime(base*1.2,t0+.008,(o.decay??.2)/3); }
  const p=amp.gain, a=.005, r=o.release??.09; p.setValueAtTime(0,t0); p.linearRampToValueAtTime(g,t0+a); p.setTargetAtTime(g*.84,t0+a,.08); p.setValueAtTime(g*.84,t0+Math.max(d,a+.01)); p.linearRampToValueAtTime(0,t0+Math.max(d,a+.01)+r);
  v.params.freq=glider([[fq.offset,1]]); v.params.cutoff=(val,t,tau)=>{ for(const L of [l1,l2]){ L.frequency.cancelScheduledValues(t); L.frequency.setTargetAtTime(val,t,tau); } }; return t0+Math.max(d,a+.01)+r; };

/* REYES · pad: per note a saw and a pulse, slightly apart and drifting (two slow LFOs), one 12 dB low-pass that opens with the swell */
INS.pad=(v,o,t0,g)=>{ const c=v.c, d=o.dur??3, att=o.attack??.5, rel=o.release??1.1;
  const ch=(o.chord||[o.freq||o.note||'D3']).map(n=>typeof n==='number'?n:hz(n)), dt=o.detune??7, w=WAVES.pulse(c,.42);   // chord numbers are always Hz
  const sum=v.gain(1/Math.sqrt(ch.length)*.5), lp=v.filt('lowpass',600,o.q??.75), hp=v.filt('highpass',110,.5), amp=v.gain(0);
  const lo=v.osc('sine',.23,t0), d1=v.gain(3.2), d2=v.gain(-2.6), fl=v.gain((o.cutoff||1050)*.08); lo.connect(d1); lo.connect(d2); lo.connect(fl); const R=srng((ch.length*7919+Math.round(ch[0]))|0);
  ch.forEach((f,i)=>{ const a=v.osc('sawtooth',f,t0,-dt+(R()-.5)*3), b=v.osc(w,f,t0,dt+(R()-.5)*3), bg=v.gain(.55); d1.connect(a.detune); d2.connect(b.detune);
    let tail=v.gain(1); a.connect(tail); b.connect(bg); bg.connect(tail);
    if(c.createStereoPanner&&ch.length>1){ const p=c.createStereoPanner(); p.pan.value=(i/(ch.length-1)-.5)*.6; v.n(p); tail.connect(p); tail=p; } tail.connect(sum); });
  sum.connect(lp); lp.connect(hp); hp.connect(amp); amp.connect(v.out);
  const cut=o.cutoff||1050; lp.frequency.setValueAtTime(cut*.4,t0); lp.frequency.linearRampToValueAtTime(cut,t0+att*1.4); fl.connect(lp.frequency);
  const end=v.ar(amp.gain,t0,g,att,Math.max(0,d-att),rel); v.params.cutoff=[lp.frequency]; return end; };

/* REYES · ober: one Oberheim-style voice, the lead. Saw and pulse a few cents apart, soft drive, a 12 dB low-pass with its own envelope,
   portamento, a vibrato that arrives late, a slow tape wow, and the echo pedal. Steady and sequenced; the warmth is in the tone, not in rubato. */
INS.ober=(v,o,t0,g)=>{ const f=freqOf(o,'D4'), d=o.dur??.8, c=v.c, w=WAVES.pulse(c,o.pw??.36), dt=o.detune??4;
  const fq=v.cst(o.from||f,t0); if(o.from){ fq.offset.setValueAtTime(o.from,t0); fq.offset.setTargetAtTime(f,t0,(o.glide??70)/3000); }
  const a=v.osc('sawtooth',0,t0,-dt), b=v.osc(w,0,t0,dt); fq.connect(a.frequency); fq.connect(b.frequency);
  const bg=v.gain(.7), mix=v.gain(.5), sh=v.shaper('oberdrive',x=>Math.tanh(1.4*x)/Math.tanh(1.4)), lp=v.filt('lowpass',800,o.q??1.1), hp=v.filt('highpass',120,.5), amp=v.gain(0);
  a.connect(mix); b.connect(bg); bg.connect(mix); mix.connect(sh); sh.connect(lp); lp.connect(hp); hp.connect(amp); amp.connect(v.out);
  const cut=o.cutoff||1400; lp.frequency.setValueAtTime(cut*Math.pow(2,o.env??1.2),t0); lp.frequency.setTargetAtTime(cut,t0+.01,o.decay??.16);
  const vib=v.lfo(o.rate||5.1,0,t0), vd=o.vdelay??.3; vib.connect(a.detune); vib.connect(b.detune);
  if(d>vd){ vib.gain.setValueAtTime(0,t0+vd); vib.gain.linearRampToValueAtTime(o.vibrato??14,t0+vd+Math.min(.9,d-vd)); }
  const wo=v.lfo(.29+v.e.rnd()*.15,o.wow??3,t0); wo.connect(a.detune); wo.connect(b.detune);
  const at=Math.max(.006,o.attack??.03), sus=o.sustain??.74, tau=.28, r=o.release??.34, p=amp.gain, te=t0+Math.max(d,at+.01);
  p.setValueAtTime(0,t0); p.linearRampToValueAtTime(g,t0+at); p.setTargetAtTime(g*sus,t0+at,tau); p.setValueAtTime(g*(sus+(1-sus)*Math.exp(-(te-t0-at)/tau)),te); p.linearRampToValueAtTime(0,te+r);
  v.params.freq=(val,t,tt)=>{ fq.offset.cancelScheduledValues(t); fq.offset.setTargetAtTime(val,t,tt); }; v.params.cutoff=[lp.frequency]; v.params.vibrato=[vib.gain]; return te+r; };
/* REYES · pluck: the same two oscillators with a short envelope, played as a chord; the oom-pah-pah of a sequenced waltz */
INS.pluck=(v,o,t0,g)=>{ const c=v.c, ch=(o.chord||[o.freq||o.note||'D3']).map(n=>typeof n==='number'?n:hz(n)), w=WAVES.pulse(c,.4), d=o.dur??.24;
  const sum=v.gain(1/Math.sqrt(ch.length)*.62), lp=v.filt('lowpass',600,o.q??.8), hp=v.filt('highpass',o.hp??70,.5), amp=v.gain(0);
  ch.forEach((f,i)=>{ const a=v.osc('sawtooth',f,t0,-3-i), b=v.osc(w,f,t0,3+i), bg=v.gain(.6); a.connect(sum); b.connect(bg); bg.connect(sum); });
  sum.connect(lp); lp.connect(hp); hp.connect(amp); amp.connect(v.out);
  const cut=o.cutoff||850; lp.frequency.setValueAtTime(cut*Math.pow(2,o.env??1.5),t0); lp.frequency.setTargetAtTime(cut*.55,t0+.005,o.decay??.06);
  const p=amp.gain, a=.006, tau=o.tau??Math.max(.03,d*.42), te=t0+a+d; p.setValueAtTime(0,t0); p.linearRampToValueAtTime(g,t0+a); p.setTargetAtTime(0,t0+a,tau); p.setValueAtTime(g*Math.exp(-d/tau),te); p.linearRampToValueAtTime(0,te+.03); return te+.03; };

/* mallet: an FM vibraphone/marimba. Bright strike that mellows fast; optional motor tremolo; chords allowed. For watery arpeggios and comping. */
INS.mallet=(v,o,t0,g)=>{ const c=v.c, ch=(o.chord||[o.freq||o.note||'D5']).map(n=>typeof n==='number'?n:hz(n)), d=o.dur??1.4, ratio=o.ratio??4, I=(o.bright??1)*1.6;
  const sum=v.gain(1/Math.sqrt(ch.length)), lp=v.filt('lowpass',o.cutoff||5200,.4), amp=v.gain(1); sum.connect(lp); lp.connect(amp); amp.connect(v.out);
  if(o.trem){ const tr=v.lfo(o.trem,.32,t0); const tg=v.gain(.68); tr.connect(tg.gain); lp.disconnect(); lp.connect(tg); tg.connect(amp); }
  let end=t0; ch.forEach(f=>{ const car=v.osc('sine',f,t0), mod=v.osc('sine',f*ratio,t0), mi=v.gain(0), ag=v.gain(0); mod.connect(mi); mi.connect(car.frequency); car.connect(ag); ag.connect(sum);
    mi.gain.setValueAtTime(I*f*ratio*.35,t0); mi.gain.setTargetAtTime(0,t0,.018); end=Math.max(end,v.perc(ag.gain,t0,g,d/5)); });
  return end; };
/* vox: a wordless chant. Two saws per note through three vowel formants that morph from o.vowel to o.to (a, o, u, e); slow swell, late vibrato. */
const VOW={a:[[730,1,7],[1150,.5,8],[2650,.22,10]],o:[[480,1,7],[830,.45,8],[2800,.15,10]],u:[[330,1,7],[700,.3,8],[2700,.1,10]],e:[[480,1,7],[1800,.45,9],[2600,.25,10]]};
INS.vox=(v,o,t0,g)=>{ const c=v.c, ch=(o.chord||[o.freq||o.note||'D4']).map(n=>typeof n==='number'?n:hz(n)), d=o.dur??2, A=VOW[o.vowel||'a'], B=VOW[o.to||o.vowel||'a'];
  const src=v.gain(1/Math.sqrt(ch.length)*.5), amp=v.gain(0), vib=v.lfo(o.rate||5.2,0,t0);
  ch.forEach((f,i)=>{ for(const dt of [-7,6]){ const x=v.osc('sawtooth',f,t0,dt+(i%2?2:-2)); vib.connect(x.detune); x.connect(src); } });
  vib.gain.setValueAtTime(0,t0); vib.gain.linearRampToValueAtTime(o.vibrato??11,t0+Math.min(1.2,d*.6));
  A.forEach(([f,gg,q],k)=>{ const bp=v.filt('bandpass',f,q), bg=v.gain(gg*2.2); src.connect(bp); bp.connect(bg); bg.connect(amp); bp.frequency.setValueAtTime(f,t0); bp.frequency.linearRampToValueAtTime(B[k][0],t0+d); });
  amp.connect(v.out); return v.ar(amp.gain,t0,g,o.attack??.35,Math.max(0,d-(o.attack??.35)),o.release??.6); };

/* ── rhythm box (YMO lineage): 808-style analog voices, all softened ── */
INS.kick=(v,o,t0,g)=>{ const f=o.freq||(o.note!=null?hz(o.note):48), dec=o.decay??.42, c=v.c;
  const s=v.osc('sine',f*3.2,t0), sh=v.shaper('kick',x=>Math.tanh(1.3*x)/Math.tanh(1.3)), amp=v.gain(0); s.frequency.setValueAtTime(f*3.2,t0); s.frequency.exponentialRampToValueAtTime(f,t0+.07);
  s.connect(amp); amp.connect(sh); sh.connect(v.out); const end=v.perc(amp.gain,t0,g,dec/5);
  const n=v.noise('white',t0), nl=v.filt('lowpass',2400,.7), ng=v.gain(0); n.connect(nl); nl.connect(ng); ng.connect(v.out); v.perc(ng.gain,t0,g*.12,.004); return end; };
INS.rim=(v,o,t0,g)=>{ const k=o.tune||1; const a=v.osc('triangle',455*k,t0), b=v.osc('sine',1680*k,t0), hp=v.filt('highpass',380,.7), amp=v.gain(0), bg=v.gain(.6);
  a.connect(hp); b.connect(bg); bg.connect(hp); hp.connect(amp); amp.connect(v.out); const end=v.perc(amp.gain,t0,g,.011);
  const n=v.noise('white',t0), nh=v.filt('highpass',2200,.7), ng=v.gain(0); n.connect(nh); nh.connect(ng); ng.connect(v.out); v.perc(ng.gain,t0,g*.35,.005); return end; };
INS.clave=(v,o,t0,g)=>{ const f=o.freq||(o.note!=null?hz(o.note):2480); const a=v.osc('triangle',f,t0), bp=v.filt('bandpass',f,3), amp=v.gain(0);
  a.connect(bp); bp.connect(amp); amp.connect(v.out); return v.perc(amp.gain,t0,g*1.8,o.decay??.024); };
INS.hat=(v,o,t0,g)=>{ const src=v.noise('metal',t0,o.tune||1), sum=v.gain(4.4); src.connect(sum);
  const bp=v.filt('bandpass',10000,1.1), hp=v.filt('highpass',7200,.7), amp=v.gain(0); sum.connect(bp); bp.connect(hp); hp.connect(amp); amp.connect(v.out);
  return v.perc(amp.gain,t0,g,o.open?.11:(o.decay??.026)); };
INS.snap=(v,o,t0,g)=>{ const n=v.noise('white',t0), bp=v.filt('bandpass',o.freq||1950,2.2), amp=v.gain(0); n.connect(bp); bp.connect(amp); amp.connect(v.out);
  const end=v.perc(amp.gain,t0,g*1.6,.017); const s=v.osc('sine',1240,t0), sg=v.gain(0); s.connect(sg); sg.connect(v.out); v.perc(sg.gain,t0,g*.25,.009); return end; };

/* ── foley primitives: noise burst, pitched ping, pitch-drop thud ── */
function burst(v,t,type,f,q,tau,gain){ const n=v.noise('white',t), b=v.filt(type,f,q), a=v.gain(0); n.connect(b); b.connect(a); a.connect(v.out); return v.perc(a.gain,t,gain,tau); }
function ping(v,t,f,tau,gain,type){ const s=v.osc(type||'sine',f,t), a=v.gain(0); s.connect(a); a.connect(v.out); return v.perc(a.gain,t,gain,tau); }
function thud(v,t,f0,f1,tau,gain){ const s=v.osc('sine',f0,t), a=v.gain(0); s.frequency.setValueAtTime(f0,t); s.frequency.exponentialRampToValueAtTime(f1,t+tau*1.5); s.connect(a); a.connect(v.out); return v.perc(a.gain,t,gain,tau); }
const mx=(...a)=>Math.max(...a);

/* ── found objects (YMO's Technodelic method, applied to the library's analog things) ── */
INS.tick=(v,o,t0,g)=>{ const k=o.tock?.66:1; return mx(ping(v,t0,3150*k,.006,g*.55), burst(v,t0,'bandpass',5200*k,2,.003,g*1.1)); };
INS.click=(v,o,t0,g)=>mx(burst(v,t0,'bandpass',2500,1.4,.0026,g*1.4), ping(v,t0,1850,.004,g*.35));
INS.tap=(v,o,t0,g)=>mx(thud(v,t0,240,150,.028,g), burst(v,t0,'bandpass',950,1,.007,g*.7));
INS.flap=(v,o,t0,g)=>{ const t1=t0+.011; return mx(burst(v,t0,'bandpass',2700,3,.004,g*1.2), ping(v,t0,1420,.012,g*.32,'triangle'), thud(v,t0,190,140,.016,g*.4), burst(v,t1,'bandpass',2200,3,.0035,g*.55), ping(v,t1,1180,.01,g*.18,'triangle')); };
INS.paper=(v,o,t0,g)=>{ const d=o.dur??.36, n=v.noise('white',t0), hp=v.filt('highpass',900,.6), bp=v.filt('bandpass',o.freq||3400,.55), am=v.gain(.28), cr=v.noise('crackle',t0,1.6), amp=v.gain(0);
  n.connect(hp); hp.connect(bp); bp.connect(am); cr.connect(am.gain); am.connect(amp); amp.connect(v.out); return v.ar(amp.gain,t0,g*1.6,.03,Math.max(0,d-.12),.09); };
INS.shutter=(v,o,t0,g)=>{ const t1=t0+(o.speed??.045); return mx(burst(v,t0,'bandpass',3100,2,.003,g*1.2), ping(v,t0,4200,.01,g*.25), ping(v,t0+.004,3300,.03,g*.12,'triangle'), burst(v,t1,'bandpass',1950,2,.0035,g*.9), thud(v,t1,260,180,.012,g*.35)); };
INS.needle=(v,o,t0,g)=>{ const h=v.noise('white',t0), hb=v.filt('bandpass',6200,.7), hg=v.gain(0); h.connect(hb); hb.connect(hg); hg.connect(v.out); const e=v.perc(hg.gain,t0+.006,g*.14,.09);
  return mx(e, thud(v,t0,95,62,.04,g*.9), burst(v,t0,'highpass',4200,.7,.002,g*.6)); };
INS.scratch=(v,o,t0,g)=>{ const d=o.dur??.5, n=v.noise('white',t0), b1=v.filt('bandpass',1800,2.5), b2=v.filt('bandpass',4300,1.6), am=v.gain(.4), cr=v.noise('crackle',t0,.9), amp=v.gain(0), R=srng(Math.round(t0*1000)+3);
  n.connect(b1); n.connect(b2); b1.connect(am); b2.connect(am); cr.connect(am.gain); am.connect(amp); amp.connect(v.out);
  const pts=new Float32Array(24); for(let i=0;i<24;i++) pts[i]=1500+R()*900; b1.frequency.setValueCurveAtTime(pts,t0,d);
  return v.ar(amp.gain,t0,g*1.3,.02,Math.max(0,d-.08),.06); };
INS.knot=(v,o,t0,g)=>{ const d=o.dur??.34, s=v.osc('sawtooth',34,t0), b1=v.filt('bandpass',720,4), b2=v.filt('bandpass',1550,5), amp=v.gain(0);
  s.frequency.setValueAtTime(30,t0); s.frequency.linearRampToValueAtTime(54,t0+d); s.connect(b1); s.connect(b2); b1.connect(amp); b2.connect(amp); amp.connect(v.out);
  const e=v.ar(amp.gain,t0,g*2.2,.04,Math.max(0,d-.12),.08); return mx(e, thud(v,t0+d-.02,170,120,.02,g*.5)); };
INS.stamp=(v,o,t0,g)=>mx(thud(v,t0,78,50,.06,g), burst(v,t0,'lowpass',1300,.7,.02,g*.42), ping(v,t0,410,.03,g*.16,'triangle'));
INS.emboss=(v,o,t0,g)=>mx(thud(v,t0,150,110,.012,g*.6), ping(v,t0,o.freq||1100,.015,g*.35,'triangle'), burst(v,t0,'bandpass',3000,2,.003,g*.5));
INS.roller=(v,o,t0,g)=>{ const d=o.dur??1.2, n=v.noise('brown',t0), lp=v.filt('lowpass',420,.7), am=v.gain(.65), lo=v.osc('triangle',o.rate??3.2,t0), lf=v.gain(.32), sq=v.noise('white',t0), sb=v.filt('bandpass',1400,7), sg=v.gain(.05), amp=v.gain(0);
  n.connect(lp); lp.connect(am); lf.connect(am.gain); sq.connect(sb); sb.connect(sg); sg.connect(am); am.connect(amp); amp.connect(v.out);
  lo.connect(lf); v.params.rate=[lo.frequency]; v.params.level=[am.gain]; const end=v.ar(amp.gain,t0,g*2.2,.08,Math.max(0,d-.2),.15); return end; };
INS.drop=(v,o,t0,g)=>{ const f=o.freq||(o.note!=null?hz(o.note):720), s=v.osc('sine',f,t0), a=v.gain(0); s.frequency.setValueAtTime(f,t0); s.frequency.setTargetAtTime(f*2.1,t0,.012);
  s.connect(a); a.connect(v.out); return v.perc(a.gain,t0,g,.042); };

/* ── beds and system sounds (Mir's own: tuning, two voices, breath) ── */
/* drone: two voices, the person (reference) and Mir (ratio, detune in cents). Detuned, the shared partials beat; at 0 cents they lock. */
INS.drone=(v,o,t0,g)=>{ const c=v.c, f=freqOf(o,'D3'), ratio=o.ratio??3/2, w=WAVES.drone(c);
  const a=v.osc(w,f,t0), b=v.osc(w,f*ratio,t0,o.detune||0), bg=v.gain(.78), lp=v.filt('lowpass',o.cutoff||1900,.5), lvl=v.gain(0), br=v.gain(1), amp=v.gain(g);
  a.connect(lp); b.connect(bg); bg.connect(lp); lp.connect(br); br.connect(lvl); lvl.connect(amp); amp.connect(v.out);
  const lf=v.lfo(o.breath??.09,.1,t0); lf.connect(br.gain);
  const L=o.level??.6; lvl.gain.setValueAtTime(0,t0); lvl.gain.linearRampToValueAtTime(L,t0+(o.fade??1.2));
  v.params.pitch=glider([[a.frequency,1],[b.frequency,ratio]]); v.params.detune=[b.detune]; v.params.level=[lvl.gain]; v.params.cutoff=[lp.frequency];
  v.params.ratio=(val,t,tau)=>{ const cur=a.frequency.value||f; b.frequency.cancelScheduledValues(t); b.frequency.setTargetAtTime(cur*val,t,tau); };
  if(o.dur){ const e=t0+(o.fade??1.2)+o.dur; lvl.gain.setValueAtTime(L,e); lvl.gain.linearRampToValueAtTime(0,e+1); return e+1; } return Infinity; };
/* noise: a textured bed. color 0 = room rumble, .5 = soot hiss, 1 = dust crackle */
INS.noise=(v,o,t0,g)=>{ const col=clamp(o.color??.4,0,1);
  const w=v.noise('white',t0), wl=v.filt('lowpass',400+col*col*7000,.5), wg=v.gain(.32+.3*col);
  const b=v.noise('brown',t0), bg=v.gain((1-col)*1.1);
  const k=v.noise('crackle',t0), kh=v.filt('highpass',1400,.6), kg=v.gain(Math.pow(col,1.4)*.9);
  const lvl=v.gain(0), amp=v.gain(g); w.connect(wl); wl.connect(wg); b.connect(bg); k.connect(kh); kh.connect(kg);
  for(const x of [wg,bg,kg]) x.connect(lvl); lvl.connect(amp); amp.connect(v.out);
  const L=o.level??.6; lvl.gain.setValueAtTime(0,t0); lvl.gain.linearRampToValueAtTime(L,t0+(o.fade??.8));
  v.params.level=[lvl.gain];
  v.params.color=(val,t,tau)=>{ val=clamp(val,0,1); const P=[[wl.frequency,400+val*val*7000],[wg.gain,.32+.3*val],[bg.gain,(1-val)*1.1],[kg.gain,Math.pow(val,1.4)*.9]]; for(const [p,x] of P){ p.cancelScheduledValues(t); p.setTargetAtTime(x,t,tau); } };
  if(o.dur){ const e=t0+(o.fade??.8)+o.dur; lvl.gain.setValueAtTime(L,e); lvl.gain.linearRampToValueAtTime(0,e+.6); return e+.6; } return Infinity; };
/* meet: the accent. Two pure voices start apart, glide together, and beat slower until they lock; a glass partial blooms at the lock. */
INS.meet=(v,o,t0,g)=>{ const c=v.c, f=freqOf(o,'A4'), ratio=o.ratio??1, sp=o.spread??38, d=o.dur??1.8, tl=d*.62, w=WAVES.drone(c);
  const a=v.osc(w,f*cents(-sp/2),t0), b=v.osc(w,f*ratio*cents(sp/2),t0), ag=v.gain(0), bg=v.gain(0);
  a.frequency.setValueAtTime(f*cents(-sp/2),t0); a.frequency.setTargetAtTime(f,t0+.05,tl/4); b.frequency.setValueAtTime(f*ratio*cents(sp/2),t0); b.frequency.setTargetAtTime(f*ratio,t0+.05,tl/4);
  a.connect(ag); b.connect(bg); ag.connect(v.out); bg.connect(v.out); v.ar(ag.gain,t0,g*.75,.12,d-.5,.38); const e=v.ar(bg.gain,t0,g*.6,.18,d-.56,.38);
  const tb=t0+tl, car=v.osc('sine',f*2,tb), mod=v.osc('sine',f*2*2,tb), mi=v.gain(0), ba=v.gain(0); mod.connect(mi); mi.connect(car.frequency); car.connect(ba); ba.connect(v.out);
  mi.gain.setValueAtTime(f*1.2,tb); mi.gain.setTargetAtTime(f*.05,tb,.18); const e2=v.perc(ba.gain,tb,g*.42,.32); return mx(e,e2); };
/* breath: one exhale of air through two soft formants (RESPIRATION: one bar per exchange) */
INS.breath=(v,o,t0,g)=>{ const d=o.dur??1.6, n=v.noise('white',t0), b1=v.filt('bandpass',o.freq||720,1.1), b2=v.filt('bandpass',(o.freq||720)*2.4,1.6), b2g=v.gain(.45), lp=v.filt('lowpass',2600,.5), amp=v.gain(0);
  n.connect(b1); n.connect(b2); b1.connect(lp); b2.connect(b2g); b2g.connect(lp); lp.connect(amp); amp.connect(v.out);
  lp.frequency.setValueAtTime(1400,t0); lp.frequency.linearRampToValueAtTime(3000,t0+d*.4); lp.frequency.linearRampToValueAtTime(1100,t0+d);
  const p=amp.gain, a=d*.38; p.setValueAtTime(0,t0); p.linearRampToValueAtTime(g*.35,t0+a*.5); p.linearRampToValueAtTime(g,t0+a); p.linearRampToValueAtTime(g*.4,t0+d*.75); p.linearRampToValueAtTime(0,t0+d); return t0+d; };

const NAMES=Object.keys(INS);

/* ── Engine: master chain over any BaseAudioContext ── */
class Engine{
  constructor(ctx,state){ this.ctx=ctx; this.state=state||new Map(); this.buses=new Map(); this.voices=new Set(); this.seqs=new Set(); this.rnd=srng(4242); this.tickers=new Set(); this.offline=!!(OAC&&ctx instanceof OAC);
    const c=ctx; this.sum=c.createGain();
    /* reverb: per-voice sends → high-pass → generated plate IR → return into the glue stage */
    this.verbIn=c.createGain(); const vh=c.createBiquadFilter(); vh.type='highpass'; vh.frequency.value=190; vh.Q.value=.5;
    this.verb=c.createConvolver(); this.verb.normalize=false; this.verb.buffer=makeIR(c,1.25,1.5); this.verbRet=c.createGain(); this.verbRet.gain.value=.5;
    this.verbIn.connect(vh); vh.connect(this.verb); this.verb.connect(this.verbRet); this.verbRet.connect(this.sum);
    /* glue compressor → subtle tanh saturation → DC block → master (enable × volume) → limiter → ceiling at −1 dBFS */
    this.glue=c.createDynamicsCompressor(); const G1=this.glue; G1.threshold.value=-20; G1.knee.value=10; G1.ratio.value=2.2; G1.attack.value=.02; G1.release.value=.25;
    this.sat=c.createWaveShaper(); this.sat.curve=curve(c,'sat',x=>Math.tanh(1.25*x)/1.25); this.sat.oversample='none';
    this.dc=c.createBiquadFilter(); this.dc.type='highpass'; this.dc.frequency.value=18; this.dc.Q.value=.5;
    this.master=c.createGain(); this.master.gain.value=0;
    this.lim=c.createDynamicsCompressor(); const L=this.lim; L.threshold.value=-4; L.knee.value=0; L.ratio.value=20; L.attack.value=.001; L.release.value=.12;
    this.ceil=c.createWaveShaper(); this.ceil.curve=curve(c,'ceil',x=>{ const k=.79, cap=.885, a=Math.abs(x); const y=a<=k?a:k+(cap-k)*Math.tanh((a-k)/(cap-k)); return Math.sign(x)*y; }); this.ceil.oversample='none';
    this.sum.connect(this.glue); this.glue.connect(this.sat); this.sat.connect(this.dc); this.dc.connect(this.master); this.master.connect(this.lim); this.lim.connect(this.ceil); this.ceil.connect(c.destination);
    if(!this.offline){ this.an=c.createAnalyser(); this.an.fftSize=2048; this.ceil.connect(this.an); this.abuf=new Float32Array(this.an.fftSize); } }
  busNodes(id){ let b=this.buses.get(id); if(b) return b; const c=this.ctx, st=this.state.get(id)||{level:1,duck:1};
    b={id, dry:c.createGain(), wet:c.createGain(), lv:c.createGain(), dk:c.createGain(), wlv:c.createGain(), wdk:c.createGain(), voices:new Set(), seqs:new Set()};
    b.lv.gain.value=b.wlv.gain.value=st.level; b.dk.gain.value=b.wdk.gain.value=st.duck;
    b.dry.connect(b.lv); b.lv.connect(b.dk); b.dk.connect(this.sum); b.wet.connect(b.wlv); b.wlv.connect(b.wdk); b.wdk.connect(this.verbIn); this.buses.set(id,b); return b; }
  ramp(params,v,ms){ const t=this.ctx.currentTime, tau=Math.max(5,ms)/3000; for(const p of params){ p.cancelScheduledValues(t); p.setValueAtTime(p.value,t); p.setTargetAtTime(v,t,tau); } }
  busGain(id,v,ms){ const b=this.busNodes(id); this.ramp([b.lv.gain,b.wlv.gain],v,ms); }
  busDuck(id,v,ms){ const b=this.busNodes(id); this.ramp([b.dk.gain,b.wdk.gain],v,ms); }
  busStop(id,ms){ const b=this.buses.get(id); if(!b) return; for(const s of [...b.seqs]) s.stop(); for(const v of [...b.voices]) v.stop(null,(ms||80)/1000);
    if(b.ech){ const t=this.ctx.currentTime, p=b.ech.ret.gain; p.cancelScheduledValues(t); p.setValueAtTime(p.value,t); p.linearRampToValueAtTime(0,t+.12); p.setValueAtTime(0,t+1.4); p.linearRampToValueAtTime(1,t+1.45); } }
  /* tape echo per bus (lazy): one delay with filtered feedback; its time wobbles (wow and flutter), so repeats bend in pitch like tape.
     The return goes into the bus's own dry path, so visibility, ducking and stop apply to the echoes too. */
  echo(b,time){ const c=this.ctx; if(!b.ech){ const inp=c.createGain(), dl=c.createDelay(1.5), fb=c.createGain(), lp=c.createBiquadFilter(), hp=c.createBiquadFilter(), ret=c.createGain();
      dl.delayTime.value=time||.36; fb.gain.value=.34; lp.type='lowpass'; lp.frequency.value=2300; lp.Q.value=.4; hp.type='highpass'; hp.frequency.value=260; hp.Q.value=.5;
      inp.connect(dl); dl.connect(lp); lp.connect(hp); hp.connect(fb); fb.connect(dl); hp.connect(ret); ret.connect(b.dry);
      const w=c.createOscillator(), wg=c.createGain(), f=c.createOscillator(), fg=c.createGain(); w.frequency.value=.52; wg.gain.value=.0014; f.frequency.value=6.4; fg.gain.value=.00016;
      w.connect(wg); wg.connect(dl.delayTime); f.connect(fg); fg.connect(dl.delayTime); w.start(); f.start(); b.ech={inp,dl,ret}; }
    else if(time&&Math.abs(b.ech.dl.delayTime.value-time)>.001) b.ech.dl.delayTime.setTargetAtTime(time,c.currentTime,.05);
    return b.ech.inp; }
  busActive(id){ const b=this.buses.get(id); return b?b.voices.size+b.seqs.size:0; }
  /* polyphony: 24 per bus, 48 in all; the oldest one-shot is released first. Beds are never stolen. */
  steal(b){ const now=this.ctx.currentTime;
    /* only voices that have already started can be stolen; a voice scheduled for the future is never cut */
    const pick=set=>{ let o=null; for(const v of set) if(!SUSTAINED[v.name]&&v.alive&&v.t0<=now&&(!o||v.t0<o.t0)) o=v; return o; };
    if(b.voices.size>=24){ const v=pick(b.voices); if(v){ v.stop(null,.02); b.voices.delete(v); } }
    if(this.voices.size>=48){ const v=pick(this.voices); if(v){ v.stop(null,.02); this.voices.delete(v); v.bus.voices.delete(v); } } }
  play(busId,name,o){ o=o||{}; const fn=INS[name]; if(!fn) throw new Error('M.audio: unknown instrument '+name); const c=this.ctx, b=this.busNodes(busId);
    this.steal(b); const t0=Math.max(c.currentTime+.005,o.when||0), v=new Voice(this,b,name,t0,o);
    const g=dbg(LV[name]||-16)*(o.gain!=null?o.gain:1)*((name==='drone'||name==='noise')?1:velg(o.vel));
    let end; try{ end=fn(v,o,t0,g); }catch(err){ v.cleanup(); throw err; }
    b.voices.add(v); this.voices.add(v); if(isFinite(end)) v.finish(end+.02);
    return {stop:(when,rel)=>v.stop(when,rel==null?(SUSTAINED[name]?.9:.06):rel), set:(p,val,ms,when)=>v.set(p,val,ms,when), get alive(){ return v.alive; }, end, name}; }
  /* look-ahead step scheduler: 25 ms tick, 100 ms horizon. Odd steps are pushed late by swing × step length. Offline renders tick the same scheduler from suspend() points. */
  seq(busId,o){ const c=this.ctx, b=this.busNodes(busId); let bpm=o.bpm||100, steps=o.steps||16, sub=o.sub||4, swing=o.swing||0, step=0, n=0, stopped=false, timer=null;
    let next=o.when!=null?o.when:c.currentTime+.06; const len=()=>60/bpm/sub, total=o.bars?o.bars*steps:Infinity;
    let tick=null; const h={stop:()=>{ stopped=true; if(timer) clearInterval(timer); this.tickers.delete(tick); b.seqs.delete(h); this.seqs.delete(h); }, setBpm:x=>{ bpm=clamp(+x||bpm,20,300); }, get step(){ return step; }};
    const fire=()=>{ const sw=step%2===1?swing*len():0; try{ o.pattern(step,next+sw,n); }catch(err){ console.error(err); } next+=len(); step=(step+1)%steps; n++; if(n>=total) h.stop(); };
    tick=()=>{ if(stopped) return; const now=c.currentTime; if(next<now-.25) next=now+.02; while(!stopped&&next<now+.1) fire(); };
    b.seqs.add(h); this.seqs.add(h); tick(); if(this.offline) this.tickers.add(tick); else timer=setInterval(tick,25); return h; }
  /* score: a list of events {t, play, opts, id} | {t, set:id, param, value, ms} | {t, stop:id, rel}. Scheduled with the same look-ahead. */
  score(busId,events,o){ o=o||{}; const c=this.ctx, b=this.busNodes(busId), ev=events.slice().sort((x,y)=>x.t-y.t), t0=o.when!=null?o.when:c.currentTime+.08, ids={}, all=[]; let i=0, stopped=false, timer=null, tick=null;
    const dur=ev.reduce((m,e)=>Math.max(m,e.t+((e.opts&&e.opts.dur)||0)),0);
    const h={stop:(rel)=>{ stopped=true; if(timer) clearInterval(timer); this.tickers.delete(tick); b.seqs.delete(h); this.seqs.delete(h); for(const x of all) x.stop(null,rel==null?.25:rel); }, dur, t0};
    const run=e=>{ const when=t0+e.t; if(e.play){ const hd=this.play(busId,e.play,Object.assign({},e.opts,{when})); all.push(hd); if(all.length>64) all.splice(0,all.length-64); if(e.id) ids[e.id]=hd; }
      else if(e.set&&ids[e.set]) ids[e.set].set(e.param,e.value,e.ms,when); else if(e.stop&&ids[e.stop]) ids[e.stop].stop(when,e.rel); };
    tick=()=>{ if(stopped) return; const now=c.currentTime; while(i<ev.length&&t0+ev[i].t<now+.15){ try{ run(ev[i]); }catch(err){ console.error(err); } i++; }
      if(i>=ev.length){ clearInterval(timer); this.tickers.delete(tick); if(!this.offline) setTimeout(()=>{ b.seqs.delete(h); this.seqs.delete(h); },(t0+dur-now+1.5)*1000); } };
    b.seqs.add(h); this.seqs.add(h); tick(); if(this.offline) this.tickers.add(tick); else timer=setInterval(tick,25); return h; }
}

/* ── M.audio: the live, lazily created engine, plus offline rendering for tests and export ── */
let eng=null, ctx=null, enabled=false, unlocked=false, volume=.7, susTimer=null;
const state=new Map(), facades=new Map();
const INERT={stop(){},set(){},alive:false,end:0,name:'inert'};
const INERT_SEQ={stop(){},setBpm(){},step:0,dur:0};
function applyMaster(ms){ if(!eng) return; eng.ramp([eng.master.gain],enabled?volume:0,ms); }
function bus(id){ id=String(id||'main'); if(facades.has(id)) return facades.get(id); if(!state.has(id)) state.set(id,{level:1,duck:1});
  const st=state.get(id), f={id,
    gain(v,ms){ st.level=clamp(+v||0,0,2); if(eng) eng.busGain(id,st.level,ms==null?60:ms); return f; },
    duck(v,ms){ st.duck=clamp(v==null?1:+v,0,1); if(eng) eng.busDuck(id,st.duck,ms==null?200:ms); return f; },
    stopAll(ms){ if(eng) eng.busStop(id,ms); return f; },
    active(){ return eng?eng.busActive(id):0; }};
  facades.set(id,f); return f; }
const live=()=>eng&&enabled&&unlocked&&ctx.state!=='closed';

const A={
  get supported(){ return !!AC; }, get enabled(){ return enabled; }, get unlocked(){ return unlocked; }, get volume(){ return volume; },
  get context(){ return ctx; },
  unlock(){ if(!AC) return Promise.resolve(false);
    if(!ctx){ ctx=new AC({latencyHint:'interactive'}); eng=new Engine(ctx,state); applyMaster(5); }
    const p=ctx.state==='running'?Promise.resolve():ctx.resume();
    return Promise.resolve(p).then(()=>{ unlocked=ctx.state==='running'; return unlocked; },()=>false); },
  setEnabled(on){ enabled=!!on; if(susTimer){ clearTimeout(susTimer); susTimer=null; }
    if(!eng) return; if(enabled){ ctx.resume&&ctx.resume().then(()=>{ unlocked=ctx.state==='running'; },()=>{}); applyMaster(120); }
    else { applyMaster(120); /* after the fade, suspend the context so an idle page costs nothing */ susTimer=setTimeout(()=>{ if(!enabled&&ctx.state==='running') ctx.suspend(); },400); } },
  setVolume(v){ volume=clamp(+v,0,1); applyMaster(60); },
  now(){ return unlocked&&ctx?ctx.currentTime:0; },
  meter(){ if(!eng||!eng.an) return {rms:0,peak:0}; eng.an.getFloatTimeDomainData(eng.abuf); let s=0,p=0; for(const x of eng.abuf){ s+=x*x; const a=Math.abs(x); if(a>p) p=a; } return {rms:Math.sqrt(s/eng.abuf.length),peak:p}; },
  bus,
  play(busId,name,o){ if(!live()) return INERT; bus(busId); return eng.play(String(busId),name,o); },
  seq(busId,o){ if(!eng) return INERT_SEQ; bus(busId); return eng.seq(String(busId),o); },
  score(busId,events,o){ if(!live()) return INERT_SEQ; bus(busId); return eng.score(String(busId),events,o); },
  /* scope(busId): the same API with the bus filled in, handed to pieces as `A` */
  scope(busId){ const id=String(busId); return {id, bus:()=>bus(id), play:(n,o)=>A.play(id,n,o), seq:o=>A.seq(id,o), score:(e,o)=>A.score(id,e,o), now:()=>A.now(), hz, just, scale, get enabled(){ return enabled; }}; },
  panic(){ if(eng) for(const id of eng.buses.keys()) eng.busStop(id,40); },
  hz, just, scale, tune, midi:midiOf, cents, SCALES, names:NAMES, levels:LV, sends:SEND,
  /* define(name, fn(v, o, t0, g) → end, {lv, send, chain}): a piece-shipped instrument, playable from scores live and offline. Added only if the name is absent. */
  define(name,fn,o){ o=o||{}; name=String(name); if(INS[name]||typeof fn!=='function') return false; INS[name]=fn; NAMES.push(name); LV[name]=o.lv!=null?+o.lv:-16; SEND[name]=o.send!=null?+o.send:.2; if(o.chain) DEFCHAIN[name]=o.chain; return true; },
  /* render(seconds, fn(A), {sampleRate, volume}) → Promise<AudioBuffer>. A is a scoped offline API ('listen' bus by default). */
  render(seconds,fn,o){ o=o||{}; if(!OAC) return Promise.reject(new Error('no OfflineAudioContext')); const sr=o.sampleRate||44100, oc=new OAC(2,Math.ceil(seconds*sr),sr), e=new Engine(oc,new Map());
    e.master.gain.value=o.volume!=null?o.volume:volume; const id=o.bus||'listen';
    const S={id, play:(n,op)=>e.play(id,n,op), seq:op=>e.seq(id,op), score:(ev,op)=>e.score(id,ev,Object.assign({when:.05},op)), now:()=>0, hz, just, scale, enabled:true, engine:e};
    fn(S); for(let t=.05;t<seconds-.01;t+=.05) oc.suspend(t).then(()=>{ for(const k of [...e.tickers]) k(); oc.resume(); });
    return oc.startRendering(); }
};
M.audio=A;
})(window);
