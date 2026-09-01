/**
 * US liquid vs imperial gallon → liters.
 *
 * US: NIST Handbook 44 Appendix C — 4 quarts = 1 gallon = 231 in³;
 *      1 gallon = 3.785411784 L.
 *      https://www.nist.gov/document/2026-nist-handbook-44-appendix-c
 *
 * Imperial: UK Units of Measurement Regulations 1995 Schedule —
 *      gallon = 4.54609 litres.
 *      https://www.legislation.gov.uk/uksi/1995/1804/schedule/made
 *      Weights and Measures Act 1985 Sch. 1: gallon = 4.54609 cubic decimetres.
 *
 * Do not mix the two gallons. Default is US liquid (site default).
 */
(function () {
  "use strict";

  var LITERS = {
    us: 3.785411784,
    imperial: 4.54609
  };

  var MULTIPLES = [0.25, 0.5, 1, 2, 5, 10];

  function u() {
    return window.howmanyLookup;
  }

  function standard() {
    var sel = u().$("gallon-standard");
    return sel && sel.value === "imperial" ? "imperial" : "us";
  }

  function render() {
    var t = u().t;
    var std = standard();
    var factor = LITERS[std];
    var amount = u().parseAmount(u().$("factor-amount") && u().$("factor-amount").value);
    var num = u().$("answer-num");
    var eq = u().$("answer-eq");
    var using = u().$("using-now");
    if (!(amount > 0) && amount !== 0) {
      if (num) num.textContent = "—";
      if (eq) eq.textContent = t("litgal.badAmount");
      fillTable(NaN, std);
      return;
    }
    var out = amount * factor;
    if (num) num.textContent = u().formatNumber(out, { decimals: 9, keepZeros: false });
    if (eq) eq.textContent = t("litgal.eqFor", { n: u().formatNumber(amount) });
    if (using) using.textContent = t("litgal.using." + std);
    fillTable(amount, std);
  }

  function fillTable(amount, std) {
    var tbody = u().$("factor-tbody");
    if (!tbody || !isFinite(amount)) return;
    var html = "";
    for (var i = 0; i < MULTIPLES.length; i++) {
      var n = amount * MULTIPLES[i];
      var hit = MULTIPLES[i] === 1 ? ' class="is-hit"' : "";
      html +=
        "<tr" +
        hit +
        "><td>" +
        u().formatNumber(n) +
        "</td><td>" +
        u().formatNumber(n * LITERS.us, { decimals: 9 }) +
        "</td><td>" +
        u().formatNumber(n * LITERS.imperial, { decimals: 9 }) +
        "</td></tr>";
    }
    tbody.innerHTML = html;
    if (tbody.parentNode && tbody.parentNode.querySelector) {
      var thUs = document.getElementById("th-us");
      var thImp = document.getElementById("th-imp");
      if (thUs) thUs.className = std === "us" ? "is-std" : "";
      if (thImp) thImp.className = std === "imperial" ? "is-std" : "";
    }
  }

  function boot() {
    if ((document.body && document.body.getAttribute("data-page")) !== "litgal") return;
    var form = u().$("factor-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    document.addEventListener("howmany:i18n", render);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
