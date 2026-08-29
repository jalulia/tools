/* ============================================================================
   13 Fractal Brownian Motion — the fixture that exercises the full chapter
   anatomy: prose, a staged build-up, named parameters, 1-D plots, the
   four-rung ladder, a variant gallery, a critique block and related links.
   ============================================================================ */

var HEADER = `#ifdef GL_ES
precision highp float;
#endif

uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_time;
uniform float u_lacunarity;
uniform float u_gain;
uniform float u_octaves;

// ---- one field. everything below is a reading of it. --------------------
float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*f*(f*(f*6.0 - 15.0) + 10.0);   // quintic fade
    return mix(mix(hash(i),            hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
    float a = 0.5, s = 0.0, norm = 0.0;
    for (int i = 0; i < 8; i++){
        if (float(i) >= u_octaves) break;
        s += a * vnoise(p);
        norm += a;
        p *= u_lacunarity;      // lacunarity — the gap between octaves
        a *= u_gain;            // gain — how fast the detail gives up
    }
    // normalise by the amplitudes actually used, then open the middle out.
    // Without this the sum sits in a narrow band around 0.5 and the plate is
    // a flat grey with a screen on it — the screen with nothing to describe.
    return smoothstep(0.32, 0.68, s / max(norm, 0.0001));
}

// A 4x4 Bayer threshold, built recursively out of the 2x2 so it needs no
// array and no bit operations — GLSL ES 1.0 has neither to spare.
//   M2 = [[0,2],[3,1]]  and  M4(x,y) = 4*M2(x mod 2, y mod 2) + M2(x/2, y/2)
float m2(vec2 p){ return mod(2.0 * p.x + 3.0 * p.y, 4.0); }
float bayer(vec2 c){
    vec2 f = floor(mod(c, 4.0));
    return (4.0 * m2(mod(f, 2.0)) + m2(floor(f * 0.5))) / 16.0;
}
`;

var TAIL = `
void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p  = uv * 4.0;
    p.x *= u_resolution.x / u_resolution.y;

    float v = field(p);
    // one field decides both the ink and the screen it is printed through
    float t = bayer(gl_FragCoord.xy);
    float ink = step(t, clamp(v, 0.0, 1.0));

    vec3 paper = vec3(0.906, 0.890, 0.851);
    vec3 black = vec3(0.043, 0.043, 0.047);
    gl_FragColor = vec4(mix(black, paper, ink), 1.0);
}
`;

