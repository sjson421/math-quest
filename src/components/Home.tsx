import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { characterOf } from '../cosmetics'
import { course, courseStageById, courseStageByUnitId, courseUnitById } from '../curriculum'
import { todayKey } from '../lib/calendar'
import { tap } from '../lib/haptics'
import { useSound } from '../lib/sound'
import {
  nextStreakMilestone,
  streakAtRisk,
  streakMultiplier,
} from '../lib/streak'
import { currentPinTier, isUnlocked, useProgress } from '../store/progress'
import { Room } from './Room'
import { SkillList } from './SkillList'
import { StreakCard } from './StreakCard'
import { StageList } from './StageList'
import { UnitList } from './UnitList'

/** Which level of the tree is on screen. Owned by `App`; see its `Screen` union. */
export type TreeLevel =
  | { name: 'stages' }
  | { name: 'units'; stageId: string }
  | { name: 'skills'; unitId: string }

const PIP_MESSAGES = ['You’ve got this!', 'Keep going!', 'Great work!', 'One step at a time!']

type Props = {
  level: TreeLevel
  onNavigate: (level: TreeLevel) => void
  reviewCount: number
  onStartReview: () => void
  onStart: (skillId: string) => void
  onOpenSettings: () => void
  onOpenShop: () => void
}

/**
 * The shell around whichever level of the course is open.
 *
 * The stats, the mascot and the daily goal stay on every level rather than only
 * the top one, because the app opens at the *skill* level — anything dropped
 * from there is dropped from the common case.
 *
 * The levels themselves take props and read no store, so a node test can render
 * one against a synthetic `Progress`. This component is the only place that
 * reaches for the live one.
 */
