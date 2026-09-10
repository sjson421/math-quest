## Context

See `proposal.md` for the selected 31b outcome. The delivery ambiguity was resolved explicitly by the user: use the permitted in-app-only fallback.

`src/components/Home.tsx:202` supplies the existing card with `streakAtRisk(progress, todayKey())`. `src/lib/streak.ts:162` derives risk from a positive streak and no activity today. `src/store/progress.ts:382` reconciles missed days and freezes on load. `StreakCard` states the warning in words; its tests and the streak-policy tests already cover the core behavior.

`vite.config.ts` configures generated Workbox caching, not scheduled notification delivery. `api/progress.ts` handles opaque backup blobs, with no push subscription or reminder scheduler. These facts establish the current implementation boundary, not a failure of iOS Web Push.

## Goals / Non-Goals

The implementation should make documentation agree with the chosen v1.0 delivery boundary and demonstrate that the existing Home reminder still meets its baseline contract. No runtime or baseline-spec edit is required. There is no content or capability implementation in this increment.

## Decisions

### Retain the existing reminder path

The user chose the fallback already allowed by item 31. Preserve local-day calculations, store reconciliation, warning priority, and freeze handling at their current owners. No additional surface or foreground/resume trigger is needed.

Page timers and service-worker timers do not establish dependable closed-app scheduling. A permission prompt or immediate notification demonstration would not deliver a future reminder. A push subscription and server scheduling system would be a separate product and operational scope, which the user declined for this increment.

### Close the documentation gap during implementation

Update item 31b to record the in-app-only decision, then mark parent item 31 complete once its verification is green. Retain 31a's existing description. Update README's claim that streak reminders remain unbuilt to explain that v1.0 uses the Home warning and sends no system reminders. Preserve the roadmap's separate launch exclusions.

Use `skip_specs: true`: existing baseline requirements remain true without modification. Do not add negative requirements merely to produce a delta. Record proof in `tasks.md`; temporary browser scripts and screenshots remain outside the repository per `docs/environment.md`.

## Risks / Trade-offs

- Learners receive no reminder while the app is closed → State the in-app-only outcome plainly in documentation; do not claim notification delivery.
- The roadmap's earlier iOS caveat could be mistaken for tested incompatibility → Explain this as the user's scope decision; no real-device delivery experiment has been performed.
- Closing item 31 could imply launch readiness → Preserve the explicit launch-work exclusions and existing real-hardware sync caveat.

## Migration Plan

No data migration, deployment configuration, or runtime rollback is needed. Documentation edits can be reverted independently of learner progress. The later review session owns shipping and archive; preparation only creates these artifacts.
