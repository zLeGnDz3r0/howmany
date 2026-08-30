/**
 * howmany — country / cup comparator (no backend).
 * Copy lives in i18n.js (world.*). Numbers are sourced; we never mix systems silently.
 */
(function () {
  "use strict";

  var PLACES = [
    "us",
    "spain",
    "france",
    "germany",
    "portugal",
    "canada",
    "uk",
    "australia",
    "nz",
    "japan",
    "latam"
  ];

  var EUROPE = { spain: 1, france: 1, germany: 1, portugal: 1 };

  var FIELDS = [
    ["liquids", "colLiquids"],
    ["dry", "colDry"],
    ["cup", "colCup"],
    ["pint", "colPint"],
    ["scale", "colScale"],
    ["water", "exWater"],
    ["flour", "exFlour"]
  ];

  function tt(key) {
    return window.howmanyT ? window.howmanyT(key) : key;
  }

  function fillSelect(sel, selected) {
    var html = "";
    for (var i = 0; i < PLACES.length; i++) {
      var id = PLACES[i];
      var name = tt("world.place." + id);
      html += '<option value="' + id + '"' + (id === selected ? " selected" : "") + ">" + name + "</option>";
    }
    sel.innerHTML = html;
    sel.value = selected;
  }

  function card(placeId) {
    var name = tt("world.place." + placeId);
    var rows = "";
    for (var i = 0; i < FIELDS.length; i++) {
      var field = FIELDS[i][0];
      var labelKey = FIELDS[i][1];
      rows += "<dt>" + tt("world." + labelKey) + "</dt><dd>" + tt("world.data." + placeId + "." + field) + "</dd>";
    }
    return (
      '<article class="compare-card" data-place="' +
      placeId +
      '"><h3>' +
      name +
      '</h3><dl class="compare-dl">' +
      rows +
      "</dl></article>"
    );
  }

  function render() {
    var a = document.getElementById("place-a");
    var b = document.getElementById("place-b");
    var out = document.getElementById("compare-out");
    var same = document.getElementById("compare-same");
    if (!a || !b || !out) return;
    var left = a.value;
    var right = b.value;
    if (PLACES.indexOf(left) === -1) left = "us";
    if (PLACES.indexOf(right) === -1) right = "spain";
    out.innerHTML = card(left) + card(right);
    if (same) {
      var show = left !== right && EUROPE[left] && EUROPE[right];
      same.hidden = !show;
    }
  }

  function refreshLabels() {
    var a = document.getElementById("place-a");
    var b = document.getElementById("place-b");
    if (!a || !b) return;
    var left = a.value || "us";
    var right = b.value || "spain";
    fillSelect(a, left);
    fillSelect(b, right);
    var vs = document.getElementById("compare-vs");
    if (vs) vs.textContent = tt("world.vs");
    render();
  }

  function boot() {
    var a = document.getElementById("place-a");
    var b = document.getElementById("place-b");
    if (!a || !b) return;
    fillSelect(a, "us");
    fillSelect(b, "spain");
    a.addEventListener("change", render);
    b.addEventListener("change", render);
    document.addEventListener("howmany:i18n", refreshLabels);
    refreshLabels();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
