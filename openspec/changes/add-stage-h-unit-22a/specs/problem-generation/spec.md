## MODIFIED Requirements

### Requirement: Generators compute their own answers

A generator SHALL derive its answer from its chosen, typed source data. Answers MUST NOT be
hardcoded, looked up from a table of precomputed results, or obtained from any runtime service.
This is the property that makes correctness structural rather than a matter of proofreading.
Numeric results SHALL be computed from the operands. A symbolic reference-selection answer SHALL
be derived from the requested relationship and the displayed reference choices. A delegating generator SHALL return the selected source generator's problem,
whose answer meets this same contract. No answer SHALL come from a runtime service.

Reference declarations MAY contain authored formulas and measurement names, but SHALL NOT
contain precomputed numeric answers to generated arithmetic. Independent verification SHALL
rebuild the selected relationship without consulting the generator's stated answer.

#### Scenario: Answer follows from the chosen operands

- **WHEN** a generator picks operands and builds a problem
- **THEN** the stated answer is computed from those operands

#### Scenario: A formula choice follows the requested measurement

- **WHEN** a figure asks for perimeter and offers its perimeter and area references
- **THEN** the correct choice is derived from the requested measurement and those references
- **AND** no numeric answer is looked up from a table

#### Scenario: Delegation preserves the source computation

- **WHEN** a generator delegates a draw to a registered source generator
- **THEN** the returned problem retains the source data and computed answer unchanged

### Requirement: Geometry answers are recoverable from visible source data

A geometry display SHALL carry an operation, figure family, unit, and every measurement needed
to rebuild its visible figure, provided formula reference set, and answer without
consulting the generator's stated answer. Independent verification SHALL reject an operation
whose figure, formulas, measurements, prompt, answer policy, or answer disagree.

Verification SHALL recompute exact results for Unit 20a polygons, composite area, rectangular
prism volume, rectangular-pyramid volume, rectangular-prism surface area, scaled Pythagorean
triples, and similar figures. For circumference, circle area, cylinder volume, cone volume,
and sphere volume, verification SHALL use π = 3.14, round the target to the nearest tenth, and
require the declared approximate tolerance to equal 0.05. It SHALL derive every formula
conversion, cut-out, base area, one-third or four-thirds factor, face pair, and missing side
from the carried source values.

For similar figures, verification SHALL divide the known large side by its corresponding
visible small side, then multiply the other visible small side by that scale factor to recover
the exact missing large side. It SHALL reject a problem whose side role, visible measurements,
proportion references, prompt, exact answer kind, answer value, or keypad declaration
disagrees. It SHALL also reject a non-whole scale, a scale no greater than one, equal small
sides, or a carried missing answer.

For an explicitly declared formula-selection exercise, the answer SHALL instead be a choice
from the figure's existing formula references. The question SHALL name the measurement derived
from the operation and, for a right triangle, the missing-side variant. Verification SHALL
validate the figure, rebuild its references and question, and independently derive exactly one
correct choice. An ordinary measurement exercise SHALL still require its numeric answer and
policy; a choice answer without the formula-selection declaration SHALL fail verification.

Formula-selection exercises SHALL exclude similar figures and composite area. Every included
figure SHALL have exactly one matching reference and a distinct reference for another
measurement. No answer index or measurement duplicated in the problem SHALL substitute for
derivation from the figure's operation and side role. Existing formula notation, labels and
pair order SHALL remain unchanged.

The formula exercise's difficulty SHALL increase the structural size of the correct formula,
not merely the figure's dimensions. Independent difficulty evidence SHALL count notation nodes,
and both difficulty and answer checks SHALL handle the exercise before generic numeric geometry.
Recorded output SHALL include the exercise declaration, figure data, references, choices and
diagnosis. Malformed data, mismatched labels, ambiguous choices, or a wrong stated answer SHALL
fail and identify the problem.

#### Scenario: Polygon verification uses the carried dimensions

- **WHEN** a triangle figure carries base 8 and height 5
- **THEN** independent verification derives 20 from those values and the one-half formula
- **AND** it fails if the displayed labels or stated exact answer disagree

#### Scenario: Circle verification checks policy as well as arithmetic

- **WHEN** a circle-area figure carries diameter 10
- **THEN** independent verification derives radius 5, applies 3.14, and rounds 78.5
- **AND** it fails if the target or tolerance differs from 78.5 plus or minus 0.05

#### Scenario: A prism net and solid share dimensions but not answers

- **WHEN** length 5, width 3, and height 2 are carried by a prism-volume problem and a
  surface-area problem
- **THEN** verification derives volume 30 for the solid and surface area 62 for the net
- **AND** it rejects either operation if it declares the other's answer or formula set

#### Scenario: A missing right-triangle side is rebuilt

- **WHEN** a Pythagorean figure carries known legs 3 and 4 with the hypotenuse missing
- **THEN** verification derives the exact answer 5 and both radical references
- **AND** it rejects an answer, side role, or formula set that disagrees with those values

#### Scenario: Verification rebuilds a missing large width

- **WHEN** a problem shows small sides 4 cm and 3 cm and a corresponding large length of 8 cm
- **THEN** verification derives scale factor 2 and exact answer 6
- **AND** changing only the stated answer or known-side role fails verification

#### Scenario: Invalid correspondence fails closed

- **WHEN** the known large side does not divide evenly by the corresponding small side
- **THEN** verification rejects the problem instead of rounding or trusting its stated answer

#### Scenario: Formula selection verifies without requiring a numeric answer

- **WHEN** a declared formula exercise shows a rectangle and asks for its perimeter formula
- **THEN** verification rebuilds the figure and references and derives the perimeter choice
- **AND** the same choice answer on an ordinary numeric geometry exercise is rejected

