# Math Quest — Curriculum

Arithmetic from the very beginning through to GED level.
**8 stages · 23 units · 201 skills.** One skill = one lesson = one idea = ~5 minutes.

---

## Why 201 and not 130

Patient pacing means **more, smaller skills — not fewer, bigger ones.**

An adult restarting math usually carries shame about it. A skill that takes three
attempts to pass feels like failing again; a skill that passes first try feels like
progress. So every notorious wall gets its **own** skill rather than being buried inside
a larger one:

- subtracting a negative (`−` a `−`) — not folded into "negative numbers"
- subtracting across zero (`500 − 237`) — not folded into "3-digit subtraction"
- flipping the inequality sign when multiplying by a negative — its own skill
- each times table separately, easiest first — not "the times tables"

Splitting these costs nothing (a generator is cheap) and removes the exact moments where
adult learners historically quit.

---

## Content style contract

Applies to every skill. **Brevity is the requirement, not an aspiration.**

| Element | Limit | Notes |
|---|---|---|
| Teaching line | **1 sentence** | Shown once, before the first problem |
| Worked example | **1** | Shown with the teaching line. Concrete numbers, never symbols |
| Hint | **1 sentence** | Actionable, not a restatement of the question |
| Solution steps | **max 4**, ≤12 words each | Each step shows its arithmetic on its own line |
| New vocabulary | **max 1 per skill** | Introduce the word only when it becomes necessary |

Rules:
- **Show, don't explain.** A worked example outperforms prose for novice learners. Prose
  is the fallback, never the default.
- **No forward references.** Never mention a concept from a later unit, even in passing.
- **Concrete before abstract.** Use money for decimals and percents — an adult already
  has strong money intuition, and it transfers.
- **No jargon debt.** "Numerator" arrives when it's needed, not in an overview.

---

## Anti-discouragement mechanics

Design commitments, not features. Each removes a known quitting point.

