# Palette, geometry, and motion

## Two palettes that are not one palette

Pip's colours are constants in `Mascot.tsx`. The app's colours are custom properties in
`src/index.css`. Some are the same value; the creams are not, and the difference is
deliberate — Pip's cream is warmer and peachier than the app's, which is pinker.

**Pip's own constants**

| Constant | Value | Used for | App token |
| --- | --- | --- | --- |
| `CREAM` | `#fff6f0` | body fill | none — **not** `--color-cream` `#fef7f9` |
| `CREAM_SHADE` | `#ffe8dd` | body outline | none — **not** `--color-cream-deep` `#f9ecf1` |
| `INK` | `#4a3f47` | eyes, mouth | `--color-ink` |
| `BLUSH` | `#ffb3c9` | cheeks, inner ear, ground shadow | `--color-blossom` |
| star fill | `#ffe5a3` | signature star | `--color-butter` |
| star stroke | `#e8b53d` | signature star | `--color-butter-deep` |

Never substitute `--color-cream` for `CREAM`. Side by side at 190 px the swap reads as a
smudge on the character, and because both are near-white it will pass every review that
does not put them next to each other.

**App tokens available to cosmetics** — each family is a base, a soft tint, and a deep
shade, which is exactly enough for a fill, a highlight, and an outline:

`blossom` `#ffb3c9` / `#ffd9e4` / `#f2789c` · `lilac` `#cbb6f0` / `#e5daf9` / `#9b7ed6` ·
`mint` `#a8e6cf` / `#d3f3e6` / `#4fbf95` · `butter` `#ffe5a3` / `#fff3d6` / `#e8b53d` ·
`powder` `#a8d8f0` / `#d6ecf9` / `#59b4dd`

Pick one family per item and outline it in that family's deep shade. An item that mixes
three families reads as clutter at 92 px, whatever it looks like at 190.

A colour outside these families needs a one-line reason in a comment beside the geometry.
"The pirate hat is black because a lilac pirate hat is not a pirate hat" is a reason.
"Looked nicer" is not — it is how a palette stops being a palette.

## Geometry limits

- **Cosmetic outlines are 2.5 to 3 units** — 3 is what the head and ears use, 2.5 the star.
  Thinner vanishes at 92 px; thicker overwhelms the face. Pip's own *face* is drawn heavier
  (3.5 mouth, 4–4.5 eyes, 5 tuft) because it has to stay readable through every expression;
  that is not licence for a cosmetic to match it.
- **Round caps and joins**, always: `strokeLinecap="round"`, `strokeLinejoin="round"`. Pip
  has no sharp corners and an item with them looks pasted on.
- **Simple shapes.** Circles, ellipses, and short quadratic curves. If an item needs a path
  with a dozen segments to read, it is too detailed for this character.
- **Nothing smaller than about 6 units.** At 92 px the scale is `92 / 200 = 0.46`, so 6
  units is 2.8 CSS pixels and a 3-unit stroke is 1.4. Detail below that is not small, it is
  absent.
- **Stay inside the view box** including during motion. A sway of ±8° about a low anchor
  swings the top of a tall item further than it looks on paper.

## Semantic motion

Animate through the shared vocabulary rather than inventing a curve per item. The point is
that two cosmetics worn together move like they belong to the same character.

| Preset | Motion | Fits |
| --- | --- | --- |
| `sway` | small rotation about a low anchor | capes, tails, scarf ends |
| `bounce` | short `y` displacement | pompoms, danglers |
| `spin` | full rotation, celebration only | badges, stars |
| `pulse` | scale or opacity breathing | glows, gems |

Every transform origin is expressed in view-box units —
`style={{ transformOrigin: '148px 162px' }}` — and never as `originX` / `originY`, which
take a 0–1 fraction and will silently detach the layer from the part it belongs to.

Pip has six states: `idle`, `thinking`, `happy`, `encouraging`, `celebrating`, `sleeping`.
An item does not need a distinct animation for each, but it must not look broken in any of
them, and `spin` in particular belongs to `celebrating` alone.

## Reduced motion

An item **must define or inherit a static presentation**, and that presentation must carry
everything the item means. Motion may add delight; it may never be the only channel for
information. If a badge only reads as "earned" while it is spinning, the badge is
mis-designed, not under-animated.

Framer Motion's `useReducedMotion` and `MotionConfig` are the mechanism: the reference
behaviour is documented at <https://motion.dev/docs/react-accessibility>. The check is
simpler than the mechanism — set the OS reduced-motion preference, look at the item, and
confirm nothing has gone missing.

Pip exposes one accessible name for the whole character (`aria-label="Pip is <state>"`).
Cosmetics are decorative and must not each announce themselves; a learner using a screen
reader should hear the mascot's state, not an inventory list.
