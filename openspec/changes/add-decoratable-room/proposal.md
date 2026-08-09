## Why

Coins buy five things Pip can wear and nothing else. Item 16's first increment shipped the
wardrobe, the shop and the slot renderer, and deliberately left the room — so the coin sink
is one screen deep and the mascot still floats on a bare cream background. This is the
second and final increment of roadmap item 16; its checkbox stays open until this lands.

The groundwork is the wardrobe's. `src/cosmetics/` already holds the items, the palette and
the slot union, and `src/lib/wardrobe.ts` already owns buying and equipping as pure
functions over the progress record. A room item is bought with the same coins into the same
`inventory`. What does not exist is a **scene**: a second coordinate space with its own
anchors and paint order, and a place on the record to say what stands where.

**No curriculum stage, unit, or skill id is in scope.** No generator is added, changed, or
removed, and the manifest is untouched.

## What Changes

- **One catalogue, discriminated on `kind`.** `src/cosmetics/` gains a `room` arm beside the
  existing Pip arm: shared `id`, `name` and `price`, and a slot union that varies by arm, so
  a room item cannot be equipped into `face` and a cosmetic cannot be stood on the floor.
  Buying stays one function over the whole catalogue.
- **The scene contract is written before any item is drawn.** `mascot-design`'s references
  gain the room's view box, its named anchors, its four slots, and its paint order — the
  same order of work item 15 established and 16a's cape validated, because a geometry
  decision made per item cannot be taken back once items exist.
- **A room surface** composing item layers the way `Mascot.tsx` composes Pip's, with Pip's
  own `0 0 200 200` canvas nested into it at a declared offset and unit scale. Pip paints as
  **one opaque step**: nothing in the room interleaves with his ten, which is what keeps the
  two paint orders from disagreeing.
- **`room` on the progress record**, a slot → item id map beside `equipped`, shape-checked
  in `reconcile()` exactly as `inventory` and `equipped` are, and riding the same opaque sync
  round trip with no endpoint change.
- **Room items in the shop**, priced against the same measured earn rate 16a used — 15 coins
  for a mastery-gaining lesson, 8 for a repeat, so three lessons pay 45.
- **The room replaces the standalone mascot on the home screen**, which is the first time
  the wardrobe and the room are on screen together. The other four `Mascot` call sites —
  two in `Lesson`, one in `StageCheckpoint`, one per shop card — keep the bare mascot.
- `docs/roadmap.md` records item 16 complete. **Its working tree is user-owned in this
  session and is therefore not staged here**; the roadmap edit is called out at ship time
  rather than made silently.

## Capabilities

### New Capabilities

- `decorated-room`: what a room is — its fixed surface, its four placement slots, the paint
  order that puts every item behind Pip, how a decoration is placed and taken down, and how
  placement is carried on the progress record and survives a record that predates it.

### Modified Capabilities

- `cosmetic-wardrobe`: one requirement stops being true. "The shop is reachable from the coin
  balance" says the shop shows every catalogue *cosmetic*, states whether each is *worn*, and
  previews it *on Pip* — none of which describes a rug. It generalises to catalogue items
  previewed in the surface each belongs to.

  Deliberately **not** modified: the buying, ownership, unknown-id, slot and render-order
  requirements are all still exactly true of cosmetics. `decorated-room` states the room's
  own rules and cross-references rather than restating them, the way `cosmetic-wardrobe`
  already defers the sync round trip to `progress-sync`.

## Impact

- `src/cosmetics/index.tsx` — the `kind` discriminant, the room slot union, the room
  catalogue, and a room-aware `wornIn` counterpart.
- `src/lib/wardrobe.ts` — `equip`/`unequip` route on `kind` to `equipped` or `room`;
  `standing()` reads the right map. `buy()` is unchanged in shape.
- `src/store/progress.ts` — a `room` field, its default in `initialProgress()`, its shape
  check in `reconcile()`, and the store actions that place and clear.
- New: a room scene component and its tests; room items and their catalogue checks.
- `src/components/Home.tsx` — the scene replaces the bare mascot.
- `src/components/Shop.tsx` — two sections and a per-kind preview.
- `src/index.css` — `@theme static`, so every palette variable is emitted rather than only
  those a utility class happens to reference.
- `.agents/skills/mascot-design/` and its byte-identical `.claude/` mirror — the scene
  contract. `.gitignore` excludes `.agents/`, so those files are staged with `git add -f`.
- **Unaffected by design**: `api/progress.ts` stores the blob opaquely and must not need a
  line changed; `src/lib/sync.ts` is a store subscriber, so placement pushes with no new
  wiring. Both ended 16a with zero diff and must again.

## Non-goals

- **Free placement.** Items go in named slots, not at arbitrary coordinates. Dragging is
  behind a pointer, and component tests render first paint in node with no DOM, so a dragged
  position is a decision no test can reach — and a coordinate map would need the per-entry
  merge rule in `reconcile()` that AGENTS.md warns against for skills.
- **A purchasable wall or floor.** The surface is structure, not stock. Wall colour, floor
  finish and room size are fixed by the scene contract.
- **A room screen.** The scene lives where Pip already lives. `App`'s `Screen` union is
  untouched.
- **Room items in front of Pip.** Every slot paints behind him. A foreground slot would put
  décor over the character's face and is not needed by any item in this catalogue.
- **Back/front fragments for room items.** Pip is one step in the room's order; the split
  that lets a hat crown pass behind his ears has no counterpart here.
- **Items that react to lesson events.** A room item responds to nothing — not to Pip's six
  states, not to a streak, not to a checkpoint.
- **Re-pricing the wardrobe or changing the coin award.** Room prices are fitted to the rate
  that exists; that rate is not touched.
