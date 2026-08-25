# Characters

Two characters ship: **Pip**, a cream bunny, free and the one a fresh record starts as;
and **Mochi**, a ginger cat, 500 coins. They live in
[`src/cosmetics/characters.tsx`](../../../src/cosmetics/characters.tsx) and are bought,
owned, and chosen through the same catalogue and the same purse as a hat or a rug.

**A character brings its own body and says where things go on it. It is never a second
drawing of the mascot.** Those are two rules, and the second is the same one a cosmetic is
under: `Mascot.tsx` owns the ten paint steps, the six expressions, the blink, the bob, the
ear swing, and the charm's spin. A character supplies geometry, colour and anchors — there
is no state argument anywhere on the type, for the reason `Decoration` has none.

The first rule used to be the opposite. Every body was one head circle at `(100, 112) r 57`,
because ten accessories were authored against those literal numbers, and a character could
vary its ears, its crest and its coat and nothing else — which is how two creatures came
out as two colours of one animal. Each character now draws its own `head` and declares its
own `anchors`, and every item reads the anchors instead of the numbers.

**The promise that constraint protected is unchanged: buying a character never costs the
learner an accessory.** It is now kept by the anchors rather than by sameness, and
`catalogue.test.tsx` renders every combination to hold it.

## The anchors

A body answers these eight. They are the whole contract — an anchor in the wrong place is an
item hanging in the air beside the creature rather than on it. Each line names what breaks.

| Anchor | Type | Read by |
| --- | --- | --- |
| `face` | `{ centre, scale }` | the six expressions, the cheeks, and the whole `face` slot — see below |
| `ear` | `{ base, hold }` per side | `base` is the rotation origin the ear and everything on it swings about; `hold` is out on the ear's mass, where `ear-bows` ties and `mint-earmuffs` centres |
| `crown` | `number` | the top of the skull. `party-hat` and `wizard-hat` rise from it; `mint-earmuffs` arcs its band clear of it |
| `brow` | `{ y, halfWidth }` | every hat band and brim: `party-hat`, `butter-crown`, `wizard-hat` |
| `temple` | `{ y, halfWidth }` | `heart-shades` arms end on the silhouette here; the sleep marks rise past it |
| `chin` | `{ y, halfWidth }` | `mint-scarf` crosses here |
| `shoulder` | `{ y, halfWidth }` | `powder-cape` hangs from it, `rainbow-wings` spread from it, the ground shadow is sized off it |
| `pin` | `Point` | the charm, and any `pin` cosmetic that replaces it |

**The face is drawn once and moved, never redrawn.** Every expression is authored in Pip's
coordinates — eyes at `x 78` / `x 122` on `y 110`, mouth around `y 138` — and placed by
`frame.tsx`, which maps Pip's face centre `(100, 124)` onto `face.centre` at `face.scale`. A
wider head does not get its own eyes; it gets Pip's, further apart. The `face` slot rides
the same frame, which is why `round-glasses` is authored on Pip's eye line and lands on the
eyes of both. Pip's frame is the identity and is not emitted at all.

The one thing inside that frame which is *not* face-shaped is the arms of `heart-shades`:
they have to reach the silhouette, which is a different distance out on every body, so they
undo the frame with `inverseFaceTransform` and are drawn from `temple` instead.

Two things are still the same on everyone:

| Fixed | Value | Why |
| --- | --- | --- |
| the expression set | six states, one drawing each | a character that drew its own would be a second expression set to keep in step with the first |
| ink | `INK` for eye and mouth *strokes* | same reason. An open mouth's interior takes the coat's `blush` — see [visual-language.md](visual-language.md) |

## What a character varies

| Part | Type | Notes |
| --- | --- | --- |
| `coat` | `{ base, shade, blush }` | body fill, body outline, and the tone shared by cheeks, inner ear, ground shadow and the inside of an open mouth |
| `anchors` | `Anchors` | the table above. Not optional and not guessable |
| `head` | `ReactNode` | the body silhouette. Deliberately unconstrained in shape — this is the layer that makes a different creature rather than a different colour |
| `ear` | `(ear) => ReactNode` | one ear, **drawn upright** about its own `base` — `Mascot.tsx` applies the rest pose and the swing |
| `crest` | `ReactNode` | what sits between the ears |
| `markings` | `ReactNode`, optional | a muzzle, whiskers, a nose. Pip has none |
| `charm` | `ReactNode` | the `pin` slot's default. Static; the sway and the celebration spin are applied for it |

Four parts have envelopes, and each is a real collision rather than a style preference:

- **The head must actually pass through its own spans.** A brim is drawn at the `brow`
  half-width; if the silhouette is narrower than that there, the hat hangs off the side. The
  two shipped bodies are a circle (Pip) and a broad flat-topped shape with fur points
  (Mochi) — the shape is free, the spans are not.
- **The ear must hold what rides it.** A bow ties at `hold` and an earmuff covers a 30-unit
  circle centred there, both in the ear's *unrotated* frame. An ear with no material around
  its own `hold` is an ear those two items fall off. Being a different shape from Pip's is
  fine — Mochi's is a short triangle, and its `hold` sits low on that triangle to match,
  where the mass actually is.
- **The crest sits above `crown` and no wider than `brow`.** Wider or taller and it collides
  with the hats. Note that a crest paints *over* the party hat's crown, because that crown is
  a `back` fragment passing behind the head and a crest is one of the character's own layers:
  it reads as fur poking through, and Pip's tuft has always done it.
- **Markings are drawn over the cheeks and under the eyes and mouth**, so the expression
  always wins. A muzzle is something the mouth is drawn *on*. Check the open mouths
  specifically: `happy` and `celebrating` both open from `y 133` in face coordinates and the
  considering `o` reaches `y 134`, so a nose that hangs into them reads as one shape with a
  tongue in it.

## Coats

A character's colours are constants in `palette.ts`, in the `coats` map — the same place
Pip's four have always lived, and the set `catalogue.test.tsx` checks every hex literal
against.

| Coat | `base` | `shade` | `blush` |
| --- | --- | --- | --- |
| `pip` | `#fff6f0` | `#ffe8dd` | `#ffb3c9` |
| `mochi` | `#ffd2b0` | `#f0a97e` | `#fb90ac` |

**A coat stays out of the five app families.** Every cosmetic is one family outlined in that
family's deep shade, so a mint character loses the mint scarf and a lilac one loses the party
hat. Cream and ginger both sit outside all five. A coat also has to be clearly deeper
than cream, or the new character reads as Pip in a slightly different light — which is the
failure that does not show up until the two are side by side in the shop.

## Ownership

- **The free one is owned by being free.** `owns()` reads a price of zero as already bought,
  so a record that predates characters starts as Pip with no purchase and no migration.
  Exactly one character may be free, and it must be the default.
- **A character has no slot.** `progress.character` is a bare id, because there is no state
  in which nobody is on screen. There is no `unequip` path: the only way to stop being one
  is to become another, and doing so takes nothing off.
- **An unknown id resolves to the default, not to nothing.** Progress is stored opaquely on
  the server and never migrated, so a record naming a retired character can arrive from sync
  at any time. A cosmetic id in that state draws nothing; a character id cannot, so
  `characterOf` falls back.
