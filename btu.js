/**
 * Room cooling BTU — ENERGY STAR room air-conditioner capacity chart.
 *
 * Chart and adjustments: ENERGY STAR, Room Air Conditioners
 *   https://www.energystar.gov/products/room_air_conditioners
 *   Capacities based on an 8-foot ceiling. Not a Manual J load calculation.
 *
 * Bands ("Area To Be Cooled" → BTUs per hour):
 *   100 up to 150 → 5,000
 *   150 up to 250 → 6,000
 *   250 up to 300 → 7,000
 *   300 up to 350 → 8,000
 *   350 up to 400 → 9,000
 *   400 up to 450 → 10,000
 *   450 up to 550 → 12,000
 *   550 up to 700 → 14,000
 *   700 up to 1,000 → 18,000
 *   1,000 up to 1,200 → 21,000
 *   1,200 up to 1,400 → 23,000
 *   1,400 up to 1,500 → 24,000
 *   1,500 up to 2,000 → 30,000
 *   2,000 up to 2,500 → 34,000
 *
 * Adjustments (same ENERGY STAR page):
 *   Heavily shaded: −10%
 *   Very sunny: +10%
 *   More than two people regularly: +600 BTU per additional person
 *   Kitchen: +4,000 BTU
 *
 * 1 ton of cooling = 12,000 Btu/h
 *   DOE Uniform Methods Project, Ch. 4 footnote:
 *   "A ton equals 12,000 Btu/hr"
 *   DOE HVAC Right-Sizing webinar: "12,000 Btu/h = 1 Ton Cooling"
 *
 * ACCA Manual J is the residential load-calculation standard; this page is not that.
 * Climate / ceiling height: ENERGY STAR notes 8-ft ceilings and does not publish
 * a climate multiplier here — those are caveats, not invented factors.
 */
(function () {
  "use strict";

  var CHART = [
    { min: 100, max: 150, btu: 5000 },
    { min: 150, max: 250, btu: 6000 },
    { min: 250, max: 300, btu: 7000 },
    { min: 300, max: 350, btu: 8000 },
    { min: 350, max: 400, btu: 9000 },
    { min: 400, max: 450, btu: 10000 },
    { min: 450, max: 550, btu: 12000 },
    { min: 550, max: 700, btu: 14000 },
    { min: 700, max: 1000, btu: 18000 },
    { min: 1000, max: 1200, btu: 21000 },
    { min: 1200, max: 1400, btu: 23000 },
    { min: 1400, max: 1500, btu: 24000 },
    { min: 1500, max: 2000, btu: 30000 },
    { min: 2000, max: 2500, btu: 34000, last: true }
  ];

  var TON_BTU = 12000;
  var EXTRA_PERSON = 600;
  var KITCHEN = 4000;

  function u() {
    return window.howmanyLookup;
  }

  function sqft() {
    var mode = u().$("btu-area-mode") && u().$("btu-area-mode").value;
    if (mode === "lw") {
      var L = u().parseAmount(u().$("btu-length") && u().$("btu-length").value);
      var W = u().parseAmount(u().$("btu-width") && u().$("btu-width").value);
      if (!(L > 0) || !(W > 0)) return NaN;
      return L * W;
    }
    return u().parseAmount(u().$("btu-sqft") && u().$("btu-sqft").value);
  }

  function lookupBand(area) {
    for (var i = 0; i < CHART.length; i++) {
      var c = CHART[i];
      if (c.last) {
        if (area >= c.min && area <= c.max) return c;
      } else if (area >= c.min && area < c.max) {
        return c;
      }
    }
    return null;
  }

  function sunFactor() {
    var el = document.querySelector('input[name="btu-sun"]:checked');
    var v = (el && el.value) || "typical";
    if (v === "shade") return 0.9;
    if (v === "sun") return 1.1;
    return 1;
  }

  function extraPeople() {
    var n = u().parseAmount(u().$("btu-people") && u().$("btu-people").value);
    if (!isFinite(n) || n < 0) n = 2;
    return n > 2 ? (n - 2) * EXTRA_PERSON : 0;
  }

  function kitchenAdd() {
    var el = u().$("btu-kitchen");
    return el && el.checked ? KITCHEN : 0;
  }

  function toggleArea() {
    var mode = u().$("btu-area-mode") && u().$("btu-area-mode").value;
    var lw = u().$("btu-lw");
    var sq = u().$("btu-direct");
    if (lw) lw.hidden = mode !== "lw";
    if (sq) sq.hidden = mode !== "sqft";
  }

  function render() {
    var t = u().t;
    toggleArea();
    var area = sqft();
    var num = u().$("answer-num");
    var unit = u().$("answer-unit");
    var eq = u().$("answer-eq");
    var extra = u().$("answer-ml");
    var tbody = u().$("btu-tbody");
    var tonsEl = u().$("btu-tons");

    if (!(area > 0)) {
      if (num) num.textContent = "—";
      if (unit) unit.textContent = t("btu.unit");
      if (eq) eq.textContent = t("btu.badArea");
      if (extra) extra.textContent = "";
      if (tonsEl) tonsEl.textContent = "";
      paintChart(null);
      return;
    }

    var band = lookupBand(area);
    if (!band) {
      if (num) num.textContent = "—";
      if (unit) unit.textContent = t("btu.unit");
      if (eq) {
        eq.textContent = area < 100 ? t("btu.belowChart") : t("btu.aboveChart");
      }
      if (extra) extra.textContent = t("btu.areaLine", { sqft: u().formatNumber(area, { decimals: 1 }) });
      if (tonsEl) tonsEl.textContent = "";
      paintChart(null);
      return;
    }

    var base = band.btu;
    var adjusted = Math.round(base * sunFactor() + extraPeople() + kitchenAdd());
    if (num) num.textContent = u().formatInt(adjusted);
    if (unit) unit.textContent = t("btu.unit");
    if (eq) eq.textContent = t("btu.eq");
    if (extra) {
      extra.textContent = t("btu.areaLine", { sqft: u().formatNumber(area, { decimals: 1 }) }) +
        " · " +
        t("btu.baseLine", { btu: u().formatInt(base) });
    }
    if (tonsEl) {
      tonsEl.textContent = t("btu.tonsLine", {
        tons: u().formatNumber(adjusted / TON_BTU, { decimals: 2 })
      });
    }
    paintChart(band);
  }

  function paintChart(hit) {
    var tbody = u().$("btu-chart-body");
    if (!tbody) return;
    var t = u().t;
    var html = "";
    for (var i = 0; i < CHART.length; i++) {
      var c = CHART[i];
      var cls = hit && hit.btu === c.btu && hit.min === c.min ? ' class="is-hit"' : "";
      var range = u().formatInt(c.min) + "–" + u().formatInt(c.max);
      html +=
        "<tr" +
        cls +
        "><td>" +
        range +
        "</td><td>" +
        u().formatInt(c.btu) +
        "</td><td>" +
        u().formatNumber(c.btu / TON_BTU, { decimals: 2 }) +
        "</td></tr>";
    }
    tbody.innerHTML = html;
  }

  function boot() {
    var form = u().$("btu-form");
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

  window.howmanyBtu = {
    CHART: CHART,
    TON_BTU: TON_BTU,
    lookupBand: lookupBand
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
