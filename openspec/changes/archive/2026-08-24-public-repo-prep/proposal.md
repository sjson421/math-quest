## Why

Math Quest already has the shape of a useful public project: a cute offline-first PWA,
structured math practice, GED coverage, and a small mascot-driven reward loop. Its public
story still describes a private app made for one adult learner and an iPhone-specific setup,
which makes the repository feel personal and narrower than the product now is. This pass
prepares the repository to be shared as a cute, respectful GED math prep app without changing
the curriculum or lesson mechanics.

## What Changes

- Reframe the README, PWA metadata, page metadata, and current project guidance around a cute
  GED math prep app for learners, while retaining the app's concise, respectful tone.
- Remove current documentation that identifies a single intended user or presents the project
  as a private, iPhone-only personal app. Keep platform-specific installation notes where they
  are useful, but present them as one supported path rather than the product identity.
- Make the public-facing description honest about the current state: 201 skills mapped,
  173 currently playable, Stages A–F available, and GED-focused later stages still planned.
- Add the minimum public-repository guidance needed for a contributor to understand how to run,
  test, and propose changes, including a short privacy/sync explanation and a clear note about
  the recovery key's bearer-credential trade-off.
- Audit tracked repository metadata and local-tool configuration for personal paths, credentials,
  deployment assumptions, or files that should not be published; remove or ignore only items
  confirmed to be local-only and nonessential.
- Preserve curriculum ids, manifest authority, generated-problem behavior, progress data shape,
  and the OpenSpec workflow.

## Capabilities

### New Capabilities

None. This is a documentation, metadata, and repository-hygiene change; it does not add a
runtime capability or alter an existing behavioral contract.

### Modified Capabilities

None. No `openspec/specs/` requirement changes are needed.

## Impact

- Documentation: `README.md`, `AGENTS.md`, `docs/curriculum.md`, `docs/roadmap.md`, and any
  current project guidance that states the old audience or private-app framing.
- Product metadata: `index.html`, `vite.config.ts`, and package/repository metadata where the
  public description is defined.
- Repository hygiene: tracked dotfiles, ignore rules, and new contributor-facing files if the
  audit shows they are needed.
- No API contract, IndexedDB schema, sync protocol, curriculum manifest, generator, or lesson
  behavior changes.

## Non-goals

- Do not implement the remaining GED curriculum, timed mode, score estimation, or any roadmap
  item unrelated to public presentation.
- Do not redesign Pip, add cosmetics, or change the reward economy.
- Do not change the recovery-key model or claim that it is secure authentication.
- Do not select a software license, legal policy, hosting provider, analytics provider, or
  public domain name without an explicit product-owner decision.
- Do not rewrite archived OpenSpec history merely to remove historical design context; only
  current public guidance and actual personal or sensitive material found by the audit are in
  scope.
