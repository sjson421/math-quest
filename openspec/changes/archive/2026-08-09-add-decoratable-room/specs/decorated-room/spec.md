## Purpose

The room Pip lives in, and what the learner puts in it. Decorations are bought with the same
coins as cosmetics and stand in named positions on a fixed surface, so a room of any size
costs one paint pass and nothing a learner places can obscure the character.

## ADDED Requirements

### Requirement: The room is a fixed surface with named placement slots

The room SHALL be one surface — a wall above and a floor below a fixed horizon — drawn in a
single coordinate space that contains Pip's own canvas at the same unit scale, so a
decoration and a cosmetic are authored in the same units and neither is scaled into place.

The surface SHALL be structure rather than stock: its size, its horizon, and the colours of
its wall and floor are fixed and SHALL NOT be purchasable.

A decoration SHALL declare exactly one of four slots — `rug`, `wall`, `left`, `right` — and
at most one decoration per slot SHALL be placed at a time. Placing into an occupied slot
SHALL replace what was there rather than stacking.

#### Scenario: The room is drawn with nothing placed

- **WHEN** a learner who owns no decorations sees the room
- **THEN** the wall, the floor and Pip are drawn
- **AND** no decoration is drawn

#### Scenario: Placing into an occupied slot replaces

- **WHEN** a decoration is placed in a slot that already holds a different one
- **THEN** the previous decoration is no longer in the room
- **AND** it remains owned and can be placed again

### Requirement: Every decoration is painted behind Pip

The room SHALL paint in one order regardless of what is placed: the surface, then the `rug`,
`wall`, `left` and `right` decorations, and finally Pip.

**Pip SHALL be painted as a single step.** No decoration may be drawn between two of Pip's
own layers, so the room's order and Pip's ten-step order can never disagree about what
occludes what. A decoration SHALL therefore never obscure Pip's face or any cosmetic he
wears.

#### Scenario: A decoration overlapping Pip passes behind him

- **WHEN** a placed decoration occupies the same area of the room as Pip
- **THEN** Pip is drawn over it
- **AND** every cosmetic he wears is drawn over it too

#### Scenario: Pip's own occlusion is unaffected by the room

- **WHEN** Pip wears a cosmetic that passes behind his head while the room holds decorations
- **THEN** that cosmetic is still drawn behind his head and in front of every decoration

### Requirement: Decorations share the wardrobe's coins and inventory

A decoration SHALL be bought with the same coins as a cosmetic and SHALL be recorded as
owned in the same inventory, so the learner has one purse and one list of what they own
rather than two of each. How a purchase is refused, what it deducts, and what it must leave
untouched are `cosmetic-wardrobe`'s requirements and are not restated here.

Decoration prices SHALL be set against the rate coins are actually earned, on the same basis
as cosmetic prices, so that adding the room does not turn the course into a grind.

#### Scenario: Buying a decoration spends the same coins

- **WHEN** a learner buys a decoration
- **THEN** its price is deducted from the same balance a cosmetic would be bought with
- **AND** the decoration is owned

#### Scenario: One inventory holds both kinds

- **WHEN** a learner owns both cosmetics and decorations
- **THEN** both appear in the one record of what they own

### Requirement: Only owned decorations can be placed

Placing a decoration that is not owned SHALL be refused. An owned decoration SHALL be
placeable and removable at will, at no cost, and removing one SHALL NOT refund it or give it
up.

A decoration SHALL NOT be placeable into a slot that holds cosmetics, and a cosmetic SHALL
NOT be placeable into a room slot; the two sets of slots are disjoint.

#### Scenario: Placing an unowned decoration is refused

- **WHEN** a learner places a decoration they have not bought
- **THEN** the request is refused and the room is unchanged

#### Scenario: Removing keeps ownership

- **WHEN** a placed decoration is removed
- **THEN** the slot is empty
- **AND** the decoration is still owned

#### Scenario: Removing from an empty slot changes nothing

- **WHEN** a slot holding no decoration is cleared
- **THEN** the request is refused and the progress record is not marked as changed

### Requirement: Placement is part of the progress record

What stands in each room slot SHALL live in the learner's progress record rather than in
storage of its own, so that whatever preserves XP, mastery and the wardrobe preserves the
room by the same route. How that record is synced, pushed, and restored is `progress-sync`'s
requirement and is not restated here.

A progress record written before the room existed SHALL load without migration, with an
empty room. A stored value of the wrong shape SHALL load as an empty room rather than
producing a room of nonsense entries.

#### Scenario: The room travels with the rest of progress

- **WHEN** a progress record is restored from elsewhere onto this device
- **THEN** the decorations it owns are owned
- **AND** what it had placed is placed

#### Scenario: An older backup loads

- **WHEN** a progress record that predates the room is loaded
- **THEN** it loads with an empty room rather than failing

#### Scenario: A malformed room value loads as empty

- **WHEN** stored progress carries a room value that is not a slot-to-id record
- **THEN** the room loads empty
- **AND** the rest of the record loads normally

### Requirement: A decoration the catalogue no longer knows is kept, not drawn

A decoration id in stored progress that the catalogue does not recognise SHALL be retained in
the record rather than discarded, and SHALL NOT be drawn in the room or offered in the shop.
The check SHALL happen on every read, because a record can arrive from sync at any time and
is never migrated in storage.

#### Scenario: An unknown placed id draws nothing

- **WHEN** stored progress places a decoration id the catalogue does not contain
- **THEN** that slot draws nothing
- **AND** the rest of the room and the other slots draw normally

#### Scenario: An unknown owned id is retained

- **WHEN** stored progress owns a decoration id the catalogue does not contain
- **THEN** the id is kept in the record
- **AND** it appears nowhere in the shop

### Requirement: Pip stands in the room at a fixed position and size

Pip SHALL be drawn in the room at a position and size fixed by the room's own coordinate
space, not chosen per screen, so that a decoration authored against the room's anchors meets
the character where the contract says it will.

Pip's rendered size and his own geometry SHALL be unchanged by being placed in a room: the
room contains his canvas rather than scaling it.

#### Scenario: Pip is drawn in the room wearing what is equipped

- **WHEN** the room is shown for a learner wearing cosmetics
- **THEN** Pip appears in the room wearing exactly those cosmetics

#### Scenario: The room announces itself once

- **WHEN** the room is read by a screen reader
- **THEN** the accessible name describing Pip's state is announced
- **AND** no decoration announces itself separately

### Requirement: The room ships in the bundle

Every decoration and the room surface itself SHALL be drawable with no network access: their
artwork SHALL be part of the application bundle, with no remote image, font, or runtime
fetch. The app is installed and used offline, so a decoration that needs the network is a
decoration that disappears on the device of the learner least able to get it back.

#### Scenario: The room works with no network

- **WHEN** the room is drawn holding any decoration with no network available
- **THEN** it appears exactly as it does online
