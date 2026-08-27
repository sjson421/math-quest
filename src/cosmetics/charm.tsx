import type { ReactNode } from 'react'
import type { Tone } from '../components/tone'
import { families } from './palette'
import type { Character, Point } from './types'

/**
 * The five pins, built once and worn by all three characters.
 *
 * A tier is **the character's own charm with more around it**, never a different
 * object: the star, the fish and the lily pad are drawn unchanged at every tier
 * and the frame is added at the periphery. That is what lets one ladder serve
 * three creatures without becoming three ladders, and it is why buying nobody
 * and practising everything still leaves a learner recognisably themselves.
 *
 * **The frame is drawn behind the charm and never over it.** A frame that
 * covered the charm would make tier 5 the same picture on everyone, which is
 * the failure this whole shape exists to avoid.
 *
 * ## The size budget, and why it is this tight
 *
 * The charm hangs at `anchors.pin`, low and to the right, and the whole mascot
 * tilts up to 6° while the charm itself scales 1.25 and turns a full circle on
 * `celebrating`. That corner is the closest part of the character to the view
 * box, so every unit added to the frame is multiplied and then swung downward.
 * Measured, the ceiling is about 20 units of radius before tier 5 crosses `y
 * 200` on Mochi, whose `pin` is the lowest of the three.
 *
 * The charm is already about 14 of those, so a frame has roughly six units to
 * work in. That is what decides the escalation below: it climbs by adding
 * *distinct shapes* at the rim rather than by growing, because growing is the
 * one direction unavailable.
 *
 * ## What the celebration does, and why it does not clip
 *
 * Measured off the raster: tier 5's furthest ink is 22.7 units from the pin.
 * Stacking every worst case — the spin putting a petal directly below the pin,
 * at the 1.25 scale peak, with the body at its full 6° tilt — puts Mochi, whose
 * `pin` is the lowest of the three, at `y 199.4`. Half a unit inside the box,
 * which would be too close to trust.
 *
 * **Those three peaks cannot coincide, and the timings are why.** The charm
 * scales and spins over the same 1.2s, so `scale` is at 1.25 exactly when the
 * spin has carried the frill 180° — pointing *up*. The moments the frill points
 * down are the moments the scale is 1. Meanwhile the body's `rotate` reaches +6°
 * a third of the way back from the `celebrating` bob's peak, with the whole
 * mascot still some 13 units lifted. Taking the timings into account rather than
 * the envelopes, the real low-water mark is around `y 178`.
 *
 * So the frill is sized for **legibility at 92px**, which is the constraint that
 * actually binds — and which is what withdrew the pin that tried this slot
 * before. Pulling the petals in to buy clearance bought half a unit of a margin
 * that was never real and cost a visibly finer frill.
 *
 * ## Why the plate is the middle step
 *
 * The first ladder built here put the tails at tier 4, and at 92px tiers 3 and 4
 * were the same picture: nineteen units of ribbon is nine pixels, and nine
 * pixels of ribbon under a badge is a smudge. **A fill is the one step that
 * costs no radius at all**, and it survives being shrunk better than any shape
 * does — so filling the rim is tier 3, and the shapes that need room are spent
 * on the two tiers above it.
 */

/** The rim every frame from tier 2 up is built on. */
const RING = 17.5
const PETAL_RING = RING
const PETAL = 4

/**
 * Three studs rather than four or six. Four reads as a compass and draws the eye
 * to the axes; six is under 9 units apart at this radius, which is four pixels
 * at 92px and reads as a thick ring rather than as studs.
 */
const STUDS = [-90, 30, 150]

const at = (pin: Point, degrees: number, radius: number): Point => {
  const a = (degrees * Math.PI) / 180

  return {
    x: Number((pin.x + radius * Math.cos(a)).toFixed(2)),
    y: Number((pin.y + radius * Math.sin(a)).toFixed(2)),
  }
}

/**
 * The rim, empty or filled.
 *
 * Unfilled it reads as an outline around the charm; filled it becomes a plate
 * the charm sits on. That difference survives every size the mascot is drawn
 * at, which is what makes it worth a whole tier.
 */
function ring(pin: Point, tone: Tone, plate = false): ReactNode {
  return (
    <circle
      cx={pin.x}
      cy={pin.y}
      r={RING}
      strokeWidth="3"
      style={{ fill: plate ? families[tone].soft : 'none', stroke: families[tone].deep }}
    />
  )
}

function studs(pin: Point, tone: Tone): ReactNode {
  return (
    <>
      {STUDS.map((degrees) => {
        const p = at(pin, degrees, RING)

        return (
          <circle
            key={degrees}
            cx={p.x}
            cy={p.y}
            r="3.5"
            strokeWidth="2.5"
            style={{ fill: families[tone].base, stroke: families[tone].deep }}
          />
        )
      })}
    </>
  )
}

/**
 * Two notched ribbons, hanging from under the rim.
 *
 * They are the one part of the frame that grows downward rather than outward,
 * which is the direction with least room — hence 19 units and no more. Kept
 * narrow enough that the rim still reads as a circle rather than as a bow.
 */
function tails(pin: Point, tone: Tone): ReactNode {
  return (
    <>
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={[
            `M${pin.x + side * 5} ${pin.y + 8}`,
            `L${pin.x + side * 10} ${pin.y + 19}`,
            `L${pin.x + side * 6.5} ${pin.y + 16}`,
            `L${pin.x + side * 3} ${pin.y + 19.5}`,
            `L${pin.x + side} ${pin.y + 9}z`,
          ].join(' ')}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: families[tone].base, stroke: families[tone].deep }}
        />
      ))}
    </>
  )
}

/**
 * Nine petals on the rim. Nine rather than more because a tenth closes the gaps
 * between them, and a ring with no gaps is a circle with a bumpy edge — the
 * frill is the whole of what says rosette rather than medal.
 */
function petals(pin: Point, tone: Tone): ReactNode {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const p = at(pin, (360 / 9) * i - 90, PETAL_RING)

        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={PETAL}
            strokeWidth="2.5"
            style={{ fill: families[tone].base, stroke: families[tone].deep }}
          />
        )
      })}
    </>
  )
}

/**
 * One character's five pins.
 *
 * Each entry is the frame for that tier with the charm laid over it, so the
 * charm is painted last and nothing the frame adds can cover it. Tier 1 is the
 * charm alone and is the same node the character has always drawn — a fresh
 * record is unchanged by any of this.
 */
export function tieredCharms(
  pin: Point,
  tone: Tone,
  charm: ReactNode,
): Character['charms'] {
  const framed = (frame: ReactNode): ReactNode => (
    <>
      {frame}
      {charm}
    </>
  )

  return [
    charm,
    framed(ring(pin, tone)),
    framed(ring(pin, tone, true)),
    framed(
      <>
        {ring(pin, tone, true)}
        {studs(pin, tone)}
      </>,
    ),
    // The petals stand where the studs did — the rosette is what the studs were
    // promising, so keeping both would read as clutter at the size that matters.
    // The tails arrive here too: they are the weakest of the additions at 92px,
    // so they ride the tier that is already unmistakable rather than carrying
    // one of their own.
    framed(
      <>
        {tails(pin, tone)}
        {petals(pin, tone)}
        {ring(pin, tone, true)}
      </>,
    ),
  ]
}
