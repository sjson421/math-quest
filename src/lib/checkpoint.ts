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

export type CompletionView =
  | 'lesson-result'
  | 'stage-checkpoint'
  | 'pin-upgrade'
  | 'streak-milestone'

type CompletionAction =
  | 'show-checkpoint'
  | 'show-pin-upgrade'
  | 'show-streak-milestone'
  | 'exit'

/** What a lesson earned beyond its XP and coins. */
export type Earned = {
  checkpoint: boolean
  upgrade: boolean
  milestone: boolean
}

/**
 * The screens that can follow the result, in the order they are shown.
 *
 * A list rather than a chain of conditionals, because the order *is* the
 * design and three nested `if`s hide it: the checkpoint is about the course,
 * the pin is about the distance the learner has covered, and the milestone is
 * about the habit — largest thing first, and least tied to the learning last.
 * Adding a fifth screen is a row here rather than another boolean to thread
 * past the four that already exist.
 */
const AFTER_RESULT = [
  ['stage-checkpoint', 'checkpoint', 'show-checkpoint'],
  ['pin-upgrade', 'upgrade', 'show-pin-upgrade'],
  ['streak-milestone', 'milestone', 'show-streak-milestone'],
] as const satisfies readonly (readonly [CompletionView, keyof Earned, CompletionAction])[]

/**
 * What one Continue tap does at each step of the completion flow.
 *
 * Only the result always happens; each screen after it appears if the lesson
 * earned it. A lesson can earn all three, some, or none, and the learner
 * reaches the same place with one tap per screen either way.
 *
 * Taking `earned` as an object rather than as positional booleans is not
 * decoration: three adjacent `boolean` arguments are three chances to pass the
 * pin's where the streak's belongs, and the compiler cannot tell them apart.
 */
export function completionAction(view: CompletionView, earned: Earned): CompletionAction {
  const from =
    view === 'lesson-result'
      ? 0
      : AFTER_RESULT.findIndex(([screen]) => screen === view) + 1

  return AFTER_RESULT.slice(from).find(([, key]) => earned[key])?.[2] ?? 'exit'
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
