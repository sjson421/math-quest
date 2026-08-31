## MODIFIED Requirements

### Requirement: A geometry figure carries one closed measurement problem

A geometry diagram SHALL declare exactly one supported Unit 20 operation and only the source
measurements that operation needs. Unit 20a operations SHALL retain rectangle length and
width; triangle base and height; parallelogram base and height; trapezoid two bases and height;
circle radius for circumference; or circle diameter for area.

Unit 20b operations SHALL carry: an outer rectangle and corner cut-out for composite area;
length, width, and height for a rectangular prism or its surface-area net; radius and height
for a cylinder or cone; base length, base width, and perpendicular height for a pyramid;
radius for a sphere; or two known side lengths and the missing-side role for a right triangle.
The Unit 20c similar-figures operation SHALL carry the small rectangle's positive finite
whole-number length and width, one positive finite whole-number large side, whether that side
is the length or width, and one supported length unit.

The known large side in a similar-figures diagram SHALL divide evenly by its corresponding
small side and establish a whole-number scale factor greater than one. The two small sides
SHALL differ. The declaration SHALL NOT carry the missing large side, answer, scale factor,
authored label, formula, path, or second display.

Every geometry diagram SHALL declare one unit from the closed set centimetres (`cm`), metres
(`m`), inches (`in`), or feet (`ft`). Every measurement SHALL be a positive finite number.
Cut-outs SHALL stay inside their outer rectangle; Pythagorean side roles SHALL be
geometrically valid; and shape-specific invalid, extra, or incomplete data SHALL be rejected
before it can render a misleading figure. Existing bar, circle-sector, and grid fraction
declarations and all earlier Unit 20 geometry declarations SHALL retain their current data
and output.

#### Scenario: Triangle source data is complete

- **WHEN** a geometry diagram declares triangle area
- **THEN** it carries positive base and perpendicular-height values with one unit
- **AND** it does not carry an unrelated side, radius, diameter, or authored path

#### Scenario: A surface-area net carries only prism dimensions

- **WHEN** a geometry diagram declares rectangular-prism surface area
- **THEN** it carries positive length, width, and height values with one unit
- **AND** it does not carry authored faces, paths, formulas, or an answer

#### Scenario: Existing fraction figures do not migrate

- **WHEN** an existing shaded bar, circle, or grid is rendered
- **THEN** its parts, shaded parts, accessible name, SVG markup, and recorded output remain
  unchanged

#### Scenario: Three sides define the fourth

- **WHEN** a diagram carries small length 4, small width 3, known large length 8, and unit `cm`
- **THEN** it represents a scale factor of 2 and a missing large width
- **AND** it carries neither the value 6 nor authored drawing data

#### Scenario: A false scale relationship is rejected

- **WHEN** a known large side is not an exact multiple greater than one of its corresponding small side
- **THEN** the diagram is rejected before any figure or answer renders

### Requirement: Geometry figures derive visible formula choices and labels

Each geometry operation SHALL derive a provided two-reference set from its operation identity
rather than accept authored formula strings. Except for similar figures, each set SHALL
contain the matching formula and one plausible formula for a related figure, with neither
visually marked as the answer. The figure SHALL derive every visible dimension label, unit,
shape name, side role, and accessible name from the same structured measurements used for
answer verification.

Perimeter and rectangle area SHALL share `P = 2l + 2w` and `A = lw`. Triangle area SHALL show
`A = bh` and `A = bh/2`. Parallelogram and trapezoid area SHALL share `A = bh` and
`A = (b1 + b2)h/2`. Circumference and circle area SHALL share `C = πd` and `A = πr²`.
Composite area SHALL use the rectangle area and perimeter pair. Prisms and pyramids SHALL
share `V = Bh` and `V = Bh/3`; cylinders and cones SHALL share `V = πr²h` and
`V = πr²h/3`; spheres SHALL show `V = 4πr³/3` and `SA = 4πr²`; rectangular-prism nets SHALL
show `SA = 2lw + 2lh + 2wh` and `V = lwh`; and right triangles SHALL show
`c = √(a² + b²)` and `a = √(c² − b²)`.

