# Characters

Three characters ship: **Pip**, a cream bunny, free and the one a fresh record starts as;
**Mochi**, a ginger cat; and **Sprig**, a sage dragon, 500 coins each. They live in
[`src/cosmetics/characters.tsx`](../../../src/cosmetics/characters.tsx) and are bought,
owned, and chosen through the same catalogue and the same purse as a hat or a rug.

**A character is a coat and five fragments hung off fixed anchors. It is never a second
drawing of the mascot.** That is the same rule a cosmetic is under and it exists for a
harder reason here: nine accessories are authored against exact coordinates, so a character
that moved the head or an ear base would silently break items the learner already owns.
Buying a character must never cost them an accessory.

`Mascot.tsx` owns the ten paint steps, the six expressions, the blink, the bob, the ear
swing, and the charm's spin. A character supplies geometry and colour and nothing else —
there is no state argument anywhere on the type, for the reason `Decoration` has none.

## What is fixed, and why

Nothing in this table may vary between characters. Each line names the item that would break.

| Fixed | Value | Anchored by |
| --- | --- | --- |
| head circle | `(100, 112)`, `r 57` | `heart-shades` arms end on the silhouette at `(45, 99)` / `(155, 99)`; `mint-scarf` crosses the chin at `y 156` |
| eyes | `x 78` and `x 122`, `y 110` | `round-glasses`, `heart-shades` |
| mouth | around `y 138` | the six expressions, which are one set for everyone |
| ear bases | `(56, 96)` and `(144, 96)` | `ear-bows`, `mint-earmuffs`, and the rotation both ride |
| `pin` anchor | `(148, 162)` | the charm, and any `pin` cosmetic that replaces it |
| ink | `INK` for eyes and mouth | a character that inked its own face would be a second expression set |

## What a character varies

| Part | Type | Notes |
| --- | --- | --- |
| `coat` | `{ base, shade, blush }` | body fill, body outline, and the tone shared by cheeks, inner ear and ground shadow |
| `ear` | `(ear) => ReactNode` | one ear, **drawn upright** — `Mascot.tsx` applies the −24° / +24° rest pose and the swing |
| `crest` | `ReactNode` | what sits between the ears |
| `markings` | `ReactNode`, optional | a muzzle, whiskers, a nose. Pip has none |
| `charm` | `ReactNode` | the `pin` slot's default. Static; the sway and the celebration spin are applied for it |

Three parts have envelopes, and each is a real collision rather than a style preference:

- **The ear must hold what rides it.** An ear bow sits at `y 64` and an earmuff covers a
  30-unit circle at `y 68`, both centred on the ear base and both written in the ear's
  *unrotated* frame. An ear with no material across `y 60–80` is an ear those two items fall
  off. Being narrower than Pip's is fine — the muff covers more than it needs to, and a bow
  wider than the ear reads as a bow tied round it.
- **The crest lives in `x 86–114`, `y 45–61`** — the envelope Pip's tuft occupies. Wider or
  taller and it collides with the hats. Note that a crest paints *over* the party hat's
  crown, because that crown is a `back` fragment passing behind the head and a crest is one
  of the character's own layers: it reads as fur poking through, and Pip's tuft has always
  done it.
- **Markings are drawn over the cheeks and under the eyes and mouth**, so the expression
  always wins. A muzzle is something the mouth is drawn *on*. Check the open mouths
  specifically: `happy` and `celebrating` both open from `y 133` and the considering `o`
  reaches `y 134`, so a nose that hangs below `y 130` meets all three and the pair reads as
  one shape with a tongue in it.

## Coats

A character's colours are constants in `palette.ts`, in the `coats` map — the same place
Pip's four have always lived, and the set `catalogue.test.tsx` checks every hex literal
against.

| Coat | `base` | `shade` | `blush` |
| --- | --- | --- | --- |
| `pip` | `#fff6f0` | `#ffe8dd` | `#ffb3c9` |
| `mochi` | `#ffd2b0` | `#f0a97e` | `#fb90ac` |
| `sprig` | `#c3d8c0` | `#8caf88` | `#f5a3b6` |

**A coat stays out of the five app families.** Every cosmetic is one family outlined in that
family's deep shade, so a mint character loses the mint scarf and a lilac one loses the party
hat. Cream, ginger and sage each sit outside all five. A coat also has to be clearly deeper
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
