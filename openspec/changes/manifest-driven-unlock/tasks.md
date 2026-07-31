No generator is written in this change, so the usual one-task-per-generator breakdown does
not apply — the seven existing generators keep their `build()` bodies unchanged. Task group 4
is the equivalent unit of work: one task per file that carries a dead prerequisite edge.

## 1. Derive the unlock graph

- [x] 1.1 Export `unlockPrerequisites` from `src/curriculum/index.ts`, derived at module load
      from `resolveUnlockPrerequisites(resolvePrerequisites(stages), skillStates)`, beside the
      existing `skillStates`. Comment it with why it is derived rather than stored, matching
      the neighbouring exports, and why the name avoids the `resolvePrerequisites` /
      `resolveUnlockPrerequisites` confusion (design.md — Decision 1).
- [x] 1.2 In `src/curriculum/coverage.test.ts`, assert every implemented skill has an entry in
      `unlockPrerequisites`, and that every edge in the graph points at an implemented skill —
      the property that makes the graph safe to gate on.
- [x] 1.3 Snapshot the unlock graph restricted to implemented skills into
      `src/curriculum/__snapshots__/`, so the next change that moves an edge has to look at it.
      Confirm the snapshot records `sub-facts` depending on `add-words`, and
      `sub-2digit-borrow` on `sub-facts` alone (proposal.md — What Changes).

## 2. Point `isUnlocked()` at the manifest

- [x] 2.1 Rewrite `isUnlocked()` in `src/store/progress.ts` with the three rules in the order
      the spec fixes: lock anything whose `skillState(id)` is not `implemented`; else unlock if
      practised; else require every id in `unlockPrerequisites` to be at `UNLOCK_THRESHOLD`,
      keeping the `?? 0` for a skill with no stored record. Drop the `generators` import.
- [x] 2.2 Add a `hasPractised(record)` helper reading `attempts > 0 || mastery > 0`, tolerant
      of a missing record (`initialProgress()` seeds only the seven registry skills, so a
      manifest id may have none). Comment it with why it is a read-time rule and not a
      migration (design.md — Decision 2).

## 3. Test the unlock rules

`src/store/progress.ts` has no test file today; this creates one.

- [x] 3.1 Create `src/store/progress.test.ts` covering the unchanged rules against the real
      manifest graph: all prerequisites met unlocks, one short stays locked, `add-facts` is
      open from first launch, an unknown id is locked.
- [x] 3.2 Test that a `planned` skill is locked even when practised — the rule-1-beats-rule-2
      precedence. Build the case with an injected state map rather than waiting for a real
      capability-blocked skill to exist.
- [x] 3.3 Test the `sub-facts` tightening end to end: a record with `add-facts` at mastery 3,
      `sub-facts` untouched, `add-words` at mastery 0 leaves `sub-facts` locked — and the same
      record with one recorded attempt on `sub-facts` leaves it unlocked with mastery unchanged.
- [x] 3.4 Test the same for `sub-2digit-borrow`, which the roadmap describes as loosening but
      which sits behind *more* skills after this change (4 → 6). Cover both halves: practised
      stays open, and the dropped `add-2digit-carry` edge no longer applies — `sub-facts` at
      mastery 2 with `add-2digit-carry` at 0 unlocks it.
- [x] 3.5 Test the sync round trip: a practised record pushed through `reconcile()` — via
      `replaceProgress` and via `adoptRemote` — keeps the same skills unlocked, and repeating
      the restore changes nothing.
- [x] 3.6 Test the mastery-without-attempts case (a hand-edited or Phase-1 backup file, and
      the shape roadmap item 27 will write) counts as practised.

## 4. Delete the second graph

- [x] 4.1 Remove `prerequisites` from `SkillGenerator` in `src/lib/types.ts` and from
      `SkillConfig`/`defineSkill()` in `src/curriculum/engine/problem.ts`.
