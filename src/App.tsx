import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { course, courseUnitById, getSkill, implementedSkillIds, manifestIndex } from './curriculum'
import { Home, type TreeLevel } from './components/Home'
import { Mascot } from './components/Mascot'
import { SkipAheadChoice, SkipAheadResult, type SkipBlock } from './components/SkipAhead'
import type { PinTier } from './lib/pin'
import { RecoveryKeyIntro } from './components/RecoveryKey'
import { todayKey } from './lib/calendar'
import { currentUnitId } from './lib/course'
import { selectReviewSkills } from './lib/review'
import { makeRng } from './lib/rng'
import {
  checkPasses,
  nextFreshStartStage,
  selectCheckSkills,
  skipResultDestination,
  warmUpSuggestion,
} from './lib/skip'
import { initSync, useSyncStatus } from './lib/sync'
import type { SkillGenerator } from './lib/types'
import { currentPinTier, useProgress, type Progress } from './store/progress'
import { useRecoveryKey } from './store/recovery-key'

const Lesson = lazy(() =>
  import('./components/Lesson').then((module) => ({ default: module.Lesson })),
)
const ReviewLesson = lazy(() =>
  import('./components/Lesson').then((module) => ({ default: module.ReviewLesson })),
)
const SkipCheckLesson = lazy(() =>
  import('./components/Lesson').then((module) => ({ default: module.SkipCheckLesson })),
)
const Settings = lazy(() =>
  import('./components/Settings').then((module) => ({ default: module.Settings })),
)
const Shop = lazy(() =>
  import('./components/Shop').then((module) => ({ default: module.Shop })),
)

/**
 * Every screen names where leaving it goes, so no back edge has to be guessed.
 * `lesson` carries the unit it was started from rather than recomputing the
 * current one on exit — finishing a lesson can move the frontier, and the
 * learner should land where they were, not where they now are.
 */
type Screen =
  | TreeLevel
  | { name: 'lesson'; skill: SkillGenerator; unitId: string }
  | { name: 'review'; skills: readonly SkillGenerator[]; back: TreeLevel }
  | { name: 'skip-choice'; block: SkipBlock; back: TreeLevel; freshStart: boolean }
  | {
      name: 'skip-check'
      block: SkipBlock
      skills: readonly SkillGenerator[]
      back: TreeLevel
      freshStart: boolean
    }
  | {
      name: 'skip-result'
      block: SkipBlock
      correct: number
      passed: boolean
      frontierUnitId?: string
      back: TreeLevel
      freshStart: boolean
    }
  | { name: 'settings'; back: TreeLevel }
  | { name: 'shop'; back: TreeLevel }