export function Home({
  level,
  onNavigate,
  reviewCount,
  onStartReview,
  onStart,
  onOpenSettings,
  onOpenShop,
}: Props) {
  const progress = useProgress((s) => s.progress)
  const freezesJustSpent = useProgress((s) => s.freezesJustSpent)
  const muted = useSound((s) => s.muted)
  const toggleMuted = useSound((s) => s.toggleMuted)
  const goalPct = Math.min(100, (progress.todayXp / progress.dailyGoal) * 100)
  const [pipMessage, setPipMessage] = useState<string | null>(null)

  // The menu is the one persistent place for Pip's unprompted encouragement.
  // Keeping the timer here means it stops with the menu and cannot update a
  // lesson or a screen that is no longer mounted.
  //
  // It runs only while he is awake. A sleeping mascot that pipes up every ten
  // seconds contradicts its own pose, and waking him for the line made the
  // sleep state a thing the screen dropped out of on a timer.
  const doneToday = progress.todayXp > 0

  useEffect(() => {
    if (!doneToday) return
    let messageIndex = 0
    let hideTimer: number | undefined
    const showMessage = () => {
      setPipMessage(PIP_MESSAGES[messageIndex])
      messageIndex = (messageIndex + 1) % PIP_MESSAGES.length
      hideTimer = window.setTimeout(() => {
        setPipMessage(null)
        hideTimer = undefined
      }, 2_000)
    }
    const timer = window.setInterval(() => {
      showMessage()
    }, 10_000)

    return () => {
      window.clearInterval(timer)
      if (hideTimer !== undefined) window.clearTimeout(hideTimer)
    }
  }, [doneToday])

  // Greet by state: asleep until the first lesson of the day and awake after.
  // The message is read through `doneToday` as well, so a line still on screen
  // when the day rolls over goes with the state that produced it.
  const pipState = doneToday ? 'idle' : 'sleeping'
  const message = doneToday ? pipMessage : null

  const unlocked = (skillId: string) => isUnlocked(skillId, progress)
  const stage = level.name === 'units' ? courseStageById.get(level.stageId) : undefined
  const unit = level.name === 'skills' ? courseUnitById.get(level.unitId) : undefined
  const parent = unit && courseStageByUnitId.get(unit.unit.id)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center justify-between px-5 pt-4">
        {/* Two groups now, not three: the streak left this row for a card of
            its own below, because it is the only thing the learner can lose and
            it was drawn here at the size of the coin count.

            The reward and the thing it buys stay one tap apart. Sized to match
            the settings button rather than shrink-wrapping the stat: this is a
            control on a phone, and the text it wraps is only 28px tall. */}
        <button
          onClick={() => {
            tap()
            onOpenShop()
          }}
          className="h-10 px-3 rounded-full flex items-center active:bg-cream-deep"
          aria-label={`${progress.coins} coins — open ${characterOf(progress.character).name}'s shop`}
        >
          <Stat icon="🪙" value={progress.coins} label="coins" />
        </button>
        {/* Two controls, one cluster, so the header stays two groups rather
            than spreading three items across the width. */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              tap()
              toggleMuted()
            }}
            className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-lg"
            aria-label={muted ? 'Turn sounds on' : 'Turn sounds off'}
            aria-pressed={muted}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={() => {
              tap()
              onOpenSettings()
            }}
            className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-lg"
            aria-label="Settings"
          >
            ⚙︎
          </button>
        </div>
      </header>

      <section className="flex flex-col items-center pt-2 pb-5">
        {/* The room's box is 200 units tall and Pip's canvas fills it, so 148
            here is exactly the size he rendered at before he had a room — the
            section gains width around him and no height at all. */}
        <Room
          state={pipState}
          height={148}
          character={progress.character}
          equipped={progress.equipped}
          tier={currentPinTier(progress)}
          placed={progress.room}
          message={message}
        />

        <StreakCard
          streakCount={progress.streakCount}
          atRisk={streakAtRisk(progress, todayKey())}
          freezes={progress.streakFreezes}
          justSpent={freezesJustSpent}
          multiplier={streakMultiplier(progress.streakCount)}
          nextMilestone={nextStreakMilestone(progress.streakCount)}
        />

        <div className="w-full max-w-xs px-6 mt-4">
          <div className="flex justify-between text-sm font-semibold text-ink-soft mb-1.5">
            <span>Today's goal</span>
            <span className="tabular-nums">
              {progress.todayXp} / {progress.dailyGoal} XP
            </span>
          </div>
          <div className="h-3.5 rounded-full bg-cream-deep overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blossom-deep"
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 24 }}
            />
          </div>
        </div>
      </section>

      {reviewCount > 0 && (
        <button
          onClick={() => {
            tap()
            onStartReview()
          }}
          className="mx-5 mb-5 flex items-center justify-between gap-3 rounded-blob bg-lilac-soft p-4 text-left shadow-soft active:scale-[0.98] transition-transform"
          aria-label={`Start review — ${reviewCount} ${reviewCount === 1 ? 'skill' : 'skills'} due`}
        >
          <span className="min-w-0">
            <span className="block font-bold text-lg">Review time</span>
            <span className="block text-sm text-ink-soft">
              {reviewCount} skill{reviewCount === 1 ? '' : 's'} ready to revisit
            </span>
          </span>
          <span className="shrink-0 text-2xl text-lilac-deep" aria-hidden="true">
            ›
          </span>
        </button>
      )}

      {unit ? (
        <>
          <Back
            label={parent?.stage.name ?? 'The course'}
            onBack={() =>
              onNavigate(
                parent ? { name: 'units', stageId: parent.stage.id } : { name: 'stages' },
              )
            }
          />
          <SkillList unit={unit} progress={progress} isUnlocked={unlocked} onStart={onStart} />
        </>
      ) : stage ? (
        <>
          <Back label="The course" onBack={() => onNavigate({ name: 'stages' })} />
          <UnitList
            stage={stage}
            progress={progress}
            isUnlocked={unlocked}
            onOpen={(unitId) => onNavigate({ name: 'skills', unitId })}
          />
        </>
      ) : (
        // Also where an id that no longer resolves lands, rather than a blank
        // screen — a unit can leave the tree if its last generator does.
        <StageList
          course={course}
          progress={progress}
          onOpen={(stageId) => onNavigate({ name: 'units', stageId })}
        />
      )}

      <p className="text-center text-xs text-ink-faint pb-8 px-8">
        More units unlock as you go. Your progress saves to this phone and to your recovery
        key, which you'll find in settings.
      </p>
    </div>
  )
}

function Back({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="px-5 pb-3">
      <button
        onClick={() => {
          tap()
          onBack()
        }}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft"
      >
        <span aria-hidden="true">‹</span> {label}
      </button>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xl">{icon}</span>
      <span className="font-bold text-lg tabular-nums">{value}</span>
      <span className="sr-only">{label}</span>
    </div>
  )
}
