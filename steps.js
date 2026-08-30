/**
 * Steps in a mile / miles for N steps.
 *
 * Default average: American Council on Exercise, Walk This Way toolkit (2015):
 *   "About 2,000 steps equal one mile."
 *   https://acewebcontent.azureedge.net/assets/about-ace/advocacy/Walking_Toolkit_Community.pdf
 * That is a labeled round average, not one number for every body.
 *
 * Height estimate: Scientific American / Science Buddies, "Stepping Science"
 *   (14 Nov 2013): adult step length about 2.2–2.5 ft; step/height ≈ 0.4
 *   (range about 0.41–0.45). They divide step length by about 0.43 to estimate height.
 *   Inverse used here: step length ≈ 0.43 × height, with the 0.41–0.45 range shown.
 *   https://www.scientificamerican.com/article/bring-science-home-estimating-height-walk/
 *
 * Measured step length: distance / steps (user-measured). Geometry only.
 *
 * 1 international mile = 5280 ft = 1609.344 m (1 ft = 0.3048 m exactly).
 * Step ≠ stride: a stride is two steps (same foot twice). This page uses step length.
 */
(function () {
  "use strict";

  var FT_PER_MILE = 5280;
  var M_PER_MILE = 1609.344;
  var IN_PER_FT = 12;
  var CM_PER_IN = 2.54;
  var ACE_STEPS = 2000;
  var SA_RATIO = 0.43;
  var SA_LO = 0.41;
  var SA_HI = 0.45;

  function u() {
    return window.howmanyLookup;
  }

  function mode() {
    var el = document.querySelector('input[name="step-mode"]:checked');
    return (el && el.value) || "ace";
  }

  function heightFt() {
    var sys = u().$("step-h-system") && u().$("step-h-system").value;
    if (sys === "cm") {
      var cm = u().parseAmount(u().$("step-height") && u().$("step-height").value);
      return cm / (CM_PER_IN * IN_PER_FT);
    }
    var ft = u().parseAmount(u().$("step-ft") && u().$("step-ft").value) || 0;
    var inch = u().parseAmount(u().$("step-in") && u().$("step-in").value) || 0;
    return ft + inch / IN_PER_FT;
  }

  function stepLengthFt() {
    var m = mode();
    if (m === "ace") return FT_PER_MILE / ACE_STEPS;
    if (m === "height") return heightFt() * SA_RATIO;
    var sys = u().$("step-len-system") && u().$("step-len-system").value;
    var n = u().parseAmount(u().$("step-length") && u().$("step-length").value);
    if (!(n > 0)) return NaN;
    if (sys === "cm") return n / (CM_PER_IN * IN_PER_FT);
    if (sys === "in") return n / IN_PER_FT;
    return n; /* feet */
  }

  function heightRange() {
    var h = heightFt();
    if (!(h > 0)) return null;
    return {
      lo: h * SA_LO,
      mid: h * SA_RATIO,
      hi: h * SA_HI
    };
  }

  function stepsPerMile(stepFt) {
    return FT_PER_MILE / stepFt;
  }

  function milesForSteps(stepFt, steps) {
    return (steps * stepFt) / FT_PER_MILE;
  }

  function togglePanels() {
    var m = mode();
    var ace = u().$("step-panel-ace");
    var h = u().$("step-panel-height");
    var s = u().$("step-panel-length");
    if (ace) ace.hidden = m !== "ace";
    if (h) h.hidden = m !== "height";
    if (s) s.hidden = m !== "length";
    var hsys = u().$("step-h-system") && u().$("step-h-system").value;
    var us = u().$("step-height-us");
    var cm = u().$("step-height-cm");
    if (us) us.hidden = hsys === "cm";
    if (cm) cm.hidden = hsys !== "cm";
  }

  function render() {
    var t = u().t;
    togglePanels();
    var stepFt = stepLengthFt();
    var nSteps = u().parseAmount(u().$("step-n") && u().$("step-n").value);
    var num = u().$("answer-num");
    var unit = u().$("answer-unit");
    var eq = u().$("answer-eq");
    var extra = u().$("answer-ml");
    var tbody = u().$("step-tbody");
    var milesEl = u().$("step-miles-out");

    if (!(stepFt > 0)) {
      if (num) num.textContent = "—";
      if (unit) unit.textContent = t("steps.unit");
      if (eq) eq.textContent = t("steps.badInput");
      if (extra) extra.textContent = "";
      if (tbody) tbody.innerHTML = "";
      if (milesEl) milesEl.textContent = "—";
      return;
    }

    var spm = stepsPerMile(stepFt);
    if (num) num.textContent = u().formatInt(Math.round(spm));
    if (unit) unit.textContent = t("steps.unit");
    var m = mode();
    if (eq) {
      if (m === "ace") eq.textContent = t("steps.eqAce");
      else if (m === "height") eq.textContent = t("steps.eqHeight");
      else eq.textContent = t("steps.eqLength");
    }
    if (extra) {
      extra.textContent = t("steps.stepLine", {
        in: u().formatNumber(stepFt * IN_PER_FT, { decimals: 2 }),
        cm: u().formatNumber(stepFt * IN_PER_FT * CM_PER_IN, { decimals: 1 })
      });
    }

    if (m === "height") {
      var r = heightRange();
      if (r && extra) {
        extra.textContent =
          extra.textContent +
          " " +
          t("steps.heightRange", {
            lo: u().formatInt(Math.round(stepsPerMile(r.hi))),
            hi: u().formatInt(Math.round(stepsPerMile(r.lo)))
          });
      }
    }

    if (isFinite(nSteps) && nSteps > 0 && milesEl) {
      var miles = milesForSteps(stepFt, nSteps);
      milesEl.innerHTML =
        "<strong>" +
        u().formatNumber(miles, { decimals: 3 }) +
        "</strong> " +
        t("steps.miles") +
        " · " +
        u().formatNumber(miles * M_PER_MILE / 1000, { decimals: 3 }) +
        " km";
    } else if (milesEl) {
      milesEl.textContent = "—";
    }

    if (tbody) {
      var rows = [
        ["ace", FT_PER_MILE / ACE_STEPS],
        ["saLo", 2.2],
        ["saHi", 2.5]
      ];
      if (m === "height" && heightFt() > 0) {
        rows.push(["you", stepFt]);
      } else if (m === "length") {
        rows.push(["you", stepFt]);
      }
      var html = "";
      for (var i = 0; i < rows.length; i++) {
        var id = rows[i][0];
        var sl = rows[i][1];
        var hit = (m === "ace" && id === "ace") || id === "you" ? ' class="is-hit"' : "";
        html +=
          "<tr" +
          hit +
          "><td>" +
          t("steps.row." + id) +
          "</td><td>" +
          u().formatNumber(sl, { decimals: 3 }) +
          "</td><td>" +
          u().formatInt(Math.round(stepsPerMile(sl))) +
          "</td><td>" +
          u().formatNumber(milesForSteps(sl, 10000), { decimals: 2 }) +
          "</td></tr>";
      }
      tbody.innerHTML = html;
    }
  }

  function boot() {
    var form = u().$("steps-form");
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

  window.howmanySteps = {
    ACE_STEPS: ACE_STEPS,
    SA_RATIO: SA_RATIO,
    FT_PER_MILE: FT_PER_MILE,
    stepsPerMile: stepsPerMile,
    milesForSteps: milesForSteps
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
