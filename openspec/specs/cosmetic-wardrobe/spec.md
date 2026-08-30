# Cosmetic Wardrobe

## Purpose

What the learner buys with coins: who they play as, and what that character wears. Cosmetics
are small layers hung off the character's existing geometry rather than alternate drawings,
so a wardrobe of any size costs one render pass and every future expression keeps working.
Characters are the same trade one level down — a coat and a handful of fragments over shared
anchors, never a second mascot. Coins earned by finishing lessons are the only currency, and
nothing here gates or accelerates learning.

## Requirements

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

### Requirement: The learner plays as exactly one character

The learner SHALL always be playing as exactly one character, and the mascot SHALL be drawn
as that character everywhere it appears. One character SHALL be free and SHALL be the one a
new record starts as; every other character SHALL be bought with coins like any other item.

A character SHALL have no slot and SHALL NOT be removable. Choosing another character
replaces the current one, which is the only way to stop being one.

Choosing a character SHALL NOT change what is owned, worn, or placed. Every cosmetic SHALL
fit every character, because all characters share the anchors cosmetics are authored
against — buying a character never costs the learner an accessory.

#### Scenario: A new record starts as the free character

- **WHEN** a progress record is created
- **THEN** the learner is playing as the free character
- **AND** it is owned without having been bought

#### Scenario: The free character cannot be bought

- **WHEN** a learner tries to buy the free character
- **THEN** the purchase is refused and no coins are deducted

#### Scenario: Choosing a character keeps the outfit

- **WHEN** a learner wearing cosmetics changes to a different owned character
- **THEN** the same cosmetics are still worn
- **AND** the room is unchanged

#### Scenario: A character cannot be taken off

- **WHEN** the learner is playing as a character
- **THEN** there is no action that leaves them playing as nobody

### Requirement: Cosmetics are bought with coins

A cosmetic SHALL be owned only by being bought at its price in coins. A purchase SHALL be
refused when the learner cannot afford it, and refused when the cosmetic is already owned;
a refused purchase SHALL leave the coin balance and the wardrobe unchanged. A successful
purchase SHALL deduct exactly the price and SHALL NOT alter XP, streak, mastery, or any
other progress.

Prices SHALL be set against the rate coins are actually earned, so that the cheapest
cosmetic is reachable within the first few lessons and the most expensive is a goal rather
than an afternoon.

A character priced at zero SHALL be treated as already owned rather than as something to
buy, so that a record written before characters existed loads with one without a migration.

#### Scenario: Buying deducts the price

- **WHEN** a learner with 100 coins buys a cosmetic priced at 40
- **THEN** the balance becomes 60
- **AND** the cosmetic is owned

#### Scenario: Buying what cannot be afforded is refused

- **WHEN** a learner with 30 coins tries to buy a cosmetic priced at 40
- **THEN** the purchase is refused
- **AND** the balance is still 30 and the cosmetic is not owned

#### Scenario: Buying the same cosmetic twice is refused

- **WHEN** a learner buys a cosmetic they already own
- **THEN** the purchase is refused and no coins are deducted

#### Scenario: A purchase changes nothing but coins and the wardrobe

- **WHEN** a purchase succeeds
- **THEN** XP, streak, daily progress, and every skill's mastery are unchanged

### Requirement: A cosmetic may require a streak to buy, never to keep

A cosmetic MAY declare a number of consecutive practised days required before it can be
bought. Until the learner's streak reaches that number the cosmetic SHALL NOT be
purchasable at any coin balance, and the shop SHALL name the day it opens rather than
stating only that it is locked.

**Ownership SHALL outrank the requirement.** A cosmetic already bought SHALL remain owned,
equippable, worn and re-equippable however far the streak later falls. Losing a streak SHALL
never take back, hide, or unequip anything the learner has already bought.

The refusal SHALL be enforced where the purchase is decided rather than only where the shop
card is drawn, so that the gate is a rule rather than a rendering.

A cosmetic that declares no requirement SHALL be purchasable from the first lesson, which is
every cosmetic that shipped before streaks carried stakes.

#### Scenario: A locked cosmetic cannot be bought at any balance

- **WHEN** a learner whose streak is below a cosmetic's requirement tries to buy it
- **THEN** the purchase is refused however many coins they hold
- **AND** the shop names the streak length that would open it

#### Scenario: Reaching the day opens it

- **WHEN** the learner's streak reaches the required number of days
- **THEN** the cosmetic is offered at its price like any other

#### Scenario: A broken streak does not take back what was bought

- **WHEN** a learner who bought a streak-locked cosmetic loses their streak
- **THEN** the cosmetic is still owned, still worn if it was worn, and can be removed and
  put back on

### Requirement: Only owned cosmetics can be worn

Equipping a cosmetic that is not owned SHALL be refused. An owned cosmetic SHALL be
equippable and removable at will, at no cost, and removing one SHALL NOT refund it or give
it up.

#### Scenario: Equipping an unowned cosmetic is refused

- **WHEN** a learner equips a cosmetic they have not bought
- **THEN** the request is refused and nothing is worn

#### Scenario: Removing keeps ownership

- **WHEN** an equipped cosmetic is removed
- **THEN** the slot is empty
- **AND** the cosmetic is still owned