| Mechanic | Behaviour |
|---|---|
| **Warm-up problem** | Every lesson opens one difficulty band below current — a guaranteed early win |
| **Silent recovery** | 3 wrong in a row → difficulty drops for the rest of the lesson. Never surfaced to the learner |
| **One clear path** | Progression opens one next skill at a time, so the next step stays obvious |
| **Skip ahead** | Mark any stage or unit as already known — see [Skipping ahead](#skipping-ahead) |
| **Quick wins** | Skills marked `quick` end at 5 correct instead of 10 — used for the first skill of any hard unit |
| **Stage checkpoints** | A celebration screen at each stage boundary, not just per skill |
| **No time pressure** | Nothing is timed until Stage H (GED prep), where the real test demands it |

Existing commitments that carry over: **no hearts**, misses re-queue within the session,
and wrong answers are *diagnosed* rather than marked incorrect.

---

## Skipping ahead

Any **stage or unit** can be marked as already known. Grinding through known material is
one of the fastest ways to abandon an app — but self-assessment is unreliable in both
directions, so a skip must be recoverable rather than permanent.

Two routes, offered together. **Neither is mandatory.**

| Route | Flow | Result |
|---|---|---|
| **Check first** *(suggested)* | 8 problems sampled across the block at difficulty 3 | ≥ 7 correct → skipped. Below that → offers the first unmastered unit, no penalty framing |
| **Just skip it** | One tap, no test | Skipped immediately |

### What a skip actually does

- Sets every skill in the block to **mastery 3**, not 5. That clears the unlock threshold
  (2) for everything downstream, while leaving headroom to level up later — a skipped
  skill isn't "finished", just "not needed yet".
- Records `source: 'tested-out' | 'self-assessed'` on each skill.
- **Enters spaced repetition immediately at low strength.** This is the safety net: a
  skipped skill surfaces in Review lessons sooner than a practiced one.

### The safety net

Self-assessed skips are the risky ones, so the system watches them:

- If accuracy on a skipped skill falls below **60% across 5+ review attempts**, quietly
  offer to reopen its unit — framed as *"want to warm this one up?"*, never as a
  correction or a failure.
- Skipping is reversible at any time from the unit itself: **"Actually, let me practice
  this"** resets the block to mastery 0.
- A downstream skill failing repeatedly should point back at the skipped prerequisite,
  since that is the actual cause and the learner has no way to know it.

### Where it appears

- **On first launch** — offered per stage, so someone comfortable through decimals starts
  at Stage E rather than counting to 999.
- **On any locked or unstarted unit** — a small "I already know this" affordance, so the
  decision doesn't have to be made up front before she knows what the app is like.

---

## Stage map

| Stage | Units | Skills | What it unlocks |
|---|---|---|---|
| **A · Numbers** | 0 | 8 | Reading, comparing, rounding whole numbers |
| **B · Four Operations** | 1–5 | 44 | +, −, ×, ÷, order of operations |
| **C · Negatives** | 6 | 9 | Signed arithmetic — the gate to algebra |
| **D · Parts of a Whole** | 7–11 | 50 | Fractions, decimals, percents, ratios |
| **E · Powers & Early Algebra** | 12–15 | 34 | Exponents, expressions, equations, inequalities |
| **F · Graphs & Algebra II** | 16–19 | 28 | Coordinate plane, systems, quadratics, functions |
| **G · Geometry & Data** | 20–21 | 22 | Area, volume, Pythagoras, statistics, probability |
| **H · GED Prep** | 22 | 6 | Calculator, formula sheet, timed practice |

**Legend:** ✅ built · ⚠️ known wall (invest in misconception prediction) · `quick` 5-problem lesson

---

# STAGE A · Numbers

### Unit 0 — Numbers & Place Value (8)

| # | id | Skill | Note |
|---|---|---|---|
| 0.1 | `read-numbers` | Read numerals to 999 | ✅ `quick` |
| 0.2 | `place-value-tens` | Name the tens digit | ✅ |
| 0.3 | `place-value-hundreds` | Name the hundreds digit | ✅ |
| 0.4 | `expanded-form` | 347 = 300 + 40 + 7 | ✅ |
| 0.5 | `compare-numbers` | Use <, >, = | ✅ |
| 0.6 | `order-numbers` | Order three numbers | ✅ |
| 0.7 | `round-to-10` | Round to nearest ten | ✅ |
| 0.8 | `round-to-100` | Round to nearest hundred | ✅ ⚠️ midpoint rule (250 → 300) |

---

# STAGE B · The Four Operations

### Unit 1 — Addition (8)

| # | id | Skill | Note |
|---|---|---|---|
| 1.1 | `add-facts-small` | Sums to 10 | ✅ `quick` |
| 1.2 | `add-facts` | Sums to 18 | ✅ |
| 1.3 | `add-tens` | 20 + 30 | ✅ |
| 1.4 | `add-2digit-nocarry` | Column addition | ✅ |
| 1.5 | `add-2digit-carry` | Carrying | ✅ ⚠️ forgetting the carry |
| 1.6 | `add-3digit` | Three digits | ✅ |
| 1.7 | `add-three-numbers` | Stack of three | ✅ |
| 1.8 | `add-words` | Word problems | ✅ |

### Unit 2 — Subtraction (8)

| # | id | Skill | Note |
|---|---|---|---|
| 2.1 | `sub-facts-small` | Within 10 | ✅ `quick` |
| 2.2 | `sub-facts` | Within 18 | ✅ |
| 2.3 | `sub-tens` | 50 − 20 | ✅ |
| 2.4 | `sub-2digit-noborrow` | Column subtraction | ✅ |
| 2.5 | `sub-2digit-borrow` | Borrowing | ✅ ⚠️ flipping digits to avoid borrowing |
| 2.6 | `sub-3digit-borrow` | Three digits | ✅ |
| 2.7 | `sub-across-zero` | 500 − 237 | ✅ ⚠️ **major wall** — double borrow |
| 2.8 | `sub-words` | Word problems | ✅ |

### Unit 3 — Multiplication (14) — *slowest unit by design*

Tables are introduced **easiest first** so momentum builds before the hard ones.

| # | id | Skill | Note |
|---|---|---|---|
| 3.1 | `mult-meaning` | Repeated addition, arrays | ✅ `quick` |
| 3.2 | `times-2` | Doubling | ✅ `quick` |
| 3.3 | `times-10` | Pattern of zeros | ✅ `quick` |
| 3.4 | `times-5` | Half of ten | ✅ |
| 3.5 | `times-3` | | ✅ |
| 3.6 | `times-4` | Double twice | ✅ |
| 3.7 | `times-6` | | ✅ |
| 3.8 | `times-9` | Digit-sum pattern | ✅ taught before 7/8 — the pattern makes it easy |
| 3.9 | `times-7-8` | | ✅ ⚠️ hardest facts |
| 3.10 | `times-mixed` | Full table review | ✅ |
| 3.11 | `mult-by-10-100` | Shifting places | ✅ |
| 3.12 | `mult-2by1` | 34 × 6 | ✅ ⚠️ carrying inside multiplication |
| 3.13 | `mult-2by2` | 34 × 26 | ✅ ⚠️ placeholder zero on row two |
| 3.14 | `mult-words` | Word problems | ✅ |

### Unit 4 — Division (11)

| # | id | Skill | Note |
|---|---|---|---|
| 4.1 | `div-meaning` | Sharing and grouping | ✅ `quick` |
| 4.2 | `div-facts` | Inverse of tables | ✅ |
| 4.3 | `div-remainder` | Whole-number remainders | ✅ |
| 4.4 | `div-by-10-100` | | ✅ |
| 4.5 | `long-div-1digit` | Single-digit divisor | ✅ ⚠️ the algorithm itself |
| 4.6 | `long-div-remainder` | | ✅ |
| 4.7 | `long-div-2digit` | Two-digit divisor | ✅ ⚠️ estimating the quotient |
| 4.8 | `factors` | Find all factors | ✅ choice input |
| 4.9 | `multiples` | | ✅ choice input |
| 4.10 | `primes` | Prime vs composite | ✅ choice input |
| 4.11 | `div-words` | Word problems | ✅ |

### Unit 5 — Order of Operations (3)

| # | id | Skill | Note |
|---|---|---|---|
| 5.1 | `two-operations` | 3 + 4 × 2 | ✅ ⚠️ left-to-right instinct |
| 5.2 | `with-parentheses` | | ✅ |
| 5.3 | `pemdas` | Full, no exponents yet | ✅ exponents revisited at 12.10 |

---

# STAGE C · Negatives

### Unit 6 — Negative Numbers (9)

The gate to all algebra. Nothing here is optional.

| # | id | Skill | Note |
|---|---|---|---|
| 6.1 | `negatives-numberline` | Read below zero | ✅ `quick` number-line input |
| 6.2 | `compare-negatives` | −7 < −3 | ✅ ⚠️ "bigger digit = bigger" · choice input |
| 6.3 | `add-neg-pos` | −3 + 5 | ✅ ⚠️ added magnitudes, kept sign |
| 6.4 | `add-two-negs` | −3 + −5 | ✅ |
| 6.5 | `sub-negatives` | 5 − (−3) | ✅ ⚠️ **major wall** — minus a minus |
| 6.6 | `mult-negatives` | Sign rules | ✅ |
| 6.7 | `div-negatives` | | ✅ |
| 6.8 | `absolute-value` | | ✅ |
| 6.9 | `negatives-mixed` | Interleaved review | ✅ |

---

# STAGE D · Parts of a Whole

### Unit 7 — Fractions: Meaning (9) — *meaning before operations*

Adults fail fractions when procedure arrives before meaning. This unit builds
representations, equivalence, and comparison first, then closes by expressing fractions
in lowest terms. Fraction operations wait for Unit 8.

| # | id | Skill | Note |
|---|---|---|---|
| 7.1 | `fraction-meaning` | Parts of a whole | ✅ `quick` |
| 7.2 | `fraction-of-shape` | Read from a diagram | ✅ |
| 7.3 | `name-parts` | Numerator / denominator | ✅ first new vocabulary |
| 7.4 | `fractions-numberline` | Place on a line | ✅ |
| 7.5 | `equivalent-visual` | ½ = 2/4 by picture | ✅ |
| 7.6 | `equivalent-multiply` | Scale up and down | ✅ |
| 7.7 | `simplify-fractions` | Lowest terms | ✅ ⚠️ partial simplification |
| 7.8 | `compare-same-den` | | ✅ |
| 7.9 | `compare-diff-den` | | ✅ ⚠️ comparing numerators only |

### Unit 8 — Fractions: Operations (12)

| # | id | Skill | Note |
|---|---|---|---|
| 8.1 | `add-frac-same-den` | | ✅ ⚠️ adding denominators too |
| 8.2 | `sub-frac-same-den` | | ✅ |
| 8.3 | `common-denominator` | Find the LCD | ✅ |
| 8.4 | `add-frac-diff-den` | | ✅ ⚠️ **major wall** |
| 8.5 | `sub-frac-diff-den` | | ✅ |
| 8.6 | `improper-to-mixed` | | ✅ |
| 8.7 | `mixed-to-improper` | | ✅ |
| 8.8 | `add-mixed` | | ✅ |
| 8.9 | `sub-mixed` | | ✅ ⚠️ borrowing from the whole |
| 8.10 | `mult-fractions` | Straight across | ✅ easier than adding — placed after for confidence |
| 8.11 | `div-fractions` | Keep, change, flip | ✅ ⚠️ flipping the wrong fraction |
| 8.12 | `fraction-words` | Word problems | ✅ |

### Unit 9 — Decimals (12)

| # | id | Skill | Note |
|---|---|---|---|
| 9.1 | `decimal-place-value` | Tenths, hundredths | ✅ |
| 9.2 | `read-decimals` | | ✅ `quick` |
| 9.3 | `compare-decimals` | | ✅ ⚠️ 0.9 vs 0.15 (longer = bigger) |
| 9.4 | `round-decimals` | | ✅ |
| 9.5 | `add-decimals` | Line up the points | ✅ |
| 9.6 | `sub-decimals` | | ✅ |
| 9.7 | `mult-decimals` | Count the places | ✅ ⚠️ misplacing the point |
| 9.8 | `div-decimal-by-whole` | | ✅ |
| 9.9 | `div-by-decimal` | Shift both | ✅ ⚠️ shifting only one point |
| 9.10 | `fraction-to-decimal` | | ✅ |
| 9.11 | `decimal-to-fraction` | | ✅ |
| 9.12 | `money-problems` | Applied | ✅ leans on existing money intuition |

### Unit 10 — Percents (10)

| # | id | Skill | Note |
|---|---|---|---|
| 10.1 | `percent-meaning` | Out of 100 | ✅ `quick` |
| 10.2 | `percent-to-decimal` | | ✅ |
| 10.3 | `decimal-to-percent` | | ✅ ⚠️ shifting the wrong way |
| 10.4 | `percent-to-fraction` | | ✅ |
| 10.5 | `percent-of` | 15% of 80 | ✅ |
| 10.6 | `find-the-percent` | 12 is what % of 60 | ✅ ⚠️ which number divides |
| 10.7 | `find-the-whole` | 20% is 15, find total | ✅ ⚠️ **major wall** |
| 10.8 | `percent-change` | Increase / decrease | ✅ |
| 10.9 | `discount-tax-tip` | Applied | ✅ |
| 10.10 | `simple-interest` | I = Prt | ✅ on the GED formula sheet |

### Unit 11 — Ratios & Proportions (7)

| # | id | Skill | Note |
|---|---|---|---|
| 11.1 | `write-ratios` | | `quick` · ✅ |
| 11.2 | `simplify-ratios` | | ✅ |
| 11.3 | `unit-rate` | Best value | ✅ |
| 11.4 | `solve-proportions` | Cross-multiply | ✅ |
| 11.5 | `scale-drawings` | | ✅ |
| 11.6 | `unit-conversion` | | ✅ |
| 11.7 | `ratio-words` | Word problems | ✅ · ⚠️ part-to-part vs part-to-whole |

---

# STAGE E · Powers & Early Algebra

### Unit 12 — Exponents & Roots (10)

| # | id | Skill | Note |
|---|---|---|---|
| 12.1 | `exponent-meaning` | Repeated multiplication | `quick` · ✅ |
| 12.2 | `evaluate-powers` | | ✅ · ⚠️ 3⁴ read as 3 × 4 |
| 12.3 | `perfect-squares` | Roots to 144 | ✅ |
| 12.4 | `estimate-roots` | Between which whole numbers | ✅ |
| 12.5 | `exponent-multiply` | Add the powers | ✅ |
| 12.6 | `exponent-divide` | Subtract the powers | ✅ |
| 12.7 | `power-of-power` | Multiply the powers | ✅ · ⚠️ confused with 12.5 |
| 12.8 | `zero-neg-exponents` | | ✅ |
| 12.9 | `scientific-notation` | | ✅ |
| 12.10 | `pemdas-exponents` | Full order of operations | ✅ · completes 5.3 |

### Unit 13 — Expressions (8)

| # | id | Skill | Note |
|---|---|---|---|
| 13.1 | `variable-meaning` | A letter is a number | `quick` · ✅ |
| 13.2 | `evaluate-expression` | Substitute and compute | ✅ |
| 13.3 | `words-to-expression` | | ✅ · ⚠️ "less than" reverses order |
| 13.4 | `identify-like-terms` | | ✅ |
| 13.5 | `combine-like-terms` | | ✅ · ⚠️ combining unlike terms |
| 13.6 | `distributive` | | ✅ · ⚠️ distributing to first term only |
| 13.7 | `distribute-negative` | −3(x − 4) | ✅ · ⚠️ **major wall** — sign on second term |
| 13.8 | `factor-gcf` | Reverse of distributing | ✅ · answers in factored form |

### Unit 14 — Linear Equations (10)

| # | id | Skill | Note |
|---|---|---|---|
| 14.1 | `equation-balance` | Both sides stay equal | `quick` · ✅ |
| 14.2 | `one-step-addsub` | | ✅ |
| 14.3 | `one-step-multdiv` | | ✅ |
| 14.4 | `two-step` | | ✅ · ⚠️ undoing in the wrong order |
| 14.5 | `vars-both-sides` | | ✅ |
| 14.6 | `equation-parentheses` | | ✅ |
| 14.7 | `with-fractions` | Clear denominators | ✅ |
| 14.8 | `special-solutions` | None / infinite | ✅ |
| 14.9 | `equation-words` | | ✅ |
| 14.10 | `rearrange-formula` | Solve for y | ✅ · needed for Unit 16 |

### Unit 15 — Inequalities (6)

| # | id | Skill | Note |
|---|---|---|---|
| 15.1 | `inequality-symbols` | | `quick` · ✅ |
| 15.2 | `graph-inequality` | Open vs closed circle | ✅ · the graph named, not drawn |
| 15.3 | `solve-one-step-ineq` | | ✅ · answers the whole relation |
| 15.4 | `solve-multi-step-ineq` | | ✅ |
| 15.5 | `flip-the-sign` | × or ÷ by a negative | ✅ · ⚠️ **major wall** — own skill deliberately |
| 15.6 | `compound-inequalities` | | ✅ · counts on the keypad |

---

# STAGE F · Graphs & Algebra II

### Unit 16 — Coordinate Plane & Lines (10)

| # | id | Skill | Note |
|---|---|---|---|
| 16.1 | `plot-points` | | `quick` · ✅ · ⚠️ (x, y) order |
| 16.2 | `quadrants` | | ✅ |
| 16.3 | `table-to-graph` | | ✅ |
| 16.4 | `slope-from-graph` | Rise over run | ✅ |
| 16.5 | `slope-from-points` | Formula | ✅ · ⚠️ inconsistent subtraction order |
| 16.6 | `y-intercept` | | ✅ |
| 16.7 | `slope-intercept` | y = mx + b | ✅ |
| 16.8 | `graph-from-equation` | Choose the matching line | ✅ |
| 16.9 | `equation-from-graph` | | ✅ |
| 16.10 | `parallel-perpendicular` | Negative reciprocal | ✅ |

### Unit 17 — Systems of Equations (4)

| # | id | Skill | Note |
|---|---|---|---|
| 17.1 | `system-by-graphing` | | |
| 17.2 | `substitution` | | |
| 17.3 | `elimination` | | ⚠️ forgetting to scale both sides |
| 17.4 | `system-words` | | |

### Unit 18 — Polynomials & Quadratics (9)

| # | id | Skill | Note |
|---|---|---|---|
| 18.1 | `add-polynomials` | | |
| 18.2 | `sub-polynomials` | | ⚠️ distributing the minus |
| 18.3 | `mult-monomial` | | |
| 18.4 | `foil` | | |
| 18.5 | `factor-gcf-poly` | | |
| 18.6 | `factor-trinomial` | | ⚠️ **major wall** |
| 18.7 | `difference-of-squares` | | |
| 18.8 | `solve-by-factoring` | Zero product | |
| 18.9 | `quadratic-formula` | | on the GED formula sheet |

### Unit 19 — Functions (5)

| # | id | Skill | Note |
|---|---|---|---|
| 19.1 | `function-notation` | f(x) is not multiplication | ⚠️ |
| 19.2 | `evaluate-function` | | |
| 19.3 | `domain-range` | | |
| 19.4 | `linear-vs-nonlinear` | | |
| 19.5 | `compare-functions` | Table vs graph vs equation | GED-specific |

---

# STAGE G · Geometry & Data

### Unit 20 — Geometry & Measurement (13)

The GED **provides** a formula sheet. These skills teach *choosing and applying* the
right formula, never memorising it.

| # | id | Skill | Note |
|---|---|---|---|
| 20.1 | `perimeter` | | `quick` |
| 20.2 | `area-rectangle` | | |
| 20.3 | `area-triangle` | | ⚠️ forgetting the ½ |
| 20.4 | `area-parallelogram-trapezoid` | | |
| 20.5 | `circumference` | | ⚠️ radius vs diameter |
| 20.6 | `area-circle` | | ⚠️ |
| 20.7 | `composite-figures` | Split the shape | |
| 20.8 | `volume-prism` | | |
| 20.9 | `volume-cylinder` | | |
| 20.10 | `volume-cone-pyramid-sphere` | | |
| 20.11 | `surface-area` | | |
| 20.12 | `pythagorean` | | ⚠️ hypotenuse placement |
| 20.13 | `similar-figures` | | |

### Unit 21 — Data & Probability (9)

| # | id | Skill | Note |
|---|---|---|---|
| 21.1 | `mean` | | `quick` |
| 21.2 | `median` | | ⚠️ forgetting to sort first |
| 21.3 | `mode-range` | | |
| 21.4 | `weighted-mean` | | GED-specific |
| 21.5 | `read-bar-line` | | |
| 21.6 | `read-scatterplot` | Trend lines | |
| 21.7 | `basic-probability` | | |
| 21.8 | `compound-probability` | And / or | ⚠️ |
| 21.9 | `counting-outcomes` | | |

---

# STAGE H · GED Prep

### Unit 22 — Test Preparation (6)

| # | id | Module | Note |
|---|---|---|---|
| 22.1 | `calculator-skills` | TI-30XS operation | allowed on all but the first 5 questions |
| 22.2 | `formula-sheet` | Navigating the provided sheet | |
| 22.3 | `review-quantitative` | Mixed, ~45% of the test | |
| 22.4 | `review-algebraic` | Mixed, ~55% of the test | |
| 22.5 | `timed-practice-1` | Full length | first timed content in the whole app |
| 22.6 | `timed-practice-2` | Full length | |

---

## GED coverage check

The 2014-series GED math test is ~45% quantitative and ~55% algebraic. Mapping:

| Test area | Covered by |
|---|---|
| Number operations | Units 1–5 |
| Fractions, decimals, percents | Units 7–10 |
| Ratios, proportions, rates | Unit 11 |
| Exponents, roots, scientific notation | Unit 12 |
| Expressions, equations, inequalities | Units 13–15 |
| Linear graphing, slope | Unit 16 |
| Systems | Unit 17 |
| Polynomials, quadratics | Unit 18 |
| Functions | Unit 19 |
| Geometry, measurement | Unit 20 |
| Data, statistics, probability | Unit 21 |

**Deliberately excluded** — not on the test: trigonometry, logarithms, matrices,
imaginary numbers, calculus.

---

## Build order

Ship by stage; each stage is independently useful.

1. **Finish Stage B** — split the existing mixed unit into Units 1 and 2, then add 3–5.
   Largest single block (44 skills) and the true foundation.
2. **Stage C** (9) — small, and unblocks all algebra.
3. **Stage D** (50) — the biggest. **Structured math notation** is built from Unit 7
   onward. The **fraction input mode** is also built: a problem declares `allowFraction`
   and the pad offers the slash. **Diagram rendering** is built for shaded bars, circles and
   grids, so Stage D's capability infrastructure is complete.
4. **Stage E** (34) — complete; the **expression input mode** it needed is built.
5. **Stage F** (28) — the **coordinate-plane input** it needs is built; all ten Unit 16 skills are playable.
6. **Stage G** (22) — reuses built **diagram rendering** for shapes and still needs charts.
7. **Stage H** (6) — needs timed mode and a score estimator.

### New capabilities required, by stage

| Capability | First needed | Notes |
|---|---|---|
| Choice input | A (Unit 0.5) | Built — declared per problem via `inputMode` |
| Math notation rendering | D (Unit 7) | Built — structured React/CSS via `Display` |
| Fraction keypad mode | D (Unit 8) | Built and available — declared per problem via `allowFraction`; mixed-number entry via `allowMixed` (a space key in the pad's adaptive cell, with `requireMixed` form checking) |
| Diagram rendering | D (Unit 7.2) | Built — typed shaded bars, circles and grids via `Display` |
| Expression input | E (Unit 13) | Built — a variable key per problem via `expression`, compared under a canonical form |
| Number-line input | C (Unit 6.1) | Built — declared per problem via `numberLine` |
| Coordinate-plane input | F (Unit 16.1) | Built — tap or use large axis controls or arrow keys to place an integer-lattice point, then confirm |
| Chart rendering | G (Unit 21.5) | Bar, line, scatter |
| Timed mode | H | Only place time pressure appears |

---

## Notes for implementation

- **This document has a machine-readable twin.** `src/curriculum/manifest/` holds all 201
  skills as data, one file per stage, and the two cross-check each other in the test suite:
  the id column, the `quick` and ⚠️ markers, every unit and stage count, and the counts this
  document states about itself. Either file may be edited — the tests fail until both agree.
  Editing a table row here without the manifest (or the reverse) is a test failure, not a
  silent divergence.
- **Every skill id above is final.** Use them verbatim as `SkillGenerator.id` so the
  prerequisite graph and this document cannot drift apart. A generator registered under an id
  this document does not declare fails the suite by name.
- **Prerequisites** are the previous skill in the unit, plus the last skill of any unit
  this one depends on. Unlock threshold stays at mastery ≥ 2. The manifest derives these
  rather than storing them, and commits a snapshot of the expanded graph so a change to the
  derivation is reviewable.
- **A skill with no generator is `planned`, not broken.** State is derived at load from the
  generator registry plus the capabilities that are actually built, so a stage waiting on
  KaTeX or a coordinate plane reports honestly. Planned skills are transparent to unlocking —
  a learner is never held behind our build order — and never offered for play.
- **The content style contract above is enforced**, not advisory: `src/lib/content-rules.ts`
  checks step count, step length, single-sentence hints, wall misconception coverage, and
  forward references against a curated vocabulary list, over sampled generated problems.
- **`SkillProgress` gains two fields** for skipping: `source: 'practiced' | 'tested-out' |
  'self-assessed'` and the existing mastery set to 3. These must survive a **sync round
  trip**, not just file export — sync is now the routine path, so losing them there would
  silently re-lock skipped units on the learner's next device. Both directions already
  carry them: the client pushes the whole progress record and the server stores it as an
  opaque blob, while `reconcile()` merges stored skills over defaults per skill object
  rather than per field. Adding a field to `SkillProgress` therefore needs no sync change —
  but a `reconcile()` that ever starts picking named fields out of a stored skill would
  break this, and that is the thing to watch.
- **⚠️ skills get the most misconception-prediction effort** — those are where the
  diagnosis system earns its keep, and where a learner is most likely to quit.
- **`quick` skills end at 5 correct**, and every hard unit opens with one.
- Word-problem skills at the end of Units 1–4 and 8–11 are the weakest fit for pure
  procedural generation. Plan a **templated phrasing bank** (fixed sentence frames,
  generated numbers) rather than free generation.
