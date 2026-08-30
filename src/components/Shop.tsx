import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  COSMETIC_SLOTS,
  ROOM_SLOTS,
  characterOf,
  characters,
  cosmetics,
  decorations,
  type CatalogueItem,
  type CosmeticSlot,
  type RoomSlot,
} from '../cosmetics'
import { tap } from '../lib/haptics'
import { freezeStanding, standing, type ItemStanding } from '../lib/wardrobe'
import {
  MAX_STREAK_FREEZES,
  STREAK_FREEZE_PRICE,
  STREAK_TIERS,
  streakMultiplier,
} from '../lib/streak'
import { currentPinTier, type Progress } from '../store/progress'
import { Mascot } from './Mascot'
import { Room } from './Room'

/**
 * Where coins go.
 *
 * Props only, no store read, so a node test can render the whole screen against
 * a synthetic record — the same reason the tree levels take a `Progress` instead
 * of reaching for the live one.
 *
 * Three sections, because the three kinds are previewed differently and read
 * with different words: you become a character, you wear a hat, you place a rug.
 * Inside the two that have slots the items are grouped by one, which is a
 * category the learner can already feel — two things in one group are the two
 * things that cannot be used at once. Characters have no slots because they are
 * all one group already: there is only ever one of you.
 *
 * Characters come first, and the wardrobe below previews every item on the one
 * currently chosen, so what the learner sees under "Wear" is what they would
 * actually be wearing.
 */
type Props = {
  progress: Progress
  onBuy: (id: string) => void
  onBuyFreeze: () => void
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
  rug: 'Floor',
  wall: 'Wall',
  left: 'Left corner',
  right: 'Right corner',
}

export function Shop({ progress, onBuy, onBuyFreeze, onEquip, onUnequip, onClose }: Props) {
  // Every preview in the shop wears the pin the learner has actually earned:
  // a card is a picture of what you would get, and the pin is not for sale.
  const tier = currentPinTier(progress)
  // The shop belongs to whoever the learner is playing as, so the title follows
  // the character rather than naming the one they may have stopped being.
  const who = characterOf(progress.character)

  const card = (item: CatalogueItem) => ({
    item,
    standing: standing(progress, item),
    onBuy: () => onBuy(item.id),
    onEquip: () => onEquip(item.id),
    // Absent for a character, which is what makes its in-use button inert: you
    // never take one off, you become another.
    onUnequip: item.kind === 'character' ? undefined : () => onUnequip(item.slot),
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
        <h1 className="text-2xl font-bold flex-1">{who.name}'s shop</h1>
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

      {/* First, because it is the only thing here that can stop being buyable
          — the day a freeze would have covered has to be paid for before it
          arrives. Everything below waits patiently. */}
      <SectionHeading>Streak</SectionHeading>
      <div className="px-5 pb-6">
        <FreezeCard
          held={progress.streakFreezes}
          standing={freezeStanding(progress)}
          onBuy={onBuyFreeze}
        />
        <Multipliers streakCount={progress.streakCount} />
      </div>

      <SectionHeading>Characters</SectionHeading>
      <div className="px-5 pb-6 grid grid-cols-2 gap-4">
        {characters.map((character) => (
          <Card key={character.id} {...card(character)}>
            {/* Bare, not in the learner's current outfit. The card is asking who
                they want to be, and a card showing a wizard hat on all three
                answers a question nobody is being asked. */}
            {/* At the learner's own tier, so a character card previews what
                they would actually be playing as rather than a fresh record. */}
            <Mascot state="idle" size={92} character={character.id} tier={tier} />
          </Card>
        ))}
      </div>

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
              <Mascot
                state="idle"
                size={92}
                character={progress.character}
                equipped={{ [cosmetic.slot]: cosmetic.id }}
                tier={tier}
              />
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
                character={progress.character}
                tier={tier}
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
 * The words for each standing, per kind. One table for all three lines of the
 * card; three would drift, and a rug captioned "Worn" is exactly the drift.
 *
 * A character's `stop` labels a button that does nothing — `onUnequip` is absent
 * for that kind, so the button is disabled and the word is a statement rather
 * than an offer. That is the honest rendering of a slot that is never empty.
 */
const WORDS = {
  character: { using: 'Playing as', stop: 'Chosen', start: 'Play as' },
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
  onUnequip?: () => void
  children: ReactNode
}) {
  const words = WORDS[item.kind]

  const action: { caption: string; label: string; run: (() => void) | null } = {
    'in-use': { caption: words.using, label: words.stop, run: onUnequip ?? null },
    owned: { caption: 'Owned', label: words.start, run: onEquip },
    // Names the day it opens rather than saying "locked". A gate the learner
    // cannot see the far side of is a gate they cannot decide to walk toward.
    'streak-locked': {
      caption: `${item.price} coins`,
      label: `🔒 ${item.requiresStreak}-day streak`,
      run: null,
    },
    affordable: { caption: `${item.price} coins`, label: `Buy · ${item.price}`, run: onBuy },
    'out-of-reach': {
      caption: `${item.price} coins`,
      label: 'Not enough coins',
      run: null,
    },
  }[standing]

  const run = action.run

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
          run
            ? () => {
                tap()
                run()
              }
            : undefined
        }
        disabled={run === null}
        className={`mt-1 w-full rounded-full py-2 text-sm font-bold ${
          action.run ? 'bg-blossom-soft text-blossom-deep' : 'bg-cream-deep text-ink-faint'
        }`}
      >
        {action.label}
      </button>
    </motion.div>
  )
}

