import { motion } from 'framer-motion'
import { units } from '../curriculum'
import { tap } from '../lib/haptics'
import type { SkillGenerator } from '../lib/types'
import { isUnlocked, MAX_MASTERY, useProgress } from '../store/progress'
import { Mascot } from './Mascot'

const TONE = {
  blossom: { fill: 'bg-blossom', ring: 'ring-blossom-deep', text: 'text-blossom-deep' },
  lilac: { fill: 'bg-lilac', ring: 'ring-lilac-deep', text: 'text-lilac-deep' },
  mint: { fill: 'bg-mint', ring: 'ring-mint-deep', text: 'text-mint-deep' },
  butter: { fill: 'bg-butter', ring: 'ring-butter-deep', text: 'text-butter-deep' },
  powder: { fill: 'bg-powder', ring: 'ring-powder-deep', text: 'text-powder-deep' },
} as const

export function Home({
  onStart,
  onOpenSettings,
}: {
  onStart: (skill: SkillGenerator) => void
  onOpenSettings: () => void
}) {
  const progress = useProgress((s) => s.progress)
  const goalPct = Math.min(100, (progress.todayXp / progress.dailyGoal) * 100)

  // Greet by state: asleep until the first lesson of the day, awake after.
  const doneToday = progress.todayXp > 0

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center justify-between px-5 pt-4">
        <Stat icon="🔥" value={progress.streakCount} label="day streak" />
        <Stat icon="🪙" value={progress.coins} label="coins" />
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
        <Mascot state={doneToday ? 'idle' : 'sleeping'} size={148} />

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

      {units.map((unit) => (
        <section key={unit.id} className="px-5 pb-8">
          <h2 className={`text-sm font-bold uppercase tracking-wide ${TONE[unit.color].text} mb-3`}>
            {unit.name}
          </h2>

          <div className="flex flex-col gap-3">
            {unit.skills.map((skill, i) => {
              const state = progress.skills[skill.id] ?? { mastery: 0 }
              const unlocked = isUnlocked(skill.id, progress)
              return (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  mastery={state.mastery}
                  unlocked={unlocked}
                  tone={unit.color}
                  index={i}
                  onStart={() => onStart(skill)}
                />
              )
            })}
          </div>
        </section>
      ))}

      <p className="text-center text-xs text-ink-faint pb-8 px-8">
        More units unlock as you go. Your progress saves to this phone and to your recovery
        key, which you'll find in settings.
      </p>
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

function SkillCard({
  skill,
  mastery,
  unlocked,
  tone,
  index,
  onStart,
}: {
  skill: SkillGenerator
  mastery: number
  unlocked: boolean
  tone: keyof typeof TONE
  index: number
  onStart: () => void
}) {
  const complete = mastery >= MAX_MASTERY

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileTap={unlocked ? { scale: 0.975 } : undefined}
      disabled={!unlocked}
      onClick={() => {
        tap()
        onStart()
      }}
      className={`flex items-center gap-4 rounded-blob p-4 text-left transition-opacity ${
        unlocked ? 'bg-white shadow-soft' : 'bg-white/50 opacity-55'
      }`}
    >
      <div
        className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
          unlocked ? TONE[tone].fill : 'bg-cream-deep'
        }`}
      >
        {!unlocked ? '🔒' : complete ? '⭐' : '✎'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg leading-tight">{skill.name}</p>
        <p className="text-sm text-ink-soft truncate">{skill.blurb}</p>

        <div className="flex gap-1 mt-2" aria-label={`Level ${mastery} of ${MAX_MASTERY}`}>
          {Array.from({ length: MAX_MASTERY }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < mastery ? TONE[tone].fill.replace('bg-', 'bg-') : 'bg-cream-deep'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.button>
  )
}
