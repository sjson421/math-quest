import { coordinateEquationLabel, coordinateLabel, type CoordinatePlane } from '../lib/coordinate-plane'
import { lineEquation, linearEquationLabel, passSalesEquations, passSalesStory } from '../lib/linear-system'
import type { CoordinateData, LinearEquation } from '../lib/types'

/** The source values a coordinate problem presents beside its one graph. */
export function CoordinateContext({
  data,
  plane,
}: {
  data?: CoordinateData
  plane?: CoordinatePlane
}) {
  if (!data) return null

  switch (data.operation) {
    case 'plot-point':
      return (
        <p
          className="rounded-xl bg-butter-soft px-4 py-2 text-xl font-bold text-ink"
          data-coordinate-point-context
        >
          Point {coordinateLabel(data.point)}
        </p>
      )
    case 'table-to-graph':
      return (
        <table
          className="overflow-hidden rounded-xl border-separate border-spacing-0 bg-cream-deep text-center tabular-nums"
          data-coordinate-table
        >
          <caption className="sr-only">Values to plot; the highlighted row is the target</caption>
          <thead>
            <tr>
              <th className="border-b border-cream-deep bg-lilac-soft px-5 py-1 text-sm font-bold" scope="col">x</th>
              <th className="border-b border-cream-deep bg-lilac-soft px-5 py-1 text-sm font-bold" scope="col">y</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((point) => {
              const target = point.x === data.targetX
              return (
                <tr
                  key={`${point.x},${point.y}`}
                  className={target ? 'bg-butter-soft font-bold' : 'bg-white/60'}
                  data-coordinate-table-target={target || undefined}
                >
                  <td className="px-5 py-1">{drawn(point.x)}</td>
                  <td className="px-5 py-1">
                    {drawn(point.y)}
                    {target && <span className="sr-only">, target row</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    case 'slope-intercept':
    case 'graph-from-equation': {
      const label = coordinateEquationLabel(data.slope, data.intercept)
      return (
        <p
          className="rounded-xl bg-butter-soft px-4 py-2 text-xl font-bold text-ink"
          data-coordinate-equation
          role="math"
          aria-label={spokenEquation(label)}
        >
          <span aria-hidden>{label}</span>
        </p>
      )
    }
    case 'system-by-graphing': {
      if (!plane || plane.lines.length !== 2) return null
      const first = lineEquation(plane.lines[0])
      const second = lineEquation(plane.lines[1])
      if (!first || !second) return null
      return <SystemContext equations={[first, second]} />
    }
    case 'system-substitution':
    case 'system-elimination':
      return <SystemContext equations={data.equations} />
    case 'system-words': {
      const equations = passSalesEquations(data)
      return (
        <SystemContext equations={equations} story={passSalesStory(data)} />
      )
    }
    case 'quadrant':
    case 'slope-from-graph':
    case 'slope-from-points':
    case 'y-intercept':
    case 'equation-from-graph':
    case 'parallel-perpendicular':
      return null
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled coordinate context: ${JSON.stringify(unhandled)}`)
    }
  }
}

function SystemContext({
  equations,
  story,
}: {
  equations: readonly [LinearEquation, LinearEquation]
  story?: string
}) {
  const labels = equations.map(linearEquationLabel)
  return (
    <section
      className="flex max-w-full flex-col items-center gap-2 rounded-xl bg-butter-soft px-3 py-2 text-ink"
      data-coordinate-system-context
      aria-label="System of equations, answer order x then y"
    >
      {story && (
        <p className="text-center text-sm leading-snug" data-coordinate-system-story>
          {story}
        </p>
      )}
      <p className="text-center text-sm font-semibold" data-coordinate-variable-order>
        Answer order: (x, y)
      </p>
      <div className="flex max-w-full flex-col items-center gap-1" data-coordinate-system-equations>
        {labels.map((label, index) => (
          <p
            key={`${label.visible}-${index}`}
            className="text-lg font-bold tabular-nums"
            data-coordinate-equation
            data-coordinate-system-equation={index + 1}
            role="math"
            aria-label={label.spoken}
          >
            <span aria-hidden>{label.visible}</span>
          </p>
        ))}
      </div>
    </section>
  )
}

const drawn = (value: number): string => String(value).replace('-', '−')

const spokenEquation = (label: string): string =>
  label.replace('y =', 'y equals').replace(' − ', ' minus ').replace(' + ', ' plus ')
