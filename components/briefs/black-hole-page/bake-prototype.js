/* bake-prototype.js - reference for the geodesic pass in BRIEF.md / spec.json.
   Run:  node bake-prototype.js [r_s in px] [camera elevation in degrees] [disk outer radius in r_s]
   Prints the lensed disk as characters on the brief's 6 x 12 px cell grid, then two lines of stats.
   A middle dot is a cell whose ray escaped (halo or far field). A space is a captured ray (shadow).
   No dependencies. Written 2026-11-05. */
// Prototype of the bake the brief specifies: Schwarzschild null geodesics, thin disk, per character cell.
// Units: r_s = 1. Camera looks at the hole from elevation EL above the disk plane; orthographic rays.
const RS_PX = +process.argv[2] || 27.8, CW = 6, CH = 12, COLS = 104, ROWS = 34;
const EL = (+process.argv[3] || 10) * Math.PI / 180, RIN = 3, ROUT = +process.argv[4] || 9.5, D = 60;
// camera basis: disk plane is z = 0; camera sits at (0, -cos EL, sin EL) * D looking at origin
const fwd = [0, Math.cos(EL), -Math.sin(EL)], right = [1, 0, 0], up = [0, Math.sin(EL), Math.cos(EL)];
function trace(bx, by) { // impact-plane coords in r_s; returns {hit, r, phi, g} | {shadow} | null
  let p = [bx*right[0] + by*up[0] - fwd[0]*D, bx*right[1] + by*up[1] - fwd[1]*D, bx*right[2] + by*up[2] - fwd[2]*D];
  let v = fwd.slice();
  const cx = p[1]*v[2] - p[2]*v[1], cy = p[2]*v[0] - p[0]*v[2], cz = p[0]*v[1] - p[1]*v[0];
  const h2 = cx*cx + cy*cy + cz*cz;
  for (let i = 0; i < 4000; i++) {
    const r2 = p[0]*p[0] + p[1]*p[1] + p[2]*p[2], r = Math.sqrt(r2);
    if (r < 1.0) return { shadow: true };
    if (r > D + 5 && (p[0]*v[0] + p[1]*v[1] + p[2]*v[2]) > 0) return null;
    const dt = Math.max(0.02, Math.min(0.5, 0.06 * (r - 0.9)));
    // leapfrog: a = -1.5 h2 p / r^5
    const k = -1.5 * h2 / (r2 * r2 * r);
    const vh = [v[0] + 0.5*dt*k*p[0], v[1] + 0.5*dt*k*p[1], v[2] + 0.5*dt*k*p[2]];
    const pn = [p[0] + dt*vh[0], p[1] + dt*vh[1], p[2] + dt*vh[2]];
    if ((p[2] > 0) !== (pn[2] > 0)) { // crossed the disk plane
      const t = p[2] / (p[2] - pn[2]), hx = p[0] + (pn[0]-p[0])*t, hy = p[1] + (pn[1]-p[1])*t, hr = Math.hypot(hx, hy);
      if (hr >= RIN && hr <= ROUT) {
        const beta = Math.sqrt(0.5 / (hr - 1)), tx = hy/hr, ty = -hx/hr;            // orbit direction: clockwise seen from +z, so the right side approaches
        const vl = Math.hypot(vh[0], vh[1], vh[2]), nx = -vh[0]/vl, ny = -vh[1]/vl; // photon direction toward the camera
        const gamma = 1/Math.sqrt(1 - beta*beta), dop = 1/(gamma*(1 - beta*(tx*nx + ty*ny))), grav = Math.sqrt(1 - 1/hr);
        return { hit: true, r: hr, phi: Math.atan2(hy, hx), g: dop*grav };
      }
    }
    const rn2 = pn[0]*pn[0] + pn[1]*pn[1] + pn[2]*pn[2], rn = Math.sqrt(rn2), kn = -1.5 * h2 / (rn2 * rn2 * rn);
    v = [vh[0] + 0.5*dt*kn*pn[0], vh[1] + 0.5*dt*kn*pn[1], vh[2] + 0.5*dt*kn*pn[2]]; p = pn;
  }
  return { shadow: true };
}
const RAMP = " .':;!|il1[]{}()/?7IJYVXZ235$%&8BQ0@#MW";
let out = [], stats = { hit: 0, shadow: 0, max: 0, lmax: 0, rmax: 0 }; const lum = [];
for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
  const bx = (i - COLS/2 + 0.5) * CW / RS_PX, by = -(j - ROWS/2 + 0.5) * CH / RS_PX, t = trace(bx, by);
  let L = 0; if (t && t.hit) { L = Math.pow(RIN / t.r, 1.6) * Math.pow(t.g, 3.5); stats.hit++; if (bx < 0) stats.lmax = Math.max(stats.lmax, L); else stats.rmax = Math.max(stats.rmax, L); }
  else if (t && t.shadow) { L = -1; stats.shadow++; }
  lum.push(L); stats.max = Math.max(stats.max, L);
}
for (let j = 0; j < ROWS; j++) { let s = ''; for (let i = 0; i < COLS; i++) { const L = lum[j*COLS + i];
  s += L <= 0 ? (L < 0 ? ' ' : '\u00b7') : RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(Math.pow(L / stats.max, 0.45) * (RAMP.length - 1)))]; } out.push(s); }
console.log(out.join('\n')); console.log(JSON.stringify(stats));
// shadow width/height in cells along the center row and column
const mid = Math.floor(ROWS/2); let w = 0; for (let i = 0; i < COLS; i++) if (lum[(mid-3)*COLS + i] < 0) w++;
let hh = 0; for (let j = 0; j < ROWS; j++) if (lum[j*COLS + COLS/2] < 0) hh++;
console.log('shadow cols at row mid-3:', w, '=', (w*CW).toFixed(0), 'px; shadow rows at center col:', hh, '=', (hh*CH).toFixed(0), 'px');
