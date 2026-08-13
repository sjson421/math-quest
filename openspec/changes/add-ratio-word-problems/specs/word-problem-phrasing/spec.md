## ADDED Requirements

### Requirement: Ratio stories use authored source-checked frames

Ratio word problems SHALL draw from a bank of at least eight fixed adult-situation frames.
Every frame SHALL state two category counts and their computed total, SHALL provide fixed
wording for both a first-to-second and a first-to-whole request, and SHALL be selected from
the problem's seeded generator.

Every authored ratio frame SHALL be checked directly against the content contract whether or
not problem sampling draws it. Source checks SHALL cover both comparison types and quantity
sets that keep the answer and both required comprehension predictions positive and distinct.

#### Scenario: Every ratio frame is checked in both comparison modes

- **WHEN** the source-level frame check runs
- **THEN** every authored ratio frame is checked as both part-to-part and part-to-whole
- **AND** a violating frame is reported by its stable id

#### Scenario: Ratio frame quantities match their prose

- **WHEN** a ratio frame is instantiated with first count 3 and second count 2
- **THEN** its prose states 3 in the first category, 2 in the second, and 5 in all
- **AND** its structured data carries those counts and the requested comparison

#### Scenario: An unregistered ratio frame bank fails the source check

- **WHEN** an authored ratio frame bank exists in the phrasing directory
- **THEN** the source-level registry includes it for direct checking
- **AND** the check fails if the bank is not registered
