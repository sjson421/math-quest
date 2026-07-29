import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Home } from './components/Home'
import { Lesson } from './components/Lesson'
import { Mascot } from './components/Mascot'
import { RecoveryKeyIntro } from './components/RecoveryKey'
import { Settings } from './components/Settings'
import { initSync, useSyncStatus } from './lib/sync'
import type { SkillGenerator } from './lib/types'
import { useProgress } from './store/progress'
import { useRecoveryKey } from './store/recovery-key'

type Screen =
  | { name: 'home' }
  | { name: 'lesson'; skill: SkillGenerator }
  | { name: 'settings' }

export default function App() {
  const hydrate = useProgress((s) => s.hydrate)
  const loaded = useProgress((s) => s.loaded)
  const keyLoaded = useRecoveryKey((s) => s.loaded)
  const introduced = useRecoveryKey((s) => s.introduced)
  const hasProgress = useProgress((s) => s.progress.xp > 0)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  // Held back until the first lesson is done, and never shown mid-lesson.
  const showKeyIntro = keyLoaded && !introduced && hasProgress && screen.name === 'home'

  useEffect(() => {
    // Sync starts only after local progress is on screen. It is additive — the
    // app is fully usable before, during, and after a failure.
    void hydrate().then(() => initSync())
  }, [hydrate])

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Mascot state="sleeping" size={120} />
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0">
      <SyncNotice />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="h-full"
        >
          {screen.name === 'home' && (
            <Home
              onStart={(skill) => setScreen({ name: 'lesson', skill })}
              onOpenSettings={() => setScreen({ name: 'settings' })}
            />
          )}
          {screen.name === 'lesson' && (
            <Lesson skill={screen.skill} onExit={() => setScreen({ name: 'home' })} />
          )}
          {screen.name === 'settings' && <Settings onClose={() => setScreen({ name: 'home' })} />}
        </motion.div>
      </AnimatePresence>

      {showKeyIntro && <RecoveryKeyIntro />}
    </div>
  )
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
