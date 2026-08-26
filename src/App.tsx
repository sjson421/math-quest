import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useState } from 'react'
import { course, getSkill, manifestIndex } from './curriculum'
import { Home, type TreeLevel } from './components/Home'
import { Mascot } from './components/Mascot'
import { RecoveryKeyIntro } from './components/RecoveryKey'
import { currentUnitId } from './lib/course'
import { initSync, useSyncStatus } from './lib/sync'
import type { SkillGenerator } from './lib/types'
import { useProgress, type Progress } from './store/progress'
import { useRecoveryKey } from './store/recovery-key'

const Lesson = lazy(() =>
  import('./components/Lesson').then((module) => ({ default: module.Lesson })),
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
  | { name: 'settings'; back: TreeLevel }
  | { name: 'shop'; back: TreeLevel }

export default function App() {
  const hydrate = useProgress((s) => s.hydrate)
  const loaded = useProgress((s) => s.loaded)
  const keyLoaded = useRecoveryKey((s) => s.loaded)
  const introduced = useRecoveryKey((s) => s.introduced)
  const progress = useProgress((s) => s.progress)
  const buyItem = useProgress((s) => s.buyItem)
  const equipItem = useProgress((s) => s.equipItem)
  const unequipSlot = useProgress((s) => s.unequipSlot)

  // `null` means "wherever the learner is now", resolved at render rather than
  // in an effect: the fallback is only reached after `loaded`, so there is no
  // hydration race and no extra frame. The first navigation pins it.
  const [screen, setScreen] = useState<Screen | null>(null)
  // `??` short-circuits, so the frontier is only worked out while the learner
  // has not navigated — once they have, this costs nothing per render.
  const active: Screen = screen ?? openingLevel(progress)

  // Held back until the first lesson is done, and never shown mid-lesson.
  const showKeyIntro = keyLoaded && !introduced && progress.xp > 0 && isTreeLevel(active)

  useEffect(() => {
    // Sync starts only after local progress is on screen. It is additive — the
    // app is fully usable before, during, and after a failure.
    void hydrate().then(() => initSync())
  }, [hydrate])

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Mascot state="sleeping" size={120} character={progress.character} />
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
          <Suspense fallback={<ScreenLoading character={progress.character} />}>
            {isTreeLevel(active) && (
              <Home
                level={active}
                onNavigate={setScreen}
                onStart={(skillId) =>
                  setScreen({
                    name: 'lesson',
                    skill: getSkill(skillId),
                    // From the manifest rather than from the level on screen, so
                    // exit lands in the right unit however the lesson was reached.
                    unitId: manifestIndex.get(skillId)?.unit.id ?? '',
                  })
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
            {active.name === 'settings' && <Settings onClose={() => setScreen(active.back)} />}
            {active.name === 'shop' && (
              <Shop
                progress={progress}
                onBuy={buyItem}
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

function ScreenLoading({ character }: { character: Progress['character'] }) {
  return (
    <div className="h-full flex items-center justify-center" role="status" aria-label="Loading">
      <Mascot state="sleeping" size={96} character={character} />
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
