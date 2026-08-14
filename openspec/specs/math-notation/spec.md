# Math Notation

## Purpose

Math notation presents fractions, powers, roots, and their combinations as compact,
accessible markup that remains legible on the phone-sized offline lesson surface.

## Requirements

### Requirement: Math expressions are structured and composable

A math display SHALL carry structured notation rather than a preformatted text or TeX
string. The structure SHALL represent text, ordered rows, stacked fractions, superscripts,
and radicals, and every primitive SHALL compose recursively wherever it has child notation.

The same notation surface SHALL own every stacked fraction it presents, including a fraction
echoed in the answer slot. No formula-specific display variant SHALL be required to combine
the five primitives.

#### Scenario: A fraction is stacked

- **WHEN** a math display represents three fourths as a fraction
- **THEN** the numerator appears above the denominator with a visible fraction rule

#### Scenario: A mixed expression composes primitives

- **WHEN** a display combines text and a fraction in one ordered row
- **THEN** both appear as one expression in declaration order
- **AND** the renderer does not require a mixed-number-specific display shape

#### Scenario: Deep notation remains general

- **WHEN** a fraction contains a signed radical expression whose radicand contains a
  superscript
- **THEN** every nested part is rendered by the same five composable notation primitives
- **AND** no formula-specific markup is required

### Requirement: Every expression has one meaningful accessible name

Every math display SHALL require an authored spoken label for the complete expression. The
rendered expression SHALL expose exactly one math role with that label, and its visual
notation subtree SHALL be excluded from the accessibility tree so numerators, denominators,
and scripts are not announced as unrelated values.

#### Scenario: A stacked fraction is announced as one expression

- **WHEN** three fourths is rendered from structured notation with the label “three fourths”
- **THEN** assistive technology finds one math expression named “three fourths”
- **AND** it does not encounter separate accessible text for 3 and 4

#### Scenario: A nested formula keeps its authored meaning

- **WHEN** a recursively nested expression is rendered
- **THEN** its complete authored spoken label is the only accessible name for the notation

### Requirement: A fraction entry echoes as math notation

When a keypad entry contains a fraction slash, the answer slot SHALL present its numerator
and denominator as a stacked fraction through the same notation surface. This visual echo
SHALL NOT change the entry string submitted to the answer checker, including while the entry
is incomplete.

#### Scenario: A complete fraction is echoed without changing its value

- **WHEN** the learner has entered `3/4`
- **THEN** the answer slot displays 3 over 4 as a stacked fraction
- **AND** the checker still receives `3/4`

#### Scenario: An incomplete fraction stays visible

- **WHEN** the learner has entered `3/`
- **THEN** the answer slot keeps the numerator and an unfinished denominator visible
- **AND** submitting it is still handled as an unfinished entry

#### Scenario: A fraction entry inside a larger math expression has one owner

- **WHEN** a stacked fraction answer is visually nested inside a column expression whose
  outer math role names the complete problem
- **THEN** that enclosing name reads the answer as numerator over denominator
- **AND** the hidden visual subtree does not expose a second math expression

### Requirement: Notation works in the offline phone surface

Math notation SHALL render as application markup and local CSS without canvas, a runtime
service, or separately downloaded font assets. The representative curriculum structures —
stacked and mixed fractions, positive and negative superscripts, radicals, a nested
quadratic formula, and geometry formulas — SHALL remain legible without horizontal overflow
at a 375-pixel viewport.

#### Scenario: Static rendering exposes the notation

- **WHEN** a math expression is rendered in the node-side component test environment
- **THEN** its visible structure and singular accessible label are present in static markup

#### Scenario: Representative notation fits a phone

- **WHEN** the representative curriculum expressions are rendered at 375 pixels wide
- **THEN** neither the page nor any expression overflows horizontally

#### Scenario: The installed app needs no notation download

- **WHEN** the app renders math notation while offline
- **THEN** all notation markup and styling are already available locally

### Requirement: An equation may be presented as structured notation

An equation display SHALL be able to present its equation as structured notation rather than
as plain characters, using the same composable primitives every other notated display uses.
Where it does, the rendered notation SHALL expose exactly one accessible name, and that name
SHALL be the equation's text form — the same string independent verification rebuilds from
the equation's carried source values.

This is what lets an equation contain a real stacked fraction. A fraction written as a slash
between plain characters is the presentation this capability exists to replace, and an
equation is the one display arm that had no way to avoid it.

Presenting an equation as notation SHALL NOT change what the answer surface beneath it does.
The frame, the slot and the entry rules stay governed by the requirements that already state
them.

#### Scenario: An equation contains a stacked fraction

- **WHEN** an equation display presents the variable over 3, plus 2, equal to 7
- **THEN** the fraction appears stacked with a visible fraction rule
- **AND** the equation is announced as one expression with one name

#### Scenario: A plain equation is unchanged

- **WHEN** an equation display carries no structured notation
- **THEN** its equation renders as its text form, as it did before

#### Scenario: The accessible name matches the verified text

- **WHEN** an equation is presented as structured notation
- **THEN** its one accessible name is the equation text that its carried source values rebuild

