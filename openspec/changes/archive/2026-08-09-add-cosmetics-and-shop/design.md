## Context

See `proposal.md` — Why. The constraints that actually shape the approach:

- **`reconcile()` merges stored over defaults per key**, and AGENTS.md forbids the variant
  that picks named fields out of a stored skill. New fields must slot into that shape
  without changing it.
- **The sync endpoint is opaque by contract** (`api/progress.ts`: "Adding a field to the
  client must never require touching this file"), and `lib/sync.ts` is a store subscriber
  precisely so that purchases cannot forget to sync. Both should end this change untouched.
- **Component tests render first paint to a string, in node, with no DOM**
  (`docs/testing.md`). No handler ever fires, so anything behind a tap is unreachable from a
  test unless it lives in a pure function.
- **`mascot-design` is a contract, and item 16 is what makes it real.** The five slots, six
  anchors, ten-step render order, palette, and 92 px size floor are all already written down;
  this change implements them rather than inventing them.
- **Pip's own colour constants are private to `Mascot.tsx` today**, which matters because a
  cosmetic must borrow them rather than approximate them.

## Goals / Non-Goals

**Goals:**

- One place decides what a cosmetic is; one place decides how Pip paints one.
- Buying and equipping are testable without a DOM.
- An id the catalogue no longer knows degrades to "draws nothing", never to a crash or a
  discarded record.
- `api/progress.ts` and `src/lib/sync.ts` end the change with zero diff.

**Non-Goals** (beyond the proposal's):

- No animation vocabulary beyond the four presets `mascot-design` already names.
- No per-item accessible names, no per-item reduced-motion handling beyond inheriting Pip's.
- No abstraction for "things you can own" — cosmetics are the only ownable thing, and a
  generic inventory would be a second graph nothing keeps in step.

## Decisions

### Two flat fields on `Progress`, not a nested wardrobe object

```ts
/** Cosmetic ids the learner has bought, in purchase order. */
inventory: string[]
/** Slot → cosmetic id currently worn. An absent slot means Pip's own default. */
equipped: Partial<Record<CosmeticSlot, string>>
```

Flat matches `xp`, `coins`, and `mistakes`, and it keeps `reconcile()` a one-line addition
per field instead of a nested merge with its own rules. Each gets a shape check with an
empty fallback, the way `updatedAt` already gets a `typeof` check with a `0` fallback:

```ts
inventory: Array.isArray(stored.inventory) ? [...stored.inventory] : [],
equipped: isRecord(stored.equipped) ? { ...stored.equipped } : {},
```

A bare spread would not be enough for `equipped`: `{ ...null }` is indeed `{}`, but
`{ ...'abc' }` is `{ 0: 'a', 1: 'b', 2: 'c' }`, so a corrupt string would survive as a junk
object rather than being rejected. Neither field merges with the defaults, because the
defaults are empty — merging would be ceremony that reads like it does something.

*Rejected:* `Record<itemId, { owned, equippedAt }>`. It loses purchase order, needs a
per-entry merge rule in `reconcile` (exactly the shape AGENTS.md warns about for skills), and
makes "one per slot" a derived invariant that nothing enforces.

*Rejected:* a nested `wardrobe: { inventory, equipped }`. One more level to guard for no gain
while there are exactly two fields.

### Stale ids are resolved at read, never migrated

An equipped or owned id the catalogue does not contain stays in the record and is skipped when
drawing and when listing the shop. This is the same rule `skill-progression` already states
for skill ids — "the record is retained rather than deleted, and the skill is not offered" —
and for the same reason: a record can arrive from sync at any moment and the server never
migrates it, so a load-time migration would be a lie the next pull undoes.

### Pip's palette moves to its own module

`CREAM`, `CREAM_SHADE`, `INK`, and `BLUSH` move out of `Mascot.tsx` into
`src/cosmetics/palette.ts`, with the app's five colour families beside them.

This is not tidying. `Mascot.tsx` must import the catalogue to draw it, and the catalogue must
import Pip's constants to match him — a cycle if the constants stay where they are. Extracting
them makes the dependency one-directional (`Mascot → cosmetics → palette`) and turns the
palette into the shared authority `mascot-design` describes it as. `visual-language.md` says
those constants live in `Mascot.tsx`, so both mirrors of that reference are updated in the
same change; an anchor that means one thing in the contract and another in code is exactly
what item 15 warned against.

**The five app families are not copied at all — cosmetics reference them.** They live in
`src/index.css` as custom properties and stay the single authority. A cosmetic names one
through an inline style, `style={{ fill: 'var(--color-lilac)' }}`, rather than a hex literal
in a second file.

This replaces an earlier decision to keep a checked hex copy in `palette.ts`. Implementation
disproved it: vitest runs with `css: false`, so `import '../index.css?raw'` resolves to an
empty string and the cross-check silently compares against nothing — caught only because the
test was paired with a guard asserting the parse was non-empty. Making it work would mean
turning CSS processing on for the whole suite, running Tailwind on every test file to police
a duplication that does not need to exist.

Referencing is strictly better than checking a copy: there is one place each colour is
written, so there is no drift to detect. It also matches what `visual-language.md` already
says — the app's colours *are* custom properties. Pip's own four constants still move to
`palette.ts` as literals, because they are the character's and belong to no stylesheet.

*Rejected:* `Mascot` taking pre-resolved fragments so it never imports the catalogue. It
breaks the cycle too, but pushes catalogue lookup and unknown-id handling into every call
site — five today — which is where inconsistency comes from.

### `Mascot` takes `equipped`, and resolves it itself

```tsx
<Mascot state="idle" size={148} equipped={progress.equipped} />
```

The prop is the raw record, not a resolved list, so unknown-id handling lives in one place.
It stays a prop rather than a store read because the tree levels are documented as taking
props and reading no store, with `Home` the one component among them that reaches for the
live one — and because the shop needs to preview a cosmetic that is *not* equipped, which is
just `{ [item.slot]: item.id }`.

The renderer walks all ten steps of `references/layers.md` in order, so the contract and the
code can be read side by side. Step 6 stays what it already is — Pip's cheeks and then his
face, both inside one step, since nothing paints between them. `pin` reads the equipped id
and falls back to the signature star, which is how the star stops being hard-coded without
changing what anyone sees today.

### Buying and equipping are pure functions in `src/lib/wardrobe.ts`

```ts
buy(progress, id): Progress | null       // null = refused (cannot afford / already owned)
equip(progress, id): Progress | null     // null = refused (not owned / unknown)
unequip(progress, slot): Progress | null // null = nothing was in that slot
```

Refusal is `null`, matching `importProgress`. The store actions call these and persist **only**
on a non-null result — a refused purchase must not advance `updatedAt`, or every tap on an
unaffordable item would schedule a pointless push.

`unequip` returns `null` for an already-empty slot for the same reason, and not as symmetry
for its own sake: without it the one operation that cannot fail becomes the one that can
schedule a push for a no-op.

This is the `lib/submit.ts` pattern: the decision is a pure function precisely because a node
test cannot reach anything behind a tap.

### The catalogue: five cosmetics, priced against the real earn rate

| Cosmetic | Slot | Family | Price | Why it is in this set |
| --- | --- | --- | --- | --- |
| Round glasses | `face` | `INK` | 40 | The contract's own worked example; the cheapest thing |
| Ear bows | `headwear` | `blossom` | 60 | Rides the ear rotation — the one case with a documented trap |
| Mint scarf | `neck` | `mint` | 90 | Crosses the chin line, the `neck-center` case |
| Party hat | `headwear` | `lilac` | 120 | Back **and** front fragments; and a second `headwear` item, so slot replacement is real rather than theoretical |
| Powder cape | `back` | `powder` | 160 | The only slot painted before Pip |

Five items cover four of the five slots, both fragment kinds, the ear-rotation trap, and give
`headwear` two occupants so the replacement scenario has something to replace. `pin` ships no
item by decision — the renderer implements it, and a test fixture exercises the replacement
path without changing Pip's signature look.

Glasses are `INK` rather than a colour family, and `mascot-design` requires that departure to
carry a reason in a comment beside the geometry: they sit on the face and read as part of the
expression, so a lilac frame competes with the eyes it surrounds.

**Pricing.** A mastery-gaining lesson pays 15 coins, a repeat 8. Two or three lessons is an
ordinary sitting, so ~30–45 coins a day. That puts the first cosmetic just past a good first
day, and the cape at roughly five days. The whole set is 470 coins — about 31 fresh lessons,
or a week and a half at three a day, which is something new roughly every other day and
nothing that turns the course into a grind.

### The shop is a screen, entered from the coin balance

`App`'s `Screen` union gains `{ name: 'shop'; back: TreeLevel }`, wired exactly like
`settings` — same back-edge convention, same `AnimatePresence` key. The coin `Stat` in the
home header becomes a button.

`Shop` takes `progress` and callbacks as props and reads no store, so a node test can render it
against a synthetic record. `App` does the wiring, which is where the store already lives.

Each card renders a real `Mascot` at 92 px wearing that one cosmetic. That is the size floor
`mascot-design` names as where detail turns to mud, so the shop card doubles as the acceptance
check the contract asks for — an item that is illegible in the shop is an item that fails the
contract.

## Risks / Trade-offs

- **Moving Pip's palette touches the character's own file** → The constants move verbatim,
  values unchanged, and the existing `Mascot` tests plus the golden component tests catch any
  substitution. `visual-language.md` warns that swapping `CREAM` for `--color-cream` passes
  every review that does not put them side by side, which is precisely why the values are
  moved rather than retyped.
- **Five animated Pips on the shop screen** → Each is a handful of SVG primitives with one
  repeating transform; the whole catalogue is under 2 kB of geometry. If it ever reads as
  heavy, a still preview is a local change to one component.
- **`equipped` can name a cosmetic that no longer exists** → Resolved at read and specified;
  the failure mode is an empty slot, not a crash.
- **The shop makes coins spendable, which makes the coin award a balance decision** → Out of
  scope by decision: prices are fitted to the award, not the other way round. If the award
  changes later, the price table is one object.
- **Item 16 stays unchecked while half of it ships** → Intended, and the roadmap records both
  increments so the open checkbox reads as a plan rather than an oversight.

## Migration Plan

None required. Both fields are additive with empty defaults, `reconcile()` supplies them for
any record that lacks them, and the server stores the blob without interpreting it. A device
that has not been updated ignores fields it does not know; a device that has, sees an empty
wardrobe. Rollback is reverting the commit — a record carrying `inventory` and `equipped`
loads fine on the previous build, because the fields simply pass through `reconcile`'s spread
and are never read.
