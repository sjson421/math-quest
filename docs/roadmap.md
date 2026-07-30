# Math Quest — Road to v1.0

What is left, in what order, and what blocks what.

**Status: 6 of 201 skills are playable.** All six are in Units 1–2. No capability beyond
the number keypad is built. This line is the only progress number in the repo's
documentation — the manifest and `npm test` are the authority, and everything below is
scope rather than status.

To re-derive it rather than trusting this file:

```ts
import { skillState } from './src/curriculum/index'
import { stages } from './src/curriculum/manifest/index'
// count skillState(id) === 'implemented' across stages
```

---

## How to read this

**A skill ships by gaining a generator, never by being added to the manifest.** All 201 are
already declared in `src/curriculum/manifest/`; each resolves as `planned` until a generator
is registered for its id *and* every capability its stage needs is built. Only `implemented`
skills reach the learner, and planned ones are transparent to unlocking, so nobody is held
behind our build order.

**Capabilities gate whole stages.** `AVAILABLE_CAPABILITIES` in
`src/curriculum/manifest/resolve.ts` is empty today. Adding a capability there is a one-line
edit that flips its stage on — which is why capability work is listed as a precondition, not
as part of the content milestone it unblocks.

**Sizing is relative.** S / M / L / XL against each other, not against a calendar. Generator
throughput is unknown until a full unit has been written, so any date here would be fiction.

Two tracks run in parallel. Content (Track A) and experience (Track B) are mostly
independent; a single ordered list would imply blocking that does not exist. Dependencies
that *do* exist are named on each item.

---

## Track A · Content

