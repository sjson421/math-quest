## MODIFIED Requirements

### Requirement: An answer that is right in value but wrong in form is answered as such

When a submitted answer matches the expected value but not the form the skill is teaching, the
lesson SHALL respond to that specifically: it SHALL tell the learner the value is right and ask
for the form, and it SHALL NOT show the worked solution.

A skill SHALL be able to require lowest terms, SHALL be able to require mixed form, SHALL be
able to require decimal notation, and SHALL be able to require fraction notation; each
requirement has its own response naming the form the entry is missing. When more than one
applies, an entry missing the mixed form is answered about the mixed form before any reduction
question; decimal notation and fraction notation are mutually exclusive on one answer, since a
skill teaches conversion in exactly one direction.

The lesson SHALL treat a right value in the wrong form as not yet complete — the correct-answer
count does not advance and the problem returns later in the session, exactly as any other
unfinished problem does. The attempt SHALL be recorded as incorrect, with no misconception tag,
since the mistake is one the generator did not predict a value for.

Withholding the worked solution is the point. Partial simplification is the named wall at
`simplify-fractions`, and a learner who reached the right value has done the arithmetic; handing
them the full working answers a question they did not get wrong and removes the only step left
to take. The same holds for a learner who computed the amount but not the mixed form, decimal
form, or fraction form it is taught in.

#### Scenario: An unreduced answer is acknowledged, not corrected

- **WHEN** a learner submits a numerically correct answer that is not in the required form
- **THEN** the learner is told the value is right and asked for the required form
- **AND** the worked solution is not shown

#### Scenario: An unreduced answer does not complete the problem

- **WHEN** a learner submits a numerically correct answer that is not in the required form
- **THEN** the correct-answer count does not advance
- **AND** the problem returns later in the same session
- **AND** the attempt is recorded as incorrect with no misconception tag

#### Scenario: An improper entry is asked for in mixed form

- **WHEN** a learner submits a numerically correct answer as an improper fraction where mixed
  form is required
- **THEN** the learner is told the value is right and asked for mixed form
- **AND** the worked solution is not shown and the problem does not complete

#### Scenario: A mixed entry is answered about reduction, not form

- **WHEN** a learner submits a numerically correct answer in mixed form that is not reduced
- **THEN** the learner is told the value is right and asked for lowest terms
- **AND** the mixed-form question is not asked again

#### Scenario: A fraction entry is asked for in decimal form

- **WHEN** a learner submits a numerically correct answer written as a fraction where decimal
  form is required
- **THEN** the learner is told the value is right and asked to write it as a decimal
- **AND** the worked solution is not shown and the problem does not complete

#### Scenario: A decimal entry is asked for in fraction form

- **WHEN** a learner submits a numerically correct answer written as a decimal where fraction
  form is required
- **THEN** the learner is told the value is right and asked to write it as a fraction
- **AND** the worked solution is not shown and the problem does not complete
