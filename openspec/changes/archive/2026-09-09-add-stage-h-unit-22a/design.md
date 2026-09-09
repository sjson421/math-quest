## Context

See proposal.md for scope and motivation. The baseline is
`5bb1374cc702aac380dcaaefab0f202016c75510`.

The standard session already generates unseen slots lazily in `materializeCurrent`
(`src/lib/lesson.ts:160`) and retains each missed problem object in `requeueMiss` (`:215`).
In `Lesson.tsx`, attempts use `slot.source.skill`
(lines 316, 374–376), completion uses `mode.skill.id` (398), and intros use seed 1 at
difficulty 1 (179, 260). These existing owners can support Unit 22 without a new lesson mode.

Geometry references already contain notation and accessible labels, but pair order does not
identify the correct formula. Pythagorean selection also depends on `missingSide`
(`geometry-diagram.ts:109–124,495–612`). Geometry verification currently requires numeric
answers, and `ProblemView` appends a numeric frame to geometry-choice displays. Both contracts
need an explicit, narrow extension for this content.

## Goals / Non-Goals

**Goals:** Reuse existing problem displays, formula declarations, seeded draws, lesson behavior
and intro behavior. Preserve independent answer checks and existing numeric geometry behavior.

**Non-Goals:** New rendering infrastructure, a calculator emulator, a new lesson mode, source
mastery updates from preparation lessons, or a separate formula-reference store. No persisted
data or timing-policy changes.

## Decisions

### Calculator data is a small typed arithmetic subset

Add `CalculatorData` on the existing inline display. Use a closed key union that distinguishes
number entry, negation, subtraction, addition, multiplication, division, parentheses and ENTER.
It is a content representation, not an emulator of calculator state, history or menus.

Three discriminated operations:

- `evaluate`: keys are the display; compute an exact numeric answer.
- `choose-sequence`: display an exact target; carry two candidates, each with a stable choice
  id and typed keys. Compute both values and accept the unique candidate reaching the target.
- `answer-form`: display division keys; carry the requested fraction/decimal form. Choose a
  non-whole rational with a finite decimal expansion. Explain the answer toggle in the prompt
  or worked steps and apply existing `requireFraction` or `requireDecimal` rules.

Use bounded templates such as `24×(-)16 ENTER`, `(24+16)×3 ENTER`, and `25÷8 ENTER`.
`(-)` denotes the sign-change key, `−` denotes subtraction, and ENTER ends the sequence.
Operands are at most two digits. Operand bands can be 2–9, 5–15, 10–30, 20–60, and 30–99.
The division denominator comes from 2, 4, 5, or 8; reject whole-number results. For the first
band redraw within the band when necessary. Both visible inline text and candidate labels
must stay at most 18 characters, including separators and ENTER. These bounded templates
fit without abbreviating key names or exempting calculator-skills from the width gate.

Predictions use valid alternatives: `a×(-)b` confused with `a−b`, or
`(a+b)×c` confused with `a+b×c`. Keeping every operand at least 2 is what makes a
prediction equal to its own answer impossible, so no rejection loop is needed: `−ab = a − b`
needs `b = a/(1 − a)`, which is negative, and `(a+b)c = a + bc` needs `c = 1`.
Never evaluate an invalid raw substitution of one key for another. The answer-form operation
predicts no equal-valued misconception: wrong-form feedback is already distinct from
`incorrect`, and central filtering would remove that prediction.

Keep small key formatting and arithmetic helpers beside the Unit 22 content. Reuse exact
rational utilities; no general parser service or new dependency is needed. Tests independently
interpret the supported tokens and reject malformed sequences. Candidate data must support
checking every offered sequence, not just trusting an authored correct sequence.

The key legend and toggle description should cite the TI-30XS MultiView guide in a source
comment. Limit claims to these documented operations. A calculator emulator is rejected
because it introduces an independent interaction system beyond this content increment.

### The numeric keypad exposes both permitted forms

