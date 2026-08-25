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

/* ------------------------------------------------------------------------- *
 * Coats — one per character
 * ------------------------------------------------------------------------- */

/**
 * The three colours a character's own body is drawn in: a fill, an outline, and
 * the warm tone its cheeks, inner ears and ground shadow share.
 *
 * `INK` is deliberately absent. Eyes and mouth are the same colour on everyone,
 * because they are the six expressions — a character that inked its own face
 * would be a second expression set to keep in step with the first.
 */
export type Coat = {
  base: string
  shade: string
  blush: string
}

/**
 * Every character's colours, written down here for the reason Pip's always were:
 * `characters.tsx` imports the catalogue types and cannot also be the place the
 * palette lives, and `catalogue.test.tsx` checks hex literals against this map,
 * so a colour pasted into a character's geometry fails rather than spreads.
 *
 * **A coat stays out of the five app families.** Every cosmetic is one family
 * outlined in that family's deep shade, so a mint character would lose the mint
 * scarf and a lilac one the party hat. Cream and ginger both sit outside all
 * five — which is the constraint a third character has to satisfy too, and the
 * reason there is no sixth pastel here to reach for.
 */
export const coats = {
  /** Pip's, moved rather than rewritten — the same four values he always had. */
  pip: { base: CREAM, shade: CREAM_SHADE, blush: BLUSH },
  /** Ginger: warm and clearly deeper than cream, so the two never read as one. */
  mochi: { base: '#ffd2b0', shade: '#f0a97e', blush: '#fb90ac' },
} as const satisfies Record<string, Coat>
