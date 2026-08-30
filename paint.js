/**
 * Gallons of paint — wall area → gallons.
 *
 * Coverage: Behr interior how-to (accessed 2026-08-30):
 *   "One gallon of Interior BEHR ULTRA SCUFF DEFENSE Paint and Primer,
 *    or BEHR PREMIUM PLUS is enough to cover 250 to 400 Sq. Ft. of
 *    surface area with one coat."
 *   https://www.behr.com/how-to/interior/determine-how-much-interior-paint-to-buy
 * Behr Premium Plus TDS: "Coverage: 250-400 Sq. Ft./Gal. depending on
 * application method and substrate porosity. Does not include the loss
 * of material from spraying."
 *
 * We do not pick a fake 350 midpoint as "the" number. User chooses 400
 * (smooth / primed, upper published) or 250 (porous / textured, lower published).
 *
 * Openings (same Behr page, labeled as their averages):
 *   average window ≈ 15 sq ft; average door ≈ 20 sq ft.
 *
 * Second coat: Behr says factor in a second coat if necessary — optional, labeled.
 * Wall area: perimeter × height, i.e. 2 × (L + W) × H for a rectangular room.
 * Ceiling optional: L × W added (Behr: add ceiling size to total paintable area).
 */
(function () {
  "use strict";

  var COVER_HI = 400;
  var COVER_LO = 250;
  var AVG_WINDOW = 15;
  var AVG_DOOR = 20;

  function u() {
    return window.howmanyLookup;
  }

  function coverage() {
    var el = u().$("paint-cover");
    return el && el.value === "250" ? COVER_LO : COVER_HI;
  }

  function coats() {
    var n = u().parseAmount(u().$("paint-coats") && u().$("paint-coats").value);
    if (!(n > 0)) n = 1;
    return n;
  }

  function area() {
    var L = u().parseAmount(u().$("paint-length") && u().$("paint-length").value);
    var W = u().parseAmount(u().$("paint-width") && u().$("paint-width").value);
    var H = u().parseAmount(u().$("paint-height") && u().$("paint-height").value);
    if (!(L > 0) || !(W > 0) || !(H > 0)) return null;
    var walls = 2 * (L + W) * H;
    var doors = u().parseAmount(u().$("paint-doors") && u().$("paint-doors").value) || 0;
    var windows = u().parseAmount(u().$("paint-windows") && u().$("paint-windows").value) || 0;
    if (doors < 0) doors = 0;
    if (windows < 0) windows = 0;
    var openings = doors * AVG_DOOR + windows * AVG_WINDOW;
    var wallNet = Math.max(0, walls - openings);
    var ceil = 0;
    if (u().$("paint-ceiling") && u().$("paint-ceiling").checked) ceil = L * W;
    return {
      walls: walls,
      openings: openings,
      wallNet: wallNet,
      ceiling: ceil,
      total: wallNet + ceil
    };
  }

  function render() {
    var t = u().t;
    var a = area();
    var num = u().$("answer-num");
    var unit = u().$("answer-unit");
    var eq = u().$("answer-eq");
    var extra = u().$("answer-ml");
    var tbody = u().$("paint-tbody");
    var cover = coverage();
    var nCoats = coats();

    if (!a) {
      if (num) num.textContent = "—";
      if (unit) unit.textContent = t("paint.unit");
      if (eq) eq.textContent = t("paint.badDims");
      if (extra) extra.textContent = "";
      if (tbody) tbody.innerHTML = "";
      return;
    }

    var raw = (a.total * nCoats) / cover;
    var buy = u().ceilCount(raw);
    if (num) num.textContent = u().formatInt(buy);
    if (unit) unit.textContent = t("paint.unit");
    if (eq) {
      eq.textContent = t("paint.eq", {
        sqft: u().formatNumber(a.total, { decimals: 1 }),
        cover: String(cover),
        coats: u().formatNumber(nCoats)
      });
    }
    if (extra) {
      extra.textContent = t("paint.rawLine", {
        raw: u().formatNumber(raw, { decimals: 2 })
      });
    }

    if (tbody) {
      var rows = [
        ["walls", a.walls],
        ["openings", a.openings],
        ["wallNet", a.wallNet],
        ["ceiling", a.ceiling],
        ["total", a.total]
      ];
      var html = "";
      for (var i = 0; i < rows.length; i++) {
        html +=
          "<tr><td>" +
          t("paint.row." + rows[i][0]) +
          "</td><td>" +
          u().formatNumber(rows[i][1], { decimals: 1 }) +
          "</td></tr>";
      }
      tbody.innerHTML = html;
    }
  }

  function boot() {
    var form = u().$("paint-form");
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

  window.howmanyPaint = {
    COVER_HI: COVER_HI,
    COVER_LO: COVER_LO,
    AVG_WINDOW: AVG_WINDOW,
    AVG_DOOR: AVG_DOOR
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
