import { motion } from 'framer-motion'
import type { CourseStage } from '../curriculum/manifest'
import { unitProgress } from '../lib/course'
import { tap } from '../lib/haptics'
import type { Progress } from '../store/progress'
import { ProgressBar } from './ProgressBar'
import { TONE_CLASSES, toneForUnit } from './tone'

type Props = {
  stage: CourseStage
  progress: Progress
  isUnlocked: (skillId: string) => boolean
  onOpen: (unitId: string) => void
}

/**
 * One stage's playable units.
 *
 * A unit with nothing playable never arrives here — the tree omits it — so this
 * level cannot tease unwritten course. A unit whose every skill is locked does
 * arrive, and says so: on a fresh install that is the whole of Units 1–3,
 * which is honest about what is coming rather than pretending it is open.
 */
export function UnitList({ stage, progress, isUnlocked, onOpen }: Props) {
  return (
    <section className="px-5 pb-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft mb-3">
        {stage.stage.name}
      </h2>

      <div className="flex flex-col gap-3">
        {stage.units.map((unit, i) => {
          const tone = toneForUnit(unit.unit.id)
          const { share } = unitProgress(unit, progress)
          const open = unit.skills.some((skill) => isUnlocked(skill.id))

          return (
            <motion.button
              key={unit.unit.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => {
                tap()
                onOpen(unit.unit.id)
              }}
              className="flex items-center gap-4 rounded-blob p-4 text-left bg-white shadow-soft"
            >
              <div
                className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  open ? TONE_CLASSES[tone].fill : 'bg-cream-deep'
                }`}
              >
                {open ? '📘' : '🔒'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight">{unit.unit.name}</p>
                <p className="text-sm text-ink-soft">
                  {unit.skills.length} {unit.skills.length === 1 ? 'skill' : 'skills'}
                  {open ? '' : ' · locked'}
                </p>

                <ProgressBar share={share} fill={TONE_CLASSES[tone].fill} />
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
