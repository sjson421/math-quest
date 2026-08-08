# Phase 2: Explore

Use `openspec-explore`, scoped to the selected item, when behavior is not fixed by the
roadmap and authorities, plausible approaches would produce different specs, an unmapped
domain is involved, or repository behavior appears to conflict with the roadmap. Otherwise
state why exploration is skipped; never skip silently.

Investigate instead of interviewing. Read and search the repository, compare approaches,
and answer questions from code when possible. Ask only for a product decision the
repository cannot settle, and stop rather than guess. Do not write application code or
OpenSpec artifacts.

Explore inline by default. If independent reading is genuinely needed, follow the agent
contract in `SKILL.md`; domain path sets must be disjoint. Verify every returned claim.

End with the problem understood, chosen approach and rejected alternatives, constraints
and invariants with file evidence, and any open question. This summary feeds proposal.

Any later phase may re-enter exploration for one question it cannot answer. Resolve that
question inline, record the outcome, and resume through the phase owning affected artifacts
or code. Do not silently fold a design discovery into implementation or review.
