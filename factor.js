/**
 * Simple factor lookup (1 unit → N of another), with an amount field.
 *
 * Factors (NIST Handbook 44, 2023, Appendix C — General Tables of Units):
 *   1 avoirdupois pound = 16 avoirdupois ounces
 *   8 furlongs = 1 mile = 5280 feet
 *   1 acre = 43,560 square feet
 *   https://www.nist.gov/document/2023-nist-handbook-44-appendix-c-0
 *
 * International foot 0.3048 m exactly (1959). Metric companions:
 *   1 lb = 0.45359237 kg; 1 oz = 28.349523125 g (same NIST tables)
 *   1 mile = 1609.344 m; 1 acre = 4046.8564224 m² (international foot)
 */
(function () {
  "use strict";

  var PAGES = {
    ozlb: {
      factor: 16,
      defaultAmount: 1,
      metricPerUnit: 453.59237,
      metricLabel: "g per lb is wrong",
      format: "int"
    },
    ftmile: {
      factor: 5280,
      defaultAmount: 1,
      format: "int"
    },
    acre: {
      factor: 43560,
      defaultAmount: 1,
      format: "int"
    }
  };

  function u() {
    return window.howmanyLookup;
  }

  function page() {
    var b = document.body;
    return (b && b.getAttribute("data-page")) || "";
  }

  function render() {
    var spec = PAGES[page()];
    if (!spec) return;
    var t = u().t;
    var amount = u().parseAmount(u().$("factor-amount") && u().$("factor-amount").value);
    var num = u().$("answer-num");
    var eq = u().$("answer-eq");
    if (!(amount > 0) && amount !== 0) {
      if (num) num.textContent = "—";
      if (eq) eq.textContent = t(page() + ".badAmount");
      fillTable(spec, NaN);
      return;
    }
    var out = amount * spec.factor;
    if (num) {
      num.textContent = spec.format === "int" && Math.abs(out - Math.round(out)) < 1e-9
        ? u().formatInt(out)
        : u().formatNumber(out);
    }
    if (eq) eq.textContent = t(page() + ".eqFor", { n: u().formatNumber(amount) });
    fillTable(spec, amount);
  }

  function fillTable(spec, amount) {
    var tbody = u().$("factor-tbody");
    if (!tbody || !isFinite(amount)) return;
    var multiples = [0.25, 0.5, 1, 2, 5, 10];
    var html = "";
    for (var i = 0; i < multiples.length; i++) {
      var n = amount * multiples[i];
      var hit = multiples[i] === 1 ? ' class="is-hit"' : "";
      html +=
        "<tr" +
        hit +
        "><td>" +
        u().formatNumber(n) +
        "</td><td>" +
        u().formatInt(n * spec.factor) +
        "</td></tr>";
    }
    tbody.innerHTML = html;
  }

  function boot() {
    if (!PAGES[page()]) return;
    var form = u().$("factor-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    form.addEventListener("input", render);
    document.addEventListener("howmany:i18n", render);
    render();
  }

  window.howmanyFactor = PAGES;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
