## ADDED Requirements

### Requirement: A recovery key identifies the learner, with no account

The app SHALL generate one recovery key on first run and use it as the sole identifier for
server-side progress. There SHALL be no account, password, email address, or login screen.

#### Scenario: Key generated on first run

- **WHEN** the app starts with no stored key
- **THEN** a new key is generated and stored locally
- **AND** it is used for all subsequent sync

#### Scenario: Key persists across launches

- **WHEN** the app restarts
- **THEN** the existing key is reused and never regenerated

### Requirement: Keys are transcribable by a person

The key SHALL be readable and typeable by hand — grouped, unambiguous characters, no
case-sensitivity, and no characters that are easily confused. It will be copied onto paper
and typed on a phone keyboard, so raw UUIDs and base64 are unacceptable.

#### Scenario: Format is grouped and readable

- **WHEN** a key is generated
- **THEN** it is presented in short hyphen-separated groups

#### Scenario: Ambiguous characters are excluded

- **WHEN** a key is generated
- **THEN** it contains no characters that read ambiguously against one another

#### Scenario: Entry is forgiving

- **WHEN** the learner types a key in the wrong case, with extra spaces, or with hyphens
  omitted
- **THEN** it is normalised and accepted

#### Scenario: Enough entropy to be unguessable

- **WHEN** a key is generated
- **THEN** it carries sufficient entropy that guessing another learner's key is infeasible

### Requirement: The key is always retrievable, never shown once

Because file export is being removed, the key is the only route back to the data. It SHALL
be permanently viewable in Settings and SHALL NOT be a one-time reveal.

#### Scenario: Key is visible in Settings

- **WHEN** the learner opens Settings at any time
- **THEN** the current recovery key is displayed in full

#### Scenario: Key can be copied

- **WHEN** the learner taps the key
- **THEN** it is copied to the clipboard with confirmation

#### Scenario: First run explains what it is for

- **WHEN** the key is generated on first run
- **THEN** the learner is told plainly that it restores progress on a new phone
- **AND** is told where to find it again, so nothing depends on acting immediately

### Requirement: Entering a key on a new device restores progress

The learner SHALL be able to enter an existing key on a new or reset device and recover
everything stored against it.

#### Scenario: Restore onto a fresh install

- **WHEN** a key with stored progress is entered on a device with none
- **THEN** the server copy is fetched and becomes local progress
- **AND** the key is stored for future sync

#### Scenario: Key with nothing stored

- **WHEN** a well-formed key with no server copy is entered
- **THEN** it is accepted and used going forward
- **AND** the learner is told there was nothing to restore

#### Scenario: Replacing a key with local progress present

- **WHEN** a different key is entered on a device that already holds progress
- **THEN** the learner is warned that local progress will be replaced
- **AND** the change proceeds only on explicit confirmation

#### Scenario: Malformed key is rejected before any request

- **WHEN** an entered key fails format validation
- **THEN** it is rejected locally with a clear message
- **AND** no network request is made

### Requirement: The security posture is stated honestly

The key is a bearer credential. Anyone holding it can read and write that progress. This
SHALL be described accurately wherever the key is explained and SHALL NOT be presented as
secure, private, or encrypted.

#### Scenario: Explanation is accurate

- **WHEN** the key is explained to the learner
- **THEN** the wording conveys that whoever has it can access the progress
- **AND** makes no claim of encryption or security

### Requirement: Losing the key loses access

There SHALL be no reset, recovery, or support path for a lost key — no email, no identity,
nothing to appeal to. The consequence SHALL be stated where the key is presented.

#### Scenario: No reset path is offered

- **WHEN** the learner has lost the key
- **THEN** no reset mechanism exists
- **AND** the app can still be used from scratch on the device

#### Scenario: Consequence is stated up front

- **WHEN** the key is first shown
- **THEN** the learner is told it cannot be recovered if lost
