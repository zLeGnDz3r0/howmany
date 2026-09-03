# howmany

US kitchen volume lookups, plus ingredient weight. Static HTML, no build step, no tracking.

Works as files (`file://`) or from any static server. All links are relative.

```bash
# files
open index.html

# or a local server from this folder
python3 -m http.server 8080
```

## What it is

- Bidirectional **liquid** converter: cups, fl oz, tbsp, tsp, pints, quarts, gallons, mL
- **Ingredient weight** mode: pick an ingredient, convert among cups / tbsp / tsp / fl oz (volume of that ingredient) and grams / ounces by weight
- Cup-standard (assumption) control: US customary, US legal 240 mL, metric 250 mL, UK imperial
- Lookup pages for the usual "how many X in a Y" queries, plus DIY / distance / cooling / calendar / world tools
- Languages: English (default), Spanish, French, Portuguese, German — header dropdown (SVG flag + code), localStorage, `?lang=`
- **Cups around the world** with a no-backend country comparator (US vs Spain by default)

## Cup standards (do not mix)

Default is **US customary**. The converter shows a one-line "using ..." note.

| Standard | 1 cup | Also |
| --- | --- | --- |
| US customary (default) | 236.588 mL = 8 US fl oz | tbsp = 1/2 US fl oz; pint = 2 cups. From the US gallon (231 in3). |
| US legal / nutrition label | 240 mL | 21 CFR 101.9(b)(5)(viii): tsp 5 mL, tbsp 15 mL, fl oz 30 mL. Not the kitchen cup. |
| Metric cup (AU/NZ/CA recipes) | 250 mL | tsp 5 mL, tbsp 15 mL. Australian tbsp is 20 mL (AS 1325) — not used here. |
| UK imperial | 284.131 mL | Historical kitchen cup = 10 imperial fl oz (1/2 pint). 1 imp fl oz = 28.4130625 mL; 20 fl oz in a pint (UK Units of Measurement Regulations 1995). Tbsp/tsp = 1/2 and 1/6 imperial fl oz (kitchen convention, labeled). |

Lookup pages stay **US customary** answers (8 fl oz in a cup, 16 tbsp, ...). Use the converter to switch systems.

## Ingredient grams (sourced only)

King Arthur Baking Ingredient Weight Chart (kingarthurbaking.com/learn/ingredient-weight-chart, accessed 30 Aug 2026), grams **per US customary cup** unless noted. Water uses physics, not their rounded 227 g.

| Ingredient | g / US cup | Notes |
| --- | --- | --- |
| All-purpose flour | 120 | KA chart; they recommend a scale. No scooped extra. |
| Granulated sugar | 198 | |
| Butter | 226 | 113 g per 1/2 cup / 1 stick x 2 |
| Brown sugar, packed | 213 | Packed, as the chart says |
| Powdered sugar, unsifted | 113 | Confectioners sugar |
| Old-fashioned / rolled oats | 89 | "Oats (old-fashioned or quick-cooking)" |
| Unsweetened cocoa | 84 | 42 g per 1/2 cup |
| Honey | 336 | 21 g per tbsp x 16 US tbsp |
| Milk, fresh | 227 | |
| Olive oil | 200 | 50 g per 1/4 cup |
| Water | 236.588 | 1 mL approx 1 g near 4 C |

Other cup sizes **scale King Arthur US-cup weight by volume** and say so. That is not a published metric-cup weight.

Packing: KA chart as published. Brown sugar packed. No invented scoop-vs-spoon toggle.

1 avoirdupois ounce = 28.349523125 g. 1 US cup of AP flour = 120 g approx 4.23 oz by weight, **not 8 oz**.

## i18n