Similar figures SHALL label the small rectangle's sides `a` and `b` and the corresponding
large sides `A` and `B`. Their two references SHALL be the equivalent proportions
`a/A = b/B` and `a/b = A/B`, with neither marked as the answer. Their accessible names SHALL
explain that lowercase sides belong to the small rectangle and uppercase sides belong to the
large rectangle.

Every formula or proportion SHALL use the existing structured math-notation primitives,
including fractions, superscripts, and radicals where required. Figure and reference names
SHALL remain separate so none is announced twice or hidden by another.

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

#### Scenario: Pythagorean references use the missing-side role

- **WHEN** a right-triangle figure marks one side as missing
- **THEN** its known side labels, missing marker, addition radical, and subtraction radical
  remain readable
- **AND** no authored formula or label can disagree about which side is the hypotenuse

#### Scenario: A paired figure exposes equivalent proportions

- **WHEN** the small rectangle is 4 cm by 3 cm and the large rectangle shows `A = 8 cm` with `B` missing
- **THEN** both equivalent proportion references render as structured markup
- **AND** their accessible names explain the lowercase and uppercase side mapping

### Requirement: Geometry figures render as accessible local SVG

Supported geometry figures SHALL render as local responsive SVG markup without canvas,
downloaded assets, or a runtime service. Dimension labels and units SHALL remain legible.
Rectangles, triangles, parallelograms, trapezoids, prisms, cylinders, cones, pyramids, spheres,
composite figures, and paired similar rectangles SHALL use fixed templates that communicate
their family without claiming proportional scale. Perpendicular heights and right triangles
SHALL show a right-angle mark; circle-based figures SHALL distinguish radius from diameter;
and a Pythagorean figure SHALL distinguish the hypotenuse from either leg.

The similar-figures template SHALL place a smaller rectangle and a visibly larger rectangle
together in one SVG. Both SHALL use the same fixed aspect ratio. Three side labels SHALL
include their letter, numeric measurement, and unit, while the missing large side SHALL show
its corresponding letter and a question mark.

The surface-area view SHALL visibly unfold all six rectangular-prism faces as one net rather
than substitute a solid. Every figure, its provided references, and the existing answer frame
SHALL fit without horizontal overflow at a 375-pixel viewport. Visual drawing children SHALL
be hidden from the accessibility tree behind one derived figure image name. A similar-figures
image name SHALL identify both figure roles, all three known measurements, the missing side
role, and the unit.

#### Scenario: A labelled triangle is announced once

- **WHEN** a triangle with base 6 cm and height 4 cm renders
- **THEN** one image name identifies its shape, base, height, perpendicular relationship, and
  unit
- **AND** internal lines, labels, and the right-angle mark are not separate accessible nodes

#### Scenario: A prism net remains a net

- **WHEN** a rectangular-prism surface-area problem renders
- **THEN** all six faces appear in one unfolded local SVG with the required dimension labels
- **AND** one derived image name describes the net and its three source dimensions

#### Scenario: Geometry keeps the existing answer surface

- **WHEN** a geometry problem declares keypad input
- **THEN** its figure and provided formulas render above the existing keypad answer frame
- **AND** the diagram adds no second value, entry control, or submission path

#### Scenario: A paired figure is announced once

- **WHEN** the small rectangle is 4 cm by 3 cm and the large rectangle shows `A = 8 cm` with `B` missing
- **THEN** one image name describes both rectangles, the three numeric sides, and the missing large width
- **AND** drawing children remain hidden from the accessibility tree

#### Scenario: The complete pair fits the installed phone surface

- **WHEN** the paired figure, both proportion references, and existing keypad answer frame render at 375 pixels
- **THEN** every side label and missing marker remains visible and legible
- **AND** the page, figure, formulas, and answer surface do not overflow horizontally
