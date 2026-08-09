## Context

See `proposal.md` — Why. The constraints that actually shape the approach:

- **`reconcile()` merges stored over defaults per key** and shape-checks `inventory` and
  `equipped` rather than spreading them blindly (`store/progress.ts`), because `{ ...'ab' }`
  is `{ 0: 'a', 1: 'b' }` and would survive as junk. A third field must slot into that shape.
- **The sync endpoint is opaque by contract** and `lib/sync.ts` is a store subscriber. Both
  ended 16a with zero diff and must again.
- **Component tests render first paint to a string, in node, with no DOM** (`docs/testing.md`).
  No handler fires, so anything behind a pointer is unreachable from a test.
- **`mascot-design` is now a description of code, not intent** — its ten-step order is what
  `Mascot.tsx` walks. A room contract added to it must be equally checkable.
- **16a's finding**: a geometry decision made per item cannot be taken back once items exist.
  The scene's canvas, anchors and paint order are therefore settled here, before any
  decoration is drawn.

## Goals / Non-Goals

**Goals:**

- One catalogue, one purse, one inventory — and a type that makes a cross-kind slot a
  compile error rather than a runtime surprise.
- The room's paint order and Pip's ten steps can never disagree, by construction.
- Placement is testable without a DOM.
- Pip's rendered size on the home screen is unchanged by gaining a room.
- `api/progress.ts` and `src/lib/sync.ts` end the change with zero diff.

