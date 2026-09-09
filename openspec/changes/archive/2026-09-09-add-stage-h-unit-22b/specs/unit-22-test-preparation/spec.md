## REMOVED Requirements

### Requirement: Unit 22 stays incomplete until its timed forms ship

**Reason**: Increment 30b implements the two remaining forms, so the four-skill boundary is no longer true.
**Migration**: Replace it with the full-length form requirements below and the complete-course boundary in `curriculum-manifest`. The four existing preparation lessons remain untimed and retain their behavior.

## ADDED Requirements

### Requirement: Each timed practice skill starts a full-length sampled form

Starting individual practice for `timed-practice-1` or `timed-practice-2` SHALL start a 46-question form. Each form SHALL contain exactly 21 quantitative questions from the same Units 0–11, 20 and 21 pool as `review-quantitative`, and 25 algebraic questions from the same Units 12–19 pool as `review-algebraic`. Selection within each pool SHALL be uniform with replacement. The two skills SHALL share this contract and SHALL draw fresh samples for every new session rather than identify fixed published papers.

The area order SHALL be shuffled once when a form starts and remain stable throughout that session. Every live question SHALL use generator difficulty 3, including the opening question and questions after misses, regardless of mastery. Given the same seed and form id, the complete question sequence SHALL be reproducible. Repeated source skills and chance repeated problems SHALL be valid; fresh sampling SHALL NOT require disjoint papers.

Every delegated problem SHALL retain the source's identity, prompt, answer rules, display, input control, hint, worked solution and predicted misconceptions. Unit 22 SHALL be excluded from both source pools. No new source answers or misconceptions SHALL be authored by the form wrappers.

#### Scenario: Both forms have the approved composition

- **WHEN** either skill starts a full-length session
- **THEN** its 46 slots contain 21 quantitative sources and 25 algebraic sources in a shuffled order
- **AND** every problem comes from the appropriate existing pool with no Unit 22 source

#### Scenario: Seeded sampling is stable without promising unique papers

- **WHEN** the same form id and seed are used again
- **THEN** the same ordered problems result
- **AND** later independent launches use fresh sampling without excluding repeated sources

#### Scenario: Live difficulty is fixed

- **WHEN** a learner starts either form at any mastery or records three consecutive misses
- **THEN** its opening and remaining questions use difficulty 3
- **AND** no warm-up reduction or recovery adjustment occurs

#### Scenario: Delegation preserves source content

- **WHEN** a source problem is presented through a form
- **THEN** its source identity, answer and answer-form rules, input and display, worked steps and misconceptions are preserved
- **AND** its stored source progress is not changed by presenting it

### Requirement: Each form question contributes at most one scored answer

A form SHALL consume one question for every recorded answer and finish after 46 recorded answers, even if none is correct. A correct answer SHALL earn one point; a wrong value or a right value in the wrong required form SHALL earn zero. An unfinished or unparseable entry SHALL retain the current question and entry, record no attempt, earn no point and allow correction. No scored question SHALL return for a retry.

The form SHALL offer no pre-answer hint. Existing post-answer feedback SHALL remain available: wrong values show their diagnostic nudge and worked solution, while right-value/wrong-form responses explain the form without misdiagnosing the arithmetic. Dismissing miss feedback SHALL advance to the next question, without offering a retry. Correct feedback SHALL use the existing short transition. The form SHALL not offer question skipping or backward navigation.

Progress SHALL count consumed questions out of 46, rather than questions answered correctly. Duplicate taps, overlapping submission controls, feedback dismissal and delayed callbacks SHALL NOT consume a question, record an attempt or complete the form more than once. Leaving SHALL cancel pending transitions.

#### Scenario: A miss consumes a question

- **WHEN** a learner submits a wrong value and dismisses its feedback
- **THEN** the next question appears, one question has been consumed, and zero points were earned
- **AND** the missed question is not requeued

#### Scenario: Wrong form is scored once

- **WHEN** a correct value is submitted in a form rejected by that problem's existing answer rules
- **THEN** the answer earns zero points and records one miss
- **AND** form feedback explains the issue before advancing without a retry

#### Scenario: An unfinished entry remains editable

- **WHEN** a learner submits an unfinished fraction or another unparseable entry
- **THEN** the same question and entry remain available
- **AND** no question, point or attempt is counted until a scored answer is submitted

#### Scenario: Every completed paper has the same denominator

- **WHEN** the 46th recorded answer finishes its feedback transition
- **THEN** the form completes with the number of correct answers out of 46
- **AND** both 0 of 46 and 46 of 46 are valid completed forms

#### Scenario: Repeated submissions cannot inflate results

