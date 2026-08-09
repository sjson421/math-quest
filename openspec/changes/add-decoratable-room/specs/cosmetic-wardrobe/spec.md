## MODIFIED Requirements

### Requirement: The shop is reachable from the coin balance

The coin balance SHALL be the way into the shop, so the reward and the thing it buys are one
tap apart. The shop SHALL show every catalogue item — the cosmetics Pip wears and the
decorations that go in his room — with its price and, for each, whether it is affordable,
already owned, or currently in use.

Each item SHALL be shown as it actually appears where it belongs rather than as an icon: a
cosmetic on Pip, a decoration in the room. Items of the two kinds SHALL be distinguishable
from one another in the shop rather than presented as one undifferentiated list.

Leaving the shop SHALL return to the level of the course the learner came from.

#### Scenario: Each item states where the learner stands with it

- **WHEN** the shop is open
- **THEN** every item shows its price and whether it is owned, in use, or affordable

#### Scenario: Each kind is previewed where it belongs

- **WHEN** the shop is open
- **THEN** each cosmetic is shown drawn on Pip
- **AND** each decoration is shown drawn in the room

#### Scenario: The shop returns to where it was opened from

- **WHEN** the shop is closed
- **THEN** the screen the learner opened it from is shown again
