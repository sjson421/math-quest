## 1. The tier and its transition

- [x] 1.1 Add `src/lib/pin.ts`: `PinTier`, the five thresholds, `pinTier(record, threshold)`
      and `crossedPinTier({ before, after, threshold })`. Structural record type and injected
      threshold, matching `src/lib/checkpoint.ts` — it must not import `store/progress.ts`.
- [x] 1.2 Add `src/lib/pin.test.ts`: each threshold boundary exactly (one below, on, one
      above), the fire-once transition, that a record already past a threshold before the
      lesson yields no upgrade, and that adding unpractised skills does not lower a tier.
- [x] 1.3 Extend `CompletionView` and `completionAction()` in `src/lib/checkpoint.ts` with the
      third step, and cover the four routes in `src/lib/checkpoint.test.ts`: neither, only a
      checkpoint, only an upgrade, both in order.

## 2. Five tiers of charm

- [x] 2.1 In `src/cosmetics/types.ts`, replace `Character.charm: ReactNode` with
      `charms: readonly [ReactNode, ReactNode, ReactNode, ReactNode, ReactNode]` and add
      `charmTone: Tone`. Keep the no-state-argument rule intact and say why in the comment.
- [x] 2.2 Add `charmFrame(tier, tone)` beside `bow()` and `muff()` in
      `src/cosmetics/index.tsx`, composing the four frames from the `blossom-rosette`
      geometry. Draw from the wearer's `pin` anchor, never from literals.
- [x] 2.3 Declare all five tiers for Pip, Mochi and Taro in `src/cosmetics/characters.tsx`,
      tier 1 being today's charm unchanged.
- [x] 2.4 Extend `src/cosmetics/catalogue.test.tsx`: every character declares five tiers, each
      tier draws, each renders the character's own charm, stroke widths and palette rules hold
      at every tier.

## 3. Pins leave the wardrobe

- [x] 3.1 Drop `'pin'` from `CosmeticSlot`, remove `blossom-rosette` from the catalogue, and
      let the compiler find the rest (`CATEGORY` in `Shop.tsx`, `Equipped`, wardrobe paths).
- [x] 3.2 Update `src/lib/wardrobe.test.ts` to four slots, and confirm the existing
      "unknown catalogue id is kept, not drawn" test still covers a stored `pin` key.

## 4. Drawing the tier

- [x] 4.1 `Mascot.tsx`: take `tier`, drop the `pin` slot lookup, render `who.charms[tier - 1]`
      inside the existing `Charm` wrapper. Update `Charm`'s doc comment.
- [x] 4.2 Thread `tier` along the path `character` already takes — `App.tsx` ×2, `Room.tsx`,
      `Lesson.tsx` ×2, `StageCheckpoint.tsx`, `Shop.tsx` ×2 — including the loading mascots,
      so the pin does not flicker at first paint.
- [x] 4.3 Rewrite the pin-slot block in `src/components/Mascot.test.tsx` as a tier block: each
      tier draws, the tier follows the prop, and no character shows another's charm.

## 5. The fanfare

- [x] 5.1 Add `pinUpgrade` to `LessonOutcome` in `src/store/progress.ts`, computed from the
      same before/after pair `crossedStageCheckpoint()` already uses.
- [x] 5.2 Add `src/components/PinUpgrade.tsx` modelled on `StageCheckpoint.tsx`: the mascot
      celebrating at the new tier, one Continue action, the existing `success()` cue.
- [x] 5.3 Sequence it in `Lesson.tsx` behind `completionAction()`. The ordering is covered in
      `src/lib/checkpoint.test.ts` rather than in `Lesson.test.tsx`: component tests render
      first paint only, so a sequence advanced by taps is unreachable from one — which is why
      `completionAction()` is pure. The screen itself is covered by
      `src/components/PinUpgrade.test.tsx`.

## 6. Acceptance pass — looking, not asserting

- [x] 6.1 Render all five tiers on all three characters at **92px and 190px** and look at
      each. Every tier must be distinguishable from its neighbours and legible at 92px. This
      is the gate that withdrew the previous pin; fix geometry until it passes.
- [x] 6.2 Re-run the celebration bounds check for tier 5 on all three characters. If the
      1.25 scale and full spin cross the 200 view box, shrink the frame — never move an
      anchor.
- [x] 6.3 Check tier 5 against all six mascot states, and against the thinking dots and sleep
      marks, per `mascot-design/references/checklist.md`.

## 7. Documentation

- [x] 7.1 Update the `mascot-design` skill in **both** mirrors, kept byte-identical: the slot
      table and render order in `references/layers.md`, the `charm` row in
      `references/characters.md`, the pin bullet in `references/checklist.md`.
- [x] 7.2 Update README's design notes: pins are earned, the wardrobe is four slots.

## 8. Verification

- [x] 8.1 `npm test`, `npm run build`, `npm run lint` all green.
- [x] 8.2 Real-app browser validation per `docs/environment.md`. Verified in Chromium at
      375×812: all five tiers draw at their thresholds (and 14 and 149 draw the tier below);
      the shop offers no pin category and no rosette; a lesson crossing a threshold shows the
      upgrade once; a second lesson at the same tier announces nothing and exits to the tree.
      **Not** browser-verified: a lesson crossing a stage boundary *and* a threshold together
      — that ordering is covered by `completionAction()`'s tests, since reaching it in the app
      needs a seeded record that completes a whole stage on the same lesson.
