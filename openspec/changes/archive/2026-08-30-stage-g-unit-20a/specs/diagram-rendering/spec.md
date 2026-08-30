## ADDED Requirements

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
overflow at a 375-pixel viewport. Visual drawing children SHALL be hidden from the
accessibility tree behind one derived figure image name.

#### Scenario: A labelled triangle is announced once

- **WHEN** a triangle with base 6 cm and height 4 cm renders
- **THEN** one image name identifies its shape, base, height, perpendicular relationship, and
  unit
- **AND** internal lines, labels, and the right-angle mark are not separate accessible nodes

#### Scenario: Geometry keeps the existing answer surface

- **WHEN** a geometry problem declares keypad input
- **THEN** its figure and provided formulas render above the existing keypad answer frame
- **AND** the diagram adds no second value, entry control, or submission path
