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

### Requirement: A geometry figure carries one closed measurement problem

A geometry diagram SHALL declare exactly one supported Unit 20a operation and only the source
measurements that operation needs: rectangle length and width; triangle base and height;
parallelogram base and height; trapezoid two bases and height; circle radius for
circumference; or circle diameter for area. It SHALL also declare one unit from a closed set of
supported length units: centimetres (`cm`), metres (`m`), inches (`in`), or feet (`ft`).

Every measurement SHALL be a positive finite number. Shape-specific invalid or incomplete
data SHALL be rejected before it can render a misleading figure. Existing bar, circle-sector,
and grid fraction declarations SHALL retain their current data and output.

#### Scenario: Triangle source data is complete

- **WHEN** a geometry diagram declares triangle area
- **THEN** it carries positive base and perpendicular-height values with one unit
- **AND** it does not carry an unrelated side, radius, diameter, or authored path

#### Scenario: Existing fraction figures do not migrate

- **WHEN** an existing shaded bar, circle, or grid is rendered
- **THEN** its parts, shaded parts, accessible name, SVG markup, and recorded output remain
  unchanged

### Requirement: Geometry figures derive visible formula choices and labels

Each geometry operation SHALL derive a provided two-formula reference set from its operation
identity rather than accept authored formula strings. The set SHALL contain the matching
formula and one plausible formula for a related figure, with neither visually marked as the
answer. The figure SHALL derive every visible dimension label, unit, shape name, and accessible
name from the same structured measurements used for answer verification.

Perimeter and rectangle area SHALL share `P = 2l + 2w` and `A = lw`. Triangle area SHALL show
`A = bh` and `A = bh/2`. Parallelogram and trapezoid area SHALL share `A = bh` and
`A = (b1 + b2)h/2`. Circumference and circle area SHALL share `C = πd` and `A = πr²`.
Every formula SHALL use the existing structured math-notation primitives. Figure and formula
references SHALL have separate accessible names so none is announced twice or hidden by
another.

#### Scenario: A trapezoid presents one matching formula

- **WHEN** a trapezoid geometry diagram renders
- **THEN** its two base labels and perpendicular height appear on the figure
- **AND** the reference set offers both the parallelogram and trapezoid formulas without
  highlighting either
- **AND** no separately authored formula can disagree with its operation

#### Scenario: Circle measure and formula require conversion

- **WHEN** a circumference figure supplies radius beside the circle formula reference set
- **THEN** the labelled radius, `C = πd`, and `A = πr²` remain readable
- **AND** the renderer does not silently relabel the radius as diameter

### Requirement: Geometry figures render as accessible local SVG

Supported geometry figures SHALL render as local responsive SVG markup without canvas,
downloaded assets, or a runtime service. Dimension labels and units SHALL remain legible;
rectangles, triangles, parallelograms, and trapezoids SHALL show a right-angle mark wherever a
perpendicular height is used; and circle figures SHALL visibly distinguish a radius from a
diameter.

The figure, provided formula references, and existing answer frame SHALL fit without horizontal
overflow at a 375-pixel viewport. Visual drawing children SHALL be hidden from the accessibility
tree behind one derived figure image name.

#### Scenario: A labelled triangle is announced once

- **WHEN** a triangle with base 6 cm and height 4 cm renders
- **THEN** one image name identifies its shape, base, height, perpendicular relationship, and
  unit
- **AND** internal lines, labels, and the right-angle mark are not separate accessible nodes

#### Scenario: Geometry keeps the existing answer surface

- **WHEN** a geometry problem declares keypad input
- **THEN** its figure and provided formulas render above the existing keypad answer frame
- **AND** the diagram adds no second value, entry control, or submission path
