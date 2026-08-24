## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Increment 18a makes the first six Unit 18 skills playable

**Reason**: Its completion scenario requires the three Unit 18b skills to remain planned, which becomes false when this increment ships.

**Migration**: Replace it with `Unit 18 is complete in curriculum order`, which preserves the generator, contract, capability, ordering, and roadmap-state requirements at the completed nine-skill boundary.
