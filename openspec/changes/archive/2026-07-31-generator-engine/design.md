## Context

See [proposal.md](proposal.md) — Why. The state that shapes the approach:

`src/curriculum/unit-01-add-sub.ts` holds all six built generators and exactly two helpers,
`digitAt` and `band`. Everything else — carry traces, borrow traces, misconception values,
the return-object skeleton — is written inline, six times. `generators.test.ts` samples 1000
problems per skill and recomputes each answer from `display.operands`, but it never pins the
wording of a hint or a solution step. `content-rules.ts` checks text over those same samples.
`Display` is `inline | column`, and `ProblemView` branches on `inline` then falls through
assuming `column`.

The constraint shaping every decision below: **the six existing generators are the only
skills a learner can play today, and their output is authored content that this change has no
mandate to alter.** Extraction must be provably behaviour-preserving, not plausibly so.

A second constraint follows from it: the six existing difficulty ladders are all different
from each other (`add-facts` runs 1–5 to 5–9, `sub-facts` runs 2–6 to 8–18), so any shared
ladder that changed one of them would be a content change wearing a refactor's clothes.

## Goals / Non-Goals

**Goals:**

- One owner per derivation. A carry is computed in one place and read everywhere.
- Authoring a new arithmetic generator is choosing operands, a ladder, and misconceptions.
- Word problems are possible at all, and the first one is real rather than hypothetical.
- The extraction is checked, not asserted.

**Non-Goals:**

- No generic "arithmetic renderer". Solution-step wording stays authored per skill; the
  engine supplies the numbers, never the sentences.
- No abstraction invented for skills that do not exist yet. Multiplication and division
  helpers arrive with the units that need them, informed by having written them once.
- No change to how a lesson runs, how difficulty is chosen, or how progress is stored.

## Decisions

### 1. The engine lives in `src/curriculum/engine/`, not `src/lib/`

`src/lib/` holds primitives the running app imports — `answer.ts`, `keypad.ts`, `rng.ts`,
`types.ts`. The engine is authoring machinery imported only by unit files and their tests, and
it ships to the browser only because the generators do.

- **`src/lib/generator-helpers.ts`** was rejected: a single file accumulating every shape from
  23 units becomes a junk drawer, and putting it in `src/lib` invites a component to import it.
- **Helpers per unit file** was rejected: that is the status quo, and it is what produced six
  copies of one carry trace.

### 2. `columnTrace(a, b, op)` returns the whole derivation as data

One call yields per-place digits for both operands, per-place sums or differences, carries,
borrows, and the reduced/borrowed values. Display, hint, solution details and misconceptions
all read from it. This is what generalises past two digits — the place where the current code
already failed.

- **Keeping `digitAt` and composing per generator** was rejected: it is exactly what
  `add-3digit` had to abandon when the digit-concatenation idiom stopped working at three
  places.
- **A trace that also emits solution steps** was rejected: step wording is content, it varies
  deliberately between skills, and `sub-2digit-borrow` proves the wording is where the
  four-step limit actually bites. The engine hands over numbers; the skill writes the sentence.

**Trade-off:** the trace computes more than any one generator uses. That is deliberate — the
cost is a few object allocations per problem, and the alternative is each generator deciding
for itself which parts of place value it needs.

### 3. Misconception factories take the trace, never digit strings

`forgotCarry(trace, place)`, `flippedColumns(trace)`, `offByOne(answer)`, `wrongOperation(a,
b, op)` return predicted values computed by place-value arithmetic.

- **Generalising `` Number(`${tens}${ones}`) `` to n digits** was rejected. It is a string
  trick standing in for arithmetic; it reads as a typo hazard, and it is the specific idiom
  that broke.

### 4. Behaviour preservation is a golden snapshot, taken before anything is extracted

Task 1.1, before a single helper exists: a committed snapshot of sampled problems for the six
skills — 5 seeds × 5 difficulties × 6 skills, 150 problems, whole `Problem` objects. Every
extraction step is then checked against it, and the snapshot is not permitted to change during
this work.

150 rather than the full 1000-per-skill sample: a 30,000-problem snapshot is not reviewable,
and any wording regression from an extraction is systematic rather than rare — it will show up
in the first few seeds or not at all.

- **Trusting `generators.test.ts`** was rejected: it recomputes answers, so it would catch a
  broken carry, but it never compares a hint or a step's prose against anything. A refactor
  could reword every hint in the course and the suite would stay green.
- **Manual before/after diffing** was rejected as unrepeatable.

This mirrors the graph snapshot already committed at `manifest/__snapshots__/` and for the
same stated reason: derivation is indirection, so the derived result gets pinned.

### 5. Named ladders are offered, not imposed

The engine exports named ladders for new skills. The six existing generators keep their exact
current ranges, expressed through the same helper. Making `add-facts` and `sub-facts` share one
ladder would change both, which is out of scope here even where it might be an improvement.

**Trade-off:** the named ladders begin with almost no users and only earn their place as units
land. Accepted — the alternative is silently restating six ladders that were each chosen.

### 6. The story display carries an operand pair

`Display` gains `{ kind: 'story'; text; operands; operator }` — the same `operands` and
`operator` fields `column` already has, so `recompute()` in `generators.test.ts` handles both
through one branch.

- **Exempting story problems from recomputation** was rejected outright. That test is the
  reason a wrong answer key cannot ship, and carving out the problem type whose answers are
  hardest to eyeball is the wrong place to start trusting the generator.
- **Parsing quantities out of the prose** was rejected: a frame that mentions a distractor
  quantity would break it, and mentioning distractors is the entire point of a word problem.

