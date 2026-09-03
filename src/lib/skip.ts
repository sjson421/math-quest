/**
 * Marking a block of the course already known, and taking it back.
 *
 * Pure functions over a progress record, for the reason `wardrobe.ts` and
 * `submit.ts` exist: component tests render first paint to a string in node with
 * no handler attached, so a decision behind a tap is a decision no test can
 * reach. Each mutation returns a new record or `null`, and `null` means the
 * request was refused — the store persists only a non-null result, so a mark
 * that raises nothing advances no version and schedules no push.
 *
 * A block is a stage or a unit. Which skills it holds is the curriculum
 * manifest's answer and nothing else's, read through the course tree the
 * navigation already renders, so a block that gains or loses a skill needs no
 * migration and no stored block state can disagree with it.
 */

import {
  course,
  courseStageById,
  courseUnitById,
  generators,
  implementedSkillIds,
  manifestIndex,
  unlockPrerequisites,
} from '../curriculum'
import type { TreeLevel } from '../components/Home'
/**
 * Type-only, and deliberately so: `store/progress.ts` imports this module, so a
 * value imported back would be the runtime cycle `checkpoint.ts` and `pin.ts`
 * refuse for the same reason. Types erase at build time.
 */
import type { Progress, SkillProgress, SkillSource } from '../store/progress'
import { nextReviewFromPractice, readReviewState, scheduleAfterSkip } from './review'
import type { Rng } from './rng'
import type { SkillGenerator } from './types'

/**
 * Mastery a skip grants: clear of `UNLOCK_THRESHOLD` so everything downstream
 * opens, and short of `MAX_MASTERY` so a skipped skill reads as not needed yet
 * rather than finished.
 */
export const SKIP_MASTERY = 3

/** Fixed assessment shape: eight slots at the middle difficulty. */
export const CHECK_PROBLEM_COUNT = 8
export const CHECK_DIFFICULTY = 3

/**
 * What a learner may declare about a block. Practised is missing on purpose —
 * it is what a lesson earns and what a reversal restores, never something
 * claimed.
 */
export type DeclaredSource = Exclude<SkillSource, 'practiced'>

const SOURCES: readonly unknown[] = ['practiced', 'tested-out', 'self-assessed']

const isSource = (value: unknown): value is SkillSource => SOURCES.includes(value)

/**
 * One skill's source, without changing the object it was given.
 *
 * Defaulted and normalised here rather than in `reconcile()`, as `review.ts`
 * does for strength and review dates: a record with no source predates skipping,
 * so its mastery came from lessons, and a value the app does not recognise is a
 * corrupt or hand-edited blob that should still load. Both read as practised,
 * which is the reading that cannot destroy anything — a reversal leaves a
 * practised skill alone.
 */
export function readSource(skill: SkillProgress | undefined): SkillSource {
  const source = skill?.source
  return isSource(source) ? source : 'practiced'
}

/**
 * The mastery one skill's record says a mark found, without changing the object
 * it was given.
 *
 * Bounded above by the mastery the skill currently holds, which is the point
 * rather than a nicety: taking a block back is the only thing in the app allowed
 * to lower a mastery level, so no stored value may make it *raise* one. A
 * corrupt, negative, fractional or absent value reads as 0 — the level a skip
 * finds on a skill nobody has touched, and the reading that cannot invent
 * progress.
 *
 * `MAX_MASTERY` would be the wrong bound here: `reconcile()` never caps a stored
 * mastery, so the level a reversal must not exceed is the one the record
 * actually holds.
 */
export function readPriorMastery(skill: SkillProgress | undefined): number {
  if (!skill) return 0
  return Math.min(masteryLevel(skill.priorMastery), masteryLevel(skill.mastery))
}

/**
 * A stored value read as a mastery level: a positive integer, or 0.
 *
 * The current mastery goes through it too, not just the recorded one. A record
 * holding `NaN` or a fraction is a corrupt or hand-edited blob, and clamping
 * against it directly would carry that value straight into the record a
 * reversal writes.
 */
function masteryLevel(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : 0
}