The answer-form operation permits both fractions and decimals so the learner can submit the
other form and receive the existing form-specific response. `applyKey` already accepts both
from that declaration, but `Keypad.tsx` renders the slash instead of the decimal point when
both are allowed. The same defect blocks `fraction-to-decimal` in Unit 9 and hides the
wrong-form entry route in `decimal-to-fraction`.

Repair key visibility in the shared `Keypad`; do not change generator flags, parsing, answer
checking, or lesson recovery. Keep the slash in its current bottom-right numeric cell and
use the otherwise empty bottom-left cell for the decimal point. If a sign or mixed-number
space already occupies that cell, keep Backspace in row 1, column 4 but reduce its two-row
span to one row, then put the decimal point in row 2, column 4. That gives both controls
full-size 64-pixel-high targets while preserving the four-row grid, every digit's position,
and Check's position and size. Single-form pads keep their current layout. Existing
restrictions on simultaneous sign and mixed entry remain.

This restores the existing `answer-entry` requirements that permitted classes receive keys
and display and entry read one declaration; it introduces no capability or answer control.
Static tests cover both-form declarations, implied fractions from mixed entry, and existing
single-form pads. Browser checks enter both forms, recover from a wrong-form answer, complete
the calculator lesson, and exercise both Unit 9 conversion directions. At 375 by 812 pixels,
measure digit/action positions and key targets and inspect the complete answer-form layout.
For sign/mixed plus both-form combinations, which current generators do not declare, mount
the real `Keypad` with those rules and the app stylesheet in the scratch browser harness;
do not add an application route or generator. Assert no horizontal or vertical viewport
clipping, unchanged digit and Check bounding boxes, and Backspace's unchanged origin with
its specified 64-pixel height. Exercise both keys through the component's real handlers.

### Formula selection adds meaning beside existing geometry references

Use only one shape: a labelled geometry figure, its existing reference pair in structured
notation, and two choice labels copied from that pair. The question asks for the formula
that finds the figure's requested measurement. Numeric calculation remains Unit 20's job.

Extend `geometry-diagram.ts` with a helper deriving the requested measurement phrase,
correct pair index and distractor measurement from the figure. Preserve
`geometryFormulaReferences()` and every existing pair unchanged. The mapping is small,
explicit authored metadata; it is not a second formula declaration.

The correct members are:

- `perimeter` 0; `area-rectangle` 1.
- `area-triangle` 1; `area-parallelogram` 0; `area-trapezoid` 1.
- `circumference` 0; `area-circle` 1.
- `volume-prism` 0; `volume-pyramid` 1.
- `volume-cylinder` 0; `volume-cone` 1.
- `volume-sphere` 0; `surface-area` 0.
- `pythagorean`: 0 for `missingSide: 'hypotenuse'`, 1 for `missingSide: 'leg'`.

The accompanying phrases name the shape and measurement, including the distractor: for example
rectangle perimeter versus area, cylinder versus cone volume, or missing hypotenuse versus
missing leg. Do not infer correctness from pair order. Exclude `similar-figures`, whose
references are equivalent, and `area-composite`, whose numeric answer requires a difference
of rectangle areas rather than the pair's single area formula.

Carry the formula-selection discriminant on the diagram display, narrowed so it cannot be
attached to a shaded-shape diagram. `Display`'s diagram arm is today a single member,
`{ kind: 'diagram'; diagram: ShapeDiagram | GeometryDiagram }` (`types.ts:874`), so there is no
geometry arm to extend: split it into two `kind: 'diagram'` members the way the `story` and
`math` arms are already split (`types.ts:847-860`, `:862-872`), and put the discriminant on the
geometry member alone. This adds no display kind, and every existing consumer keeps switching on
`kind === 'diagram'` then on `diagram.kind`. It does widen `Of<'diagram'>` in `ProblemView`
(`:307`) into a union, so that view narrows before reading the discriminant. The existing figure
data already contains operation, measurements and missing-side role. Do not duplicate a
measurement or correct index on the problem. Ordinary geometry lacks this discriminant and keeps
its existing numeric semantics. No new math-display data is needed.