- [x] 4.2 Remove the seven `prerequisites` declarations from
      `src/curriculum/unit-01-add-sub.ts`, including the `add-words` comment explaining its
      hand-copied edge.
- [x] 4.3 Remove the three `skill graph` tests from `src/curriculum/generators.test.ts`
      (references-exist, acyclic, has-a-root) and drop `generators` from that file's imports —
      it is used by nothing else there. Leave a one-line note pointing at the manifest tests
      that already cover all three across 201 skills.
- [x] 4.4 Grep for surviving `.prerequisites` reads outside `src/curriculum/manifest/` and
      confirm none remain. The manifest's own `SkillEntry.prerequisites` override stays — it is
      the supported way to declare a non-linear edge, and item 9 may need it.

## 5. Fix the card order

- [x] 5.1 Reorder `unit01.skills` in `src/curriculum/unit-01-add-sub.ts` to manifest order:
      `add-facts, add-2digit-nocarry, add-2digit-carry, add-3digit, add-words, sub-facts,
      sub-2digit-borrow`. Move only the array entries — leave the numbered section comments and
      the generator definitions where they are, so the diff stays readable.
- [x] 5.2 Assert in `coverage.test.ts` that the order skills are offered in equals
      `implementedSkillIds`, not merely that the two sets match. The existing
      "offers exactly the implemented set" test sorts both sides and so cannot catch this.

## 6. Update the documents

- [x] 6.1 Replace the `AGENTS.md` bullet stating `isUnlocked()` still uses the generators'
      hand-written prerequisites (and pointing at roadmap item 1) with what is now true: the
      manifest is the runtime authority, a practised skill is never re-locked, and generators
      no longer declare prerequisites at all.
- [x] 6.2 Tick roadmap item 1 in `docs/roadmap.md` with the ship date, in the format item 0
      uses. Note what it left behind, and correct the item's "loosens" description of
      `sub-2digit-borrow` — the local edge drops but the transitive gate grows.
- [x] 6.3 Confirm `docs/curriculum.md` needs no edit: line 549 already specifies manifest-derived
      prerequisites at threshold 2, and the "Max 2 unlocks at once" line at 57 is deliberately
      left standing for roadmap item 9 (design.md — Risks). Do not amend either.

## 7. Verify

- [x] 7.1 `npm test` green, `npm run lint` clean, `npm run build` clean — the type errors from
      removing `prerequisites` surface in the build, which runs `tsc -b`.
- [x] 7.2 Drive the real app in a browser: start the dev server, reset progress from settings,
      and confirm the home list reads top-to-bottom in curriculum order with `add-facts` the
      only open card. Complete it twice and confirm `add-2digit-nocarry` opens and `sub-facts`
      does **not**.
- [x] 7.3 In the browser, reproduce the strand and confirm the fix: write a progress blob to
      the `math-quest-progress` idb-keyval key with `add-facts` at mastery 3 and
      `{attempts: 1, correct: 0}` on `sub-facts`, reload, and confirm `sub-facts` is open, its
      lesson starts, and its mastery is untouched. Screenshot the home screen as evidence.

      **Partly unverified.** The unlock half is confirmed against the running app: with that
      record `sub-facts` renders open at Level 0 while `add-words` above it stays locked. The
      *lesson starts* half could not be exercised — the Browser pane is not displayed, so
      `document.visibilityState` is `hidden` and no animation frames fire, and every screen
      change in `App.tsx` goes through `AnimatePresence mode="wait"`, whose exit animation
      never completes without them. Nothing to do with this change: `Settings` and the
      always-open `add-facts` do not navigate either. Initial renders are unaffected, which is
      what the unlock evidence rests on. Screenshots are unavailable for the same reason; the
      evidence below is the rendered DOM. **Worth an eyeball on a displayed browser before
      archiving.**
- [x] 7.4 With the same seeded record, confirm the ordinary path is unaffected: a locked skill
      is still `disabled` and does not navigate on tap.