/**
 * The playable skills a block holds, or `undefined` when there are none.
 *
 * The course tree carries only implemented skills and drops the units and stages
 * left empty by them, so an unknown block and a block with nothing playable in it
 * are the same miss — neither is in either map. Unit ids and stage ids are
 * disjoint (a test below pins that), so the order these are tried is a detail.
 */
function blockSkillIds(blockId: string): readonly string[] | undefined {
  const unit = courseUnitById.get(blockId)
  if (unit) return unit.skills.map((skill) => skill.id)

  const stage = courseStageById.get(blockId)
  return stage?.units.flatMap(({ skills }) => skills.map((skill) => skill.id))
}

/** The generators a playable stage or unit holds, or `undefined` for a miss. */
export function playableBlockSkills(blockId: string): SkillGenerator[] | undefined {
  const ids = blockSkillIds(blockId)
  if (!ids?.length) return undefined

  const skills = ids.flatMap((id) => {
    const skill = generators.get(id)
    return skill ? [skill] : []
  })

  return skills.length === ids.length ? skills : undefined
}

/** Whether one skill's mastery was declared rather than earned. */
function isDeclared(skill: SkillProgress | undefined): boolean {
  const source = readSource(skill)
  return source === 'tested-out' || source === 'self-assessed'
}

/** Whether a block contains a skip claim that can be withdrawn. */
export function blockHasDeclaredSource(
  progress: Pick<Progress, 'skills'>,
  blockId: string,
): boolean {
  return Boolean(blockSkillIds(blockId)?.some((id) => isDeclared(progress.skills[id])))
}

function hasPractised(skill: SkillProgress | undefined): boolean {
  return (skill?.attempts ?? 0) > 0 || (skill?.mastery ?? 0) > 0
}

/** Whether a playable unit is still a sensible candidate for a new skip. */
export function unitCanBeSkipped(
  unitId: string,
  progress: Pick<Progress, 'skills'>,
  isUnlocked: (skillId: string) => boolean,
): boolean {
  const unit = courseUnitById.get(unitId)
  if (!unit || unit.skills.length === 0) return false

  const allLocked = unit.skills.every(({ id }) => !isUnlocked(id))
  const allUnstarted = unit.skills.every(({ id }) => !hasPractised(progress.skills[id]))
  return allLocked || allUnstarted
}

export type UnitSkipState = 'new' | 'reversal'

/** The one unit action the tree should offer, if any. */
export function unitSkipState(
  unitId: string,
  progress: Pick<Progress, 'skills'>,
  isUnlocked: (skillId: string) => boolean,
): UnitSkipState | undefined {
  if (blockHasDeclaredSource(progress, unitId)) return 'reversal'
  return unitCanBeSkipped(unitId, progress, isUnlocked) ? 'new' : undefined
}

/** The first playable stage that still has a skill below skip mastery. */
export function nextFreshStartStage(
  progress: Pick<Progress, 'skills'>,
) {
  return course.find((stage) =>
    stage.units
      .flatMap(({ skills }) => skills)
      .some(({ id }) => (progress.skills[id]?.mastery ?? 0) < SKIP_MASTERY),
  )
}

/** Freeze one block-wide, seeded assessment snapshot. */
export function selectCheckSkills(
  blockId: string,
  rng: Pick<Rng, 'shuffle'>,
): SkillGenerator[] | undefined {
  const skills = playableBlockSkills(blockId)
  if (!skills) return undefined

  const selected: SkillGenerator[] = []
  while (selected.length < CHECK_PROBLEM_COUNT) {
    selected.push(...rng.shuffle(skills).slice(0, CHECK_PROBLEM_COUNT - selected.length))
  }
  return selected
}

/** Seven or eight recorded results pass the check. */
export function checkPasses(correctCount: number): boolean {
  return correctCount === CHECK_PROBLEM_COUNT - 1 || correctCount === CHECK_PROBLEM_COUNT
}

/** Choose where a check result's Continue action returns without owning state. */
export function skipResultDestination(
  passed: boolean,
  freshStart: boolean,
  frontierUnitId: string | undefined,
  back: TreeLevel,
): TreeLevel | null {
  if (passed) return freshStart ? null : back
  return frontierUnitId ? { name: 'skills', unitId: frontierUnitId } : back
}

