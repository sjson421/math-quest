## Why

Stage F Unit 18 still stops after trinomial factoring. The remaining three skills need generators that teach the difference-of-squares pattern and solve quadratic equations, now that exact two-root entry is available.

## What Changes

- Add the Unit 18b generators in curriculum order: `difference-of-squares`, `solve-by-factoring`, and `quadratic-formula`.
- Keep `difference-of-squares` on degree-two exact expression input, requiring the conjugate factorization of a visible difference of squares.
- Use exact unordered root-pair answers for `solve-by-factoring` and `quadratic-formula`, with independently derivable source data and reachable root-pair diagnoses.
- Present the supplied quadratic formula through the existing structured notation surface. Generated equations have two exact real roots; later difficulties include non-monic equations and rational roots.
- Register the generators, mark the three curriculum rows playable, update Stage F coverage and current playable counts, and record increment 18b as shipped while leaving roadmap item 23 open for Unit 19.

This change adds no capability. Stage F already has the required expression input, math notation, fraction-capable numeric entry, and root-pair input.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `unit-18-polynomials-quadratics`: Complete Unit 18 with difference-of-squares factoring and two exact-root solving skills.
- `curriculum-manifest`: Replace the now-stale Stage F root-pair-before-content state with the implemented Unit 18b state and current playable total.

## Non-goals

- No Unit 19 generator or change to roadmap item 24 chart rendering.
- No new answer, input, notation, display, or curriculum capability.
- No irrational, approximate, repeated, or complex root answers, and no radical entry.
- No general symbolic equation solver, polynomial degree above two, or non-monic factoring lesson.
- No progress schema, persistence, sync, prerequisite, or lesson-length change.
- No broad cleanup of stale historical prose outside the governing status updates required by this increment.

## Impact

The change extends Unit 18 operation data, display typing for verified polynomial equations and formulas, recorded output, independent generator verification, the Unit 18 registry and focused tests, Stage F coverage, and the roadmap/curriculum/governing status prose. It adds no dependency and does not change stored progress because generated problems remain session-local.
