# Problem Generation

## Purpose

The contract every problem generator meets: what it must compute for itself, what must be
recoverable from what the learner sees, and what must stay true when the machinery behind it
is rewritten.

These rules already hold in practice but have never been written down. Stating them matters
now because 195 generators are still to be authored, and a rule enforced only by a test that
someone remembers to copy is a rule that will eventually be skipped.
## Requirements
### Requirement: A problem is fully determined by its skill, seed, and difficulty

Generating a problem from the same skill, seed, and difficulty SHALL produce an identical
problem every time, including its prose. Nothing in generation may read the clock, a global
counter, or an unseeded random source. Reproducibility is what makes a reported wrong answer
investigable — without it, a bad problem cannot be recovered from a bug report.

#### Scenario: Same seed yields the same problem

- **WHEN** a skill generates at seed 12345 and difficulty 3 twice
- **THEN** the two problems are deeply equal
- **AND** their displayed text, hint, solution steps and misconceptions all match

#### Scenario: Every generated string is seeded

- **WHEN** a generator selects among alternative wordings
- **THEN** the selection is drawn from the seeded generator passed to it
- **AND** never from an unseeded random source

### Requirement: Generators compute their own answers

A generator SHALL derive its answer from the operands it has just chosen. Answers MUST NOT be
hardcoded, looked up from a table, or obtained from any runtime service. This is the property
that makes correctness structural rather than a matter of proofreading.

#### Scenario: Answer follows from the chosen operands

- **WHEN** a generator picks operands and builds a problem
- **THEN** the stated answer is computed from those operands

### Requirement: A displayed problem carries enough to recompute its answer

Whatever a problem shows the learner SHALL be sufficient to re-derive the correct answer
independently, without consulting the answer the generator stated. A problem whose answer can
only be taken on trust is not verifiable, and a wrong answer key is the one defect this app
cannot survive.

A displayed expression MAY contain more than one operation. Recomputation SHALL read every
operand and every operator the display shows, so an expression cannot present a term the check
does not see. A structured math display whose answer is a fraction property SHALL carry the
specific fraction operation and its integer source values rather than rely on a general
notation evaluator. A structured math display of a fraction operation SHALL carry both
displayed fractions and the operator, so the result is re-derived from exact rationals over
the common denominator. A display whose answer is a mixed number SHALL carry the source
improper fraction's integer values, from which the whole part and the proper remainder
fraction are re-derived. A comparison SHALL carry both fractions and derive their relation
from exact rational values. A value-bearing choice SHALL carry its rational value as
structured data when verification must compare it with another representation.

#### Scenario: Answer is recomputed from the display, not the generator

- **WHEN** the content check examines a generated problem
- **THEN** it re-derives the answer from the displayed operands and operators alone
- **AND** fails if that value differs from the answer the generator stated

#### Scenario: Prose alone is not sufficient

- **WHEN** a problem presents its quantities as prose rather than as an expression
- **THEN** it also carries those quantities in machine-readable form
- **AND** the recomputation uses those rather than parsing the prose

#### Scenario: Every operation in a displayed expression is read

- **WHEN** a problem displays an expression containing more than one operator
- **THEN** recomputation reads every operand and operator shown
- **AND** fails and names the problem if the display cannot be read as an expression

#### Scenario: A fraction property is derived without evaluating arbitrary notation

- **WHEN** a math display asks the learner to read, name, place, complete, simplify, or compare
  a fraction
- **THEN** it carries the operation and integer values needed to derive that answer
- **AND** verification fails if the visible notation disagrees with the carried values

#### Scenario: A fraction operation is recomputed from both displayed fractions

- **WHEN** a math display asks the learner to add or subtract two fractions
- **THEN** it carries both fractions and the operator
- **AND** verification recomputes the result over the common denominator and fails if it
  differs from the stated answer

#### Scenario: A mixed-number answer is re-derived from its carried parts

- **WHEN** a math display asks the learner to convert an improper fraction to a mixed number
- **THEN** verification derives the whole part and the remainder fraction from the carried
  source values
- **AND** fails if the displayed fraction disagrees with those values or the stated answer
  differs from the derivation

#### Scenario: A diagram selects an equivalent value-bearing choice

- **WHEN** a diagram problem asks which prose choice represents the same rational amount
- **THEN** verification compares the diagram's part counts with structured choice values
- **AND** it neither parses the prose labels nor trusts the stated choice id

### Requirement: Difficulty scales the problem measurably

Raising a skill's difficulty SHALL make its problems harder in a way that can be checked, not
merely declared. Difficulty is derived from the learner's mastery, so a band that does not
actually change the work leaves a learner repeating the same problem at every level.

#### Scenario: Higher difficulty produces larger work

- **WHEN** a skill is sampled across its full difficulty range
- **THEN** problems at the highest difficulty are measurably larger than at the lowest

#### Scenario: A flat difficulty ladder is rejected

- **WHEN** a skill produces the same operand range at every difficulty
- **THEN** the check fails and names the skill

### Requirement: Degenerate problems never reach the learner

A generator SHALL reject operand choices that teach nothing — a quantity multiplied by zero,
a value subtracted from itself, an operand of 1 where the skill is about combining — and draw
again rather than contorting its selection logic to avoid them. It SHALL also produce varied
problems rather than repeating a small handful across a lesson.

#### Scenario: Trivial operands are redrawn

