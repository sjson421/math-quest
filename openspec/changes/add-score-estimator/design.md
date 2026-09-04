## Context

See `proposal.md` for motivation and scope, and
`specs/ged-score-estimation/spec.md` for the behavior contract.

Roadmap increment 29a added an optional elapsed clock to the shared transient lesson session.
The baseline `timed-mode` specification deliberately keeps that clock from changing a score or
lesson outcome. Stage H still has no generators, is absent from the playable course, and leaves
all six Unit 22 modules planned. Item 30 will later decide the full-length form size, sampling,
point weights, result navigation, and completion policy.

The current check path is not the missing score owner. `CheckSession` records an earned count,
but `startCheckSession()` is deliberately fixed to the eight-source skip-ahead contract, and
`App` owns the separate skip result screen. Widening either path here would mix a future GED test
form with skip-ahead behavior before item 30 defines that form.

Three public GED Testing Service sources constrain an honest approximation:

- The [2022 Technical Manual](https://www.ged.com/wp-content/uploads/2014-GED-Test-Technical-Manual-2022-V2022.01-SECURED2.pdf)
  says official forms use item-response-theory calibration, form-specific raw-to-theta
  conversion, and then theta-to-scaled-score conversion. It also says raw scores are not
  reported. Pages 79–80 set the obtainable scale to 100–200; Table 3 on page 86 reports
  Mathematical Reasoning reference values of 43% of points at scaled score 150 and 78% at 170.
  Its 2016 note says the transformation stayed in place when the performance levels changed, and
  Chapter 6, page 90 gives the updated four performance-level ranges.
- The current [GED score guidance](https://www.ged.com/about-test/scores.html) confirms the 145,
  165, and 175 thresholds and their learner-facing labels.
- GED's [score explanation](https://www.ged.com/blog/how-is-the-ged-scored.html) distinguishes
  scored points from the number of questions answered correctly.

Those sources do not publish one universal current raw-score table. Math Quest can therefore
provide a transparent practice estimate, but it cannot reproduce an official equated score.

## Goals / Non-Goals

**Goals:**

- Keep score calculation, band classification, displayed mapping, and source meaning in one
  small capability with deterministic inputs.
- Make the approximation inspectable and make its limits harder to miss than its number.
- Give item 30 a reusable result card without choosing item 30's session or navigation design.
- Preserve offline operation, current lesson behavior, and all learner state.

**Non-Goals:**

- Model item difficulty, estimate an IRT ability value, or claim psychometric equivalence with an
  official form.
- Generalize skip checks, create a generic exam framework, or add a Stage H completion screen.
- Fix a 46-question form, assign multi-point items, or decide whether future forms report time,
  rewards, review evidence, or mastery.
- Store score estimates or turn them into unlock, progress, or sync data.

## Decisions

### 1. Model earned practice points, not questions or one fixed form size

Add one pure library owner under `src/lib/` with a validated input record equivalent to:

```ts
type PracticePoints = Readonly<{
  earned: number
  possible: number
}>
```

Both values must be finite safe integers, `possible` must be positive, and `earned` must be from
zero through `possible`. Invalid internal data throws one named score-estimation error instead of
being clamped into a plausible result. The estimator returns the original points, one rounded
scaled-score estimate, and one closed score-band id.

Using points matches GED's own scoring language and leaves item 30 free to choose a form total or
later assign more than one point to an item. Hard-coding 46 questions was rejected because the
official test has about that many questions but scores points, and the roadmap has not fixed Math
Quest's form. Accepting a percentage alone was rejected because the future result must still show
the raw evidence behind its estimate.

### 2. Interpolate between four published, visible anchors

Define one exported, ordered, readonly anchor table:

```ts
[
  { percent: 0, score: 100 },
  { percent: 43, score: 150 },
  { percent: 78, score: 170 },
  { percent: 100, score: 200 },
]
```

Calculation uses `earned / possible * 100` without rounding the ratio, finds the surrounding
anchors, linearly interpolates once, and applies `Math.round()` to the final positive value. The
valid domain and endpoint anchors naturally keep results from 100 through 200. Focused tests pin
every anchor, equivalent ratios, a half-point rounding case, every score-band boundary, and
monotonic output across a representative full point range.

The middle anchors are the Technical Manual's published Mathematical Reasoning standard-setting
reference values. The endpoints are its lowest and highest obtainable scaled scores. Linear
segments are not described as GED Testing Service's conversion; they are Math Quest's smallest
checkable approximation between public facts.

Adding 100 to a rounded percentage was rejected because it ignores both published middle
reference values while looking more official than its evidence supports. A copied third-party
lookup was rejected because many available charts cover the pre-2014 test and none can stand in
for form-specific equating. An exhaustive lookup was rejected because no universal official table
or future Math Quest point total exists. Implementing IRT was rejected because item parameters
and equating samples are unavailable; invented parameters would add complexity without accuracy.

### 3. Keep score bands as separate current policy data

Define one ordered readonly band table for Below Passing 100–144, High School Equivalency
145–164, College Ready 165–174, and College Ready + Credit 175–200. Classification reads the
rounded scaled estimate, not raw percentage thresholds. The result component reads the same band
metadata for its learner-facing label.

Keeping anchors and bands separate matters because they come from different source claims: the
manual anchors explain this approximation, while current score guidance defines the labels. A
single mixed table was rejected because it would imply that 43%, 78%, 145, 165, and 175 are one
official raw conversion.

### 4. Render one composable estimate card from the pure owner

Add a presentational component under `src/components/` that accepts earned and possible points,
calls the pure estimator, and renders one labelled section. It shows:

- the earned and possible practice points
- `Estimated GED Math score` and `About <score>`
- `Estimated range: <band label>`
- an always-visible caveat that official GED scores use scored points and form-specific equating,
  and that only an official score report determines the outcome
- an expandable `How this estimate works` disclosure containing the four-row semantic mapping
  table, interpolation note, source titles, and source links

The mapping rows come directly from the exported calculation table. Source names and all needed
explanation remain in rendered markup; links are supplementary, so being offline does not remove
the estimate's basis. Score and band meaning stay in text and do not rely on color. The card owns
no Continue action, full-screen layout, or destination, allowing item 30 to compose it into the
result flow that item defines.

Putting the caveat inside the closed disclosure was rejected because the roadmap makes it part of
the result, not optional fine print. A permanent Settings calculator was rejected because no
product authority asks learners to enter results from another test. A complete result screen was
rejected because its actions, elapsed-time summary, rewards, and destination belong to the
unbuilt Stage H form. Passing a precomputed score and band into the component was rejected because
callers could create a result whose visible evidence disagrees with its labels.

### 5. Ship capability infrastructure without permanent navigation

No production `Screen` arm or lesson path will render the card in 29b. This matches earlier
capability increments that built and browser-validated a future content renderer before any
generator could reach it. Item 30 can later pass completed form points to the card without
changing the mapping or caveat.

Static server-rendered component tests independently derive expected results from the visible
point inputs and pin the complete first paint, semantic table, scored-points caveat, source links,
score wording, absence of pass or credential claims, no progress-store change, and no network
request. A disposable App fixture renders the longest College Ready + Credit result, opens the
mapping disclosure, and checks the 375-by-812 viewport for horizontal overflow, clipped controls
or text, readable table cells, and offline-complete content. One passing screenshot is inspected,
then the fixture is removed exactly and affected gates rerun.

Mounting a permanent preview route was rejected because it would add learner-reachable surface
with no curriculum owner. Modifying `LessonComplete` was rejected because standard lessons end
after a correct-answer target and award progress, while a full test must consume a fixed form and
report every scored point; item 30 owns that distinction.

### 6. Update status documents without changing curriculum state

After the model, card, tests, and browser fixture pass, documentation will:

- mark roadmap item 29 and increment 29b shipped while leaving item 30 open
- state in the README that timer and score-estimation infrastructure are built while Stage H
  content remains planned
- update both Stage H remaining-work notes in `docs/curriculum.md` and add the score estimator to
  its Stage H capability inventory with its approximate, non-official boundary

No manifest entry, `AVAILABLE_CAPABILITIES` value, generator registry entry, curriculum skill
row, or playable-count statement changes. All six Stage H skill ids remain planned, and the
course remains 195 of 201 playable skills.

## Risks / Trade-offs

- **A learner reads the estimate as an official result:** Keep `Estimated`, `About`, and
  `Estimated range` visible, place the form-equating caveat outside the disclosure, and never use
  pass or credential-award copy.
- **Historical standard-setting facts look like a current universal conversion:** Name the 2022
  manual and exact four anchors, explain Math Quest's interpolation, and source current band labels
  separately.
- **Linear interpolation hides real form and item difficulty:** State that limitation beside every
  result. Do not add false precision, confidence intervals, or an IRT-shaped curve without data.
- **Official guidance changes:** Keep mapping and bands in two tested data tables and cite the
  source pages so a later change has one obvious update point.
- **External links fail while offline or move later:** Render the complete local mapping, source
  titles, and caveat without fetching either page; links provide verification when available.
- **Item 30 needs a different session model:** Keep the estimator dependent only on generic point
  totals and keep navigation, time, rewards, and persistence outside it.
- **Documentation says “built” before a learner can reach the card:** Call it infrastructure,
  leave all Stage H modules planned, and avoid adding a production route until item 30 ships.

## Migration Plan

1. Add the pure point model, anchor and band data, estimator, validation, and focused tests.
2. Add the reusable result card and static component coverage derived from the same data.
3. Run focused tests and a production build, then mount and inspect the disposable 375-by-812
   browser fixture and remove it exactly.
4. Update the README, curriculum status and capability notes, and roadmap item only after the
   complete estimator path passes.
5. Run strict OpenSpec validation, focused tests, the full test suite, production build, and lint.

Rollback removes the new pure owner, result component, tests, and documentation claims, then
reopens roadmap increment 29b and item 29. There is no persisted data, API, dependency, manifest,
generator, or sync migration to reverse.
