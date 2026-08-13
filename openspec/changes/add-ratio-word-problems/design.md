## Context

See `proposal.md` for motivation and the two delta specs for behavior. Unit 11 already uses
an exhaustive `RatioData` union for independently verifiable story and notation problems,
while existing word-problem skills use authored frame banks checked directly at their
source. The closing wall needs both systems: its arithmetic is an exact rational, but its
meaning depends on whether the prose requests one category against another or against the
combined whole.

## Goals / Non-Goals

**Goals:**

- Keep every story deterministic, authored, concise, and independently answer-verifiable.
- Make the two comparison meanings explicit in structured data rather than inferred from
  English.
- Guarantee two surviving wall diagnoses for every generated problem.

**Non-Goals:**

- Do not generalize the arithmetic frame type into a universal story abstraction.
- Do not parse prose or introduce runtime lookup, generated prose, colon entry, or choice
  answers.
- Do not change existing frame output or Unit 11 generator behavior.

## Decisions

### Use a dedicated ratio frame contract

Add a ratio-specific frame bank whose entries have stable ids and fixed adult-context wording
for the same two-category situation under both request modes. A frame receives two category
counts, computes their total, and renders either a first-to-second or first-to-whole request.
Selection comes from the seeded generator.

The arithmetic `Frame` contract is not widened: its operator and irrelevant third quantity
model a different kind of comprehension problem, while the ratio wall's third number is the
meaningful combined whole. Reusing it would mislabel one ratio comparison as an arithmetic
operation and could not express the alternate denominator structurally.

Alternative rejected: compose contexts from label fragments. That would allow unreviewed
sentence combinations and violate the fixed-frame contract. Alternative rejected: duplicate
one generator per comparison mode. The two modes are one curriculum wall and share the same
stories, ladder, and diagnostics.

### Carry frame identity, category counts, and comparison mode in ratio data

Extend `RatioData` with a `ratio-word` arm containing the stable frame id, the two positive
category counts, and `part-to-part` or `part-to-whole`. The story's total is derived as their
sum. Exhaustive verifier and recorder switches use this arm to recover the selected frame,
validate its visible text, derive the exact answer, and include both counts in difficulty
measurement.

Alternative rejected: generic story operands with division. It can recompute one quotient
but cannot prove whether the second operand represents the other category or the whole.
Alternative rejected: parse the story. Learner prose is output, not a data format.

### Reuse exact fraction-form answers without requiring reduction

For first count `a` and second count `b`, part-to-part answers `a/b`; part-to-whole answers
`a/(a+b)`. Both use `requireFraction` and the existing fraction keypad. The generator draws
unequal positive counts constructively over five widening bands. Lowest terms are accepted
but not required because this skill tests interpreting the relationship, not repeating the
preceding simplification skill.

Alternative rejected: multiple choice. Exposing candidate ratios changes the task from
forming the requested relationship to recognizing one. Alternative rejected: require
simplification. An equivalent unreduced relationship is semantically correct here and Unit
11.2 already owns lowest-terms form.

### Derive both wall misconceptions from the same counts

For a part-to-part request, predict `a/(a+b)` for using the whole and `b/a` for reversing
order. For a part-to-whole request, predict `a/b` for using the other category and `(a+b)/a`
for reversing order. Positive unequal integer counts make each pair distinct from the answer
and from one another; focused sampled tests and the global wall contract verify survival after
central filtering.

Alternative rejected: add a generic wrong-operation prediction. The prose asks for a
relationship, not an arithmetic operation, so that diagnosis would name an error the wording
does not invite.

### Source-check every frame under both modes

Register the ratio frame bank beside the existing phrasing banks, but check it through a
ratio-specific builder and quantity sets. Every frame is instantiated under both comparison
modes, checked against learner-text limits, and tested to mention both categories and their
sum. The authored-bank discovery check is widened so a new unregistered ratio bank cannot
silently bypass coverage.

## Risks / Trade-offs

- [A frame id and visible story drift apart] → Reconstruct the selected frame from semantic
  data in the global verifier and fail on text disagreement.
- [A wall prediction is filtered by equality or duplication] → Construct positive unequal
  counts and assert both diagnoses survive across every sampled difficulty.
- [One comparison mode is rare under seeded selection] → Sample both modes explicitly in
  focused tests and source-check every frame in both modes.
- [Story wording exceeds the phone or content limits] → Directly check every frame at its
  source and validate representative difficulty-five output at 375 pixels.
- [The final Stage D skill changes unlock visibility unexpectedly] → Pin curriculum order,
  implemented total, and the transition from Unit 11 to the next planned stage.

## Migration Plan

Deployment adds one generator and compile-time display metadata; stored progress remains
opaque and unchanged. Rollback removes the generator, ratio-data arm, and frame bank, which
returns `ratio-words` to planned without migrating learner data.
