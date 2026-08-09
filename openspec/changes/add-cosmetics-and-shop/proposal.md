## Why

Coins have been accumulating since lesson mechanics shipped and buy nothing. They are
written by `completeLesson` and read in exactly two places — the home header and the
settings summary — so the only reward the learner can act on is the number going up. This is
the first half of roadmap item 16, and the half that makes the currency mean something.

The groundwork is already laid on both sides. `Mascot.tsx` is layered SVG for exactly this
reason, and `mascot-design` (item 15) settled the slot contract, the palette, and the render
order **before** any cosmetic existed — that skill states outright that its slot list is a
contract for future work and that item 16 owns the renderer. On the other side,
`progress-sync` already requires a push after "a purchase", a clause written in anticipation
of a purchase that could not yet happen.

**No curriculum stage, unit, or skill id is in scope.** No generator is added, changed, or
removed, and the manifest is untouched.

## What Changes

- The progress record gains `inventory` (owned cosmetic ids, in purchase order) and
  `equipped` (slot → cosmetic id). Both flow through `reconcile()` so a backup written
  before cosmetics existed still loads, and both ride the existing opaque sync round trip
  with no endpoint change.
- A cosmetic catalogue — id, slot, display name, price, and geometry — authored against the
  `mascot-design` contract in view-box units.
- `Mascot.tsx` gains a cosmetic renderer implementing the five slots and the ten-step render
  order, including the back/front fragment split that lets a hat crown pass behind the ears
  while its brim passes in front. What Pip wears arrives as a prop; the component reads no
  store.
- A shop screen reached from the coin stat on the home header: browse, buy with coins, and
  equip or unequip per slot.
- Purchase and equip decisions live in a pure module under `lib/`, because component tests
  render first paint in node with no DOM and nothing behind a tap is reachable from a test.
- `docs/roadmap.md` records item 16's two ordered increments and leaves its checkbox
  unchecked, since the room is still outstanding.

## Capabilities

### New Capabilities

- `cosmetic-wardrobe`: what a cosmetic is, how one is owned, bought, equipped, and drawn on
  Pip — the slot rule, the render order, the price-against-earn-rate constraint, and what
  happens to an id the catalogue no longer knows.

### Modified Capabilities

- `progress-sync`: "Push after meaningful progress" already names a purchase as a change
  worth preserving but has no scenario for one, because none could occur. The requirement
  gains that scenario now that purchases are real.

## Impact

- `src/store/progress.ts` — two fields on `Progress`, their defaults in `initialProgress()`,
  their handling in `reconcile()`, and the store actions that buy and equip.
- `src/components/Mascot.tsx` — the renderer, replacing the hard-coded signature star with
  the `pin` slot's default. Pip's colour constants move out to a shared module so the
  catalogue can borrow them without importing the component that imports it.
- `src/components/Home.tsx`, `src/App.tsx` — the coin stat becomes the shop entry point and
  the screen union gains the shop.
- `src/components/Lesson.tsx` (two call sites) and `src/components/StageCheckpoint.tsx` —
  the other places the learner's own Pip is shown, which must wear what is equipped.
- New: a cosmetic catalogue module, a pure wardrobe module under `src/lib/`, and a shop
  component, each with tests.
- `docs/roadmap.md` — item 16's increments.
- `.agents/skills/mascot-design/` and its byte-identical `.claude/` mirror — the contract
  says in three places that no renderer exists and that item 16 owns building one. This is
  item 16; those sentences stop being true and are updated in the same change.
- **Unaffected by design**: `api/progress.ts` stores the blob opaquely and must not need a
  line changed; `src/lib/sync.ts` is a store subscriber, so a purchase pushes without any
  new wiring.

## Non-goals

- **The decoratable room** — the second increment of item 16. Item 16's checkbox stays
  unchecked until it lands.
- **A `pin` cosmetic.** The renderer implements the slot and its replacement path, but the
  catalogue ships none: `mascot-design` calls replacing Pip's signature star a deliberate
  identity change rather than a free slot, and this increment is about mechanism.
- **Earning cosmetics any way other than buying them.** No streak rewards, no checkpoint
  unlocks, no gifts.
- **Re-pricing or changing the coin award.** The shop is priced against the rate that exists
  (15 coins for a mastery-gaining lesson, 8 for a repeat); that rate is not touched.
- **Cosmetics reacting to lesson events** — no "Pip wears the party hat when you level up".
  Items respond to Pip's six existing states and nothing else.
