## ADDED Requirements

### Requirement: The device remains the working store

The app SHALL read and write progress locally at all times and SHALL remain fully usable
with no network. Sync SHALL be additive — a failure to reach the server MUST NOT block a
lesson, delay an answer, or surface an error that interrupts learning.

#### Scenario: Full lesson with no network

- **WHEN** the device is offline
- **THEN** lessons start, run, and complete normally
- **AND** progress is written locally
- **AND** no blocking error is shown

#### Scenario: Sync failure is non-blocking

- **WHEN** a push to the server fails
- **THEN** the failure is recorded for later retry
- **AND** the learner's current activity is not interrupted

### Requirement: Progress carries a monotonic version

The progress record SHALL carry an `updatedAt` timestamp that advances on every local
mutation. This is the basis for deciding which copy is newer.

#### Scenario: Local mutation advances the version

- **WHEN** a lesson completes and progress is written
- **THEN** `updatedAt` is set to the current time
- **AND** the new value is strictly greater than the previous one

### Requirement: Pull on launch

On startup, once a recovery key is present, the app SHALL fetch the server copy and
compare versions.

#### Scenario: Server copy is newer

- **WHEN** the server's `updatedAt` is greater than the local one
- **THEN** the server copy replaces local progress
- **AND** the learner is told progress was restored

#### Scenario: Local copy is newer

- **WHEN** the local `updatedAt` is greater than the server's
- **THEN** local progress is pushed to the server
- **AND** local state is left unchanged

#### Scenario: Versions match

- **WHEN** both copies report the same `updatedAt`
- **THEN** no transfer occurs

#### Scenario: No server copy yet

- **WHEN** the server holds nothing for this key
- **THEN** local progress is pushed as the initial copy

### Requirement: Push after meaningful progress

The app SHALL push after any change worth preserving — lesson completion, a skill
unlocking, a purchase, or a skip. Pushes SHALL be debounced so a burst of changes produces
one request.

#### Scenario: Lesson completion triggers a push

- **WHEN** a lesson completes
- **THEN** a push is scheduled

#### Scenario: Rapid changes are coalesced

- **WHEN** several mutations occur within the debounce window
- **THEN** exactly one push is sent, carrying the latest state

### Requirement: Stale writes are refused, never silently applied

A push SHALL declare the `updatedAt` the client last observed from the server. The server
SHALL reject the write when its stored version is newer. A stale device MUST NOT be able
to overwrite newer progress.

#### Scenario: Stale push is rejected

- **WHEN** a client pushes while the server holds a newer version
- **THEN** the server responds with a conflict and returns its current copy
- **AND** the stored copy is unchanged

#### Scenario: Client resolves a conflict by adopting the server copy

- **WHEN** a push is rejected as stale
- **THEN** the client adopts the server copy
- **AND** the learner is told, rather than progress changing silently

### Requirement: Failed pushes are queued and retried

A push that fails for any reason SHALL be retried — on regaining connectivity, on next
launch, and on a bounded backoff. Only the latest state need be retried, not each
intermediate one.

#### Scenario: Retry on reconnect

- **WHEN** the device regains connectivity with a pending push
- **THEN** the push is retried with current state

#### Scenario: Retry survives a restart

- **WHEN** the app is closed with a push still pending
- **THEN** the push is attempted again on next launch

### Requirement: Sync status is visible and honest

Settings SHALL show when progress last reached the server, and SHALL clearly distinguish
synced, pending, offline, and failed. A silent failure MUST NOT be able to look like
success.

#### Scenario: Successful sync is timestamped

- **WHEN** a push succeeds
- **THEN** Settings shows the time it last synced

#### Scenario: Repeated failure is surfaced

- **WHEN** pushes have failed for more than 24 hours
- **THEN** Settings shows a clear warning that progress is not backed up

#### Scenario: Never-synced state is distinct

- **WHEN** progress has never reached the server
- **THEN** Settings says so explicitly rather than showing an empty timestamp

### Requirement: Server stores one opaque blob per key

The endpoint SHALL support fetching and replacing a single JSON document per recovery key,
and SHALL treat its contents as opaque. It SHALL NOT validate, interpret, or migrate the
progress schema.

#### Scenario: Fetch returns the stored document

- **WHEN** a valid key requests its progress
- **THEN** the stored document and its version are returned

#### Scenario: Unknown key

- **WHEN** a well-formed key with no stored document requests it
- **THEN** the response indicates nothing is stored, and is not an error

#### Scenario: Missing or malformed key

- **WHEN** a request carries no key or a malformed one
- **THEN** it is rejected as unauthorised
- **AND** no document is created

### Requirement: File export is replaced by sync

The manual **Export backup** button SHALL be removed once sync is verified working. A
recovery-only path to restore from a previously exported file SHALL remain, so backups
produced before this change are not stranded.

#### Scenario: Export button is gone

- **WHEN** the learner opens Settings
- **THEN** no export action is offered
- **AND** the recovery key and sync status are shown instead

#### Scenario: Legacy backup file can still be restored

- **WHEN** the learner restores a backup file exported before this change
- **THEN** it is accepted and becomes local progress
- **AND** it is pushed to the server on the next sync

#### Scenario: Removal is gated on working sync

- **WHEN** sync has never successfully completed
- **THEN** the export path remains reachable
