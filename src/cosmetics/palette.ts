/**
 * Every colour a cosmetic is allowed to use.
 *
 * These lived in `Mascot.tsx` until cosmetics existed. They had to move: the
 * mascot imports the catalogue in order to draw it, and the catalogue imports
 * these to match the character — which is a cycle if they stay in the component.
 *
 * The two groups below are deliberately *not* one palette. Pip's cream is warmer
 * and peachier than the app's, and substituting one for the other reads as a
 * smudge on the character at 190px while passing every review that does not put
 * them side by side.
 */

import type { Tone } from '../components/tone'

/* ------------------------------------------------------------------------- *
 * Pip's own constants — moved here verbatim, values unchanged.
 * ------------------------------------------------------------------------- */

export const CREAM = '#fff6f0'
export const CREAM_SHADE = '#ffe8dd'
export const INK = '#4a3f47'
export const BLUSH = '#ffb3c9'

/* ------------------------------------------------------------------------- *
 * The app's colour families.
 * ------------------------------------------------------------------------- */

/**
 * References, not copies. `src/index.css` declares each of these once and stays
 * the only place the value is written down — a cosmetic that pasted the hex
 * would be a second source of truth with nothing keeping the two in step.
 *
 * They resolve wherever Pip is drawn, because the properties are declared on
 * `:root`. Nothing is fetched: a custom property is not a network dependency.
 *
 * **Apply these through `style`, never as a `fill` or `stroke` attribute.**
 * `var()` is only substituted in CSS property values; a presentation attribute
 * reading `fill="var(--color-lilac)"` is simply an invalid paint, and the shape
 * renders black. Pip's own constants above are plain values and work either way.
 *
 * Each family is a base, a soft tint, and a deep shade: exactly enough for a
 * fill, a highlight, and an outline. An item picks one family and outlines it in
 * that family's deep shade; mixing three reads as clutter at 92px.
 */
const family = (name: Tone) => ({
  base: `var(--color-${name})`,
  soft: `var(--color-${name}-soft)`,
  deep: `var(--color-${name}-deep)`,
})

// Keyed off `Tone` rather than a second list of the same five names — that
// union already decides which pastels exist, and a sixth should not have to be
// remembered in two places.
export const families: Record<Tone, ReturnType<typeof family>> = {
  blossom: family('blossom'),
  lilac: family('lilac'),
  mint: family('mint'),
  butter: family('butter'),
  powder: family('powder'),
}
