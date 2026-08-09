# The room: canvas, anchors, slots, and render order

Pip's room is the second surface this contract covers. A decoration is authored the same way
a cosmetic is — plain geometry, in view-box units, hung off a named anchor — but against a
larger canvas that *contains* Pip's rather than sharing it.

## The canvas

One view box, `0 0 320 200`. **Pip's own `0 0 200 200` canvas is nested inside it at
`(60, 0)` at the same unit scale**, so every coordinate in `layers.md` is the same coordinate
here plus 60 on x. Nothing is scaled: `Room.tsx` places Pip's whole canvas with a single
`translate`, and Pip's geometry is untouched by being in a room.

That shared scale is the point. "Nothing smaller than about 6 units" means the same thing on
both surfaces, strokes are the same weight, and a decoration and a cosmetic drawn beside each
other belong to one drawing.

Pip's rendered extent, in room coordinates:

| Part | Room coordinates |
| --- | --- |
| ears and head, overall | `x 86–234`, `y 46–187` |
| head circle | `(160, 112)`, `r 57` — `x 103–217`, `y 55–169` |
| ground shadow | ellipse `(160, 180)`, `rx 42`, `ry 7` — `x 118–202`, `y 173–187` |
| thinking dots | `(223, 88)` and `(233, 76)` — `thinking` state only |
| sleep marks | `(212, 74)` and `(228, 56)` — `sleeping` state only |

The floor either side of Pip is `x 0–86` and `x 234–320` — 86 units each, symmetric.

## The horizon

The wall is `y 0–150`; the floor is `y 150–200`. His ground shadow spans `y 173–187`, so it
lands wholly on the floor — **a horizon at the shadow's centre would leave it straddling the
join**, which reads as a mistake rather than as a shadow.

It sits at 150 rather than anywhere between there and 168 because Pip's head circle ends at
`y 169`. Level with his chin, the line reads as a windowsill he is leaning on and the floor
is a stripe; 18 units lower, he overlaps the floor and stands *in* the room. That was found
by looking at the rendered screen, not by reasoning about the numbers.

## Named anchors

Author against these rather than against measured pixels.

| Anchor | Point | Source |
| --- | --- | --- |
| `pip-origin` | `(60, 0)` | top-left of Pip's nested canvas |
| `room-horizon` | `y 150` | where wall meets floor |
| `rug-center` | `(160, 182)` | floor centre, under Pip's shadow |
| `wall-center` | `(160, 30)` | high on the wall, clear of the ear tips at `y 46` |
| `floor-left` | `(43, 150)` | base centre of the left floor region |
| `floor-right` | `(277, 150)` | base centre of the right floor region |

A floor item stands *on* its anchor: the anchor is the base, and the item rises from it. A
`wall` item is centred on its anchor. `wall-center` is 30 rather than any higher because the
corners are rounded — a shape reaching `y 0` is clipped by the radius.

## Slots

Every decoration declares exactly one slot. Two decorations in the same slot cannot be placed
at once; that is what a slot is for.

| Slot | Holds | Anchor |
| --- | --- | --- |
| `rug` | rugs, mats — flat on the floor beneath Pip | `rug-center` |
| `wall` | windows, posters, garlands, clocks | `wall-center` |
| `left` | plants, lamps, stools — standing on the floor | `floor-left` |
| `right` | shelves, boxes, standing items | `floor-right` |

**A narrow `wall` item centred on the anchor will be hidden by tall headwear.** The party
hat's crown spans `x 136–184`; the round window spans `x 134–186`, so wearing the hat leaves
only two arcs of the window showing. That is the paint order working as designed — Pip is the
subject and the room is behind him — but it means a `wall` item should be **wide** (the
bunting spans `x 60–260` and reads with any hat on) or accept being partly covered. Check a
new `wall` item against `party-hat`, not against a bare Pip.

