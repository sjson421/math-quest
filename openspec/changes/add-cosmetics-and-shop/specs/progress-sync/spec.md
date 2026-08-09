## MODIFIED Requirements

### Requirement: Push after meaningful progress

The app SHALL push after any change worth preserving — lesson completion, a skill
unlocking, a purchase, or a skip. Pushes SHALL be debounced so a burst of changes produces
one request.

#### Scenario: Lesson completion triggers a push

- **WHEN** a lesson completes
- **THEN** a push is scheduled

#### Scenario: A purchase triggers a push

- **WHEN** a cosmetic is bought
- **THEN** a push is scheduled carrying the reduced coin balance and the new wardrobe

#### Scenario: Rapid changes are coalesced

- **WHEN** several mutations occur within the debounce window
- **THEN** exactly one push is sent, carrying the latest state
