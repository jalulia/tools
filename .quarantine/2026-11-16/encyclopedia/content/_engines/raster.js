/* ============================================================================
   _engines/raster.js — how many device pixels a plate is allowed.

   A lens paints at a fixed multiple of its CSS size, and that multiple is two
   decisions wearing one number.

   It is a PRINT decision: at ×2 a 4.4 px dot screen has 8.8 device pixels per
   cell to put a dot in and the lattice holds; at ×1 it has 4.4 and the screen
   starts to moire against itself. And it is a MEMORY decision: a canvas costs
   4 bytes per device pixel whether anyone is looking at it or not.

   Checkpoint 5 measured the contact sheet at 390 peaking at 11.51 MB of canvas
   backing store against a 12 MB budget — a pass with four percent of headroom,
   which is not a budget that holds. 11.1 MB of it was B1 alone: five generated
   photographs at ×2. Reorder one section so B1 sits next to C1 and the sheet
   goes to ~19.8 MB. (Re-measured at checkpoint 6 with a finer scroll step, the
   real peak was never 11.51 at all: D3 and B4 are adjacent in the manifest and
   cost 13.99 MB together. The budget was already over; the sampling had
   missed it.) So the number is settled once, here, rather than twenty-two
   times in fifteen fragments — and it is TWO numbers, because there are two
   situations:

       ×1     on a phone when the host is scaling the plate DOWN to fit
       ×1.5   on a phone when the plate is at its own size
       ×pref  everywhere else — unchanged, so no desktop render moves

   The middle case is a lens opened alone by double-click on a phone: it
   reflows to the phone's own width, a design pixel is a CSS pixel, and ×1.5
   is the compromise between a retina screen and a phone's memory.

   The first case is the contact sheet and the phone entry route, where the
   host renders the plate at its 1100 px design width and CSS-scales it into a
   354 px card. A design pixel is then already about a third of a CSS pixel; on
   a phone whose own devicePixelRatio is 2 or 3, ×1 is still one canvas pixel
   per one-and-a-half to two physical pixels. It is oversampled, not under. The
   honest cost is the one corner where it is not: a lens pinned at 1:1 on the
   phone entry route, where you are looking at a third of the plate through a
   window and each canvas pixel covers two or three physical ones. The fit
   toggle is the phone reading of a plate, and this is the price of the sheet
   staying inside its budget with headroom rather than four percent.

   WHY screen AND NOT innerWidth. A fragment inside a contact-sheet card is
   1100 CSS px wide whatever the phone is: the host renders every lens at its
   own design width and CSS-scales it, precisely so a plate is not reflowed
   into a thumbnail. So the fragment's own viewport cannot tell it what device
   it is on — and the viewport is the wrong question anyway. The backing store
   is charged to the device's memory, not to the box the plate is drawn in.
   `screen` answers the right question, it answers it the same way when the
   lens is opened alone by double-click, and it needs nothing from the host —
   no message, no query string, no race between the cap arriving and the first
   paint.

   The test is the SHORT EDGE of the screen, so it does not change when a phone
   is turned sideways.
   ============================================================================ */
(function () {
  'use strict';
  var Comp = window.Comp = window.Comp || {};

  var PHONE_EDGE = 600;   // short edge, CSS px: phone-class device
  var PHONE_DPR  = 1.5;   // a plate at its own size on a phone
  var SCALED_DPR = 1;     // a plate the host is scaling down to fit one

  function shortEdge() {
    var w = 0, h = 0;
    try {
      w = (window.screen && window.screen.width) || 0;
      h = (window.screen && window.screen.height) || 0;
    } catch (e) { w = h = 0; }
    // No screen object at all (some embedded webviews): the frame's own box is
    // the only thing left, and inside a card that reads 1100, which is the
    // conservative answer — the full multiple.
    if (!w || !h) return window.innerWidth || 1100;
    return Math.min(w, h);
  }

  /* Comp.dpr(preferred) — the multiple a plate may paint at. */
  Comp.dpr = function (preferred) {
    var want = preferred == null ? 2 : preferred;
    var edge = shortEdge();
    if (edge >= PHONE_EDGE) return want;                  // not a phone: unchanged
    // The frame's own width is what the host gave it. Wider than the screen
    // means the plate is being scaled down to be seen at all.
    var scaledDown = (window.innerWidth || 0) > edge;
    return Math.min(want, scaledDown ? SCALED_DPR : PHONE_DPR);
  };

  /* What the cap actually decided, for a lens that wants to report it. */
  Comp.dprCapped = function () { return shortEdge() < PHONE_EDGE; };
})();