`i18n.js` holds EN/ES/FR/PT/DE dictionaries. Default English is in the HTML (works without JS). The header language control is a dropdown (inline SVG flag + EN/ES/FR/PT/DE). It sets `document.documentElement.lang`, rewrites chrome / titles / H1s / ledes / FAQ JSON-LD / warnings, and stores `howmany-lang` in localStorage. `?lang=es` works on file://. EN uses the US flag (site default is US customary English).

Portuguese uses European terms (chavena). Numbers from sources are not translated.

## Files

- `index.html` — converter (volume + ingredient) + directory
- `styles.css` — shared styles
- `converter.js` — conversion math
- `i18n.js` — dictionaries + language switcher
- `how-many-ounces-in-a-cup.html` — **8 fl oz**
- `how-many-ounces-in-a-cup-of-flour.html` — **120 g / ~4 1/4 oz wt** (King Arthur)
- `fluid-ounces-vs-ounces.html` — fl oz != oz
- `how-many-ounces-in-a-gallon.html` — 128 fl oz
- `how-many-tablespoons-in-a-cup.html` — 16 tbsp
- `how-many-teaspoons-in-a-tablespoon.html` — 3 tsp
- `how-many-cups-in-a-quart.html` — 4 cups
- `how-many-cups-in-a-gallon.html` — 16 cups
- `how-many-quarts-in-a-gallon.html` — 4 quarts
- `how-many-grams-in-an-ounce.html` — 28.3495 g (weight)
- `cups-around-the-world.html` — country / cup conventions + comparator
- `world.js` — comparator UI
- `lookup-util.js` — shared parse/format helpers for lookup calculators
- `how-many-bags-of-concrete.html` — slab/footing → bags (`concrete.js`; QUIKRETE yields)
- `how-many-steps-in-a-mile.html` — steps ↔ miles (`steps.js`; ACE 2,000 labeled average)
- `how-many-btu-to-cool-a-room.html` — sq ft → BTU (`btu.js`; ENERGY STAR chart)
- `how-many-gallons-of-paint.html` — walls → gallons (`paint.js`; Behr 250–400 sq ft/gal)
- `how-many-ounces-in-a-pound.html` — **16 oz** avoirdupois (NIST; not fluid ounces)
- `how-many-feet-in-a-mile.html` — **5,280 ft** statute mile (NIST)
- `how-many-square-feet-in-an-acre.html` — **43,560 sq ft** (NIST)
- `how-many-teaspoons-in-a-cup.html` — **48 tsp**
- `how-many-cups-in-a-pint.html` — **2 cups**
- `how-many-ounces-in-a-pint.html` — **16 fl oz**
- `how-many-ounces-in-a-quart.html` — **32 fl oz**
- `how-many-pints-in-a-gallon.html` — **8 pints**
- `factor.js` — amount × sourced factor for pound / mile / acre / seconds pages
- `how-many-liters-in-a-gallon.html` — **3.785411784 L** US liquid (NIST 231 in³); imperial **4.54609 L** (UK); labeled switch (`gallon.js`)
- `how-many-weeks-in-a-year.html` — **52 weeks + leftover days** (365÷7 remainder 1; 366÷7 remainder 2); ISO weeks 52 or 53
- `how-many-days-in-a-year.html` — **365 / 366** Gregorian (USNO leap rule); not a sidereal year
- `how-many-seconds-in-a-day.html` — **86,400** SI seconds (24×60×60); leap seconds cited from IERS/BIPM only
- `how-many-countries-are-there.html` — **193** UN member states (UN list; South Sudan 14 July 2011)
- `how-many-people-are-in-the-world.html` — **8.2 billion** mid-year 2024 (UN WPP 2024); dated estimate, not a live counter
- `year-kind.js` — common vs leap toggle for weeks / days pages

## Product rules

No fake stats, affiliate links, cookie banners, or newsletter popups. No invented gram densities, bag yields, stride formulas, BTU multipliers, paint coverage, country totals, or live population counters. If a number cannot be sourced, it is omitted (no lumens page; no invented EU 25 kg concrete yield).
