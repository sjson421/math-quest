## Why

Stage F stops after Unit 17 even though the bounded quadratic expression surface is now built. Roadmap increment 18a is the next ordered content change and adds the six polynomial skills that can use that surface without the root-pair answer deferred to 18b.

## What Changes

- Add generators for Unit 18 skills `add-polynomials`, `sub-polynomials`, `mult-monomial`, `foil`, `factor-gcf-poly`, and `factor-trinomial`.
- Use degree-two expression answers throughout: expanded comparison for polynomial arithmetic and exact comparison for factoring.
- Add operation-specific polynomial source data so answers, visible expressions, difficulty, and recorded output can be checked independently.
- Present long polynomial rewrites in the existing unframed display and keep both the source expression and live answer slot within a 375-pixel viewport.
- Add focused tests for each generator, including distinct reachable diagnoses for the `sub-polynomials` and `factor-trinomial` walls, then register the unit and update the curriculum and roadmap status.

## Capabilities

### New Capabilities

- `unit-18-polynomials-quadratics`: Covers the six Unit 18a polynomial arithmetic and factoring skills and their required answer forms, difficulty, notation, and misconceptions.

### Modified Capabilities

- `problem-generation`: Extend independently verifiable expression source data to Unit 18 polynomial operations and their unframed rewrite displays.
- `answer-entry`: Keep long degree-two expression displays and live expression entries readable without horizontal overflow at the installed phone width.

## Non-goals

- No Unit 18b generator: `difference-of-squares`, `solve-by-factoring`, and `quadratic-formula` remain planned.
- No root-pair answer, radical entry, general exponent grammar, second variable, multiplication key, or new input mode.
- No non-monic trinomial factoring or ac-method procedure; `factor-trinomial` teaches the stated integer pair search for monic trinomials.
- No Stage F capability or prerequisite changes and no completion of roadmap item 23.

## Impact

The change adds a Unit 18 generator module and focused tests, registers it in the curriculum, extends structured problem data and its exhaustive verification and recording consumers, adjusts expression rewrite presentation, and updates curriculum and roadmap documentation. It adds no dependency, stored state, sync change, or new capability infrastructure.
