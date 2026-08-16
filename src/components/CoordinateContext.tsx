import { coordinateLabel } from '../lib/coordinate-plane'
import type { CoordinateData } from '../lib/types'

/** The source values a coordinate problem presents beside its one graph. */
export function CoordinateContext({ data }: { data?: CoordinateData }) {
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
    case 'quadrant':
    case 'slope-from-graph':
    case 'slope-from-points':
    case 'y-intercept':
      return null
    default: {
      const unhandled: never = data
      throw new Error(`Unhandled coordinate context: ${JSON.stringify(unhandled)}`)
    }
  }
}

const drawn = (value: number): string => String(value).replace('-', '−')
