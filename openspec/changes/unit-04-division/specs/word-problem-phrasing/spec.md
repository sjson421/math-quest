## ADDED Requirements

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

## MODIFIED Requirements

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
