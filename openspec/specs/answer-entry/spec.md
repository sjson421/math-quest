# Answer Entry

## Purpose

How a learner types an answer and what the lesson does with each possible result of checking
it: which keys a problem offers, that what the pad shows and what entry accepts are the same
rule rather than two, and that an answer which is right in value but wrong in form — or an
entry that is simply unfinished — is answered on its own terms instead of as a plain miss.

## Requirements

### Requirement: A problem declares what its answer may contain

A problem SHALL be able to declare the character classes its answer may use — a negative sign,
a decimal point, a fraction slash, and a space separating a whole part from a proper fraction
(mixed-number entry). A problem that declares nothing SHALL be answerable with whole digits
only.

A problem SHALL permit a sign whenever a negative value is a plausible answer to it — either
the correct answer, or a mistake the generator predicts. Permitting it only where the correct
answer is negative withholds the key on exactly the problems where the sign is the question:
the mistake `−3 + 5` invites is `−8`, and subtracting a negative invites negating the whole
result. A learner making either cannot enter it, so it is never named — and worse, the absent
key tells them the answer is not negative, which is the one thing those skills are asking.

The declaration belongs to the problem rather than to the skill, the unit, or a stage-wide
capability. A generator knows the shape of the answer it has just computed and the mistakes it
has just predicted; nothing above it does, and a course that gated the minus key on a stage
would hold the key off every skill in the stage or force it onto all of them.

The space key and the sign key SHALL occupy the same adaptive cell of the pad, so a problem
SHALL declare at most one of mixed-number entry and a sign. A mixed-number problem's answers
and predicted mistakes are positive; a problem that needs both is out of scope for the
declared surface and must resolve the cell conflict before declaring both.

Whole digits only is the default because it is what most skills built so far want, so a
generator that says nothing keeps behaving exactly as it did.

#### Scenario: A problem that declares nothing takes whole digits

- **WHEN** a problem carries no answer-entry declaration
- **THEN** its answer may contain digits only
- **AND** no sign, decimal point, or fraction slash can be entered

#### Scenario: A problem declares the classes its answer needs

- **WHEN** a problem's answer is negative and it declares that a sign is allowed
- **THEN** a sign may be entered for that problem
- **AND** the declaration applies to that problem alone, not to the skill or the stage

#### Scenario: A predicted negative mistake is enterable

- **WHEN** a problem's correct answer is positive but it predicts a mistake below zero
- **THEN** the problem permits a sign to be entered
- **AND** a learner submitting that predicted value is diagnosed rather than blocked

#### Scenario: A mixed-number answer declares a space

- **WHEN** a problem's answer is a mixed number and it declares mixed-number entry
- **THEN** a space may be entered for that problem
- **AND** the space key occupies the cell the sign would otherwise use

#### Scenario: A problem does not declare both sign and mixed entry

- **WHEN** a problem declares mixed-number entry
- **THEN** it does not also declare a sign for that problem

### Requirement: The pad offers exactly the keys the problem permits

The answer pad SHALL show a key for a character class only when the current problem permits
that class, and SHALL keep its layout stable whether or not a key is shown.

A key that cannot be used is worse than absent: it invites a tap that does nothing, which
reads as the app being broken. A pad that reflows as the course advances is a second problem —
the digits must stay where the learner's thumb expects them.

#### Scenario: A permitted class gets a key

- **WHEN** the current problem permits a fraction slash
- **THEN** the pad shows a fraction key

#### Scenario: An unpermitted class gets no key

- **WHEN** the current problem permits no decimal point
- **THEN** the pad shows no decimal key
- **AND** the digit keys stay in the same positions they occupy for every other problem

#### Scenario: A permitted space gets its key in the adaptive cell

- **WHEN** the current problem permits mixed-number entry
- **THEN** the pad shows a space key in the cell the sign otherwise occupies
- **AND** the digit keys stay in the same positions they occupy for every other problem

### Requirement: What the pad shows and what entry accepts are one rule

The rules governing which keys are displayed and the rules governing which characters an entry
may accept SHALL be the same declaration, read from the current problem in both places.

Two copies of this rule would drift, and drift here is invisible: a pad that offers a key the
entry logic silently discards looks identical to a broken key.

