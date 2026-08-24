## Context

See `proposal.md` for motivation. The lesson currently carries one pending string and routes five exhaustive input modes through one submission policy. Numeric parsing already produces exact rationals, while point input shows how a structured answer and misconception can keep a private string codec without widening the lesson state.

The new surface must stay local-first, render in node-side component tests, fit the installed 375-pixel lesson, and land without a Unit 18 generator. Stage F is already partly playable, so the capability declaration and availability switch must arrive together to avoid temporarily relocking practised content.

## Goals / Non-Goals

**Goals:**

- Add one exact, order-insensitive two-root contract shared by answers and predicted mistakes.
- Preserve the lesson's single-entry and single-submission boundaries while showing two clear numeric slots.
- Make the new input mode and every answer/misconception consumer exhaustive and independently testable.
- Leave a complete, available Stage F prerequisite for the later 18b content proposal.

**Non-Goals:**

- Designing any Unit 18b generator, quadratic source-data arm, or formula-specific display.
- General list entry, approximate pairs, radical syntax, complex values, or symbolic set notation.
- Reusing geometric coordinates or changing expression equivalence.

## Decisions

### Ship a named tooling prerequisite before content

Add `root-pair-input` as a curriculum capability, require it in Stage F, and mark it available only after the answer, input, diagnosis, recording, and test paths are complete. Update roadmap item 23 from seven to eight changes by inserting an `18b prerequisite` before the three-generator content increment. Retire the baseline capability requirement whose coordinate-plane scenario still says every Stage F skill is planned at a total of 145, then add a successor that carries forward the current scenarios and records the new capability at the true total of 165.

Bundling this work with `difference-of-squares`, `solve-by-factoring`, and `quadratic-formula` was rejected because the answer union, lesson routing, keypad composition, and central diagnosis path are shared infrastructure. Choice input was rejected because it turns producing two roots into recognizing a listed pair.

### Model roots as an unordered exact two-value collection

Add one shared root-pair value containing two normalized `Rational` values and a distinct answer discriminant. Comparison treats the values as an unordered collection while preserving multiplicity: `[−3, 4]` equals `[4, −3]`, but `[−3, −3]` does not. The same value shape extends `Misconception`.

Reusing the point arm was rejected because a point is an ordered pair of integer coordinates coupled to a lattice. Encoding roots as an expression was rejected because the expression grammar describes one algebraic expression, not a set of numeric solutions.

### Keep the lesson's string entry through a pure pair codec

Represent the two pending raw slot strings as one deterministic internal tuple encoding. The empty lesson entry decodes to two blank slots; after the first edit, the codec round-trips both raw strings, including signs, slashes, decimals, and mixed-number spaces. Checking decodes the tuple and applies the existing exact numeric parser to each slot.

Replacing the lesson entry with a union was rejected because it would broaden every existing control and submission boundary. A comma-delimited learner entry was rejected because commas introduce an unrelated grammar, make partial parsing ambiguous, and produce a cramped single slot.

### Add a dedicated two-slot mode that reuses the numeric keypad

Add `root-pair` to the exhaustive input-mode union and route it to a `RootPairInput` surface. The surface owns local active-slot state, presents Root 1 and Root 2 as selectable controls, decodes the pending pair, and sends edits for only the active raw value through the existing keypad rules.

Reuse one numeric keypad beneath the slots. Give its Check readiness an optional override whose default preserves every single-value caller; the root-pair surface enables Check only when both decoded values parse. Selecting or editing a slot never submits. Both complete values confirm once through the lesson's existing guarded submit callback.

Extract or share the numeric entry rendering needed by both the ordinary answer slot and the two root slots, so typographic minus and stacked fraction echoes retain one owner. The root-pair mode owns its visible answer surface; generic problem displays must not echo the private tuple.

Separate keypads per root were rejected because they duplicate controls and exceed the lesson height. Automatic advance or submit was rejected because a tap or final digit should remain revisable until the learner confirms the complete pair.

### Couple the answer shape and input mode at generation time

Extend generated-problem validation so a root-pair answer requires root-pair input and root-pair input requires that answer. Unlike a point, a root pair has no required display arm: later content may show a plain equation or structured formula while the input surface remains the same.

Every exhaustive input-mode and answer consumer must name the new branch, including lesson routing, generic entry-frame policy, coverage fixtures, recorded output, answer-value reporting, and independent-verification failure cases. Tooling lands with synthetic tests; content-specific verification remains fail-closed until the later proposal adds operation data.

### Compare root-pair misconceptions structurally

Normalize each rational and derive an order-insensitive pair key. Central generation drops an answer-equal pair and later duplicate pairs even when their order or written fraction form differs. Diagnosis decodes and parses the learner's submitted pair, then applies the same exact comparison. Separate seen sets keep numeric, text, point, and root-pair values independent.

Treating root pairs as text was rejected because answer exclusion and exact rational equivalence would remain the generator's burden, recreating the dead-or-duplicate prediction trap the central filter exists to prevent.

### Preserve stage availability and stored progress

Add the capability name to the manifest type, Stage F's full requirement list, and `AVAILABLE_CAPABILITIES` in the same implementation. Coverage must prove that all 165 currently playable skills remain playable and the three Unit 18b skills remain planned. Update `docs/curriculum.md` and `docs/roadmap.md` together with the machine-readable capability declaration.

No generated problem or pending entry is persisted, and attempts still record only correctness and an optional misconception tag. Progress reconciliation and the opaque sync payload therefore need no change or migration. Refresh the stale capability and planned-skill examples in `AGENTS.md` together with the roadmap and curriculum prose so implementation sessions do not inherit obsolete governing facts.

## Risks / Trade-offs

- **[Risk] The internal tuple appears in a generic answer slot or snapshot** → Make the pair control the only visible entry owner for its mode and format answers and pending slots semantically in recorded output.
- **[Risk] Reversed or equivalent-fraction pairs bypass answer exclusion or deduplication** → Put normalization, pair comparison, and keying in pure shared helpers and test order, reduction, signs, and repeated values directly.
- **[Risk] Check enables for one complete root or an unfinished fraction** → Derive readiness from two successful numeric parses and cover the pure readiness rule plus static disabled/enabled markup.
- **[Risk] Extending the keypad changes existing callers** → Make pair readiness an optional override with the current single-value behavior as its default, then rerun existing keypad and lesson tests.
- **[Risk] Two slots plus a fraction-capable keypad overflow or hide Check on the phone** → Measure representative fullest entries in static coverage and exercise selection, correction, confirmation, feedback, and overflow in the real app at 375 pixels.
- **[Risk] Adding a Stage F requirement temporarily relocks existing work** → Add the requirement and availability entry atomically and pin the complete implemented-skill set before and after.

## Migration Plan

Ship the root-pair value helpers, checker and diagnosis branches, two-slot mode, exhaustive consumers, capability declaration, documentation, and tests in one commit. No stored-data migration is needed. Rollback removes that commit and the inserted roadmap prerequisite; all existing generated content and progress records remain valid.
