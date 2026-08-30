/**
 * Shared helpers for lookup calculators. No invented conversion factors here.
 */
(function (global) {
  "use strict";

  function t(key, vars) {
    if (global.howmanyT) return global.howmanyT(key, vars);
    return key;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function parseAmount(raw) {
    if (raw == null) return NaN;
    var str = String(raw).trim().replace(/,/g, "");
    if (!str) return NaN;
    var mixed = str.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    var frac = str.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (frac) return Number(frac[1]) / Number(frac[2]);
    return Number(str);
  }

  function formatNumber(n, opts) {
    if (!isFinite(n)) return "—";
    opts = opts || {};
    var nearest = Math.round(n);
    if (!opts.forceDecimals && Math.abs(n - nearest) < 1e-10) {
      return String(nearest);
    }
    var abs = Math.abs(n);
    var decimals = opts.decimals;
    if (decimals == null) {
      if (abs >= 1000) decimals = 1;
      else if (abs >= 100) decimals = 2;
      else if (abs >= 1) decimals = 3;
      else decimals = 4;
    }
    var s = n.toFixed(decimals);
    if (!opts.keepZeros) {
      s = s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
    }
    return s;
  }

  function formatInt(n) {
    if (!isFinite(n)) return "—";
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function ceilCount(n) {
    if (!isFinite(n) || n <= 0) return 0;
    return Math.ceil(n - 1e-10);
  }

  global.howmanyLookup = {
    t: t,
    $: $,
    parseAmount: parseAmount,
    formatNumber: formatNumber,
    formatInt: formatInt,
    ceilCount: ceilCount
  };
})(typeof window !== "undefined" ? window : global);
