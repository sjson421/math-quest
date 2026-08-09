---
name: mascot-design
description: Use when authoring, reviewing, or changing a Pip cosmetic, a room decoration, or any mascot or scene layer in Math Quest — the two coordinate systems, slot and occlusion order, palette, geometry limits, motion vocabulary, and asset provenance rules a new item must satisfy.
---

# Designing for Pip

Pip is one React component of plain SVG geometry: [`src/components/Mascot.tsx`](../../../src/components/Mascot.tsx).
Ears, head, face, and a signature-star accessory are separate layers inside one
`0 0 200 200` view box, which is the whole reason cosmetics are possible without redrawing
the character.

**A cosmetic is one small layer attached to a stable slot. It is never a second Pip.** The
rule exists because the alternative — a complete mascot variant per outfit — multiplies
every future expression, state, and palette fix by the number of items shipped. If an item
cannot be expressed as geometry hung off an anchor, the item is wrong, not the contract.

**There are two surfaces.** Pip himself, on the `0 0 200 200` canvas, wearing cosmetics; and
the room he stands in, on a `0 0 320 200` canvas that *contains* his at the same unit scale,
holding decorations. The same rules govern both — geometry in view-box units, one family per
item, 2.5–3 unit strokes — and each surface has its own anchors, slots and paint order.

Read the reference that matches the question; each is one level deep and none links to
another:

- **[references/layers.md](references/layers.md)** — Pip's canvas, named anchors, slot list,
  global render order, and how one item spans back and front fragments.
- **[references/room.md](references/room.md)** — the room's canvas, how Pip's is nested
  inside it, the horizon, the four placement slots, the paint order that makes Pip one
  opaque step, and the fixed surface colours.
- **[references/visual-language.md](references/visual-language.md)** — palette, stroke and
  shape limits, the size floor, semantic motion, and reduced-motion behaviour.
- **[references/checklist.md](references/checklist.md)** — the acceptance pass an item must
  survive before it ships, plus provenance and licensing rules for anything not drawn here.

## What this skill does not do

It does not change `Mascot.tsx`. It describes what an item must satisfy; the component
decides how items are drawn.

The slot list and render order in `references/layers.md` were a contract for future work
until roadmap item 16's first increment built the renderer. **They now describe code**:
`Mascot.tsx` walks those ten steps, `Room.tsx` walks the seven in `references/room.md`,
`src/cosmetics/` holds one catalogue of both kinds, and the progress record carries what is
owned, worn, and placed. An item authored against this contract displays as soon as it is in
the catalogue and bought.

## The shape of an item

```tsx
// A single cosmetic: one id, one slot, geometry in view-box units.
export const roundGlasses = {
  id: 'round-glasses',
  slot: 'face',
  // INK rather than a colour family: glasses sit on the face and read as part of the
  // expression, and a lilac frame competes with the eyes it surrounds.
  render: () => (
    <g>
      <circle cx="78" cy="110" r="13" fill="none" stroke={INK} strokeWidth="3" />
      <circle cx="122" cy="110" r="13" fill="none" stroke={INK} strokeWidth="3" />
      <path d="M91 110 h18" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
}
```

Three things make that item legal, and every one of them is checkable:

1. **It draws in view-box units, not its own coordinate space.** `78` and `122` are Pip's
   actual eye centres, so the lenses land on the eyes at every rendered size. No wrapper
   `transform` scales or repositions the item into place.
2. **It borrows Pip's existing values** — `INK`, a 3-unit stroke — instead of introducing a
   colour and weight that drift from the character.
3. **It draws only the glasses.** No head, no face, no ears. Those already exist underneath.

A hat is the harder case, because a brim passes in front of the head while the crown passes
behind the ear tips. That item is still one id; it splits into a `back` and a `front`
fragment that the render order interleaves around Pip's own layers. `references/layers.md`
has the mechanics.

## Non-negotiables

- **Geometry lives in the canvas its surface owns** — `0 0 200 200` for a cosmetic,
  `0 0 320 200` for a decoration. Pip's head is a circle at `(100, 112)` with radius `57`.
  Anything authored against a different canvas and scaled in will not survive a future tweak
  to that circle.
- **Pip is a head and two ears. There is no body, no neck, no hands.** The `neck-center`
  anchor at `(100, 160)` sits inside the lower head, and a scarf there reads as a scarf
  because it crosses the chin line — not because there is a neck to wrap. Do not author an
  item that assumes anatomy Pip does not have.
- **An item must be intelligible standing still.** Motion is decoration on top of a shape
  that already reads. A learner with reduced motion enabled, or looking at a screenshot,
  sees the static form and nothing else.
- **An item must survive 92 px.** That is the smallest rendered size, a 0.46 scale, and it
  is where fine detail turns to mud.
- **Nothing loads over the network.** The PWA works offline; every asset is vendored into
  the repository with its source and licence recorded.
- **No cosmetic may require a paid or account-gated tool to author.** This gates a tool
  before any of its merits are weighed. A format whose only editor is a hosted product
  makes the authoring path a standing dependency on someone else's pricing and account
  policy — and unlike a bad runtime, you cannot swap it out later without redrawing every
  asset already made in it. Hand-written SVG, Inkscape, and SVGO all qualify; Rive does
  not, which is the first reason item 15 rejected it and the one that would still hold if
  every other objection were answered.