Shell.registerEntry({
  id: '13-fbm',
  index: '13',
  order: 130,
  title: 'Fractal Brownian Motion',
  section: 'generative',
  status: 'canonical',
  lane: 'glsl',
  tags: ['fbm', 'lacunarity', 'gain', 'domain warp'],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 13',
    author: 'Patricio Gonzalez Vivo & Jen Lowe',
    url: 'https://thebookofshaders.com/13/',
    license: 'CC BY-NC-SA 4.0'
  },

  text: `
    <p>One noise is a texture. Several of the same noise, each one half as loud and
    twice as fine as the last, is a <em>material</em>. That summation is all fractal
    Brownian motion is, and the two numbers that give it its character have names:
    <code>lacunarity</code>, the gap in frequency between one octave and the next, and
    <code>gain</code>, how fast each octave gives up its amplitude.</p>

    <div class="note"><span class="lab">Why the names matter</span>
      <p>The tool used to hard-code <code>st *= 2.0; amp *= 0.5;</code> and expose only the
      octave count. Two of the three knobs were welded shut and neither was ever named,
      which is why the chapter read as a recipe rather than as a field.</p>
    </div>

    <p>Read the build-up below in one dimension first. A single wave has an amplitude and
    a frequency and nothing else to say. Five detuned waves added together already look
    like a landscape. The octave loop is only that, written as a loop — and once it is a
    loop, the two numbers are exposed and the whole family of results falls out of them.</p>

    <h2>What the picture is doing</h2>
    <p>The stage is not showing you the field. It is showing you the field
    <em>printed</em>: one value chooses the ink and a 4×4 ordered threshold decides which
    of the two available inks each pixel takes. Dither before quantization is noise;
    dither <em>as</em> the quantization is a screen. Turn the octaves down to one and the
    screen is still there, which is how you can tell the two operators apart.</p>
  `,

  params: [
    { name: 'lacunarity', uniform: 'u_lacunarity', min: 1.2, max: 4,   step: 0.01, value: 2.03 },
    { name: 'gain',       uniform: 'u_gain',       min: 0.1, max: 0.9, step: 0.01, value: 0.48 },
    { name: 'octaves',    uniform: 'u_octaves',    min: 1,   max: 8,   step: 1,    value: 5 }
  ],

  stages: [
    { label: 'one wave', note: 'amplitude and frequency, and nothing else',
      code: HEADER + '\nfloat field(vec2 p){ return smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(p.x * 2.0)); }\n' + TAIL },
    { label: 'superposition', note: 'five detuned waves added together',
      code: HEADER + '\nfloat field(vec2 p){\n  float s = 0.0;\n  s += 0.50 * sin(p.x * 1.0);\n  s += 0.25 * sin(p.x * 2.1);\n  s += 0.12 * sin(p.x * 4.3);\n  s += 0.07 * sin(p.x * 8.7);\n  s += 0.04 * sin(p.x * 17.1);\n  return smoothstep(0.05, 0.95, 0.5 + s);\n}\n' + TAIL },
    { label: 'octaves', note: 'the same move, written as a loop — now the knobs exist',
      code: HEADER + '\nfloat field(vec2 p){ return fbm(vec2(p.x, 0.0)); }\n' + TAIL },
    { label: '2-D fBm', note: 'the destination', default: true,
      code: HEADER + '\nfloat field(vec2 p){ return fbm(p); }\n' + TAIL }
  ],

  plots: [
    { title: 'One wave', expr: '0.5 + 0.5*sin(x*6.2831 + t)', domain: [0, 1], range: [0, 1],
      note: 'Amplitude is the multiplier, frequency is what multiplies <code>x</code>. Move <code>t</code> and the wave travels; nothing else changes.' },
    { title: 'Five detuned waves', expr: '0.5 + 0.5*sin(x*6.28) + 0.25*sin(x*13.2) + 0.12*sin(x*27.0) + 0.06*sin(x*54.7)',
      domain: [0, 1], range: [0, 1.4],
      note: 'Each term is half as loud and about twice as fine. That is the whole idea, before it is a loop.' },
    { title: 'Gain, isolated', expr: 'pow(0.5, x*8.0)', domain: [0, 1], range: [0, 1],
      note: 'Amplitude against octave number at <code>gain = 0.5</code>. Raise the gain and the tail stops dying — which is what "more detail" actually costs.' }
  ],

  exercises: [
    { rung: 'tune', text: 'Take <code>octaves</code> from 1 to 8 and watch detail accumulate and cost rise. Then hold octaves at 5 and move <code>lacunarity</code> off 2.0 — the bands stop lining up and the field stops looking like a repeat.' },
    { rung: 'substitute', text: 'Replace <code>vnoise(p)</code> with <code>abs(vnoise(p)*2.0 - 1.0)</code>. That is turbulence: the same summation reading the absolute value instead of the value.' },
    { rung: 'generalise', text: 'Write <code>ridge()</code> — absolute value, inverted about an offset, squared — as a function you would reuse. Keep it flexible enough that the offset is an argument.' },
    { rung: 'compose', text: 'Warp the domain with itself: <code>fbm(p + fbm(p))</code>. Then make three compositions in which the warp amount is driven by something that is not the field — the mouse, the aspect ratio, a second field at a different scale.' }
  ],

  gallery: [
    { label: 'turbulence',
      code: HEADER + '\nfloat field(vec2 p){\n  float a = 0.5, s = 0.0;\n  for (int i = 0; i < 8; i++){\n    if (float(i) >= u_octaves) break;\n    s += a * abs(vnoise(p) * 2.0 - 1.0);\n    p *= u_lacunarity; a *= u_gain;\n  }\n  return s;\n}\n' + TAIL },
    { label: 'ridge',
      code: HEADER + '\nfloat field(vec2 p){\n  float a = 0.5, s = 0.0;\n  for (int i = 0; i < 8; i++){\n    if (float(i) >= u_octaves) break;\n    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);\n    s += a * n * n;\n    p *= u_lacunarity; a *= u_gain;\n  }\n  return s;\n}\n' + TAIL },
    { label: 'domain warp',
      code: HEADER + '\nfloat field(vec2 p){\n  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));\n  return fbm(p + 2.0 * q);\n}\n' + TAIL }
  ],

  examples: [
    { id: 'warped-fbm', title: 'Warped fBm', lane: 'glsl',
      code: HEADER + '\nfloat field(vec2 p){\n  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));\n  return fbm(p + 2.0 * q);\n}\n' + TAIL },
    { id: 'lacunarity', title: 'Lacunarity', lane: 'glsl',
      code: HEADER + '\nfloat field(vec2 p){ return fbm(p * 0.6); }\n' + TAIL },
    { id: 'persistence', title: 'Persistence', lane: 'glsl',
      code: HEADER + '\nfloat field(vec2 p){ return fbm(p) * 1.35 - 0.15; }\n' + TAIL },
    { id: 'ridged', title: 'Ridged', lane: 'glsl',
      code: HEADER + '\nfloat field(vec2 p){\n  float a = 0.5, s = 0.0;\n  for (int i = 0; i < 8; i++){\n    if (float(i) >= u_octaves) break;\n    float n = 1.0 - abs(vnoise(p) * 2.0 - 1.0);\n    s += a * n * n;\n    p *= u_lacunarity; a *= u_gain;\n  }\n  return s;\n}\n' + TAIL }
  ],

  critique: {
    reads_as: 'A dithered contour map printed in two inks on a bone stock — one sheet, not a gradient with noise laid over it.',
    coupling: 'One field selects the ink AND positions the threshold; the Bayer matrix then decides which of the two inks each pixel takes. Neither operator can be removed without the other losing its reason.',
    pass_order: 'field → clamp → ordered threshold → two-ink mix. Dither after the mix would be grain on top of a picture; dither before it IS the quantization.',
    operators: ['value noise', 'octave summation', 'ordered dither', 'two-ink duotone'],
    why_it_survives: 'Take the dither out and it is a grey cloud; take the octaves out and the screen has nothing to describe. Each pass loses its job when the other goes.'
  },

  related: [
    { tool: 'catalogue-stub', entry: 'b2-riso-brush', relation: 'technique-of',
      href: '../catalogue/#/b2-riso-brush', label: 'B2 Riso brush poster' },
    { entry: '20-ridge-paint', relation: 'variant-of' }
  ],

  links: [
    { label: 'The chapter in the book', url: 'https://thebookofshaders.com/13/' },
    { label: 'Quilez — domain warping', url: 'https://iquilezles.org/articles/warp/' }
  ]
});