- **WHEN** a draw produces operands the skill considers degenerate
- **THEN** the draw is rejected and repeated

#### Scenario: Sampling shows variety

- **WHEN** a skill is sampled across its difficulty range
- **THEN** the sample contains many distinct problems rather than a few repeated ones

### Requirement: Every part of a problem agrees with every other part

A problem's display, hint, solution steps, and predicted misconceptions SHALL all describe
the same arithmetic on the same operands. A hint naming digits the display does not show, or
a solution step whose stated result contradicts the answer, is a defect even though every
individual piece is well-formed.

#### Scenario: Solution detail matches the displayed operands

- **WHEN** a solution step shows the arithmetic for a column
- **THEN** the digits it names are the digits of the operands actually displayed

#### Scenario: Predicted misconception follows the same working

- **WHEN** a misconception predicts the value a named mistake produces
- **THEN** that value is derived from the same operands the problem displays

### Requirement: Reworking how a generator is built does not change what it produces

When a generator is rewritten onto shared machinery without any intended change to its
content, its output SHALL remain identical for every seed and difficulty. The learner-facing
text of a working skill is authored content, and a refactor that quietly rewords a hint has
changed the course while claiming to change nothing.

#### Scenario: Refactor is checked against recorded output

- **WHEN** a generator is rebuilt on shared helpers with no intended content change
- **THEN** its sampled output matches the output recorded before the rebuild
- **AND** any difference fails the check and shows what changed

#### Scenario: Intended content changes are recorded deliberately

- **WHEN** a generator's content is deliberately changed
- **THEN** the recorded output is updated in the same change as a reviewable difference

### Requirement: A signed value is displayed and verified as one value

A problem MAY display a negative value, and MAY predict a mistake whose value is negative.
Where a sign is shown to the learner it SHALL use the same notation the rest of the course
uses for subtraction, and independent verification SHALL read a displayed sign as part of the
value it belongs to rather than as an operation applied to it.

One notation, in one place, is the requirement. The notation a learner reads and the notation
an answer is submitted in are allowed to differ — they already do — but a value that appears
twice in one view SHALL appear the same way both times. A display showing one sign glyph
beside an answer slot showing another is the control disagreeing with itself about what it
just did, which reads as a defect and cannot be distinguished from one.

#### Scenario: A signed display is recomputed correctly

- **WHEN** a problem displays arithmetic with one or more negative operands
- **THEN** verification evaluates it with each sign attached to its own value
- **AND** fails if the result differs from the answer the generator declared

#### Scenario: A predicted mistake may be negative

- **WHEN** a generator predicts a mistake whose value is below zero
- **THEN** the prediction is carried and diagnosed like any other
- **AND** it is filtered only if it equals the correct answer or another prediction

#### Scenario: One value does not appear in two notations at once

- **WHEN** a value the learner has entered is shown back beside a problem that also shows a sign
- **THEN** both are drawn with the same sign notation

### Requirement: The wording gate records every field a generator sets

The per-unit recorded-output gate SHALL render every field a problem carries, and SHALL fail
naming any field a generator sets that it does not render.

A field the gate does not render is a field the gate does not protect. What a problem permits
to be typed into it, and which line a value is placed on, are both authored decisions that
change what the learner sees and can be got wrong silently — so both are recorded alongside
the prompt, the display and the answer rather than left to a reviewer to notice missing.

This SHALL extend to the fields **inside** a display, including optional ones. The gate's
automatic failure names a problem's own fields; the interior of a display is checked by
nothing, so an unrendered display field passes in silence — and an optional display field
that is absent SHALL be recorded as absent rather than printed as a missing value. A change
whose whole surface is a new display field would otherwise leave the gate reporting no
difference, which is precisely the assurance the gate exists to give.

#### Scenario: An answer-entry declaration is recorded

- **WHEN** a generator declares which character classes its answer may use
- **THEN** the recorded output for that problem shows the declaration

#### Scenario: A declared number line is recorded

- **WHEN** a generator declares the line its answer is placed on
- **THEN** the recorded output for that problem shows that line

#### Scenario: An unrendered field fails the gate

- **WHEN** a generator sets a field the gate does not render
- **THEN** the gate fails and names that field

#### Scenario: An omitted optional frame label is recorded as absent

- **WHEN** an equation display carries no variable frame label
- **THEN** the recorded output states that it has none rather than printing an absent value

#### Scenario: Structured equation notation reaches the snapshot

- **WHEN** an equation display carries structured notation
- **THEN** the recorded output renders that notation

#### Scenario: A prose display's equation payload reaches the snapshot

- **WHEN** a story display carries equation source data
- **THEN** the recorded output renders those carried terms rather than falling through to a
  payload it does not have

### Requirement: Mixed-number displays are independently verifiable

A structured math display that converts or combines mixed numbers SHALL carry every whole,
numerator, denominator, and operator needed to reconstruct both its visible notation and its
exact answer. Verification SHALL fail when the notation, spoken label, or stated answer
disagrees with that data.

#### Scenario: Mixed-to-improper is derived from all three parts

- **WHEN** a display carries whole `2`, numerator `3`, and denominator `4`
- **THEN** verification reconstructs `2 3/4` and derives the exact answer `11/4`

#### Scenario: Mixed arithmetic reads both operands

- **WHEN** a display adds or subtracts two mixed numbers
- **THEN** verification converts both carried mixed numbers to exact improper fractions
- **AND** applies the carried operator without trusting the generator's stated answer

