# Acceptance and provenance

## The acceptance pass

Run this before an item is considered done. Every line is something a reviewer can check by
looking, which is the point — none of it is a matter of taste.

**Composition**

- [ ] The item draws only itself. No head, ears, face, or duplicated Pip geometry.
- [ ] One id, one slot. If it spans back and front fragments, both share that id and equip
      together.
- [ ] All geometry is in `0 0 200 200` units, positioned against a named anchor rather than
      wrapped in a scaling or repositioning `transform`.
- [ ] It uses one colour family plus its deep shade for the outline, and any colour outside
      the palette carries a one-line reason in a comment.
- [ ] Strokes are 2.5–3 units with round caps and joins.
- [ ] Every transform origin is written in view-box units
      (`style={{ transformOrigin: '148px 162px' }}`), never as `originX` / `originY`, which
      take a 0–1 fraction and silently detach the layer.
- [ ] `spin` appears only in the `celebrating` state.
- [ ] If the item occupies the `pin` slot, replacing Pip's signature star was a deliberate
      decision and is called out in review, not a side effect of choosing that slot.

**Size**

- [ ] Rendered at **92 px**, every feature is still distinguishable — nothing has collapsed
      into a smudge or a single line.
- [ ] Rendered at **190 px**, no edge looks thin, ragged, or unfinished.

**States** — check all six, not just `idle`:

- [ ] `idle` — sits correctly at rest.
- [ ] `thinking` — does not collide with the thought dots at `(163, 88)` and `(173, 76)`.
- [ ] `happy` — survives the ear swing to −14° / +14° and the taller bob.
- [ ] `encouraging` — survives the +5° body tilt.
- [ ] `celebrating` — survives the ±6° rotation and the largest bob without leaving the view
      box.
- [ ] `sleeping` — does not collide with the sleep marks at `(152, 74)` and `(168, 56)`, and
      survives the +8° tilt.

**Clipping and collision**

- [ ] Nothing crosses the view-box edge at any state, at the widest point of its animation.
- [ ] Nothing overlaps the eyes or mouth unless the item is a `face` cosmetic that means to.
- [ ] Occlusion is right: what should pass behind the head does, and what should pass in
      front does, at the render-order step the item claims.

**Static and accessibility**

- [ ] With motion disabled, the item still reads as what it is, and nothing it communicates
      has disappeared.
- [ ] The item adds no accessible name of its own; Pip's single `aria-label` still describes
      the character.

**Offline**

- [ ] No `<image href>` to a remote URL, no webfont, no runtime fetch. Everything the item
      needs is in the bundle.

**Tooling**

- [ ] The item can be opened and edited again with free tools. Nothing in its authoring
      path — editor, format, or export step — needs a paid plan or an account.

## The acceptance pass for a decoration

A decoration is checked against the list above wherever it still applies — one id, one slot,
view-box units, one family plus its deep shade, 2.5–3 unit strokes, round caps and joins, no
remote reference, free tooling. These replace the parts that are about Pip's body:

**Composition**

- [ ] The item draws only itself. No wall, no floor, no horizon, no Pip.
- [ ] All geometry is in the room's `0 0 320 200` units, positioned against a named anchor
      from `references/room.md`, not wrapped in a scaling or repositioning `transform`.
- [ ] A floor item stands *on* its anchor — the anchor is the item's base, not its centre.
- [ ] It declares no `back` or `front` fragment. Pip is one step; there is no gap to span.
- [ ] Its colour family differs from the surface it sits against: no `wall` item is powder,
      no floor item is butter.

**Size and placement**

- [ ] Rendered with the room at **148 px** tall, every feature is still distinguishable.
- [ ] Nothing crosses the room's view-box edge.
- [ ] A `left` or `right` item stays clear of Pip's rendered extent — `x 86` and `x 234` — or
      is deliberately content to pass behind him.
- [ ] A `wall` item is checked with the party hat equipped, not just against a bare Pip: a
      narrow shape centred on `wall-center` is almost entirely covered by the crown.

**Occlusion**

- [ ] The item reads correctly with Pip drawn over it, since that is the only order there is.
- [ ] It does not sit where it will be entirely hidden by Pip or by his ground shadow.

**Motion and accessibility**

- [ ] The item is still. It takes no state and animates nothing.
- [ ] It adds no accessible name of its own; Pip's single `aria-label` is all that is
      announced.

## Provenance

Final Pip artwork should be drawn in this repository. Outside art is for prototypes,
structural reference, and spike material — the character's own geometry is small enough
that borrowing it costs more in drift than it saves in time.

When an asset does come from outside:

- **Vendor it.** Copy the file into the repository. Nothing loads from a CDN, because the
  installed PWA has to work with no network at all.
- **Record source URL, author, licence, any local modification, and the required
  attribution** beside the asset or in the asset registry. Do it when the file lands; a
  licence reconstructed six months later is a guess.
- **Check that you can still edit it.** A licence that permits use is not the same as a
  format you can reopen. Prefer sources that hand you SVG or another plain-text format over
  ones that hand you a file only their own hosted editor can change.
- **Check the licence per file.** A download button is not a grant. CC0 is clean, CC BY
  needs attribution shipped with the app, and anything non-commercial or no-derivatives
  does not belong here at all.
- Kenney (<https://www.kenney.nl/support>) is the preferred source for CC0 prototype UI art.

SVG exported from an editor may be cleaned with SVGO as a development-only step, after a
visual comparison against the original. Optimisation must preserve ids, the view box,
transforms, and any animated geometry — SVGO will happily collapse the exact attributes the
motion presets need. SVGO does not become an application dependency
(<https://github.com/svg/svgo>).