/**
 * The one consumable, and the one card that is not a `CatalogueItem`.
 *
 * It shares `Card`'s shape without sharing its code: that component reads
 * `item.name`, `item.price` and `item.kind` off the catalogue, and a freeze has
 * none of the three. Widening it to take a shapeless item would put four
 * optional fields on every cosmetic card to serve this one.
 *
 * What it says at the cap is the point of the cap: a learner with a thousand
 * coins is told they already hold as many as they can, not offered a third.
 */
function FreezeCard({
  held,
  standing,
  onBuy,
}: {
  held: number
  standing: ReturnType<typeof freezeStanding>
  onBuy: () => void
}) {
  const action = {
    affordable: { label: `Buy · ${STREAK_FREEZE_PRICE}`, run: onBuy },
    'at-cap': { label: `Holding ${MAX_STREAK_FREEZES} of ${MAX_STREAK_FREEZES}`, run: null },
    'out-of-reach': { label: 'Not enough coins', run: null },
  }[standing]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-blob bg-white shadow-soft p-4 flex items-center gap-4"
    >
      <span className="text-4xl" aria-hidden="true">
        ❄
      </span>

      <div className="flex-1">
        <p className="font-bold text-sm">Streak freeze</p>
        <p className="text-xs text-ink-soft mt-0.5">
          Covers one day you miss, on its own, the next time you open the app. Holding{' '}
          <span className="tabular-nums">{held}</span> of {MAX_STREAK_FREEZES}.
        </p>
      </div>

      <button
        onClick={
          action.run
            ? () => {
                tap()
                action.run()
              }
            : undefined
        }
        disabled={action.run === null}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
          action.run ? 'bg-blossom-soft text-blossom-deep' : 'bg-cream-deep text-ink-faint'
        }`}
      >
        {action.label}
      </button>
    </motion.div>
  )
}

/**
 * What the run of days is currently worth, and what it would be worth longer.
 *
 * Here rather than on the home screen because this is the screen about coins:
 * the ladder is the answer to "why does the streak matter", and the answer is
 * only meaningful next to the things it buys.
 *
 * Drawn in `STREAK_TIERS`' own order, which is the order a learner climbs it.
 */
function Multipliers({ streakCount }: { streakCount: number }) {
  const current = streakMultiplier(streakCount)

  return (
    <ol className="mt-3 flex gap-2">
      {STREAK_TIERS.map(({ days, multiplier }) => {
        const active = multiplier === current

        return (
          <li
            key={days}
            aria-current={active ? 'true' : undefined}
            className={`flex-1 rounded-2xl px-2 py-2 text-center ${
              active ? 'bg-mint-soft text-mint-deep' : 'bg-white text-ink-faint'
            }`}
          >
            <span className="block text-sm font-bold tabular-nums">{multiplier}×</span>
            <span className="block text-[11px] font-semibold tabular-nums">
              {days === 0 ? 'start' : `${days}d`}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
