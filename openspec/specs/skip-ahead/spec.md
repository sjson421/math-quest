# skip-ahead Specification

## Purpose

Lets a learner declare a stage or unit already known so the course opens past it, and take
that declaration back at any time without losing anything they actually practised. Every
mastery level therefore records how it was reached, which is what makes a skip reversible and
what later lets the app watch a skipped skill more closely than a practised one.

## Requirements

### Requirement: Every mastery level records how it was reached

Each skill's progress SHALL carry the source of its mastery: practised, tested out of, or
self-assessed. Practised SHALL mean the learner reached that mastery by completing lessons,
and SHALL be the meaning of a record that carries no source at all.

A skill whose mastery a block mark raised SHALL also carry the mastery it held immediately
before that mark. The source says a level was granted rather than earned; it does not say what
the learner had already reached, and nothing else in the record recovers that — attempts and
correct counts do not map to a mastery level. Both values SHALL be recorded together, on
exactly the skills a mark raises, and cleared together.

The default SHALL be applied when the record is read, not by rewriting stored skills. A
progress record that predates either field SHALL remain valid, SHALL keep every field it
carries that the app does not recognise, and SHALL NOT be migrated on load, on restore from
the backup endpoint, or on adopting a server copy. A stored source that is not one of the
three values SHALL read as practised rather than failing the load or discarding the record.

A stored prior mastery SHALL be read as a value that cannot raise the skill: absent, malformed,
negative or fractional SHALL read as zero, and a value above the mastery the skill now holds
SHALL read as that current mastery. Taking a block back therefore SHALL NOT raise a mastery
level, whatever a corrupt or hand-edited record carries.

Recording the source or the prior mastery SHALL NOT change how a skill unlocks, how difficulty
is chosen, how long a lesson runs, or what a lesson rewards.

#### Scenario: A record without a source reads as practised

- **WHEN** a stored progress record holds a skill with mastery and no recorded source
- **THEN** that skill's source reads as practised
- **AND** the stored skill object is not rewritten

#### Scenario: A record without a prior mastery reads as zero

- **WHEN** a stored progress record holds a skill with no recorded prior mastery
- **THEN** that skill's prior mastery reads as zero
- **AND** the stored skill object is not rewritten

#### Scenario: An unrecognised source is not fatal

- **WHEN** a restored record holds a source value the app does not recognise
- **THEN** that skill's source reads as practised
- **AND** the record loads normally and keeps its other fields

#### Scenario: A prior mastery cannot raise the level it restores

- **WHEN** a restored record holds a prior mastery that is malformed, negative, or greater than
  the mastery that skill now holds
- **THEN** it reads as a value no higher than the current mastery
- **AND** the record loads normally and keeps its other fields

#### Scenario: Restoring is repeatable

- **WHEN** the same legacy record is restored more than once
- **THEN** the resulting sources and prior masteries are identical every time

### Requirement: Marking a block known raises it to mastery 3

The learner SHALL be able to mark one block — a stage or a unit of the curriculum — as already
known, declaring either that they tested out of it or that they assessed it themselves.

Marking a block known SHALL raise every playable skill in that block to mastery 3: clear of
the unlock threshold so everything downstream opens, and short of the maximum so a skipped
skill reads as not needed yet rather than finished. Skills in the block that cannot be played
SHALL NOT be raised and SHALL NOT gain a recorded source, since they are locked whatever their
mastery holds and are already transparent to unlocking.

A skill already at mastery 3 or above SHALL keep the mastery it has: marking a block known
SHALL never lower a mastery level. The declared source SHALL be recorded only on the skills
the mark actually raised, so a skill the learner had already practised to that level keeps its
practised source.

Each raised skill SHALL record the mastery it held immediately before the mark, alongside the
declared source. A skill the learner had practised part-way — to mastery 1 or 2, below the
unlock threshold's reach — is still raised, because leaving it where it stands would keep the
course shut and defeat the skip. Recording the level it came from is what lets a reversal
return the learner exactly where they stood.

