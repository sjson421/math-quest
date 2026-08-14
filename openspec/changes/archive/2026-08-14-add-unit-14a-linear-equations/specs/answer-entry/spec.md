## ADDED Requirements

### Requirement: An equation's answer slot is framed by the variable it solves for

Where a problem displays an equation, the answer slot SHALL be presented as the variable
followed by an equals sign and the slot, beneath the equation. It SHALL NOT be appended to
the equation as a further equality.

Every display shipped before Unit 14 shows an open expression whose slot completes it, so
appending `= slot` states something true. An equation already contains its relation, and
appending another one puts a false statement on screen: `3x + 5 = 20 = 5` reads as a claim
that 20 and 5 are the same number, in the unit whose entire subject is that both sides of an
equals sign hold the same value. The frame the learner needs is the one they are being
taught to write — `x = 5`.

This requirement governs the frame only. The slot's own behaviour is unchanged and continues
to be governed by the requirements that already state it — which keys a problem offers, how
an entry is echoed, and that an unfinished entry is not a wrong answer.

Because the frame puts the equation and the slot on separate rows, the equation row is
measured on its own rather than against the budget of a row that also carries a trailing
equals sign and slot. Neither row SHALL wrap at 375px, the width the app is installed at.

#### Scenario: An equation is not given a second equals sign

- **WHEN** a problem displays the equation `3x + 5 = 20`
- **THEN** the answer slot is labelled with the variable and shown beneath the equation
- **AND** no further equals sign is appended to the equation itself

#### Scenario: Neither row wraps at the installed width

- **WHEN** the widest equation any generator can draw is rendered at 375px
- **THEN** the equation row does not wrap
- **AND** the framed slot row does not wrap with the slot at its fullest