### Requirement: Fraction multiplication and division are independently verifiable

A structured fraction multiplication or division display SHALL carry both fractions and its
operator. Verification SHALL reconstruct the visible notation and SHALL derive the result by
multiplying straight across or multiplying by the divisor's reciprocal, respectively.

#### Scenario: Division reads operand order

- **WHEN** a display carries `a/b ÷ c/d`
- **THEN** verification derives `a/b × d/c`
- **AND** fails if the displayed operands, operator, or stated answer disagree

### Requirement: A proper-fraction story is verified from integer part and whole operands

A story that asks what fraction one integer quantity is of a larger integer whole SHALL carry
the part and whole in that order with division as its operation. Its exact rational answer
SHALL be derived from those operands, not from prose or a rounded decimal.

#### Scenario: Fraction story preserves exactness

- **WHEN** a story carries part `3` and whole `8`
- **THEN** verification derives the exact rational value `3/8`
- **AND** the answer remains equivalent under exact rational comparison

### Requirement: Decimal displays carry exact base-ten semantics

A displayed decimal problem SHALL carry integer source digits and their base-ten scales for
every visible decimal, together with the operation or property being asked. Verification
SHALL reconstruct the visible decimal text from those fields and SHALL derive the answer with
exact rational arithmetic rather than binary floating-point arithmetic.

#### Scenario: Visible decimal text agrees with semantic data

- **WHEN** a decimal problem carries coefficient `304` at scale `2`
- **THEN** verification reconstructs the visible value as `3.04`
- **AND** fails if the displayed digits, decimal point, or retained place disagree

#### Scenario: Decimal arithmetic is recomputed exactly

- **WHEN** a decimal addition display carries `0.1 + 0.2`
- **THEN** verification derives the exact value `3/10`
- **AND** it does not depend on the host language's floating-point result

#### Scenario: Decimal properties use the carried operation

- **WHEN** a decimal display asks for a place digit, reading, comparison, or rounding result
- **THEN** verification derives that result from the carried coefficients, scales, requested
  place, and operation
- **AND** fails if the generator's stated answer disagrees

### Requirement: Percent prose carries independently verifiable source data

A prose display whose answer is derived by a percent relationship SHALL carry the named
source quantities and operation separately from its learner-facing text. Independent
verification SHALL reconstruct both the visible statement and the exact answer from that
structured data, without parsing prose, consulting the generator's stated answer, or using
rounded floating-point intermediates.

#### Scenario: A percent relationship is verified from displayed quantities

- **WHEN** a problem states that 12 is what percent of 60
- **THEN** the display carries 12 as the part and 60 as the whole
- **AND** verification reconstructs the visible statement from those values
- **AND** verification derives 20 as the answer independently

#### Scenario: Applied money remains exact

- **WHEN** a percent problem applies a rate to a dollar amount
- **THEN** the display carries the amount as exact integer cents and the rate as a whole-number percent
- **AND** verification derives the answer without a floating-point money intermediate

### Requirement: Ratio and proportion displays carry independently verifiable source data

A prose or structured-math display whose answer is derived from a ratio, unit rate,
proportion, scale drawing, or unit conversion SHALL carry the named source quantities,
units, and operation separately from its learner-facing output. Independent verification
SHALL reconstruct the visible statement or notation and derive the exact numeric answer or
unique choice from that structured data without parsing prose or consulting the generator's
stated answer.

#### Scenario: A directed ratio is rebuilt from category counts

- **WHEN** a problem asks for the ratio of one stated category count to another
- **THEN** verification reconstructs the category order and visible statement from the
  carried counts and labels
- **AND** it derives the exact first-to-second rational value independently

#### Scenario: A best-value choice is rebuilt from both offers

- **WHEN** a problem asks which of two offers has the lower unit price
- **THEN** verification reconstructs both visible offers from their carried counts and
  prices
- **AND** it derives the unique choice by comparing both exact per-item rates

#### Scenario: A proportion or conversion keeps its displayed relation honest

- **WHEN** a problem displays an equal-ratio, scale, or measurement-conversion relation
- **THEN** verification reconstructs every visible value, blank, and unit from structured
  data
- **AND** it fails if the visible relation or stated answer disagrees with that data

### Requirement: Power and root displays carry independently verifiable source data

A structured-math display whose answer is derived from an exponent, a perfect square, a
root estimate, or a same-base power multiplication or division SHALL carry the base,
exponent(s), or radicand separately from its learner-facing notation and label.
Independent verification SHALL reconstruct the visible notation and label and derive the
exact answer from that structured data without trusting the generator's stated answer.

#### Scenario: An evaluated power is rebuilt from base and exponent

- **WHEN** a problem asks for the evaluated value of a displayed power
- **THEN** verification reconstructs the superscript notation from the carried base and
  exponent
- **AND** it derives the exact answer by raising the base to the exponent independently

#### Scenario: A same-base power result is rebuilt from both exponents

- **WHEN** a problem asks for the resulting exponent of a same-base multiplication or
  division of two displayed powers
- **THEN** verification reconstructs both displayed powers from the carried base and
  exponents
- **AND** it derives the exact resulting exponent by adding or subtracting the carried
  exponents independently

### Requirement: A predicted misconception may carry a non-numeric value

