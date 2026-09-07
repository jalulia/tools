/* ============================================================================
   _engines/rng.js — seeded randomness. Classic script, no module, no build.

   WHY THIS FILE EXISTS
   The monolith carried FIFTEEN copies of mulberry32, under fifteen names —
   stkMulberry, sxMulberry, anyMulberry, mulberry, festaMulberry, hvMulberry,
   msRng, caMulberry, iaRnd, t1Rnd, rng, AM.mulberry, PR.mulberry, ST.mulberry,
   SO.mulberry. Thirteen were byte-identical; two (iaRnd, t1Rnd) differed only
   in `var` vs `let` and the order of two operands, which is the same generator.
   (The audit counted eleven; the other four hid inside object literals.)

   Reuse, don't redefine: one implementation, one place to fix, and — because
   the seed is the identity of a plate — one place that guarantees the same
   seed still gives the same print after the migration.

   window.Comp is the single namespace every engine hangs off. It is created
   by whichever engine file loads first, so the <script> order in a fragment
   does not matter.
   ============================================================================ */
(function () {
  'use strict';
  var Comp = window.Comp = window.Comp || {};

  /* mulberry32 — 32-bit state, one multiply-xorshift round, uniform in [0,1).
     Fast, seedable, and good enough for grain, jitter and blob placement,
     which is all any lens asks of it. */
  Comp.mulberry32 = function (seed) {
    return function () {
      var t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  /* The two lenses that seeded by `seed * 2654435761 >>> 0` (Knuth's golden
     ratio hash) did it to decorrelate neighbouring integer seeds. Named, so
     the intent survives. */
  Comp.spread = function (seed) { return (seed * 2654435761) >>> 0; };

  /* integer hash → [0,1), for grids where you want a value AT a coordinate
     rather than a stream. */
  Comp.hash2 = function (x, y) {
    var n = (x | 0) * 374761393 + (y | 0) * 668265263;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
})();
