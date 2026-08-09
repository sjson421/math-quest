import { families } from './palette'
import type { Decoration } from './types'

/**
 * The decorations that go in Pip's room.
 *
 * Geometry is written in the room's `0 0 320 200` view box against the anchors
 * in `mascot-design`'s `references/room.md`, so nothing here is scaled or
 * repositioned into place. Pip's own canvas is nested in that box at `(60, 0)`
 * at the same unit scale, which is why his coordinates and these are directly
 * comparable: his rendered extent is `x 86–234`, and the floor either side of
 * him is `x 0–86` and `x 234–320`.
 *
 * Nothing here moves. `Decoration.render` takes no state, so a decoration that
 * responded to Pip's mood could not be written even by accident.
 *
 * **An item's family differs from the surface it sits against.** The wall is
 * `powder.soft` and the floor is `butter.soft`, so no wall item is powder and no
 * floor item is butter — a base drawn on its own soft tint survives a mockup and
 * disappears on a phone.
 */

const { blossom, lilac, mint } = families

/**
 * Prices are the rate 16a measured, unchanged: 15 coins for a lesson that raises
 * mastery, 8 for a repeat, so three lessons in a sitting pay 45. The set totals
 * 470 — the same as the wardrobe, which is the honest answer to what a room
 * should cost when the wardrobe is the only comparison there is. The cheapest
 * decoration is 50 against the wardrobe's 40, so the first thing a learner can
 * afford is still something Pip wears.
 */
export const decorations: Decoration[] = [
  {
    kind: 'decoration',
    id: 'blossom-rug',
    slot: 'rug',
    name: 'Blossom rug',
    price: 50,
    // Two flat ellipses about `rug-center`, wider than they are tall so they
    // read as a rug seen from Pip's own low angle rather than as a disc
    // standing on its edge. Pip's ground shadow is drawn over this, which is
    // what stops the rug reading as something he floats above.
    render: () => (
      <g>
        <ellipse
          cx="160"
          cy="182"
          rx="70"
          ry="14"
          strokeWidth="3"
          style={{ fill: blossom.soft, stroke: blossom.deep }}
        />
        <ellipse
          cx="160"
          cy="182"
          rx="46"
          ry="8"
          strokeWidth="2.5"
          style={{ fill: blossom.base, stroke: blossom.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'round-window',
    slot: 'wall',
    name: 'Round window',
    price: 80,
    // Centred on `wall-center` and deliberately large enough to pass behind
    // Pip's tuft: the overlap is what makes it read as a window on a wall
    // rather than a badge floating above his head. Mint, not powder — a powder
    // window on the powder wall is a base on its own soft tint.
    render: () => (
      <g>
        <circle
          cx="160"
          cy="30"
          r="26"
          strokeWidth="3"
          style={{ fill: mint.soft, stroke: mint.deep }}
        />
        <path
          d="M134 30 h52 M160 4 v52"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: mint.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'potted-plant',
    slot: 'left',
    name: 'Potted plant',
    price: 100,
    // Stands on `floor-left`: the anchor is the pot's base, not its centre, so
    // the pot sits on the horizon rather than straddling it. Reaches x 23–63,
    // comfortably clear of Pip's extent at x 86.
    render: () => (
      <g>
        <path
          d="M43 132 q-20 -14 -14 -34 q18 6 14 34z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: mint.base, stroke: mint.deep }}
        />
        <path
          d="M43 132 q20 -14 14 -34 q-18 6 -14 34z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: mint.base, stroke: mint.deep }}
        />
        <path
          d="M29 130 h28 l-4 20 h-20z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: mint.soft, stroke: mint.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'blossom-bunting',
    slot: 'wall',
    name: 'Blossom bunting',
    price: 110,
    // The second `wall` item, so replacing one decoration with another in the
    // same slot is a real case rather than a theoretical one.
    //
    // Triangles rather than the stars this started as: a five-point star is a
    // ten-segment path about 7 units across, which is 5 CSS pixels once the
    // room is drawn at its 148px floor. A triangle is three segments and still
    // reads there.
    render: () => (
      <g>
        <path
          d="M60 18 Q160 52 260 18"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: blossom.deep }}
        />
        {/* Points sampled off that same curve, so the flags hang from the cord
            rather than from coordinates that drift when the cord is retuned. */}
        {[
          [90, 27],
          [125, 33],
          [160, 35],
          [195, 33],
          [230, 27],
        ].map(([x, y]) => (
          <path
            key={x}
            d={`M${x - 7} ${y} h14 l-7 16z`}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ fill: blossom.soft, stroke: blossom.deep }}
          />
        ))}
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'lilac-bookshelf',
    slot: 'right',
    name: 'Lilac bookshelf',
    price: 130,
    // The tallest item in the set, 76 units from `floor-right` up the wall, and
    // the proof that a floor item can rise well above the horizon without
    // meeting Pip — it spans x 249–305, and his rendered extent stops at 234.
    render: () => (
      <g>
        <rect
          x="249"
          y="74"
          width="56"
          height="76"
          rx="4"
          strokeWidth="3"
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
        <path
          d="M249 100 h56 M249 126 h56"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: lilac.deep }}
        />
        {/* Books, each standing on the shelf below it: x, top, height. */}
        {[
          [256, 81, 19],
          [268, 84, 16],
          [280, 81, 19],
          [256, 107, 19],
          [268, 110, 16],
        ].map(([x, y, height]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="9"
            height={height}
            rx="2"
            strokeWidth="2.5"
            style={{ fill: lilac.base, stroke: lilac.deep }}
          />
        ))}
      </g>
    ),
  },
]
