# Coordinate-plane Input

## Purpose

Coordinate-plane input lets a learner place one exact lattice point, revise that placement,
and deliberately confirm it without opening a keyboard or turning a near-miss tap into an
attempt.

## Requirements

### Requirement: A problem may use its coordinate-plane display as its answer surface

A problem whose display is a coordinate plane SHALL be able to declare `coordinate-plane`
as its input mode. That declaration SHALL make the displayed plane the point-placement answer
surface and SHALL replace keypad, choice, number-line, and expression controls. The input
surface SHALL read the same plane declaration as the display rather than carrying a second
copy of its axes or marks.

A coordinate-plane display using any other input mode SHALL remain the passive graph-reading
display that capability already specifies. Merely carrying coordinate-plane display data
SHALL NOT select point input.

A coordinate-plane input problem SHALL carry a point answer that is one of the declared
lattice targets. Every structured point misconception it carries SHALL likewise be a reachable
target so the predicted mistake can actually be submitted. A problem with an unreachable point
answer SHALL be rejected, and an unreachable point misconception SHALL be dropped centrally.

#### Scenario: Coordinate-plane mode owns the answer surface

- **WHEN** a problem has a coordinate-plane display and declares coordinate-plane input
- **THEN** the displayed plane offers point placement and confirmation
- **AND** no keypad, choice, number-line, or expression control is presented

#### Scenario: A graph-reading problem stays passive

- **WHEN** a problem has a coordinate-plane display and declares choice input
- **THEN** the graph remains a passive image and the choices remain the answer surface
- **AND** no point-placement targets or point confirmation are presented

#### Scenario: One declaration owns the graph

- **WHEN** coordinate-plane input renders axes, ticks, and placement targets
- **THEN** all of them are derived from the coordinate-plane display declaration
- **AND** the problem carries no second set of coordinate-plane bounds or marks

#### Scenario: The answer and predictions are reachable

- **WHEN** a problem declares coordinate-plane input
- **THEN** its point answer lies on one declared x tick and one declared y tick
- **AND** every carried point misconception is another declared lattice target

#### Scenario: An unreachable point answer is rejected

- **WHEN** a coordinate-plane input problem carries an out-of-bounds point or a point between
  declared ticks as its answer
- **THEN** the problem is rejected before the lesson presents an unanswerable surface

### Requirement: The declared lattice is the complete placement set

The input surface SHALL offer exactly the Cartesian product of the x-axis and y-axis tick
values declared by the plane. Each position SHALL submit its exact integer ordered pair,
with x first and y second. A position between declared ticks or outside either axis bound
SHALL NOT be placeable.

Each lattice position SHALL be markup that is labelled with its ordered pair, exposes whether
it is selected, and can be activated without opening a system keyboard. Positions SHALL be
ordered visually from the plane's top-left toward its bottom-right while preserving the
mathematical x and y values in their labels. Exactly one position SHALL participate in
sequential keyboard focus: the current placement, or the origin before placement. Arrow keys
SHALL move that focus and pending placement by one declared tick without submitting. At an axis
boundary, an arrow aimed outside the declared lattice SHALL leave focus and pending placement
unchanged and SHALL NOT submit.

Because the densest declared lattice places adjacent direct targets closer together than an
ordinary touch target, the surface SHALL also offer an equivalent large-target touch route.
That route SHALL provide x−, y−, origin, y+, and x+ controls at least 48 CSS pixels high and
wide. Before a point is placed, a direction SHALL start from the origin and place its adjacent
declared tick, while origin SHALL place `(0, 0)`. After placement, each direction SHALL move the
pending point by one declared tick, origin SHALL return it to `(0, 0)`, and a direction SHALL
be unavailable at the corresponding axis boundary. These controls SHALL update the same
pending point as direct targets and keyboard arrows without submitting it.

#### Scenario: Every tick intersection is placeable

- **WHEN** both axes declare ticks from −5 through 5 by 1
- **THEN** the learner is offered 121 labelled point targets
- **AND** each target submits one ordered pair from (−5, 5) through (5, −5)

