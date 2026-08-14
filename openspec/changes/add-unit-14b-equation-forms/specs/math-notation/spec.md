## ADDED Requirements

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
