## Context

See `proposal.md` for motivation and scope. `Display` currently has inline, column, and story
arms. Its runtime and snapshot renderers narrow exhaustively, while learner-text collection
and independent verification rely on that exact three-arm shape and must become explicit when
the union widens. `ProblemView` owns the expression plus answer-slot layout, while
`visibleEntry()` deliberately separates the string submitted to the checker from the notation
echoed to the learner.

Roadmap increment 17a already settled the renderer choice. Its production constraint is the
small structured React/CSS arm measured against ten Stages D–G expressions: five recursive
primitives, one accessible label, local markup, and no 375px overflow. KaTeX and its
library-named capability were rejected on measured PWA cost.

No current generator emits mathematical notation, so adding the display arm does not require
a stored-data or progress migration. It does require every exhaustive display consumer to
make an explicit choice before the first Stage D generator lands.

## Goals / Non-Goals

**Goals:**

- Make invalid notation shapes and missing authored labels compile-time errors.
- Keep visual notation and accessibility semantics under one reusable owner.
- Preserve the raw answer-entry string while presenting fractions in the same notation.
- Leave an explicit verification tripwire for future math generators rather than letting a
  new display bypass independent answer recomputation.
- Keep the production bundle free of notation libraries and font assets.

**Non-Goals:**

- Evaluating arbitrary notation trees or treating the renderer as an algebra engine.
- Parsing TeX or learner-facing formula strings.
- Solving diagram layout or adding any content consumer in this change.
- Improving the accepted custom-renderer limitations beyond the measured 17a arm.

## Decisions

### Add a recursive notation union beside `Display`

Define a `MathNotation` discriminated union with `text`, `row`, `fraction`, `superscript`, and
`root` nodes. A new math display carries `{ kind: 'math', notation, label }`; `label` is
required rather than optional so a generator cannot construct an inaccessible expression.

This keeps the generator-facing API typed and matches the exact closed primitive set that
passed the 17a rubric. A TeX string was rejected because it moves structure out of
TypeScript, needs a parser or library, and permits visible notation and its spoken label to
drift without reviewable node data. Formula-specific union arms were rejected because the
quadratic and geometry fixtures already compose from the general nodes.

### Give one component both visual and accessible ownership

`MathNotation` renders one outer element with `role="math"` and the caller's label, then an
`aria-hidden` visual subtree produced by an exhaustive recursive helper. General CSS classes
own fraction rules, superscript placement, radical bars, spacing, and the measured fluid type
floor. Recursive nodes never create nested math roles, so one expression exposes one name.

Putting `role="math"` on `ProblemView` instead was rejected: the reusable renderer would
then be safe only in that one caller, and a later solution or answer-slot use could emit the
same visual structure without its semantic owner.

### Treat a fraction entry as a small view translation, not a new stored value

`visibleEntry()` continues to return the presentational string derived from the raw entry. A
pure fraction-entry helper recognizes the single slash that keypad rules permit and returns
both a fraction node and a derived label such as “3 over 4” or “3 over blank”. `EntrySlot`
delegates that drawing to `MathNotation`; every other entry keeps the existing text path.

`ColumnView` is the one existing accessibility owner that encloses `EntrySlot` inside an
`aria-hidden` visual subtree and names the whole column from its outer math role. It therefore
uses the same derived entry label in its enclosing name instead of reading the visible `3/4`
string verbatim. The nested renderer stays hidden as part of that larger expression, leaving
one accessible math owner that says, for example, “3 plus 4 equals 3 over 4”. Component tests
cover this path even though no current column generator asks for a fraction.

This mirrors the existing typographic-minus translation: input and checking stay ASCII while
the learner-facing echo uses course notation. Moving structured notation into lesson state
was rejected because it would duplicate the actual string being edited and complicate
partial entries. Rendering a literal slash was rejected because the answer-entry baseline
requires the echo to use the problem's notation.

### Extend every exhaustive display gate explicitly

`ProblemView` gains `MathView`. The content-text collector reads the authored math label,
and the recorded-output formatter serializes both that label and the notation tree so future
generator snapshots protect them. Independent answer recomputation rejects an unhandled math
display with a named error until a content generator adds the machine-readable operation it
needs; silently treating arbitrary notation text as evaluable would violate the existing
verification contract.

This deliberate tripwire is preferable to giving the renderer an evaluator. Later displays
include formulas with variables and expressions whose answer is a property rather than their
numeric value, so a universal evaluator would either be false authority or a second algebra
system.

### Rename and flip manifest capabilities atomically

Replace `katex` with `math-notation` in the `Capability` union, Stages D–G, synthetic resolver
fixtures, comments, and documentation. Add both `math-notation` and `fraction-input` to
`AVAILABLE_CAPABILITIES` in the same edit. Manifest and coverage tests pin the renamed stage
sets, both flags, the remaining unavailable `diagram` requirement, and the unchanged 61-skill
playable set.

Keeping `katex` as a generic alias was rejected by 17a: it would make the course manifest
claim a dependency on a library production deliberately does not use. Flipping the two flags
in separate changes was rejected because fraction input is already implemented and 17b is
the roadmap's named owner for making both honest.

### Validate phone layout through a disposable real-app fixture

No generator enters scope, so production navigation cannot reach the new display during 17b.
For the browser gate, temporarily mount a fixture surface containing the ten representative
expressions in the real application entry, run the scripted Chromium role/name and overflow
assertions at 375px, and inspect the screenshot. Remove the fixture and its entry wiring before
the task completes, then rerun the build so no validation-only route or content ships.

A permanent preview route was rejected because it would add learner-reachable product surface
with no curriculum owner. Relying on node markup alone was rejected because CSS alignment and
overflow are precisely what the browser gate exists to verify.

## Risks / Trade-offs

- **The local renderer owns typesetting details** → Keep the primitive set closed and cover
  the ten measured structures in static and browser tests; reopen the library decision only
  if shipped content disproves the set.
- **The radical glyph does not stretch like a typesetter's radical** → Accept the measured
  limitation while keeping the radicand bar and nesting legible at the required viewport.
- **An authored spoken label can disagree with its tree** → Keep the two fields adjacent in
  one display object and record both in generator snapshots; semantic equivalence is authored
  content, not safely derivable from arbitrary notation.
- **A partial fraction has no denominator text** → Render a stable blank denominator and name
  it “blank” without changing the unfinished raw entry.
- **A future generator could assume the renderer proves arithmetic** → The independent
  recomputation gate fails explicitly for a math display until that generator supplies and
  verifies the operation-specific data.
- **New notation widens the lesson surface** → Run the representative 375px browser gate and
  inspect the screenshot before shipping.

## Migration Plan

1. Add the typed notation model, renderer, CSS, and static tests without registering content.
2. Extend display exhaustiveness and fraction-entry echo tests.
3. Rename and enable the manifest capabilities, then prove the playable set is unchanged.
4. Update documentation and close roadmap item 17.
5. Temporarily mount the representative notation fixture, run and inspect the real-app
   phone-width gate, remove the fixture exactly, then rerun the build.

Rollback removes the new display arm and renderer, restores `katex` in the manifest, removes
the two availability flags, and reopens roadmap item 17. There is no stored progress or sync
payload migration to reverse.
