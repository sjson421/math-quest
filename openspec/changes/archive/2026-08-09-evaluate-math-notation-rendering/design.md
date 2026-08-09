## Context

See `proposal.md` for motivation. Math Quest currently has three exhaustive `Display` arms
and renders component tests with `renderToStaticMarkup` in a node environment. Its service
worker precaches JavaScript, CSS, and every emitted WOFF2 file, so a notation dependency's
font set is part of the cost even when a learner has not reached Stage D.

The selected baseline is `f6789a931e1f7dd5ad254fb3463475300d7bc048`; every bundle delta
and byte-for-byte cleanup comparison is measured against that exact commit.

The curriculum requires more than one fraction glyph: Stage D needs stacked and mixed
fractions, Stage E needs superscripts, negative exponents, radicals, and fractions inside
equations, Stage F reaches the slope and quadratic formulas, and Stage G uses formulas with
fractions, powers, roots, and π. Problems are generated on the learner's device, so a
production library renderer cannot be moved entirely to a build-time or server-only step.

This increment records a decision only. Item 17b owns the production math `Display` arm,
renderer component, capability flags, and durable tests.

## Goals / Non-Goals

**Goals:**

- Compare the smallest credible KaTeX integration with the smallest credible structured
  React/CSS renderer under one fixed notation and verification rubric.
- Measure the application and precache delta produced by the real Vite/PWA build, including
  font files rather than quoting package metadata.
- Make the production choice from requirement coverage, accessibility, testability, offline
  behavior, layout, reviewability, and weight in that order.
- Leave a sufficiently specific record that item 17b can implement the chosen path without
  reopening the library decision.

**Non-Goals:**

- Designing the final `Display` payload or generator-facing notation API.
- Treating disposable spike code as the production renderer.
- Optimizing or subsetting KaTeX beyond the documented npm CSS import; a custom KaTeX build
  would add a maintenance path that the initial production integration would not use.
- Testing every future formula. The rubric covers the distinct structures the curriculum
  names, including their hardest nesting case.

## Decisions

### Use one representative, recursive notation rubric

Both arms render the same named fixtures at the same surrounding font sizes:

1. `3/4` as a stacked fraction
2. `2 3/5` as a mixed number
3. `1/2 = 2/4` as an equality of fractions
4. `3⁴` and `2⁻³` as positive and negative superscripts
5. `√144` and `√(x² + y²)` as simple and compound radicals
6. the quadratic formula, including a fraction around a signed radical expression
7. `A = πr²` and `A = 1/2 bh` as representative geometry formulas

Each fixture has an authored spoken label such as “three fourths” or “x equals negative b,
plus or minus the square root of b squared minus four a c, all over two a.” The visible
markup is hidden from the accessibility tree beneath one `role="math"` owner carrying that
label, preventing numerator and denominator text from being read as unrelated numbers.

The quadratic formula is the decisive nesting fixture: an arm that handles isolated
fractions and superscripts but needs formula-specific markup for their composition has not
covered the curriculum's notation surface.

Alternatives rejected: Unicode fraction characters cover only a few fixed values; slash
fractions fail the roadmap's stacked-fraction requirement; MathJax is a third library arm
the selected roadmap increment does not call for.

### Measure disposable arms inside the production build

Record a clean baseline build at the selected SHA. For each arm, add a disposable page that
is reachable from the application entry so Vite cannot tree-shake it, then collect:

- emitted JavaScript raw and gzip totals
- emitted CSS raw and gzip totals
- every emitted WOFF2 file and its byte size
- the Workbox precache entry count and byte total
- static-markup output and whether the authored accessible label is singular
- a 375px browser screenshot covering every fixture without clipping or horizontal scroll
- source lines and concepts needed to express the fixture set

Use the package version resolved at spike time and record it exactly. Import KaTeX directly,
without a React wrapper or auto-render extension, together with its packaged CSS. A CDN is
not an arm: all runtime and font assets must be emitted locally for offline use.

The React/CSS arm receives a small structured notation tree rather than parsing TeX. This is
the strongest hand-authored alternative because generators can construct typed structure
directly, but it must expose every general primitive it needs; formula-specific tags or CSS
selectors count against it.

### Pre-register the selection rule

Both arms must first pass the hard gates: node-side static rendering, one accessible name,
fully local assets, and an unclipped 375px fixture page.

Prefer the hand-authored arm only if a small closed set of general primitives covers every
fixture without formula-specific layout, browser-only measurement, or a parser. Prefer
KaTeX if the hand-authored arm grows a generalized typesetting grammar, needs exceptions for
nested formulas, or produces materially weaker layout or accessibility. Bundle and precache
weight then decide whether KaTeX's broader typesetting surface is proportionate to the
complexity it removes; the recorded result must state that trade rather than declaring a
winner from size alone.

