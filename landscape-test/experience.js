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
  ST.hAvg=.43;ST.sunPos={x:.76,y:.14,size:.68};
  // Preserve Sonic's full material settings: wash, pigment, pooling and tooth.
  // Their opacity does not change the number of rendering passes.

  function makeSky(W,H) {
    // TS-16's full mark-making, recomposed above the terrain. Build once per
    // resize or sky adjustment; fixed seeds keep dots attached to the clouds.
    const A=window.ART,T=window.SkyTech,pad=Math.ceil(60*RS);
    const cw=W+pad*2,u=RS,du=cw/u,dh=H/u;
    const c=A.off(cw,H),x=c.getContext('2d');
    const shift=dh*(45-settings['cloud-height'])*.0018;
    const scale=.55+settings['cloud-scale']*.009;
    const B=T['scallop-bank']({banks:[
      {fill:'silver',shade:'body',from:[-100,dh*.30+shift],to:[du*.44,dh*.54+shift],R:dh*.074,seed:11},
      {fill:'blue',shade:'rim',from:[du+100,dh*.32+shift],to:[du*.56,dh*.55+shift],R:dh*.068,seed:23},
      {fill:'pale',shade:'body',from:[-100,dh*.45+shift],to:[du+100,dh*.44+shift],R:dh*.064,seed:37}
    ],R_scale:scale,R_var:.35,spacing:1.25,child:.55},u,A).banks;
    const V={banks:{
      silver:{fill:'#dfe9ee',dot:'#718b9c',wash:'#a8bdca'},
      blue:{fill:'#28485d',dot:'#8fb6d1',wash:'#527c99'},
      pale:{fill:'#f7faf9',dot:'#94a4a8',wash:'#c5d1d3'}
    }};
    const shade=T['shade-field']({rim_depth:.9,rim_floor:.5,body_from:.12,body_to:1.1,wisp_u:150,stretch:3.2,contrast:.2,wisp_mix:.85,gain:settings.density/60,seed:9},u,A);
    const wash=T['grain-wash']({amount:.5,grain:1,res_div:4,seed:13},u,A);
    for(const bank of B){
      const color=V.banks[bank.fill];
      bank.path(x,cw,H);x.fillStyle=color.fill;x.fill();
      const layer=wash.layer(cw,H,color.wash,(px,py)=>shade.tone(bank,bank.depth(px,py),px,py));
      x.save();bank.path(x,cw,H);x.clip();x.imageSmoothingEnabled=false;x.drawImage(layer.canvas,0,0);x.restore();
    }
    const lat=T['stipple-fill']({pitch_u:5,radius_u:1.2,jitter:.42,swell:.6,seed:161},u,A),dots=[];
    lat.each(cw,H,(px,py,k)=>{
      for(let i=B.length-1;i>=0;i--){const depth=B[i].depth(px,py);if(depth>0){dots.push(px,py,k,i,shade.tone(B[i],depth,px,py));break;}}
    });
    // Use the plate's original quantized stamps, including density-based sizes.
    window.SkyStipple(x,{B,lat,dots},V,0,1,0,0);
    const tooth=T['paper-tooth']({amp:.03,weave:.025,weave_u:3,seed:5},u,A);
    tooth.apply(x);
    const base=A.off(cw,H),bx=base.getContext('2d'),gradient=bx.createLinearGradient(0,0,0,H*.66);
    gradient.addColorStop(0,labStr(SKY_TOP));gradient.addColorStop(1,labStr(SKY_HOR));
    bx.fillStyle=gradient;bx.fillRect(0,0,cw,H);tooth.apply(bx);
    return {canvas:c,base,pad};
  }
  window.paintSky=(context,W,H,journey,sig)=>{
    const key=[W,H,settings['cloud-height'],settings['cloud-scale'],settings.density].join(':');
    if(key!==skyKey){sky=makeSky(W,H);skyKey=key;}
    context.save();context.imageSmoothingEnabled=false;
    context.drawImage(sky.base,-sky.pad,0);
    drawSun(W,H,sig);
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
