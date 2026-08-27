# unit-18-polynomials-quadratics Specification

## Purpose
Teaches polynomial addition, subtraction, multiplication, and factoring through the first six Unit 18 skills, using bounded quadratic expression entry and specific diagnoses for common algebra mistakes.
## Requirements
### Requirement: Polynomial addition and subtraction combine matching degrees

An `add-polynomials` problem SHALL show two polynomials and require the expanded polynomial formed by adding coefficients of equal degree. A `sub-polynomials` problem SHALL show one polynomial subtracted from another and require the expanded result after applying the subtraction to every term of the second polynomial. Both SHALL use comparison form `expanded`.

As a wall, every `sub-polynomials` problem SHALL provide at least two distinct, reachable predictions that remain wrong after expression comparison, including applying the subtraction only to the first term and adding the second polynomial instead of subtracting it.

#### Scenario: Matching degrees are added

- **WHEN** `add-polynomials` shows `(2x² + 3x + 4) + (x² + 5x + 6)`
- **THEN** the canonical answer is `3x² + 8x + 10`

#### Scenario: A subtraction reaches every term

- **WHEN** `sub-polynomials` shows `(5x² + 7x + 9) − (2x² + 3x + 4)`
- **THEN** the canonical answer is `3x² + 4x + 5`
- **AND** a prediction diagnoses leaving later terms positive after subtracting only the first term
- **AND** a separate prediction diagnoses adding the second polynomial

### Requirement: Monomial multiplication and FOIL produce expanded quadratics

A `mult-monomial` problem SHALL show a monomial containing `x` multiplied by a linear binomial and require the fully distributed quadratic under comparison form `expanded`. A `foil` problem SHALL show two monic linear binomials and require the expanded quadratic under the same form. The source factors SHALL determine every coefficient; no answer SHALL be selected independently of the displayed factors.

#### Scenario: A monomial multiplies both terms

- **WHEN** `mult-monomial` shows `3x(2x + 4)`
- **THEN** the canonical answer is `6x² + 12x`
- **AND** a prediction may diagnose multiplying only the first term

#### Scenario: Two binomials produce three degrees

- **WHEN** `foil` shows `(x + 2)(x + 5)`
- **THEN** the canonical answer is `x² + 7x + 10`
- **AND** the generated families include positive and negative binomial constants across the difficulty ladder

### Requirement: A common monomial factors out exactly

A `factor-gcf-poly` problem SHALL show a quadratic and linear term whose numeric coefficients share a greatest common factor above one and whose terms both contain `x`. It SHALL require that greatest numeric factor and one `x` outside a linear binomial under comparison form `exact`. The coefficients left inside SHALL be coprime, so the authored common factor is greatest, and a coefficient of one SHALL be omitted.

The displayed expanded polynomial SHALL be an incorrect answer. Predictions SHALL include leaving the polynomial expanded and taking out only the numeric factor while leaving the common `x` inside.

#### Scenario: The numeric and variable factors come outside

- **WHEN** `factor-gcf-poly` shows `6x² + 9x`
- **THEN** the canonical answer is `3x(2x + 3)`
- **AND** `3(2x² + 3x)` is diagnosed as leaving the common variable inside

#### Scenario: The displayed expansion is not accepted

- **WHEN** the canonical answer is `3x(2x + 3)`
- **THEN** entering `6x² + 9x` is incorrect rather than equivalent

### Requirement: Trinomial factoring searches for one product-and-sum pair

A `factor-trinomial` problem SHALL show a monic trinomial and require the product of two monic integer binomials under comparison form `exact`. Generated frames SHALL have one unordered integer factor pair whose product is the constant term and whose sum is the linear coefficient. The draw SHALL cover positive, negative, and opposite-sign factor families without introducing non-monic factoring.

As a major wall, every problem SHALL carry at least two distinct, reachable, wrong predictions: one binomial pair with the required product but the wrong sum, and one pair with the required sum but the wrong product. Reversing the two correct binomial factors SHALL still be accepted.

#### Scenario: One pair satisfies both conditions

- **WHEN** `factor-trinomial` shows `x² + 8x + 12`
- **THEN** the canonical answer is `(x + 2)(x + 6)`
- **AND** `(x + 3)(x + 4)` is a product-only prediction
- **AND** `(x + 1)(x + 7)` is a sum-only prediction

#### Scenario: Correct factors may be reversed

