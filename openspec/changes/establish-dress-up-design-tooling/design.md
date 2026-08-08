## Context

See `proposal.md` for motivation. Pip is a React component built from plain geometry inside
one `0 0 200 200` SVG. Framer Motion animates the root, ears, current signature-star slot,
and expression effects. Call sites render it at 92, 120, 148, and 190 pixels; the `size`
default of 160 is never passed, so 92 and 190 are the real extremes an item must survive.
The PWA must keep working without a network connection.

The repository treats `.agents/skills` as the canonical Codex surface and mirrors equivalent
behavior under `.claude/skills` for Claude. This change creates guidance and records a
decision; it does not add cosmetic state or alter the mascot component.

## Goals / Non-Goals

**Goals:**

- Make a new cosmetic independently authorable without drawing another complete Pip.
- Keep cosmetics visually coherent and correctly occluded across current mascot states and
  sizes.
- Make source, license, accessibility, and offline constraints part of asset acceptance.
- Compare animation approaches with a repeatable rubric and leave one recorded production
  choice rather than an open-ended list of tools.

**Non-Goals:**

- Design the shop, room, inventory schema, equip rules, pricing, or sync behavior.
- Convert Pip to a data-driven cosmetic renderer in this change.
- Preserve experimental runtime packages or downloaded community art after the spike unless
  the recorded decision explicitly adopts them.

## Decisions

### Keep layered React SVG as the production default

Continue with the installed `framer-motion` package and plain SVG geometry unless the spike
finds a required interaction that cannot be delivered reasonably in that model. The current
component already owns six semantic states, scales from one view box, exposes an accessible
image, and keeps its geometry visible to TypeScript, tests, and code review. Motion supports
SVG attributes, transforms, path drawing, and compatible path morphs without another runtime:
<https://motion.dev/docs/react-svg-animation>.

The default is a decision rule, not a foregone spike result. Rive should win only if skeletal
deformation, designer-owned state machines, or comparable interactive behavior materially
improves the intended cosmetics. dotLottie should win only if packaged timelines, themes, or
state machines materially reduce authoring cost while retaining independent cosmetic
composition. A visual-editor runtime is not itself a benefit if every outfit becomes a new
opaque whole-character file.

### Author one item from stable slots and optional occlusion fragments

Every cosmetic has one stable id and one semantic slot. An item may contain a back and front
fragment when it must pass behind and in front of Pip, but both fragments remain one equipped
item. The render order the authoring contract describes is:

1. ground shadow
2. `back` cosmetics such as capes or ribbon tails
3. headwear back fragments
4. Pip ears and head
5. headwear front fragments
6. Pip expression
7. `face` cosmetics such as glasses
8. `neck` cosmetics such as scarves and medals
9. `pin`, whose default is Pip's signature star
10. foreground effects such as celebration sparkles and sleep marks

This order is conceptual until item 16 introduces a renderer. The skill must not imply that
adding the documentation alone changes `Mascot.tsx`.

All geometry uses the existing `0 0 200 200` coordinate system. The initial named anchors are
`head-top` at `(100, 55)`, `left-ear-base` at `(56, 96)`, `right-ear-base` at `(144, 96)`,
`face-center` at `(100, 116)`, `neck-center` at `(100, 160)`, and `pin` at `(148, 162)`.
The implementation of item 16 may refine names or coordinates only by updating the contract
and every existing cosmetic together.

### Treat the existing palette and geometry as constrained design tokens

The skill records both Pip's base colors from `Mascot.tsx` and the app colors from
`src/index.css`; it does not silently treat their similar creams as interchangeable.
Cosmetics should normally use those colors, 2.5–3 pixel outlines, rounded caps and joins, and
simple shapes that remain legible at Pip's smallest current rendering. A new color or geometry
exception needs a short visual reason in the asset source.

Animation is applied through shared semantic motion such as `sway`, `bounce`, `spin`, and
`pulse`, with transform origins expressed in view-box coordinates. Cosmetics must remain
understandable when static, may not carry essential information only through motion, and must
define or inherit a reduced-motion presentation. Motion's `MotionConfig` and
`useReducedMotion` are the reference behavior:
<https://motion.dev/docs/react-accessibility>.

### Make the skill the contract and keep references shallow

Create `.agents/skills/mascot-design/SKILL.md` as the discoverable entry point, with short
one-level references for the layer/anchor contract, visual rules, and review checklist when
needed. Mirror equivalent behavior and reference content under `.claude/skills/mascot-design`.
The skill guides future asset work; it does not generate runtime art or call an LLM from the
application.

