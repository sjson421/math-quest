## 1. Mascot authoring contract

- [x] 1.1 Create the canonical `.agents/skills/mascot-design` skill with one-level
  references covering the `0 0 200 200` canvas, named anchors, slot and occlusion order,
  existing palette, geometry limits, semantic motion, reduced-motion behavior, provenance,
  and the rule that a cosmetic never duplicates the complete mascot.
- [x] 1.2 Add a minimal authoring example and acceptance checklist that verify an item at
  Pip's smallest and largest current sizes, across all six mascot states, with no clipped or
  colliding geometry and an intelligible static presentation.
- [x] 1.3 Create the equivalent `.claude/skills/mascot-design` mirror and verify that both
  entry points expose the same contract and reference inventory without deeper reference
  chains.

## 2. Animation-runtime spike and decision

- [x] 2.1 Build a disposable hand-authored SVG and Framer Motion proof for the common rubric:
  idle, celebration, three switchable cosmetic categories, one back/front occlusion case,
  app-driven palette/state, 92px and 190px output, accessible naming, reduced motion, and a
  self-hosted offline load; record artifact and compressed incremental size.
- [x] 2.2 Exercise the same rubric with a pinned Rive runtime and self-hosted licensed or
  minimal proof asset; record runtime/artifact size, authoring workflow, composition limits,
  accessibility/test surface, offline behavior, browser result, source-review quality, and
  asset provenance.
- [x] 2.3 Exercise the same rubric with a pinned dotLottie React runtime and self-hosted
  licensed or minimal proof asset, recording the same measurements and provenance as Rive.
- [x] 2.4 Append a `Spike Results` comparison and final production decision to `design.md`,
  explain the rejected alternatives, remove disposable candidate files and unselected
  dependencies, and leave any production runtime integration to a separate capability
  proposal.

## 3. Verification and handoff

- [x] 3.1 Validate both mascot-design skill directories, including entry-point metadata,
  one-level reference links, canonical/mirror behavioral equivalence, exact anchors and slot
  order, palette coverage, asset provenance, offline rules, and the authoring checklist.
- [x] 3.2 Confirm `package.json`, the lockfile, and production source contain no experimental
  Rive or dotLottie dependency or disposable community asset unless the recorded decision
  explicitly selected that runtime.
- [x] 3.3 Run strict OpenSpec validation, `npm test`, `npm run build`, and `npm run lint`.
- [x] 3.4 Update roadmap item 15 with the recorded decision and mark it complete only after
  the authoring skill, mirror, spike record, cleanup, and repository gates all pass.
- [x] 3.5 Start the real app and use the scripted Chromium workflow from
  `docs/environment.md` for a 375px Home and lesson smoke check; capture and visually inspect
  the passing screenshot, then stop any server started for the check and confirm its port is
  free.