Each raised skill SHALL also be scheduled for review, on the terms the safety net requires
below. Recording that schedule is what makes a skip watched rather than merely permitted.

The change SHALL be one local progress mutation that strictly advances the stored version,
preserves unknown fields, and is carried by the existing background sync without any change to
the endpoint or its stored document. Marking a block known SHALL NOT change attempts, correct
counts, review-attempt or review-correct counts, recorded misconceptions, intro state, XP,
coins, or the streak, and SHALL NOT announce a stage checkpoint, a pin upgrade, or a streak
milestone — a skip is a declaration, not an achievement.

A request SHALL be refused — nothing written, the stored version unchanged — when it names a
block the curriculum does not declare, a block holding no playable skill, or a block in which
every playable skill already stands at mastery 3 or above, since such a mark raises nothing and
records nothing.

#### Scenario: A whole unit opens what follows it

- **WHEN** a learner marks a unit as already known
- **THEN** every playable skill in that unit is at mastery 3
- **AND** each of those skills records the declared source
- **AND** skills whose prerequisites are now all at or above the unlock threshold are unlocked

#### Scenario: A stage is one block too

- **WHEN** a learner marks a stage as already known
- **THEN** every playable skill in every unit of that stage is at mastery 3

#### Scenario: A part-practised skill records where it came from

- **WHEN** a learner marks a unit known that holds a skill they had already practised to
  mastery 1
- **THEN** that skill is at mastery 3
- **AND** it records the declared source
- **AND** it records 1 as the mastery it held before the mark

#### Scenario: Earned mastery is never lowered

- **WHEN** a learner marks a block known that contains a skill they had practised to mastery 5
- **THEN** that skill stays at mastery 5
- **AND** its source stays practised
- **AND** no prior mastery is recorded for it

#### Scenario: A skip is not an achievement

- **WHEN** marking a block known takes the learner past a stage boundary or a pin threshold
- **THEN** no checkpoint, pin upgrade, or streak milestone is announced
- **AND** no XP, coins, or streak day is awarded

#### Scenario: A mark records no review history

- **WHEN** a learner marks a block known
- **THEN** no skill's review-attempt or review-correct count changes
- **AND** no skill's aggregate attempt or correct count changes

#### Scenario: Unplayable skills are left alone

- **WHEN** a block contains skills with no generator, or whose stage requires infrastructure
  that is not built
- **THEN** the mark raises no mastery and records no source for them
- **AND** they remain locked

#### Scenario: An unknown block writes nothing

- **WHEN** a block is named that the curriculum manifest does not declare
- **THEN** no progress is written
- **AND** the stored version is unchanged, so nothing is pushed

#### Scenario: A block that is already known writes nothing

- **WHEN** a block is marked known in which every playable skill already stands at mastery 3 or
  above
- **THEN** no progress is written
- **AND** the stored version is unchanged, so nothing is pushed

### Requirement: Taking a block back restores only what the skip granted

The learner SHALL be able to take back a block they marked as known, at any time. This SHALL be
the only action that lowers a mastery level, and it SHALL lower one only as far as the level
that skip found.

Taking a block back SHALL restore exactly those skills in the block whose recorded source is
tested out of or self-assessed to the mastery each of them held immediately before the mark, and
SHALL clear their source back to practised and their recorded prior mastery with it. For a skill
the skip found untouched that restores mastery 0; for one the learner had practised part-way it
restores the level they had earned. A reversal therefore returns the learner to where they
stood and cannot cost them work they did. A skill in the block whose source is practised SHALL
be left entirely unchanged, whatever its mastery.

Taking a block back SHALL also withdraw the review schedule the skip granted, on the terms the
safety net requires below. It SHALL NOT change attempts, correct counts, review-attempt or
review-correct counts, recorded misconceptions, intro state, XP, coins, or the streak. It SHALL
be one local progress mutation under the same version and sync rules as marking a block known,
and SHALL be refused without writing anything when the block holds no skill the skip granted.

#### Scenario: A skipped block returns to zero