If KaTeX wins, item 17b retains the existing `katex` capability name. If the hand-authored
arm wins, item 17b renames the manifest capability to `math-notation`; retaining a library
name for infrastructure that deliberately rejected that library would make four stages'
requirements misleading.

### Keep only the decision

Append exact measurements and the final choice under `## Spike Results` in this design and
summarize the same decision under roadmap increment 17a. Remove the disposable page, both
prototype renderers, fixtures, tests, and any installed package before the increment is
declared complete. Even if KaTeX wins, production adoption belongs to 17b, so `package.json`
and the lockfile return byte-for-byte to the baseline.

The item 17 checkbox remains open because 17b has not shipped. `AVAILABLE_CAPABILITIES`
remains unchanged.

## Risks / Trade-offs

- **The fixture set flatters one arm** → Include the curriculum's distinct structures and
  its deepest named composition, not only Unit 7 fractions.
- **Bundle output hides font cost** → Inventory WOFF2 assets and Workbox precache bytes
  separately from Vite's JavaScript/CSS gzip report.
- **A disposable arm is tree-shaken** → Make its page reachable from the real application
  entry and verify its unique markup in the built output.
- **The CSS arm becomes a disguised typesetter** → Count its recursive primitives,
  special cases, and formula-specific rules in the result alongside bytes.
- **KaTeX accessibility is assumed from its defaults** → Test the repository's explicit
  single-label wrapper in static markup and inspect it in the browser.
- **Spike residue leaks into production** → Compare source, dependency files, and built
  behavior with the clean baseline before closing the change.

## Migration Plan

1. Record the clean baseline bundle and precache inventory.
2. Build, test, measure, and visually inspect the structured React/CSS arm.
3. Build, test, measure, and visually inspect the directly imported KaTeX arm.
4. Apply the pre-registered selection rule and record the result here and in the roadmap.
5. Remove all disposable code and dependencies, then run the repository and browser gates.

Rollback removes the active change and the roadmap decision. No learner-facing code, stored
progress, manifest state, or deployed capability changes in this increment.

## Spike Results

Run 2026-08-09 against baseline `f6789a9`. Raw bytes come from emitted files; gzip bytes
use `gzip -9 -n` so filenames and timestamps do not affect comparisons. The PWA figure is
the Workbox build report and includes every asset the service worker installs up front.

### Baseline

| Asset class | Raw | Gzip | Files |
| --- | ---: | ---: | ---: |
| Application JavaScript | 482,192 B | 145,070 B | 1 |
| CSS | 26,953 B | 5,849 B | 1 |
| WOFF2 fonts | 0 B | already compressed | 0 |
| Workbox precache | 552.97 KiB | emitted transfer sizes vary | 15 entries |

The baseline production build completed successfully with Vite 8.1.5 and PWA plugin 1.3.0.
Arm measurements, rubric results, the decision, limitations, and the capability-name
consequence follow as their tasks complete.

### Structured React/CSS arm

The arm used five recursive node kinds (`text`, `row`, `fraction`, `superscript`, and
`root`), 67 lines of React rendering, and 93 lines of general CSS beyond the shared fixture
data. It needed no parser and no formula-specific selector. Its node test found exactly ten
`math` roles, ten hidden visual subtrees, and one authored label for each fixture.

Scripted Chromium at 375 × 812 found every fixture once by accessible role and name and
reported no page, card, or math-expression overflow. The inspected full-fixture screenshot
was aligned and legible: fraction bars, mixed numbers, scripts, radical bars, the nested
quadratic formula, and both geometry expressions all remained distinct. The long formula
required lowering the general fluid type floor from 1.4rem/8vw to 1.1rem/6vw; no
fixture-specific rule was added.

The visible limitation is structural rather than a failure in these examples: the radical
uses a text `√` beside a bordered radicand, so its glyph cannot stretch with a taller nested
radicand. Script placement, fraction spacing, and operator spacing are likewise owned by
local CSS now and would become Math Quest's maintenance responsibility.

| Structured asset class | Raw | Gzip | Delta from baseline |
| --- | ---: | ---: | ---: |
| Application JavaScript | 485,356 B | 146,039 B | +3,164 B raw / +969 B gzip |
| CSS | 28,157 B | 6,218 B | +1,204 B raw / +369 B gzip |
| WOFF2 fonts | 0 B | already compressed | no change |
| Workbox precache | 557.24 KiB | emitted transfer sizes vary | +4.27 KiB, 15 entries |

The arm added 1,338 gzip bytes across application JavaScript and CSS, plus no font files.

### KaTeX arm

