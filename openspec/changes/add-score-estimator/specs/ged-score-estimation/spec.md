## Purpose

Turns practice points into a transparent GED Mathematical Reasoning scaled-score estimate while
keeping the approximation, official score bands, and limits clear to every learner.

## ADDED Requirements

### Requirement: Practice points produce one transparent scaled-score estimate

The estimator SHALL accept an earned whole-number practice-point count and a positive
whole-number possible-point count, both within JavaScript's safe-integer range. Earned points
SHALL be from zero through possible points. It SHALL reject inputs containing non-finite or
fractional values, values outside the safe-integer range, a negative earned count, a non-positive
possible count, or an earned count above the possible count rather than produce a score from
invalid data.

For valid points, the estimator SHALL use the exact earned-to-possible ratio without first
rounding the percentage. It SHALL linearly interpolate within this ordered mapping:

| Practice points earned | Estimated scaled score |
| --- | --- |
| 0% | 100 |
| 43% | 150 |
| 78% | 170 |
| 100% | 200 |

It SHALL round the interpolated value to the nearest whole scaled-score point, with an exact
half point rounding upward, and SHALL return a value from 100 through 200. The same ratio SHALL
produce the same estimate regardless of the possible-point total.

#### Scenario: Published reference ratios remain exact

- **WHEN** earned practice points are 0, 43, 78, and 100 out of 100
- **THEN** their estimated scaled scores are 100, 150, 170, and 200 respectively

#### Scenario: Equivalent forms produce the same estimate

- **WHEN** one practice form earns 43 of 100 points and another earns 86 of 200 points
- **THEN** both estimated scaled scores are 150

#### Scenario: Values between references are interpolated

- **WHEN** an earned-point ratio lies between two adjacent mapping rows
- **THEN** its score is linearly interpolated between those rows and rounded once to a whole
  scaled-score point
- **AND** increasing the earned points for one fixed total never lowers the estimate

#### Scenario: Invalid points fail closed

- **WHEN** either point count is fractional, non-finite, or outside JavaScript's safe-integer
  range, possible points are not positive, or earned points fall outside zero through possible
  points
- **THEN** estimation is rejected with an error that identifies invalid GED practice points
- **AND** no plausible-looking scaled score is returned

### Requirement: Estimates use the current GED score bands

Every valid estimate SHALL be assigned exactly one current GED Mathematical Reasoning band:

- 100–144: Below Passing
- 145–164: High School Equivalency
- 165–174: College Ready
- 175–200: College Ready + Credit

Band boundaries SHALL be determined from the estimated scaled score, not from a separately
rounded raw percentage.

#### Scenario: Every boundary changes bands at the documented score

- **WHEN** estimated scores at 144, 145, 164, 165, 174, and 175 are classified
- **THEN** 144 is Below Passing and 145 is High School Equivalency
- **AND** 164 is High School Equivalency and 165 is College Ready
- **AND** 174 is College Ready and 175 is College Ready + Credit

#### Scenario: Scale endpoints remain classified

- **WHEN** the estimated score is 100 or 200
- **THEN** 100 is Below Passing and 200 is College Ready + Credit

### Requirement: Result presentation cannot be mistaken for an official score

The result SHALL visibly state the earned and possible practice points, identify the number as
an estimated GED Math scaled score, and identify its band as estimated. The number SHALL be
phrased as approximate rather than presented as an official test result.

An always-visible caveat beside the result SHALL explain that GED Testing Service uses
form-specific equating and scored points, so an official score can differ and only an official
score report determines a test outcome. The result SHALL NOT state that the learner passed,
earned a credential, or received an official GED score.

#### Scenario: A result keeps its evidence and caveat together

- **WHEN** a learner views an estimate based on 43 of 100 practice points
- **THEN** the result shows 43 of 100 practice points and an estimated scaled score of about 150
- **AND** it identifies the estimated High School Equivalency band
- **AND** the form-equating and official-score caveat is visible without opening another view

#### Scenario: An estimated passing-band value is not a pass claim

- **WHEN** an estimate falls at or above 145
- **THEN** the result may name its estimated score band
- **AND** it does not say that the learner passed or earned a GED credential

### Requirement: Learners can inspect the approximation and its sources

Every result SHALL provide the four-row mapping used for interpolation, state that values
between rows are interpolated, and identify the GED Testing Service 2022 Technical Manual
score-scaling and Mathematical Reasoning reference data as the mapping source. It SHALL also
identify the Technical Manual's updated performance-level ranges together with GED Testing
Service's current score-level guidance as the sources of the four band boundaries and labels.

The displayed mapping SHALL derive from the same ordered values used for calculation so the
explanation cannot drift from the estimate. Result calculation, caveat, source names, and the
complete mapping SHALL remain available without a runtime network request.

#### Scenario: Mapping details match calculation

- **WHEN** a learner inspects how an estimate was calculated
- **THEN** the result shows 0% = 100, 43% = 150, 78% = 170, and 100% = 200 in order
- **AND** it explains interpolation between those rows
- **AND** the displayed rows are the rows used by the estimator

#### Scenario: Offline results retain their explanation

- **WHEN** Math Quest has no network connection
- **THEN** it can calculate and render the estimate, caveat, source names, score bands, and
  mapping without missing content

### Requirement: The reusable result is accessible and phone-readable

The score estimate SHALL be a labelled result section whose visible text carries score and band
meaning without relying on color. Its inspectable mapping SHALL use semantic table structure.
The complete result, visible caveat, controls for inspecting the mapping, and expanded mapping
SHALL fit a 375-by-812-pixel app surface without horizontal page overflow or clipped content.

#### Scenario: Assistive technology receives the complete result

- **WHEN** a score estimate is rendered
- **THEN** one labelled result section exposes the raw practice points, approximate scaled score,
  estimated band, and caveat in reading order
- **AND** the mapping exposes headers and all four data rows as a table

#### Scenario: Densest estimate fits the phone target

- **WHEN** the College Ready + Credit result and expanded mapping are viewed at 375 by 812 pixels
- **THEN** no result text, caveat, source, table value, or inspection control is clipped
- **AND** the page has no horizontal overflow

### Requirement: Estimation remains local and observational

Calculating or rendering an estimate SHALL depend only on supplied practice points and the
fixed mapping. It SHALL NOT require a session clock, learner progress, stored state, sync,
runtime network access, or a Stage H generator. Estimation SHALL NOT record an attempt, alter
mastery, award a reward, unlock content, or persist its result.

#### Scenario: Estimation has no learner-state side effect

- **WHEN** valid practice points are estimated and rendered
- **THEN** the same supplied points always produce the same result
- **AND** learner progress, rewards, unlocks, persistence, and sync remain unchanged

#### Scenario: Infrastructure ships before its test-form consumer

- **WHEN** score estimation is available before any Stage H generator exists
- **THEN** all six Stage H modules remain planned
- **AND** the playable course remains 195 of 201 skills
