import { motion } from 'framer-motion'
import { course, courseStageById, courseStageByUnitId, courseUnitById } from '../curriculum'
import { tap } from '../lib/haptics'
import { isUnlocked, useProgress } from '../store/progress'
import { Mascot } from './Mascot'
import { SkillList } from './SkillList'
import { StageList } from './StageList'
import { UnitList } from './UnitList'

/** Which level of the tree is on screen. Owned by `App`; see its `Screen` union. */
export type TreeLevel =
  | { name: 'stages' }
  | { name: 'units'; stageId: string }
  | { name: 'skills'; unitId: string }

type Props = {
  level: TreeLevel
  onNavigate: (level: TreeLevel) => void
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
export function Home({ level, onNavigate, onStart, onOpenSettings, onOpenShop }: Props) {
  const progress = useProgress((s) => s.progress)
  const goalPct = Math.min(100, (progress.todayXp / progress.dailyGoal) * 100)

  // Greet by state: asleep until the first lesson of the day, awake after.
  const doneToday = progress.todayXp > 0

  const unlocked = (skillId: string) => isUnlocked(skillId, progress)
  const stage = level.name === 'units' ? courseStageById.get(level.stageId) : undefined
  const unit = level.name === 'skills' ? courseUnitById.get(level.unitId) : undefined
  const parent = unit && courseStageByUnitId.get(unit.unit.id)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center justify-between px-5 pt-4">
        <Stat icon="🔥" value={progress.streakCount} label="day streak" />
        {/* The reward and the thing it buys, one tap apart. Sized to match the
            settings button rather than shrink-wrapping the stat: this is a
            control on a phone, and the text it wraps is only 28px tall. */}
        <button
          onClick={() => {
            tap()
            onOpenShop()
          }}
          className="h-10 px-3 rounded-full flex items-center active:bg-cream-deep"
          aria-label={`${progress.coins} coins — open Pip's wardrobe`}
        >
          <Stat icon="🪙" value={progress.coins} label="coins" />
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
      </header>

      <section className="flex flex-col items-center pt-2 pb-5">
        <Mascot state={doneToday ? 'idle' : 'sleeping'} size={148} equipped={progress.equipped} />

        <div className="w-full max-w-xs px-6 mt-1">
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