The measured package was exactly `katex@0.18.3`, imported directly with
`katex/dist/katex.min.css`; no React wrapper or auto-render extension was present. The
fixture renderer was 31 React lines plus the same 41 lines of shared page/card layout CSS.
KaTeX consumed the shared TeX strings and needed no notation layout rules in application
source. The unchanged node test passed with one authored wrapper label per fixture; KaTeX's
own additional hidden spans stayed underneath that hidden visual subtree.

Scripted Chromium at 375 × 812 found all ten expressions once by accessible role and name,
found ten KaTeX roots, made no request outside localhost, and reported no page, card, or
expression overflow. The inspected screenshot was consistently aligned and visibly more
polished than the custom arm: radical glyphs stretched to their radicands, script and
fraction metrics were balanced, and the nested quadratic formula remained compact without
an arm-specific size adjustment.

The trade-off beyond bytes is that TeX strings are not structurally checked by TypeScript,
and the explicit spoken label can drift from its visible expression unless item 17b keeps
both under one tested owner. With `throwOnError` and strict mode enabled, malformed or
unsupported notation fails loudly instead of rendering a red learner-facing fallback.

| KaTeX asset class | Raw | Gzip | Delta from baseline |
| --- | ---: | ---: | ---: |
| Application JavaScript | 743,906 B | 222,058 B | +261,714 B raw / +76,988 B gzip |
| CSS | 57,214 B | 13,719 B | +30,261 B raw / +7,870 B gzip |
| Emitted WOFF2 fonts | 256,168 B | already compressed | +19 files / +256,168 B |
| Workbox precache | 1088.27 KiB | emitted transfer sizes vary | +535.30 KiB, +19 entries |

The package also made Vite emit 20 WOFF files (303,116 B) and 20 TTF files (513,664 B)
as legacy CSS fallbacks. They are deployed but excluded by the PWA's precache glob; modern
Safari selects WOFF2. The twentieth KaTeX WOFF2, Size3, is small enough that Vite inlined it
in CSS, so it is included in the CSS and precache totals rather than the WOFF2 file row.

KaTeX added 84,858 gzip bytes across application JavaScript and CSS, 63 times the custom
arm's 1,338 B, before its 256,168 B of separate precached WOFF2 files. The total precache
grew 96.8%, and the application JavaScript crossed Vite's 500 kB chunk warning threshold.

### Decision

**Select the structured React/CSS renderer. Rename the `katex` capability to
`math-notation` in item 17b.**

Both arms passed node rendering, singular accessible naming, local-only loading, and the
375px no-overflow visual gate. KaTeX was visibly more polished and removes responsibility
for low-level typesetting, especially stretchable radicals and balanced TeX metrics. That
advantage did not meet the pre-registered selection threshold: the custom arm covered the
complete curriculum-derived fixture set with five general recursive primitives, no parser,
and no formula-specific layout. Its deepest case was the nested quadratic formula, not an
isolated demo fraction.

The cost difference is disproportionate for that closed surface. Structured markup added
1,338 gzip bytes and 4.27 KiB of precache; KaTeX added 84,858 gzip bytes, 256,168 B of
separate precached WOFF2 fonts, and 535.30 KiB of precache overall. It also emitted 816,780 B
of non-precached legacy font fallbacks and pushed the main JavaScript chunk past Vite's
warning threshold. The broader TeX grammar would be downloaded before the learner reaches
fractions and is not required by any named Stage D–G skill.

Rejected alternative: `katex@0.18.3`. It remains a sound fallback if later implemented
content disproves the closed primitive set, but that would be a new measured decision rather
than an assumption folded into 17b.

The accepted limitation is explicit: Math Quest owns spacing, scripts, fraction bars, and
radical construction. Item 17b must preserve the structured owner, keep the authored spoken
label beside its notation data, and test the representative nesting cases. It must also
rename `Capability` and the four stage requirements from `katex` to `math-notation`; keeping
the library name after rejecting the library would misstate the manifest's dependency.

### Verification

- Strict OpenSpec validation passed with all 13 apply tasks checked.
- `npm test` passed 49 files and 1,299 tests.
- `npm run build` passed after cleanup and returned exactly to the baseline application
  assets and Workbox report: 482,192 B JavaScript, 26,953 B CSS, no emitted WOFF2 files,
  and 15 precache entries totaling 552.97 KiB.
- `npm run lint` exited successfully with only the three documented
  `react(only-export-components)` warnings in `src/components/Settings.tsx`.
- The cleaned real app passed a final scripted Chromium check at 375 × 812: the “Numbers &
  Place Value” screen exposed singular named Settings and shop controls, had no horizontal
  page, root, or primary-element overflow, and the inspected screenshot showed Pip's room,
  goal bar, heading, and skill cards aligned without collisions or truncation. The temporary
  server was stopped and its port confirmed unreachable.