- **WHEN** a learner takes back a unit they had marked as known and never practised
- **THEN** every skill in that unit is at mastery 0
- **AND** each of those skills reads as practised again
- **AND** none of them carries a recorded prior mastery any more
- **AND** the skills are gated by their prerequisites once more

#### Scenario: Practice inside a skipped block survives

- **WHEN** a learner marks a unit known, completes lessons for one of its skills, and then
  takes the unit back
- **THEN** that skill keeps the mastery its lessons earned
- **AND** the rest of the unit returns to mastery 0

#### Scenario: Mastery earned before the skip survives

- **WHEN** a learner practises a skill to mastery 1, later marks its unit known so the mark
  raises it to 3, and then takes the unit back
- **THEN** that skill is back at mastery 1, the level it held before the mark
- **AND** it reads as practised again
- **AND** its attempts and correct counts are unchanged

#### Scenario: A skill the mark never raised is not reached

- **WHEN** a learner takes back a block holding a skill they had practised to mastery 5 before
  marking it
- **THEN** that skill is untouched, at mastery 5

#### Scenario: A reversal keeps review history

- **WHEN** a learner takes back a unit whose skills answered review problems while skipped
- **THEN** their review-attempt and review-correct counts are unchanged

#### Scenario: Nothing to take back writes nothing

- **WHEN** a block is taken back that holds no tested-out or self-assessed skill
- **THEN** no progress is written
- **AND** the stored version is unchanged

### Requirement: Practising a skipped skill makes it practised

Completing a lesson for a skill whose source is tested out of or self-assessed SHALL set that
skill's source to practised and clear the prior mastery recorded with it, in the same mutation
that raises its mastery. A skipped skill the learner has since played is no longer an untested
claim and has no granted level left to restore, so taking its block back afterwards SHALL leave
it alone.

Completing a lesson SHALL otherwise behave exactly as it does today, including its mastery
increase, rewards, review scheduling, checkpoint, pin, and streak-milestone behavior.

#### Scenario: One lesson converts the claim

- **WHEN** a learner completes a lesson for a self-assessed skill
- **THEN** that skill's source becomes practised
- **AND** it carries no recorded prior mastery
- **AND** its mastery rises by one under the existing rule

#### Scenario: Conversion outlives the block

- **WHEN** a learner completes a lesson for a tested-out skill and later takes its block back
- **THEN** that skill is not reset

### Requirement: A block's skip state is derived, never stored

The progress record SHALL NOT carry block-level, unit-level, or stage-level skip state.
Whether a block counts as marked known SHALL be derived from the recorded sources of its
skills.

The curriculum manifest is the only authority for which skills a block contains, so a block
that gains or loses a skill SHALL need no migration and SHALL NOT be able to disagree with
what the record holds. A stored block flag would be a second authority that the manifest, the
progress record, and the backup endpoint would each have to keep in step.

#### Scenario: A block gains a skill after a skip

- **WHEN** a unit marked known gains a newly playable skill
- **THEN** no stored block state is stale or has to be migrated
- **AND** the new skill is at mastery 0, reads as practised, and is gated by its prerequisites

#### Scenario: The record carries no block flag

- **WHEN** a progress record is written after a block is marked known
- **THEN** it differs from the record it replaced only in per-skill mastery, source, and prior
  mastery, and in the stored version
- **AND** it carries no block, unit, or stage key

### Requirement: Skip entry points offer both optional routes

A fresh learner SHALL receive an optional stage-by-stage starting-point offer before normal
practice. The offer SHALL begin with the first playable stage and, after that stage is marked
known, SHALL offer the next playable stage in curriculum order until the learner chooses to
start practice or no later playable stage remains. Choosing to start practice SHALL open the
first unmastered unit under the existing course-frontier rule.

A playable unit SHALL offer a small "I already know this" affordance when every playable skill
in it is locked or when none of its playable skills has any attempt or mastery. A partially
practised, unlocked unit SHALL NOT offer a new skip. A unit containing at least one skill whose
source is tested out of or self-assessed SHALL instead offer "Actually, let me practice this"
and SHALL use the existing reversible block mutation.

