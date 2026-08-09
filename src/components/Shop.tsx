import { motion } from 'framer-motion'
import { cosmetics, type Cosmetic, type CosmeticSlot } from '../cosmetics'
import { tap } from '../lib/haptics'
import { standing, type CosmeticStanding } from '../lib/wardrobe'
import type { Progress } from '../store/progress'
import { Mascot } from './Mascot'

/**
 * Where coins go.
 *
 * Props only, no store read, so a node test can render the whole screen against
 * a synthetic record — the same reason the tree levels take a `Progress` instead
 * of reaching for the live one.
 */
type Props = {
  progress: Progress
  onBuy: (id: string) => void
  onEquip: (id: string) => void
  onUnequip: (slot: CosmeticSlot) => void
  onClose: () => void
}

export function Shop({ progress, onBuy, onEquip, onUnequip, onClose }: Props) {
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
        <h1 className="text-2xl font-bold flex-1">Pip's wardrobe</h1>
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

      <div className="px-5 pb-10 grid grid-cols-2 gap-4">
        {cosmetics.map((cosmetic) => (
          <Card
            key={cosmetic.id}
            cosmetic={cosmetic}
            standing={standing(progress, cosmetic)}
            onBuy={() => onBuy(cosmetic.id)}
            onEquip={() => onEquip(cosmetic.id)}
            onUnequip={() => onUnequip(cosmetic.slot)}
          />
        ))}
      </div>
    </div>
  )
}

function Card({
  cosmetic,
  standing,
  onBuy,
  onEquip,
  onUnequip,
}: {
  cosmetic: Cosmetic
  standing: CosmeticStanding
  onBuy: () => void
  onEquip: () => void
  onUnequip: () => void
}) {
  // One switch for both lines of the card. Two would drift.
  const action = {
    worn: { caption: 'Worn', label: 'Take off', run: onUnequip },
    owned: { caption: 'Owned', label: 'Wear', run: onEquip },
    affordable: { caption: `${cosmetic.price} coins`, label: `Buy · ${cosmetic.price}`, run: onBuy },
    'out-of-reach': {
      caption: `${cosmetic.price} coins`,
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
      {/* 92px is the size floor the contract names — an item illegible here is
          an item that fails its acceptance pass, so the shop card is the check. */}
      <Mascot state="idle" size={92} equipped={{ [cosmetic.slot]: cosmetic.id }} />

      <p className="font-bold text-sm text-center">{cosmetic.name}</p>
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
