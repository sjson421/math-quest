## ADDED Requirements

### Requirement: A problem may declare an expression answer surface

A problem MAY declare `expression` as its input mode instead of `keypad`, `choice`, or
`number-line`. An expression problem SHALL offer a keypad limited to digits, its declared
variable letter, infix `+`/`−`, unary `−`, and parentheses — no fraction slash, decimal
point, or mixed-number space, since those characters are outside the expression grammar.

#### Scenario: An expression problem offers the expression keys only

- **WHEN** a problem declares input mode `expression`
- **THEN** the pad offers digits, its declared variable letter, `+`, `−`, and parentheses
- **AND** it does not offer a fraction slash, decimal point, or mixed-number space

#### Scenario: What the pad shows and what entry accepts stays one rule

- **WHEN** an expression problem's pad is displayed
- **THEN** the same declared key set governs both which keys are offered and which key
  presses the entry logic accepts