Both a stage offer and a unit affordance SHALL open the same two routes together: "Check first"
as the suggested route and "Just skip it" as the direct route. Neither route SHALL be mandatory.
The direct route SHALL mark the selected stage or unit known with source self-assessed through
one existing local block mutation.

#### Scenario: Fresh learner can move one stage at a time

- **WHEN** a fresh learner marks the first offered stage known and continues finding their
  starting point
- **THEN** the next playable stage in curriculum order is offered
- **AND** the learner can stop and start at the first unmastered unit at any stage boundary

#### Scenario: Existing unit offers both routes

- **WHEN** a learner opens a playable unit that is locked or has no recorded attempt or mastery
- **THEN** the unit offers "I already know this"
- **AND** activating it offers both "Check first" and "Just skip it"

#### Scenario: Part-practised open unit has no new skip offer

- **WHEN** a unit has an unlocked playable skill with recorded practice
- **THEN** the unit does not offer "I already know this"

#### Scenario: Direct skip records self-assessment

- **WHEN** the learner chooses "Just skip it" for an eligible stage or unit
- **THEN** the block is marked known with source self-assessed in one local progress mutation
- **AND** no check problem is presented

#### Scenario: Marked unit offers its reversal

- **WHEN** a unit contains a skill whose source is tested out of or self-assessed
- **THEN** the unit offers "Actually, let me practice this" instead of a new skip
- **AND** activating it restores only what the existing reversal says that skip granted

### Requirement: Check first uses eight fixed assessment problems

One check SHALL contain exactly eight recorded problem results sampled from the selected
stage's or unit's playable skills. Skill selection SHALL use a fixed session snapshot and SHALL
cover every playable skill before selecting one of them again when the block contains fewer than
eight playable skills. When the block contains more than eight playable skills, it SHALL select
eight without replacement. Problems SHALL be generated lazily from those selected skills.

Every check problem SHALL use difficulty 3. The ordinary opening warm-up, mastery-derived
difficulty, silent recovery, and miss re-queue rules SHALL NOT change that difficulty or add a
problem. The check SHALL offer no pre-answer hint. Any entry whose existing submission policy
records a correct or incorrect attempt, including a right value in the wrong required form,
SHALL consume the current problem once. An unfinished entry whose policy records no attempt
SHALL remain on the same problem and SHALL NOT consume one of the eight results.

#### Scenario: Large block samples eight distinct skills

- **WHEN** a check starts for a playable block containing at least eight skills
- **THEN** its fixed session snapshot contains eight distinct skill generators from that block
- **AND** the first and every later problem are generated at difficulty 3

#### Scenario: Small block covers skills before repeating

- **WHEN** a check starts for a playable block containing fewer than eight skills
- **THEN** every playable skill appears in the fixed session snapshot before any skill is
  selected for another slot
- **AND** the snapshot still contains exactly eight slots

#### Scenario: Miss advances without recovery or retry

- **WHEN** the learner records an incorrect value on one check problem and dismisses its
  diagnostic feedback
- **THEN** that problem counts as one of the eight results and the check advances to the next
  original slot
- **AND** the missed problem is not re-queued and later problems remain at difficulty 3

#### Scenario: Wrong form counts as an incorrect check result

- **WHEN** the learner submits the right value in the wrong form required by the problem
- **THEN** it counts as one incorrect check result and advances after its feedback
- **AND** no practice or review attempt is persisted

#### Scenario: Non-attempt stays on the current check problem

- **WHEN** the answer is unfinished or otherwise records no attempt
- **THEN** the check result count does not change
- **AND** the current problem remains available to answer

### Requirement: Check evidence remains session-local

Recorded check answers SHALL exist only in the active check session. They SHALL NOT change a
skill's aggregate attempts, correct count, mastery, source, prior mastery, intro state, recall
strength, next-review date, or review-attempt count. They SHALL NOT change progress-level
misconception counts, XP, coins, daily-goal state, streak state, checkpoints, or pin upgrades,
and SHALL NOT advance the persisted progress version or schedule background sync.

