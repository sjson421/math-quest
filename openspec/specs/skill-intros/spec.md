# skill-intros Specification

## Purpose

Show a concise, generated worked example before a learner first practises a skill while keeping the explanation available later and separate from earned progress.

## Requirements

### Requirement: A shipped intro precedes the first problem

When a playable skill carries a teaching line and its intro has not been seen, the lesson SHALL open on one intro before it presents or creates the opening warm-up. The intro SHALL show the teaching line, one generated difficulty-1 problem, that problem's correct answer, and all of its existing worked solution steps.

The example SHALL pass through the same generation validation and display rendering as a lesson problem. It SHALL use a fixed seed independent of the lesson session, so the same skill presents the same reviewed example on every visit without consuming or changing a lesson seed.

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

### Requirement: Intro state is presentation state, not learning evidence

The intro's forward action SHALL record only that the skill intro has been seen and then start the unchanged lesson session. It SHALL NOT record an attempt or correct answer, raise mastery, award XP or coins, unlock content, complete a review, or provide evidence to future review or skip-ahead behavior.

Leaving an automatically shown intro instead of taking its forward action SHALL leave it unseen, so it appears again on the next lesson entry. The intro SHALL have no separate skip action that implies a second learning outcome.

#### Scenario: Starting practice changes only the seen flag

- **WHEN** a learner takes the forward action on an unseen intro
- **THEN** that skill's intro is recorded as seen
- **AND** its attempts, correct answers, mastery, practice date, XP, coins, and unlock state are unchanged
- **AND** the lesson begins at zero correct answers with its ordinary warm-up

#### Scenario: Leaving does not dismiss the intro permanently

- **WHEN** a learner leaves the lesson from an automatically shown intro
- **THEN** the intro remains unseen
- **AND** it appears again the next time that skill is opened

### Requirement: Seen state survives old and synced records

Intro seen state SHALL live on the existing per-skill progress object and SHALL survive local persistence, file restore, opaque server sync, and remote adoption. A skill object with no valid true seen value SHALL read as unseen without rewriting or selecting named fields out of the stored object.

Existing learners therefore SHALL receive each newly shipped intro once. An older client that does not interpret the field SHALL preserve it as part of the per-skill object, so rolling back and upgrading again does not lose the choice.

#### Scenario: A record predating intros defaults to unseen

- **WHEN** a stored or restored skill object has no intro seen field
- **THEN** the intro reads as unseen
- **AND** the rest of the stored skill object remains unchanged

#### Scenario: Seen state follows a recovery key

- **WHEN** a true intro seen value is synced and adopted on another device
- **THEN** that skill does not automatically show the intro again
- **AND** its teaching content remains available through review

### Requirement: A seen intro remains available without resetting practice

While a learner is answering a problem in a skill carrying a teaching line, the lesson SHALL offer a clearly named action to review its intro. Opening and closing that review SHALL preserve the visible current problem, answer entry, hint visibility, and correct count. Answer feedback and its short transition SHALL remain exclusive; the review action SHALL return as soon as the learner is answering a problem again.

#### Scenario: Review returns to the same work

- **WHEN** a learner opens the intro review during a lesson and returns to practice
- **THEN** the same current problem and answer entry are restored
- **AND** the hint visibility and correct count are unchanged

#### Scenario: Review does not write progress

- **WHEN** a learner reviews an intro that is already seen
- **THEN** no progress field or sync version changes

### Requirement: The worked example is complete, accessible markup

The intro SHALL reuse the existing exhaustive problem display renderer and SHALL suppress its interactive answer slot. It SHALL present one separate, clearly labelled correct answer for every existing answer shape, including exact, approximate, choice, expression, point, and root-pair answers, followed by the shared worked-step list. It SHALL expose no keypad, choice buttons, placement targets, hint control, or answer submission action.

Every Stage A intro SHALL keep its teaching line, example, answer, worked steps, leave action, and forward action readable at a 375-by-812-pixel viewport without horizontal or page overflow. The teaching line, example, answer, and actions SHALL have clear accessible names and reading order.

Every Stage B intro SHALL keep the same complete content and actions readable at a
375-by-812-pixel viewport without horizontal or page overflow.

Every Stage C and Stage D intro SHALL keep the same complete content and actions readable at
a 375-by-812-pixel viewport without horizontal or page overflow. Diagram-based examples SHALL
render through the same accessible diagram markup used by practice problems and SHALL remain
complete at that viewport.

Every Stage E and Stage F intro SHALL keep the same complete content and actions readable at
a 375-by-812-pixel viewport without horizontal or page overflow. Notation, equation,
coordinate-plane, expression-answer, and root-pair examples SHALL render through the same
accessible markup used by practice problems and SHALL remain complete at that viewport.

#### Scenario: An intro is not an answer surface

- **WHEN** a worked example is shown
- **THEN** its display and correct answer are readable as markup
- **AND** no answer input or submission control is offered

#### Scenario: Every answer shape has a learner-facing label

- **WHEN** an intro example carries any supported answer shape
- **THEN** its correct answer is rendered as learner-facing text rather than an internal id or encoding

#### Scenario: Stage A fits the installed phone surface

- **WHEN** each of the eight Stage A intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: Stage B fits the installed phone surface

- **WHEN** each of the 44 Stage B intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: Stages C and D fit the installed phone surface

- **WHEN** each of the 59 Stage C and Stage D intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: A diagram intro keeps the practice representation

- **WHEN** a Stage D intro presents a generated diagram example
- **THEN** the full diagram remains readable as accessible markup
- **AND** the intro adds no second diagram renderer or interactive answer surface

#### Scenario: Stages E and F fit the installed phone surface

- **WHEN** each of the 62 Stage E and Stage F intros is exercised at 375 by 812 pixels
- **THEN** its complete content and actions remain readable without horizontal or page overflow

#### Scenario: Advanced examples keep their practice representation

- **WHEN** a Stage E or Stage F intro presents notation, an equation, a coordinate plane, an expression answer, or a root pair
- **THEN** the full representation remains readable as accessible markup
- **AND** the intro adds no second renderer or interactive answer surface
