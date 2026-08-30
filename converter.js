/**
 * howmany — kitchen converter (volume + ingredient weight).
 *
 * Volume factors are per "cup standard" / measurement hypothesis.
 * Default: US customary. Never mix systems silently.
 *
 * US customary (default)
 *   1 US gal = 231 in³, 1 in = 25.4 mm exactly → 3.785411784 L
 *   1 US fl oz = 1/128 gal = 29.5735295625 mL
 *   1 US cup  = 8 US fl oz = 236.5882365 mL
 *   1 tbsp    = 0.5 US fl oz; 1 tsp = 1/3 tbsp
 *
 * US legal / nutrition-label cup — 21 CFR 101.9(b)(5)(viii):
 *   1 tsp = 5 mL; 1 tbsp = 15 mL; 1 cup = 240 mL; 1 fl oz = 30 mL
 *   (labeling household measures, not the US customary kitchen cup)
 *
 * Metric cup (AU/NZ/CA recipes) = 250 mL.
 *   Metric teaspoon 5 mL, tablespoon 15 mL (common CA/NZ/UK metric spoons).
 *   Australian tablespoon is 20 mL (AS 1325) — NOT used here; noted in the UI.
 *
 * UK imperial — Units of Measurement Regulations 1995:
 *   1 imperial gallon = 4.54609 L exactly
 *   1 imperial fl oz  = 28.4130625 mL
 *   1 imperial pint   = 20 imp fl oz = 0.56826125 L
 *   1 imperial quart  = 2 pints; 1 imperial gallon = 160 imp fl oz
 *   Imperial cup      = 10 imp fl oz = 284.130625 mL (historical kitchen;
 *                       half an imperial pint — not listed in the 1995 regs)
 *   tbsp/tsp          = ½ and ⅙ imperial fl oz (kitchen convention, labeled)
 *
 * Ingredient grams: King Arthur Baking Ingredient Weight Chart
 *   https://www.kingarthurbaking.com/learn/ingredient-weight-chart
 *   (accessed 2026-08-30). Values are grams per US customary cup unless
 *   the chart states another volume; we convert those to g / US cup.
 *   Water uses 1 mL ≈ 1 g (near 4 °C), not King Arthur's rounded 227 g.
 *   Avoirdupois ounce = 28.349523125 g (same 1995 regs / international yard).
 *
 * Packing: we use King Arthur's published cup weights as-is.
 *   Brown sugar is packed on their chart. AP flour is 120 g/cup as they
 *   publish (they recommend a scale). No scooped-vs-spooned extra figures.
 */
