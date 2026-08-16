import { motion } from 'framer-motion'
import {
  coordinateEntry,
  coordinatePlacement,
  moveCoordinate,
  type Coordinate,
  type CoordinateDirection,
  type CoordinatePlane as CoordinatePlaneSpec,
} from '../lib/coordinate-plane'
import type { CoordinateData } from '../lib/types'
import { tap } from '../lib/haptics'
import { CoordinateContext } from './CoordinateContext'
import { CoordinatePlane } from './CoordinatePlane'

type Props = {
  plane: CoordinatePlaneSpec
  coordinate?: CoordinateData
  /** The placed point as the lesson's ordinary canonical entry. */
  entry: string
  onPlace: (entry: string) => void
  onConfirm: () => void
  disabled?: boolean
}

/** One exact lattice placement, deliberately confirmed before submission. */
export function CoordinatePlaneInput({
  plane,
  coordinate,
  entry,
  onPlace,
  onConfirm,
  disabled,
}: Props) {
  const placed = coordinatePlacement(plane, entry)
  const pending = placed.point ?? { x: 0, y: 0 }
  const moved: Record<CoordinateDirection, Coordinate> = {
    left: moveCoordinate(plane, pending, 'left'),
    right: moveCoordinate(plane, pending, 'right'),
    down: moveCoordinate(plane, pending, 'down'),
    up: moveCoordinate(plane, pending, 'up'),
  }
  const place = (point: Coordinate) => {
    tap()
    onPlace(coordinateEntry(point))
  }
  const nudge = (direction: CoordinateDirection) => {
    place(moved[direction])
  }
  const blocked = (direction: CoordinateDirection) =>
    disabled || (
      moved[direction].x === pending.x &&
      moved[direction].y === pending.y
    )

  return (
    <div className="flex w-80 max-w-full flex-col items-center gap-3">
      <CoordinateContext data={coordinate} />
      <CoordinatePlane
        plane={plane}
        placement={{
          point: placed.point,
          disabled,
          onPlace: place,
        }}
      />

      <div
        className="grid w-full grid-cols-5 gap-2"
        role="group"
        aria-label="Point adjustment controls"
        data-coordinate-nudges
      >
        <NudgeButton
          label="Move point x minus"
          disabled={blocked('left')}
          onClick={() => nudge('left')}
        >
          x−
        </NudgeButton>
        <NudgeButton
          label="Move point y minus"
          disabled={blocked('down')}
          onClick={() => nudge('down')}
        >
          y−
        </NudgeButton>
        <NudgeButton
          label={placed.point ? 'Move point to origin' : 'Place point at origin'}
          disabled={disabled}
          onClick={() => place({ x: 0, y: 0 })}
        >
          (0,0)
        </NudgeButton>
        <NudgeButton
          label="Move point y plus"
          disabled={blocked('up')}
          onClick={() => nudge('up')}
        >
          y+
        </NudgeButton>
        <NudgeButton
          label="Move point x plus"
          disabled={blocked('right')}
          onClick={() => nudge('right')}
        >
          x+
        </NudgeButton>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        className="w-full h-14 rounded-2xl bg-mint text-ink font-bold text-lg shadow-[0_3px_0_0_var(--color-cream-deep)] active:shadow-none active:translate-y-[3px] transition-[transform,box-shadow]"
        onClick={() => {
          tap()
          onConfirm()
        }}
        disabled={disabled || !placed.canConfirm}
        style={{ opacity: disabled || !placed.canConfirm ? 0.45 : 1 }}
      >
        Check
      </motion.button>
    </div>
  )
}

function NudgeButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      data-coordinate-nudge
      className="h-12 min-w-12 rounded-xl bg-lilac-soft text-lilac-deep text-sm font-bold disabled:opacity-35"
    >
      {children}
    </motion.button>
  )
}
