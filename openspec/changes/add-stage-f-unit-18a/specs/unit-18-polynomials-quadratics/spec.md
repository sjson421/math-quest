## Purpose

Teaches polynomial addition, subtraction, multiplication, and factoring through the first six Unit 18 skills, using bounded quadratic expression entry and specific diagnoses for common algebra mistakes.

## ADDED Requirements

### Requirement: Increment 18a makes the first six Unit 18 skills playable

The system SHALL generate `add-polynomials`, `sub-polynomials`, `mult-monomial`, `foil`, `factor-gcf-poly`, and `factor-trinomial` under their manifest ids and in curriculum order. Every scoped problem SHALL answer through expression input with variable `x` and maximum degree two, satisfy the existing determinism, computed-answer, measurable-difficulty, variety, agreement, and content contracts, and use only Stage F's available capabilities.

#### Scenario: Six skills become implemented in order

- **WHEN** the Unit 18a generators are registered after Unit 17
- **THEN** the first six Unit 18 skills resolve as implemented in manifest order
- **AND** `difference-of-squares`, `solve-by-factoring`, and `quadratic-formula` remain planned
- **AND** roadmap item 23 remains unchecked

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