The space SHALL be accepted only where a mixed number can be formed: at most once, after at
least one whole-part digit and before the fraction's numerator, so `3 1/2` is enterable and a
second space, a space before any digit, a space after the slash, or a space in a
sign-prefixed entry are not.

#### Scenario: A disallowed character is refused however it arrives

- **WHEN** a key press for a class the current problem does not permit reaches the entry
- **THEN** the entry is left unchanged

#### Scenario: Display and entry read the same declaration

- **WHEN** the current problem's declaration permits a class
- **THEN** that class both appears on the pad and is accepted into the entry

#### Scenario: A space is refused outside mixed-number grammar

- **WHEN** a learner taps the space key with an empty entry, after the slash, or twice
- **THEN** the entry is left unchanged

### Requirement: An answer that is right in value but wrong in form is answered as such

When a submitted answer matches the expected value but not the form the skill is teaching, the
lesson SHALL respond to that specifically: it SHALL tell the learner the value is right and ask
for the form, and it SHALL NOT show the worked solution.

A skill SHALL be able to require lowest terms, SHALL be able to require mixed form, SHALL be
able to require decimal notation, and SHALL be able to require fraction notation; each
requirement has its own response naming the form the entry is missing. When more than one
applies, an entry missing the mixed form is answered about the mixed form before any reduction
question; decimal notation and fraction notation are mutually exclusive on one answer, since a
skill teaches conversion in exactly one direction.

The lesson SHALL treat a right value in the wrong form as not yet complete — the correct-answer
count does not advance and the problem returns later in the session, exactly as any other
unfinished problem does. The attempt SHALL be recorded as incorrect, with no misconception tag,
since the mistake is one the generator did not predict a value for.

Withholding the worked solution is the point. Partial simplification is the named wall at
`simplify-fractions`, and a learner who reached the right value has done the arithmetic; handing
them the full working answers a question they did not get wrong and removes the only step left
to take. The same holds for a learner who computed the amount but not the mixed form, decimal
form, or fraction form it is taught in.

#### Scenario: An unreduced answer is acknowledged, not corrected

- **WHEN** a learner submits a numerically correct answer that is not in the required form
- **THEN** the learner is told the value is right and asked for the required form
- **AND** the worked solution is not shown

#### Scenario: An unreduced answer does not complete the problem

- **WHEN** a learner submits a numerically correct answer that is not in the required form
- **THEN** the correct-answer count does not advance
- **AND** the problem returns later in the same session
- **AND** the attempt is recorded as incorrect with no misconception tag

#### Scenario: An improper entry is asked for in mixed form

- **WHEN** a learner submits a numerically correct answer as an improper fraction where mixed
  form is required
- **THEN** the learner is told the value is right and asked for mixed form
- **AND** the worked solution is not shown and the problem does not complete

#### Scenario: A mixed entry is answered about reduction, not form

- **WHEN** a learner submits a numerically correct answer in mixed form that is not reduced
- **THEN** the learner is told the value is right and asked for lowest terms
- **AND** the mixed-form question is not asked again

#### Scenario: A fraction entry is asked for in decimal form

- **WHEN** a learner submits a numerically correct answer written as a fraction where decimal
  form is required
- **THEN** the learner is told the value is right and asked to write it as a decimal
- **AND** the worked solution is not shown and the problem does not complete

#### Scenario: A decimal entry is asked for in fraction form

- **WHEN** a learner submits a numerically correct answer written as a decimal where fraction
  form is required
- **THEN** the learner is told the value is right and asked to write it as a fraction
- **AND** the worked solution is not shown and the problem does not complete

### Requirement: An unfinished entry is not a wrong answer

When a submitted entry cannot be read as a number at all, the lesson SHALL return the learner
to the pad with the entry intact and SHALL NOT record an attempt, re-queue the problem, or show
the worked solution.

This becomes reachable the moment a sign or a slash is on the pad: `-` alone and `5/` are both
partial entries, not answers. Charging an attempt for a half-typed number punishes typing
speed, and the worked solution spoils a problem the learner has not yet attempted.

#### Scenario: A half-typed number returns to the pad