Leaving an unfinished check SHALL discard its session score and SHALL leave progress unchanged.
The only progress mutation a completed check may cause is the existing tested-out block mark
after a passing result.

#### Scenario: Answering a locked skill does not unlock it

- **WHEN** a check presents and records an answer for a skill whose ordinary lesson is locked
- **THEN** that skill gains no stored attempt or mastery
- **AND** leaving or failing the check leaves its ordinary unlock state unchanged

#### Scenario: Leaving a partial check writes nothing

- **WHEN** the learner leaves after recording fewer than eight check results
- **THEN** the session score is discarded
- **AND** all persisted learning, reward, and sync state remains unchanged

#### Scenario: Diagnosed check miss is not learning history

- **WHEN** an incorrect check answer matches a predicted misconception
- **THEN** the learner may receive the existing diagnostic feedback
- **AND** neither the skill attempt totals nor the progress-level misconception count changes

### Requirement: Seven correct results test a block out

After all eight results, seven or eight correct answers SHALL mark the selected stage or unit
known with source tested out through one existing local block mutation. The successful check
SHALL award no lesson or review completion reward and SHALL announce no achievement transition.

Six or fewer correct answers SHALL leave the selected block and all persisted progress
unchanged. The result SHALL avoid failure, penalty, lost-progress, or score-shame framing and
SHALL offer the first unmastered unit selected by the existing course-frontier rule. Continuing
SHALL open that unit.

#### Scenario: Seven correct tests out

- **WHEN** a learner records seven correct results across the eight check problems
- **THEN** the selected block is marked known with source tested out in one local mutation
- **AND** no lesson reward, checkpoint, pin upgrade, or streak milestone is awarded or announced

#### Scenario: Perfect check uses the same tested-out result

- **WHEN** a learner records eight correct results
- **THEN** the selected block is marked known with source tested out
- **AND** no stronger mastery or different source is granted

#### Scenario: Six correct offers practice without penalty

- **WHEN** a learner records six or fewer correct results
- **THEN** persisted progress is unchanged
- **AND** the result offers the first unmastered unit without failure or penalty framing

### Requirement: Fresh-start presentation state is compatibility-safe

Whether the optional first-launch offer has ended SHALL be presentation state, not learning
evidence. Dismissing it or choosing to start practice SHALL persist that state through the
existing local write and opaque sync path without changing attempts, mastery, recall, rewards,
or unlocks.

A stored progress record that predates this presentation field SHALL remain valid. Such a
record SHALL read the offer as already ended when it contains existing learning evidence, and
as not ended only when it is otherwise fresh. Unknown fields SHALL remain intact, and no
progress schema-version or endpoint-format change SHALL be required.

#### Scenario: Choosing normal practice ends the fresh-start offer

- **WHEN** a fresh learner chooses to start practice without marking another stage known
- **THEN** the first-launch offer is not shown again
- **AND** the learner's attempt, mastery, review, reward, and unlock state is unchanged

#### Scenario: Existing legacy learner receives no onboarding

- **WHEN** a stored record predates the presentation field and carries existing learning
  evidence
- **THEN** it loads normally and the first-launch starting-point offer is not shown
- **AND** all known and unknown stored fields survive reconciliation

#### Scenario: Untouched legacy record remains fresh

- **WHEN** a stored record predates the presentation field and carries no learning evidence
- **THEN** it loads normally and may receive the optional first-launch offer

### Requirement: A skipped skill is scheduled to return sooner than a practised one

Marking a block known SHALL record, on exactly the skills it raised, an explicit recall strength
equal to the strength that skill held immediately before the mark, and a next-review date one
interval for that strength after the local day of the mark. A skill the skip finds untouched
therefore enters review at strength 0 and is due the next local day — sooner than any skill a
completed lesson has scheduled, since a completed lesson raises strength to the mastery it
reached.

The strength SHALL be recorded explicitly rather than left to the read-time default. A record
that predates review scheduling derives its strength from its mastery, so raising mastery to 3
would otherwise read as strength 3 and return the skipped skill in seven days — slower than a
practised skill, which is the opposite of watching it. Pinning the strength the skill actually
held is what makes the guarantee true for every record rather than only for recent ones.