A generator MAY predict a mistake whose result is not a plain number. Text-valued predictions
represent exact authored forms such as an unsimplified or mis-transformed algebraic expression;
point-valued predictions represent an exact structured integer ordered pair; root-pair
predictions represent two exact rational roots whose order is not meaningful. Each kind SHALL
reach the learner and be diagnosable on the same terms as a numeric prediction, subject to the
kind-specific validation and comparison below.

A text prediction SHALL be carried unless blank, deduplicated against identical text
predictions, and matched against the learner's trimmed raw entry by direct comparison. No
algebraic equivalence is performed. The correct-answer exclusion SHALL NOT be applied to text:
an expression answer has no numeric value to compare against, so a generator remains
responsible for constructing text predictions that cannot coincide with its answer.

A point prediction SHALL contain two finite integers. It SHALL be carried unless it equals the
structured point answer, duplicates an earlier ordered point, or cannot be placed on the
declared lattice of its coordinate-plane input problem. It SHALL be diagnosed only when the
learner's parsed point has the same x and y in the same order. `(3, 2)` and `(2, 3)` are
distinct predictions.

A root-pair prediction SHALL contain two valid exact rationals and belong to a problem whose
answer and input mode both declare a root pair. It SHALL be carried unless it equals the
structured root-pair answer or duplicates an earlier root-pair prediction after exact rational
normalization and order-insensitive comparison. A malformed pair, including a non-finite
component or zero denominator, or a pair attached to another answer surface SHALL be dropped.
It SHALL be diagnosed only when both submitted roots match the prediction, in either order.
Reversing a pair SHALL NOT create a second prediction; repeating one root SHALL remain distinct
from a pair of two different roots.

Numeric, text, point, and root-pair predictions SHALL be validated and deduplicated within
their own kinds. Similar written forms across kinds SHALL NOT collide.

#### Scenario: A non-numeric prediction reaches the learner

- **WHEN** a generator predicts a non-blank text mistake
- **THEN** the prediction is carried in the problem's misconceptions unless it duplicates
  another text prediction

#### Scenario: A non-numeric prediction is diagnosed on submission

- **WHEN** a learner's raw entry, trimmed, exactly matches a carried text prediction
- **THEN** that prediction is returned as the diagnosis

#### Scenario: A blank non-numeric prediction is dropped

- **WHEN** a generator predicts a mistake whose value is an empty or whitespace-only string
- **THEN** the prediction does not reach the learner

#### Scenario: Non-numeric and numeric predictions do not collide

- **WHEN** a problem carries numeric, text, point, and root-pair predicted misconceptions with
  similar written forms
- **THEN** deduplication applies within each kind independently
- **AND** otherwise-valid predictions are never compared across kinds

#### Scenario: A non-numeric prediction equal to the answer is not dropped for the generator

- **WHEN** a generator predicts a text mistake whose text equals its own canonical expression
  answer
- **THEN** the prediction is still carried, because no correct-answer exclusion runs for text

#### Scenario: A point prediction equal to the answer is dropped

- **WHEN** a point-answer problem predicts the same ordered point as its answer
- **THEN** that prediction does not reach the learner

#### Scenario: Duplicate point predictions keep the first diagnosis

- **WHEN** two predictions carry the same ordered point under different tags
- **THEN** only the first prediction reaches the learner
- **AND** a prediction carrying the swapped point remains distinct

#### Scenario: Invalid or unreachable point predictions are dropped

- **WHEN** a point prediction contains a non-finite or non-integer coordinate, or is not a
  target on its coordinate-plane input surface
- **THEN** that prediction does not reach the learner

#### Scenario: Swapped coordinates receive their diagnosis

- **WHEN** `(2, 3)` is carried as the coordinate-order misconception for answer `(3, 2)`
- **AND** the learner confirms `(2, 3)`
- **THEN** diagnosis returns the coordinate-order misconception and its stable tag

#### Scenario: An unpredicted point has no diagnosis

- **WHEN** the learner confirms a valid wrong point not carried by any misconception
- **THEN** diagnosis returns no misconception

#### Scenario: Invalid point input has no diagnosis

- **WHEN** an entry cannot be parsed as a finite integer point
- **THEN** it matches no structured point misconception

#### Scenario: A root-pair prediction equal to the answer is dropped

- **WHEN** a root-pair problem predicts its exact answer with the two roots reversed
- **THEN** that prediction does not reach the learner

#### Scenario: Duplicate root-pair predictions keep the first diagnosis

- **WHEN** two predictions carry the same exact roots in opposite orders under different tags
- **THEN** only the first prediction reaches the learner

#### Scenario: A predicted root pair is diagnosed in either order

- **WHEN** roots `−3` and `−3` are carried as the repeated-root misconception
- **AND** the learner submits those two values in either slot order
- **THEN** diagnosis returns the repeated-root misconception and its stable tag

#### Scenario: An invalid authored root-pair prediction is dropped

- **WHEN** a generator predicts a root pair with a non-finite component, a zero denominator,
  or no matching root-pair answer and input mode
- **THEN** that prediction does not reach the learner

#### Scenario: An invalid root pair has no diagnosis

- **WHEN** either submitted root cannot be parsed as an exact rational
- **THEN** the entry matches no structured root-pair misconception

### Requirement: Single-variable expression displays carry independently verifiable source data

