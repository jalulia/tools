/* gl.js · the ST-22 look on the GPU, for any band on any path.
   One sorted pass carries every layer far to near: the band (gel: it emits its ramp color and passes a tinted share of what lies
   behind it), the spheres, and the light helices (pure emission). Dual-source blending gives the gel its per-channel filter;
   without it the filter falls back to one gray share. Then a bloom, static scan grain, and the flat wordmark on top. */
"use strict";
const GL = (() => {
  const RAMP = [[0, .75, .19], [.25, .68, .12], [.5, .47, .17], [.72, .75, .07], [.9, .98, 0], [1.3, 1, 0], [1.55, .72, .07], [1.75, .44, .13], [2.05, .88, .055], [2.4, .58, .12], [2.75, .32, .08], [3.14, .18, .06], [3.6, .07, .04], [4.2, .04, .035], [4.71, .04, .035], [5.3, .08, .04], [5.8, .34, .1], [6.2832, .75, .19]];
  /* the ramp, baked to a 256 × 1 texture (p10's smoothstep between measured stops) */
  function rampTex() { const d = new Uint8Array(256 * 4); for (let i = 0; i < 256; i++) { const th = i / 255 * 6.2832; let k = 0; while (k < RAMP.length - 2 && RAMP[k + 1][0] <= th) k++;
      const a = RAMP[k], b = RAMP[k + 1], u = Math.min(1, Math.max(0, (th - a[0]) / (b[0] - a[0]))), t = u * u * (3 - 2 * u);
      d[i * 4] = Math.round((a[1] + (b[1] - a[1]) * t) * 255); d[i * 4 + 1] = Math.round((a[2] + (b[2] - a[2]) * t) * 255 * 2); d[i * 4 + 3] = 255; } return d; }

  const VS = `#version 300 es
layout(location=0) in vec2 aPos;    // device px
layout(location=1) in vec4 aA;      // u (-1..1 across), theta band, roundness, ink
layout(location=2) in vec4 aB;      // screen normal x,y, half-width px, kind (0 band, 1 sphere, 2 light, 3 end glow)
layout(location=3) in vec4 aC;      // kind data: sphere (sx, sy, radius px, color index) · light (r, g, b, 0)
uniform vec2 uRes;
out vec4 vA; out vec4 vB; out vec4 vC; out vec2 vP;
void main(){ vA=aA; vB=aB; vC=aC; vP=aPos; gl_Position=vec4(aPos/uRes*2.-1.,0.,1.); gl_Position.y=-gl_Position.y; }`;

  const FS = (dual) => `#version 300 es
${dual ? '#extension GL_EXT_blend_func_extended : require' : ''}
precision highp float;
in vec4 vA; in vec4 vB; in vec4 vC; in vec2 vP;
uniform sampler2D uRamp, uFace; uniform vec3 uBase, uGel, uRim, uSph[5], uMarkC; uniform float uRev, uHead, uRad, uStem[13];
uniform float uAlpha, uTint, uLamp, uStreak, uEdge, uRimGlow, uRibA, uSphA, uLight, uDpr, uLightBox; uniform vec2 uRes;
${dual ? 'layout(location=0, index=0) out vec4 oE; layout(location=0, index=1) out vec4 oK;' : 'out vec4 oE;'}
float hash(vec2 p){ p=fract(p*vec2(.1031,.1030)); p+=dot(p,p.yx+33.33); return fract((p.x+p.y)*p.x); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
void put(vec3 e, vec3 k, float cov){
${dual ? '  oE=vec4(e, cov); oK=vec4(k, 1.);' : '  float a=1.-dot(k,vec3(.3333)); oE=vec4(e, a); '}
}
void main(){
  float kind=vB.w;
  if(kind<.5){                                        // band
    float u=vA.x, hw=vB.z, ink=vA.w*uRibA;
    float c=clamp((1.-abs(u))*hw/(uEdge*uDpr),0.,1.)*ink; if(c<.002) discard;
    // normal angle: the band's own, or a tube's across its width
    float th=vA.y; vec2 ns=vB.xy;
    float tt=atan(sqrt(max(0.,1.-u*u)), -ns.y*u); if(tt<0.) tt+=6.2832;
    float a=mix(th, tt, vA.z);
    vec2 rw=texture(uRamp, vec2(a/6.2832, .5)).rg; float bf=rw.r, wm=rw.g*.5;
    float lamp=mix(1.-uLamp, 1., smoothstep(0., .7, vP.x/uRes.x));
    float dn=max(0., -cos(a)); float bl=dn*dn*dn*uRimGlow*.28;
    float st=1.+(vnoise(vec2(vP.x/(34.*uDpr), vP.y/(260.*uDpr)))-.5)*.07*uStreak;
    float sd=vC.x; lamp*=mix(1., .45+.55*(.5+.5*sd), abs(sd)*.85);
    vec3 col=(uBase*bf*lamp + wm + uRim*bl)*st;
    vec3 T=1.-uTint*(1.-uGel);
    float ac=uAlpha*c; vec3 k=(1.-ac)*(1.-c+c*T);
    if(uLightBox>.5) k*=1.-c*.42*(1.-bf);                // on a lightbox the fold is a denser filter, not a darker emission
    put(col*c*mix(1., .22, uLightBox), k, c); return;
  }
  if(kind>4.5){                                       // the wordmark as a flat plane inside the scene; revealed by a sweep or grown from the stems
    vec2 uv=vC.xy/vC.z; float m=texture(uFace, uv).a, x=uv.x*998., rv=1.;
    if(uRev>.5&&uRev<1.5) rv=1.-smoothstep(uHead-10., uHead+10., x);
    else if(uRev>1.5){ float d=1e9; for(int k=0;k<13;k++) d=min(d, abs(x-uStem[k])); rv=1.-smoothstep(uRad-3., uRad+3., d); }
    float c=m*rv*vA.w; if(c<.002) discard; put(uMarkC*c, vec3(1.-c), c*12.); return;
  }
  if(kind>3.5){                                       // a letter face (route 04): the gel, cut by the wordmark
    vec2 uv=vC.xy/vC.z; float c=texture(uFace, uv).a*vA.w*uRibA; if(c<.002) discard;
    vec2 rw=texture(uRamp, vec2(vA.y/6.2832, .5)).rg; float lamp=mix(1.-uLamp, 1., smoothstep(0., .7, vP.x/uRes.x));
    float st=1.+(vnoise(vec2(vP.x/(34.*uDpr), vP.y/(260.*uDpr)))-.5)*.07*uStreak;
    vec3 col=(uBase*rw.r*lamp+rw.g*.5)*st; vec3 T=1.-uTint*(1.-uGel); float ac=uAlpha*c;
    put(col*c, (1.-ac)*(1.-c+c*T), c); return;
  }
  if(kind<1.5){                                       // sphere: lambert lit from the right, hard mask, overspray halo
    vec2 d=(vP-vC.xy)/vC.z; float r=length(d), rp=vC.z;
    vec3 sc=uSph[int(vC.w+.5)]; float al=uSphA;
    if(r<1.){ float cov=clamp((1.-r)*rp+.5,0.,1.)*al; float nz=sqrt(max(0.,1.-dot(d,d)));
      float lam=smoothstep(-.75,1.,d.x*.78-d.y*.25+nz*.57), sp=pow(max(0.,d.x*.35-d.y*.55+nz*.76),14.)*.12;
      vec3 col=sc*(.26+.74*lam)*vA.w+vec3(sp);
      put(col*cov, vec3(1.-cov), cov); return; }
    float l=dot(sc,vec3(.299,.587,.114))*.5; float g=exp(-pow((r-1.)*rp/(6.*uDpr),2.)*.5)*.25*al;
    put(vec3(.8,.95,1.3)*l*g, vec3(1.), 0.); return;
  }
  if(kind<2.5){                                       // light helix: core, sprayed skirt, wide skirt
    float d=abs(vA.x)*vB.z/uDpr; float e=vA.w*uLight;
    float I=.55*exp(-d*d/(2.*1.3*1.3))+.34*exp(-d*d/(2.*3.8*3.8))+.05*exp(-d*d/(2.*19.*19.));
    if(uLightBox>.5){ put(vec3(0.), 1.-clamp(I*e*(1.-vC.rgb)*1.6,0.,1.), 0.); return; }
    put(vC.rgb*I*e, vec3(1.), 0.); return;
  }
  float d=abs(vA.x)*vB.z/uDpr; float g=(exp(-d*d/(2.*9.))*.8+exp(-d*d/(2.*169.))*.55)*vA.w*uRibA;   // the band's cut end
  put(uRim*g*.6+vec3(60.,75.,105.)/255.*g, vec3(1.), 0.);
}`;

  const QVS = `#version 300 es
layout(location=0) in vec2 aPos; out vec2 vUv; void main(){ vUv=aPos*.5+.5; gl_Position=vec4(aPos,0.,1.); }`;
  /* ground: black, blue haze toward the foot, p10's floor grid (vertical lines to the vanishing point, rows at vy + K/n) */
  const BG = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o;
uniform vec2 uRes; uniform vec3 uGround, uHaze, uGrid, uMarkCol; uniform float uGridA, uHazeK, uDpr, uLightBox, uUnder; uniform vec4 uStage; uniform sampler2D uMark;  // stage: ox, oy, scale, 0
void main(){
  vec2 px=vec2(vUv.x, 1.-vUv.y)*uRes; vec2 s=(px-uStage.xy)/uStage.z;      // stage units
  float H=675., vy=675.*.52, cx=600., pitch=39., n0=max(4., floor((H-vy)/(pitch*.345)+.5)), K=(H-vy)*n0;
  vec3 c=uGround;
  float hz=smoothstep(vy+(H-vy)*.45, H+(H-vy)*.3, s.y)*uHazeK*.75; c+=uHaze*hz;
  if(s.y>vy+2.){
    float fy=s.y-vy, X=(s.x-cx)*(H-vy)/fy/pitch, dX=abs(X-floor(X+.5))*pitch*fy/(H-vy);
    float n=K/fy, dN=abs(n-floor(n+.5))*K/(n*n);
    float fade=smoothstep(vy+(H-vy)*.6, vy+(H-vy)*.76, s.y);
    float px1=1./uStage.z;
    float lv=clamp(.75+px1*.5-dX,0.,1.)*1.3+exp(-dX*dX/(2.*2.2*2.2))*.25+exp(-dX*dX/(2.*81.))*.1;
    float lr=(clamp(.75+px1*.5-dN,0.,1.)*1.3+exp(-dN*dN/(2.*2.2*2.2))*.25+exp(-dN*dN/(2.*81.))*.1)*(.5+.45*fy/(H-vy)) * step(.5*(H-vy), fy);
    float g=max(lv, lr)*fade*uGridA;
    c+=uGrid*g*(1.-2.*uLightBox);
  }
  c=mix(c, uMarkCol, texture(uMark, vec2(vUv.x, 1.-vUv.y)).a*uUnder);
  o=vec4(c,0.);
}`;
  const BLUR = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o; uniform sampler2D uT; uniform vec2 uDir; uniform float uSig;
void main(){ vec3 a=vec3(0.); float w=0.; for(int i=-12;i<=12;i++){ float f=float(i); float k=exp(-f*f/(2.*uSig*uSig)); a+=texture(uT, vUv+uDir*f).rgb*k; w+=k; } o=vec4(a/w,1.); }`;
  /* final: bloom back in, static scan grain (finer than a pixel of the plate, never tiled), then the flat wordmark */
  const FIN = `#version 300 es
precision highp float; in vec2 vUv; out vec4 o;
uniform sampler2D uScene, uBloom, uMark, uMarkG; uniform vec2 uRes; uniform float uBloomK, uGrain, uMarkA, uMarkGA, uDpr, uSeed, uCell; uniform vec3 uMarkCol;
float h(vec2 p, float s){ vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)+s); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i,1.),h(i+vec2(1,0),1.),f.x),mix(h(i+vec2(0,1),1.),h(i+vec2(1,1),1.),f.x),f.y); }
void main(){
  vec2 px=vUv*uRes; vec4 sc=texture(uScene, vUv); vec3 c=sc.rgb+texture(uBloom, vUv).rgb*uBloomK;
  float band=clamp(sc.a,0.,1.), gm=sc.a>5.?0.:1.;
  vec2 g=floor(px/uCell);
  float n=(h(g,uSeed)+h(g,uSeed+.37)-1.)*1.05*uGrain + (vn(px/(30.*uDpr))-.5)*.75*uGrain + (h(g,uSeed+.71)<.012?2.5*uGrain:0.);
  n*=(1.+.45*band)*gm; float ch=(h(g,uSeed+.53)-.5)*uGrain*.6*gm;
  c+=vec3(n+ch, n, n-ch)/255.;
  vec2 mu=vec2(vUv.x, 1.-vUv.y);
  float m=texture(uMark, mu).a*uMarkA, mg=texture(uMarkG, mu).a*uMarkGA*(1.-uMarkA);
  c=mix(c, uMarkCol, clamp(m+mg,0.,1.));
  o=vec4(c,1.);
}`;

  function make(canvas) {
    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true, alpha: false });
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_blend_func_extended'); let dual = !!ext;
    const half = gl.getExtension('EXT_color_buffer_half_float') || gl.getExtension('EXT_color_buffer_float');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const prog = (v, f) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); } return { p, u }; };
    let P; try { P = prog(VS, FS(dual)); } catch (e) { dual = false; P = prog(VS, FS(false)); }
    const PB = prog(QVS, BG), PBL = prog(QVS, BLUR), PF = prog(QVS, FIN);
    const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const qvao = gl.createVertexArray(); gl.bindVertexArray(qvao); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const vbo = gl.createBuffer(), vao = gl.createVertexArray(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const STR = 14 * 4; [[0, 2, 0], [1, 4, 8], [2, 4, 24], [3, 4, 40]].forEach(([l, n, o]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, STR, o); });
    gl.bindVertexArray(null);
    const tex = (w, h, data, fmt) => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (fmt === 'f') gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null); else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data || null); return t; };
    const ramp = tex(256, 1, rampTex());
    let fb = null, W = 0, H = 0, markT = null, markGT = null, markKey = '';
    const faceT = (() => { const c = document.createElement('canvas'), k = 2048 / 998; c.width = 2048; c.height = Math.ceil(217 * k); const x = c.getContext('2d'); x.scale(k, k); x.fill(new Path2D(window.MINDGUT_LOGO.d), 'evenodd');
      const t = tex(1, 1); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); return t; })();
    const target = (w, h) => { const t = tex(w, h, null, half ? 'f' : 'b'); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f, w, h }; };
    function size(w, h) { if (w === W && h === H && fb) return; W = w; H = h; canvas.width = w; canvas.height = h;
      fb = { scene: target(w, h), a: target(Math.ceil(w / 4), Math.ceil(h / 4)), b: target(Math.ceil(w / 4), Math.ceil(h / 4)) }; markKey = ''; }
    /* the wordmark, drawn from its traced vector at this canvas size; a second copy without the g */
    function marks(view, mv) {
      mv = mv || G.WM;
      const key = W + 'x' + H + ':' + view.ox.toFixed(2) + ':' + view.s.toFixed(4) + ':' + mv.k + ':' + mv.ox + ':' + mv.oy; if (key === markKey) return; markKey = key;
      const mk = keepG => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), L = window.MINDGUT_LOGO;
        x.setTransform(view.s * mv.k, 0, 0, view.s * mv.k, view.ox + mv.ox * view.s, view.oy + mv.oy * view.s);
        if (!keepG) { x.save(); x.beginPath(); x.rect(-10, -10, 589 - (-10), 240); x.rect(729, -10, 300, 240); x.clip(); }
        x.fillStyle = '#000'; x.fill(new Path2D(L.d), 'evenodd'); if (!keepG) x.restore(); return c; };
      const up = (t, c) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); };
      markT = markT || tex(1, 1); markGT = markGT || tex(1, 1); up(markT, mk(true)); up(markGT, mk(false));
    }

    /* ---------- geometry for one frame ---------- */
    let buf = new Float32Array(14 * 6 * 6000);
    function build(F, pal, view) {
      const cam = F.cam, Fz = R.focal(cam), s = view.s, ox = view.ox, oy = view.oy, S = F.s, n = S.length;
      const proj = p => { const q = R.project(p, cam, Fz); return [ox + q[0] * s, oy + q[1] * s, q[2], q[3]]; };
      const C = new Array(n), items = [];
      for (let i = 0; i < n; i++) { const p = S[i], c = proj(p);
        const e1 = proj({ x: p.x + p.bx * p.w / 2, y: p.y + p.by * p.w / 2, z: p.z + p.bz * p.w / 2 });
        C[i] = { c, e: [e1[0] - c[0], e1[1] - c[1]] }; }
      for (let i = 0; i < n - 1; i++) {
        const a = S[i], b = S[i + 1]; if (a.a < .004 && b.a < .004) continue;
        const ca = C[i], cb = C[i + 1];
        let tx = cb.c[0] - ca.c[0], ty = cb.c[1] - ca.c[1]; const tl = Math.hypot(tx, ty); if (tl < 1e-4) continue; tx /= tl; ty /= tl;
        // the band's normal, in view space, for the ramp
        const T3 = [b.x - a.x, b.y - a.y, b.z - a.z], B3 = [a.bx, a.by, a.bz];
        let N3 = [B3[1] * T3[2] - B3[2] * T3[1], B3[2] * T3[0] - B3[0] * T3[2], B3[0] * T3[1] - B3[1] * T3[0]]; const nl = Math.hypot(...N3) || 1; N3 = N3.map(v => v / nl);
        const Nv = R.rotate(N3, cam); let th = Math.atan2(Nv[2], -Nv[1]); if (th < 0) th += 6.2832;
        const side = Nv[0];
        const off = (cc, p) => { const hw = p.w / 2 * s * cc.c[3]; const tub = [-ty * hw, tx * hw]; return [cc.e[0] + (tub[0] - cc.e[0]) * p.r, cc.e[1] + (tub[1] - cc.e[1]) * p.r]; };
        let oa = off(ca, a), ob = off(cb, b); if (oa[0] * -ty + oa[1] * tx < 0) { oa = [-oa[0], -oa[1]]; ob = [-ob[0], -ob[1]]; }
        const hwa = Math.max(Math.hypot(oa[0], oa[1]), .01), hwb = Math.max(Math.hypot(ob[0], ob[1]), .01);
        items.push({ z: (ca.c[2] + cb.c[2]) / 2, wz: (a.z + b.z) / 2, kind: 0, v: [ca.c[0], ca.c[1], cb.c[0], cb.c[1], oa, ob, hwa, hwb, th, a.sh === undefined ? a.r : a.sh, a.a, b.a, -ty, tx, side] });
      }
      // cut end of the band (the coil's last sample), while the band is a coil
      if (F.endGlow !== 0) { const p = C[n - 1], q = C[n - 2]; const ex = p.e[0], ey = p.e[1], l = Math.hypot(ex, ey) || 1;
        items.push({ z: p.c[2] + 1, kind: 3, v: [p.c[0] - ex, p.c[1] - ey, p.c[0] + ex, p.c[1] + ey, 40 * s, (S[n - 1].a) * (1 - (F.ribA < 1 ? 1 - F.ribA : 0)) * (F.arcA * .7 + .3)] }); }
      // light helices
      if (F.arcA > .004) for (const A of G.arcs(F.phase)) { const col = pal.arcs[A.col].map(v => v / 255);
        for (let k = 0; k < A.pts.length - 1; k++) { const p = A.pts[k], q = A.pts[k + 1], a = proj(p), b = proj(q);
          items.push({ z: (a[2] + b[2]) / 2, kind: 2, v: [a[0], a[1], b[0], b[1], 60 * s, p.e * F.arcA, q.e * F.arcA, col] }); } }
      // spheres (or, on route 03, the one dot they become)
      const sph = F.spheres || G.spheres(); const tt = F.tittleSphere || 0, ti = G.wm(251.5, 18.5);
      if (F.sphA > .004) sph.forEach((p, k) => { const tgt = { x: ti[0], y: ti[1], z: 0 }, q = { x: p.x + (tgt.x - p.x) * tt, y: p.y + (tgt.y - p.y) * tt, z: p.z };
        const a = proj(q), r = (p.r + (15 - p.r) * tt) * s * a[3];
        items.push({ z: a[2] + .01 * k, kind: 1, v: [a[0], a[1], r, p.col, p.dim, F.sphA * (F.sphFade === undefined ? 1 : F.sphFade)] }); });
      if (F.faceA > .004) { const N3 = R.rotate([0, 0, 1], cam); let th = Math.atan2(N3[2], -N3[1]); if (th < 0) th += 6.2832;
        const cs = [[0, 0], [998, 0], [0, 217], [998, 217]].map(([u, v]) => { const q = G.wm(u, v), a = proj({ x: q[0], y: q[1], z: F.faceZ || 0 }); return [a[0], a[1], u / 998, v / 217, a[3]]; });
        items.push({ z: 1e9, kind: 4, v: [cs, th, F.faceA] }); }
      let plane = null;
      if (F.planeA > .004) { const mv = F.markView || G.WM;
        const cs = [[0, 0], [998, 0], [0, 217], [998, 217]].map(([u, v]) => { const a = proj({ x: mv.ox + u * mv.k, y: mv.oy + v * mv.k, z: 0 }); return [a[0], a[1], u / 998, v / 217, a[3]]; });
        plane = { z: 0, kind: 5, v: [cs, F.planeA] }; }
      if (plane) { const far = items.filter(it => (it.wz === undefined ? it.z : it.wz) < 0), near = items.filter(it => (it.wz === undefined ? it.z : it.wz) >= 0);
        far.sort((a, b) => a.z - b.z); near.sort((a, b) => a.z - b.z); items.length = 0; items.push(...far, plane, ...near); }
      else items.sort((a, b) => a.z - b.z);
      // write vertices: two triangles per item
      let o = 0; const need = items.length * 6 * 14; if (buf.length < need) buf = new Float32Array(need * 1.5);
      const V = (x, y, a0, a1, a2, a3, b0, b1, b2, b3, c0, c1, c2, c3) => { buf[o++] = x; buf[o++] = y; buf[o++] = a0; buf[o++] = a1; buf[o++] = a2; buf[o++] = a3; buf[o++] = b0; buf[o++] = b1; buf[o++] = b2; buf[o++] = b3; buf[o++] = c0; buf[o++] = c1; buf[o++] = c2; buf[o++] = c3; };
      for (const it of items) { const v = it.v;
        if (it.kind === 0) { const [ax, ay, bx, by, oa, ob, hwa, hwb, th, r, aa, ab, nx, ny, sd] = v;
          const P = [[ax + oa[0], ay + oa[1], 1, aa, hwa], [ax - oa[0], ay - oa[1], -1, aa, hwa], [bx + ob[0], by + ob[1], 1, ab, hwb], [bx - ob[0], by - ob[1], -1, ab, hwb]];
          for (const k of [0, 1, 2, 2, 1, 3]) { const p = P[k]; V(p[0], p[1], p[2], th, r, p[3], nx, ny, p[4], 0, sd, 0, 0, 0); } }
        else if (it.kind === 5) { const [cs, pa] = v; for (const k of [0, 1, 2, 2, 1, 3]) { const p = cs[k]; V(p[0], p[1], 0, 0, 0, pa, 0, 0, 0, 5, p[2] * p[4], p[3] * p[4], p[4], 0); } }
        else if (it.kind === 4) { const [cs, th, fa] = v; for (const k of [0, 1, 2, 2, 1, 3]) { const p = cs[k]; V(p[0], p[1], 0, th, 0, fa, 0, 0, 0, 4, p[2] * p[4], p[3] * p[4], p[4], 0); } }
        else if (it.kind === 2) { const [ax, ay, bx, by, hw, ea, eb, col] = v; let tx = bx - ax, ty = by - ay; const l = Math.hypot(tx, ty) || 1; const nx = -ty / l * hw, ny = tx / l * hw;
          const P = [[ax + nx, ay + ny, 1, ea], [ax - nx, ay - ny, -1, ea], [bx + nx, by + ny, 1, eb], [bx - nx, by - ny, -1, eb]];
          for (const k of [0, 1, 2, 2, 1, 3]) { const p = P[k]; V(p[0], p[1], p[2], 0, 0, p[3], 0, 0, hw, 2, col[0], col[1], col[2], 0); } }
        else if (it.kind === 1) { const [x, y, r, ci, dim, al] = v; const e = r + 14 * s;
          const P = [[x - e, y - e], [x + e, y - e], [x - e, y + e], [x + e, y + e]];
          for (const k of [0, 1, 2, 2, 1, 3]) { const p = P[k]; V(p[0], p[1], 0, 0, 0, dim, 0, 0, 0, 1, x, y, r, ci + al * 0); } it.al = al; }
        else { const [ax, ay, bx, by, hw, e] = v; let tx = bx - ax, ty = by - ay; const l = Math.hypot(tx, ty) || 1; const nx = -ty / l * hw, ny = tx / l * hw;
          const P = [[ax + nx, ay + ny, 1], [ax - nx, ay - ny, -1], [bx + nx, by + ny, 1], [bx - nx, by - ny, -1]];
          for (const k of [0, 1, 2, 2, 1, 3]) { const p = P[k]; V(p[0], p[1], p[2], 0, 0, e, 0, 0, hw, 3, 0, 0, 0, 0); } } }
      return { count: o / 14, sphA: F.sphA * (F.sphFade === undefined ? 1 : F.sphFade) };
    }

    /* ---------- draw ---------- */
    function draw(F, pal, opt) {
      opt = opt || {}; const dpr = opt.dpr || 1;
      size(opt.w, opt.h);
      const z0 = F.cam.zoom || 1, s = Math.min(W / G.STAGE.w, H / G.STAGE.h) * z0, view = { s, ox: W / 2 - (G.AX.cx + (F.cam.shift || 0)) * s, oy: H / 2 - (G.STAGE.h / 2) * s + (G.STAGE.h / 2 - G.AX.cy) * s * 0, dpr };
      marks(view, F.markView);
      const geo = build(F, pal, view);
      const c = v => v.map(x => x / 255), LB = pal.lightbox ? 1 : 0;
      // ground
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb.scene.f); gl.viewport(0, 0, W, H); gl.disable(gl.BLEND);
      gl.useProgram(PB.p); gl.bindVertexArray(qvao);
      gl.uniform2f(PB.u.uRes, W, H); gl.uniform3fv(PB.u.uGround, c(pal.ground)); gl.uniform3fv(PB.u.uHaze, c(pal.haze)); gl.uniform3fv(PB.u.uGrid, c(pal.grid));
      gl.uniform1f(PB.u.uGridA, F.gridA * (opt.grid === false ? 0 : 1)); gl.uniform1f(PB.u.uHazeK, 1); gl.uniform1f(PB.u.uDpr, dpr); gl.uniform1f(PB.u.uLightBox, LB);
      gl.uniform4f(PB.u.uStage, view.ox, view.oy, s, 0); gl.uniform1f(PB.u.uUnder, F.under || 0); gl.uniform3fv(PB.u.uMarkCol, c(pal.mark)); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, markT); gl.uniform1i(PB.u.uMark, 2); gl.activeTexture(gl.TEXTURE0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // layers, far to near
      gl.enable(gl.BLEND);
      if (dual) gl.blendFuncSeparate(gl.ONE, ext.SRC1_COLOR_WEBGL, gl.ONE, gl.ONE); else gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
      gl.useProgram(P.p); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, buf.subarray(0, geo.count * 14), gl.DYNAMIC_DRAW);
      const u = P.u; gl.uniform2f(u.uRes, W, H); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ramp); gl.uniform1i(u.uRamp, 0); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, faceT); gl.uniform1i(u.uFace, 1); gl.activeTexture(gl.TEXTURE0);
      gl.uniform3fv(u.uBase, c(pal.ribbon)); gl.uniform3fv(u.uGel, c(pal.gel)); gl.uniform3fv(u.uRim, c(pal.rim));
      gl.uniform3fv(u.uSph, new Float32Array(pal.spheres.flat().map(x => x / 255)));
      gl.uniform1f(u.uAlpha, pal.opacity || .84); gl.uniform1f(u.uTint, pal.tint === undefined ? .35 : pal.tint); gl.uniform1f(u.uLamp, .38); gl.uniform1f(u.uStreak, 1); gl.uniform1f(u.uEdge, 1.3);
      gl.uniform3fv(u.uMarkC, c(pal.mark)); gl.uniform1f(u.uRev, F.rev || 0); gl.uniform1f(u.uHead, F.head || 0); gl.uniform1f(u.uRad, F.rad || 0); gl.uniform1fv(u.uStem, new Float32Array(F.stems || new Array(13).fill(-1e4)));
      gl.uniform1f(u.uRimGlow, pal.rimGlow === undefined ? 1 : pal.rimGlow); gl.uniform1f(u.uRibA, F.ribA); gl.uniform1f(u.uSphA, geo.sphA); gl.uniform1f(u.uLight, 1.05); gl.uniform1f(u.uDpr, s); gl.uniform1f(u.uLightBox, LB);
      gl.drawArrays(gl.TRIANGLES, 0, geo.count);
      gl.disable(gl.BLEND);
      // bloom at a quarter size
      gl.useProgram(PBL.p); gl.bindVertexArray(qvao); gl.uniform1i(PBL.u.uT, 0);
      const bw = fb.a.w, bh = fb.a.h, sig = Math.max(.6, 7 * s / 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb.a.f); gl.viewport(0, 0, bw, bh); gl.bindTexture(gl.TEXTURE_2D, fb.scene.t); gl.uniform2f(PBL.u.uDir, 1 / W * 4 * .5, 0); gl.uniform1f(PBL.u.uSig, sig); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb.b.f); gl.bindTexture(gl.TEXTURE_2D, fb.a.t); gl.uniform2f(PBL.u.uDir, 0, 1 / bh * .5 * 2); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // final
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.useProgram(PF.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fb.scene.t); gl.uniform1i(PF.u.uScene, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fb.b.t); gl.uniform1i(PF.u.uBloom, 1);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, markT); gl.uniform1i(PF.u.uMark, 2);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, markGT); gl.uniform1i(PF.u.uMarkG, 3);
      gl.uniform2f(PF.u.uRes, W, H); gl.uniform1f(PF.u.uBloomK, pal.bloom === undefined ? .04 : pal.bloom); gl.uniform1f(PF.u.uGrain, opt.grain === undefined ? 3.1 : opt.grain);
      gl.uniform1f(PF.u.uMarkA, F.markA); gl.uniform1f(PF.u.uMarkGA, F.markG || 0); gl.uniform1f(PF.u.uDpr, s); gl.uniform1f(PF.u.uCell, Math.max(1, Math.round(.75 * s))); gl.uniform1f(PF.u.uSeed, .137); gl.uniform3fv(PF.u.uMarkCol, c(pal.mark));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.activeTexture(gl.TEXTURE0);
      return { quads: geo.count / 6, dual };
    }
    return { draw, dual: () => dual, gl };
  }
  return { make, RAMP };
})();