Marking a block known SHALL NOT change the recall strength of a skill it did not raise, and
SHALL NOT lower any strength. Because the recorded strength is the one the skill already held,
the mark changes only when the skill is next due, never how strongly it is held.

Review raises strength without raising mastery, so a skill can reach the mark carrying a strength
above the mastery it holds. Such a skill SHALL keep that strength and its longer interval, and
therefore returns later than a freshly practised skill rather than sooner. The guarantee above is
for the skill a skip finds untouched, which is the one the app has no evidence about; a skill that
has earned recall evidence of its own keeps what that evidence bought.

#### Scenario: An untouched skipped skill is due the next day

- **WHEN** a learner marks a unit known that they had never practised
- **THEN** every raised skill records recall strength 0
- **AND** each is due for review one local calendar day after the mark

#### Scenario: A skipped skill returns before a practised one

- **WHEN** one skill reaches mastery 3 by completing lessons and another reaches mastery 3 by a
  skip on the same local day
- **THEN** the practised skill is due seven local days later
- **AND** the skipped skill is due one local day later

#### Scenario: A part-practised skill keeps the strength it earned

- **WHEN** a mark raises a skill whose recall strength is 2
- **THEN** that skill records recall strength 2, not 0 and not the granted mastery
- **AND** it is due three local calendar days after the mark

#### Scenario: A legacy record is not scheduled from its granted mastery

- **WHEN** a mark raises a skill from a record that carries no review fields at all
- **THEN** that skill records the strength its record read before the mark
- **AND** its next-review date follows that strength, not the mastery 3 the mark granted

#### Scenario: A skill the mark did not raise keeps its schedule

- **WHEN** a mark leaves a skill alone because it already stands at mastery 3 or above
- **THEN** that skill's recall strength and next-review date are unchanged

### Requirement: Taking a block back withdraws the schedule the skip granted

Taking a block back SHALL restore, on exactly the skills it resets, the next-review date those
skills' own practice implies: the date derived from a valid last-practised day at the recorded
strength, and no scheduled review at all when there is no valid last-practised day. A skill the
skip found untouched therefore leaves review entirely, and one the skip found part-practised
returns to the schedule its own lessons had earned.

This SHALL hold whether or not the learner ever answered a review problem for the skill. Review
selection considers only whether a skill is due, so a skill left scheduled after its mastery
returned to 0 would be offered in a review lesson while locked and never practised. Withdrawing
the schedule is what keeps review offering only skills the learner has evidence for.

#### Scenario: An untouched skipped skill leaves review

- **WHEN** a learner takes back a unit they marked known and never practised
- **THEN** none of its reset skills has a next-review date
- **AND** none of them is offered in a review lesson

#### Scenario: A part-practised skill returns to its earned schedule

- **WHEN** a learner takes back a unit holding a skill they had practised before the mark
- **THEN** that skill's next-review date is the one its own last practice implies at its
  recorded strength

#### Scenario: A re-locked skill is never reviewed

- **WHEN** a reversal returns a skill to mastery 0 and its prerequisites lock it again
- **THEN** that skill does not appear in any review lesson

### Requirement: Weak review of a skipped skill offers to warm its unit up

The app SHALL derive a warm-up suggestion for a unit when a skill in it whose source is tested
out of or self-assessed has recorded at least 5 review attempts and a review accuracy below 60%.
Review accuracy SHALL be the skill's review-correct count over its review-attempt count, so
standard lesson answers do not count toward it in either direction.

The suggestion SHALL be derived from the stored record whenever progress is read, and SHALL NOT
be stored. It therefore SHALL disappear on its own once the skill's review accuracy recovers,
once the learner practises the skill, or once the skip is taken back, without any dismissal
state to persist or sync.

#### Scenario: Weak review raises the suggestion

- **WHEN** a self-assessed skill has 5 review attempts of which 2 were correct
- **THEN** its unit is suggested for warming up

#### Scenario: Too little evidence raises nothing

