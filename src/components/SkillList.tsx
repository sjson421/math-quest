import { motion } from 'framer-motion'
import type { CourseUnit } from '../curriculum/manifest'
import { tap } from '../lib/haptics'
import { MAX_MASTERY, type Progress } from '../store/progress'
import { TONE_CLASSES, toneForUnit } from './tone'

type Props = {
  unit: CourseUnit
  progress: Progress
  isUnlocked: (skillId: string) => boolean
  onStart: (skillId: string) => void
}

/**
 * One unit's playable skills — the level a lesson starts from.
 *
 * Only the skills the tree carries reach here, so a `planned` skill cannot be
 * rendered even by accident. A locked one still is: it is the learner's next,
 * and hiding it would leave the unit looking finished.
 *
 * `isUnlocked` arrives as a function rather than a precomputed flag per skill so
 * the single authority in `store/progress` stays the only one asked.
 */
export function SkillList({ unit, progress, isUnlocked, onStart }: Props) {
  const tone = toneForUnit(unit.unit.id)

  return (
    <section className="px-5 pb-8">
      <h2
        className={`text-sm font-bold uppercase tracking-wide ${TONE_CLASSES[tone].text} mb-3`}
      >
        {unit.unit.name}
      </h2>

      <div className="flex flex-col gap-3">
        {unit.skills.map((skill, i) => (
          <SkillCard
            key={skill.id}
            name={skill.name}
            blurb={skill.blurb}
            mastery={progress.skills[skill.id]?.mastery ?? 0}
            unlocked={isUnlocked(skill.id)}
            tone={tone}
            index={i}
            onStart={() => onStart(skill.id)}
          />
        ))}
      </div>
    </section>
  )
}

function SkillCard({
  name,
  blurb,
  mastery,
  unlocked,
  tone,
  index,
  onStart,
}: {
  name: string
  blurb: string
  mastery: number
  unlocked: boolean
  tone: keyof typeof TONE_CLASSES
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
          unlocked ? TONE_CLASSES[tone].fill : 'bg-cream-deep'
        }`}
      >
        {!unlocked ? '🔒' : complete ? '⭐' : '✎'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg leading-tight">{name}</p>
        <p className="text-sm text-ink-soft truncate">{blurb}</p>

        <div className="flex gap-1 mt-2" aria-label={`Level ${mastery} of ${MAX_MASTERY}`}>
          {Array.from({ length: MAX_MASTERY }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < mastery ? TONE_CLASSES[tone].fill : 'bg-cream-deep'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.button>
  )
}