/** A record with the named skills replaced, or `null` when there are none. */
function withSkills(
  progress: Progress,
  changed: Record<string, SkillProgress>,
): Progress | null {
  if (Object.keys(changed).length === 0) return null
  return { ...progress, skills: { ...progress.skills, ...changed } }
}

/**
 * Mark a block already known, declaring how the learner knows it.
 *
 * Raises to `SKIP_MASTERY` rather than setting it: the mark is per block and
 * practice is per skill, so a learner who had already taken one skill to 5
 * inside a unit they then marked known would otherwise be demoted, and no rule
 * may reduce an earned mastery level.
 *
 * The declared source is recorded **only on the skills this actually raised**,
 * which is what makes the reversal correct — a skill left where it was keeps
 * saying it was practised, so taking the block back does not touch it.
 *
 * Each raised skill also records the mastery this found. A skill practised only
 * to 1 or 2 is still raised, because leaving it below `UNLOCK_THRESHOLD` would
 * keep the course shut and defeat the skip, and once raised it is
 * indistinguishable from one found at 0 — so the level it came from is written
 * down here or lost, and the reversal would have to destroy earned practice.
 *
 * Each raised skill is also scheduled for review, at the strength it already
 * held — see `scheduleAfterSkip()`. That is what makes a skip watched rather
 * than merely permitted, and it is computed before the mastery is raised because
 * a record carrying no strength reads its strength *from* mastery: scheduling
 * after the raise would give a skipped skill a seven-day interval, slower than a
 * practised one.
 *
 * Refused when the block holds no playable skill, and when every skill in it
 * already stands at `SKIP_MASTERY` or above: re-marking a block the learner
 * already knows is the ordinary way to reach this, and it has nothing to write.
 */
export function markKnown(
  progress: Progress,
  blockId: string,
  source: DeclaredSource,
  today: string,
): Progress | null {
  const skillIds = blockSkillIds(blockId)
  if (!skillIds) return null

  const raised: Record<string, SkillProgress> = {}
  for (const id of skillIds) {
    // A skill the record does not carry is built here rather than taken from the
    // store's default, so the only review fields a mark writes are the two below.
    // A record the app produced always carries the skill, since `reconcile()`
    // seeds every skill the manifest offers.
    const skill: SkillProgress = progress.skills[id] ?? {
      mastery: 0,
      lastPracticed: null,
      attempts: 0,
      correct: 0,
    }
    if (skill.mastery >= SKIP_MASTERY) continue
    const { strength, nextReview } = scheduleAfterSkip(skill, today)
    raised[id] = {
      ...skill,
      mastery: SKIP_MASTERY,
      source,
      // Normalised on the way in as well as on the way out: writing a level the
      // reader would reject would silently cost the learner what they earned.
      priorMastery: masteryLevel(skill.mastery),
      strength,
      nextReview,
    }
  }

  return withSkills(progress, raised)
}

/**
 * Take a block back: *actually, let me practice this.*
 *
 * The only thing in the app that lowers a mastery level, and it reaches exactly
 * the skills the skip granted — those whose source is a declaration rather than
 * practice. Resetting everything sitting at `SKIP_MASTERY` instead would be a
 * heuristic that misfires the moment a learner earns that level honestly, which
 * is the whole reason the source is stored.
 *
 * The source decides *which* skills this reaches; the mastery each of them
 * recorded at the mark decides *what it returns to*. That is 0 for a skill the
 * skip found untouched and the earned level for one it found part-practised, so
 * a withdrawn claim returns the learner exactly where they stood and costs them
 * nothing they did. Both fields are cleared in the same write, because there is
 * no granted level left to restore afterwards.
 *
 * The schedule the mark granted goes back with it: each reset skill returns to
 * the next-review date its own last practice implies, which is no scheduled
 * review at all for one the skip found untouched. That is correctness rather
 * than tidiness — `selectReviewSkills()` filters on due date alone, so a date
 * left behind would offer a re-locked, never-practised skill in a review lesson.
 * Strength is left alone, because the mark never changed it.
 *
 * Refused when the block holds nothing the skip granted.
 */
