## MODIFIED Requirements

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

A formula-selection exercise SHALL display the same figure and structured formula references
with the existing choice buttons as its answer surface. It SHALL omit a numeric equals sign
and empty entry frame. The choices SHALL use the references' accessible labels, remain readable
and keyboard operable, and fit with the figure and formulas at 375 pixels without horizontal
overflow. Existing numeric geometry exercises SHALL retain their keypad frame.

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

#### Scenario: Formula choices own the answer surface

- **WHEN** a formula-selection geometry problem renders
- **THEN** the labelled figure and both structured references appear with two choice buttons
- **AND** no empty numeric answer frame or extra equals sign appears
- **AND** the figure retains one accessible image name and the formulas retain their math names

#### Scenario: Formula choices fit the phone surface

- **WHEN** a formula-selection problem, including either Pythagorean side variant, renders at
  a 375-pixel viewport
- **THEN** the figure, both references, full choice labels and feedback remain readable
- **AND** the page and answer surface do not overflow horizontally
- **AND** both choices remain keyboard operable
