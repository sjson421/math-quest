import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  COSMETIC_SLOTS,
  ROOM_SLOTS,
  cosmetics,
  decorations,
  type CatalogueItem,
  type CosmeticSlot,
  type RoomSlot,
} from '../cosmetics'
import { tap } from '../lib/haptics'
import { standing, type ItemStanding } from '../lib/wardrobe'
import type { Progress } from '../store/progress'
import { Mascot } from './Mascot'
import { Room } from './Room'

/**
 * Where coins go.
 *
 * Props only, no store read, so a node test can render the whole screen against
 * a synthetic record — the same reason the tree levels take a `Progress` instead
 * of reaching for the live one.
 *
 * Two sections, because the two kinds are previewed at different sizes and read
 * with different words: you wear a hat and you place a rug. Inside each section
 * the items are grouped by slot, which is a category the learner can already
 * feel — two things in one group are the two things that cannot be used at once.
 */
type Props = {
  progress: Progress
  onBuy: (id: string) => void
  onEquip: (id: string) => void
  onUnequip: (slot: CosmeticSlot | RoomSlot) => void
  onClose: () => void
}

/**
 * What each slot is called on screen.
 *
 * Keyed by both unions so a new slot on either surface is a type error here
 * rather than a category that silently renders no heading. The order the
 * categories appear in is the order of `COSMETIC_SLOTS` and `ROOM_SLOTS`, not
 * the order of this table.
 */
const CATEGORY: Record<CosmeticSlot | RoomSlot, string> = {
  back: 'Back',
  headwear: 'Headwear',
  face: 'Face',
  neck: 'Neck',
  pin: 'Badge',
  rug: 'Floor',
  wall: 'Wall',
  left: 'Left corner',
  right: 'Right corner',
}

export function Shop({ progress, onBuy, onEquip, onUnequip, onClose }: Props) {
  const card = (item: CatalogueItem) => ({
    item,
    standing: standing(progress, item),
    onBuy: () => onBuy(item.id),
    onEquip: () => onEquip(item.id),
    onUnequip: () => onUnequip(item.slot),
  })

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={onClose}
          className="text-2xl text-ink-soft w-9 h-9 rounded-full flex items-center justify-center active:bg-cream-deep"
          aria-label="Close shop"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold flex-1">Pip's shop</h1>
        <div className="flex items-center gap-1.5">
          <span className="text-xl" aria-hidden="true">
            🪙
          </span>
          <span className="font-bold text-lg tabular-nums">{progress.coins}</span>
          <span className="sr-only">coins</span>
        </div>
      </header>

      <p className="px-5 pb-4 text-sm text-ink-soft">
        Every lesson you finish pays coins. Spend them on whatever you like — nothing here
        changes the maths.
      </p>

      <SectionHeading>Wardrobe</SectionHeading>
      {COSMETIC_SLOTS.map((slot) => (
        <Category
          key={slot}
          label={CATEGORY[slot]}
          items={cosmetics.filter((cosmetic) => cosmetic.slot === slot)}
          // Two columns, which puts Pip at 92px — the size floor the contract
          // names. An item illegible here is an item that fails its acceptance
          // pass, so the shop card is the check.
          layout="grid grid-cols-2 gap-4"
        >
          {(cosmetic) => (
            <Card key={cosmetic.id} {...card(cosmetic)}>
              <Mascot state="idle" size={92} equipped={{ [cosmetic.slot]: cosmetic.id }} />
            </Card>
          )}
        </Category>
      ))}

      <SectionHeading>Room</SectionHeading>
      {ROOM_SLOTS.map((slot) => (
        <Category
          key={slot}
          label={CATEGORY[slot]}
          items={decorations.filter((decoration) => decoration.slot === slot)}
          // Full width, not the wardrobe's two columns, so the room draws at
          // 194px and Pip inside it clears the same 92px floor. In the grid he
          // would land at 84.
          layout="flex flex-col gap-4"
        >
          {(decoration) => (
            <Card key={decoration.id} {...card(decoration)}>
              <Room
                state="idle"
                height={194}
                placed={{ [decoration.slot]: decoration.id }}
              />
            </Card>
          )}
        </Category>
      ))}

      <div className="pb-10" />
    </div>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="px-5 pb-2 text-sm font-bold text-ink-soft uppercase tracking-wide">
      {children}
    </h2>
  )
}

/**
 * One slot's worth of items, under a heading of its own.
 *
 * Renders nothing at all when the slot is empty rather than a heading with a
 * gap under it — a slot with no item yet is a normal state of the catalogue, not
 * something the learner should be shown.
 */
function Category<T>({
  label,
  items,
  layout,
  children,
}: {
  label: string
  items: readonly T[]
  layout: string
  children: (item: T) => ReactNode
}) {
  if (items.length === 0) return null

  return (
    <section>
      <h3 className="px-5 pb-2 text-xs font-bold text-ink-faint uppercase tracking-wide">
        {label}
      </h3>
      <div className={`px-5 pb-6 ${layout}`}>{items.map(children)}</div>
    </section>
  )
}

/**
 * The words for each standing, per kind. One table for both lines of the card;
 * two would drift, and a rug captioned "Worn" is exactly the drift.
 */
const WORDS = {
  cosmetic: { using: 'Worn', stop: 'Take off', start: 'Wear' },
  decoration: { using: 'In the room', stop: 'Put away', start: 'Place' },
} as const

function Card({
  item,
  standing,
  onBuy,
  onEquip,
  onUnequip,
  children,
}: {
  item: CatalogueItem
  standing: ItemStanding
  onBuy: () => void
  onEquip: () => void
  onUnequip: () => void
  children: ReactNode
}) {
  const words = WORDS[item.kind]

  const action = {
    'in-use': { caption: words.using, label: words.stop, run: onUnequip },
    owned: { caption: 'Owned', label: words.start, run: onEquip },
    affordable: { caption: `${item.price} coins`, label: `Buy · ${item.price}`, run: onBuy },
    'out-of-reach': {
      caption: `${item.price} coins`,
      label: 'Not enough coins',
      run: null,
    },
  }[standing]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-blob bg-white shadow-soft p-3 flex flex-col items-center gap-1"
    >
      {children}

      <p className="font-bold text-sm text-center">{item.name}</p>
      <p className="text-xs text-ink-faint">{action.caption}</p>

      <button
        onClick={
          action.run
            ? () => {
                tap()
                action.run()
              }
            : undefined
        }
        disabled={!action.run}
        className={`mt-1 w-full rounded-full py-2 text-sm font-bold ${
          action.run ? 'bg-blossom-soft text-blossom-deep' : 'bg-cream-deep text-ink-faint'
        }`}
      >
        {action.label}
      </button>
    </motion.div>
  )
}