- **WHEN** the canonical answer is `(x + 2)(x + 6)`
- **THEN** `(x + 6)(x + 2)` is also correct
- **AND** the expanded trinomial remains incorrect

### Requirement: Polynomial notation and diagnoses remain enterable and unambiguous

Every scoped display, answer, solution detail, and text-valued prediction SHALL use conventional polynomial notation: descending degree, `x²` for the square, no written coefficient of one, and typographic minus in learner-facing text. Canonical answers and predictions SHALL use the expression entry grammar's accepted characters. Every prediction SHALL be typable, distinct from the answer under its declared comparison form, and distinct from the other predictions that survive generation.

#### Scenario: Natural coefficient-one notation is used

- **WHEN** a polynomial has quadratic coefficient one
- **THEN** learner-facing text writes `x²` rather than `1x²`
- **AND** a linear coefficient of one is written `x` rather than `1x`

#### Scenario: Every prediction can be submitted and diagnosed

- **WHEN** a generated Unit 18a problem carries a text-valued prediction
- **THEN** replaying its characters through the declared degree-two expression pad produces that prediction
- **AND** checking it against the answer reports incorrect
- **AND** submitting it returns its stable misconception tag

### Requirement: Unit 18 is complete in curriculum order

The system SHALL generate all nine Stage F Unit 18 skills, from `add-polynomials` through `quadratic-formula`, under their manifest ids and in curriculum order. The six Unit 18a problems SHALL continue to answer through expression input with variable `x` and maximum degree two. Unit 18b SHALL use the expression and root-pair answer surfaces required below. Every Unit 18 problem SHALL satisfy the existing determinism, computed-answer, measurable-difficulty, variety, agreement, and content contracts using only Stage F's available capabilities.

#### Scenario: Increment 18b completes Unit 18

- **WHEN** `difference-of-squares`, `solve-by-factoring`, and `quadratic-formula` are registered after the six Unit 18a generators
- **THEN** all nine Unit 18 skills resolve as implemented in manifest order
- **AND** the five Unit 19 skills remain planned
- **AND** roadmap item 23 remains open for its Unit 19 increment

### Requirement: A difference of squares factors into conjugates

A `difference-of-squares` problem SHALL show a monic square term minus a nonzero perfect-square constant and require the two conjugate linear factors through expression input with variable `x`, maximum degree two, and comparison form `exact`. Reversing the factors SHALL be correct, while leaving the expression expanded SHALL be incorrect.

Generated problems SHALL vary the square root of the constant across a measurable difficulty ladder. Predictions SHALL diagnose using two equal-sign factors and using the displayed square instead of its square root, with every carried prediction enterable and distinct under exact expression comparison.

#### Scenario: The square root becomes the conjugate constant

- **WHEN** the problem shows `x² − 25`
- **THEN** the canonical answer is `(x − 5)(x + 5)`
- **AND** `(x + 5)(x − 5)` is also correct
- **AND** the expanded expression is incorrect

#### Scenario: The conjugate pattern is diagnosed

- **WHEN** the problem shows `x² − 25`
- **THEN** `(x − 5)(x − 5)` diagnoses using the same sign twice
- **AND** `(x − 25)(x + 25)` separately diagnoses using 25 instead of its square root

### Requirement: Factored zero equations produce both roots

A `solve-by-factoring` problem SHALL show two distinct nonzero linear factors whose product equals zero and SHALL require their two exact roots as one unordered root-pair answer. The zero-product rule SHALL determine each root independently from its visible factor, and either slot order SHALL be correct.

Generated families SHALL progress from positive factor constants to mixed signs and larger magnitudes. Predictions SHALL include treating the visible factor constants as roots without changing their signs and finding one root twice instead of solving both factors. Frames SHALL keep both predictions wrong, distinct from each other, and reachable through the declared numeric keys.

#### Scenario: Each zero factor contributes one root

- **WHEN** the equation is `(x + 3)(x − 5) = 0`
- **THEN** the exact root pair is `−3` and `5`
- **AND** either root may be entered first

#### Scenario: Sign and missing-factor mistakes are diagnosed

- **WHEN** the equation is `(x + 3)(x − 5) = 0`
- **THEN** roots `3` and `−5` diagnose copying factor constants without solving
- **AND** roots `−3` and `−3` separately diagnose solving only the first factor

### Requirement: The supplied quadratic formula yields two exact roots

A `quadratic-formula` problem SHALL present a quadratic equation in standard form, identify its visible coefficients `a`, `b`, and `c`, and display the supplied formula through structured math notation with a superscript, radical, and stacked fraction. The learner SHALL substitute those coefficients and enter the two exact real roots as one unordered root-pair answer.

