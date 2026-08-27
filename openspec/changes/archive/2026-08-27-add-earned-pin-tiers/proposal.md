## Why

The `pin` slot holds the character's signature charm — Pip's star, Mochi's fish, Taro's lily
pad — and until now the only way to change it was to buy a cosmetic that replaced it. That is
backwards for what a pin is. A pin should say **how far the learner has come**, which is
something earned rather than bought, and it should arrive with a moment rather than a
transaction.

Coins already buy looks that mean nothing about progress: a hat, a rug, a different creature.
Nothing in the app currently shows the shape of the whole journey. The pin is the natural
place for it, and it is the one slot already reserved on every body.

## What Changes

- **BREAKING** `pin` is removed from `CosmeticSlot`. Pins are no longer bought, owned, or
  equipped, and `Equipped` no longer carries a `pin` key.
- **BREAKING** `blossom-rosette` leaves the catalogue. Its geometry is reused as the tier-5
  frame rather than discarded. A record that bought it keeps a dead inventory id, which
  nothing reads — there is no refund path and no migration.
- Every character's charm gains **five tiers**, from today's charm at tier 1 to that same
  charm mounted in a rosette at tier 5. Each character's frame is drawn in its own charm's
  colour, so the three ladders stay told apart by colour before shape at 92px.
- The tier is **derived, never stored**: the count of skills at or past
  `UNLOCK_THRESHOLD`, mapped through five thresholds. An absolute count, so shipping new
  content never demotes a learner.
- Finishing a lesson that crosses a threshold shows a **one-time upgrade screen** after the
  lesson result, ahead of exit and after a stage checkpoint if both land together.

## Capabilities

### New Capabilities
- `pin-progression`: what the pin tier is, what earns each of the five, that it is derived
  rather than stored, and that crossing a threshold is announced exactly once.

### Modified Capabilities
- `cosmetic-wardrobe`: a cosmetic declares one of **four** slots rather than five; the pin is
  no longer something a cosmetic can occupy. The character's charm is no longer describable
  as "the pin slot's default", because there is nothing left to default against.
- `stage-checkpoints`: the requirement owning the post-lesson sequence gains a third step, so
  one Continue tap sequences lesson result → stage checkpoint → pin upgrade → exit, and a
  lesson earning only a pin still shows one.

## Non-goals

- **No new progress field and no migration.** The tier is a function of mastery already
  stored, and the upgrade fires on a before/after transition, the way
  `crossedStageCheckpoint()` already does.
- **No refund** for a learner who bought `blossom-rosette` in the hours it shipped.
- **No second currency, no pin shop, no pin selection.** A learner does not choose their
  pin; there is exactly one per character per tier.
- **No change to what a lesson pays, to mastery, or to unlocking.** A pin is presentation.
- **No sixth tier and no per-unit or per-stage pins.** Five, across the whole course.

## Impact

- **Curriculum stages/units/skills**: none. No generator, manifest entry, or skill id is
  touched. This is presentation and progress-reading only.
- **New capability infrastructure**: none of the rendering or input kind. The tier reuses
  `ProblemView`-independent mascot geometry and the existing `Charm` motion wrapper.
- Code: `src/lib/pin.ts` (new), `src/lib/checkpoint.ts` (a third completion view),
  `src/cosmetics/{types,characters,index}.tsx`, `src/components/{Mascot,Shop,Lesson,Room,
  StageCheckpoint}.tsx`, `src/components/PinUpgrade.tsx` (new), `src/store/progress.ts`,
  `src/App.tsx`.
- Progress contract: **preserved**. `reconcile()` is unchanged; a stored `equipped.pin`
  survives as a key nothing reads, which is the existing behaviour for any unknown id. The
  sync blob stays opaque and no schema version moves.
- Docs: the `mascot-design` skill in both mirrors, and README's design notes.
