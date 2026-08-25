import { INK, coats, families } from './palette'
import type { Anchors, Character } from './types'

/**
 * The three creatures a learner can be, and the parts that make them different.
 *
 * **Each one draws its own body.** They used to share a single head circle at
 * `(100, 112) r 57`, because the ten shipped accessories were authored against
 * those literal numbers — so a character could vary its ears, its crest and its
 * coat, and three creatures came out as three colours of one animal. Every item
 * now reads `anchors` instead, which buys each body its own silhouette: a broad
 * flat-topped cat with cheek fur, and the round bunny it was shaped like before.
 *
 * What the anchors still guarantee is the thing the old circle was protecting:
 * **buying a character never costs the learner an accessory.** Every item fits
 * every body, and `catalogue.test.tsx` renders every combination to say so.
 *
 * Geometry is in the shared `0 0 200 200` view box, unrotated for the ears, and
 * carries no motion of its own; `Mascot.tsx` supplies all of it.
 */

const { butter, mint, powder } = families

/* ------------------------------------------------------------------------- *
 * Pip — cream bunny
 * ------------------------------------------------------------------------- */

/**
 * The round one, and the baseline the other two are read against.
 *
 * His geometry is untouched by the anchor rework — the same circle, the same ear
 * ellipses, the same tuft. His `anchors` are that circle measured: `brow` and
 * `temple` are its true half-widths at those heights, and `face` is the identity
 * frame, so the expressions land exactly where they were authored.
 */
const PIP_EAR: Anchors['ear'] = {
  left: { base: { x: 56, y: 96 }, hold: { x: 56, y: 68 } },
  right: { base: { x: 144, y: 96 }, hold: { x: 144, y: 68 } },
}

const pipAnchors: Anchors = {
  face: { centre: { x: 100, y: 124 }, scale: 1 },
  ear: PIP_EAR,
  crown: 55,
  brow: { y: 68, halfWidth: 36 },
  temple: { y: 99, halfWidth: 55 },
  chin: { y: 158, halfWidth: 32 },
  shoulder: { y: 124, halfWidth: 52.5 },
  pin: { x: 148, y: 162 },
}

