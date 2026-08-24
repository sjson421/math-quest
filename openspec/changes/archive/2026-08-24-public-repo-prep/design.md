## Context

See `proposal.md` for the motivation and scope. The repository currently spreads product
positioning across the README, curriculum rationale, roadmap notes, OpenSpec context, HTML
metadata, and the Vite PWA manifest. The implementation is already a cute mascot-led PWA, but
the written framing still assumes one adult learner and an iPhone-first private deployment.

There is no active OpenSpec capability delta for this work. The implementation must therefore
stay in the documentation, metadata, and repository-hygiene boundary defined by the proposal.
The working tree also contains unrelated user changes in `.agents/skills/review-roadmap/SKILL.md`
and `package-lock.json`; those paths must remain untouched.

## Goals / Non-Goals

**Goals:**

- Give a new visitor one consistent description: Math Quest is a cute, offline-first GED math
  prep app that also supports rebuilding foundational skills.
- Keep copy welcoming and respectful without naming a private persona, life situation, device
  owner, or assumed gender.
- Make the current implementation status and GED scope easy to understand without overselling
  unfinished stages.
- Explain local-first storage and recovery-key sync plainly enough for a public reader to make
  an informed choice.
- Leave the curriculum, app flow, recovery-key protocol, API, and visual design unchanged.

**Non-Goals:**

- No new lesson, skill, input mode, timed mode, score estimator, review mode, or onboarding flow.
- No changes to the recovery-key format, server storage, authentication model, or privacy
  architecture.
- No license selection or legal-policy drafting. Those require an owner decision.
- No broad rewrite of archived proposals and specs, which are project history rather than the
  current product pitch.

## Decisions

### Use learner-neutral, GED-forward product language

The public front door will lead with "cute GED math prep" and describe the foundation-to-GED
path as the product's scope. References to "one adult learner", "an adult restarting math",
or a personal origin story will be replaced with "learners" or omitted. The respectful tone
constraint remains, but it will be expressed as a writing rule rather than a claim about who the
app is for.

Alternative considered: keep the adult framing because the content is intentionally adult in
tone. Rejected because tone and intended audience are different concerns; the former is useful
product guidance while the latter unnecessarily narrows a public project.

### Keep device guidance, remove device identity

The README will describe the app as a standards-based PWA and retain iPhone/Safari install
steps as one concrete path. The app will not be presented as an iPhone-only product, and the
README will not make "no Mac" or "no Apple Developer account" part of the identity.

Alternative considered: remove all Apple-specific instructions. Rejected because they are
useful operational documentation for an existing supported path.

### Treat public metadata as a coordinated set

The page title/description, PWA manifest name/description, README opening, and package metadata
will use the same short positioning. The implementation should avoid introducing a second
branding constant or changing internal identifiers such as skill ids and the `Math Quest`
application name.

### Document sync as a privacy trade-off, not a marketing feature

Public copy will say that progress is stored locally first and can sync through the recovery key.
It will state that the key is a bearer credential and that the server stores the progress blob
without presenting the key as a password or full account system. This keeps the existing honest
behavior visible without changing it.

### Audit tracked files before adding public-repo scaffolding

The implementation will inspect tracked dotfiles and metadata for credentials, personal paths,
local permissions, deployment-specific assumptions, and stale audience language. It will add
only contributor-facing guidance that is justified by the audit. License, code of conduct, and
hosting ownership remain explicit follow-up decisions rather than guessed defaults.

## Risks / Trade-offs

- [Risk] A broad wording search may touch historical OpenSpec context and create noisy diffs →
  update current guidance and public entry points only; leave archived history unless it contains
  actual sensitive data.
- [Risk] Marketing copy may imply that all 201 skills are playable → repeat the current playable
  count and planned-stage caveat in the README, and verify it against the roadmap before finalizing.
- [Risk] Privacy language may drift from the actual sync implementation → cross-check every claim
  against `src/lib/sync.ts`, `src/store/recovery-key.ts`, and `api/progress.ts`.
- [Risk] Removing `private` from package metadata could accidentally signal npm publication → do
  not change package publication settings unless the owner separately asks for npm distribution.
- [Risk] Public-repo scaffolding can expose local workflow details or create false legal coverage →
  keep tool-specific local files out of contributor documentation and defer license/policy files
  that require an owner decision.

## Migration Plan

1. Audit and update current documentation and metadata in one focused diff.
2. Run the existing test suite and production build; inspect the generated manifest and HTML
   metadata for the final public wording.
3. Review the diff for personal references, secrets, local paths, unintended curriculum edits,
   and changes to the unrelated dirty files.
4. Rollback is a documentation-only revert; no data migration or deployment migration is needed.