#### Scenario: Pythagorean side roles select different references

- **WHEN** formula selection asks for a missing hypotenuse or a missing leg
- **THEN** the hypotenuse uses the sum-of-squares reference and the leg uses the difference
- **AND** switching only the stated answer fails verification

#### Scenario: Formula complexity supplies difficulty evidence

- **WHEN** formula exercises are sampled at difficulty 1 and difficulty 5
- **THEN** the mean node count of the correct formula is greater at difficulty 5
- **AND** figure dimensions do not supply that measurement

#### Scenario: Invalid formula choices fail closed

- **WHEN** a formula exercise has a changed question, duplicate matching choices, a changed
  reference label, an excluded figure, or a choice inconsistent with its side role
- **THEN** independent verification rejects it and identifies the problem

## ADDED Requirements

### Requirement: Delegated problems preserve identity and verification coverage

A mixed-review generator SHALL select uniformly with replacement from its declared pool using
the supplied seeded random source, then pass difficulty through unchanged. Its pool SHALL
contain only registered, non-delegating generators. It SHALL return the selected source
problem unchanged, including its source skill id. The lesson's own skill identity SHALL
determine progress credit independently of the problem identity.

Source selection SHALL depend only on the supplied seed, not on the requested difficulty, so
one seed identifies one source at every difficulty. A delegating generator's difficulty
evidence SHALL therefore be measured paired: the same seed compared across difficulties, so the
measurement reads one source's ladder rather than the difference between two random mixes of
sources whose magnitudes differ by orders of magnitude.

All answer, content, variety and recorded-output checks SHALL cover delegated problems. Inline
width checks SHALL attribute displays to their source identity and retain only the existing
prose-reading exceptions. Delegation SHALL NOT exempt a new display from width limits or
disable the equation-width check.

Exactly two shared measurements SHALL treat the two mixed-review generators specially, and
both SHALL be bounded to those two ids. The aggregate diagnostic for misconception tags that
never survive filtering SHALL exclude them, because a thin per-source sample may hold only the
colliding instances of a tag that survives its own full sweep. The unpaired aggregate
difficulty ladder SHALL exclude them in favour of the paired measurement above, because its
fixed seeds differ per difficulty and so compare different source mixes. Each pool member SHALL
still receive both measurements in full under its own id in the same suite. Neither exception
SHALL exclude an individual problem from content checks, weaken any other gate, or change
central misconception filtering.

#### Scenario: Delegation is reproducible and preserves difficulty

- **WHEN** the same review skill, seed and difficulty are used twice
- **THEN** the same source and deeply equal problem are produced
- **AND** the source receives the requested difficulty

#### Scenario: One seed holds the source still across difficulties

- **WHEN** one review seed is drawn at difficulty 1 and again at difficulty 5
- **THEN** both draws select the same source skill
- **AND** the paired comparison measures that source's own growth rather than a change of source

#### Scenario: Delegation cannot recurse

- **WHEN** either review pool is inspected
- **THEN** every member is registered and builds its own problems
- **AND** neither pool contains a Unit 22 skill

#### Scenario: Width follows the displayed source

- **WHEN** a review presents an inline problem from a reading skill or an arithmetic skill
- **THEN** that display faces the width policy of its original source
- **AND** an over-wide non-reading source still fails when presented through a review

#### Scenario: Source authoring checks remain complete

- **WHEN** the full generator suite runs
- **THEN** only the two mixed-review ids are excluded from the always-filtered tag diagnostic
  and from the unpaired aggregate difficulty ladder
- **AND** every pool member still receives both of those measurements in full under its own id
- **AND** all other checks continue to cover both mixed-review generators

### Requirement: Calculator exercises carry independently verifiable keys

Calculator exercises SHALL carry typed operation and key data for evaluating a sequence,
choosing a sequence for a target, or entering a result in a requested form. The negation key
SHALL be distinct from the subtraction operator. Each offered sequence SHALL be valid in the
supported arithmetic subset; invalid key syntax SHALL NOT be assigned an invented result.

Verification SHALL rebuild displayed text and sequence labels from the data and independently
evaluate the keys using exact arithmetic. For sequence choices, all candidates SHALL carry
their keys; exactly one SHALL produce the displayed target. The checker SHALL derive its choice
id from that result, not from the stated answer or an authored correct-choice index.

Every inline calculator display and sequence-choice label SHALL contain at most 18 characters.
Operands SHALL grow with difficulty within that bound. Recorded output SHALL retain operation,
keys, candidates, target, requested form and visible text. Invalid keys, mismatched visible
text, missing candidates, ambiguous targets or incorrect answers SHALL fail verification.

#### Scenario: Sequence text and result are independently rebuilt

- **WHEN** a calculator exercise displays a key sequence
- **THEN** verification rebuilds its visible text and computes its result from typed keys
- **AND** changing only the text or stated answer causes failure

#### Scenario: A target selects exactly one valid sequence

- **WHEN** an exercise offers two sequences for a displayed target
- **THEN** both are evaluated independently and exactly one result matches the target
- **AND** duplicate matching sequences or a mismatched target cause failure

#### Scenario: Calculator wording stays within the inline budget

- **WHEN** calculator exercises are sampled across all difficulty bands
- **THEN** every inline display and sequence-choice label is at most 18 characters
- **AND** difficulty evidence comes from increasing key operands, not a longer unbounded string

#### Scenario: Requested form is checked without inventing a wrong value

- **WHEN** a correct numeric result is entered in the other form
- **THEN** the existing fraction or decimal form response asks for the requested form
- **AND** no numeric misconception is predicted for that equal value