const pip: Character = {
  kind: 'character',
  id: 'pip',
  name: 'Pip',
  // Free, and free is how he is owned: `owns()` treats a price of zero as bought
  // already, so a record that predates characters starts as Pip with no purchase
  // and no migration.
  price: 0,
  coat: coats.pip,
  anchors: pipAnchors,
  head: <circle cx="100" cy="112" r="57" fill={coats.pip.base} stroke={coats.pip.shade} strokeWidth="3" />,
  ear: (ear) => {
    const { x } = PIP_EAR[ear].base

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
 * Broad, flat-topped and low, with four fur points breaking the outline where a
 * cheek would be — the opposite proportion to Pip in every direction that reads
 * at 92px: wider than tall where he is a circle, widest at the cheeks where he
 * is widest at the eyes, and a jaw that comes to a soft point where he has none.
 *
 * The fur points are part of the head path rather than shapes laid on it, so the
 * outline runs through them and they cannot show a seam against the fill.
 */
const MOCHI_EAR: Anchors['ear'] = {
  left: { base: { x: 58, y: 86 }, hold: { x: 58, y: 66 } },
  right: { base: { x: 142, y: 86 }, hold: { x: 142, y: 66 } },
}

const mochiAnchors: Anchors = {
  // A bigger head carries a bigger face: at scale 1 the eyes sit island-like in
  // the middle of it with cheek to spare on both sides.
  face: { centre: { x: 100, y: 128 }, scale: 1.06 },
  ear: MOCHI_EAR,
  crown: 74,
  brow: { y: 90, halfWidth: 52 },
  temple: { y: 116, halfWidth: 62 },
  chin: { y: 166, halfWidth: 30 },
  shoulder: { y: 132, halfWidth: 58 },
  pin: { x: 152, y: 166 },
}

const mochi: Character = {
  kind: 'character',
  id: 'mochi',
  name: 'Mochi',
  price: 500,
  coat: coats.mochi,
  anchors: mochiAnchors,
  head: (
    <path
      // Flat across the top between the ears, out to the widest point at the
      // cheeks, through three fur points a side, then in to a soft jaw.
      d="M100 74
         C 74 74 52 80 44 96
         C 38 108 38 118 40 128
         L 30 134 L 42 138
         L 32 148 L 46 149
         L 40 160 L 54 157
         C 66 170 82 176 100 176
         C 118 176 134 170 146 157
         L 160 160 L 154 149
         L 168 148 L 158 138
         L 170 134 L 160 128
         C 162 118 162 108 156 96
         C 148 80 126 74 100 74 Z"
      fill={coats.mochi.base}
      stroke={coats.mochi.shade}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  ),
  ear: (ear) => {
    const { x } = MOCHI_EAR[ear].base
    // Leaning outward, the way a cat's do — mirrored so both lean away from the
    // midline rather than both leaning the same way.
    const lean = ear === 'left' ? -6 : 6

    return (
      <g>
        <path
          d={`M${x - 20} 96 Q${x - 18} 62 ${x + lean} 44 Q${x + 20 + lean} 64 ${x + 21} 96 Z`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill={coats.mochi.base}
          stroke={coats.mochi.shade}
        />
        <path
          d={`M${x - 11} 92 Q${x - 10} 66 ${x + lean} 56 Q${x + 11 + lean} 70 ${x + 12} 92 Z`}
          fill={coats.mochi.blush}
          opacity="0.5"
        />
      </g>
    )
  },
  // Two peaks where Pip has one arch, in the same fur weight — read as the tuft
  // between a cat's ears rather than a second crest shape.
  crest: (
    <path
      d="M88 82 Q93 66 99 79 Q105 66 112 82"
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
          on this face that is not INK-on-coat, so it is outlined in INK to keep
          it part of the expression rather than an item sitting on top of one. */}
      <path
        d="M93 124 a3.5 3.5 0 0 1 7 0 a3.5 3.5 0 0 1 7 0 q0 4.5 -7 8 q-7 -3.5 -7 -8z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={coats.mochi.blush}
        stroke={INK}
      />
      {[
        'M86 134 Q62 129 34 124',
        'M86 140 Q62 141 36 145',
        'M114 134 Q138 129 166 124',
        'M114 140 Q138 141 164 145',
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
        cx="150"
        cy="166"
        rx="11"
        ry="8"
        strokeWidth="2.5"
        style={{ fill: powder.base, stroke: powder.deep }}
      />
      <path
        d="M161 166 l8 -7 v14z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ fill: powder.soft, stroke: powder.deep }}
      />
      <path
        d="M145 160 q-3 6 0 12"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ fill: 'none', stroke: powder.deep }}
      />
    </g>
  ),
}

/* ------------------------------------------------------------------------- *
 * Taro — greyed-brown capybara
 * ------------------------------------------------------------------------- */

/**
 * A loaf: flat on top, straight down both sides, and squared off at the jaw,
 * with the ears set inboard on the top corners rather than above them.
 *
 * The silhouette is the whole character. A capybara read from the front is a
 * rectangle with rounded corners — no taper to a muzzle, no crown between the
 * ears — so where Pip is a circle and Mochi is a broad wedge with fur points,
 * this one is a box, and at 92px that is the difference a learner sees before
 * any of the colour.
 *
 * The three things underneath it are the same argument at smaller scale: ears
 * far too small for the head, a bristle crest instead of a tuft, and a blunt
 * muzzle taking up the lower half of the face with the mouth drawn on it.
 */
const TARO_EAR: Anchors['ear'] = {
  left: { base: { x: 62, y: 70 }, hold: { x: 61, y: 53 } },
  right: { base: { x: 138, y: 70 }, hold: { x: 139, y: 53 } },
}

const taroAnchors: Anchors = {
  // The face sits a little larger than Pip's and in the same place, which on a
  // head this tall puts the eyes above centre and leaves the lower half to the
  // muzzle — where a capybara keeps its face.
  face: { centre: { x: 100, y: 124 }, scale: 1.08 },
  ear: TARO_EAR,
  crown: 62,
  // A flat top is wide the moment it starts, so the brow half-width is 53 where
  // Pip's is 36. Every hat is measured off it and every one of them comes out
  // broader here — which is right: they are sitting on a broader head.
  brow: { y: 76, halfWidth: 53 },
  temple: { y: 112, halfWidth: 58 },
  chin: { y: 160, halfWidth: 44 },
  shoulder: { y: 132, halfWidth: 58 },
  pin: { x: 152, y: 162 },
}

const taro: Character = {
  kind: 'character',
  id: 'taro',
  name: 'Taro',
  price: 500,
  coat: coats.taro,
  anchors: taroAnchors,
  head: (
    <path
      // Flat from corner to corner, out to the widest point at the temple, then
      // in to a jaw that stays square — the corners are rounded and nothing else
      // about the shape is.
      d="M66 62
         H134
         Q152 64 156 84
         Q160 104 158 118
         Q156 146 146 158
         Q136 172 100 172
         Q64 172 54 158
         Q44 146 42 118
         Q40 104 44 84
         Q48 64 66 62 Z"
      fill={coats.taro.base}
      stroke={coats.taro.shade}
      strokeWidth="3"
      strokeLinejoin="round"
    />
  ),
  ear: (ear) => {
    const { x } = TARO_EAR[ear].base
    // Which way is away from the midline. The ear is taller and rounder on that
    // side and clipped short on the other, so the pair mirror rather than repeat.
    const out = ear === 'left' ? -1 : 1

    return (
      <g>
        <path
          // Small enough that the earmuff covers it, which is what an earmuff on
          // a capybara should do. `hold` sits in the middle of this shape, so the
          // bow ties on the ear rather than beside it.
          d={`M${x - out * 13} 66
              C${x - out * 15} 46 ${x - out * 8} 36 ${x + out * 2} 36
              C${x + out * 13} 37 ${x + out * 16} 52 ${x + out * 14} 65
              Q${x + out * 1} 73 ${x - out * 13} 66 Z`}
          fill={coats.taro.base}
          stroke={coats.taro.shade}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={`M${x - out * 6} 64
              C${x - out * 8} 48 ${x - out * 4} 42 ${x + out * 2} 42
              C${x + out * 8} 43 ${x + out * 10} 53 ${x + out * 8} 63
              Q${x + out * 1} 69 ${x - out * 6} 64 Z`}
          fill={coats.taro.blush}
          opacity="0.5"
        />
      </g>
    )
  },
  // Three separate bristles rather than one arch. A capybara has no crown of fur
  // to draw, and coarse hair standing up off a flat skull is the thing it has
  // instead — at the tuft's weight, so it reads as fur and not as an accessory.
  crest: (
    <g stroke={coats.taro.shade} strokeWidth="4.5" strokeLinecap="round" fill="none">
      <path d="M89 64 q1 -8 4 -11" />
      <path d="M100 64 q0 -9 2 -12" />
      <path d="M111 64 q-1 -8 -4 -11" />
    </g>
  ),
  markings: (
    <g>
      {/* The muzzle is a plane, not a line: filled in the coat's own shade at
          low opacity so the mouth is drawn *on* it and an open one still reads.
          An outlined snout would put a stroke straight through the delighted
          smile, which opens from y 133 in the face frame — y 134 here. */}
      <path
        d="M76 122 Q74 144 82 156 Q100 165 118 156 Q126 144 124 122 Q100 114 76 122 Z"
        fill={coats.taro.shade}
        opacity="0.38"
      />
      {/* Blunt, wide, and high on the muzzle — the one feature of a capybara's
          face that is bigger than its eyes. Outlined in INK for the reason
          Mochi's nose is: a nose belongs to the expression, not on top of it.
          It stops at y 126, eight units clear of the open mouth. */}
      <path
        d="M89 112 Q89 106 96 106 H104 Q111 106 111 112 Q111 121 100 126 Q89 121 89 112 Z"
        fill={coats.taro.blush}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  ),
  // A lily pad, in the star's footprint. Mint rather than butter or powder, so
  // the three charms are told apart by colour before shape at 92px — and a pad
  // is what a capybara is usually drawn sitting in rather than something it
  // wears.
  charm: (
    <g>
      <path
        d="M152 162 L147.9 173.3 A12 12 0 1 0 140.2 164.1 Z"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ fill: mint.base, stroke: mint.deep }}
      />
      {/* Two veins off the notch. A third is 4 units from its neighbour, which
          at 92px is under two pixels and reads as a thicker line, not a vein. */}
      <path
        d="M152 162 L155 151 M152 162 L163 165"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ fill: 'none', stroke: mint.deep }}
      />
      <ellipse cx="147" cy="156" rx="4.5" ry="3" style={{ fill: mint.soft }} />
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
export const characters: Character[] = [pip, mochi, taro]
