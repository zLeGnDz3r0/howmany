/**
 * Common vs leap Gregorian year for the weeks and days lookup pages.
 *
 * Days: USNO leap-year rule (Gregorian civil calendar).
 *   Common = 365; leap = 366.
 * Weeks: leftover days from integer division, shown — not a rounded 52.14.
 *   365 ÷ 7 = 52 remainder 1; 366 ÷ 7 = 52 remainder 2.
 */
(function () {
  "use strict";

  function u() {
    return window.howmanyLookup;
  }

  function kind() {
    var sel = u().$("year-kind");
    return sel && sel.value === "leap" ? "leap" : "common";
  }

  function renderWeeks() {
    var t = u().t;
    var leap = kind() === "leap";
    var leftover = leap ? 2 : 1;
    var days = leap ? 366 : 365;
    var num = u().$("answer-num");
    var unit = u().$("answer-unit");
    var eq = u().$("answer-eq");
    var ml = u().$("answer-ml");
    if (num) num.textContent = "52";
    if (unit) unit.textContent = t(leap ? "weeks.unitLeap" : "weeks.unit");
    if (eq) eq.textContent = t(leap ? "weeks.eqLeap" : "weeks.eq");
    if (ml) ml.textContent = t(leap ? "weeks.mlLeap" : "weeks.mlLine");
    var rows = document.querySelectorAll("#weeks-tbody tr[data-kind]");
    for (var i = 0; i < rows.length; i++) {
      rows[i].className = rows[i].getAttribute("data-kind") === (leap ? "leap" : "common") ? "is-hit" : "";
    }
    var using = u().$("using-now");
    if (using) using.textContent = t(leap ? "weeks.usingLeap" : "weeks.using");
    return leftover + days;
  }

  function renderDays() {
    var t = u().t;
    var leap = kind() === "leap";
    var days = leap ? 366 : 365;
    var num = u().$("answer-num");
    var eq = u().$("answer-eq");
    var ml = u().$("answer-ml");
    if (num) num.textContent = u().formatInt(days);
    if (eq) eq.textContent = t(leap ? "days.eqLeap" : "days.eq");
    if (ml) ml.textContent = t(leap ? "days.mlLeap" : "days.mlLine");
    var rows = document.querySelectorAll("#days-tbody tr[data-kind]");
    for (var i = 0; i < rows.length; i++) {
      rows[i].className = rows[i].getAttribute("data-kind") === (leap ? "leap" : "common") ? "is-hit" : "";
    }
    var using = u().$("using-now");
    if (using) using.textContent = t(leap ? "days.usingLeap" : "days.using");
  }

  function render() {
    var page = document.body && document.body.getAttribute("data-page");
    if (page === "weeks") renderWeeks();
    else if (page === "days") renderDays();
  }

  function boot() {
    var page = document.body && document.body.getAttribute("data-page");
    if (page !== "weeks" && page !== "days") return;
    var form = u().$("year-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    form.addEventListener("change", render);
    document.addEventListener("howmany:i18n", render);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
