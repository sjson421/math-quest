## 1. Verifiable inline whole-number problems

- [x] 1.1 Add optional whole-number values and a closed operation union to the existing inline
      display, per design *Decision 1*. Keep the existing renderer and answer slot; add only the
      responsive text sizing needed for long number names at phone width.
- [x] 1.2 Extend `ProblemView` server-render tests for long number-name text, one numeral,
      comparison with a question mark, ordering with three values, keypad entry, and
      choice-label entry. Confirm the existing inline branch renders them without a new display
      kind or input surface.
- [x] 1.3 Extend independent generator recomputation for all eight whole-number operations.
      Re-derive visible inline text; numeric tasks derive a number from metadata; comparison and
      ordering derive an expected visible label and resolve exactly one declared choice id. Add
      synthetic cases proving wrong text, a wrong numeric answer, a wrong id mapping, missing or
      duplicate expected labels, and duplicate choice ids are caught and named.
- [x] 1.4 Extend central misconception filtering to treat a finite numeric choice id as the
      correct numeric value while leaving opaque ids unchanged. Add synthetic cases in
      `lib/generator.test.ts` for both shapes. Update difficulty measurement to use displayed
      source magnitude for whole-number tasks, with a synthetic flat whole-number ladder that
      fails and an existing arithmetic shape that keeps its former measurement. Include inline
      display text in learner-facing content checks and prove a synthetic offending term is named.

## 2. Unit 0 generators

- [x] 2.1 Implement `read-numbers` (0.1, `quick`) in a new `unit-00-numbers.ts`: seeded 10–999
      draws, English number wording displayed through inline metadata, a keypad answer, and
      place-swap/dropped-place diagnoses per design *Decisions 5–7*.
- [x] 2.2 Add focused and recorded-output tests for `read-numbers`: 0–999 wording-helper cases
      including zero-bearing values; generated problems from 10–999; five seeds × five
      difficulties; answer recomputation, diagnosis, determinism, scaling, variety, and the
      learner-facing content contract.
- [x] 2.3 Implement `place-value-tens` (0.2): difficulty-scaled two- and three-digit values,
      keypad answer derived as the tens digit, and predictions for the ones digit and the whole
      multiple of ten. On a zero-tens three-digit value, predict the hundreds digit instead so
      the second diagnosis remains distinct.
- [x] 2.4 Add recorded-output and sampled tests for `place-value-tens`, including values with a
      zero tens digit and synthetic checks that each predicted value matches its named mistake.
- [x] 2.5 Implement `place-value-hundreds` (0.3): difficulty-scaled three-digit values, keypad
      answer derived as the hundreds digit, and predictions for the tens digit and the whole
      hundreds value.
- [x] 2.6 Add recorded-output and sampled tests for `place-value-hundreds`, including zeroes in
      lower places and synthetic checks for each prediction.
- [x] 2.7 Implement `expanded-form` (0.4): three-digit draws, an expanded inline expression
      built from non-zero place parts, a keypad answer, and diagnoses for treating place digits
      as plain addends or omitting a non-zero place value. When tens is zero, omit hundreds so
      that prediction remains distinct.
- [x] 2.8 Add focused formatter, recorded-output, and sampled tests for `expanded-form`,
      including values with zero ones or tens and an independently derived visible expression
      and numeric answer.
- [x] 2.9 Implement `compare-numbers` (0.5): less-than, equality, and greater-than cases across
      the seeded sample; choice labels `<`, `=`, `>`; numeric relation ids; and
      reversal/equality diagnoses computed from the displayed pair.
- [x] 2.10 Add recorded-output and sampled tests for `compare-numbers`, explicitly covering all
      three relations, declaration-order independence after seeded shuffling, unique ids, and
      prediction values that never equal the correct choice id.
- [x] 2.11 Implement `order-numbers` (0.6): three distinct difficulty-scaled values, ascending
      answer, seeded choices for the correct order, descending order, and a last-two swap, with
      unique numeric permutation ids and specific diagnoses.
- [x] 2.12 Add recorded-output and sampled tests for `order-numbers`, independently sorting the
      displayed values and proving each wrong option label and id match its diagnosis.
- [x] 2.13 Implement `round-to-10` (0.7): non-degenerate difficulty-scaled values, keypad answer
      using the midpoint-up rule, and lower-neighbour, upper-neighbour, and unchanged-value
      predictions derived from the displayed number.
- [x] 2.14 Add recorded-output and sampled tests for `round-to-10`, explicitly covering exact
      midpoints, values on both sides, central filtering, and independently recomputed answers.
- [x] 2.15 Implement wall skill `round-to-100` (0.8): draws that keep nearest-ten distinct from
      both neighbouring hundreds, midpoint-up keypad answers, and lower-hundred, upper-hundred,
      and rounded-only-to-tens predictions per design *Decision 6*.
- [x] 2.16 Add recorded-output and sampled tests for `round-to-100`, including exact midpoints,
      both sides of halfway, independently recomputed answers, and at least two distinct
      surviving diagnoses on every sampled problem.

## 3. Registry, graph, and documents

- [x] 3.1 Register `unit00` before `unit01`, mark all eight Unit 0 rows ✅ in
      `docs/curriculum.md`, and update generator coverage from 10 implemented / 191 planned to
      18 implemented / 183 planned. Confirm Stage A resolves as implemented because
      `choice-input` is already available and presentation order matches the manifest. Assert
      every registered generator name and blurb matches its manifest entry and each blurb stays
      within the 32-character Home-card limit.
- [x] 3.2 Update and review the committed unlock snapshot: `read-numbers` is the root, every
      Unit 0 skill follows its manifest predecessor, and `add-facts-small` moves behind
      `round-to-100`; no other implemented edge changes.
- [x] 3.3 Add the store regression this graph shift needs: a record with attempts on
      `add-facts-small` and no Unit 0 progress keeps that skill unlocked with its mastery
      unchanged. Update existing completed-prefix fixtures without weakening their assertions.
- [x] 3.4 Correct documentation facts made stale by this change: the playable count and
      playable-stage/input wording at the top of `docs/roadmap.md` (including that comparison
      and ordering now consume choice input), roadmap item 6 checked with shipped date
      2026-08-01, and `AGENTS.md` recording `unit-0-numbers` as the active queue entry until archive.
- [x] 3.5 Run `npm test` and inspect complete Unit 0 snapshots and sampled generator output,
      including the curriculum document cross-check and wall-content contract.

## 4. Verify

- [x] 4.1 Run `npm run build`, then `npm run lint`; only the three documented pre-existing
      `Settings.tsx` warnings may remain.
- [x] 4.2 Run `openspec validate unit-0-numbers --strict` and confirm the delta requirements
      describe inline evidence, all eight generators, input modes, midpoint behavior, unique
      choice ids, and wall diagnoses as implemented.
- [x] 4.3 Drive the real app at phone width in a controlled browser. Confirm Home shows 18 cards
      in curriculum order with `read-numbers` first and open; exercise read, expanded-form,
      compare, order, and a fixed-seed midpoint from `round-to-100`; verify number names and
      choice labels fit, only compare/order omit the keypad, midpoint feedback is specific, and
      `read-numbers` completes after 5 correct. Remove temporary IndexedDB progress and stop any
      server this workflow starts.