export function unmark(progress: Progress, blockId: string): Progress | null {
  const skillIds = blockSkillIds(blockId)
  if (!skillIds) return null

  const reset: Record<string, SkillProgress> = {}
  for (const id of skillIds) {
    const skill = progress.skills[id]
    // An absent record was never granted anything, so there is nothing here to
    // take back and no reason to write one.
    if (!skill || readSource(skill) === 'practiced') continue
    reset[id] = {
      ...skill,
      mastery: readPriorMastery(skill),
      source: 'practiced',
      priorMastery: 0,
      nextReview: nextReviewFromPractice(skill),
    }
  }

  return withSkills(progress, reset)
}

/**
 * Why a unit is being offered for a warm-up.
 *
 * Both readings ask the same question — which unit should the learner warm up —
 * and differ only in the evidence, so they produce one suggestion with one
 * surface rather than two of each to keep in step.
 */
export type WarmUpReason = 'weak-review' | 'repeated-failure'

export type WarmUpSuggestion = {
  unitId: string
  unitName: string
  reason: WarmUpReason
  /** The skill whose failures pointed here, on the downstream reading only. */
  skillId?: string
}

/** Evidence enough to act on, and worse than the learner would want. */
const WARM_UP_MIN_ATTEMPTS = 5
const WARM_UP_ACCURACY = 0.6

/** One stored count, read the way every other stored number here is read. */
function countOf(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

/**
 * The one threshold both readings apply, so there is one rule to explain.
 *
 * Multiplied rather than divided: zero attempts is the ordinary case here, and
 * accuracy exactly at the threshold is doing well enough to be left alone. Both
 * counts are read defensively because the aggregate pair comes straight off the
 * stored record; a count above its attempts needs no clamp here, since anything
 * that high is above the threshold either way.
 */
function failingCounts(attempts: unknown, correct: unknown): boolean {
  const total = countOf(attempts)
  return total >= WARM_UP_MIN_ATTEMPTS && countOf(correct) < total * WARM_UP_ACCURACY
}

/** The suggestion one skill raises about itself, from its review record. */
function weakReviewOf(skill: SkillProgress | undefined): boolean {
  if (!skill || !isDeclared(skill)) return false

  const { reviewAttempts, reviewCorrect } = readReviewState(skill)
  return failingCounts(reviewAttempts, reviewCorrect)
}

/**
 * The skipped prerequisite a failing skill points back at, if any.
 *
 * The graph is the manifest's, read through the unlock prerequisites the course
 * already uses, so a prerequisite nobody can play cannot be suggested and there
 * is no second graph to keep in step.
 */
function skippedPrerequisiteOf(
  progress: Pick<Progress, 'skills'>,
  skillId: string,
): string | undefined {
  const skill = progress.skills[skillId]
  if (!failingCounts(skill?.attempts, skill?.correct)) return undefined

  return unlockPrerequisites.get(skillId)?.find((id) => isDeclared(progress.skills[id]))
}

/**
 * The one unit the app quietly offers to warm up, if any.
 *
 * Derived on every read and stored nowhere, so it clears itself when review
 * accuracy recovers, when the skill is practised, or when the skip is taken
 * back — none of which should need a dismissal flag to be written, cleared and
 * synced.
 *
 * Watched through different counters on purpose. A skipped skill is watched
 * through review because review is the only place the app sees it at all; a
 * downstream skill is watched through its aggregate counts because that is where
 * it actually fails, in ordinary lessons.
 *
 * At most one, taken in curriculum order so the same record always offers the
 * same unit and the offer does not move between reads. Every suggestion names a
 * unit that still holds a skip claim, because the evidence for either reading is
 * a skill whose source is a declaration — so acting on it always leads somewhere
 * the learner can take something back.
 */
export function warmUpSuggestion(
  progress: Pick<Progress, 'skills'>,
): WarmUpSuggestion | undefined {
  for (const skillId of implementedSkillIds) {
    if (weakReviewOf(progress.skills[skillId])) {
      const unit = manifestIndex.get(skillId)?.unit
      if (unit) return { unitId: unit.id, unitName: unit.name, reason: 'weak-review' }
    }

    const prerequisite = skippedPrerequisiteOf(progress, skillId)
    const unit = prerequisite ? manifestIndex.get(prerequisite)?.unit : undefined
    if (unit) {
      return { unitId: unit.id, unitName: unit.name, reason: 'repeated-failure', skillId }
    }
  }

  return undefined
}
