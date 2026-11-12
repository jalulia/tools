/* Five editor's marks. Each is an SVG path with hand pressure (variable width via
   two offset strokes) and can be drawn (stroke-dashoffset) when something happens.
   strike = superseded, still legible · circle = returned to · bracket = scope ·
   caret = add · arrow = this came from that.  Still unless an event draws them. */
window.Marks = (function(){
  const P = {
    strike: "M2 11 C 8 9, 14 12, 22 10",
    circle: "M12 3 C 6 3, 3 7, 3 12 C 3 17, 7 21, 12 21 C 17 21, 21 17, 21 12 C 21 8, 18 4, 13 3.5",
    bracket:"M9 2 C 6 2, 5 4, 5 7 L 5 17 C 5 20, 6 22, 9 22",
    caret:  "M5 18 L 12 7 L 19 18",
    arrow:  "M3 12 C 9 11, 14 11, 20 12 M15 7 C 17 9, 19 11, 20 12 C 19 13, 17 15, 15 17"
  };
  function svg(kind, opts={}){
    const w = opts.w || 1.8, color = opts.color || 'currentColor', cls = opts.cls || '';
    const d = P[kind]; if(!d) return '';
    return `<svg class="mk mk-${kind} ${cls}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="${d}" stroke="${color}" stroke-width="${w*1.35}" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
      <path d="${d}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  // Draw a mark into an element: animates stroke in ~420ms, then holds.
  function draw(el, kind, opts={}){
    el.innerHTML = svg(kind, opts);
    const paths = el.querySelectorAll('path');
    paths.forEach(p => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
      p.getBoundingClientRect();
      p.style.transition = 'stroke-dashoffset 420ms cubic-bezier(.3,.7,.2,1)';
      p.style.strokeDashoffset = 0;
    });
  }
  // Wordmark: the word with a caret-circle presence mark. One SVG, inline.
  function wordmark(size=24){
    return `<span class="wm" style="display:inline-flex;align-items:center;gap:.35em;font-size:${size}px;font-weight:500;letter-spacing:-.015em">
      <svg width="${size*1.05}" height="${size*1.05}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="${P.circle}" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 15 L 12 9 L 16 15" stroke="#1F3DFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>mindgut</span>`;
  }
  return { P, svg, draw, wordmark };
})();
