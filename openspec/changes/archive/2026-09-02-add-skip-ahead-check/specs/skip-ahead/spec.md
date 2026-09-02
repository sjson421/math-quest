## ADDED Requirements

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
