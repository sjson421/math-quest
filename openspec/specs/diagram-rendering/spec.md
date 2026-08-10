# Diagram Rendering

## Purpose

Diagram rendering presents fraction meaning as structured, accessible shaded shapes that
remain legible on the phone-sized offline lesson surface.

## Requirements

### Requirement: A fraction figure carries its mathematical structure

A fraction figure SHALL declare one of three shapes — bar, circle, or grid — together with a
positive integer number of equal parts and an integer number of shaded parts from zero through
the total. The declaration SHALL carry those values as structured data rather than authored
SVG or other presentation markup.

The visible fraction SHALL be independently derivable as shaded parts over total parts without
consulting the generator's stated answer.

#### Scenario: A bar carries a readable fraction

- **WHEN** a bar declares four total parts and three shaded parts
- **THEN** it represents three fourths from those values alone
- **AND** no authored drawing is needed to recover that fraction

#### Scenario: Each supported shape uses the same fraction data

- **WHEN** equivalent declarations select bar, circle, and grid
- **THEN** each represents the same total and shaded-part counts
- **AND** changing the shape does not change the fraction the declaration carries

#### Scenario: Invalid part counts are rejected

- **WHEN** a figure declares no parts, a non-integer count, or more shaded parts than total
- **THEN** it is rejected rather than rendered as a misleading fraction

### Requirement: Every figure has one derived accessible name

Each rendered figure SHALL expose exactly one image role whose accessible name is derived from
its shape, total parts, and shaded parts. The visual partitions inside the figure SHALL be
excluded from the accessibility tree.

#### Scenario: A shaded circle is announced once

- **WHEN** a circle in four parts has three shaded
- **THEN** assistive technology finds one image named “circle in 4 parts, 3 shaded”
- **AND** it does not encounter the four sectors as separate accessible content

#### Scenario: The name cannot drift from the drawing data

- **WHEN** a figure's part counts change
- **THEN** its accessible name changes from the same structured values
- **AND** no separately authored label can disagree with those values

### Requirement: Fraction figures render in the offline phone surface

Bars, circles, and grids SHALL render as local application SVG markup without canvas, a
runtime service, or separately downloaded assets. Their partitions and shaded regions SHALL
remain distinguishable without horizontal overflow at a 375-pixel viewport.

#### Scenario: Static rendering exposes the figure

- **WHEN** each supported shape is rendered in the node-side component test environment
- **THEN** its SVG partitions, shaded count, and singular accessible name are present in
  static markup

#### Scenario: Representative figures fit a phone

- **WHEN** 12-part bars, circles, and grids and an 11-part prime grid are rendered at 375
  pixels wide
- **THEN** neither the page nor any figure overflows horizontally
- **AND** every partition's rendered bounding box has a shortest dimension of at least 12 CSS
  pixels

#### Scenario: The installed app needs no diagram download

- **WHEN** the app renders a fraction figure while offline
- **THEN** all diagram markup and styling are already available locally

### Requirement: A diagram display uses the existing lesson entry

A problem SHALL be able to present a fraction figure as its display while continuing to use
the answer control declared by its input mode. Diagram rendering SHALL NOT introduce another
answer value or submission path.

#### Scenario: A diagram problem keeps its declared answer control

- **WHEN** a problem presents a shaded figure and declares keypad input
- **THEN** the lesson presents the figure with its existing keypad answer slot
- **AND** the submitted entry continues through the ordinary answer checker