A display whose learner-facing content names a single declared variable SHALL carry the source
coefficients, constants, and any family selector separately from its rendered text. Unit 13
expression work SHALL use `AlgebraData`; Unit 18 polynomial work SHALL use operation-specific
`PolynomialData`. Independent verification SHALL derive the exact numeric answer, expected
canonical expression, or one correct choice from that structured data without parsing
learner-facing text or trusting the generator's stated answer.

The structured data SHALL also be sufficient to rebuild the complete visible expression and
provide difficulty evidence from source operands. A polynomial factoring payload SHALL carry
the displayed coefficients or factors from which verification can independently derive the
requested factorization; it SHALL NOT carry an opaque canonical answer string.

#### Scenario: A one-term substitution is rebuilt from its coefficient and value

- **WHEN** a problem asks for the value of a one-term expression after substituting a given
  value for its variable
- **THEN** verification derives the exact numeric answer by multiplying the carried
  coefficient by the carried value independently

#### Scenario: A translated phrase is rebuilt from its named number and family

- **WHEN** a problem asks for the expression matching an order-sensitive subtraction phrase
- **THEN** verification derives the expected canonical expression from the carried number
  and phrase family independently

#### Scenario: A like-term choice is rebuilt from its coefficients and letter

- **WHEN** a problem asks which offered term is a like term to a displayed target
- **THEN** verification derives the one correct choice from the carried target letter and
  matching coefficient independently

#### Scenario: A multi-term substitution is rebuilt from its coefficient, constant, and value

- **WHEN** a problem asks for the value of a two-term expression after substituting a given
  value for its variable
- **THEN** verification derives the exact numeric answer from the carried coefficient,
  constant, sign, and value independently

#### Scenario: Combined or distributed terms are rebuilt from their source coefficients

- **WHEN** a problem asks for the combined form of like terms, or the distributed form of a
  coefficient across a parenthesized sum
- **THEN** verification derives the expected canonical expression from the carried source
  coefficients and constant independently

#### Scenario: A negative distribution is rebuilt from its coefficient, constant, and inner sign

- **WHEN** a problem asks for the distributed form of a negative coefficient across a
  parenthesized sum or difference
- **THEN** verification derives the expected canonical expression from the carried
  coefficient, constant, and inner sign independently, including the sign of both resulting
  terms

#### Scenario: A factored form is rebuilt from its common factor and inner terms

- **WHEN** a problem asks for the factored form of a sum whose terms share a common factor
- **THEN** verification derives the expected canonical expression from the carried common
  factor and the inner coefficient and constant independently, and derives the displayed
  expanded sum from the same data

#### Scenario: Polynomial arithmetic is rebuilt from visible source operands

- **WHEN** a Unit 18 problem adds or subtracts two polynomials, distributes a monomial, or multiplies two binomials
- **THEN** verification independently derives every result coefficient from the carried visible operands
- **AND** rejects a display or answer that disagrees with that derivation

#### Scenario: Polynomial factoring is derived rather than read back

- **WHEN** a Unit 18 problem factors a greatest common monomial or a monic trinomial
- **THEN** verification derives the factorization from the carried expanded coefficients
- **AND** confirms that the factors rebuild the displayed polynomial

#### Scenario: Polynomial data reaches every authored-content gate

- **WHEN** the closed polynomial operation data gains a new arm
- **THEN** independent answer verification, source-magnitude evidence, learner-text collection, and recorded output require explicit handling
- **AND** the operation cannot silently inherit unrelated algebra semantics

### Requirement: Equation displays carry independently verifiable source data

A display whose learner-facing text is a **statement already containing a relation** — an
equality or an inequality, as opposed to an open expression whose answer is its value — SHALL
carry that statement's source relation, coefficients, constants, right-hand value, and family
selector separately from the text, as `EquationData`. Independent verification SHALL derive
the exact answer from that structured data alone, without parsing the displayed statement and
without trusting the generator's stated answer.

The carried data SHALL NOT include the solution itself. A payload that carries the answer
and a verification that reads it back is the generator's stated answer under another name,
which is the one thing this capability's independence rule exists to prevent. Every carried
value SHALL be a quantity the statement puts on screen.

This is the third case of what a display's answer is, and it is why the existing arms cannot
serve it. Where a displayed expression's answer is **the value of what is shown**,
recomputation may evaluate the display. Where the answer is **a rewriting of what is shown**,
the display is prose and carries its operands alongside. A relation is neither: evaluating
`3x + 5 = 20` yields no number, and the answer is not a restatement of it but something
derived from the whole statement.

A relation's derived answer is not always a number, and where it is a number that number is
not always a solution. Where the answer is the value that makes an equality true,
verification SHALL derive that value. Where the answer is a **property of the statement** —
how many solutions it has, what its graph looks like, what it says in words — verification
SHALL derive that property from the carried terms and compare it against the identity of the
stated choice. Where the answer is a **relation** rather than a value, verification SHALL
derive both the solved boundary and the solved relation, including whether a negative
multiplier reversed it, and compare the pair against the identity of the stated choice. Where
the answer is a **count of the values satisfying the statement**, verification SHALL derive
that count over the stated range. Where the answer is an **expression in a second letter**,
verification SHALL derive that expression from the carried terms and compare it against the
stated expression. In every case the derivation SHALL run over the carried values, never over
the displayed text and never over the generator's stated answer.

Verification SHALL also confirm that the displayed statement agrees with the carried values,
so a generator cannot show one statement and carry another. Where the statement is presented
as structured notation rather than plain characters, the carried values SHALL still reproduce
the statement's text form, and that text SHALL remain its accessible name — so one comparison
covers both what is rendered and what is announced.

