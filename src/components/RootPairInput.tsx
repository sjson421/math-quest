import { useState } from 'react'
import { parseRootPairInput } from '../lib/answer'
import { entryLabel } from '../lib/keypad'
import {
  decodeRootPairEntry,
  updateRootPairEntry,
  type RootPairSlot,
} from '../lib/root-pair'
import type { KeypadRules } from '../lib/keypad'
import { Keypad } from './Keypad'
import { NumericEntry } from './NumericEntry'

export function RootPairInput({
  entry,
  onEntry,
  onConfirm,
  rules,
  disabled,
}: {
  entry: string
  onEntry: (apply: (previous: string) => string) => void
  onConfirm: () => void
  rules?: KeypadRules
  disabled?: boolean
}) {
  const [activeSlot, setActiveSlot] = useState<RootPairSlot>(0)
  const slots = decodeRootPairEntry(entry) ?? ['', '']

  const editActive = (apply: (previous: string) => string) => {
    onEntry((previous) => updateRootPairEntry(previous, activeSlot, apply))
  }

  return (
    <div className="w-full max-w-sm mx-auto" data-root-pair-input>
      <div className="grid grid-cols-2 gap-3 px-3 pb-3">
        {slots.map((value, index) => {
          const slot = index as RootPairSlot
          const active = activeSlot === slot
          return (
            <button
              key={slot}
              type="button"
              aria-label={`Root ${slot + 1}`}
              aria-pressed={active}
              onClick={() => setActiveSlot(slot)}
              disabled={disabled}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl border-2 px-2 py-2 ${
                active ? 'border-blossom-deep bg-blossom-soft' : 'border-cream-deep bg-white/70'
              }`}
            >
              <span className="text-sm font-bold text-ink-soft">Root {slot + 1}</span>
              <span className="max-w-full overflow-hidden text-3xl">
                <NumericEntry value={entryLabel(value)} fractionSize="fluid" />
              </span>
            </button>
          )
        })}
      </div>
      <Keypad
        value={slots[activeSlot]}
        onEntry={editActive}
        onSubmit={onConfirm}
        disabled={disabled}
        submitReady={parseRootPairInput(entry) !== null}
        rules={rules}
      />
    </div>
  )
}