Multi-step stories, and stories whose operation is not a single binary operator, are out of
scope until a unit needs one. `add-words` is a single addition described in a sentence.

### 7. A frame is data that predicts its own misconceptions

A frame carries its sentence template plus a function producing the misconceptions its wording
invites, given the quantities substituted in.

- **A plain array of format strings** was rejected: a bare string cannot say that it mentioned
  three quantities and that combining the wrong two yields a specific number. Comprehension
  errors are frame-specific, and nothing outside the frame knows them.

For `add-words`, every frame predicts at minimum:

| Tag | The error |
|---|---|
| `wrong-operation` | subtracted the two quantities instead of adding them |
| `distractor-pair` | combined the wrong two of the quantities mentioned |
| `answered-part` | gave back one of the stated quantities rather than the total |

`add-words` is not flagged a wall in the manifest, so two distinct surviving predictions are
not required of it — but a word problem with no comprehension diagnosis is the case the
diagnosis system was built for, so it gets all three, and dedup decides what survives.

The six existing skills keep their current tags exactly, and the snapshot enforces it:
`add-facts` — `off-by-one-low`, `off-by-one-high`, `subtracted`; `sub-facts` — `added`,
`off-by-one-low`, `off-by-one-high`; `add-2digit-nocarry` — `digit-concat`; `add-3digit` —
`forgot-carry-ones`, `forgot-carry-tens`.

The two walls are the sensitive ones. **`add-2digit-carry`** must keep `forgot-carry` and
`wrote-full-ones`, both of which must survive central dedup for the wall rule to pass.
**`sub-2digit-borrow`** must keep all three of `flipped-column`, `forgot-to-reduce-tens` and
`skipped-tens-subtraction` — the third exists precisely because the first two collide whenever
the ones digits are five apart, and a factory that "tidied" it down to two would fail the
content contract on a subset of seeds rather than on all of them.

### 8. Frame checking is its own test, over the bank rather than over samples

A test walks every frame in every bank, instantiates it with several representative quantity
sets, and runs `checkContent` on the result. This is the `skill-content-contract` addition:
sampling checks the frames it happens to draw, and a bank worth having will outgrow that.

`learnerText()` in `content-rules.ts` must also learn to read story prose, or forward-reference
checking silently stops covering the text most likely to contain a stray term.

### 9. `add-words` ships here, against the repo's own sizing rule

`AGENTS.md` says capability work is its own change, never bundled with the content it unblocks.
This change deliberately breaks that rule by one skill, and the reason is stated rather than
worked around: a phrasing bank with no consumer is scaffolding nobody has proven, and the
failure mode of shipping it unproven is discovering the design is wrong while writing 44 skills
against it.

`add-words` does not make Unit 1 complete and does not overlap roadmap A1's remaining scope.

Its generator needs a hand-written `prerequisites` of `['add-3digit']`, because `isUnlocked()`
still walks the registry rather than the manifest. That matches what the manifest would derive
anyway: the declared predecessor `add-three-numbers` is planned, and planned skills pass
through to the nearest implemented ancestor.

## Risks / Trade-offs

**[An extraction silently rewords authored content]** → The golden snapshot is task 1.1, before
any helper is written, and stays frozen for the duration. A diff is a failure, not a prompt to
re-record.

**[The engine is designed against addition and subtraction only]** → Real, and accepted. Six
generators covering two operations is a narrow sample to generalise from, and multiplication is
14 skills of genuinely different shape. Mitigated by keeping the surface small and refusing to
invent helpers for unwritten skills; the first multiplication unit is expected to add to the
engine, not merely consume it.

**[The story display leaks into every `Display` consumer]** → `ProblemView` currently falls
through to `column` without a default branch, so adding a variant is a compile error rather than
a silent miss. That error is the mechanism, and `ProblemView` becomes an exhaustive switch.

**[The frame bank grows faster than it is reviewed]** → Frames are checked at their source and
the check names the offending frame. The static test is what keeps bank growth cheap.

**[`add-words` sets a precedent for bundling content into capability changes]** → Named as a
one-skill exception in the proposal's Non-goals and in decision 9, with the reasoning attached
so a later reader can disagree with it deliberately.

## Migration Plan

No data migration: nothing here touches the progress record, the sync contract, or the manifest.

1. Record the golden snapshot of the six generators.
2. Build the engine modules with their own tests, consumed by nobody.
3. Move the six generators onto the engine one at a time, snapshot green after each.
4. Add the story display and its rendering path, still with no story generator.
5. Build the phrasing bank and its static check.
6. Ship `add-words`, update the ✅ row and the two hardcoded counts.

**Rollback:** any step reverts independently. Through step 5 the learner-visible app is
unchanged by construction; step 6 is the only one that adds a skill, and reverting it returns
the count to 6.

## Open Questions

- **How many frames does `add-words` need?** The variety assertion in `generators.test.ts`
  requires more than 20 distinct displays across the sample, which quantities alone can satisfy.
  Enough frames that a lesson of ten does not read as one sentence repeated is the real bar, and
  it is a judgement to make while writing them. Leaning toward 8–12.
- **Should representative quantity sets for frame checking be fixed or seeded?** Fixed is
  reproducible and obvious; seeded covers more ground over time but makes a failure depend on
  the day. Leaning fixed, with the sets chosen to stress word count.
- **Does `add-three-numbers` (1.7) want a three-operand column trace now or later?** It is the
  next skill in the unit and the only near-term consumer of a wider trace. Deferring it costs a
  small revisit; building it now risks designing for a generator nobody has written.
