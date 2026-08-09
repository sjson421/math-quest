## 1. The scene contract, before any item is drawn

- [x] 1.1 Add `references/room.md` to `.agents/skills/mascot-design/`: the `0 0 320 200`
      canvas, Pip's canvas nested at `(60, 0)` at the same unit scale, the `y 168` horizon and
      why it sits above the ground shadow rather than through it, the six anchors
      (`room-horizon`, `pip-origin`, `rug-center`, `wall-center`, `floor-left`, `floor-right`),
      the four slots and what each holds, the seven-step paint order with Pip as one opaque
      step, the fixed surface colours and why the wall is cool while Pip is warm, the rule that
      a decoration's family must differ from the surface it sits against, and the 148 px size
      floor.
- [x] 1.2 Update `SKILL.md` — including its frontmatter `description`, which names only Pip's
      cosmetics today and will not match room work — to list the new reference and say the
      contract covers two surfaces; update `references/checklist.md` with the decoration
      acceptance pass (behind Pip, inside the room box, legible at 148 px, family differs from
      its surface, no back/front fragments, no motion).
- [x] 1.3 Mirror every changed file byte-identically into `.claude/skills/mascot-design/` and
      verify with `diff -rq`.

## 2. One catalogue, two kinds

- [x] 2.1 Add `src/cosmetics/types.ts` holding `MascotState`, `CosmeticSlot`, `RoomSlot`,
      `Equipped`, `Placed`, `Fragment`, `Cosmetic`, `Decoration`, `CatalogueItem` — no JSX, so
      `index.tsx` and `room.tsx` can both import it without a cycle.
- [x] 2.2 Add `kind: 'cosmetic'` to the five existing cosmetics; move the type declarations out
      of `index.tsx` and re-export everything from it so no importing module changes.
- [x] 2.3 Export `catalogue` (both kinds), `itemById`, and `ROOM_SLOTS` from `index.tsx`; keep
      `cosmetics`, `cosmeticById` and `wornIn` working unchanged.
- [x] 2.4 Extend `catalogue.test.tsx`: ids unique across the whole catalogue, each item's slot
      valid for its kind, `CosmeticSlot` and `RoomSlot` disjoint — each paired with a synthetic
      failing fixture, per the file's existing habit.

## 3. The room surface, with Pip in it

- [x] 3.1 Add `src/components/Room.tsx`: the wall, floor and horizon, the four slots painted in
      contract order, and `Mascot` nested in a `<g transform="translate(60 0)">`. Props are
      `state`, `height`, `equipped` and `placed`; it reads no store.
- [x] 3.2 Resolve a placed id through the catalogue inside `Room`, so an id the catalogue has
      retired draws nothing in exactly one place — the rule `wornIn` already follows.
- [x] 3.3 Add `src/components/Room.test.tsx`: the surface draws with nothing placed; a placed
      decoration draws; an unknown placed id draws nothing while the rest of the room does;
      Pip's markup follows every decoration's, which is the paint order; exactly one accessible
      name in the output.

## 4. The five decorations

- [x] 4.1 Add `src/cosmetics/room.tsx` with the blossom rug (`rug`, 50) and the mint round
      window (`wall`, 80), authored against the anchors from task 1.1.
- [x] 4.2 Add the mint potted plant (`left`, 100) and the blossom bunting (`wall`, 110) — the
      bunting being the second `wall` item, so slot replacement is real.
- [x] 4.3 Add the lilac bookshelf (`right`, 130), the tallest item, and confirm it rises up the
      wall without meeting Pip's rendered extent at `x 234`.
- [x] 4.4 Extend the catalogue checks over decorations too: strokes 2.5–3, no `originX`/
      `originY`, no remote reference, no pasted family hex, and no `back`/`front` fragment.

## 5. Placement on the progress record

- [x] 5.1 Add `room: Placed` to `Progress`, its `{}` default in `initialProgress()`, and its
      shape check in `reconcile()`; widen `isRecord` to one shared record guard serving both
      `equipped` and `room`.
- [x] 5.2 Route `equip` and `unequip` in `src/lib/wardrobe.ts` on the item's `kind`, writing to
      `equipped` or `room`; rename `CosmeticStanding` to `ItemStanding` and `'worn'` to
      `'in-use'`, updating every call site.
- [x] 5.3 Rename the store actions to `buyItem` / `equipItem` and widen `unequipSlot` to take
      either slot union; keep persisting only on a non-null result.
- [x] 5.4 Extend `src/lib/wardrobe.test.ts`: buying a decoration spends the same coins into the
      same inventory; placing an unowned decoration is refused; placing into an occupied slot
      replaces; clearing an empty slot is refused; a cosmetic never lands in `room` and a
      decoration never lands in `equipped`.
- [x] 5.5 Extend `src/store/progress.test.ts`: a record with no `room` loads empty; a malformed
      `room` value loads empty while the rest of the record survives; a valid `room` round-trips;
      an unknown placed id is retained in the record.

## 6. The shop

- [x] 6.1 Split `Shop.tsx` into a wardrobe section (two-column grid, `Mascot` at 92) and a room
      section (full-width cards, `Room` at 194 px so Pip clears the 92 px size floor), each card
      previewing only its own item.
- [x] 6.2 Map `ItemStanding` to kind-specific wording — Wear / Take off against Place / Put
      away — and retitle the screen and the home entry label so neither says "wardrobe" for a
      shop selling both.
- [x] 6.3 Extend `src/components/Shop.test.tsx`: both sections render, each decoration is
      previewed in a room rather than on Pip, a decoration's action wording is the room's, and
      an owned id the catalogue does not contain is offered nowhere in the shop.

## 7. The home screen

- [x] 7.1 Replace the bare `Mascot` in `Home.tsx` with `Room` at 148 px tall, passing
      `progress.equipped` and `progress.room`; confirm Pip's rendered size is unchanged and
      nothing below the section moves.
- [x] 7.2 Confirm `api/progress.ts` and `src/lib/sync.ts` have zero diff, as in 16a.

## 8. Verification

- [x] 8.1 `npm test` green, `npm run build` clean (`tsc -b`, not `tsc --noEmit`), `npm run lint`
      with only the three known `Settings.tsx` warnings.
- [x] 8.2 Browser validation per `docs/environment.md`: a Playwright script from a scratch
      directory against `npm run dev`, seeding IndexedDB with coins and an owned decoration —
      buy, place, replace within a slot, put away, and reload to confirm placement persisted.
- [x] 8.3 Take one 375 px screenshot at the end of the green run, look at it, and say what the
      home screen and the shop actually looked like — the assertions cannot check that.

## Not a task here

`docs/roadmap.md` carries uncommitted user-owned edits in this session, so item 16's checkbox
is **not** ticked by this change and the file is excluded from staging. Report it at ship time
so the roadmap edit is the user's to make.
