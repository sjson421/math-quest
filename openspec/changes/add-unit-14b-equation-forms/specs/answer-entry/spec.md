## MODIFIED Requirements

### Requirement: An equation's answer slot is framed by the variable it solves for

Where a problem displays an equation **and its answer is a value of that equation's
variable**, the answer slot SHALL be presented as the variable followed by an equals sign and
the slot, beneath the equation. It SHALL NOT be appended to the equation as a further
equality.

Every display shipped before Unit 14 shows an open expression whose slot completes it, so
appending `= slot` states something true. An equation already contains its relation, and
appending another one puts a false statement on screen: `3x + 5 = 20 = 5` reads as a claim
that 20 and 5 are the same number, in the unit whose entire subject is that both sides of an
equals sign hold the same value. The frame the learner needs is the one they are being
taught to write — `x = 5`.

Where an equation's answer is **not** a value of its variable, the framed row SHALL be omitted
entirely — label, equals sign and answer slot together. The frame is a claim, not decoration:
it says the equation has a solution and that the answer is it. On a problem asking how many
solutions an equation has, that claim is false before the learner answers and contradicts the
correct answer on two of its three cases — `x = No solution` asserts exactly what the learner
is being asked to rule out.

Keeping the slot and dropping only the label SHALL NOT be treated as sufficient. An
unlabelled slot is an entry cursor on a screen that offers no keypad, and what it echoes is
the submitted answer's identity rather than its wording — which reads correctly only for the
skills whose options are named by their own text. Where the options are prose, the answer
surface those options provide is the whole surface, and the response names the mistake.

The framed value need not be a number. Where an equation is solved for one letter in terms of
another, the frame SHALL name the subject letter and the slot SHALL carry the expression
answer, so the row the learner completes is the rearranged formula itself.

This requirement governs the frame only. The slot's own behaviour is unchanged and continues
to be governed by the requirements that already state it — which keys a problem offers, how
an entry is echoed, and that an unfinished entry is not a wrong answer.

Because the frame puts the equation and the slot on separate rows, the equation row is
measured on its own rather than against the budget of a row that also carries a trailing
equals sign and slot. Neither row SHALL wrap at 375px, the width the app is installed at.

A structured-notation equation row SHALL carry its own bound, separate from the bound on a
plain-character row, and that bound SHALL be established by rendering rather than inferred
from the plain-character one — a stacked fraction is narrower and taller than the characters
that name it, so one number cannot govern both. Neither kind of row SHALL be left without a
bound that a later widening would fail.

#### Scenario: An equation is not given a second equals sign

- **WHEN** a problem displays the equation `3x + 5 = 20`
- **THEN** the answer slot is labelled with the variable and shown beneath the equation
- **AND** no further equals sign is appended to the equation itself

#### Scenario: An answer that is not a value of the variable is unframed

- **WHEN** a problem displays an equation and asks how many solutions it has
- **THEN** no variable label, equals sign or answer slot is shown beneath the equation
- **AND** the offered options are the only answer surface

#### Scenario: A rearranged formula is framed by its subject letter

- **WHEN** a problem displays a two-letter equation and asks for one letter in terms of the
  other
- **THEN** the frame names the subject letter
- **AND** the slot carries the expression the learner types

#### Scenario: Neither row wraps at the installed width

- **WHEN** the widest equation any generator can draw is rendered at 375px
- **THEN** the equation row does not wrap
- **AND** the framed slot row does not wrap with the slot at its fullest
