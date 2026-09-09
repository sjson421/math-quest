## ADDED Requirements

### Requirement: Stage H intros preserve authored and delegated representations

Each Stage H intro SHALL render its stable example through the same accessible markup used in
practice, suppress every interactive answer surface, and present one separate learner-facing
correct answer followed by the existing worked steps.

The `calculator-skills` intro SHALL show its stable key sequence with the sign-change key
distinguished from the subtraction operator, and SHALL present its result or chosen sequence as
learner-facing text rather than an internal choice id. The `formula-sheet` intro SHALL show its
stable figure, both structured formula references and both choice labels through the practice
diagram markup, without a numeric equals sign or empty entry frame.

A mixed-review intro's example SHALL be the problem its own generator produces at the existing
fixed intro seed and difficulty 1, which is a delegated source's problem carrying that source's
skill identity, display kind and worked steps. It SHALL render through whatever practice markup
that source already uses, and SHALL be shown beside the review's own teaching line rather than
the source's. It SHALL remain the same example across visits, and SHALL leave both the review's
and the sampled source's attempts, mastery and review counters unchanged.

All four Stage H intros SHALL remain readable at a 375-by-812-pixel viewport without horizontal
or page overflow. Their complete teaching line, leave action, and forward action SHALL remain on
screen at every example size. Their complete example, correct answer, and worked steps SHALL
remain legible and reachable, through the intro's existing worked-example scroll region when the
example is taller than the surface.

#### Scenario: An authored Stage H intro is not an answer surface

- **WHEN** the `calculator-skills` or `formula-sheet` intro opens
- **THEN** it shows the same key sequence, or the same figure, references and choice labels, as
  its fixed practice problem
- **AND** it exposes no keypad, choice buttons, answer slot, hint control, or submission action

#### Scenario: A mixed-review intro shows a source example under the review's line

- **WHEN** either mixed-review intro opens or is reviewed
- **THEN** its example is the delegated source problem for the fixed intro seed, rendered in
  that source's own practice representation with its worked steps
- **AND** the review's teaching line accompanies it, and the same example returns on a later visit

#### Scenario: A mixed-review intro changes no source progress

- **WHEN** a mixed-review intro is opened and its forward action is taken
- **THEN** only that review skill's intro-seen state changes
- **AND** the sampled source skill's attempts, mastery and review counters are unchanged

#### Scenario: Stage H intros fit the installed phone surface

- **WHEN** each of the four Stage H intros is exercised at 375 by 812 pixels
- **THEN** its teaching line and both actions are on screen, with no horizontal or page overflow
- **AND** the longest key sequence, formula label and delegated display remain legible, with a
  delegated example taller than the surface reachable in full through the worked-example region
