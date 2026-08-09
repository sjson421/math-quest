## 1. Palette and catalogue

- [x] 1.1 Create `src/cosmetics/palette.ts` holding Pip's `CREAM`, `CREAM_SHADE`, `INK`, and
      `BLUSH`. Move them out of `Mascot.tsx` verbatim and import them back — the values must
      not be retyped. Name the five app families beside them as `var(--color-…)` references
      rather than hex, so `src/index.css` stays the only place each is written down.
- [x] 1.2 Update **both** mirrors of the `mascot-design` skill — `.agents/skills/` and
      `.claude/skills/` — for the fact that the renderer now exists: `SKILL.md`'s "What this
      skill does not do" section, `layers.md`'s call-site count and its "conceptual until
      item 16 builds a renderer" note, and `visual-language.md`'s claim that Pip's constants
      live in `Mascot.tsx`. Finish with `diff -r` proving the two are still byte-identical.
- [x] 1.3 Define the cosmetic type and slot union in `src/cosmetics/index.tsx`: one id, one
      slot, display name, price, and either a single `render` or a `back`/`front` fragment
      pair. Export the catalogue array and a by-id lookup.
- [x] 1.4 Author `round-glasses` (`face`, INK, 40) and `ear-bows` (`headwear`, blossom, 60).
      Ear bows must use the ear transform origins `56px 96px` and `144px 96px` exactly, or
      they detach on `happy` and `celebrating`.
- [x] 1.5 Author `mint-scarf` (`neck`, mint, 90) and `powder-cape` (`back`, powder, 160),
      both using the `sway` preset about a low anchor.
- [x] 1.6 Author `party-hat` (`headwear`, lilac, 120) as `back` and `front` fragments sharing
      one id.
- [x] 1.7 Write `src/cosmetics/catalogue.test.tsx` (`.tsx` — the failing fixtures it renders
      are JSX): ids unique, every price positive, every
      slot in the union, stroke widths within 2.5–3, no `originX` or `originY` anywhere, and
      no remote `href` — the last of these is the `Cosmetics ship in the bundle` requirement.
      Round caps and joins are left to the manual acceptance pass in 5.3, where a human can
      tell a circle that needs neither from a path that needs both. Pair the checker with a
      synthetic failing fixture so a green run is not indistinguishable from a checker that
      checks nothing.
- [x] 1.8 Assert in the same suite that every colour a cosmetic paints with is either one of
      Pip's four constants or a `var(--color-…)` reference — never a stray hex literal, which
      is how a second source of truth would get back in.

## 2. The wardrobe on the progress record

- [x] 2.1 Add `inventory: string[]` and `equipped: Partial<Record<CosmeticSlot, string>>` to
      `Progress`, defaulted empty in `initialProgress()`.
- [x] 2.2 Handle both fields in `reconcile()` with the guards from design.md, leaving the
      per-skill-object merge rule untouched.
- [x] 2.3 Write `src/lib/wardrobe.ts` — pure `buy`, `equip`, `unequip`, and the per-item
      status a shop card needs. Refusal returns `null`; a successful buy deducts exactly the
      price and touches nothing else on the record.
- [x] 2.4 Write `src/lib/wardrobe.test.ts` covering every scenario in the
      `cosmetic-wardrobe` delta: afford, cannot afford, already owned, equip unowned, replace
      within a slot, unequip keeps ownership, and a purchase leaving XP, streak, and mastery
      untouched. Balances are asserted against a figure the test works out from the starting
      coins and the catalogue price, never against what the function returned.
- [x] 2.5 Add `buyCosmetic`, `equipCosmetic`, and `unequipSlot` store actions that persist
      only on a non-null result, so a refused purchase does not advance `updatedAt`.
- [x] 2.6 Extend `src/store/progress.test.ts`: a record predating cosmetics reconciles to an
      empty wardrobe; a record carrying a wardrobe round-trips through `reconcile` and
      `adoptRemote`; an unknown owned or equipped id is retained rather than dropped; a
      refused purchase and an unequip of an empty slot both leave `updatedAt` alone.
- [x] 2.7 Extend `src/lib/sync.test.ts` for the `progress-sync` delta's new scenario: a
      purchase wakes the subscriber and schedules exactly one debounced push carrying the
      reduced balance and the new wardrobe. This adds a test only — `sync.ts` itself must
      not change.

## 3. Pip wears them

- [x] 3.1 Give `Mascot` an optional `equipped` prop and replace the hard-coded star with all
      ten steps of `references/layers.md` in order — ground shadow, `back`, headwear back,
      ears and head, headwear front, expression (cheeks then face, as today), `face`, `neck`,
      `pin` (the signature star by default), foreground effects.
