/**
 * Bags of concrete — slab/footing volume → bag counts.
 *
 * Yields (QUIKRETE Concrete Mix TDS, Product No. 1101, revised Oct 2022):
 *   https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf
 *   40 lb (18.1 kg) → ~0.30 ft³ (8.5 L)
 *   50 lb (22.6 kg) → ~0.375 ft³ (10.6 L)
 *   60 lb (27.2 kg) → ~0.45 ft³ (12.7 L)
 *   80 lb (36.2 kg) → ~0.60 ft³ (17 L)
 *   90 lb (40.8 kg) → ~0.675 ft³ (19.1 L)
 *
 * 25 kg bags — Westcon Concrete Mix TDS (same ASTM C387 packaged mix family;
 * Canadian 25 kg / 55 lb bag): ~11.7 L (0.41 cu ft).
 *   https://westconprecast.com/wp-content/uploads/2017/08/Westcon-Concrete-Mix.pdf
 * Not an EU 25 kg figure; other brands may differ. We do not invent EU yields.
 *
 * Length conversions: 1 ft = 0.3048 m exactly (1959 international yard).
 * 1 yd³ = 27 ft³ (3 ft = 1 yd).
 *
 * Waste % is an optional user assumption, not a manufacturer number.
 */
(function () {
  "use strict";

  var FT_PER_M = 1 / 0.3048;
  var CUFT_PER_M3 = FT_PER_M * FT_PER_M * FT_PER_M;
  var L_PER_M3 = 1000;

  var BAGS = [
    { id: "80lb", cuft: 0.6, liters: 17, headline: "us" },
    { id: "60lb", cuft: 0.45, liters: 12.7, headline: "us" },
    { id: "40lb", cuft: 0.3, liters: 8.5, headline: "us" },
    { id: "50lb", cuft: 0.375, liters: 10.6 },
    { id: "90lb", cuft: 0.675, liters: 19.1 },
    { id: "25kg", cuft: 0.41, liters: 11.7, headline: "metric" }
  ];

  function u() {
    return window.howmanyLookup;
  }

  function system() {
    var el = u().$("conc-system");
    return el && el.value === "metric" ? "metric" : "us";
  }

  function volume() {
    var L = u().parseAmount(u().$("conc-length") && u().$("conc-length").value);
    var W = u().parseAmount(u().$("conc-width") && u().$("conc-width").value);
    var D = u().parseAmount(u().$("conc-depth") && u().$("conc-depth").value);
    if (!(L > 0) || !(W > 0) || !(D > 0)) return null;
    var sys = system();
    var m3;
    var cuft;
    if (sys === "metric") {
      /* length m, width m, depth cm */
      m3 = L * W * (D / 100);
      cuft = m3 * CUFT_PER_M3;
    } else {
      /* length ft, width ft, depth in */
      cuft = L * W * (D / 12);
      m3 = cuft / CUFT_PER_M3;
    }
    return { cuft: cuft, m3: m3, liters: m3 * L_PER_M3 };
  }

  function wasteFrac() {
    var n = u().parseAmount(u().$("conc-waste") && u().$("conc-waste").value);
    if (!isFinite(n) || n < 0) n = 0;
    return n / 100;
  }

  function bagsNeeded(vol, bag) {
    var extra = 1 + wasteFrac();
    var raw;
    if (system() === "metric") raw = (vol.liters * extra) / bag.liters;
    else raw = (vol.cuft * extra) / bag.cuft;
    return { raw: raw, count: u().ceilCount(raw) };
  }

  function headlineBag() {
    var want = system() === "metric" ? "metric" : "us";
    for (var i = 0; i < BAGS.length; i++) {
      if (BAGS[i].headline === want && BAGS[i].id === (want === "metric" ? "25kg" : "80lb")) {
        return BAGS[i];
      }
    }
    return BAGS[0];
  }

  function render() {
    var t = u().t;
    var vol = volume();
    var num = u().$("answer-num");
    var unit = u().$("answer-unit");
    var eq = u().$("answer-eq");
    var meta = u().$("conc-meta");
    var tbody = u().$("conc-tbody");
    var using = u().$("conc-using");

    var lenLab = t(system() === "metric" ? "concrete.lenM" : "concrete.lenFt");
    var widLab = t(system() === "metric" ? "concrete.widM" : "concrete.widFt");
    var depLab = t(system() === "metric" ? "concrete.depCm" : "concrete.depIn");
    var lenSpan = u().$("conc-len-lab");
    var widSpan = u().$("conc-wid-lab");
    var depSpan = u().$("conc-dep-lab");
    if (lenSpan) lenSpan.textContent = lenLab;
    if (widSpan) widSpan.textContent = widLab;
    if (depSpan) depSpan.textContent = depLab;

    if (using) using.textContent = t("concrete.using." + system());

    if (!vol) {
      if (num) num.textContent = "—";
      if (unit) unit.textContent = t("concrete.unit");
      if (eq) eq.textContent = t("concrete.badDims");
      if (meta) meta.textContent = "";
      if (tbody) tbody.innerHTML = "";
      return;
    }

    var head = headlineBag();
    var need = bagsNeeded(vol, head);
    if (num) num.textContent = u().formatInt(need.count);
    if (unit) unit.textContent = t("concrete.bagName." + head.id);
    if (eq) {
      eq.textContent = t("concrete.eq", {
        cuft: u().formatNumber(vol.cuft, { decimals: 3 }),
        m3: u().formatNumber(vol.m3, { decimals: 4 }),
        waste: u().formatNumber(wasteFrac() * 100)
      });
    }
    if (meta) {
      meta.textContent = t("concrete.meta", {
        cuft: u().formatNumber(vol.cuft, { decimals: 3 }),
        yd3: u().formatNumber(vol.cuft / 27, { decimals: 3 }),
        m3: u().formatNumber(vol.m3, { decimals: 4 })
      });
    }

    if (tbody) {
      var html = "";
      for (var i = 0; i < BAGS.length; i++) {
        var b = BAGS[i];
        var n = bagsNeeded(vol, b);
        var hit = b.id === head.id ? ' class="is-hit"' : "";
        html +=
          "<tr" +
          hit +
          "><td>" +
          t("concrete.bagName." + b.id) +
          "</td><td>" +
          u().formatNumber(b.cuft) +
          " ft³ · " +
          u().formatNumber(b.liters) +
          " L</td><td>" +
          u().formatNumber(n.raw, { decimals: 2 }) +
          "</td><td>" +
          u().formatInt(n.count) +
          "</td></tr>";
      }
      tbody.innerHTML = html;
    }
  }

  function boot() {
    var form = u().$("concrete-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    ["conc-length", "conc-width", "conc-depth", "conc-waste", "conc-system"].forEach(function (id) {
      var el = u().$(id);
      if (!el) return;
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });
    document.addEventListener("howmany:i18n", render);
    render();
  }

  window.howmanyConcrete = {
    BAGS: BAGS,
    CUFT_PER_M3: CUFT_PER_M3,
    volume: volume,
    bagsNeeded: bagsNeeded
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