Reuse valid figure generation by selecting from the directly imported Unit 20 generators and
taking the geometry diagram from their generated problem. Use difficulty 1 for these source
draws to keep contextual dimensions compact; the resulting formula exercise carries its own
requested difficulty. Reject excluded operations and any draw outside the formula band with
the existing bounded `constrain` helper. Do not copy Unit 20 draw builders or numeric answers.

Count every node in the correct reference's `MathNotation` tree once. Use node-count bands
1: 3–3, 2: 3–5, 3: 5–8, 4: 8–11, 5: 9–11. Current references include simple text rows
(3 nodes), fractions (5), circle area (7), cylinder volume (8), sphere volume (9), cone
volume (10), and both Pythagorean rearrangements (11). Verify these bands against the
declarations and show every band has eligible draws. Varying dimensions provides more than
twenty distinct displays; it is not the difficulty evidence.

Reject the second formula-only direction because the single figure-based question already
fulfills formula navigation and variety. Reject a shared-table rewrite or measurement-only
lookup: the existing reference function plus a small semantic selector suffices.

### Existing display owners handle the two new choice combinations

`ProblemView` already has `DISPLAY_ENTRY_FRAME` for input modes whose controls own their
answer. Apply that policy to formula-selection diagrams and calculator `choose-sequence`
inline displays. Keep the existing generic policy for other inline and diagram problems.
The formula view keeps `GeometryDiagram`, its structured references and accessible names;
only the trailing equals sign and entry frame disappear. No MathView change is needed.

Add static component regressions for these two new combinations, numeric calculator and
geometry keypad behavior, and read-only examples. Browser validation checks the complete
figure/formulas/choices composition, including both Pythagorean variants, at 375 pixels.
The diagram-rendering delta owns this newly exercised layout and its accessibility contract.

### Independent verification branches precede generic display handlers

In both `recompute` and `sourceMagnitude`, handle calculator data and formula-selection
geometry before generic inline, math or diagram handling. Otherwise the numeric geometry arm
rejects a choice and the generic magnitude arm measures dimensions rather than the formula.

Calculator checks rebuild text and every candidate label, interpret supported keys independently,
derive a unique target match, and validate form/keypad rules. Formula checks validate the figure
and use the existing independent `expectedGeometry` reconstruction for labels and reference
pairs. Add an independent operation/missing-side oracle for the expected measurement and
correct formula; do not call the production correct-member selector to check its own result.
Rebuild the prompt and choices, then derive the answer id. Preserve numeric checks for ordinary
geometry, including approximate tolerance and similar-figure constraints.

Malformed-key, changed-label, changed-target, ambiguous-choice, excluded-figure, wrong-side,
wrong-prompt and wrong-answer fixtures must fail with a useful problem identity. Record
calculator data in `formatDisplay`'s inline arm and the formula marker in its diagram arm.
The existing geometry recording already includes measurements, side roles, notation and labels.
`RENDERED_KEYS` lists top-level Problem keys; display-interior data belongs in `formatDisplay`.

### Mixed reviews delegate through standard lessons

Import Unit 0–21 modules directly into the Unit 22 module. Never read the registry there,
because the registry imports Unit 22. Build quantitative and algebraic pools from the
units listed in the proposal; test that they partition the registered course outside Unit 22.

Each review is a plain `SkillGenerator`: select with the supplied RNG and call
`source.generate(rng, difficulty)`. Preserve the returned problem, including its skillId.
Do not use `defineSkill` for these two generators because it restamps that identity.
The caller's existing `generateProblem` still validates and filters once.

Standard session slots hold the review generator. Therefore attempts credit
`slot.source.skill.id`, while completion credits `mode.skill.id`; both identify the review.
The source problem id remains available for verification such as money-problems cents scaling.
No source progress or spaced-review counters change. Existing global lesson rewards and
activity behavior remain normal.

Uniform selection with replacement can repeat a source, including for an entire lesson.
Use controlled seeds to demonstrate diversity and repeatability in tests; do not enforce
source diversity in a random browser run. A real browser run verifies that every observed
problem belongs to the right pool and both review skills gain progress while sources do not.

