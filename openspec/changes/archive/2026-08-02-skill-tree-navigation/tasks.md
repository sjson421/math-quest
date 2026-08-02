## 1. Derive the playable course structure

- [x] 1.1 Add `CourseUnit`, `CourseStage` and `resolveCourseTree(stages, states)` to
      `src/curriculum/manifest/resolve.ts`, omitting `planned` skills and any unit or stage
      left with none, preserving manifest order at all three levels.
- [x] 1.2 Cover `resolveCourseTree` in `src/curriculum/manifest/resolve.test.ts` against
      synthetic stages: an absent unit, an absent stage, a partly built unit, ordering at
      each level, and an empty tree. Include the paired offender case — states given out of
      manifest order still come back in manifest order.
- [x] 1.3 Export `course` from `src/curriculum/index.ts` as `resolveCourseTree` over
      `stages` and the live `skillStates`, documented as the fourth derivation over the same
      two inputs.

## 2. Course derivations for the learner

- [x] 2.1 Add `src/lib/course.ts` with `unitProgress` and `stageProgress` returning the
      mastery share over playable skills, and `currentUnitId` returning the unit of the first
      unlocked skill below `UNLOCK_THRESHOLD` — the frontier, not the first skill short of
      `MAX_MASTERY` — falling back to the last playable unit and to `undefined` on an empty
      course.
- [x] 2.2 Cover `src/lib/course.ts` in `src/lib/course.test.ts`: zero, partial and full unit
      progress; progress counting playable skills only; stage aggregation; and each
      `currentUnitId` case — fresh learner, a learner whose earlier units sit at the unlock
      threshold (the case that fails under a `MAX_MASTERY` rule), a barely started frontier
      skill, a frontier whose unit is otherwise locked, everything past the threshold, and an
      empty course.

## 3. Retire the hand-maintained unit list

- [x] 3.1 Change `unit00`, `unit01` and `unit02` to export `SkillGenerator[]` instead of a
      `Unit` literal, dropping the duplicated `id`, `name` and `color` — including the
      `unit-00`/`unit-0` id that already disagreed with the manifest.
- [x] 3.2 Remove `units` and the unread `unitBySkillId` from `src/curriculum/index.ts`,
      rebuild `allSkills` from the exported arrays, and delete `Unit` from
      `src/lib/types.ts`.
- [x] 3.3 Rework `src/curriculum/coverage.test.ts` to assert over `course` instead of
      `units`: it covers exactly `implementedSkillIds`, leaks no `planned` skill, and places
      each skill under the unit and stage the manifest declares.

## 4. Navigation levels

- [x] 4.1 Add the `TONE_CYCLE` tone lookup by manifest unit position, with a test pinning
      Units 0, 1 and 2 to powder, blossom and mint — the colours they have today.
- [x] 4.2 Add `src/components/SkillList.tsx` holding the existing `SkillCard` unchanged,
      taking its unit, skills, mastery, unlocked state and handlers as props.
- [x] 4.3 Add `src/components/UnitList.tsx` listing a stage's playable units with their
      progress, marking a unit whose skills are all locked, taking props only.
- [x] 4.4 Add `src/components/StageList.tsx` listing playable stages with their progress,
      taking props only.
- [x] 4.5 Add first-paint tests for the three levels: what each offers, locked states shown,
      no planned skill or empty unit rendered, and each level rendering only its own entries.

## 5. Wire the hierarchy

- [x] 5.1 Rebuild `src/components/Home.tsx` as the shell — stats header, mascot, daily goal,
      a back control where one applies — rendering the active level beneath it.
- [x] 5.2 Extend the `Screen` union in `src/App.tsx` with `stages`, `units` and `skills`,
      carry the originating `unitId` on `lesson`, default to the current unit through a
      render-time fallback, and key `AnimatePresence` on level plus id.
- [x] 5.3 Confirm exiting a lesson returns to the unit it was started from, and that settings
      open from any level and close back to that same level.

## 6. Documentation

- [x] 6.1 Tick roadmap item 8 in `docs/roadmap.md` and record what it left behind, in the
      voice of the items already shipped.
- [x] 6.2 Update the `AGENTS.md` active-queue note, and record that the manifest is now the
      runtime authority for course structure as well — no hand-written unit list survives.
      The test map needs no new row: the new tests fall under its existing `lib/*.test.ts`,
      `components/*.test.tsx` and `manifest/resolve.test.ts` entries.

## 7. Verify

- [x] 7.1 Run `npm test`, `npm run build` and `npm run lint`, and confirm the three
      pre-existing `Settings.tsx` warnings are the only ones.
- [x] 7.2 Drive the real app in a browser with the preview visible: open at Unit 0, walk
      skill → unit → stage and back down, confirm Units 1 and 2 read as locked, confirm no
      unbuilt unit or stage appears anywhere, start and exit a lesson, and check the console
      is clean.