### Requirement: Every character draws worn cosmetics in a fixed order

A character SHALL paint in one order regardless of what is worn: the ground shadow, `back`
cosmetics, the behind-fragments of `headwear`, the ears and head, the front-fragments of
`headwear`, the expression, `face` cosmetics, `neck` cosmetics, the charm, and finally any
foreground state effect. Occlusion SHALL follow from that order alone — no cosmetic
re-layers a character's own parts.

The charm step SHALL show the character's own charm at the tier the learner has earned, and
SHALL carry the charm's motion for whatever is drawn there.

Worn cosmetics SHALL inherit the character's per-state motion rather than restating it, and
SHALL remain legible with motion disabled: nothing a cosmetic communicates may exist only
while it is animating.

#### Scenario: A hat passes behind the ears and in front of the forehead

- **WHEN** a two-fragment headwear cosmetic is worn
- **THEN** its behind-fragment is drawn under the ears and head
- **AND** its front-fragment is drawn over them

#### Scenario: The charm step draws the character's own charm

- **WHEN** any character is drawn
- **THEN** that character's own charm appears at the charm step

#### Scenario: The charm is drawn over the cosmetics beneath it

- **WHEN** cosmetics are worn in every slot at once
- **THEN** the charm is drawn after them and none of them covers it

#### Scenario: Cosmetics do not announce themselves

- **WHEN** a character is read by a screen reader while wearing any number of cosmetics
- **THEN** the single accessible name describing its state is all that is announced

### Requirement: The wardrobe is part of the progress record

Owned cosmetics, what is worn, and which character is being played as SHALL live in the
learner's progress record rather than in storage of their own, so that whatever preserves XP
and mastery preserves the wardrobe by the same route. How that record is synced, pushed, and
restored is `progress-sync`'s requirement and is not restated here.

A progress record written before cosmetics existed SHALL load without migration, with
nothing owned, nothing worn, and the free character being played as.

#### Scenario: The wardrobe travels with the rest of progress

- **WHEN** a progress record is restored from elsewhere onto this device
- **THEN** the cosmetics it owns are owned
- **AND** what it had worn is worn

#### Scenario: An older backup loads

- **WHEN** a progress record that predates cosmetics is loaded
- **THEN** it loads with an empty wardrobe rather than failing

### Requirement: Cosmetics ship in the bundle

Every cosmetic SHALL be drawable with no network access: its artwork SHALL be part of the
application bundle, with no remote image, font, or runtime fetch. The app is installed and
used offline, so a cosmetic that needs the network is a cosmetic that disappears on the
device of the learner least able to get it back.

#### Scenario: The wardrobe works with no network

- **WHEN** Pip is drawn wearing any cosmetic with no network available
- **THEN** it appears exactly as it does online

### Requirement: A cosmetic the catalogue no longer knows is kept, not drawn

A cosmetic id in stored progress that the catalogue does not recognise SHALL be retained in
the record rather than discarded, and SHALL NOT be drawn on Pip or offered in the shop. The
check SHALL happen on every read, because a record can arrive from sync at any time and is
never migrated in storage.

#### Scenario: An unknown owned id is retained

- **WHEN** stored progress owns a cosmetic id the catalogue does not contain
- **THEN** the id is kept in the record
- **AND** it appears nowhere in the shop

#### Scenario: An unknown equipped id draws nothing

- **WHEN** stored progress equips a cosmetic id the catalogue does not contain
- **THEN** that slot draws nothing
- **AND** the rest of Pip and the other slots draw normally

#### Scenario: An unknown character id draws the free character

- **WHEN** stored progress names a character the catalogue does not contain
- **THEN** the free character is drawn rather than nothing
- **AND** what is worn and placed is unaffected

### Requirement: The shop is reachable from the coin balance

The coin balance SHALL be the way into the shop, so the reward and the thing it buys are one
tap apart. The shop SHALL show every catalogue item — the characters the learner can be,
the cosmetics they wear, and the decorations that go in their room — with its price and, for
each, whether it is affordable, already owned, or currently in use.

Each item SHALL be shown as it actually appears where it belongs rather than as an icon: a
character on its own, a cosmetic on the character currently being played as, a decoration in
the room. Items of the three kinds SHALL be distinguishable from one another in the shop
rather than presented as one undifferentiated list.

Leaving the shop SHALL return to the level of the course the learner came from.

#### Scenario: Each cosmetic states where the learner stands with it

- **WHEN** the shop is open
- **THEN** every cosmetic shows its price and whether it is owned, worn, or affordable

#### Scenario: Each decoration states where the learner stands with it

- **WHEN** the shop is open
- **THEN** every decoration shows its price and whether it is owned, in the room, or affordable

#### Scenario: Each character states where the learner stands with it

- **WHEN** the shop is open
- **THEN** every character shows its price and whether it is owned, played as, or affordable
- **AND** the one being played as offers no way to take it off

#### Scenario: Each kind is previewed where it belongs

- **WHEN** the shop is open
- **THEN** each cosmetic is shown drawn on the character being played as
- **AND** each decoration is shown drawn in the room
- **AND** each character is shown drawn on its own

#### Scenario: The shop returns to where it was opened from

- **WHEN** the shop is closed
- **THEN** the screen the learner opened it from is shown again