- [x] 3.2 Resolve ids through the catalogue inside `Mascot`, drawing nothing for an id it
      does not know, and keep Pip's single `aria-label` as the only accessible name.
- [x] 3.3 Write `src/components/Mascot.test.tsx`: bare Pip still shows the signature star;
      each catalogue item renders when equipped; a two-fragment item paints on both sides of
      the head in the right order; an unknown id draws nothing while the rest of Pip is
      unaffected; a fixture `pin` item replaces the star.
- [x] 3.4 Pass `progress.equipped` from all four call sites that show the learner's own Pip —
      `Home.tsx:64`, both in `Lesson.tsx` (238 and 394), and `StageCheckpoint.tsx:22` —
      leaving the pre-hydration Pip in `App.tsx:53` bare, since progress is not loaded yet.

## 4. The shop

- [x] 4.1 Write `src/components/Shop.tsx`: props only, no store read. Coin balance, and one
      card per catalogue item showing a real `Mascot` at 92 px wearing just that item, its
      name, its price, and whether it is worn, owned, affordable, or out of reach.
- [x] 4.2 Add `{ name: 'shop'; back: TreeLevel }` to `App`'s `Screen` union, wired like
      `settings` — same back edge, same `screenKey` handling — and pass the store actions in.
- [x] 4.3 Make the coin `Stat` in the `Home` header a button that opens the shop, keeping its
      screen-reader label honest about what it now does.
- [x] 4.4 Write `src/components/Shop.test.tsx` against a synthetic `Progress`: every item
      listed with its price; the owned one offers equip rather than buy; the worn one says so;
      an unaffordable one is shown as out of reach rather than hidden; and a record owning an
      id the catalogue does not contain lists nothing extra.

## 5. Verification

- [x] 5.1 `npm test` green, `npm run build` clean, `npm run lint` with no new warnings beyond
      the three pre-existing `Settings.tsx` ones.
- [x] 5.2 Confirm `api/progress.ts` and `src/lib/sync.ts` have zero diff, and that
      `git diff --stat` contains nothing under `src/curriculum/` or `docs/curriculum.md`.
- [x] 5.3 Run the acceptance pass from `references/checklist.md` against all five cosmetics at
      92 px and 190 px across all six Pip states, and record the result in this file.

      **Result: pass, after one item was redrawn.** All thirty combinations rendered at each
      size; a `getBBox()` sweep over every shape reported nothing crossing the view box at
      either size, mid-animation included. Occlusion is right — the party hat's crown is
      behind the ears and its band in front, the cape is behind everything, and glasses and
      scarf sit over the head. The bows track the ears through the `happy` swing.

      **`powder-cape` failed and was redrawn.** Its first shape hung below the chin, and
      because Pip's head circle ends at y 169 the only visible part was a flat band across
      it: at both sizes it read as a bib, and it covered the ground shadow. The hem now
      curves *up* to y 165 through the middle, so the centre is hidden behind the head and
      what shows is the two side flares. It reads as a cape at 92 px and the shadow is back.
      This is exactly the failure a checker cannot catch — every automated assertion passed
      on the bib.
- [x] 5.4 Browser-validate per `docs/environment.md` with a Playwright script: finish a lesson
      to earn coins, open the shop from the coin balance, buy an item, equip it, confirm Pip
      wears it on the home screen, close the shop and confirm it returns to the level it was
      opened from, then reload and confirm the wardrobe survived. Navigation is the half a
      first-paint component test cannot reach, so it is checked here or nowhere. Take the
      375 px screenshot on a green run, look at it, and say what it looked like.

      **Result: thirteen checks, all green**, driven against a wiped IndexedDB so the earn
      rate was measured rather than assumed. Three lessons of `read-numerals` paid **45
      coins**, which bought the 40-coin glasses with 5 left — the pricing claim in design.md,
      confirmed against the running app rather than arithmetic. Buying charged exactly 40,
      wearing showed *Take off*, closing the shop returned to the Numbers unit it was opened
      from, and after a reload the IndexedDB record still read
      `{"inventory":["round-glasses"],"equipped":{"face":"round-glasses"},"coins":5}`.

      The 375 px screenshot: Pip on the home screen wearing the glasses, lenses landing
      exactly on the eyes with the bridge between them, ink-coloured so they read as part of
      the expression rather than sitting on top of it. The signature star is still in the
      `pin` slot, which is the visible proof that nothing displaced it. The recovery-key card
      was over the lower half, which is correct — the first lesson had just been finished.
- [x] 5.5 Record item 16's two ordered increments in `docs/roadmap.md`, marking this one
      shipped and leaving the item's checkbox unchecked until the room lands.
