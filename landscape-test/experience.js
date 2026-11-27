/* Separate test host. Motion, local music, and index navigation have independent state. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const defaults={speed:25,'cloud-height':45,'cloud-scale':55,density:60,relief:50};
  const settings={...defaults};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let moving=!reduced.matches,request=0,last=0,lastPaint=0,sky=null,skyKey='',resizeTimer=0;
  let audioContext=null,analyser=null,frequency=null,timeData=null,fileURL=null,fileName='';
  const track=$('track');
  const signal={bass:0,mid:0,treble:0,rms:0,lift:0};
  ST.hAvg=.43;ST.sunPos={x:.76,y:.17,size:.68};ST.g.layers=10;
  ST.gran=.12;ST.epool=.12;ST.edge=.3;ST.wash=.35;ST.grain=.38;

  function makeSky(W,H) {
    // These are the actual TS-16 cloud, tone-field and dot-lattice primitives,
    // recomposed in a wide frame; the burst and threshold shimmer are omitted.
    const A=window.ART,T=window.SkyTech,pad=Math.ceil(60*RS);
    const cw=W+pad*2,u=Math.max(.6,RS),du=cw/u,dh=H/u;
    const c=A.off(cw,H),x=c.getContext('2d');
    const cloudY=dh*(.46-settings['cloud-height']*.0018);
    const scale=.55+settings['cloud-scale']*.009;
    const bank=T['scallop-bank']({banks:[
      {fill:'pale',shade:'body',from:[-120,cloudY+24],to:[du+120,cloudY+dh*.065],R:dh*.054,seed:37}
    ],R_scale:scale,R_var:.36,spacing:1.3,child:.36},u,A).banks[0];
    const shade=T['shade-field']({rim_depth:.9,rim_floor:.5,body_from:.05,body_to:1.2,wisp_u:90,stretch:3.2,contrast:.2,wisp_mix:.85,gain:settings.density*.011,seed:9},u,A);
    bank.path(x,cw,H);x.fillStyle='#f1f6f5';x.fill();
    const wash=T['grain-wash']({amount:.16,grain:1,res_div:4,seed:13},u,A);
    const washLayer=wash.layer(cw,H,'#c5d6d8',(px,py)=>shade.tone(bank,bank.depth(px,py),px,py));
    x.save();bank.path(x,cw,H);x.clip();x.drawImage(washLayer.canvas,0,0);x.restore();
    const lat=T['stipple-fill']({pitch_u:3.8,radius_u:.6,jitter:.42,swell:.35,seed:161},u,A);
    x.fillStyle='#819fa6';x.beginPath();
    lat.each(cw,H,(px,py,k)=>{const depth=bank.depth(px,py);if(depth<=0)return;const tone=shade.tone(bank,depth,px,py);if(k<tone){const r=Math.max(.55,lat.r*(.8+tone*.35));x.moveTo(px+r,py);x.arc(px,py,r,0,Math.PI*2);}});
    x.fill();
    return {canvas:c,pad};
  }
  window.paintSky=(context,W,H,journey)=>{
    const key=[W,H,settings['cloud-height'],settings['cloud-scale'],settings.density].join(':');
    if(key!==skyKey){sky=makeSky(W,H);skyKey=key;}
    context.save();context.imageSmoothingEnabled=false;
    context.drawImage(sky.canvas,Math.round(-sky.pad+Math.sin(journey*.16)*sky.pad*.7),0);
    context.restore();
  };

  function readSignal(){
    let bass=0,mid=0,treble=0,rms=0;
    if(analyser&&!track.paused&&!track.ended){
      analyser.getByteFrequencyData(frequency);analyser.getFloatTimeDomainData(timeData);
      const rate=audioContext.sampleRate/analyser.fftSize;
      const energy=(lo,hi)=>{const start=Math.max(1,Math.floor(lo/rate)),end=Math.min(frequency.length,Math.ceil(hi/rate));let v=0;for(let i=start;i<end;i++)v+=frequency[i];return v/Math.max(1,end-start)/255;};
      bass=energy(40,220)*.3;mid=energy(220,2200)*.25;treble=energy(2200,10000)*.2;
      let sum=0;for(const v of timeData)sum+=v*v;rms=Math.min(.45,Math.sqrt(sum/timeData.length));
    }
    for(const [key,value] of Object.entries({bass,mid,treble,rms,lift:rms*.4}))signal[key]+=(value-signal[key])*.075;
    return signal;
  }
  function paint(){render(moving?readSignal():{bass:0,mid:0,treble:0,rms:0,lift:0});}
  function frame(now){
    request=0;if(!moving||document.hidden)return;
    if(now-lastPaint>=1000/30){
      const dt=last?Math.min(.08,(now-last)/1000):0;last=now;lastPaint=now;
      const speed=settings.speed*.00065;
      ST.journey+=dt*speed;ST.journeyC+=dt*speed*.55;
      if(ST.fade<1)ST.fade=Math.min(1,ST.fade+dt*.7);
      paint();
    }
    request=requestAnimationFrame(frame);
  }
  function schedule(){if(moving&&!document.hidden&&!request){last=0;lastPaint=0;request=requestAnimationFrame(frame);}}
  function stop(){if(request)cancelAnimationFrame(request);request=0;last=0;}
  function motionUI(){
    $('motion-label').textContent=moving?'Pause motion':'Play motion';
    $('motion').querySelector('.motion-mark').textContent=moving?'Ⅱ':'▷';
    $('motion-status').textContent=reduced.matches&&!moving?'Reduced motion':'';
  }
  $('motion').addEventListener('click',()=>{moving=!moving;motionUI();if(moving)schedule();else stop();});
  reduced.addEventListener('change',e=>{moving=!e.matches;motionUI();stop();paint();schedule();});
  document.addEventListener('visibilitychange',()=>{stop();schedule();});
  window.addEventListener('pageshow',()=>schedule());
  window.addEventListener('pagehide',()=>{stop();track.pause();});

  function closePanels(){for(const [button,panel] of [['tune-toggle','tuning'],['sound-toggle','listening']]){$(panel).hidden=true;$(button).setAttribute('aria-expanded','false');}}
  for(const [button,panel] of [['tune-toggle','tuning'],['sound-toggle','listening']]){
    $(button).addEventListener('click',()=>{const open=$(panel).hidden;closePanels();$(panel).hidden=!open;$(button).setAttribute('aria-expanded',String(open));if(open)$(panel==='tuning'?'world':'audio-file').focus();});
  }
  document.addEventListener('click',e=>{if(!e.target.closest('.controls'))closePanels();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const active=$('tuning').hidden?($('listening').hidden?null:$('sound-toggle')):$('tune-toggle');closePanels();if(active)active.focus();}});

  let settingFrame=0;
  function settingChange(){
    ST.relief=.15+settings.relief*.008;
    if(settingFrame)cancelAnimationFrame(settingFrame);
    settingFrame=requestAnimationFrame(()=>{settingFrame=0;paint();});
  }
  for(const key of Object.keys(defaults))$(key).addEventListener('input',()=>{settings[key]=Number($(key).value);$(key+'-out').textContent=settings[key];settingChange();});
  $('world').addEventListener('change',()=>{
    ST.compP=compLabs();ST.flavor=$('world').value;ST.compT=compOf(ST.flavor);ST.fade=moving?0:1;paint();
  });
  $('reset').addEventListener('click',()=>{
    Object.assign(settings,defaults);for(const key of Object.keys(defaults)){$(key).value=defaults[key];$(key+'-out').textContent=defaults[key];}
    ST.flavor='hokkaido';$('world').value='hokkaido';ST.compP=compOf(ST.flavor);ST.compT=compOf(ST.flavor);ST.fade=1;ST.journey=ST.journeyC=0;
    settingChange();
  });

  const status=text=>{$('audio-status').textContent=text;};
  function clearTrack(){track.pause();track.removeAttribute('src');track.load();if(fileURL)URL.revokeObjectURL(fileURL);fileURL=null;fileName='';$('audio-file').value='';$('clear-audio').disabled=true;status('Your file stays on this device.');}
  $('audio-file').addEventListener('change',()=>{
    const file=$('audio-file').files[0];if(!file)return;
    track.pause();if(fileURL)URL.revokeObjectURL(fileURL);fileURL=URL.createObjectURL(file);fileName=file.name;track.src=fileURL;track.load();$('clear-audio').disabled=false;
    status(fileName+' · press Play to listen.');
  });
  $('clear-audio').addEventListener('click',clearTrack);
  track.addEventListener('play',async()=>{
    try{
      if(!audioContext){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Web Audio unavailable');audioContext=new Audio();analyser=audioContext.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=.88;const source=audioContext.createMediaElementSource(track);source.connect(analyser);analyser.connect(audioContext.destination);frequency=new Uint8Array(analyser.frequencyBinCount);timeData=new Float32Array(analyser.fftSize);}
      await audioContext.resume();
      if(audioContext.state!=='running')throw new Error('Audio is suspended');
      if(!track.paused)status((track.readyState>=3?'Playing · ':'Loading · ')+fileName);
    }catch{if(audioContext){track.pause();status('Audio could not start. Press Play to try again.');}else status('Audio playback is available; sound-reactive motion is unavailable in this browser.');}
  });
  track.addEventListener('playing',()=>{if(fileName)status('Playing · '+fileName);});
  track.addEventListener('waiting',()=>{if(fileName)status('Loading · '+fileName);});
  track.addEventListener('pause',()=>{if(fileName)status('Paused · '+fileName);});
  track.addEventListener('ended',()=>status('Finished · '+fileName));
  track.addEventListener('error',()=>{if(fileURL)status('This file could not be played. Try an MP3, M4A, or WAV.');});

  function fit(){resize();skyKey='';paint();}
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(fit,120);});
  fit();motionUI();$('controls').hidden=false;schedule();
})();
