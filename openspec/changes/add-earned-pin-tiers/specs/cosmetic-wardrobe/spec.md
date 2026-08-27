## MODIFIED Requirements

### Requirement: A cosmetic occupies exactly one slot

Every cosmetic SHALL declare exactly one of four slots — `back`, `headwear`, `face`, `neck` —
and at most one cosmetic per slot SHALL be worn at a time. Equipping into an occupied slot
SHALL replace what was there rather than stacking.

The character's charm SHALL NOT be a slot a cosmetic can occupy. It is earned rather than
worn, and no cosmetic SHALL be able to replace, hide, or stack with it.

A cosmetic MAY be drawn as two fragments, one behind Pip and one in front, when its shape
requires passing on both sides of the head. Both fragments SHALL share the cosmetic's single
identity: they are bought, equipped, and removed together and are never separately ownable.

#### Scenario: Equipping into an occupied slot replaces

- **WHEN** a cosmetic is equipped into a slot that already holds a different one
- **THEN** the previous cosmetic is no longer worn
- **AND** it remains owned and can be equipped again

#### Scenario: A two-fragment cosmetic is one item

- **WHEN** a cosmetic drawn both behind and in front of Pip is equipped
- **THEN** both fragments appear together
- **AND** removing it removes both

#### Scenario: No cosmetic can take the charm's place

- **WHEN** the shop is browsed and every cosmetic is worn in turn
- **THEN** the character's charm remains drawn
- **AND** no slot offered can hold something that replaces it

### Requirement: Pip draws worn cosmetics in a fixed order

Pip SHALL paint in one order regardless of what is worn: the ground shadow, `back`
cosmetics, the behind-fragments of `headwear`, Pip's ears and head, the front-fragments of
`headwear`, Pip's expression, `face` cosmetics, `neck` cosmetics, the charm, and finally any
foreground state effect. Occlusion SHALL follow from that order alone — no cosmetic
re-layers Pip's own parts.

The charm step SHALL show the character's own charm at the tier the learner has earned, and
SHALL carry the charm's motion for whatever is drawn there.

Worn cosmetics SHALL inherit Pip's per-state motion rather than restating it, and SHALL
remain legible with motion disabled: nothing a cosmetic communicates may exist only while it
is animating.

#### Scenario: A hat passes behind the ears and in front of the forehead

- **WHEN** a two-fragment headwear cosmetic is worn
- **THEN** its behind-fragment is drawn under Pip's ears and head
- **AND** its front-fragment is drawn over them

#### Scenario: The charm step draws the character's own charm

- **WHEN** any character is drawn
- **THEN** that character's own charm appears at the charm step

#### Scenario: The charm is drawn over the cosmetics beneath it

- **WHEN** cosmetics are worn in every slot at once
- **THEN** the charm is drawn after them and none of them covers it

#### Scenario: Cosmetics do not announce themselves

- **WHEN** Pip is read by a screen reader while wearing any number of cosmetics
- **THEN** the single accessible name describing Pip's state is all that is announced