#### Scenario: A one-step solution is rebuilt from its constant and family

- **WHEN** a problem displays an equation adding or subtracting a constant from a variable
- **THEN** verification derives the exact answer from the carried constant, the carried
  right-hand value, and which operation the equation shows
- **AND** the payload carries no solution for it to read instead

#### Scenario: A two-step solution is rebuilt from its coefficient and constant

- **WHEN** a problem displays an equation applying a coefficient and a constant to a variable
- **THEN** verification derives the exact answer from the carried coefficient, constant,
  inner sign, and right-hand value independently

#### Scenario: A both-sides solution is rebuilt from all four carried terms

- **WHEN** a problem displays an equation with a variable term on each side
- **THEN** verification derives the exact answer from the two carried coefficients and the
  two carried constants independently

#### Scenario: A parenthesised solution is rebuilt before distributing

- **WHEN** a problem displays an equation whose variable side is a bracketed sum multiplied
  by a coefficient
- **THEN** verification derives the exact answer from the carried coefficient, inner
  constant, and right-hand value independently

#### Scenario: A cleared-denominator solution is rebuilt from the carried fraction

- **WHEN** a problem displays an equation whose variable side is a fraction over a
  denominator
- **THEN** verification derives the exact answer from the carried denominator, constant and
  right-hand value independently

#### Scenario: A solution count is rebuilt from the carried terms

- **WHEN** a problem displays an equation whose answer is how many solutions it has
- **THEN** verification derives that count by comparing the carried variable terms and the
  carried constants
- **AND** compares it against the identity of the stated choice rather than a number

#### Scenario: A rearranged expression is rebuilt from the carried coefficients

- **WHEN** a problem displays a two-letter equation whose answer is the subject letter
  expressed in the other
- **THEN** verification derives that expression from the carried coefficients and constant
- **AND** compares it against the stated expression answer

#### Scenario: A solved relation is rebuilt with its direction

- **WHEN** a problem displays an inequality whose answer is the solved relation
- **THEN** verification derives the boundary and the resulting relation from the carried
  relation, the carried right-hand value, and whichever of a constant or a multiplier that
  arm carries
- **AND** reverses the relation exactly when a carried multiplier is negative
- **AND** compares the derived statement against the identity of the stated choice

#### Scenario: A graph description is rebuilt from the carried relation

- **WHEN** a problem displays an inequality whose answer describes its graph
- **THEN** verification derives the circle type from whether the carried relation is strict
- **AND** derives the shading direction from which way the carried relation points

#### Scenario: A satisfying count is rebuilt over the stated range

- **WHEN** a problem displays a compound statement whose answer is how many whole numbers
  satisfy it
- **THEN** verification counts them over the carried range by testing each against the
  carried bounds and connective
- **AND** the payload carries no count for it to read instead

#### Scenario: The displayed equation must agree with the carried values

- **WHEN** the content check examines an equation problem
- **THEN** it fails and names the problem if the displayed equation does not follow from the
  carried source values

#### Scenario: The displayed inequality must agree with the carried values

- **WHEN** the content check examines a problem whose display is an inequality
- **THEN** it fails and names the problem if the displayed statement does not follow from the
  carried relation and quantities
- **AND** the check rebuilds the statement's text from those values rather than parsing what
  is shown

#### Scenario: A notated equation is checked against the same text

- **WHEN** an equation problem presents its equation as structured notation
- **THEN** it fails and names the problem if the equation rebuilt from its carried values
  does not equal that problem's equation text
- **AND** that text is the accessible name the rendered notation exposes

### Requirement: A prose problem whose structure is an equation carries its equation terms

A word problem whose underlying structure is a linear equation SHALL carry that equation's
source terms alongside its prose, in the same structured form an equation display carries.
Independent verification SHALL derive the answer from those terms without reading the
sentence.

A word problem deliberately mentions quantities its answer does not use, so its prose is for
the learner and never a data format. The existing prose payloads cannot serve this case: a
pair of operands and one operator states a single operation, and an equation word problem
states two applied in sequence.

#### Scenario: A two-step story is solved from its carried terms

- **WHEN** a word problem describes a number multiplied by a coefficient with a constant then
  added, giving a stated result
- **THEN** verification derives the exact answer from the carried coefficient, constant and
  result
- **AND** does not parse the sentence to do so

#### Scenario: The sentence agrees with the carried terms

- **WHEN** the content check examines an equation word problem
- **THEN** the sentence rebuilt from its frame and carried terms equals the sentence on screen

### Requirement: Coordinate-plane content declares the operation being verified

A generated coordinate-plane content problem SHALL carry a closed operation-specific source
record beside its generic plane declaration. The record SHALL distinguish plotting a stated
point, plotting a selected table row, identifying a quadrant, finding slope from a graph,
finding slope from two points, finding a y-intercept, reading slope-intercept form, selecting
a graph for an equation, writing an equation from a graph, finding a parallel or perpendicular
slope, and solving a system by graphing, substitution, elimination, or a fixed word-problem
frame.

Independent verification SHALL validate the plane first, validate that the operation's source
data agrees with the visible points, lines, equation context, table, variable labels, or story
quantities, and then derive the answer without reading the problem's stated answer. Equation
text shown beside a graph SHALL be rebuilt from the same structured values used for
verification. A coordinate-plane problem without recognized operation data SHALL continue to
fail closed rather than fall through to the stated answer.

