import { motion } from 'framer-motion'
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
 * **Nothing here responds to anything.** `Decoration.render` takes no state, so a
 * decoration that reacted to Pip's mood could not be written even by accident.
 *
 * Two of them do carry a loop of their own, and that is a narrower permission
 * than it sounds: an unlit string of bulbs and a fish tank with nothing moving
 * in it do not read as calm, they read as broken. Everything that is furniture —
 * the rug, the shelf, the chest, the frames — stays still.
 *
 * **An item's family differs from the surface it sits against.** The wall is
 * `powder.soft` and the floor is `butter.soft`, so no wall item is powder and no
 * floor item is butter — a base drawn on its own soft tint survives a mockup and
 * disappears on a phone.
 */

const { blossom, butter, lilac, mint, powder } = families

/**
 * Prices are the rate 16a measured, unchanged: 15 coins for a lesson that raises
 * mastery, 8 for a repeat, so three lessons in a sitting pay 45.
 *
 * The five original decorations keep their original prices, and the cheapest is
 * still 50 against the wardrobe's 40 — so the first thing a learner can afford
 * is still something Pip wears. Above them the room climbs to 1000 alongside the
 * wardrobe, because the two sets have only each other to be measured against and
 * a room that topped out at 130 would read as the lesser half.
 *
 * **What the extra coins buy is more to look at**, and on this surface that is
 * limited by where the eye can actually reach: Pip covers `x 86–234` and his
 * head reaches `y 55`, so a dear wall item earns its price by being *wide* and
 * *high* rather than by being dense. The string lights hang six bulbs across
 * 200 units for exactly that reason.
 *
 * The list is ordered by price, and the shop shows each category in this order.
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

  {
    kind: 'decoration',
    id: 'mint-floor-lamp',
    slot: 'left',
    name: 'Mint floor lamp',
    price: 150,
    // Stands on `floor-left`: the splayed foot sits on the horizon and the shade
    // rises to y 64, so the item reads from the floor line all the way up the
    // wall while staying inside x 25–61 — clear of Pip's extent at x 86.
    render: () => (
      <g>
        <path
          d="M31 150 h24 l-5 -10 h-14z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: mint.base, stroke: mint.deep }}
        />
        <path
          d="M43 141 V90"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: mint.deep }}
        />
        <path
          d="M25 90 h36 l-7 -26 h-22z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: mint.soft, stroke: mint.deep }}
        />
        <path
          d="M28 82 h30"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: mint.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'blossom-picture-wall',
    slot: 'wall',
    name: 'Blossom picture wall',
    price: 300,
    // Three frames spread from x 50 to 270 rather than one large frame on
    // `wall-center`. The party hat's crown covers x 136–184 in room units, so a
    // wall item that puts everything in the middle is a wall item the learner
    // stops seeing the moment Pip puts a hat on; here the hat takes the middle
    // frame and the outer two are untouched.
    render: () => (
      <g>
        {[
          [50, 22, 48, 32],
          [136, 12, 48, 36],
          [222, 22, 48, 32],
        ].map(([x, y, w, h]) => (
          <g key={x}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="4"
              strokeWidth="3"
              style={{ fill: blossom.base, stroke: blossom.deep }}
            />
            <rect
              x={x + 6}
              y={y + 6}
              width={w - 12}
              height={h - 12}
              rx="2"
              style={{ fill: blossom.soft }}
            />
          </g>
        ))}
        {/* One motif per frame, in the deep shade so it still reads against the
            pale mount at the room's 148px floor. */}
        <circle cx="74" cy="38" r="7" style={{ fill: blossom.deep }} />
        <path
          d="M145 41 l10 -14 7 9 8 -8 v13z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ fill: blossom.deep, stroke: blossom.deep }}
        />
        <path
          d="M236 45 V33 M246 45 V31 M256 45 V37"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: blossom.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'lilac-toy-chest',
    slot: 'right',
    name: 'Lilac toy chest',
    price: 450,
    // Stands on `floor-right`. The blocks sit at x 270–290 because that is where
    // the domed lid is flattest — the dome drops 9.5 units at its apex and only
    // 1 unit across that span, so a flat-bottomed block rests on it rather than
    // hovering over the shoulder.
    render: () => (
      <g>
        <rect
          x="250"
          y="110"
          width="60"
          height="40"
          rx="4"
          strokeWidth="3"
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
        <path
          d="M250 126 h60"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: lilac.deep }}
        />
        <path
          d="M250 110 q30 -19 60 0z"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ fill: lilac.base, stroke: lilac.deep }}
        />
        <rect
          x="275"
          y="106"
          width="10"
          height="12"
          rx="2"
          strokeWidth="2.5"
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
        <rect
          x="270"
          y="87"
          width="18"
          height="16"
          rx="3"
          strokeWidth="2.5"
          style={{ fill: lilac.base, stroke: lilac.deep }}
        />
        <rect
          x="274"
          y="71"
          width="16"
          height="16"
          rx="3"
          strokeWidth="2.5"
          style={{ fill: lilac.soft, stroke: lilac.deep }}
        />
        {/* The ball is the one part that leaves the chest, and it stops at
            x 232 — Pip's extent starts at 234, but his head at this height only
            reaches x 209 and his shadow x 202, so the two never meet. */}
        <circle
          cx="240"
          cy="142"
          r="8"
          strokeWidth="2.5"
          style={{ fill: lilac.base, stroke: lilac.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'mint-star-rug',
    slot: 'rug',
    name: 'Mint star rug',
    price: 600,
    // **The first version of this was drawn too quietly to be worth 600.** Its
    // rings were soft-on-base and its border rode an ellipse of rx 64, all of
    // it inside Pip's ground shadow at x 118–202 — three tones of one family,
    // tinted pink, at the one place on this surface nothing else competes for.
    // Next to the 50-coin blossom rug it did not read as a different object.
    //
    // Two changes, both about being seen rather than about being finer. It is
    // rx 90 against the blossom rug's 70, so it is plainly the larger rug; and
    // the border is the family's **deep** shade, eight solid diamonds 14 units
    // across, sitting on the pale outer band where the shadow does not reach.
    // Detail that has to survive a translucent shadow has to be dark, not small.
    render: () => (
      <g>
        <ellipse
          cx="160"
          cy="179"
          rx="90"
          ry="18"
          strokeWidth="3"
          style={{ fill: mint.soft, stroke: mint.deep }}
        />
        <ellipse
          cx="160"
          cy="179"
          rx="62"
          ry="12"
          strokeWidth="2.5"
          style={{ fill: mint.base, stroke: mint.deep }}
        />
        <ellipse
          cx="160"
          cy="179"
          rx="28"
          ry="5"
          strokeWidth="2.5"
          style={{ fill: mint.soft, stroke: mint.deep }}
        />
        {/* Six points of an ellipse rx 76, ry 10. The ry is 10 rather than the
            rug's own 18 so the lowest diamond's tip lands at y 195 — on the rug
            and inside the canvas, where riding the rug's own edge would hang it
            over both. Six rather than eight because the pair at top and bottom
            centre would have run into the medallion below. */}
        {[
          [236, 179],
          [198, 188],
          [122, 188],
          [84, 179],
          [122, 170],
          [198, 170],
        ].map(([x, y]) => (
          <path
            key={`${x}-${y}`}
            d={`M${x} ${y - 7} l7 7 -7 7 -7 -7z`}
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ fill: mint.deep, stroke: mint.deep }}
          />
        ))}
        <path
          d="M160 169 l10 10 -10 10 -10 -10z"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ fill: mint.deep, stroke: mint.deep }}
        />
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'powder-aquarium',
    slot: 'left',
    name: 'Powder aquarium',
    price: 800,
    // Powder is the one family that can be water, and the floor is butter, so
    // this is the rare case where the surface rule and the subject agree.
    //
    // The fish are the family's *deep* shade rather than its base. Base fish in
    // soft water is the powder-window-on-a-powder-wall mistake happening inside
    // a single item — outlined or not, the fish stop being fish on a phone.
    render: () => (
      <g>
        <rect
          x="16"
          y="128"
          width="54"
          height="22"
          rx="3"
          strokeWidth="3"
          style={{ fill: powder.base, stroke: powder.deep }}
        />
        <rect
          x="10"
          y="76"
          width="66"
          height="52"
          rx="5"
          strokeWidth="3"
          style={{ fill: powder.soft, stroke: powder.deep }}
        />
        <rect x="13" y="117" width="60" height="8" rx="4" style={{ fill: powder.base }} />
        <path
          d="M24 122 q-6 -14 0 -26 M32 122 q7 -12 2 -22"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: powder.deep }}
        />
        <path
          d="M14 88 q14 6 29 0 q15 -6 29 0"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: powder.deep }}
        />
        {/* One fish drifts across, the other up and down, and each passes
            through its rest position to both sides rather than pushing off in
            one direction and returning.

            Deliberately different axes: given two horizontal drifts on periods
            that do not divide into one another, the pair eventually peaks at the
            same moment and merges into one shape — which is what the first
            version of this did. Separate axes keep them apart however the phases
            fall, and the throws are sized off the tank's inner edges at x 13 and
            x 73 and the gravel at y 117, at *both* extremes now: the left fish
            reaches x 13 and x 48, the right one y 95 and y 115.

            Scale and translate rather than opacity, throughout this item and
            the string lights. Both read as motion in a still frame, which is
            what a screenshot and an acceptance pass can actually check. */}
        <motion.g
          animate={{ x: [0, 4, 0, -4, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="34" cy="102" rx="10" ry="7" style={{ fill: powder.deep }} />
          <path d="M25 102 l-8 -6 v12z" style={{ fill: powder.deep }} />
        </motion.g>
        <motion.g
          animate={{ y: [0, -4, 0, 4, 0] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <ellipse cx="60" cy="105" rx="8" ry="6" style={{ fill: powder.deep }} />
          <path d="M68 105 l5 -4 v8z" style={{ fill: powder.deep }} />
        </motion.g>
        {/* Bubbles leave the gravel at y 116 and stop at y 92, just under the
            water line — one that reached the surface and kept going would be a
            bubble outside the tank. They scale up from nothing and back down
            again, so each appears and pops rather than blinking in and out. */}
        {[
          [26, 4.4, 0],
          [46, 5.6, 1.4],
          [64, 5, 2.6],
        ].map(([x, duration, delay]) => (
          <motion.circle
            key={x}
            cx={x}
            cy="116"
            r="3.5"
            strokeWidth="2.5"
            animate={{ y: [0, -24], scale: [0, 1, 1, 0] }}
            transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
            style={{
              fill: powder.base,
              stroke: powder.deep,
              transformOrigin: `${x}px 116px`,
            }}
          />
        ))}
      </g>
    ),
  },

  {
    kind: 'decoration',
    id: 'butter-string-lights',
    slot: 'wall',
    name: 'Butter string lights',
    price: 1000,
    // The dearest thing in the room, and it earns that by being the only item
    // that uses the whole wall: two swags from x 48 to x 272, high enough that
    // four of the six bulbs clear both Pip's ears and the party hat's crown at
    // x 136–184. A dense item in the middle would have cost the same to draw and
    // been worth nothing the moment he put a hat on.
    //
    // Bulb points are sampled off the two curves at t = ¼, ½, ¾, so they hang
    // from the cord rather than from coordinates that drift if it is retuned.
    render: () => (
      <g>
        <path
          d="M48 20 Q104 54 160 24 Q216 54 272 20"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ fill: 'none', stroke: butter.deep }}
        />
        {[48, 272].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy="20"
            r="5"
            strokeWidth="2.5"
            style={{ fill: butter.base, stroke: butter.deep }}
          />
        ))}
        {[
          [76, 33],
          [104, 38],
          [132, 35],
          [188, 35],
          [216, 38],
          [244, 33],
        ].map(([x, y], i) => (
          <g key={x}>
            <path
              d={`M${x} ${y} v7`}
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ fill: 'none', stroke: butter.deep }}
            />
            {/* The glow is a soft halo behind the bulb, not the bulb's own
                opacity: fading the bulb would let the wall show through it and
                the thing that is supposed to be lit would go translucent.
                It breathes in size at a fixed 0.4 — a halo swelling from 9 to
                14 units around a 7-unit bulb — and each is staggered, so the
                light runs along the string rather than the whole string
                blinking at once. */}
            <motion.circle
              cx={x}
              cy={y + 14}
              r="12"
              opacity="0.4"
              animate={{ scale: [0.75, 1.15, 0.75] }}
              transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
              style={{ fill: butter.base, transformOrigin: `${x}px ${y + 14}px` }}
            />
            <circle
              cx={x}
              cy={y + 14}
              r="7"
              strokeWidth="2.5"
              style={{ fill: butter.base, stroke: butter.deep }}
            />
          </g>
        ))}
      </g>
    ),
  },
]
