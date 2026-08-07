# Test map

What each suite covers, so a change lands its tests in the right file — and so a failure
names its owner. Paths are under `src/`.

| File | Covers |
| --- | --- |
| `curriculum/generators.test.ts` | ~1000 problems/skill, answer recomputed independently, content contract |
| `curriculum/unit-01-add-sub.test.ts` | golden snapshot of generated wording — the gate on any generator refactor |
| `curriculum/engine/*.test.ts` | column traces, ladders, draws, misconception factories vs. the expressions they replaced |
| `curriculum/phrasing/frames.test.ts` | every word-problem frame checked at source, sampled or not |
| `curriculum/coverage.test.ts` | registry ↔ manifest, planned vs implemented, what the learner is offered |
| `manifest/manifest.test.ts` | counts, uniqueness, dangling prereqs, cycles, reachability, graph snapshot |
| `manifest/curriculum-doc.test.ts` | manifest ↔ `docs/curriculum.md`, and the document against itself |
| `manifest/resolve.test.ts` | derivation rules against synthetic stages |
| `lib/*.test.ts`, `api/progress.test.ts` | answers, keypad, rationals, recovery key, sync |
| `components/*.test.tsx` | first paint only — which keys a problem's rules put on the pad |

Every reporting helper is paired with a synthetic case proving it names the offender. Keep
that habit: a checker that returns "no problems" looks exactly like a clean codebase.

**Component tests render to a string, in the node environment.** `test.environment` stays
`node` and there is no jsdom: `renderToStaticMarkup` from `react-dom/server` covers first
paint, which is enough to check what a component *offers*. No handlers are attached, so
anything behind a tap belongs in a pure function under `lib/` where a node test can reach it —
which is why `lib/submit.ts` exists rather than a four-way branch inside `Lesson.tsx`. A test
that needs a real DOM fails loudly here rather than passing by accident.
