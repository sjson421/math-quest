## MODIFIED Requirements

### Requirement: A shipped intro precedes the first problem

When a playable skill carries a teaching line and its intro has not been seen, the lesson SHALL open on one intro before it presents or creates the opening warm-up. The intro SHALL show the teaching line, one generated difficulty-1 problem, that problem's correct answer, and all of its existing worked solution steps.

The example SHALL pass through the same generation validation and display rendering as a lesson problem. It SHALL use a fixed seed independent of the lesson session, so the same skill presents the same reviewed example on every visit without consuming or changing a lesson seed.

For the two full-length Stage H forms, the same intro SHALL precede creation of the first live question and its clock; the live question SHALL use the form's fixed difficulty 3 rather than an opening warm-up. The first-visit warm-up scenario below applies to ordinary lessons.

#### Scenario: First visit opens on the intro

- **WHEN** a learner starts a skill that carries a teaching line and has no true seen flag
- **THEN** the intro appears before the opening warm-up
- **AND** it shows one difficulty-1 example with its correct answer and worked steps

#### Scenario: The example is stable across visits

- **WHEN** the learner leaves and later opens or reviews the same skill intro
- **THEN** the same generated example is shown
- **AND** the lesson's own problem sequence is unaffected

#### Scenario: A later rollout stage remains playable

- **WHEN** a playable generator does not yet carry a teaching line during roadmap increments 25a–25c
- **THEN** its lesson opens on the existing warm-up flow
- **AND** it offers no empty or placeholder intro

#### Scenario: A form intro is separate from its live paper

- **WHEN** either timed practice skill is opened with an unseen intro
- **THEN** its stable difficulty-1 delegated example appears before any live question or clock is created
- **AND** starting practice creates a difficulty-3 live question without consuming the form seed for the example

### Requirement: Intro state is presentation state, not learning evidence

The intro's forward action SHALL record only that the skill intro has been seen and then start the unchanged lesson session. It SHALL NOT record an attempt or correct answer, raise mastery, award XP or coins, unlock content, complete a review, or provide evidence to future review or skip-ahead behavior.

Leaving an automatically shown intro instead of taking its forward action SHALL leave it unseen, so it appears again on the next lesson entry. The intro SHALL have no separate skip action that implies a second learning outcome.

For full-length forms, starting practice SHALL preserve the same no-learning-evidence contract while beginning at zero consumed questions and zero points, at fixed difficulty 3 with the elapsed clock at zero. The ordinary-warm-up scenario below applies to ordinary lessons.

#### Scenario: Starting practice changes only the seen flag

- **WHEN** a learner takes the forward action on an unseen intro
- **THEN** that skill's intro is recorded as seen
- **AND** its attempts, correct answers, mastery, practice date, XP, coins, and unlock state are unchanged
- **AND** the lesson begins at zero correct answers with its ordinary warm-up

#### Scenario: Leaving does not dismiss the intro permanently

- **WHEN** a learner leaves the lesson from an automatically shown intro
- **THEN** the intro remains unseen
- **AND** it appears again the next time that skill is opened

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

The two timed-form intros SHALL also use their own authored teaching lines and fixed-seed, difficulty-1 delegated examples, with the same representation and source-progress isolation as mixed-review intros. Their teaching lines SHALL explain the full-length mixed practice rather than one source skill. Reviewing a form intro SHALL preserve the current problem, entry, consumed count and points while its original clock continues.

All six Stage H intros SHALL remain readable at a 375-by-812-pixel viewport without horizontal
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

#### Scenario: Timed form intros preserve the source and active form

- **WHEN** either timed-form intro is opened or reviewed
- **THEN** it shows its own teaching line and stable source example with no answer controls
- **AND** no source progress changes, and reviewing during practice preserves the current problem, entry, consumed count, points and original clock

#### Scenario: Both form intros fit the phone

- **WHEN** both timed-form intros are exercised at 375 by 812 pixels
- **THEN** their teaching lines and actions remain on screen without horizontal or page overflow
- **AND** complete delegated examples, answers and steps remain reachable through the existing worked-example scroll region