- **WHEN** a self-assessed skill has 4 review attempts of which 1 was correct
- **THEN** no warm-up suggestion is raised for it

#### Scenario: Accuracy at the threshold raises nothing

- **WHEN** a self-assessed skill has 5 review attempts of which 3 were correct
- **THEN** no warm-up suggestion is raised for it

#### Scenario: A practised skill is not watched this way

- **WHEN** a skill whose source is practised has 5 review attempts of which 2 were correct
- **THEN** no warm-up suggestion is raised for it

#### Scenario: Recovery clears the suggestion

- **WHEN** a suggested skill answers further review problems correctly and passes 60% accuracy
- **THEN** no warm-up suggestion is raised for it
- **AND** nothing had to be written to clear it

#### Scenario: Taking the block back clears the suggestion

- **WHEN** the learner takes back the unit a suggestion named
- **THEN** no warm-up suggestion is raised for that unit

### Requirement: Repeated failure points back at a skipped prerequisite

The app SHALL derive a warm-up suggestion for the unit of a skipped prerequisite when a skill
the learner is practising has recorded at least 5 attempts, an accuracy below 60%, and at least
one unlock prerequisite whose source is tested out of or self-assessed. The failing skill's
evidence SHALL be its aggregate attempt and correct counts, since a downstream skill fails in
ordinary lessons as much as in review.

The suggestion SHALL name both the unit to warm up and the skill whose failures pointed at it.
A learner cannot see that the cause of their trouble is a block they declared known, which is
the whole reason this exists.

The prerequisite graph SHALL be the curriculum manifest's, read through the same unlock
prerequisites the course already uses, so a prerequisite with no generator cannot be suggested
and no second graph is introduced.

#### Scenario: A failing skill names its skipped prerequisite

- **WHEN** a learner has 6 attempts and 3 correct on a skill whose prerequisite was self-assessed
- **THEN** the prerequisite's unit is suggested for warming up
- **AND** the suggestion names the failing skill

#### Scenario: A practised prerequisite raises nothing

- **WHEN** a learner fails a skill repeatedly and every prerequisite of it reads as practised
- **THEN** no warm-up suggestion is raised

#### Scenario: Occasional misses raise nothing

- **WHEN** a learner has 4 attempts and 1 correct on a skill whose prerequisite was skipped
- **THEN** no warm-up suggestion is raised

#### Scenario: Practising the prerequisite clears the suggestion

- **WHEN** the learner completes a lesson for the skipped prerequisite, making it practised
- **THEN** no warm-up suggestion is raised from that prerequisite

### Requirement: One quiet warm-up offer leads to the existing reversal

At most one warm-up suggestion SHALL be offered at a time. When more than one is available the
app SHALL choose deterministically in curriculum order, so the same record always offers the
same one and the offer does not move between reads.

A suggestion SHALL only be offered for a unit that still holds a skill whose source is tested
out of or self-assessed, so the offer always leads somewhere the learner can act.

The offer SHALL appear on the course tree alongside the existing review entry point, SHALL name
the unit, and SHALL use warm-up framing rather than correction, failure, penalty, or
lost-progress framing. Acting on it SHALL open that unit, where the existing "Actually, let me
practice this" affordance stands. The offer itself SHALL NOT mark, unmark, or otherwise change
any progress: taking a skip back lowers a mastery level, which keeps the deliberate control it
already has.

#### Scenario: Only one offer is shown

- **WHEN** two units both qualify for a warm-up suggestion
- **THEN** exactly one is offered
- **AND** the same one is offered on every read of the same record

#### Scenario: The offer leads to the unit

- **WHEN** the learner acts on a warm-up offer
- **THEN** the named unit opens
- **AND** it presents its existing "Actually, let me practice this" affordance

#### Scenario: Seeing or ignoring the offer writes nothing

- **WHEN** a warm-up offer is shown, acted on, or ignored
- **THEN** no mastery, source, prior mastery, review field, or stored version changes

#### Scenario: A unit with nothing to take back is not offered

- **WHEN** every skill in a qualifying unit has become practised
- **THEN** that unit is not offered for warming up

