# Phase 1: Select

1. Read `AGENTS.md`, `openspec/config.yaml`, the roadmap header through “How to read
   this”, and the first unchecked item through the next checkbox. Read only the authority
   and task docs that item names or touches; shipped history is read only when referenced.
2. Record branch, HEAD, `git status --short`, and `git diff`. Existing changes are
   user-owned and excluded from every later staging operation.
3. Move to `main`, fetch `origin`, and fast-forward only. Stop before overwriting work,
   resolving a conflict, merging, rebasing, or rewriting shared history.
4. Select the first unchecked checkbox in document order and retain its full body.
5. Apply `openspec/config.yaml` and roadmap sizing. A content change contains at most six
   generators. If a unit is larger, take its first remaining ordered increment, name the
   exact skill ids, and leave the roadmap checkbox open until every increment ships. Do not
   split a compliant ordered increment to reduce context. Split it further only when each
   part can ship independently without coordinating one shared model, renderer, or design.
6. Announce the exact item, selected scope, and proposed kebab-case change name.