- **WHEN** a learner submits an entry that cannot be read as a number
- **THEN** the learner is told the entry is incomplete rather than wrong
- **AND** the entry is left in place to be finished
- **AND** no attempt is recorded and the worked solution is not shown

#### Scenario: A genuine wrong answer is unaffected

- **WHEN** a learner submits an entry that reads as a number and is not the expected value
- **THEN** it is diagnosed and answered as a wrong answer, as before

### Requirement: The answer slot echoes an entry in the notation the problem uses

Where a submitted answer is shown back to the learner, it SHALL be drawn in the same notation
the problem itself is drawn in. What is submitted and what is checked SHALL be unaffected.

The two are already allowed to differ, and must: the checker parses a plain hyphen while
everything a learner reads carries the typographic minus the pad's own key is labelled with.
Echoing the submitted form verbatim puts both on screen at once — one sign in the problem,
another in the slot beside it — which is the control disagreeing with itself about what it
just did, and is indistinguishable from a broken control.

This SHALL hold for every sign in the entry, not only the first. A numeric entry carries at
most one, but an expression entry may carry several, and converting the leading sign alone
puts both notations inside a single answer slot — the same disagreement, one line lower.

#### Scenario: A typed negative reads as the problem reads

- **WHEN** a learner enters a negative value on the pad
- **THEN** the answer slot shows it with the same sign notation the problem uses
- **AND** the value submitted for checking is unchanged

#### Scenario: An expression entry with two signs reads consistently

- **WHEN** a learner enters an expression whose terms are both negative
- **THEN** every sign in the answer slot is drawn in the problem's notation
- **AND** the value submitted for checking is unchanged

#### Scenario: A positive entry is unaffected

- **WHEN** a learner enters a value with no sign
- **THEN** the answer slot shows exactly what was entered

#### Scenario: A partial entry is still shown

- **WHEN** a learner has entered a sign and no digits yet
- **THEN** the answer slot shows the sign in the problem's notation
- **AND** submitting it is still treated as an unfinished entry rather than a wrong answer

### Requirement: Numeric mistakes are diagnosed in every permitted entry form

A finite predicted misconception value SHALL be matchable from any submitted integer, decimal,
simple-fraction, or mixed-number form that represents that value exactly enough for the
existing numeric prediction. Parsing the entry for diagnosis SHALL preserve the existing
behavior for whole-number entries and numeric choice ids, and an unparseable entry SHALL match
no misconception.

#### Scenario: A slash-form mistake receives its diagnosis

- **WHEN** a learner submits a valid fraction equal to a predicted misconception value
- **THEN** the lesson returns that misconception's specific feedback
- **AND** records its stable tag with the incorrect attempt

#### Scenario: A mixed-form mistake receives its diagnosis

- **WHEN** a learner submits a valid mixed number equal to a predicted misconception value
- **THEN** the lesson returns that misconception's specific feedback
- **AND** records its stable tag with the incorrect attempt

#### Scenario: Existing scalar diagnosis remains intact

- **WHEN** a learner submits an integer, decimal, or numeric choice id matching a prediction
- **THEN** diagnosis produces the same matching misconception as before

#### Scenario: An unfinished fraction has no diagnosis

- **WHEN** a learner submits a fraction entry that cannot yet be parsed
- **THEN** no misconception is matched
- **AND** the existing unfinished-entry response remains responsible for the submission

### Requirement: A problem may declare an expression answer surface

A problem MAY declare `expression` as its input mode instead of `keypad`, `choice`, or
`number-line`. An expression problem SHALL offer a keypad limited to digits, its declared
variable letter, infix `+`/`−`, unary `−`, and parentheses — no fraction slash, decimal
point, or mixed-number space, since those characters are outside the expression grammar.

#### Scenario: An expression problem offers the expression keys only

- **WHEN** a problem declares input mode `expression`
- **THEN** the pad offers digits, its declared variable letter, `+`, `−`, and parentheses
- **AND** it does not offer a fraction slash, decimal point, or mixed-number space

#### Scenario: What the pad shows and what entry accepts stays one rule

- **WHEN** an expression problem's pad is displayed
- **THEN** the same declared key set governs both which keys are offered and which key
  presses the entry logic accepts

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