For a Unit 17 system, verification SHALL solve the two represented equations by exact integer
arithmetic. The derived answer SHALL be an integer coordinate on the declared input lattice. A
malformed, singular, inconsistent, underdetermined, out-of-bounds, or visually disagreeing
system SHALL fail closed and name its skill.

#### Scenario: A point answer comes from visible source data

- **WHEN** coordinate-plane input asks for a stated point or one identified table row
- **THEN** verification derives the exact ordered pair from the operation record
- **AND** fails if the carried plane or table disagrees with that source

#### Scenario: Table rows retain one linear relationship

- **WHEN** a table-to-graph operation carries three or more unique-x rows
- **THEN** verification proves every row is collinear by exact integer cross-products
- **AND** rejects the problem if one row leaves that relationship

#### Scenario: A quadrant comes from coordinate signs

- **WHEN** a quadrant problem displays one non-axis point
- **THEN** verification derives the quadrant choice identity from that point's x and y signs
- **AND** verifies that the derived identity is among the offered choices

#### Scenario: Slope is derived exactly from two points

- **WHEN** a slope problem carries two distinct points
- **THEN** verification computes change in y over change in x in one consistent order
- **AND** rejects a horizontal or vertical draw in the selected Unit 16a skills
- **AND** compares the reduced exact value with the stated answer

#### Scenario: An intercept comes from the displayed line

- **WHEN** a y-intercept problem displays one non-vertical line
- **THEN** verification derives its value at x zero from the line's defining points
- **AND** fails if that value differs from the stated answer

#### Scenario: Slope-intercept data agrees with its line and question

- **WHEN** a slope-intercept problem carries a slope, intercept, and selected property
- **THEN** verification rebuilds the visible equation and matches the line to those values
- **AND** derives the requested coefficient as an exact answer

#### Scenario: A graph choice matches one candidate line

- **WHEN** graph-from-equation data carries an integer slope and intercept beside two lines
- **THEN** verification finds exactly one candidate with that slope and intercept
- **AND** maps its declaration index to the offered line choice without trusting the answer id

#### Scenario: An equation answer is derived from the displayed graph

- **WHEN** an equation-from-graph problem displays one non-vertical integer-slope line
- **THEN** verification derives its slope and y-intercept from the line's defining points
- **AND** compares the right side of `y =` under existing expanded-expression semantics

#### Scenario: A related slope is derived from the reference line

- **WHEN** a parallel-or-perpendicular problem displays one non-horizontal, non-vertical line
- **THEN** verification derives its exact slope and applies the declared relationship
- **AND** compares the resulting reduced rational with the stated answer

#### Scenario: Graph geometry derives a system intersection

- **WHEN** `system-by-graphing` declares two nonparallel visible lines
- **THEN** verification derives their unique exact intersection from their defining points
- **AND** compares that point with the structured answer without trusting it

#### Scenario: Algebraic methods derive the same ordered pair

- **WHEN** substitution or elimination carries two visible linear equations
- **THEN** verification solves their coefficient records exactly
- **AND** rejects any equation text that disagrees with those coefficients or constants

#### Scenario: Story quantities rebuild the equations

- **WHEN** `system-words` carries its fixed frame and quantities
- **THEN** verification rebuilds the learner-facing sentence and both equations from that data
- **AND** derives the two named counts in the displayed variable order

#### Scenario: Invalid systems fail closed

- **WHEN** system data is malformed, singular, inconsistent, underdetermined, out of bounds, or
  disagrees with visible context
- **THEN** independent verification names the skill and rejects it
- **AND** it does not trust the attached point answer

#### Scenario: Missing operation data still fails closed

- **WHEN** a coordinate-plane display carries no recognized content operation
- **THEN** independent verification names the problem and rejects it
- **AND** it does not trust a numeric, choice, or point answer attached to the graph

### Requirement: Coordinate operation data reaches every authored-content gate

The learner-text and recorded-output gates SHALL handle coordinate operation data explicitly.
The wording snapshot SHALL state the operation, target point or complete table rows where
present, and the plane declaration. Learner-text collection SHALL include every target or
table value rendered beside the graph.

For linear-equation operations, recorded output SHALL additionally state the slope, intercept,
relationship source, system equation pair, or complete story source where present, and both
candidate lines where present. Learner-text collection SHALL include every equation, variable
meaning, and story quantity rendered beside the graph. Difficulty evidence for Unit 17 SHALL
come from visible plane bounds and source coefficients or quantities rather than from the
stated answer alone.

#### Scenario: A table operation is recorded completely

- **WHEN** a generated coordinate display carries table rows and a selected x-value
- **THEN** its recorded output includes every row and the selected value
- **AND** changing either produces a reviewable snapshot difference

#### Scenario: A new coordinate operation cannot disappear silently

- **WHEN** the closed coordinate operation union gains an unhandled arm
- **THEN** exhaustive verification, text, or recorded-output handling fails
- **AND** the new arm cannot inherit unrelated graph semantics

#### Scenario: An equation operation is recorded completely

- **WHEN** generated coordinate data carries a slope and intercept
- **THEN** recorded output includes both source values and the formatted equation context
- **AND** changing either produces a reviewable snapshot difference

#### Scenario: A graph choice records both candidates

- **WHEN** graph-from-equation presents two lines
- **THEN** recorded output states both defining pairs in declaration order
- **AND** the correct choice identity can be reviewed against that order

