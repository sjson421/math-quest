# Canvas, anchors, slots, and render order

## The canvas

One view box, `0 0 200 200`, shared by Pip and every cosmetic. Six call sites render it at
four sizes — 92, 120, 148, and 190 CSS pixels. (`Mascot.tsx` defaults `size` to 160, but no
caller passes it, so 92 and 190 are the extremes that matter.) The shop draws one Pip per
catalogue item at 92, which makes the smallest size also the most repeated one.

Pip's resting geometry occupies roughly `x 26–174`, `y 46–187`. Note that **the ears, not
the tuft, are the highest and widest part** — they are drawn as upright ellipses and then
rotated, so their rendered extent is nowhere near their written coordinates:

| Part | Geometry |
| --- | --- |
| ground shadow | ellipse `(100, 180)`, `rx 42`, `ry 7` — the lowest point, `y 187` |
| ears | ellipses `(56, 72)` and `(144, 72)`, `rx 17`, `ry 30`, rotated −24° / +24° about their bases — **rendered** extent `x 26–66` and `x 134–174`, `y 46–102` |
| head | circle `(100, 112)`, `r 57` — spans `x 43–157`, `y 55–169` |
| tuft | `M92 58 Q100 42 108 58` — `42` is the Bézier control point, not a point on the curve; the apex is `y 50` |
| cheeks | ellipses `(66, 126)` and `(134, 126)` |
| eyes | centred `x 78` and `x 122`, `y 110` |
| mouth | around `y 138` |
| signature star | occupies the `pin` slot, origin `(148, 162)` |
| thinking dots | `(163, 88)` and `(173, 76)` — `thinking` state only |
| sleep marks | `(152, 74)` and `(168, 56)` — `sleeping` state only |

The upper-right quadrant outside the head is **not free space**: `thinking` and `sleeping`
both draw there. An item that reaches into it must be checked against those two states, not
just against `idle`.

## Named anchors

Author against these rather than against measured pixels. Three of them are the exact
transform origins the component already uses, so they are load-bearing, not descriptive.

| Anchor | Point | Source |
| --- | --- | --- |
| `head-top` | `(100, 55)` | top of the head circle |
| `left-ear-base` | `(56, 96)` | the left ear's `transformOrigin` |
| `right-ear-base` | `(144, 96)` | the right ear's `transformOrigin` |
| `face-center` | `(100, 116)` | between the eye line and the mouth |
| `neck-center` | `(100, 160)` | the chin line, inside the lower head |
| `pin` | `(148, 162)` | the signature star's `transformOrigin` |

Item 16 may rename an anchor or move a coordinate, but only by updating this table and
every cosmetic authored against it in the same change. An anchor that means one thing in
the contract and another in a shipped item is worse than no anchor.

## Slots

Every cosmetic declares exactly one slot. Two items in the same slot cannot be worn at
once; that is what a slot is for.

| Slot | Holds | Anchor |
| --- | --- | --- |
| `back` | capes, ribbon tails, wings — anything entirely behind Pip | `neck-center` |
| `headwear` | hats, crowns, bows, ear clips | `head-top`, ear bases |
| `face` | glasses, eye patches, face paint | `face-center` |
| `neck` | scarves, medals, collars | `neck-center` |
| `pin` | badges and charms; **defaults to the signature star** | `pin` |

The `pin` slot is already occupied. An item equipped there replaces Pip's star rather than
stacking with it, and that is a visible identity change — treat replacing the star as a
deliberate design decision, not a free slot.

## Render order

Painted first to last. Steps 1, 4, 6, 9, and 10 are Pip's own layers and are fixed; the
rest are the openings cosmetics paint into.

1. ground shadow
2. `back` cosmetics
3. `headwear` **back** fragments
4. **Pip ears and head**
5. `headwear` **front** fragments
6. **Pip expression** (eyes, mouth, cheeks)
7. `face` cosmetics
8. `neck` cosmetics
9. **`pin`** — the signature star by default
10. foreground effects — today only the sleep marks; the slot is reserved for the
    celebration effects item 16 may add

`Mascot.tsx` implements these ten steps in this order. It is the same order Pip was always
painted in — shadow, ears, head, face, star, sleep marks — with the cosmetic openings
interleaved, so items authored against this table before the renderer existed did not need
re-layering.

## Back and front fragments

A hat crown sits behind the ear tips while its brim sits in front of the forehead. That is
one item, one id, one slot, two fragments:

```tsx
export const partyHat = {
  id: 'party-hat',
  slot: 'headwear',
  // Painted at step 3, behind ears and head.
  back: () => <path d="M100 8 L124 62 H76 Z" fill={LILAC} stroke={LILAC_DEEP} strokeWidth="3" strokeLinejoin="round" />,
  // Painted at step 5, over the forehead.
  front: () => <path d="M74 60 h52 a5 5 0 0 1 0 10 h-52 a5 5 0 0 1 0 -10z" fill={LILAC_SOFT} stroke={LILAC_DEEP} strokeWidth="3" />,
}
```

Both fragments equip and unequip together and share one inventory entry. A fragment is not
a second item, and an item never needs more than these two — if it seems to, the geometry
is fighting the render order and should be simplified instead.

## Riding Pip's motion

The root `<svg>` carries the per-state bob and tilt, so **a cosmetic drawn as a child of the
root inherits it for free**. Do not re-apply the bob to an item; it will double.

The ears are the exception. They rotate independently — −24° and +24° at rest, animating to
`[-24, -14, -24]` and `[24, 14, 24]` on `happy` and `celebrating`. An ear clip that does not
follow that rotation detaches from the ear on those two states. Match the ear's transform
origin exactly:

```tsx
style={{ transformOrigin: '56px 96px' }}
```

`transformOrigin` in user units is the only form that works here. Framer Motion's
`originX` / `originY` take a 0–1 fraction, and passing pixels to those detaches the layer
from the part it belongs to — the same trap the ears themselves carry a comment about in
`Mascot.tsx`.