#### Scenario: Axis spacing limits reachable points

- **WHEN** an axis declares ticks two units apart
- **THEN** only those declared tick values appear in placements on that axis
- **AND** an integer between two ticks cannot be placed

#### Scenario: Placement opens no keyboard

- **WHEN** a coordinate-plane answer surface is presented
- **THEN** every point target is an activatable labelled control
- **AND** the surface contains no text input, text area, or editable region

#### Scenario: Keyboard navigation has one roving stop

- **WHEN** a coordinate-plane answer surface first receives keyboard focus
- **THEN** the origin is its only position in the sequential tab order
- **AND** an arrow key moves focus and pending placement one declared tick in that direction
- **AND** an arrow key aimed outside an axis boundary leaves focus and placement on that
  boundary target
- **AND** no answer is submitted until Check is confirmed

#### Scenario: Dense placement has a large-target touch route

- **WHEN** a coordinate-plane answer surface is presented at a 375-pixel viewport
- **THEN** x−, y−, origin, y+, and x+ are each available through a control at least 48 CSS
  pixels high and wide
- **AND** starting at the origin, repeated directional activation can reach every declared
  lattice point
- **AND** a directional control at an axis boundary cannot move outside the declared lattice
- **AND** using any of these controls changes only the pending placement until Check is
  confirmed

### Requirement: Placing a point is not yet answering

Activating a lattice position SHALL show that position as the current placement without
submitting it. Activating another position SHALL replace the earlier placement, and the
learner SHALL be able to revise the point any number of times before confirmation. No
attempt, feedback, requeue, or worked solution SHALL occur before confirmation.

Confirmation SHALL be unavailable while no valid lattice point is placed. The displayed
selection and the entry submitted on confirmation SHALL derive from the same point value.

#### Scenario: A tap places without submitting

- **WHEN** a learner activates the target labelled `(3, 2)`
- **THEN** `(3, 2)` is shown as the sole current placement
- **AND** no answer is submitted and no attempt is recorded

#### Scenario: A placement can be corrected

- **WHEN** a learner places `(3, 2)` and then places `(2, 3)`
- **THEN** only `(2, 3)` remains selected
- **AND** confirmation submits `(2, 3)`

#### Scenario: Confirmation needs a placement

- **WHEN** a coordinate-plane problem first appears with no selected point
- **THEN** its confirmation control is disabled

### Requirement: A confirmed point uses the ordinary lesson flow

Confirming a placed point SHALL submit its exact ordered pair to the shared answer checker.
The resulting correct, incorrect, diagnosis, progress-recording, feedback, and requeue
behavior SHALL be the same behavior used by other lesson inputs. A rapid repeat confirmation
before the surface is replaced SHALL be handled at most once.

#### Scenario: A correct point advances

- **WHEN** a learner confirms the exact point carried by the problem's point answer
- **THEN** the attempt is recorded as correct
- **AND** the lesson advances through its existing correct-answer flow

#### Scenario: A wrong point receives ordinary feedback

- **WHEN** a learner confirms a different valid lattice point
- **THEN** the attempt is recorded as incorrect
- **AND** the existing diagnosis, feedback, and requeue flow handles it

#### Scenario: Rapid confirmation records once

- **WHEN** confirmation is activated twice before feedback replaces or disables the control
- **THEN** only the first activation is handled
- **AND** exactly one attempt is recorded

### Requirement: Point placement fits the offline phone surface

Coordinate-plane input SHALL render from local application markup without canvas, a runtime
service, external assets, or a separately downloaded dependency. The densest supported plane,
its placement marks, and its confirmation control SHALL remain usable without horizontal
overflow at a 375-pixel viewport.

#### Scenario: The densest plane remains local and bounded

- **WHEN** a plane with twenty intervals on each axis is presented for point input at 375
  pixels wide while offline
- **THEN** every one of its 441 lattice positions remains available
- **AND** the equivalent large-target touch route remains available
- **AND** the plane and confirmation control do not overflow horizontally
- **AND** no canvas, external asset, or runtime download is used