The standard intro chooses seed 1/difficulty 1. Keep that representative source example,
including its display and worked solution, beside an authored review teaching line explaining
the pool's scope. Snapshot it and test automatic/review intro rendering; do not introduce
another intro sampler or special route.

That example does not fit the phone, and nothing here changes to make it fit. At seed 1 and
difficulty 1 the algebraic review delegates to `slope-from-points`, whose coordinate plane and
three detailed steps measure 917px of content on an 812px surface. `SkillIntro.tsx` scrolls only
its worked-example region and holds the teaching line and both actions outside it, so a tall
example costs reachability inside that region rather than access to the actions. That layout
shipped separately as `5bb1374` for a defect that predates this increment — both Stage F slope
intros already overflowed by 83px — so this change edits no intro component. Its obligation is
to keep the delegated example whole and let the shipped region carry it, which the browser gate
proves by measuring the action container's position rather than the intro's scroll height.

### Source-aware checks retain coverage

The inline width sweep currently groups by the presenting generator id. Group each displayed
sample by `problem.skillId` instead. The only exceptions remain `read-numbers` and
`read-decimals`; a delegated arithmetic display still fails if over 18 characters.
This uses preserved source identity and avoids exempting either review from layout coverage.
Add a synthetic check proving an over-wide delegated arithmetic display is still reported.

Create an explicit exclusion set containing only the two review ids for the `alwaysFiltered`
diagnostic. The function collects declared and surviving tags from the same draws. A thin
mixed sample may contain only the colliding instances of a tag that survives its full
source-generator sweep; an absent tag is absent from both sets and is not the issue.
Every pool member still receives 1000 draws under its own id. Assert the closed exclusion set.
All per-problem content, answer, variety, snapshot, difficulty and equation-width checks
continue over both reviews.

### Delegated difficulty is measured paired, not against a second random mix

`generateProblem` seeds the rng from the seed alone (`src/lib/generator.ts:29`), and a review
picks its source before difficulty is used, so one seed selects one source at every difficulty.
The shared ladder gate does not exploit that: `scalingProblems`
(`src/curriculum/generators.test.ts:3301-3311`) draws `seedFor(i, difficulty)`, whose seeds
differ per difficulty, so for a review it compares two different random mixes of sources whose
magnitudes differ by orders of magnitude. That comparison can invert without anything being
wrong with the content.

Measure the reviews paired instead: hold the seed, vary the difficulty, and require the mean to
climb across those pairs. Exclude only the two review ids from the unpaired shared ladder, in the
same closed exclusion set style as the always-filtered diagnostic, and assert the set is closed.
Every pool member still faces the unpaired ladder under its own id, so no source loses its own
measurement. Do not weaken `sourceMagnitude`, and do not give the reviews a bespoke magnitude.

### Existing planned-block fixtures are re-expressed, not replaced

Registering these four generators leaves `timed-practice-1` and `timed-practice-2` as the only
planned skills, both inside an otherwise playable unit, so no unit or stage anywhere holds zero
playable skills. Two test files use that as their fixture and are re-expressed.

`skip.ts:106-113` records that "an unknown block and a block with nothing playable in it are the
same miss — neither is in either map", so the `'not-a-block'` assertions already in
`skip.test.ts` cover the branch the `unit-22` fixture covered; nothing is lost by repointing the
`!unit` guard case at an unknown id. What replaces it is stronger: Unit 22 becomes the first
partly built unit in the tree, and `markKnown` iterates only `blockSkillIds`, so it raises the
four playable skills and leaves both timed forms planned, locked and absent from the record.
That is a real witness for skip-ahead's own "unplayable skills are left alone" scenario, which
today is proved only degenerately by a block where nothing is raised at all.

`StageList.test.tsx`'s "shows no trace of a stage with no generator in it" is a real-data echo of
a derivation rule that `manifest/resolve.test.ts:276-288` already owns with synthetic stages and
`coverage.test.ts:774-808` ("no stage or unit that has nothing to play") owns
against the real course. The repository has already answered what to
do when such a fixture is built out: `UnitList.test.tsx:38-46` deleted the same case when Unit 5
shipped, and its comment refuses to re-stage it on a hand-chopped tree, because the component
maps its prop unconditionally, so feeding it a trimmed course and counting what comes back
asserts only that `.map` works. Follow that: update the count and order chain for eight stages,
and delete the omission case with a comment naming the two places the rule is actually tested.

