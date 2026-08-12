# Phase 6: Simplify

Use the adapter's cleanup mechanism on this run's changed paths. Follow the shared
independent review contract: one reviewer by default, with two or three permitted only for
non-overlapping path domains. Each domain review checks reuse, quality, and efficiency
rather than assigning perspectives over the same files.

The parent verifies every finding and applies only high-confidence, behavior-preserving
improvements that preserve repository boundaries. Inspect each resulting diff and rerun the
closest affected tests after every batch. Proceed only when no behavior or requirement
changed.