#### Scenario: System data is recorded completely

- **WHEN** a generated coordinate display carries a Unit 17 system operation
- **THEN** recorded output states the operation, both equations or complete story source, plane,
  answer point, and point-valued predictions
- **AND** changing any source value produces a reviewable snapshot difference

#### Scenario: A swapped system operation cannot pass unnoticed

- **WHEN** a generated system carries equation data under the wrong Unit 17 operation
- **THEN** exhaustive recording and independent verification identify the operation mismatch
- **AND** the content checks do not treat the authored answer as evidence of correctness

### Requirement: Function equations carry independently verifiable source data

A generated function equation SHALL carry a closed operation-specific source record beside
its visible statement. A notation-reading record SHALL contain the displayed input and output.
An evaluation record SHALL contain the displayed linear coefficient and constant, the requested
input, and the requested-input label used by the separate answer row.

Independent verification SHALL rebuild the complete visible function statement and requested
input from those values. It SHALL derive the one correct reading choice or exact evaluated
output without parsing learner-facing text or trusting the generator's stated answer.

#### Scenario: A function mapping is rebuilt from its two values

- **WHEN** a notation problem carries input `3` and output `7`
- **THEN** verification rebuilds `f(3) = 7`
- **AND** derives the stable choice meaning input `3` gives output `7`

#### Scenario: An evaluated output is rebuilt from its rule

- **WHEN** an evaluation problem carries coefficient `2`, constant `−3`, and requested input `4`
- **THEN** verification rebuilds `f(x) = 2x − 3` and the answer label `f(4)`
- **AND** derives the exact output `5`

### Requirement: Function coordinate operations reach every authored-content gate

A generated function coordinate problem SHALL distinguish domain or range selection,
linearity classification, and three-representation comparison as closed coordinate operations.
Independent verification SHALL derive domain and range from visible points, derive linearity
from exact point differences, and derive table, graph, and equation properties from their
separate structured sources. It SHALL reject missing operation data, duplicate function inputs,
ambiguous sets, mismatched classifications, hidden initial-value intercepts, comparison ties,
and any table, graph, equation, answer, or choice identity that disagrees with those sources.

Learner-text collection SHALL include every function value rendered beside or inside the graph.
Recorded output SHALL state the operation and every source point, table row, equation
coefficient, requested property, and graph declaration needed to reproduce the visible problem.
Difficulty evidence SHALL come from those displayed source values and graph bounds rather than
the stated answer.

#### Scenario: A finite relation supplies domain, range, and linearity

- **WHEN** a coordinate operation carries a finite function as plotted points
- **THEN** verification derives each distinct coordinate set and every consecutive exact slope
- **AND** it does not consult the attached choice answer to decide the requested set or class

#### Scenario: A comparison winner is rebuilt across three forms

- **WHEN** a comparison carries table rows, one graph line, one equation rule, and a requested property
- **THEN** verification derives all three rates or initial values independently
- **AND** exactly one stable `Table`, `Graph`, or `Equation` choice is the derived winner

#### Scenario: Initial-value graph evidence remains visible

- **WHEN** a comparison asks for the greatest initial value
- **THEN** verification requires the graph's y-intercept to lie on a visible y-axis tick
- **AND** requires the table to expose its row at `x = 0`

#### Scenario: New function operations cannot disappear silently

- **WHEN** either closed function operation union gains an unhandled arm
- **THEN** independent verification, learner-text collection, difficulty evidence, or recorded output fails exhaustively
- **AND** the new arm cannot inherit unrelated equation or graph semantics

### Requirement: Geometry answers are recoverable from visible source data

A geometry display SHALL carry an operation, figure family, unit, and every measurement needed
to rebuild its visible figure, provided formula reference set, and numeric answer without
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

### Requirement: Geometry wording gates record every visible field

Recorded output and learner-text collection SHALL include the geometry operation, figure
family, complete measurements, units and unit powers, side or face roles, derived accessible
figure name, provided formulas, answer kind, target, tolerance, keypad rules, and predicted
misconceptions. Adding an unrendered geometry field or operation SHALL fail the gate rather
than pass silently.

For similar figures, recorded output and learner-text collection SHALL include both figure
roles, both small measurements, the known large-side role and value, unit, missing-side role,
derived accessible name, both proportion references, exact answer, input mode, keypad rules,
hint, solution, and every predicted misconception. Adding an unhandled similar-figure field
or operation SHALL fail exhaustive recording, learner-text collection, difficulty evidence,
or independent verification rather than pass silently.

#### Scenario: A generated figure is fully reviewable

- **WHEN** a Unit 20 problem is recorded
- **THEN** a reviewer can recover its figure, formula choices, answer policy, input rules, and
  diagnoses from the recorded entry
- **AND** no authored field set by the generator is omitted

#### Scenario: Grouped solids remain distinguishable

- **WHEN** cone, pyramid, and sphere problems are recorded from their shared skill
- **THEN** each entry names its specific family, source measurements, formulas, and exact or
  rounded policy
- **AND** no family can inherit another family's unrecorded fields

#### Scenario: A generated pair is fully reviewable

- **WHEN** a `similar-figures` problem is recorded
- **THEN** a reviewer can recover the three visible sides, corresponding scale, missing role,
  formulas, and exact answer policy
- **AND** no authored field set by the generator is omitted
