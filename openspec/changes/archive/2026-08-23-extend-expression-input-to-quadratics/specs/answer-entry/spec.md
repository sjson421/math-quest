## MODIFIED Requirements

### Requirement: A problem may declare an expression answer surface

A problem MAY declare `expression` as its input mode instead of `keypad`, `choice`,
`number-line`, or `coordinate-plane`. An expression problem SHALL offer a keypad limited to
digits, the variable letter declared by its expression `Answer`, infix `+`/`−`, unary `−`,
and parentheses. An answer that opts into a maximum degree of two SHALL additionally offer a
superscript-two key. A linear answer SHALL NOT offer that key. The keypad SHALL read this
answer declaration directly rather than a parallel input configuration.

The superscript-two key SHALL append `²` only where it forms the declared variable's square.
It SHALL use the same maximum-degree declaration as the parser and answer checker. No
expression keypad SHALL offer a fraction slash, decimal point, mixed-number space,
multiplication sign, additional variable, or general exponent key, since those characters
are outside the expression grammar.

#### Scenario: An expression problem offers the expression keys only

- **WHEN** a problem declares input mode `expression`
- **THEN** the pad offers digits, its declared variable letter, `+`, `−`, and parentheses
- **AND** it does not offer a fraction slash, decimal point, mixed-number space,
  multiplication sign, additional variable, or general exponent key

#### Scenario: What the pad shows and what entry accepts stays one rule

- **WHEN** an expression problem's pad is displayed
- **THEN** the same declared variable and maximum degree govern both which keys are offered
  and which key presses the entry logic accepts
- **AND** both values come from the problem's expression answer

#### Scenario: Degree-two entry offers a square key

- **WHEN** an expression problem declares a maximum degree of two
- **THEN** the pad offers a superscript-two key
- **AND** pressing it after the declared variable appends `²`

#### Scenario: Linear entry does not expose quadratic notation

- **WHEN** an expression problem keeps the default degree-one grammar
- **THEN** the pad does not offer a superscript-two key
- **AND** a superscript-two key press leaves the entry unchanged if it reaches the entry logic

#### Scenario: A square must follow the declared variable

- **WHEN** the superscript-two key is pressed anywhere except directly after the declared
  variable in a degree-two expression
- **THEN** the entry is left unchanged