**Non-Goals** (beyond the proposal's):

- No new motion vocabulary. A decoration is still.
- No per-item accessible names; the room inherits Pip's single one.
- No generic "ownable thing" abstraction beyond the two-arm union the catalogue needs.

## Decisions

### The catalogue is one discriminated union, split across three files

```ts
// types.ts — no JSX, so both catalogues can import it without a cycle
export type CosmeticSlot = 'back' | 'headwear' | 'face' | 'neck' | 'pin'
export type RoomSlot = 'rug' | 'wall' | 'left' | 'right'

export type Cosmetic = BaseItem & {
  kind: 'cosmetic'
  slot: CosmeticSlot
  render?: Fragment; back?: Fragment; front?: Fragment
}

export type Decoration = BaseItem & {
  kind: 'decoration'
  slot: RoomSlot
  /** No state argument: a decoration reacts to nothing, and the type says so. */
  render: () => ReactNode
}

export type CatalogueItem = Cosmetic | Decoration
```

`src/cosmetics/types.ts` holds the unions, `index.tsx` keeps the cosmetics and exports the
combined `catalogue` and `itemById`, and `room.tsx` holds the decorations. Types go in their
own module because `index.tsx` must import the decorations to combine them while `room.tsx`
must import the types — a cycle if the types stay in `index.tsx`. `index.tsx` re-exports
everything, so every existing `from '../cosmetics'` import is unchanged.

`Decoration.render` is required and takes no argument. A cosmetic's fragment takes
`MascotState` because the ears move on their own; nothing in a room does, and a signature
that cannot receive the state is how the "reacts to nothing" non-goal is enforced rather
than remembered.

*Rejected:* a second catalogue module with its own `buy`. It duplicates the purse and the
inventory, which is exactly what the roadmap's "a kind field on one catalogue, not a second
catalogue" rules out.

*Rejected:* `slot: CosmeticSlot | RoomSlot` with `kind` as a separate flag. The pair can then
disagree, and nothing catches `{ kind: 'decoration', slot: 'face' }`.

### The two slot unions are disjoint, and a test holds the line

`unequip(progress, slot)` takes a slot and routes to `equipped` or `room` by membership in a
`ROOM_SLOTS` set. That works only while no string is in both unions, which is true today and
is the kind of invariant that breaks silently when someone adds a `back` shelf. A catalogue
test asserts the intersection is empty, paired with a synthetic overlapping pair proving the
assertion can fail.

*Rejected:* `unequip(progress, kind, slot)`. Type-safe, but every call site then has to carry
a discriminant it already implied by naming the slot, and the store action grows a parameter
that exists only to restate the one it already has.

### The room canvas contains Pip's at the same unit scale

```
  0 0 320 200                                 Pip's 200×200 canvas at (60, 0)
  ┌──────────────────────────────────────────────────────┐ y 0
  │                  ● wall-center (160, 30)             │
  │                                                      │
  │              ╭────────────────────────╮              │ y 46  ear tops
  │              │   Pip, x 86–234        │              │
  │              │   head circle (160,112) r 57          │
  │              │                        │              │
  ├──────────────┴────────────────────────┴──────────────┤ y 150  room-horizon
  │ ● floor-left        ● rug-center       ● floor-right │
  │   (43, 150)           (160, 182)         (277, 150)  │
  └──────────────────────────────────────────────────────┘ y 200
   x 0          86                       234           320
```

Every number to the right of Pip's own is his plus 60. Sharing the unit scale is the whole
point: a decoration and a cosmetic are authored in the same units, `mascot-design`'s existing
"nothing smaller than about 6 units" limit means the same thing in both, and nothing is
scaled into place. Pip's canvas is *nested*, never resized — `Room` renders `Mascot` inside a
`<g transform="translate(60 0)">`, which positions his whole canvas rather than transforming
anything inside it.

The horizon is placed so Pip's ground shadow — centre `(160, 180)`, `ry 7`, so `y 173–187` —
lands wholly on the floor. A horizon at his shadow's centre would have the shadow straddling
the join.

**It sits at `y 150`, and the first attempt at 168 was wrong.** 168 is where his head circle
ends, so the line met his chin exactly: the floor became a 32-unit stripe and the whole thing
read as a windowsill he was leaning on. At 150 he overlaps the floor and stands *in* the room.
Nothing about the numbers said so — the screenshot did.

Floor regions are symmetric: `x 0–86` on the left, `x 234–320` on the right, 86 units each,
which is where Pip's rendered extent ends on either side.

**`left` and `right` are two slots, not one slot with a side.** A bookshelf drawn against
`floor-right` has its geometry written at `x 277`; there is no side-agnostic form of it that
does not reintroduce a repositioning transform, which the contract forbids. The accepted cost
is that an item is authored for its side and cannot be moved across.

### Pip is one step in the room's order

Painted first to last:

1. wall surface
2. floor surface
3. `rug`
4. `wall`
5. `left`
6. `right`
7. **Pip** — his entire ten-step canvas, as a single step

This is the answer to the roadmap's "the only place their two paint orders can disagree":
they cannot, because the room never opens a gap inside Pip's ten. A decoration therefore
never obscures his face or a cosmetic, and no room item needs the back/front fragment split
that lets a hat crown pass behind his ears. `Decoration` has no `back`/`front` field at all,
so the split is unavailable rather than merely discouraged.

*Rejected:* a `foreground` slot in front of Pip. It buys one visual trick — a plant the
character stands behind — at the cost of putting décor over the face the app's whole tone
rests on, and every item in this catalogue reads correctly behind him.

### The palette's variables have to be forced into existence

`src/index.css` declares `@theme static` rather than a bare `@theme`.

Tailwind emits a theme variable only when some utility class references it. Cosmetics reach
the five colour families through `var()` from `palette.ts` rather than through a class, so
`--color-mint-soft` and `--color-powder-soft` — the two no utility happens to use — were
pruned from the stylesheet, and **a shape filled with a pruned variable renders unfilled**
rather than falling back. The room's wall was invisible for exactly this reason.

No shipped cosmetic hit it, by luck: the three `-soft` tints the wardrobe uses are the three
that `bg-blossom-soft`, `bg-lilac-soft` and `bg-butter-soft` keep alive. This change is the
first to want one of the other two.

**Nothing in the test suite can catch this.** vitest runs with `css: false`, which is the
same fact that made 16a abandon cross-checking the palette against the stylesheet — a pruned
variable and a present one are identical to a node test. `static` makes the failure
impossible instead of detectable, which is the right trade when the detector cannot exist.

### The surface is structure, and it is not for sale

Wall `powder.soft`, floor `butter.soft`, joined by a `powder.deep` horizon line: a pale cool
wall over a pale warm floor is the least vocabulary that reads as a room rather than a
coloured card. Two families appear, which is deliberate — `mascot-design`'s one-family rule
governs an *item*, and a surface that used one family would read as a block of colour with a
line through it.

The wall is deliberately **cool, because Pip is warm**. His head is `CREAM` outlined in
`CREAM_SHADE`, so a cream or blush wall would leave the character with almost no separation
from the surface behind him. That also rules out the tidier-sounding option of drawing the
surface in Pip's own two constants.

**A decoration's family must differ from the surface it sits against.** A powder window on a
powder wall is `#a8d8f0` on `#d6ecf9` — a base against its own soft tint, which survives a
mockup and disappears on a phone. So no `wall` item is powder and no floor item, including
the rug, is butter. This is a rule of the contract rather than a fact about these five items,
because it is the constraint the sixth one will forget.

The surface is fixed. Making the wall purchasable would mean a decoration that changes the
canvas every other decoration is authored against, which is the reversibility trap 16a named.

### Placement is a slot map on the record, and free placement is refused

```ts
/** Room slot → the decoration standing in it. An absent slot means nothing there. */
room: Partial<Record<RoomSlot, string>>
```

Reconciled exactly as `equipped` is: `room: isRecord(stored.room) ? { ...stored.room } : {}`.
`isRecord` is currently typed `value is Equipped` and is widened to a shared record guard so
one predicate serves both fields.

Coordinates were the alternative and lose twice over. Dragging is behind a pointer, so the
placement decision would be unreachable from a node component test — the reason `submit.ts`
and `wardrobe.ts` exist at all. And `{ id: { x, y } }` needs per-entry validation in
`reconcile()`, which is the shape AGENTS.md forbids for stored skills: a merge that picks
named fields out of a stored object breaks the sync contract.

### `standing` renames `worn` to `in-use`

`CosmeticStanding` becomes `ItemStanding`, and `'worn'` becomes `'in-use'`. A rug is not
worn, and a shop card captioned "Worn" under a picture of a rug is the kind of wrong that a
type rename prevents once instead of a comment preventing per call site. The shop maps the
standing to kind-specific words — Wear / Take off for a cosmetic, Place / Put away for a
decoration — which is the one place the two kinds legitimately read differently.

### The room replaces the home mascot, at exactly today's size

`Home` renders the room 148 CSS pixels tall. The room's box is 200 units tall and Pip's canvas
fills that height, so **Pip renders at 148 px — precisely what he renders at today** — and the
room extends 60 units either side, 237 px wide overall. The change adds width inside the
existing centred section and no height at all, so nothing below it moves.

The other four `Mascot` call sites keep the bare mascot: `Lesson` at 92 and 190,
`StageCheckpoint` at 190, and each wardrobe shop card at 92. A room around the mascot during a
lesson would be decoration competing with a problem.

### Room shop cards span the grid

The grid is `px-5 … grid-cols-2 gap-4` with `p-3` cards, so at 375 px a wardrobe card holds
`(375 − 40 − 16) / 2 − 24 ≈ 135 px` of content and renders Pip at the 92 px floor. A room card
at that width would render the room `135 × 200/320 ≈ 84 px` tall — and Pip inside it at 84 px,
*below* the floor the contract sets. So the room section uses full-width cards: `375 − 40 − 24
= 311 px` of content, the room `311 × 200/320 ≈ 194 px` tall, Pip at 194. That keeps 16a's
property that the shop card doubles as the acceptance check, rather than shipping a preview too
small to judge.

The size floor for a decoration is therefore **the room at 148 px tall** — the home screen, and
the smallest place it appears. That is a 0.74 scale against the cosmetics' 0.46, so the
existing 6-unit detail limit is comfortably met; strokes stay 2.5–3 units so one catalogue
check covers both kinds.

### The catalogue: five decorations, priced on 16a's measured rate

| Decoration | Slot | Family | Price | Why it is in this set |
| --- | --- | --- | --- | --- |
| Blossom rug | `rug` | `blossom` | 50 | The `rug` case — flat on the floor, under Pip's shadow |
| Round window | `wall` | `mint` | 80 | The `wall` case, and the item that most makes it read as a room |
| Potted plant | `left` | `mint` | 100 | Stands on the floor, base at `floor-left` |
| Blossom bunting | `wall` | `blossom` | 110 | A second `wall` item, so slot replacement is real rather than theoretical |
| Lilac bookshelf | `right` | `lilac` | 130 | The tallest item; proves a floor item can rise up the wall without meeting Pip |

Two of these were settled while drawing rather than in the table. The plant and the bookshelf
swapped families — mint leaves and a lilac shelf, rather than the reverse — because a lilac
plant is a colour choice with no reason behind it, which is how a palette stops being one. And
the bunting began as a star garland: a five-point star is a ten-segment path about 7 units
across, which is 5 CSS pixels at the room's 148 px floor. A triangle is three segments and
still reads there.

Five items, four slots, `wall` occupied twice. The families are not one each: powder and
butter are spent on the surface, so the items draw from the remaining three. Spreading them
evenly would have put an item against its own background, which is the rule above.

**Pricing.** The measured rate is unchanged and untouched: 15 coins for a mastery-gaining
lesson, 8 for a repeat, so three lessons in a sitting pay 45. The room totals 470 — the same as
the wardrobe, which is the honest answer to "what should a room cost" when the wardrobe is the
only comparison that exists. The cheapest room item is 50 against the wardrobe's 40, so the
first thing a learner can afford is still a cosmetic. Both sets together are 940 coins, about
three weeks at three lessons a day, which keeps the shop from emptying.

## Risks / Trade-offs

- **Four slots is a small room, and an item cannot move sides** → Accepted, and stated in the
  contract rather than discovered. Slots are what make placement testable and `reconcile()`
  one line; a fifth slot is additive later, and moving an item across sides is not.
- **The home screen changes for every learner, including one who owns nothing** → Intended.
  An empty room is a wall, a floor and Pip, at Pip's existing size; and the shop sells into a
  room, so a room nobody can see is a room nobody can shop for.
- **Renaming `worn` to `in-use` touches shipped tests** → It is a rename with no behaviour
  change, and `wardrobe.test.ts` plus `Shop.test.tsx` fail loudly if a call site is missed.
- **Two shop sections with different card widths** → The alternative is a preview below the
  size floor the contract sets, which would make the shop card stop being the acceptance check.
- **A third field on the record** → Additive with an empty default, shape-checked, and never
  read by the server. Same shape as the two 16a added.
- **The shop now runs ten animated Pips, not five** — one per wardrobe card plus one inside
  each room preview, each with its own blink timer and float loop. 16a named this and said the
  answer, if it ever reads as heavy, is a still preview, which stays a local change to one
  component. It is not made here: a static preview is a different thing on screen, and this
  change has no measurement saying it is needed. Flagged so the next person does not have to
  rediscover that the count doubled.

## Migration Plan

None required. `room` is additive with an empty default, `reconcile()` supplies it for any
record that lacks it, and the server stores the blob without interpreting it. A device on the
previous build ignores the field — it passes through `reconcile`'s spread and is never read —
so rollback is reverting the commit with no data loss.