export default function App() {
  const hydrate = useProgress((s) => s.hydrate)
  const loaded = useProgress((s) => s.loaded)
  const keyLoaded = useRecoveryKey((s) => s.loaded)
  const introduced = useRecoveryKey((s) => s.introduced)
  const progress = useProgress((s) => s.progress)
  const buyItem = useProgress((s) => s.buyItem)
  const buyStreakFreeze = useProgress((s) => s.buyStreakFreeze)
  const equipItem = useProgress((s) => s.equipItem)
  const unequipSlot = useProgress((s) => s.unequipSlot)
  const markSkipOfferSeen = useProgress((s) => s.markSkipOfferSeen)
  const markBlockKnown = useProgress((s) => s.markBlockKnown)
  const unmarkBlock = useProgress((s) => s.unmarkBlock)

  // `null` means "wherever the learner is now", resolved at render rather than
  // in an effect: the fallback is only reached after `loaded`, so there is no
  // hydration race and no extra frame. The first navigation pins it.
  const [screen, setScreen] = useState<Screen | null>(null)
  // `??` short-circuits, so the frontier is only worked out while the learner
  // has not navigated — once they have, this costs nothing per render.
  const active: Screen = screen ?? openingLevel(progress)
  const firstLaunchStage = progress.skipOfferSeen ? undefined : nextFreshStartStage(progress)
  const warmUp = warmUpSuggestion(progress)
  const reviewSkills = selectReviewSkills(
    implementedSkillIds.map((id) => ({
      skill: getSkill(id),
      progress: progress.skills[id] ?? { mastery: 0, lastPracticed: null },
    })),
    todayKey(),
  )

  // Held back until the first lesson is done, and never shown mid-lesson.
  const showKeyIntro = keyLoaded && !introduced && progress.xp > 0 && isTreeLevel(active)

  const finishFreshStart = () => {
    const current = useProgress.getState().progress
    if (!nextFreshStartStage(current)) markSkipOfferSeen()
    setScreen(null)
  }

  const openCheck = (block: SkipBlock, back: TreeLevel, freshStart: boolean) => {
    const skills = selectCheckSkills(
      block.id,
      makeRng(Math.floor(Math.random() * 4_294_967_296)),
    )
    if (!skills) {
      setScreen(back)
      return
    }
    setScreen({ name: 'skip-check', block, skills, back, freshStart })
  }

  const markSelfAssessed = (block: SkipBlock, back: TreeLevel, freshStart: boolean) => {
    markBlockKnown(block.id, 'self-assessed')
    if (freshStart) finishFreshStart()
    else setScreen(back)
  }

  useEffect(() => {
    // Sync starts only after local progress is on screen. It is additive — the
    // app is fully usable before, during, and after a failure.
    void hydrate().then(() => initSync())
  }, [hydrate])

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Mascot
          state="sleeping"
          size={120}
          character={progress.character}
          tier={currentPinTier(progress)}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0">
      <SyncNotice />
      <AnimatePresence mode="wait">
        <motion.div
          key={screenKey(active)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="h-full"
        >
          <Suspense
            fallback={
              <ScreenLoading character={progress.character} tier={currentPinTier(progress)} />
            }
          >
            {isTreeLevel(active) && (
              <Home
                level={active}
                progress={progress}
                onNavigate={setScreen}
                firstLaunchStage={firstLaunchStage}
                onOpenSkip={(block) =>
                  setScreen({
                    name: 'skip-choice',
                    block,
                    back: active,
                    freshStart: block.kind === 'stage',
                  })
                }
                onStartPractice={() => {
                  markSkipOfferSeen()
                  setScreen(null)
                }}
                onReverseSkip={unmarkBlock}
                reviewCount={reviewSkills.length}
                warmUp={warmUp}
                onStartReview={() =>
                  setScreen({ name: 'review', skills: reviewSkills, back: active })
                }
                onStart={(skillId) =>
                  (() => {
                    if (!progress.skipOfferSeen && firstLaunchStage) markSkipOfferSeen()
                    setScreen({
                      name: 'lesson',
                      skill: getSkill(skillId),
                      // From the manifest rather than from the level on screen, so
                      // exit lands in the right unit however the lesson was reached.
                      unitId: manifestIndex.get(skillId)?.unit.id ?? '',
                    })
                  })()
                }
                onOpenSettings={() => setScreen({ name: 'settings', back: active })}
                onOpenShop={() => setScreen({ name: 'shop', back: active })}
              />
            )}
            {active.name === 'lesson' && (
              <Lesson
                skill={active.skill}
                onExit={() => setScreen({ name: 'skills', unitId: active.unitId })}
              />
            )}
            {active.name === 'review' && (
              <ReviewLesson skills={active.skills} onExit={() => setScreen(active.back)} />
            )}
            {active.name === 'skip-choice' && (
              <SkipAheadChoice
                block={active.block}
                freshStart={active.freshStart}
                onCheck={() => openCheck(active.block, active.back, active.freshStart)}
                onSkip={() => markSelfAssessed(active.block, active.back, active.freshStart)}
                onBack={() => {
                  if (active.freshStart) {
                    markSkipOfferSeen()
                    setScreen(null)
                  } else setScreen(active.back)
                }}
              />
            )}
            {active.name === 'skip-check' && (
              <SkipCheckLesson
                skills={active.skills}
                onComplete={(correct) => {
                  const passed = checkPasses(correct)
                  if (passed) markBlockKnown(active.block.id, 'tested-out')
                  const next = useProgress.getState().progress
                  if (passed && active.freshStart && !nextFreshStartStage(next)) {
                    markSkipOfferSeen()
                  }
                  setScreen({
                    name: 'skip-result',
                    block: active.block,
                    correct,
                    passed,
                    frontierUnitId: currentUnitId(course, next),
                    back: active.back,
                    freshStart: active.freshStart,
                  })
                }}
                onExit={() => setScreen(active.back)}
              />
            )}
            {active.name === 'skip-result' && (
              <SkipAheadResult
                block={active.block}
                correct={active.correct}
                passed={active.passed}
                frontierName={
                  active.frontierUnitId
                    ? courseUnitById.get(active.frontierUnitId)?.unit.name
                    : undefined
                }
                onContinue={() => {
                  const destination = skipResultDestination(
                    active.passed,
                    active.freshStart,
                    active.frontierUnitId,
                    active.back,
                  )
                  if (destination) {
                    if (!active.passed && active.freshStart) markSkipOfferSeen()
                    setScreen(destination)
                  } else {
                    finishFreshStart()
                  }
                }}
              />
            )}
            {active.name === 'settings' && <Settings onClose={() => setScreen(active.back)} />}
            {active.name === 'shop' && (
              <Shop
                progress={progress}
                onBuy={buyItem}
                onBuyFreeze={buyStreakFreeze}
                onEquip={equipItem}
                onUnequip={unequipSlot}
                onClose={() => setScreen(active.back)}
              />
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {showKeyIntro && <RecoveryKeyIntro />}
    </div>
  )
}

// The tier is carried into the loading state too, so the pin does not draw
// plain for a frame and then change under the learner as the screen arrives.
function ScreenLoading({
  character,
  tier,
}: {
  character: Progress['character']
  tier: PinTier
}) {
  return (
    <div className="h-full flex items-center justify-center" role="status" aria-label="Loading">
      <Mascot state="sleeping" size={96} character={character} tier={tier} />
    </div>
  )
}

/**
 * Where the app opens: the skill level of the learner's current unit.
 *
 * Only an empty course has no unit to open at, which cannot happen while any
 * generator is registered — but the stage level renders an empty tree without
 * complaint, and that beats a screen that renders nothing.
 */
function openingLevel(progress: Progress): TreeLevel {
  const unitId = currentUnitId(course, progress)
  return unitId ? { name: 'skills', unitId } : { name: 'stages' }
}

const isTreeLevel = (screen: Screen): screen is TreeLevel =>
  screen.name === 'stages' || screen.name === 'units' || screen.name === 'skills'

/**
 * Keyed on the level *and* what it is showing, so moving between two stages or
 * two units animates like every other transition instead of swapping in place.
 */
function screenKey(screen: Screen): string {
  if (screen.name === 'units') return `units:${screen.stageId}`
  if (screen.name === 'skills') return `skills:${screen.unitId}`
  if (screen.name === 'lesson') return `lesson:${screen.skill.id}`
  if (screen.name === 'review') return `review:${screenKey(screen.back)}`
  return screen.name
}

/**
 * Progress changing underneath the learner is exactly the thing that must never
 * happen silently, so an adopted server copy says so.
 */
function SyncNotice() {
  const notice = useSyncStatus((s) => s.notice)
  const dismiss = useSyncStatus((s) => s.dismiss)

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-3 top-3 z-50"
        >
          <button
            onClick={dismiss}
            className="w-full rounded-2xl bg-white/95 shadow-soft px-4 py-3 text-left text-sm font-semibold text-ink backdrop-blur"
          >
            {notice.message}
            <span className="block text-xs font-normal text-ink-soft mt-0.5">Tap to dismiss</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
