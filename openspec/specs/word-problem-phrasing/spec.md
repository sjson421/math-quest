# Word Problem Phrasing

## Purpose

How word problems get their words. Stories are built from a bank of fixed sentence frames
filled with generated numbers, rather than composed freely, so that every sentence a learner
reads has been read by a person first.

The frames are also where comprehension errors become predictable: only the sentence that
mentioned three quantities knows which two a learner is likely to have combined.

## Requirements

### Requirement: Word problems are built from fixed frames, not composed freely

A word problem SHALL take its wording from a bank of authored sentence frames and vary only
the quantities within them. Prose assembled from parts at generation time SHALL NOT reach a
learner. Free composition puts unreviewed sentences in front of someone whose confidence is
the scarcest resource in the course, and a clumsy sentence reads as the learner's failure to
understand rather than as the app's failure to write.

#### Scenario: Story text comes from a frame

- **WHEN** a word problem is generated
- **THEN** its prose is a frame from the bank with quantities substituted in

#### Scenario: Frames are authored, not generated

- **WHEN** the bank is inspected
- **THEN** every frame is fixed text written by a person
- **AND** no frame is assembled from smaller fragments at generation time

### Requirement: Frame selection is seeded like every other choice

Choosing which frame a problem uses SHALL draw from the same seeded generator that chooses
its operands, so a word problem is exactly as reproducible as an arithmetic one. A story that
varies between two runs of the same seed makes the whole problem unreproducible, not just its
wording.

#### Scenario: Same seed selects the same frame

- **WHEN** a word-problem skill generates twice at one seed and difficulty
- **THEN** both problems use the same frame with the same quantities

### Requirement: Frames are checked at their source, not only when sampled

Every frame in the bank SHALL be checked against the content contract directly, independently
of whether problem sampling happens to draw it. Sampling checks the frames it draws; a bank
large enough to be worth having will contain frames that a thousand draws can miss, and an
unchecked frame reaching a learner is exactly the failure the contract exists to prevent.

The quantities a bank is checked with SHALL be ones its own operation can actually produce,
and the answer the check expects SHALL be the one that operation gives. A bank checked with
quantities its draw would reject is checked against sentences no learner can see, and — worse
— stays green while the sentences that do reach a learner go unchecked. A bank whose operation
requires an ordering of its quantities, or excludes a value its distractor could take, SHALL
be checked under those constraints rather than under another bank's.

#### Scenario: Every frame is checked whether or not it is drawn

- **WHEN** the content check runs over the bank
- **THEN** every frame is checked, including ones no sample produced

#### Scenario: A frame violating the contract is rejected by name

- **WHEN** a frame would produce text that breaks the content contract
- **THEN** the check fails and names the offending frame and the rule it broke

#### Scenario: Each bank is checked with quantities its operation can produce

- **WHEN** a bank whose operation is subtraction is checked
- **THEN** the quantities it is instantiated with yield a non-negative difference
- **AND** none of them makes a predicted value equal the correct answer

#### Scenario: The expected answer follows the bank's operation

- **WHEN** the check asserts that no predicted value equals the correct answer
- **THEN** the correct answer it uses is the one the bank's operation gives
- **AND** a bank whose operation differs from another's is not checked against that other's answer

#### Scenario: Every bank in the repository is checked

- **WHEN** the frame check runs
- **THEN** it covers every authored frame bank, not only the first
- **AND** each bank is named with the skill that draws from it

### Requirement: A frame predicts the comprehension errors it invites

A frame SHALL supply the misconceptions its own wording makes likely — the wrong operation,
the wrong pair of the quantities it mentioned, or an intermediate value mistaken for the
answer. Computational misconception patterns do not reach these errors, and word problems
fail on comprehension rather than on arithmetic.

The wrong operation SHALL be the one that operation is actually confused with, not a fixed
counterpart. Addition and subtraction are each other's; a division story is misread as
multiplication, because combining the two quantities the wrong way round is what a learner who
has not identified the operation does. Predicting addition there would name an error the
wording does not invite.

#### Scenario: Frame supplies its own distractors

- **WHEN** a frame mentions three quantities and asks about two of them
- **THEN** it predicts the value produced by combining the wrong pair

#### Scenario: Wrong-operation error is predicted

- **WHEN** a frame describes a situation whose operation is commonly misread
- **THEN** it predicts the value the operation it is confused with produces

#### Scenario: A division story predicts multiplication

- **WHEN** a division frame predicts its wrong-operation error
- **THEN** the predicted value is the product of the two quantities the answer divides
- **AND** that value differs from the answer, so the prediction survives to the learner

### Requirement: A story problem carries its quantities in machine-readable form

Alongside its prose, a word problem SHALL carry the operands and operation it describes, so
that its answer can be recomputed independently without parsing English. The prose is for the
learner; the quantities are what keeps the answer verifiable.

#### Scenario: Answer is verified from the carried quantities

- **WHEN** a word problem is checked
- **THEN** its answer is re-derived from the carried operands and operation
- **AND** the check fails if that value differs from the stated answer

#### Scenario: Prose and carried quantities agree

- **WHEN** a frame substitutes quantities into its sentences
- **THEN** the numbers appearing in the prose are the operands it carries

### Requirement: A division story's quantities divide exactly

A division frame SHALL be instantiated only with quantities whose division comes out exactly —
both the pair the answer uses and the pair its wrong-pair prediction combines. A story whose
distractor produces a fraction predicts an error no learner answering on a whole-number keypad
can ever type, so it is a diagnosis that silently never fires.

The distractor SHALL differ from the second quantity, and SHALL NOT be one: dividing by one
returns the whole, which is already predicted as the intermediate-value error, and a
prediction shadowed by an earlier one never reaches the learner either.

#### Scenario: The answer is a whole number

- **WHEN** a division frame is instantiated with a quantity set
- **THEN** the first quantity divides exactly by the second

#### Scenario: The wrong-pair prediction is a whole number

- **WHEN** a division frame predicts the value produced by combining the wrong pair
- **THEN** the first quantity divides exactly by the distractor
- **AND** that value differs from the answer and from every other prediction the frame makes

#### Scenario: A division bank is checked with quantities its own operation admits

- **WHEN** the source-level frame check instantiates a division bank
- **THEN** it uses quantity sets declared for the division operator
- **AND** the check fails naming the operator if none are declared

### Requirement: Proper-fraction stories use authored source-checked frames

A word problem asking for a part-over-whole fraction SHALL draw from a bank of at least eight
fixed adult-situation frames. Frame selection SHALL use the problem's seeded generator, and
every frame SHALL be checked directly against the content contract using quantity sets that
produce a positive proper fraction and three distinct surviving comprehension predictions.

#### Scenario: Every fraction frame is checked even when unsampled

- **WHEN** the source-level frame check runs
- **THEN** every authored fraction frame is checked and identified by its stable id
- **AND** an unregistered fraction frame bank fails the check

#### Scenario: Fraction check quantities match generated stories

- **WHEN** a fraction frame is instantiated for source checking
- **THEN** its part is positive and smaller than its whole
- **AND** its irrelevant quantity differs from the whole and is greater than one

#### Scenario: Three comprehension predictions survive

- **WHEN** a fraction frame combines its checked quantities
- **THEN** multiplying part and whole, dividing the part by the irrelevant quantity, and
  answering with the part produce three distinct values
- **AND** none equals the correct part-over-whole fraction
