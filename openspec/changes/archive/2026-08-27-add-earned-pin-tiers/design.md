## Context

See proposal.md — Why. The constraints that shape the approach:

- `store/progress.ts` imports `lib/checkpoint.ts`, so anything the store calls must take a
  **structural** record type and receive `UNLOCK_THRESHOLD` as an argument rather than
  importing it back. `checkpoint.ts` documents both, and the same applies here.
- `Character` deliberately takes **no state argument anywhere**, so that a character cannot
  own motion or drift into a second expression set. Any tiering must not break that.
- Every cosmetic is drawn from the wearer's `anchors`, never from literal coordinates,
  because that is what lets three bodies share one wardrobe.
- The smallest rendered size is 92px, and the shop draws one mascot per catalogue item at it.
  This is where the previously withdrawn pin failed.

## Goals / Non-Goals

Beyond the proposal's scope, at design level:

**Goals**
- Net less machinery than before: removing a slot should remove code, not add a parallel one.
- One escalation vocabulary shared by all three characters, so the ladder reads as a system
  rather than three unrelated sets of drawings.

**Non-Goals**
- Not a general "cosmetic tiering" mechanism. Five tiers, one place, no framework.
- No reduced-motion work beyond what a tier needs to read statically; the app-wide gap is a
  separate concern.

## Decisions

### The tier is a transition, not a stored flag

`crossedPinTier({ before, after, threshold })` mirrors `crossedStageCheckpoint()`: it compares
the record before and after one persisted lesson and returns an upgrade only if that lesson
caused the crossing.

*Why over a `pinTierSeen` field:* a stored flag needs a reconcile rule, a default for records
that predate it, and a decision about what a restored record should re-announce — the exact
bookkeeping `crossedStageCheckpoint()` was written to avoid. A transition gets "fires once"
and "a restored record announces nothing" for free, and adds no field to the sync blob.

*Trade-off:* a threshold crossed on another device is never announced anywhere. That is the
right direction — announcing it on restore would celebrate work the learner did not just do.

### Five tiers are a composed frame, not fifteen drawings

`Character` gains `charms: readonly [ReactNode ×5]` — a tuple, so "exactly five" is checked by
the compiler — built from one `charmFrame()` helper plus the character's existing charm at the
centre. The frames escalate: nothing, a backing disc, a rim, ribbon tails, the full rosette.

*Why over a `charm(tier)` function:* a function is a state argument in all but name, and
`Character`'s contract turns on there being none. A tuple is data, and it makes a character
with four tiers a type error rather than a runtime hole.

*Why over fifteen independent drawings:* three characters × five tiers is fifteen things to
keep in step, and the codebase's whole cosmetic argument is that layers over shared geometry
beat separate drawings. It also keeps each character's identity at the centre of every tier,
which fifteen free-hand drawings would not guarantee.

`Character` also gains `charmTone: Tone` so the frame is built in that character's own family
— butter, powder, mint — rather than one shared colour. `characters.tsx` already argues that
the three charms must be told apart by colour before shape at 92px; a single frame colour
would undo that at four of the five tiers.

### `pin` leaves `CosmeticSlot` entirely

Rather than keeping the slot and refusing to sell into it. The union shrinks to four, and
`Equipped`, `CATEGORY` in the shop, and the wardrobe's buy/equip/unequip path for pins all
follow from the type.

*Why:* a slot nothing can occupy is a slot every future reader has to ask about. Removing it
means the compiler enforces the rule instead of a comment. `anchors.pin` stays — it is where
the charm hangs, which is still true.

### The upgrade screen extends the flow that exists

`CompletionView` gains a third value and `completionAction()` a third step, so one Continue
tap walks lesson result → stage checkpoint → pin upgrade → exit.

*Why over a modal or a Home-screen surprise:* the sequencing decision is already pure and
already tested in `checkpoint.test.ts`, precisely so a component does not decide it. A second
mechanism would put the same decision in two places.

## Risks / Trade-offs

- **Tier 5 is too big and clips at the celebration** → The charm wrapper scales 1.25 and spins
  a full turn; the current pin already reaches y 197 on Mochi, the lowest anchor of the three.
  Re-run the bounds check for tier 5 on all three characters and shrink the frame — never move
  an anchor, which every other item reads.
- **Tier 5's centre is illegible at 92px** → The reviewed rosette holds a 5.5-unit centre;
  Pip's star is 22 units. Either the frame grows or the centres are drawn compact, decided by
  looking at a 92px render rather than by arithmetic. This is the exact failure that withdrew
  the previous pin.
- **Adjacent tiers look the same at 92px** → Four escalation steps in a ~30-unit badge is
  tight. Each step must change the silhouette, not just add interior detail, since interior
  detail is what blurs first.
- **A learner who bought `blossom-rosette` loses it** → It shipped for hours, and the id
  survives in their inventory under the existing "kept, not drawn" requirement. Accepted
  rather than building a refund path for a window that small.

## Migration Plan

None required. No progress field is added, `reconcile()` is untouched, and `SCHEMA_VERSION`
does not move. A stored `equipped.pin` survives as a key nothing reads, which is what already
happens to any unknown id — covered by an existing requirement and an existing test.

Rollback is reverting the commit: no data written under the new code is unreadable by the old.
