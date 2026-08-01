## MODIFIED Requirements

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
