import { EAR_X } from './ears'
import { INK, coats, families } from './palette'
import type { Character } from './types'

/**
 * The three creatures a learner can be, and the parts that make them different.
 *
 * Every one of them is the same head circle at `(100, 112)` with the same eyes,
 * the same mouth, and the same two ear bases — because that is the contract nine
 * shipped accessories are authored against. **Buying a character never costs the
 * learner an accessory**, and holding the anchors still is the whole reason.
 *
 * What is left over is more than it sounds: a coat, the shape hanging off each
 * ear base, what sits between them, what is drawn on the face, and the charm in
 * the `pin` slot. Cream bunny, ginger cat, sage dragon — a silhouette, a colour
 * and a snout apart, at a glance, with every hat still fitting.
 *
 * Geometry is in Pip's own `0 0 200 200` view box, unrotated for the ears, and
 * carries no motion of its own; `Mascot.tsx` supplies all of it.
 */

const { butter, mint, powder } = families

/* ------------------------------------------------------------------------- *
 * Pip — cream bunny
 * ------------------------------------------------------------------------- */

/**
 * Moved, not redrawn. The ellipses, radii and opacities are the ones
 * `Mascot.tsx` has always used.
 *
 * One thing did change and it is a fix: the inner ear used to be painted outside
 * the rotating group with a static `rotate(-24)` of its own, which matched at
 * rest and slid off the ear on `happy` and `celebrating` — the two states where
 * the ears actually move. Inside the group it needs no transform and cannot come
 * adrift, which is the same guarantee every ear-riding cosmetic gets.
 */
const pip: Character = {
  kind: 'character',
  id: 'pip',
  name: 'Pip',
  // Free, and free is how he is owned: `owns()` treats a price of zero as bought
  // already, so a record that predates characters starts as Pip with no purchase
  // and no migration.
  price: 0,
  coat: coats.pip,
  ear: (ear) => {
    const x = EAR_X[ear]

    return (
      <g>
        <ellipse
          cx={x}
          cy="72"
          rx="17"
          ry="30"
          fill={coats.pip.base}
          stroke={coats.pip.shade}
          strokeWidth="3"
        />
        <ellipse cx={x} cy="69" rx="8" ry="18" fill={coats.pip.blush} opacity="0.35" />
      </g>
    )
  },
  crest: (
    <path
      d="M92 58 Q100 42 108 58"
      stroke={coats.pip.shade}
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
  ),
  charm: (
    <path
      d="M148 150 l4.2 8.6 9.4 1.4 -6.8 6.7 1.6 9.4 -8.4 -4.4 -8.4 4.4 1.6 -9.4 -6.8 -6.7 9.4 -1.4z"
      strokeWidth="2.5"
      strokeLinejoin="round"
      style={{ fill: butter.base, stroke: butter.deep }}
    />
  ),
}

/* ------------------------------------------------------------------------- *
 * Mochi — ginger cat
 * ------------------------------------------------------------------------- */

/**
 * A pointed ear where Pip has a long one, and a face with things on it.
 *
 * The ear is the piece that had to be checked rather than drawn: it tapers, so
 * it is *narrower* than Pip's at every height, and both ear-riding cosmetics are
 * sized to his. At `y 68` the muff's 30-unit circle covers a 18-unit ear with
 * room to spare, and the tip still pokes out above it exactly as Pip's does. The
 * bow at `y 64` is the one that overhangs — 26 units of ribbon on a 20-unit ear —
 * which reads as a bow tied round a narrow ear rather than as a mistake.
 *
 * The whiskers cross the silhouette on purpose. Kept inside it they read as four
 * scratches on a cheek; the thing that makes a whisker a whisker is leaving the
 * face. They stop short of `y 150`, where the charm starts.
 */
