import { motion } from 'framer-motion'
import type { CourseStage } from '../curriculum/manifest'
import { stageProgress } from '../lib/course'
import { tap } from '../lib/haptics'
import type { Progress } from '../store/progress'
import { ProgressBar } from './ProgressBar'
import { TONE_CLASSES, toneForUnit } from './tone'

type Props = {
  course: readonly CourseStage[]
  progress: Progress
  onOpen: (stageId: string) => void
}

/**
 * The top of the course — the stages that have something to play in them.
 *
 * Stages C through H are absent rather than greyed out, and will stay absent
 * until a generator lands in one. The learner cannot read the size of the
 * unwritten remainder off this screen, which is the point.
 */
export function StageList({ course, progress, onOpen }: Props) {
  return (
    <section className="px-5 pb-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft mb-3">
        The course
      </h2>

      <div className="flex flex-col gap-3">
        {course.map((stage, i) => {
          // The stage takes the colour of its first unit, so the two levels
          // agree on what a stage looks like.
          const tone = toneForUnit(stage.units[0].unit.id)
          const { share } = stageProgress(stage, progress)
          const units = stage.units.length

          return (
            <motion.button
              key={stage.stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => {
                tap()
                onOpen(stage.stage.id)
              }}
              className="flex items-center gap-4 rounded-blob p-4 text-left bg-white shadow-soft"
            >
              <div
                className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl ${TONE_CLASSES[tone].fill}`}
              >
                🗺️
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight">{stage.stage.name}</p>
                <p className="text-sm text-ink-soft">
                  {units} {units === 1 ? 'unit' : 'units'}
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