- **WHEN** submission or dismissal is triggered repeatedly during one answer transition
- **THEN** only one question and one attempt are counted
- **AND** the final transition can award completion only once

### Requirement: Forms compose the existing clock and score estimate

The form SHALL use the existing elapsed clock, starting only when live practice begins after any automatic intro. Reviewing the intro SHALL not pause or reset it. No elapsed duration SHALL end the form, submit an answer or change the score. The clock SHALL stop when the form completes or is left.

Completion SHALL show the earned points out of 46 through the existing approximate GED score presentation, with its estimated band, always-visible official-score caveat and inspectable mapping. The result SHALL be based only on that completed session's first scored answers, not cumulative skill accuracy, elapsed time or retries. A completed form's score SHALL not be presented as an official pass result.

Form sequence, partial points, clock and score result SHALL be session-local and discarded when the session is left or reloaded. Leaving an incomplete form SHALL not produce a completed-form estimate or completion reward. Already recorded attempts SHALL remain recorded. A later launch SHALL start a new form and clock; it SHALL not restore the abandoned form.

#### Scenario: Intro reading does not spend session time

- **WHEN** a form's automatic intro is shown before practice
- **THEN** no clock runs until the learner starts practice
- **AND** that action begins the first live question with a clock at zero

#### Scenario: A long session does not expire

- **WHEN** the elapsed clock passes any duration, including while reviewing the intro
- **THEN** the current form remains active with unchanged questions and points
- **AND** the same original clock continues

#### Scenario: Completed points feed the existing estimate

- **WHEN** a learner completes a form with 20 correct answers
- **THEN** the result shows 20 of 46 practice points and the existing approximate estimate for that ratio
- **AND** the caveat and mapping remain available offline

#### Scenario: Leaving cancels an incomplete form

- **WHEN** a learner leaves or reloads after some recorded answers
- **THEN** partial form state and pending callbacks are discarded without a completion reward or completed score
- **AND** recorded attempts survive and a later launch starts fresh

### Requirement: Form credit belongs to the selected form skill

Each recorded form answer SHALL use ordinary per-attempt recording for the selected `timed-practice-1` or `timed-practice-2` skill, including existing misconception-tag accounting. Completing all 46 questions SHALL invoke ordinary skill completion exactly once, including the existing mastery cap, XP, coins, streak, review schedule and completion milestones, regardless of score. The estimate itself SHALL have no progress side effects.

Sampled source skills SHALL receive no attempt, correct count, mastery, intro flag, practice date or review-counter changes from a form. Existing manifest prerequisites and practised-skill unlock behavior SHALL continue to determine access to both forms; no estimated-score threshold SHALL be introduced.

#### Scenario: Low scores still complete practice

- **WHEN** a learner completes a form with zero correct answers
- **THEN** the form skill records 46 attempts and zero correct answers
- **AND** ordinary completion credit is granted exactly once without a score threshold

#### Scenario: Source progress stays unchanged

- **WHEN** a form samples multiple source skills and completes
- **THEN** only the selected form skill receives per-skill attempt and completion updates
- **AND** every sampled source skill retains its previous progress

### Requirement: Form behavior is confined to individual form practice

The four existing Unit 22 lessons SHALL retain ordinary untimed behavior. Standard lessons, spaced-review sessions and skip checks SHALL retain their existing pacing, answer, credit and timing rules. A form generator selected as one source in spaced review or a skip check SHALL produce one delegated problem at the caller's requested difficulty and SHALL not start a full form, clock or score result. Existing review selection and skip eligibility SHALL remain unchanged.

Both forms' intros, practice header and all inherited answer surfaces SHALL fit a 375-by-812-pixel viewport without horizontal page overflow or clipped controls. The completed result, ordinary completion actions and expanded score mapping SHALL be legible and reachable by scrolling as needed. Timing accessibility and score-section semantics SHALL retain their existing contracts.

#### Scenario: Other consumers still receive one problem

- **WHEN** spaced review or a skip check samples either form generator
- **THEN** it receives one source problem at the requested difficulty
- **AND** the enclosing session retains its own pacing, credit and untimed default without a form score

#### Scenario: Ordinary preparation remains untimed

- **WHEN** any of the first four Unit 22 skills starts
- **THEN** it uses the same ordinary lesson mechanics as before
- **AND** no form clock or full-length score appears

#### Scenario: Form controls and results fit the phone

- **WHEN** either form is exercised at 375 by 812 pixels through intro, inherited inputs, feedback and completion
- **THEN** actions, elapsed time and question count remain legible and usable without horizontal overflow
- **AND** the complete score caveat and expanded mapping remain reachable