`ged-score-estimation/spec.md:165-168` needs no delta and is deliberately left alone. Its `WHEN`
is guarded — "before any Stage H generator exists" — which is the shape this change keeps
verbatim at `curriculum-manifest`'s own guarded scenario. What this change rewrites there is
requirement prose that asserted 195 as a standing fact; `ged-score-estimation` carries no such
prose. Guarded scenarios are kept as counterfactual history, unguarded totals are replaced.

### Stage H intros take their own capability requirement

Stage G did not join the per-stage paragraph list inside `skill-intros`'s worked-example
requirement; it took its own requirements (`skill-intros/spec.md:147`, `:200`). Stage H follows
that precedent with one added requirement rather than a modification that must carry eight
scenarios forward. It owns what is new to the capability: a mixed-review intro whose example is
another skill's problem, rendered in that source's representation beside the review's teaching
line. The unit spec keeps only the content half — that the four lines exist and what a review's
line says — so the two do not state the same thing twice.

### Stage requirements include observed content plus retained timing

Stage H retains `timed` even though these four lessons are untimed. Its complete declaration
is observed content requirements union `timed`, not equality with untimed observations alone.

In coverage tests, deterministically sample every pool source and the calculator/formula
generators across all difficulty bands. Inspect input modes as today; also map `math`
displays and embedded equation/geometry notation to `math-notation`, geometry/shaded diagrams
to `diagram`, charts to `chart`, coordinate-plane displays to `coordinate-plane`, and
fraction-entry keypad declarations to `fraction-input`. Number-line, expression, choice
and root-pair inputs contribute their existing capabilities. Inspect declarations, not the
presence of a fraction-valued answer alone. Record a witness per observed capability and
assert their union with `timed` equals Stage H's declared set and is already available.

Only capability declarations change in the manifest; ids, membership, prerequisites and pacing
stay unchanged. Replace both obsolete Stage G status requirements with an explicit preservation
requirement plus the new Stage H opening boundary. Update all count, teaching-line, tree and
status assertions and prose, including README's intro coverage and roadmap's statement that
all six Stage H skills are planned. Keep item 30 open.

## Risks / Trade-offs

- Reference recognition uses authored semantic metadata. Independent operation/variant fixtures
  and unchanged Unit 20 reference snapshots check it without trusting the new selector.
- Formula complexity is a structural proxy, not a calibrated assessment. Node-count bands make
  the progression testable and dimensions remain only visual context.
- Source-generator changes affect review problems and stable intros. Recorded output makes
  those changes reviewable, and the paired ladder above keeps pooled difficulty measurable
  without weakening the gate every source still faces on its own.
- Character count is a width budget, not visual proof. Inspect complete calculator and formula
  screens with longest labels at 375 pixels and retain the existing layout guards.
- Static component tests cannot prove progress credit or focus behavior. Scripted real-browser
  checks own those interactions, following docs/environment.md.

### Verification follows the recorded forward-only workflow

The run already changed the shared roadmap contract to forward amendment, but
`scripts/validate-roadmap-skills.mjs` still requires the removed `needs-preparation` rewind
and the Codex/Pi preparation adapters still advertise it. Align those remaining consumers
with the existing shared contract and Claude preparation adapter. Preserve the validator's
checks for all ten phases, session boundaries, fresh independent review, model inheritance,
and cross-adapter consistency. This completes the recorded workflow amendment; it does not
introduce another workflow or alter the application.

## Migration Plan

No stored-progress, API, or sync migration. Registering the four generators makes them
playable through existing manifest resolution. Roll back the content and its matching
declarations/specs together if needed; never delete progress records for these skill ids.
Preparation changes only proposal artifacts and handoff state. Implementation remains a
separate, audited session.
