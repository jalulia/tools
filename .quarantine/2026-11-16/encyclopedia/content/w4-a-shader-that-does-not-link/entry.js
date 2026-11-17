/* W4 — a shader that does not link, and the word that fixes it.
   status: known-failure. The first example on this page is ASSERTED TO FAIL,
   in exactly the way the prose says it will: the fragment shader compiles, the
   program does not link, the stage stays empty and the console says why.

   Adapted from MIR-17, mir-gallery/artifacts/mir-818-complete.html:299-303 —
   a THREE.ShaderMaterial whose vertex shader reads `color` but whose material
   options are only `{ transparent: true }`. Without `vertexColors: true`,
   three.js never defines USE_COLOR and never injects `attribute vec3 color`,
   so the program fails to link and all 818 points are invisible while the
   connection lines between them draw normally. Its own sibling has the fix one
   word long: mir-818-strand.html:511 sets `vertexColors: true`.

   The book has no failure mode anywhere in it. This is the cheapest bug in
   either corpus to reproduce and the most expensive to find, because the source
   looks correct and the output is not wrong, it is absent. */
Shell.registerEntry({
  /* ck-e1 · encyclopedia fields (entity model). Injected verbatim; the
     block below is the entry's original body. */
  entity: "exploration",
  instance_of: ["unlinked-shader"],
  governed_by: ["composing-computational-material-systems"],
  id: 'w4-a-shader-that-does-not-link',
  index: 'W4',
  order: 430,
  title: 'A shader that does not link',
  section: 'worked-examples',
  status: 'known-failure',
  lane: 'glsl',
  tags: ['link error', 'varying', 'known failure'],
  source: {
    kind: 'adapted',
    title: 'MIR-17 — mir-818-complete.html:299–303',
    author: 'Julia Compton',
    date: '2026',
    note: 'Rebuilt for this stage. The original is a three.js ShaderMaterial missing vertexColors: true; the failure here is the same class in the same language, reached without three.js.'
  },
  thumb: 'thumb.png',
  note: 'The first example on this page is meant to fail. The stage is empty and the console reads FAILED — that is the entry working correctly.',

  text: `
    <p>This page is here because everything else in this tool works. A book of
    shaders in which every shader compiles teaches you what a shader looks like
    when it is right, and leaves you with no experience whatsoever of the ten
    minutes in which one is wrong and you cannot see why.</p>

    <p>The first example compiles. Every line of it is legal GLSL, the syntax
    highlighter is happy, the driver's compiler raises nothing. It then fails to
    <em>link</em>, which is a different step: compiling checks that a shader is
    a valid program, linking checks that the vertex shader and the fragment
    shader agree about what passes between them. This one declares
    <code>varying vec3 v_ink;</code> — a promise that the vertex stage will fill
    that in — and the vertex stage this tool supplies knows nothing about it.
    The promise is not kept, so there is no program, so there is nothing to
    draw.</p>

    <div class="note"><span class="lab">What it looks like when it happens</span>
      <p>Nothing. Not a wrong colour, not a garbled shape — an empty stage.
      That is what makes this bug expensive: an incorrect picture tells you
      where to look, and an absent one tells you nothing at all. The chip under
      the stage reads FAILED and the console has the driver's own sentence in
      it, and if you are not in the habit of reading either you will spend the
      afternoon in the wrong file.</p></div>

    <h2>Where it comes from</h2>

    <p>The original is <code>mir-818-complete.html:299–303</code>: a three.js
    <code>ShaderMaterial</code> whose vertex shader begins
    <code>vColor = color;</code> and whose options are
    <code>{ transparent: true }</code> and nothing else. Three.js only injects
    <code>attribute vec3 color</code> into a shader when the material says
    <code>vertexColors: true</code>, so the attribute is never declared, the
    program never links, and all 818 points of the piece are invisible — while
    the connection lines <em>between</em> those points, which use a different
    material, draw perfectly. The piece looks half-finished rather than broken,
    which is why it stayed that way. Its own sibling,
    <code>mir-818-strand.html:511</code>, has the fix, and the fix is one
    word.</p>

    <p>The second example is this page's version of that word. The declaration
    stops being a promise about someone else and becomes a value this shader
    provides for itself. One qualifier deleted, one line that keeps the promise
    locally — and that is precisely what <code>vertexColors: true</code> does,
    stated in the other direction: it makes the upstream stage supply the thing
    the downstream stage is asking for. Either half of the contract can be
    changed. What cannot happen is neither.</p>

    <h2>How to read a link error</h2>

    <p>Open the editor. The console under it prints the driver's log verbatim,
    and the sentence to look for names the variable. A compile error carries a
    line number and the gutter marks it; a link error does not, because it is
    not about a line — it is about two files disagreeing. If the log names a
    variable you can see in your fragment shader and cannot see in your vertex
    shader, you have found it in one read.</p>`,

  examples: [
    // CK8 · the assertion moves out of prose and into data: PLAN §7.7 exempts a
    // known-failure and asserts it fails, and until now the only statement of
    // WHICH example fails was this page's own text, so the QA matrix had to
    // hard-code the id. `status` is already on the example schema.
    { id: 'broken', title: 'Does not link', lane: 'glsl', file: 'main.frag',
      status: 'known-failure', code:
`// THIS SHADER IS MEANT TO FAIL. It is the point of the page.
//
// Every line here is legal GLSL ES 1.00 and the fragment compiler accepts all
// of it. The program then fails to LINK, because the declaration below is a
// promise that the vertex stage will provide v_ink, and the vertex stage this
// tool supplies — a full-screen quad, two attributes, no varyings — has never
// heard of it.
//
// The stage is empty. The chip reads FAILED. The console has the driver's own
// sentence in it. That is the whole lesson: an absent picture, and one line in
// a log.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

// ↓ the promise nobody keeps
varying vec3 v_ink;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    float band  = 0.5 + 0.5 * sin((st.x + st.y) * 8.0 + u_time * 0.6);
    float shade = mix(0.35, 1.0, band);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, v_ink, shade), 1.0);
}
` },

    { id: 'fixed', title: 'The word deleted', lane: 'glsl', file: 'fixed.frag',
      status: 'canonical', code:
`// THE FIX. One qualifier gone, and one line that keeps the promise here rather
// than asking another stage to keep it.
//
// In the three.js original the repair goes the other way — the material gains
// vertexColors: true and the VERTEX shader starts providing the value. Both
// repairs are the same repair: the two halves of the contract are made to
// agree. Which half you change is an architecture decision, and it is worth
// noticing that you are making one.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2  u_resolution;
uniform float u_time;

// ↓ no longer a promise about somebody else
vec3 v_ink;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    // and here is the line that keeps it
    v_ink = mix(vec3(0.129, 0.180, 0.235), vec3(0.804, 0.267, 0.176), st.y);

    float band  = 0.5 + 0.5 * sin((st.x + st.y) * 8.0 + u_time * 0.6);
    float shade = mix(0.35, 1.0, band);

    vec3 paper = vec3(0.925, 0.906, 0.867);
    gl_FragColor = vec4(mix(paper, v_ink, shade), 1.0);
}
` }
  ],

  exercises: [
    { rung: 'tune', text: 'Open the editor on the first example and delete the word <code>varying</code>. The compile is instant and the stage fills. Put it back and watch the stage empty again. That is the entire distance between a working piece and a piece that looks unfinished.' },
    { rung: 'substitute', text: 'Change <code>varying vec3 v_ink;</code> to <code>uniform vec3 v_ink;</code>. It links — and the stage goes flat, because an unset uniform is zero. A picture that is wrong is a better bug than a picture that is missing, and this is the cheapest way to turn one into the other.' },
    { rung: 'generalise', text: 'Write down the two questions that separate these cases: does it compile, and does it link. Anything that names a line is the first; anything that names a variable and no line is the second. Most of the time you spend on a blank canvas is spent not having asked which one you are in.' },
    { rung: 'compose', text: 'Take a piece of your own that draws several things with several materials and remove one contract — an attribute, a uniform, a varying. Note how much of the picture still appears. That fraction is why this bug survives review: it does not look like an error, it looks like a draft.' }
  ],

  critique: {
    reads_as: 'Nothing. A blank stage and a line in a log — which is the honest read of this entry and the reason it is here.',
    coupling: 'None, and that is the fault being taught: a varying is a contract between two stages, and this shader holds only one end of it. The second example replaces the contract with a local value, which couples the colour to position instead of to another stage.',
    pass_order: 'Compile, then link, then draw. The failure sits between the first and second, which is exactly why it produces no line number and no partial picture: the fragment shader was fine, and there was never a program.',
    operators: ['diagonal band', 'ramp', 'a varying that is never written'],
    why_it_survives: 'It survives as a chapter because removing it removes the only place in this tool where you can see what a failure looks like. Every other entry is an example of something working, and a book made entirely of those teaches recognition of success and nothing about diagnosis.',
    faults: [
      'It does not fail: it is a failure. The entry is `known-failure` and the harness asserts the first example FAILS and the second COMPILES, which is the inverse of the assertion every other entry gets.',
      'The exact wording of the link log is the driver’s, so it differs between machines. The variable name is in all of them; the sentence around it is not.',
      'The rebuild loses the thing that made the original expensive — in mir-818-complete the connection lines still draw, so the piece looks nearly right. A full-screen quad cannot be nearly right, so the page has to say that part in prose.'
    ]
  },

  ruling: {
    // CK8 · AUDIT. Written during the build, signed 'julia', not traceable to
    // any comment in her repositories. Proposed until she makes it.
    text: 'A failure ships when it is the lesson. Filing this as an exploration would be a lie about what it is, and hiding it would be a lie about what the work is like.',
    by: 'proposed',
    date: '2026-08-29'
  },

  related: [
    { entry: '01-what-is-a-shader', relation: 'technique-of', label: '01 What is a shader?' }
  ],

  links: [
    { label: 'GLSL ES 1.00 spec — varying variables (§4.3.5)',
      url: 'https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf' }
  ]
});
