/* 05 Shaping functions — adapted from the book, chapter 05.
   Migrated from the LESSONS array of the old single-file playground
   (book-of-shaders/index.html), which is what git holds. */
Shell.registerEntry({
  id: '05-shaping-functions',
  index: '05',
  order: 50,
  title: "Shaping functions",
  section: 'algorithmic-drawing',
  status: 'canonical',
  lane: 'glsl',
  tags: ["smoothstep","plot","remap"],
  source: {
    kind: 'adapted',
    title: 'The Book of Shaders — chapter 05',
    author: "Patricio Gonzalez Vivo & Jen Lowe",
    url: 'https://thebookofshaders.com/05/',
    license: 'CC BY-NC-SA 4.0'
  },
  thumb: 'thumb.png',

  text: `
    <p>Shaping functions remap a value through a curve. They are the heart of procedural design: feed in <code>st.x</code> (0→1 across the screen) and the function's <em>shape</em> controls everything downstream.</p>
    <p>This famous example plots the curve itself. <code>smoothstep</code> gives an eased S-curve; the green line shows <code>y = f(x)</code>, the background shows the raw value.</p>`,

  examples: [
    { id: 'smoothstep', title: "The curve, drawn", lane: 'glsl', file: 'main.frag', code:
`#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;

// draws a 2px-ish line where st.y == pct
float plot(vec2 st, float pct){
  return smoothstep(pct - 0.015, pct, st.y) -
         smoothstep(pct, pct + 0.015, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    // ---- the shaping function ----
    float y = smoothstep(0.1, 0.9, st.x);

    vec3 color = vec3(y);
    float line = plot(st, y);
    color = mix(color, vec3(0.36, 0.78, 0.45), line);
    gl_FragColor = vec4(color, 1.0);
}
` }
  ],

  exercises: [
    { rung: 'substitute', text: "Replace the <code>y =</code> line: <code>pow(st.x, 5.0)</code>, <code>sin(st.x*6.2831)*0.5+0.5</code>, <code>step(0.5, st.x)</code>, <code>smoothstep(0.0, 1.0, st.x)</code>." }
  ],

  links: [
    { label: "The chapter in the book", url: 'https://thebookofshaders.com/05/' }
  ]
});
