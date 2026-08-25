import type { ReactNode } from 'react'
import type { Frame } from './types'

/**
 * The face is drawn once and moved, never redrawn.
 *
 * Every expression, every pair of glasses and both cheeks are authored in Pip's
 * coordinates and placed onto whoever is wearing them by the transform below.
 * That is what keeps "six expressions, written once, the same on all three" true
 * now that the three heads are different sizes — a wider face is Pip's face
 * further apart, not a second set of eyes to keep in step with the first.
 *
 * `FACE_ORIGIN` is the point the frame positions: midway between the eye line at
 * `y 110` and the mouth at `y 138`, on the midline. A character says where that
 * point lands and how big the face is there, and everything else follows.
 */

export const FACE_ORIGIN = { x: 100, y: 124 } as const

/** The transform that carries face-frame geometry onto a wearer. */
export function faceTransform({ centre, scale }: Frame): string {
  const [dx, dy] = offsetOf({ centre, scale })
  return `translate(${dx} ${dy}) scale(${scale})`
}

/**
 * The undo, for the one thing inside the face that is not face-shaped.
 *
 * A pair of glasses is authored on the eyes, but its arms have to reach the
 * *silhouette*, which is a different distance away on every body and is measured
 * in the shared view box rather than in the face. Wrapping them in this puts
 * them back into those coordinates without detaching them from the lenses.
 *
 * It is the exact inverse, so the order is reversed as well as the values: undo
 * the scale, then undo the offset.
 */
export function inverseFaceTransform(frame: Frame): string {
  const [dx, dy] = offsetOf(frame)
  return `scale(${1 / frame.scale}) translate(${-dx} ${-dy})`
}

function offsetOf({ centre, scale }: Frame): [number, number] {
  return [centre.x - scale * FACE_ORIGIN.x, centre.y - scale * FACE_ORIGIN.y]
}

/**
 * Wrap a layer so it sits on the wearer's face.
 *
 * `onEar`'s twin, and for the same reason: the character's own expression goes
 * through here and so does every `face` cosmetic, so a pair of glasses cannot
 * land somewhere the eyes are not.
 */
export function onFace(frame: Frame, children: ReactNode): ReactNode {
  // Pip's frame is the identity — he is the coordinates everything is authored
  // in — and he is both the default character and the one the shop draws ten of
  // at once. Wrapping him in `translate(0 0) scale(1)` twice per mascot is a
  // group that does nothing, so it is not emitted.
  if (isIdentity(frame)) return <>{children}</>

  return <g transform={faceTransform(frame)}>{children}</g>
}

function isIdentity({ centre, scale }: Frame): boolean {
  return scale === 1 && centre.x === FACE_ORIGIN.x && centre.y === FACE_ORIGIN.y
}
