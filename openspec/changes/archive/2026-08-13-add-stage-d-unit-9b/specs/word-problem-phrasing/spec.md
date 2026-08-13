## MODIFIED Requirements

### Requirement: A story problem carries its quantities in machine-readable form

Alongside its prose, a word problem SHALL carry the operands and operation it describes, so
that its answer can be recomputed independently without parsing English. The prose is for the
learner; the quantities are what keeps the answer verifiable.

A money-problem story is the one exception to the operands and the stated answer sharing a
unit directly: it carries its price and quantity as exact integer cents (so their product is
exact under ordinary arithmetic), and its stated answer is that product expressed as a dollar
amount — the value recomputed from the carried operands, divided by 100. This is stated once
here rather than as a per-skill exception, since it is the same "recompute independently"
guarantee applied to a display whose learner-facing amount is not the same unit as its exact
carried source.

#### Scenario: Answer is verified from the carried quantities

- **WHEN** a word problem is checked
- **THEN** its answer is re-derived from the carried operands and operation
- **AND** the check fails if that value differs from the stated answer

#### Scenario: Prose and carried quantities agree

- **WHEN** a frame substitutes quantities into its sentences
- **THEN** the numbers appearing in the prose are the operands it carries

#### Scenario: A money answer is re-derived in cents, then expressed in dollars

- **WHEN** a `money-problems` story is checked
- **THEN** its answer is re-derived by multiplying its carried price and quantity in cents
- **AND** the check fails if that product, divided by 100, differs from the stated dollar amount

## ADDED Requirements

### Requirement: Money-problem stories use authored, source-checked frames

A word problem asking for a dollars-and-cents result SHALL draw from a bank of at least eight
fixed adult-situation frames, each a price-times-quantity purchase total. Frame selection
SHALL use the problem's seeded generator, and every frame SHALL be checked directly against
the content contract using quantity sets that produce a nonnegative dollars-and-cents result
and predict the comprehension errors that frame's wording invites.

A money frame's quantities SHALL be carried as exact integer cents, so its result is exact
under addition, subtraction, and multiplication without floating-point rounding. Its prose
SHALL display each quantity as a dollar amount while its carried operands remain integer
cents.

#### Scenario: Every money frame is checked even when unsampled

- **WHEN** the source-level frame check runs
- **THEN** every authored money frame is checked and identified by its stable id
- **AND** an unregistered money frame bank fails the check

#### Scenario: Money check quantities match generated stories

- **WHEN** a money frame is instantiated for source checking
- **THEN** its quantities are dollars-and-cents values its own operation can produce
- **AND** the expected answer is the one that operation gives