DiceBear's declarative component, variant, palette, and metadata model is a useful reference
for the contract, but its runtime is unnecessary for one fixed mascot:
<https://www.dicebear.com/specification/definition-schema/>. SVG exported by an editor may be
cleaned with development-only SVGO after visual comparison; optimization must preserve ids,
view box, transforms, and animated geometry. SVGO itself does not become an application
dependency: <https://github.com/svg/svgo>.

### Vendor accepted assets and record provenance

No production cosmetic or animation loads from a CDN. Any accepted external source is copied
into the repository so the installed PWA remains offline-capable, and its source URL, author,
license, local modifications, and required attribution are recorded beside the asset or in
the asset registry. Final Pip artwork should be project-authored where practical; outside art
is primarily spike material, structural reference, or prototype room/shop art.

Useful spike sources include the CC BY Rive Responsive Mascots file, which demonstrates
skins and facial states (<https://rive.app/community/files/24673-46114-responsive-mascots/>),
and the Lottie Simple License interactive bunny state machine
(<https://lottiefiles.com/free-animation/interactive-glowy-bunny-wyQymKJMXI>). Kenney asset
pages are the preferred source for CC0 prototype UI art
(<https://www.kenney.nl/support>). License compatibility is checked per downloaded asset;
the existence of an online download is not permission to ship it.

### Use one measurable spike rubric

Each candidate demonstrates or is evaluated against the same representative behavior:

- idle motion and one celebration transition
- three independently switchable cosmetic categories, including one item with occlusion
- app-driven state and palette changes without duplicating the base character
- clear output at 92 and 190 pixels
- a static reduced-motion result and an accessible name outside canvas internals
- a cold offline load with every runtime and asset self-hosted

Record the exact package and asset versions, candidate artifact size, added compressed runtime
cost, required authoring tools, supported composition model, first-paint/test surface, source
diff quality, and browser observations. Rive's published compressed WASM sizes provide a
baseline rather than a substitute for measuring this app
(<https://rive.app/docs/runtimes/runtime-sizes>); dotLottie's published React bundle size and
features provide the equivalent baseline (<https://developers.lottiefiles.com/docs/>).

The final results are appended to this design under a `Spike Results` section during apply.
If SVG remains selected, remove experimental dependencies and disposable candidate assets and
confirm `package.json` and the lockfile contain no Rive or dotLottie runtime. If another
runtime wins, this tooling change records the decision and its measured cost, but a separate
capability proposal owns production integration.

## Risks / Trade-offs

- **Hand-authored SVG becomes repetitive** → Reuse stable anchors, slots, palette tokens,
  motion presets, and a review checklist; never redraw the base mascot per item.
- **A hat or cape cannot fit one flat slot** → Permit back/front fragments under one item id
  while keeping a fixed global render order.
- **The spike favors polished community art over the runtime** → Score integration and
  composition separately from visual polish and use the same representative behaviors.
- **A canvas runtime weakens DOM inspection and source review** → Measure first-paint and
  test hooks explicitly, and count opaque binary authoring as a trade-off.
- **Runtime or community assets break offline use** → Self-host every candidate during the
  offline check; reject any production design that needs an external fetch.
- **External art creates license obligations or visual drift** → Record provenance per asset,
  prefer project-authored final Pip geometry, and use CC0 material for prototypes where
  possible.
- **The skill and Claude mirror drift** → Validate their behavior and reference inventory
  together before completion.

## Migration Plan

1. Write and validate the canonical mascot-design skill and equivalent Claude mirror without
   touching runtime code.
2. Run disposable SVG, Rive, and dotLottie proofs with the common rubric and append measured
   results and the final decision here.
3. Remove unselected runtime packages and candidate assets, then verify application behavior
   and repository quality gates remain unchanged.
4. Mark roadmap item 15 complete. Item 16 may then propose the selected renderer, cosmetics,
   inventory, shop, room, and sync behavior.

Rollback removes the two skill directories and reverts this planning decision. There is no
application data migration or learner-state rollback.

## Spike Results

Run 2026-08-08 against baseline `e5059d5`. Each arm was imported into `App.tsx` and built
with `npm run build`; the numbers are that build's own gzip report, not an estimate. The
disposable arms and both candidate dependencies were removed afterwards, and
`package.json` and `package-lock.json` are byte-identical to the baseline.

### Measured cost

Baseline bundle: **471.58 kB raw / 143.97 kB gzip** JS.

| Arm | JS raw | JS gzip | Δ gzip JS | Separate WASM (gzip) | Total added, gzip |
| --- | --- | --- | --- | --- | --- |
| Hand-authored SVG + Framer Motion | 475.42 kB | 145.10 kB | **+1.13 kB** | none | **+1.13 kB** |
| `@rive-app/react-canvas@4.31.0` | 674.39 kB | 201.34 kB | +57.37 kB | 758 kB | **~815 kB** |
| `@lottiefiles/dotlottie-react@0.19.13` | 631.18 kB | 175.13 kB | +31.16 kB | 495 kB | **~526 kB** |

Both canvas runtimes cost multiples of the entire current application. Rive adds roughly
5.7× the app's total gzipped weight, dotLottie roughly 3.7×, against 0.8% for SVG. For a PWA
that precaches everything for offline use, that weight is downloaded whether or not the
learner ever equips a cosmetic.

### Rubric results

| Criterion | SVG + Framer Motion | Rive | dotLottie |
| --- | --- | --- | --- |
| idle + celebration | yes, per-state variants already in the component | via state machine | via timeline segments |
| three switchable categories | yes, independent props per slot | state-machine inputs inside one file | one file per item |
| occlusion (back/front fragment) | yes, interleaved at render-order steps 3 and 5 | only if baked into the artboard | no runtime composition |
| app-driven palette | yes, colours are props | themes, editor-defined | themes, LottieFiles tooling |
| 92 px and 190 px | yes, one view box | yes, canvas scales | yes, canvas scales |
| accessible name outside canvas internals | native SVG `role="img"` + `aria-label` | canvas element only | canvas element only |
| reduced motion | `useReducedMotion`, already a dependency | manual pause | manual pause |
| offline, self-hosted | nothing to host | **defaults to `unpkg.com`**, needs `RuntimeLoader.setWasmUrl` | **defaults to `cdn.jsdelivr.net`, then `unpkg.com`**, needs `setWasmUrl` |
| testable in this suite | yes | **no** | **no** |
| source review | TypeScript geometry, diffable | opaque binary `.riv` | JSON, diffable but machine-shaped |
| authoring tool | any editor | **Rive editor, account required** | editor or hand-written JSON |

Three results decided this, and none of them is bundle size alone.

**Neither canvas runtime is testable here.** `vite.config.ts:49` pins `environment: 'node'`
and component tests assert on `renderToStaticMarkup` output — the deliberate boundary
described in `docs/testing.md:22`. A cosmetic rendered into a `<canvas>` produces no markup
to assert on, so every item would ship with no test at all. SVG geometry is a string in that
environment and can be asserted on directly.

**Both canvas runtimes break offline by default.** This was measured, not assumed:
`@rive-app/canvas` sets `RuntimeLoader.wasmURL` to
`https://unpkg.com/@rive-app/canvas@<version>/rive.wasm`, and `@lottiefiles/dotlottie-web`
falls back through `cdn.jsdelivr.net` and then `unpkg.com`. Both can be pointed at a
self-hosted copy, but the default for an offline-first PWA is a silent network dependency
that only fails on the device of a learner with no connection.

**Neither runtime composes cosmetics the way the slot contract needs.** Rive switches
appearance through state-machine inputs inside a single artboard, so every cosmetic
combination lives in one binary file that one person edits in one GUI. dotLottie files are
self-contained timelines with no runtime notion of inserting a layer into another file's
paint order — the back/front occlusion case has no expression at all. The SVG arm did the
occlusion case by interleaving fragments at steps 3 and 5, which is the whole point of the
contract.

### Stated limitation

The Rive arm measured the runtime, not a hand-authored artboard. Producing a `.riv` requires
the Rive editor behind an account, and community `.riv` and `.lottie` downloads are
login-gated, so no third-party asset was downloaded or vendored. That gap does not weaken
the conclusion — it *is* one of the findings. An authoring path that cannot be exercised
from a shell, produces a binary no reviewer can read in a diff, and requires an account to
open is a real cost for a single-maintainer repository, and it is independent of how good
Rive's output looks.

The dotLottie arm did not have this problem: a valid 1.6 kB Lottie was written by hand and
played, confirming the format is authorable without the vendor's tooling.

### Decision

**Keep hand-authored layered SVG with the installed `framer-motion`.** The pre-registered
rule was that Rive wins only on skeletal deformation or designer-owned state machines
materially improving the intended cosmetics, and dotLottie only on packaged timelines
materially reducing authoring cost *while retaining independent composition*. Neither
threshold was met, and both fail the harder constraints — composition, testability, and
offline-by-default — that were not about cost at all.

No Rive or dotLottie dependency is adopted. Item 16 builds its cosmetic renderer on the slot
and render-order contract in `.agents/skills/mascot-design/`, with no new animation runtime
and no separate capability proposal needed for one.
