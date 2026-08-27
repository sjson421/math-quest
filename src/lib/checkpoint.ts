/**
 * When a lesson carries the learner across a stage boundary, and what the one
 * Continue tap does on either side of it.
 *
 * Both are pure for the reason `submit.ts` and `course.ts` are: a node test has
 * no DOM and attaches no handlers, so a decision a component makes for itself is
 * unreachable from a test.
 */

import type { SkillLocation, SkillState } from '../curriculum/manifest'

/**
 * The subset of `Progress` this file reads. Structural rather than the real
 * type because `store/progress.ts` imports *this* module, so importing its
 * values back would be a runtime cycle — which is also why `threshold` arrives
 * as an argument instead of as `UNLOCK_THRESHOLD`, keeping one authority for it.
 */
type MasteryRecord = {
  skills: Readonly<Record<string, { mastery: number } | undefined>>
}

export type StageCheckpoint = {
  id: string
  name: string
}

export type CompletionView = 'lesson-result' | 'stage-checkpoint' | 'pin-upgrade'
type CompletionAction = 'show-checkpoint' | 'show-pin-upgrade' | 'exit'

/**
 * What one Continue tap does at each step of the completion flow.
 *
 * Three screens, of which only the first always happens: the result, then a
 * stage checkpoint if the lesson crossed a boundary, then a pin upgrade if it
 * earned one. A lesson can earn both, one, or neither, and the learner reaches
 * the same place with one tap per screen either way.
 *
 * The checkpoint comes first because it is about the course and the pin is
 * about the learner: finishing a stage is the larger thing, and the pin reads
 * as the reward that followed it rather than an interruption before it.
 */
export function completionAction(
  view: CompletionView,
  hasCheckpoint: boolean,
  hasUpgrade: boolean,
): CompletionAction {
  if (view === 'lesson-result' && hasCheckpoint) return 'show-checkpoint'
  if (view !== 'pin-upgrade' && hasUpgrade) return 'show-pin-upgrade'

  return 'exit'
}

type CheckpointOptions = {
  skillId: string
  before: MasteryRecord
  after: MasteryRecord
  locations: ReadonlyMap<string, SkillLocation>
  states: ReadonlyMap<string, SkillState>
  threshold: number
}

/**
 * Whether a stage is complete: every declared skill is implemented, and every
 * one is at the threshold that opens what follows.
 *
 * Walks the **manifest's** membership, never the derived `course` tree or
 * `stageProgress`. Both of those deliberately omit planned skills, so both would
 * report a partly built stage as fully done — the sixteen playable skills of the
 * 44-skill Stage B would announce a completed stage. Reading the planned ones and
 * failing on them is the whole point, not an oversight to tidy away.
 */
function hasReachedStage(
  stage: SkillLocation['stage'],
  progress: MasteryRecord,
  states: ReadonlyMap<string, SkillState>,
  threshold: number,
): boolean {
  return stage.units.every((unit) =>
    unit.skills.every(
      (skill) =>
        states.get(skill.id) === 'implemented' &&
        (progress.skills[skill.id]?.mastery ?? 0) >= threshold,
    ),
  )
}

/**
 * The stage boundary crossed by one persisted lesson transition, if any.
 *
 * A transition, not a snapshot, which is what makes it fire once without storing
 * anything: a later lesson starts from an already complete stage, and a restored
 * record that is already complete has no crossing to find.
 */
export function crossedStageCheckpoint({
  skillId,
  before,
  after,
  locations,
  states,
  threshold,
}: CheckpointOptions): StageCheckpoint | undefined {
  const stage = locations.get(skillId)?.stage
  const beforeMastery = before.skills[skillId]?.mastery ?? 0
  const afterMastery = after.skills[skillId]?.mastery ?? 0

  if (!stage || beforeMastery >= threshold || afterMastery < threshold) return undefined
  if (!hasReachedStage(stage, after, states, threshold)) return undefined

  return { id: stage.id, name: stage.name }
}