**`left` and `right` are two slots, not one slot with a side.** A shelf drawn against
`floor-right` has `x 277` written into its geometry; there is no side-agnostic form of it that
does not reintroduce a repositioning transform, which this contract forbids. An item is
authored for its side and does not move across.

## Render order

Painted first to last. Steps 1, 2 and 7 are the room's own layers and are fixed; steps 3–6
are the openings decorations paint into.

1. wall surface
2. floor surface
3. `rug`
4. `wall`
5. `left`
6. `right`
7. **Pip** — his entire ten-step canvas, as one step

**Pip is one step, and that is the whole occlusion rule.** The room never opens a gap inside
his ten, so the two paint orders cannot disagree about what covers what. Everything follows
from it: a decoration is always behind Pip and behind every cosmetic he wears, a decoration
can never obscure his face, and no decoration needs the `back`/`front` fragment split that
lets a hat crown pass behind his ears. `Decoration` has no such fields — the split is
unavailable, not merely discouraged.

## Colour

The surface is **structure, not stock**. It is fixed and never purchasable, because a
purchasable wall would change the canvas every other decoration is authored against — which
is the decision that cannot be taken back once items exist.

| Part | Colour |
| --- | --- |
| wall | `families.powder.soft` |
| floor | `families.butter.soft` |
| horizon | `families.powder.deep`, 3-unit stroke |
| corners | clipped to the app's `rounded-blob` radius |

The corners are rounded because every card in the app is; a hard-cornered rectangle on a
cream page reads as pasted on.

**Every one of these tokens must exist at runtime, and that is not automatic.** Tailwind emits
a variable from `@theme` only when some utility class references it, so `--color-mint-soft`
and `--color-powder-soft` — which no class uses — were pruned, and a shape filled with a
pruned variable renders *unfilled* rather than falling back. `src/index.css` therefore
declares `@theme static`, which emits every token. Nothing in the test suite can catch a
regression here: vitest runs with `css: false`, so a pruned variable and a present one look
identical. The browser check is the only thing that sees it.

**The wall is cool because Pip is warm.** His head is `CREAM` outlined in `CREAM_SHADE`, so a
cream, butter or blossom wall would leave the character with almost no separation from the
surface behind him. Drawing the room in Pip's own two constants is the tidy-sounding option
and it is wrong for exactly this reason.

**A decoration's family must differ from the surface it sits against.** No `wall` item is
powder; no floor item, `rug` included, is butter. A powder window on a powder wall is
`#a8d8f0` on `#d6ecf9` — a base against its own soft tint, which survives a mockup and
disappears on a phone. Items therefore draw from blossom, lilac and mint.

Everything else in `visual-language.md` applies unchanged: one family per item plus its deep
shade for the outline, 2.5–3 unit strokes, round caps and joins, simple shapes, a one-line
comment beside any colour outside the palette.

## Size floor

The room is rendered no smaller than **148 CSS pixels tall** — the home screen, and the
smallest place it appears. That is a `148 / 200 = 0.74` scale, comfortably above the `0.46`
a cosmetic must survive, so the 6-unit detail limit is easier to meet here, not harder.

The shop previews a decoration at 194 px tall in a full-width card. A two-column card would
put the room at 84 px and Pip inside it at 84 — below the 92 px floor the character must
survive — which is why the room section does not share the wardrobe's grid.

## Motion

**A decoration does not move.** It responds to nothing: not to Pip's six states, not to a
streak, not to a lesson. `Decoration.render` takes no argument, so a state-dependent
decoration cannot be written rather than merely being discouraged.

Pip continues to carry his own per-state bob inside his nested canvas. The room does not move
with him — a swaying wall would read as an earthquake.

## Accessibility

The room adds **no accessible name of its own**. Pip's single `aria-label="Pip is <state>"` is
what a screen reader announces, exactly as it is when he is drawn alone. A learner should hear
the mascot's state, not an inventory of the furniture.