Every generated equation SHALL have nonzero `a`, `b`, and `c`, two distinct nonzero real roots, and a positive perfect-square discriminant. The difficulty ladder SHALL begin with monic equations and whole-number roots, then introduce non-monic equations and exact rational roots that enable the fraction key. Irrational, repeated, and complex-root cases SHALL not be generated.

Predictions SHALL diagnose using `b` where the formula requires `−b` and dividing both numerators by `a` instead of `2a`. Frames SHALL keep those root pairs valid, wrong, distinct from the answer, and distinct from each other after exact normalization and order-insensitive comparison.

#### Scenario: A supplied formula is applied to visible coefficients

- **WHEN** the equation is `2x² + 5x + 2 = 0` with `a = 2`, `b = 5`, and `c = 2`
- **THEN** the formula is displayed as `x = (−b ± √(b² − 4ac)) / 2a` using structured notation
- **AND** the exact root pair is `−2` and `−1/2`

#### Scenario: Formula substitutions receive distinct diagnoses

- **WHEN** a generated equation has a nonzero linear coefficient and two exact roots
- **THEN** one predicted pair uses `b` instead of `−b`
- **AND** another predicted pair divides by `a` instead of `2a`
- **AND** neither prediction equals the correct unordered pair

### Requirement: Unit 18b remains independently verifiable and phone-sized

Every Unit 18b answer, display, formula label, prompt coefficient mapping, prediction, hint, and solution SHALL derive from operation-specific source values. Independent verification SHALL rebuild the visible problem and exact answer without reading back the generator's stated answer. Recorded output SHALL name the source operation and semantic root values without exposing the root-pair entry encoding.

Every expression prediction SHALL be typable through the degree-two expression pad, and every root-pair prediction SHALL be typable through the problem's numeric declaration. The longest generated equation, supplied formula, two fraction-capable root slots, and keypad SHALL remain readable without horizontal or page overflow at 375 pixels.

#### Scenario: Display and answer agree from source values

- **WHEN** a Unit 18b problem is independently recomputed
- **THEN** its visible expression, equation, formula, prompt mapping, and answer agree with its operation data
- **AND** changing only the stated answer would fail verification

#### Scenario: The fullest quadratic problem fits the installed phone

- **WHEN** a representative non-monic quadratic-formula problem has two signed fraction roots entered at 375 pixels
- **THEN** the supplied formula and root-pair control remain readable and reachable
- **AND** the page and answer surface do not overflow

### Requirement: Unit 18 skills carry reviewed intro teaching lines

Each Stage F Unit 18 generator SHALL carry exactly the teaching line assigned below. Its
intro SHALL pair that line with the generator's stable difficulty-1 worked example, correct
answer, and existing worked steps without changing generated problem content.

| Skill id | Teaching line |
|---|---|
| `add-polynomials` | Add polynomials by combining number parts on terms with the same power. |
| `sub-polynomials` | Subtract a polynomial by changing every term's sign before combining. |
| `mult-monomial` | Multiply the outside term by every term inside the brackets. |
| `foil` | Multiply each term in one binomial by each term in the other. |
| `factor-gcf-poly` | Take the shared number and x outside, then divide each term by both. |
| `factor-trinomial` | Find two numbers whose product is the last term and whose sum is the middle number. |
| `difference-of-squares` | Two squares subtracted factor into matching brackets with opposite signs. |
| `solve-by-factoring` | Set each factor equal to zero; every result is a root. |
| `quadratic-formula` | Substitute a, b, and c into the supplied quadratic formula, then use both signs. |

#### Scenario: Every Unit 18 intro uses its reviewed line

- **WHEN** the Unit 18 generator set is checked at its authored source
- **THEN** all nine ids carry exactly the teaching line assigned above
- **AND** every line satisfies the teaching-line sentence, vocabulary, and forward-reference limits
- **AND** no line introduces more than one of `polynomial`, `binomial`, or `quadratic`

#### Scenario: Unit 18 examples retain expression and root-pair answers

- **WHEN** each Unit 18 intro generates its stable difficulty-1 example
- **THEN** its expanded or factored expression or unordered root pair can be recomputed independently from its semantic polynomial data and visible coefficients
- **AND** adding the teaching line changes no generated prompt, display, answer, hint, solution, expression rule, root-pair rule, formula, or misconception
