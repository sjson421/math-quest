import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
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
 * with different words: you wear a hat and you place a rug.
 */
type Props = {
  progress: Progress
  onBuy: (id: string) => void
  onEquip: (id: string) => void
  onUnequip: (slot: CosmeticSlot | RoomSlot) => void
  onClose: () => void
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
      <div className="px-5 pb-6 grid grid-cols-2 gap-4">
        {cosmetics.map((cosmetic) => (
          <Card key={cosmetic.id} {...card(cosmetic)}>
            {/* 92px is the size floor the contract names — an item illegible here is
                an item that fails its acceptance pass, so the shop card is the check. */}
            <Mascot state="idle" size={92} equipped={{ [cosmetic.slot]: cosmetic.id }} />
          </Card>
        ))}
      </div>

      <SectionHeading>Room</SectionHeading>
      {/* Full width, not the wardrobe's two columns: see the card comment below. */}
      <div className="px-5 pb-10 flex flex-col gap-4">
        {decorations.map((decoration) => (
          <Card key={decoration.id} {...card(decoration)}>
            {/* Full width, so the room draws at 194px and Pip inside it clears the
                same 92px floor. In the two-column grid he would land at 84. */}
            <Room state="idle" height={194} placed={{ [decoration.slot]: decoration.id }} />
          </Card>
        ))}
      </div>
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
