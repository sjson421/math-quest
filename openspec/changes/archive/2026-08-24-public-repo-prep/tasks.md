## 1. Audit the public surface

- [x] 1.1 Inventory tracked documentation, metadata, dotfiles, deployment files, and current app copy for private audience language, personal paths, credentials, and device-specific assumptions; record confirmed findings in the implementation notes or task diff. Confirmed audience framing in current docs/config/source comments, iPhone-specific product framing in README/metadata, and no credentials or absolute personal paths in the tracked tree. Tracked `.claude/settings.local.json` contains only generic local permissions.
- [x] 1.2 Verify the current playable count, GED coverage wording, sync/privacy behavior, and supported install paths against the source of truth before editing copy. Confirmed 173/201 playable in `docs/roadmap.md`, GED mapping in `docs/curriculum.md`, local-first plus bearer-key sync in `src/lib/sync.ts`/`api/progress.ts`, and iPhone/Safari installation guidance in `README.md`.

## 2. Reposition the public product

- [x] 2.1 Rewrite the README opening, status, setup, design notes, and privacy/sync sections as a cute GED math prep app for learners, retaining honest playable/planned counts and the useful iPhone installation path.
- [x] 2.2 Update current project guidance and curriculum rationale to use learner-neutral language while preserving the respectful tone, content contract, manifest authority, and all machine-checked curriculum tables.
- [x] 2.3 Update the HTML title/description and Vite PWA manifest description so browser metadata matches the README's GED-forward positioning.
- [x] 2.4 Add a concise `CONTRIBUTING.md` covering prerequisites, `npm test`, `npm run build`, style expectations, and the OpenSpec workflow; do not add a guessed license or maintainer contact.

## 3. Clean repository metadata safely

- [x] 3.1 Apply only confirmed hygiene changes from the audit to tracked dotfiles, ignore rules, and package/repository metadata; preserve unrelated user modifications and keep npm publication settings unchanged unless explicitly required. Removed tracked local Claude permissions and added a narrow ignore rule; left package publication settings and shared launch configuration unchanged.
- [x] 3.2 Search the final tracked tree for private audience remnants, secrets, absolute local paths, and stale private-app claims; inspect every match before deciding whether it is product guidance, implementation terminology, or historical context. Current product/docs/spec guidance has no remaining intended-user references; the only bearer-key example is test data, and no credentials or absolute personal paths were found.

## 4. Verify the public preparation

- [x] 4.1 Run `npm test`, `npm run build`, and the repository's lint command; confirm the curriculum/manifest cross-check and generated content tests remain unchanged in meaning. `npm test` passed (80 files, 3,041 tests); build passed; lint passed with existing React warnings only.
- [x] 4.2 Run the app with the documented dev workflow and verify the first paint, page title, public metadata, and key settings/privacy wording in a real browser at a phone-sized viewport. Chromium validation passed at 375px: the GED title and descriptions matched, the course first paint loaded, Settings exposed the recovery-key and Backup sections, and the screenshot was inspected.
- [x] 4.3 Review the final diff for scope, plain-language quality, accurate GED claims, accidental personal details, and untouched unrelated worktree changes; summarize any owner decisions still needed for license, hosting, or domain. Final review passed: public copy is learner-neutral and GED-forward, the 173/201 claim matches the roadmap, unrelated `.agents/skills/review-roadmap/SKILL.md` and `package-lock.json` edits remain untouched, and license/hosting/domain decisions remain deferred.