Order follows the [build order](curriculum.md#build-order) in the curriculum document.
Skill counts are per stage in total; the Status line above says how many are built.

| # | Scope | Size | Preconditions |
|---|---|---|---|
| **A1** | Stage A · Unit 0 (8) + the rest of Stage B · Units 1–5 (44 total) | L | B0 |
| **A2** | Stage C · Unit 6 (9) | S | number-line input, for 6.1 only |
| **A3** | Stage D · Units 7–11 (50) | XL | KaTeX, fraction input, diagram |
| **A4** | Stage E · Units 12–15 (34) | L | expression input |
| **A5** | Stage F · Units 16–19 (28) | L | coordinate-plane input |
| **A6** | Stage G · Units 20–21 (22) | M | diagram, chart |
| **A7** | Stage H · Unit 22 (6) | S | timed mode, score estimator |

**Exit criteria, every content milestone:** every skill in scope resolves as `implemented`;
`npm test` green including the content contract over ~1000 sampled problems per skill; the
document's ✅ markers updated to match, which the cross-check enforces.

**A1 — the foundation.** The largest single block of playable-today work: nothing here needs
infrastructure that does not exist. Unit 3 (multiplication, 14 skills) is deliberately the
slowest unit in the course; Unit 5 is only 3 skills. Word problems close Units 1–4 and need
B0's phrasing bank.

*One deviation to note:* the curriculum document's build order opens at "finish Stage B" and
never places Stage A, which was an oversight — Unit 0 is where a learner who needs place
value starts. A1 covers both, Stage A first.

**A2 — the gate to algebra.** Eight of its nine skills are keypad-answerable; only
`negatives-numberline` (6.1) wants the number line. Stage C therefore declares no stage-wide
capability requirement on purpose — marking one would hold eight playable skills behind an
input mode. Build the eight, or build the number line first and take all nine.

**A3 — the biggest.** Fractions cannot render as plain text, so all three capabilities land
before any of the 50 skills do. Unit 7 is conceptual only: not one problem asks for a
calculation.

**A7** closes the course and is the only place time pressure appears anywhere in the app.

### Capability preconditions

First-needed mapping is from the [capability table](curriculum.md#new-capabilities-required-by-stage).
Each is its own piece of work, sized independently of the content it unblocks.

| Capability | First needed | Size | Notes |
|---|---|---|---|
| Number-line input | C · 6.1 | S | Tap to place a value |
| KaTeX rendering | D · Unit 7 | M | Fractions cannot render as plain text |
| Diagram rendering | D · 7.2 | M | Shaded shapes for fraction meaning |
| Fraction keypad mode | D · Unit 8 | S | `allowFraction` already stubbed in the keypad |
| Expression input | E · Unit 13 | M | Variables on the keypad |
| Coordinate-plane input | F · 16.1 | L | Tap to plot a point |
| Chart rendering | G · 21.5 | M | Bar, line, scatter |
| Timed mode + score estimator | H | M | Includes the GED score model |

---

## Track B · Experience

### B0 · Generator engine and phrasing bank — L

The highest-leverage item in this document: all 195 remaining generators ride on it.

- Shared helpers for the shapes that repeat — column layouts, digit extraction, band
  selection, misconception prediction patterns — extracted from the six in
  `src/curriculum/unit-01-add-sub.ts`.
- A **templated phrasing bank** for word problems (fixed sentence frames, generated
  numbers). These close Units 1–4 and 8–11 and are the weakest fit for pure procedural
  generation.
- Per-unit file conventions and a test harness that a new unit joins by existing.

**Exit:** writing a unit is mostly arithmetic and misconception authoring, not scaffolding.

### B1 · Lesson-loop fidelity — M

Commitments already written down as fact in [anti-discouragement mechanics](curriculum.md#anti-discouragement-mechanics)
and unbuilt in `src/`:

- **`quick` skills end at 5 correct.** The manifest carries the flag for 19 skills;
  `Lesson.tsx` hardcodes `TARGET_CORRECT = 10`. Every hard unit opens with one of these.
- **Warm-up problem** one difficulty band below current — a guaranteed early win.
- **Silent recovery:** 3 wrong in a row drops difficulty for the rest of the lesson, never
  surfaced to the learner.
- **Max 2 unlocks at once**, since more open paths cause choice paralysis.
- **Stage checkpoints** — a celebration at each stage boundary, not just per skill.

### B2 · Manifest-driven unlock — S, with a migration note

`isUnlocked()` in `src/store/progress.ts` still walks the generators' hand-written
`prerequisites`. Move it onto `resolveUnlockPrerequisites()` so the manifest is the runtime
authority as well as the design one.

**This changes behaviour.** The derived chain routes Unit 2 behind Unit 1's tail, so a
learner holding `add-facts` but not `add-3digit` can see `sub-facts` re-lock. Ship with a
reconciliation that never reduces an earned mastery, and verify against a stored record from
before the change. Do this before A1 lands, while six skills are cheap to reason about.

### B3 · Skill-tree navigation — L

`Home.tsx` renders a flat list of one unit's skills. Twenty-three units need stage → unit →
skill navigation, per-unit progress, and locked/planned states that stay hidden rather than
teasing. Needed once A1 makes more than one unit real; not before.

### B4a · Dress-up design tooling — M

Settle how cosmetics are authored **before** any exist, because the answer determines what
every later asset looks like.

- `.claude/skills/mascot-design/` — Pip's layer contract, palette, and geometry conventions,
  so outfits and room props are composable data. `src/components/Mascot.tsx` is layered SVG
  (ears/head, face, accessory) for exactly this reason.
- A spike comparing an animation runtime (Rive, Lottie) against hand-authored SVG plus the
  framer-motion already in the app. Decide on bundle cost, authoring loop, and whether
  non-code editing matters. Record the decision either way.

### B4b · Outfits, shop, and room — L

Coins accumulate today with nothing to spend them on; this is the sink they were always for.

- Cosmetic layers on Pip, and a decoratable room.
- A shop screen priced against real earn rates, and inventory on the progress record —
  which must survive the sync round trip, not just local storage.
- A wardrobe/room editor that is pleasant to poke at, since that is the point.

### B5 · Skip-ahead — L

The full flow from [skipping ahead](curriculum.md#skipping-ahead): check-first (8 problems
sampled at difficulty 3, ≥7 correct) and just-skip, both optional. Sets every skill in the
block to mastery 3, records `source: 'tested-out' | 'self-assessed'` on `SkillProgress`,
stays reversible, and carries the accuracy safety net that quietly offers to reopen a unit.
The "enters spaced repetition at low strength" half needs B6.

### B6 · Review and spaced repetition — L

Review lessons, per-skill strength, and the stats surface. Also what makes B5 safe.

### B7 · Streak reminders — S

Worth an honest caveat: iOS PWA notification support is narrow and may not reach an
installed home-screen app reliably. May reduce to in-app nudges, which is an acceptable
outcome.

---

## Recommended interleaving

Not a hard sequence — a reading of the two tracks that keeps each piece of work cheap:

1. **B0** — engine before bulk content. Every generator after this is faster.
2. **B2** — while six skills make the unlock change trivial to verify.
3. **A1** — the foundation, and the first real test of B0's throughput.
4. **B1** — the loop promises, once there are `quick` skills to honour.
5. **B3** — navigation, once there is more than one unit to navigate.
6. **B4a** — design tooling, before art exists to be redone.
7. **A2** + number-line input — the gate to algebra.
8. **B4b** — the coins sink, once the app is worth dressing up for.
9. **A3** onward, each behind its capabilities; **B5**/**B6** whenever the review model is
   worth building; **B7** last.

---

## Done, for v1.0

- 201 of 201 skills `implemented`, all 8 capabilities built.
- Track B complete: the lesson loop honours every commitment in `docs/curriculum.md`, the
  tree navigates 23 units, dress-up spends coins, skips are safe, review works.
- The content contract passes across every generator, and the manifest, the document, and
  the registry still agree.

## Out of scope here

Launch work is deliberately excluded and needs its own plan: deploy pipeline, iPhone install
validation on a real device, performance and bundle budget, an accessibility pass, and a
beta with an actual learner. Listed so its absence reads as a decision.

## Working conventions

- Each milestone becomes an OpenSpec change (`/openspec-propose`), and ships through
  `/openspec-apply-change`.
- `docs/curriculum.md` stays the content authority; `src/curriculum/manifest/` is its
  machine-readable twin, and the two cross-check in the test suite.
- `src/lib/content-rules.ts` gates every new generator — at most 4 solution steps, 12 words
  each, one-sentence hints, and two distinct predicted misconceptions on any wall skill.