(function () {
  "use strict";

  var US_CUP_ML = 236.5882365;
  var OZ_G = 28.349523125; /* 1 avoirdupois oz */

  var STANDARDS = {
    us: {
      id: "us",
      cupMl: US_CUP_ML,
      units: {
        tsp: { ml: 4.92892159375, nameKey: "unit.tsp", abbrKey: "unit.tspAbbr", oneKey: "unit.tspOne" },
        tbsp: { ml: 14.78676478125, nameKey: "unit.tbsp", abbrKey: "unit.tbspAbbr", oneKey: "unit.tbspOne" },
        floz: { ml: 29.5735295625, nameKey: "unit.floz", abbrKey: "unit.flozAbbr", oneKey: "unit.flozOne" },
        cup: { ml: US_CUP_ML, nameKey: "unit.cup", abbrKey: "unit.cupAbbr", oneKey: "unit.cupOne" },
        pint: { ml: 473.176473, nameKey: "unit.pint", abbrKey: "unit.pintAbbr", oneKey: "unit.pintOne" },
        quart: { ml: 946.352946, nameKey: "unit.quart", abbrKey: "unit.quartAbbr", oneKey: "unit.quartOne" },
        gallon: { ml: 3785.411784, nameKey: "unit.gallon", abbrKey: "unit.gallonAbbr", oneKey: "unit.gallonOne" },
        ml: { ml: 1, nameKey: "unit.ml", abbrKey: "unit.mlAbbr", oneKey: "unit.mlOne" }
      },
      volumeOrder: ["tsp", "tbsp", "floz", "cup", "pint", "quart", "gallon", "ml"],
      ingredientVolume: ["cup", "tbsp", "tsp", "floz"]
    },
    legal: {
      id: "legal",
      cupMl: 240,
      units: {
        tsp: { ml: 5, nameKey: "unit.tsp", abbrKey: "unit.tspAbbr", oneKey: "unit.tspOne" },
        tbsp: { ml: 15, nameKey: "unit.tbsp", abbrKey: "unit.tbspAbbr", oneKey: "unit.tbspOne" },
        floz: { ml: 30, nameKey: "unit.floz", abbrKey: "unit.flozAbbr", oneKey: "unit.flozOne" },
        cup: { ml: 240, nameKey: "unit.cup", abbrKey: "unit.cupAbbr", oneKey: "unit.cupOne" },
        ml: { ml: 1, nameKey: "unit.ml", abbrKey: "unit.mlAbbr", oneKey: "unit.mlOne" }
      },
      volumeOrder: ["tsp", "tbsp", "floz", "cup", "ml"],
      ingredientVolume: ["cup", "tbsp", "tsp", "floz"]
    },
    metric: {
      id: "metric",
      cupMl: 250,
      units: {
        tsp: { ml: 5, nameKey: "unit.tsp", abbrKey: "unit.tspAbbr", oneKey: "unit.tspOne" },
        tbsp: { ml: 15, nameKey: "unit.tbsp", abbrKey: "unit.tbspAbbr", oneKey: "unit.tbspOne" },
        cup: { ml: 250, nameKey: "unit.cup", abbrKey: "unit.cupAbbr", oneKey: "unit.cupOne" },
        ml: { ml: 1, nameKey: "unit.ml", abbrKey: "unit.mlAbbr", oneKey: "unit.mlOne" }
      },
      volumeOrder: ["tsp", "tbsp", "cup", "ml"],
      ingredientVolume: ["cup", "tbsp", "tsp"]
    },
    imperial: {
      id: "imperial",
      cupMl: 284.130625,
      units: {
        tsp: { ml: 28.4130625 / 6, nameKey: "unit.tsp", abbrKey: "unit.tspAbbr", oneKey: "unit.tspOne" },
        tbsp: { ml: 14.20653125, nameKey: "unit.tbsp", abbrKey: "unit.tbspAbbr", oneKey: "unit.tbspOne" },
        floz: { ml: 28.4130625, nameKey: "unit.floz", abbrKey: "unit.flozAbbr", oneKey: "unit.flozOne" },
        cup: { ml: 284.130625, nameKey: "unit.cup", abbrKey: "unit.cupAbbr", oneKey: "unit.cupOne" },
        pint: { ml: 568.26125, nameKey: "unit.pint", abbrKey: "unit.pintAbbr", oneKey: "unit.pintOne" },
        quart: { ml: 1136.5225, nameKey: "unit.quart", abbrKey: "unit.quartAbbr", oneKey: "unit.quartOne" },
        gallon: { ml: 4546.09, nameKey: "unit.gallon", abbrKey: "unit.gallonAbbr", oneKey: "unit.gallonOne" },
        ml: { ml: 1, nameKey: "unit.ml", abbrKey: "unit.mlAbbr", oneKey: "unit.mlOne" }
      },
      volumeOrder: ["tsp", "tbsp", "floz", "cup", "pint", "quart", "gallon", "ml"],
      ingredientVolume: ["cup", "tbsp", "tsp", "floz"]
    }
  };

  /* Weight units (mass). Same in every cup standard. */
  var WEIGHT_UNITS = {
    g: { nameKey: "unit.g", abbrKey: "unit.gAbbr", oneKey: "unit.gOne" },
    oz: { nameKey: "unit.oz", abbrKey: "unit.ozAbbr", oneKey: "unit.ozOne" }
  };

  /**
   * gramsPerUsCup — published or derived from the cited volume on the chart.
   * King Arthur (https://www.kingarthurbaking.com/learn/ingredient-weight-chart):
   *   All-Purpose Flour              1 cup        120 g
   *   Sugar (granulated white)       1 cup        198 g
   *   Butter                         8 tbsp / ½ cup  113 g  → 226 g / US cup
   *   Brown sugar (dark or light, packed) 1 cup   213 g
   *   Confectioners' sugar (unsifted) 1 cup       113 g
   *   Oats (old-fashioned or quick-cooking) 1 cup  89 g
   *   Cocoa (unsweetened)            ½ cup         42 g  → 84 g / US cup
   *   Honey                          1 tbsp        21 g  → 336 g / US cup (16 US tbsp)
   *   Milk (fresh)                   1 cup        227 g
   *   Olive oil                      ¼ cup         50 g  → 200 g / US cup
   * Water: 1 US cup = 236.588 mL; 1 mL water ≈ 1 g near 4 °C → 236.588 g
   *   (physics / SI cup; not King Arthur's rounded 227 g / 8 oz).
   */
  var INGREDIENTS = {
    water: {
      key: "water",
      gramsPerUsCup: US_CUP_ML,
      densityFromWater: true,
      packed: false
    },
    flour: {
      key: "flour",
      gramsPerUsCup: 120,
      densityFromWater: false,
      packed: false
    },
    sugar: {
      key: "sugar",
      gramsPerUsCup: 198,
      densityFromWater: false,
      packed: false
    },
    butter: {
      key: "butter",
      gramsPerUsCup: 226, /* 2 × 113 g per ½ cup (1 stick) */
      densityFromWater: false,
      packed: false
    },
    "brown-sugar": {
      key: "brown-sugar",
      gramsPerUsCup: 213,
      densityFromWater: false,
      packed: true
    },
    "powdered-sugar": {
      key: "powdered-sugar",
      gramsPerUsCup: 113,
      densityFromWater: false,
      packed: false
    },
    oats: {
      key: "oats",
      gramsPerUsCup: 89,
      densityFromWater: false,
      packed: false
    },
    cocoa: {
      key: "cocoa",
      gramsPerUsCup: 84, /* 42 g per ½ cup */
      densityFromWater: false,
      packed: false
    },
    honey: {
      key: "honey",
      gramsPerUsCup: 336, /* 21 g per US tbsp × 16 */
      densityFromWater: false,
      packed: false
    },
    milk: {
      key: "milk",
      gramsPerUsCup: 227,
      densityFromWater: false,
      packed: false
    },
    "olive-oil": {
      key: "olive-oil",
      gramsPerUsCup: 200, /* 50 g per ¼ cup */
      densityFromWater: false,
      packed: false
    }
  };

  var INGREDIENT_ORDER = [
    "flour",
    "sugar",
    "brown-sugar",
    "powdered-sugar",
    "butter",
    "water",
    "milk",
    "honey",
    "olive-oil",
    "oats",
    "cocoa"
  ];

  var STORAGE_STD = "howmany-standard";
  var STORAGE_MODE = "howmany-mode";

  function t(key, vars) {
    if (window.howmanyT) return window.howmanyT(key, vars);
    return key;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function currentStandardId() {
    var sel = $("cup-standard");
    var id = sel && sel.value;
    return STANDARDS[id] ? id : "us";
  }

  function currentStandard() {
    return STANDARDS[currentStandardId()];
  }

  function isIngredientMode() {
    var btn = $("mode-ingredient");
    return !!(btn && btn.getAttribute("aria-pressed") === "true");
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "—";
    var nearest = Math.round(n);
    if (Math.abs(n - nearest) < 1e-10) return String(nearest);

    var abs = Math.abs(n);
    var decimals;
    if (abs >= 1000) decimals = 2;
    else if (abs >= 100) decimals = 3;
    else if (abs >= 1) decimals = 4;
    else if (abs >= 0.01) decimals = 5;
    else decimals = 8;

    var s = n.toFixed(decimals);
    s = s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
    return s;
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

  function unitName(std, key, n) {
    var u = std.units[key] || WEIGHT_UNITS[key];
    if (!u) return key;
    if (n === 1) return t(u.oneKey);
    return t(u.nameKey);
  }

  function unitAbbr(std, key) {
    var u = std.units[key] || WEIGHT_UNITS[key];
    if (!u) return key;
    return t(u.abbrKey);
  }

  function optionLabel(std, key) {
    var u = std.units[key] || WEIGHT_UNITS[key];
    if (!u) return key;
    return t(u.nameKey) + " (" + t(u.abbrKey) + ")";
  }

  function gramsPerCurrentCup(ing, std) {
    if (!ing) return NaN;
    if (ing.densityFromWater) return std.cupMl; /* 1 mL ≈ 1 g */
    return ing.gramsPerUsCup * (std.cupMl / US_CUP_ML);
  }

  function isScaled(ing, std) {
    return !ing.densityFromWater && std.id !== "us";
  }

  function toMl(amount, unit, std) {
    var u = std.units[unit];
    if (!u) return NaN;
    return amount * u.ml;
  }

  function fromMl(ml, unit, std) {
    var u = std.units[unit];
    if (!u) return NaN;
    return ml / u.ml;
  }

  function convertVolume(amount, from, to, std) {
    return fromMl(toMl(amount, from, std), to, std);
  }

  function amountToGrams(amount, unit, ing, std) {
    if (unit === "g") return amount;
    if (unit === "oz") return amount * OZ_G;
    var cups = fromMl(toMl(amount, unit, std), "cup", std);
    return cups * gramsPerCurrentCup(ing, std);
  }

  function gramsToUnit(grams, unit, ing, std) {
    if (unit === "g") return grams;
    if (unit === "oz") return grams / OZ_G;
    var cups = grams / gramsPerCurrentCup(ing, std);
    return fromMl(toMl(cups, "cup", std), unit, std);
  }

  function fillSelect(sel, keys, std, preferred, fallback) {
    if (!sel) return;
    var prev = preferred || sel.value;
    sel.innerHTML = "";
    for (var i = 0; i < keys.length; i++) {
      var opt = document.createElement("option");
      opt.value = keys[i];
      opt.textContent = optionLabel(std, keys[i]);
      sel.appendChild(opt);
    }
    if (prev && keys.indexOf(prev) !== -1) sel.value = prev;
    else sel.value = fallback || keys[0];
  }

  function fillIngredientSelect() {
    var sel = $("ingredient");
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = "";
    for (var i = 0; i < INGREDIENT_ORDER.length; i++) {
      var key = INGREDIENT_ORDER[i];
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = t("ing." + key);
      sel.appendChild(opt);
    }
    if (prev && INGREDIENTS[prev]) sel.value = prev;
    else sel.value = "flour";
  }

  function fillStandardSelect() {
    var sel = $("cup-standard");
    if (!sel) return;
    var prev = sel.value;
    var specs = [
      ["us", "std.usOption"],
      ["legal", "std.legalOption"],
      ["metric", "std.metricOption"],
      ["imperial", "std.imperialOption"]
    ];
    sel.innerHTML = "";
    for (var i = 0; i < specs.length; i++) {
      var opt = document.createElement("option");
      opt.value = specs[i][0];
      opt.textContent = t(specs[i][1]);
      sel.appendChild(opt);
    }
    sel.value = STANDARDS[prev] ? prev : "us";
  }

  function rebuildUnitSelects() {
    var std = currentStandard();
    var fromEl = $("from-unit");
    var toEl = $("to-unit");
    if (!fromEl || !toEl) return;

    if (isIngredientMode()) {
      var keys = std.ingredientVolume.concat(["g", "oz"]);
      fillSelect(fromEl, keys, std, fromEl.value, "cup");
      fillSelect(toEl, keys, std, toEl.value, "g");
    } else {
      fillSelect(fromEl, std.volumeOrder, std, fromEl.value, "cup");
      var defaultTo = std.units.floz ? "floz" : "ml";
      fillSelect(toEl, std.volumeOrder, std, toEl.value, defaultTo);
    }
  }

  function rebuildEqGrid() {
    var grid = $("eq-grid");
    if (!grid) return;
    var std = currentStandard();
    var keys;
    if (isIngredientMode()) {
      keys = std.ingredientVolume.concat(["g", "oz"]);
    } else {
      keys = std.volumeOrder;
    }
    grid.innerHTML = "";
    for (var i = 0; i < keys.length; i++) {
      var wrap = document.createElement("div");
      wrap.className = "eq";
      var dt = document.createElement("dt");
      dt.textContent = t((std.units[keys[i]] || WEIGHT_UNITS[keys[i]]).nameKey);
      var dd = document.createElement("dd");
      dd.setAttribute("data-unit", keys[i]);
      dd.textContent = "—";
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      grid.appendChild(wrap);
    }
    grid.classList.toggle("eq-grid-weight", isIngredientMode() || keys.length <= 5);
  }

  function setMode(ingredient) {
    var volBtn = $("mode-volume");
    var ingBtn = $("mode-ingredient");
    if (volBtn) volBtn.setAttribute("aria-pressed", ingredient ? "false" : "true");
    if (ingBtn) ingBtn.setAttribute("aria-pressed", ingredient ? "true" : "false");
    var row = $("ingredient-row");
    if (row) row.hidden = !ingredient;
    var warn = $("weight-warning");
    if (warn) warn.hidden = !ingredient;
    var weightLine = $("result-weight-line");
    if (weightLine) weightLine.hidden = !ingredient;
    try {
      localStorage.setItem(STORAGE_MODE, ingredient ? "ingredient" : "volume");
    } catch (e) {}
    rebuildUnitSelects();
    if (ingredient) {
      var toIng = $("to-unit");
      if (toIng && toIng.value === "floz") toIng.value = "g";
    }
    rebuildEqGrid();
    render();
  }

  function usingNowText(std, ing) {
    var base = t("std.using." + std.id);
    if (isIngredientMode() && ing) {
      var g = gramsPerCurrentCup(ing, std);
      var oz = g / OZ_G;
      var pack = t(ing.packed ? "std.packingPacked" : "std.packingChart");
      var scale = isScaled(ing, std)
        ? t("std.scaled", {
            usG: formatNumber(ing.gramsPerUsCup),
            cupG: formatNumber(g)
          })
        : t("std.unscaled", { cupG: formatNumber(g) });
      if (ing.densityFromWater) {
        scale = t("std.waterPhysics", { cupG: formatNumber(g) });
      }
      return (
        base +
        " " +
        t("std.oneCupOf", {
          name: t("ing." + ing.key),
          g: formatNumber(g),
          oz: formatNumber(oz)
        }) +
        " " +
        pack +
        " " +
        scale
      );
    }
    return base;
  }

  function sourcesText() {
    return t("conv.sources");
  }

  function warningText(ing, std) {
    if (!ing) return "";
    var g = gramsPerCurrentCup(ing, std);
    var oz = g / OZ_G;
    return t("conv.weightWarning", {
      name: t("ing." + ing.key),
      g: formatNumber(g),
      oz: formatNumber(oz)
    });
  }

  function render() {
    var amountEl = $("amount");
    var fromEl = $("from-unit");
    var toEl = $("to-unit");
    var outNum = $("result-num");
    var outMeta = $("result-meta");
    var grid = $("eq-grid");
    if (!amountEl || !fromEl || !toEl || !outNum) return;

    var std = currentStandard();
    var amount = parseAmount(amountEl.value);
    var from = fromEl.value;
    var to = toEl.value;
    var ing = INGREDIENTS[($("ingredient") && $("ingredient").value) || "flour"];
    var ingredientMode = isIngredientMode();

    var using = $("using-now");
    if (using) using.textContent = usingNowText(std, ing);

    var src = $("sources-note");
    if (src) src.textContent = sourcesText();

    var warn = $("weight-warning");
    if (warn && ingredientMode) warn.textContent = warningText(ing, std);

    var hint = $("converter-hint");
    if (hint) {
      hint.innerHTML = ingredientMode ? t("conv.hintIngredient") : t("conv.hintVolume");
    }

    if (!isFinite(amount) || amount < 0) {
      outNum.textContent = "—";
      if (outMeta) {
        outMeta.textContent = amountEl.value.trim()
          ? t("conv.badAmount")
          : t("conv.enterAmount");
      }
      if (grid) {
        var dds = grid.querySelectorAll("[data-unit]");
        for (var i = 0; i < dds.length; i++) dds[i].textContent = "—";
      }
      var wl0 = $("result-weight-line");
      if (wl0) wl0.textContent = "";
      return;
    }

    var result;
    if (ingredientMode) {
      var grams = amountToGrams(amount, from, ing, std);
      result = gramsToUnit(grams, to, ing, std);
    } else {
      result = convertVolume(amount, from, to, std);
    }

    outNum.textContent = formatNumber(result);
    if (outMeta) {
      var ofIng = ingredientMode ? " " + t("conv.of") + " " + t("ing." + ing.key) : "";
      var sys = t("std.short." + std.id);
      outMeta.textContent =
        formatNumber(amount) +
        " " +
        unitName(std, from, amount) +
        ofIng +
        " = " +
        formatNumber(result) +
        " " +
        unitName(std, to, result) +
        " (" +
        sys +
        ")";
    }

    var weightLine = $("result-weight-line");
    if (weightLine && ingredientMode) {
      var gCup = gramsPerCurrentCup(ing, std);
      var ozCup = gCup / OZ_G;
      weightLine.hidden = false;
      weightLine.textContent = t("conv.cupEquals", {
        name: t("ing." + ing.key),
        g: formatNumber(gCup),
        oz: formatNumber(ozCup)
      });
    } else if (weightLine) {
      weightLine.hidden = true;
      weightLine.textContent = "";
    }

    if (grid) {
      var keys;
      var values = {};
      if (ingredientMode) {
        keys = std.ingredientVolume.concat(["g", "oz"]);
        var gAll = amountToGrams(amount, from, ing, std);
        for (var k = 0; k < keys.length; k++) {
          values[keys[k]] = gramsToUnit(gAll, keys[k], ing, std);
        }
      } else {
        keys = std.volumeOrder;
        var mlAll = toMl(amount, from, std);
        for (var v = 0; v < keys.length; v++) {
          values[keys[v]] = fromMl(mlAll, keys[v], std);
        }
      }
      for (var j = 0; j < keys.length; j++) {
        var u = keys[j];
        var cell = grid.querySelector('[data-unit="' + u + '"]');
        if (cell) cell.textContent = formatNumber(values[u]) + " " + unitAbbr(std, u);
      }
    }
  }

  function swap() {
    var fromEl = $("from-unit");
    var toEl = $("to-unit");
    var amountEl = $("amount");
    if (!fromEl || !toEl) return;
    var std = currentStandard();
    var amount = parseAmount(amountEl && amountEl.value);
    var from = fromEl.value;
    var to = toEl.value;
    var ing = INGREDIENTS[($("ingredient") && $("ingredient").value) || "flour"];
    var converted = NaN;
    if (isFinite(amount)) {
      if (isIngredientMode()) {
        converted = gramsToUnit(amountToGrams(amount, from, ing, std), to, ing, std);
      } else {
        converted = convertVolume(amount, from, to, std);
      }
    }
    fromEl.value = to;
    toEl.value = from;
    if (amountEl && isFinite(converted)) amountEl.value = formatNumber(converted);
    render();
  }

  function readQuery() {
    var q = {};
    var search = window.location.search || "";
    if (search.charAt(0) === "?") search = search.slice(1);
    var parts = search.split("&");
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      var kv = parts[i].split("=");
      q[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
    }
    return q;
  }

  function initControls() {
    fillIngredientSelect();
    fillStandardSelect();

    var q = readQuery();
    var stdSel = $("cup-standard");
    var stdId = q.std || q.standard;
    if (!stdId) {
      try {
        stdId = localStorage.getItem(STORAGE_STD);
      } catch (e) {
        stdId = null;
      }
    }
    if (stdSel && STANDARDS[stdId]) stdSel.value = stdId;
    else if (stdSel) stdSel.value = "us";

    var mode = q.mode;
    if (!mode) {
      try {
        mode = localStorage.getItem(STORAGE_MODE);
      } catch (e2) {
        mode = null;
      }
    }
    if (q.ingredient && INGREDIENTS[q.ingredient] && $("ingredient")) {
      $("ingredient").value = q.ingredient;
      mode = "ingredient";
    }
    var hash = (window.location.hash || "").replace("#", "");
    if (hash === "ingredient" || hash === "weight") mode = "ingredient";

    rebuildUnitSelects();
    rebuildEqGrid();
    setMode(mode === "ingredient" || mode === "weight");
  }

  function init() {
    var form = $("converter-form");
    if (!form) return;

    initControls();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      render();
    });
    ["amount", "from-unit", "to-unit", "ingredient", "cup-standard"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("input", render);
      el.addEventListener("change", function () {
        if (id === "cup-standard") {
          try {
            localStorage.setItem(STORAGE_STD, el.value);
          } catch (err) {}
          rebuildUnitSelects();
          rebuildEqGrid();
        }
        render();
      });
    });
    var swapBtn = $("swap-units");
    if (swapBtn) swapBtn.addEventListener("click", swap);

    var volBtn = $("mode-volume");
    var ingBtn = $("mode-ingredient");
    if (volBtn) {
      volBtn.addEventListener("click", function () {
        setMode(false);
      });
    }
    if (ingBtn) {
      ingBtn.addEventListener("click", function () {
        setMode(true);
      });
    }

    document.addEventListener("howmany:i18n", function () {
      fillIngredientSelect();
      fillStandardSelect();
      rebuildUnitSelects();
      rebuildEqGrid();
      render();
    });

    render();
  }

  /* Node-free self-check helpers used by the in-page tests if present. */
  window.howmanyConvert = {
    STANDARDS: STANDARDS,
    INGREDIENTS: INGREDIENTS,
    US_CUP_ML: US_CUP_ML,
    OZ_G: OZ_G,
    gramsPerCurrentCup: gramsPerCurrentCup,
    convertVolume: convertVolume,
    amountToGrams: amountToGrams,
    gramsToUnit: gramsToUnit,
    formatNumber: formatNumber,
    parseAmount: parseAmount
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