const mochi: Character = {
  kind: 'character',
  id: 'mochi',
  name: 'Mochi',
  price: 500,
  coat: coats.mochi,
  ear: (ear) => {
    const x = EAR_X[ear]

    return (
      <g>
        {/* Base at y 98 rather than the ear line at 96: the head is painted next
            and covers the last two units, so no seam shows where they meet. */}
        <path
          d={`M${x - 16} 98 Q${x - 14} 60 ${x} 46 Q${x + 14} 60 ${x + 16} 98 Z`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill={coats.mochi.base}
          stroke={coats.mochi.shade}
        />
        <path
          d={`M${x - 9} 94 Q${x - 8} 64 ${x} 54 Q${x + 8} 64 ${x + 9} 94 Z`}
          fill={coats.mochi.blush}
          opacity="0.5"
        />
      </g>
    )
  },
  // Two peaks where Pip has one arch, in the same envelope and the same 5-unit
  // fur weight — the smallest change that reads as a different animal's fur.
  crest: (
    <path
      d="M90 59 Q94 45 99 56 Q104 45 110 59"
      stroke={coats.mochi.shade}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  markings: (
    <g>
      {/* The heart of `heart-shades`, at half its size. A nose is the one place
          on this face that is not INK-on-cream, so it is outlined in INK to keep
          it part of the expression rather than an item sitting on top of one.

          It ends at y 129 and not a unit lower. The delighted and celebrating
          mouths both open from y 133, and the considering 'o' reaches y 134 —
          at the y 133 this started at, all three met the nose and the pair read
          as one shape with a tongue hanging out of it. */}
      <path
        d="M93 121 a3.5 3.5 0 0 1 7 0 a3.5 3.5 0 0 1 7 0 q0 4.5 -7 8 q-7 -3.5 -7 -8z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={coats.mochi.blush}
        stroke={INK}
      />
      {[
        'M88 130 Q66 125 38 120',
        'M88 136 Q66 137 40 141',
        'M112 130 Q134 125 162 120',
        'M112 136 Q134 137 160 141',
      ].map((d) => (
        <path
          key={d}
          d={d}
          // Lighter than the eyes it sits below. At full INK four lines this long
          // are the first thing read on the face, which is the eyes' job.
          stroke={INK}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.7"
          fill="none"
        />
      ))}
    </g>
  ),
  // A fish, in the star's footprint. Powder rather than butter so the two charms
  // are told apart at 92px by colour before shape, which is the only channel
  // that survives at that size.
  charm: (
    <g>
      <ellipse
        cx="146"
        cy="162"
        rx="11"
        ry="8"
        strokeWidth="2.5"
        style={{ fill: powder.base, stroke: powder.deep }}
      />
      <path
        d="M157 162 l8 -7 v14z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ fill: powder.soft, stroke: powder.deep }}
      />
      <path
        d="M141 156 q-3 6 0 12"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ fill: 'none', stroke: powder.deep }}
      />
    </g>
  ),
}

/* ------------------------------------------------------------------------- *
 * Sprig — sage dragon
 * ------------------------------------------------------------------------- */

/**
 * The furthest from Pip the anchors allow: a stubby horn on each ear base, a
 * spiked crest, and a muzzle drawn round the mouth.
 *
 * The horn is short and thick where the ear is long and thin, so the silhouette
 * changes at the top of the head — which is the only part of the outline a
 * character controls. It stays inside the ear's envelope for the same reason
 * Mochi's does, and the two ridge lines are what stop it reading as a blunt cone.
 *
 * The muzzle is `base` fill outlined in `shade` rather than a lighter patch: one
 * more tone would be a fourth colour in the coat, and the outline alone is what
 * a muzzle is. The mouth is painted after it and lands on it in all six states.
 */
const sprig: Character = {
  kind: 'character',
  id: 'sprig',
  name: 'Sprig',
  price: 500,
  coat: coats.sprig,
  ear: (ear) => {
    const x = EAR_X[ear]

    return (
      <g>
        <path
          d={`M${x - 13} 98 Q${x - 11} 66 ${x - 4} 52 Q${x} 47 ${x + 4} 52 Q${x + 11} 66 ${x + 13} 98 Z`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill={coats.sprig.base}
          stroke={coats.sprig.shade}
        />
        {[
          `M${x - 8} 79 q8 -3.5 16 0`,
          `M${x - 6} 67 q6 -3 12 0`,
        ].map((d) => (
          <path
            key={d}
            d={d}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            stroke={coats.sprig.shade}
          />
        ))}
      </g>
    )
  },
  // Three spikes, filled rather than stroked, so the crest is a shape with an
  // outline like the horns rather than a thick squiggle like fur. Round joins
  // keep the points from turning into the sharp corners nothing else here has.
  crest: (
    <path
      d="M86 61 L91 47 L96 59 L100 45 L104 59 L109 47 L114 61 Z"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill={coats.sprig.base}
      stroke={coats.sprig.shade}
    />
  ),
  markings: (
    <g>
      <ellipse
        cx="100"
        cy="141"
        rx="22"
        ry="14"
        strokeWidth="3"
        fill={coats.sprig.base}
        stroke={coats.sprig.shade}
      />
      {[94, 106].map((cx) => (
        <ellipse key={cx} cx={cx} cy="132" rx="3" ry="3.5" fill={INK} opacity="0.7" />
      ))}
    </g>
  ),
  // A sprig, which is the name. Mint is the one family a sage coat could have
  // swallowed, and the charm is the one place it cannot: the `pin` anchor sits
  // off the head, against the room rather than against the body.
  charm: (
    <g>
      <path
        d="M139 172 Q138 152 156 149 Q158 167 141 170 Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ fill: mint.base, stroke: mint.deep }}
      />
      <path
        d="M141 170 Q147 161 155 154"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ fill: 'none', stroke: mint.deep }}
      />
    </g>
  ),
}

/* ------------------------------------------------------------------------- *
 * The list
 * ------------------------------------------------------------------------- */

/**
 * The one export, as `room.tsx` exports only its decorations: the lookups over
 * this list live in `index.tsx` beside the ones over the other two catalogues,
 * so all three kinds are resolved in one place and in the same shape.
 *
 * Cheapest first, like the other two, so the shop's row reads free then paid.
 * **Pip is first for a second reason**: he is the one a fresh record starts as
 * and the one an unknown id falls back to, and `index.tsx` reads both of those
 * off the head of this list rather than naming him again.
 */
export const characters: Character[] = [pip, mochi, sprig]
