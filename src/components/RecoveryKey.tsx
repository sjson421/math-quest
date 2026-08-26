import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { tap } from '../lib/haptics'
import { isValidKey, normalizeKey } from '../lib/recovery-key'
import { restoreFromKey } from '../lib/sync'
import { useProgress } from '../store/progress'
import { useRecoveryKey } from '../store/recovery-key'

/**
 * Every string here is written to the same rule: say what the key does, say who
 * can use it, and say what happens if it is lost. The key is a bearer
 * credential — anyone holding it can read and write this progress — so nothing
 * on this screen calls it secure, private, encrypted, or a password, because it
 * is none of those things.
 *
 * The key is shown in full, always. Standard practice is a one-time reveal, but
 * that is only correct when a password can reset it. Here there is no reset, so
 * a one-time reveal would turn "the learner didn't write it down" into permanent loss.
 */

const PLACEHOLDER = 'MATH-XXXX-XXXX-XXXX-XXXX'

function KeyDisplay({ keyValue }: { keyValue: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    tap()
    try {
      await navigator.clipboard.writeText(keyValue)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused. The key is on screen either way, which
      // is the part that matters.
    }
  }

  return (
    <button
      onClick={() => void copy()}
      className="w-full rounded-2xl bg-cream-deep/60 px-3 py-3 active:scale-[0.98] transition-transform"
    >
      <span className="block font-mono font-bold tracking-wide text-[0.95rem] break-all">
        {keyValue}
      </span>
      <span className="block text-xs text-ink-soft mt-1">
        {copied ? 'Copied!' : 'Tap to copy'}
      </span>
    </button>
  )
}

/** The permanent home of the key, in Settings. */
export function RecoveryKeyCard() {
  const keyValue = useRecoveryKey((s) => s.key)
  const [entering, setEntering] = useState(false)

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        This key is how your progress finds its way back to you. Type it into Math Quest on a
        new phone and everything returns — streak, coins, and all.
      </p>

      {keyValue ? (
        <KeyDisplay keyValue={keyValue} />
      ) : (
        <p className="text-sm text-ink-faint">Setting up…</p>
      )}

      <p className="text-xs text-ink-soft leading-relaxed">
        Write it down somewhere you'll find it later. Anyone who has it can open your progress,
        and if it's lost there's no way to get it back.
      </p>

      {entering ? (
        <RecoveryKeyEntry onDone={() => setEntering(false)} />
      ) : (
        <button
          onClick={() => {
            tap()
            setEntering(true)
          }}
          className="w-full py-3 rounded-2xl bg-white font-bold text-sm shadow-soft active:scale-[0.98] transition-transform"
        >
          I have a key from another phone
        </button>
      )}
    </div>
  )
}

type EntryStage =
  | { name: 'typing' }
  /** A key was typed while this phone already holds progress. */
  | { name: 'confirming'; key: string }
  | { name: 'working' }
  | { name: 'done'; message: string }

/** Enter an existing key and pull its progress down. */
export function RecoveryKeyEntry({ onDone }: { onDone: () => void }) {
  const progress = useProgress((s) => s.progress)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<EntryStage>({ name: 'typing' })

  // A record that has never been mutated is nothing to lose.
  const hasLocalProgress = progress.updatedAt > 0

  const submit = () => {
    tap()
    // Checked here so an obvious typo never reaches the network.
    if (!isValidKey(input)) {
      setError(`That doesn't look like a recovery key. They look like ${PLACEHOLDER}.`)
      return
    }

    setError(null)
    const key = normalizeKey(input)

    if (hasLocalProgress) {
      setStage({ name: 'confirming', key })
      return
    }
    void restore(key)
  }

  const restore = async (key: string) => {
    setStage({ name: 'working' })
    const outcome = await restoreFromKey(key)

    setStage({
      name: 'done',
      message:
        outcome === 'restored'
          ? 'Your progress is back.'
          : outcome === 'failed'
            ? "Couldn't reach the server just now. Your progress here is safe — try again in a little while."
            : 'That key is saved. There was nothing stored under it yet, so your progress on this phone will save to it from now on.',
    })
  }

  if (stage.name === 'confirming') {
    return (
      <div className="space-y-2 rounded-2xl bg-butter-soft p-3">
        <p className="text-sm text-ink-soft">
          You already have progress on this phone. If that key has progress saved under it, it
          replaces what's here.
        </p>
        <button
          onClick={() => {
            tap()
            void restore(stage.key)
          }}
          className="w-full py-3 rounded-2xl bg-ink text-cream font-bold text-sm"
        >
          Yes, use that key
        </button>
        <button
          onClick={() => setStage({ name: 'typing' })}
          className="w-full py-2.5 rounded-2xl font-semibold text-sm text-ink-soft"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (stage.name === 'working') {
    return <p className="text-sm text-ink-soft py-3 text-center">Looking for your progress…</p>
  }

  if (stage.name === 'done') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-lilac-deep">{stage.message}</p>
        <button
          onClick={onDone}
          className="w-full py-3 rounded-2xl bg-white font-bold text-sm shadow-soft"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm text-ink-soft" htmlFor="recovery-key-input">
        Type the key from your other phone.
      </label>
      <input
        id="recovery-key-input"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setError(null)
        }}
        placeholder={PLACEHOLDER}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="w-full rounded-2xl bg-white px-3 py-3 font-mono text-[0.95rem] uppercase shadow-soft placeholder:text-ink-faint placeholder:normal-case"
      />
      {error && <p className="text-sm text-blossom-deep">{error}</p>}
      <button
        onClick={submit}
        className="w-full py-3 rounded-2xl bg-mint-deep text-white font-bold text-sm active:scale-[0.98] transition-transform"
      >
        Restore my progress
      </button>
      <button
        onClick={onDone}
        className="w-full py-2.5 rounded-2xl font-semibold text-sm text-ink-soft"
      >
        Cancel
      </button>
    </div>
  )
}

/**
 * Shown once, after the first completed lesson rather than during onboarding —
 * there is no point asking someone to safeguard progress before they have any.
 */
export function RecoveryKeyIntro() {
  const keyValue = useRecoveryKey((s) => s.key)
  const markIntroduced = useRecoveryKey((s) => s.markIntroduced)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-ink/25 px-4 pb-4"
      >
        <motion.div
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="w-full max-w-sm rounded-blob bg-cream p-5 shadow-soft space-y-3"
        >
          <h2 className="text-xl font-bold">Now there's something worth keeping</h2>

          <p className="text-sm text-ink-soft">
            Your progress saves to this phone, and to this key:
          </p>

          {keyValue && <KeyDisplay keyValue={keyValue} />}

          <p className="text-sm text-ink-soft">
            If this phone is ever lost or reset, typing that key into Math Quest on a new one
            brings everything back.
          </p>

          <p className="text-xs text-ink-soft leading-relaxed">
            Write it down somewhere you'll find it later. Anyone who has it can open your
            progress, and if it's lost there's no way to get it back. You can always see it
            again in Settings.
          </p>

          <button
            onClick={() => {
              tap()
              markIntroduced()
            }}
            className="w-full h-13 py-3.5 rounded-2xl bg-mint-deep text-white font-bold active:scale-[0.98] transition-transform"
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
