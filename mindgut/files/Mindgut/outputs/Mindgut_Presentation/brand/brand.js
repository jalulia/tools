/* Mindgut brand assets: the real app icon (robot head on mint) and the real wordmark.
   Taken from Mindgut.app. Nothing here is redrawn. */
window.Brand = (function(){
  const base = (document.currentScript && document.currentScript.src || '').replace(/brand\.js.*$/, '');
  const icon = (size, o={}) => `<img class="bk-icon" src="${base}app-icon-${size > 128 ? 512 : size > 64 ? 128 : 64}.png" width="${size}" height="${size}" alt="${o.alt ?? 'Mindgut'}" style="width:${size}px;height:${size}px;border-radius:${Math.round(size*.225)}px">`;
  const wordmark = (h, o={}) => `<img class="bk-wm" src="${base}wordmark-${o.dark ? 'white' : 'black'}.png" alt="mindgut" style="height:${h}px;width:auto">`;
  const lockup = (h, o={}) => `<span class="bk-lockup" style="display:inline-flex;align-items:center;gap:${Math.round(h*.45)}px">${icon(Math.round(h*1.75), { alt:'' })}${wordmark(h, o)}</span>`;
  const robot = (h) => `<img class="bk-robot" src="${base}robot.png" alt="" style="height:${h}px;width:auto">`;
  return { icon, wordmark, lockup, robot, base };
})();
