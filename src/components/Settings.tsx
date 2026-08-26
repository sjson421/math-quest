import { useRef, useState } from 'react'
import { hasProvenSync, isDangerouslyStale, useSyncStatus, type SyncSnapshot } from '../lib/sync'
import { useProgress, type Progress } from '../store/progress'
import { RecoveryKeyCard } from './RecoveryKey'

/**
 * Sync replaced the export button as the routine backup path. Both functions
 * below are deliberately **retained** rather than deleted: import is still the
 * recovery route for backup files produced before sync existed, and export is
 * what the runtime gate falls back to on a device where sync has never worked.
 */
function exportProgress(progress: Progress): void {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `math-quest-backup-${progress.todayDate}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function importProgress(file: File): Promise<Progress | null> {
  try {
    const parsed = JSON.parse(await file.text()) as Progress
    // A Phase 1 file carries no `updatedAt`; `replaceProgress` treats it as a
    // local edit, so it restores and then pushes to the server on its own.
    if (typeof parsed?.xp !== 'number' || typeof parsed?.skills !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function Settings({ onClose }: { onClose: () => void }) {
  const progress = useProgress((s) => s.progress)
  const replaceProgress = useProgress((s) => s.replaceProgress)
  const reset = useProgress((s) => s.reset)

  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmingReset, setConfirmingReset] = useState(false)

  const exportBackup = () => {
    exportProgress(progress)
    setMessage('Backup saved. Keep it somewhere safe!')
  }

  const importBackup = async (file: File) => {
    const parsed = await importProgress(file)
    if (!parsed) {
      setMessage("That file doesn't look like a Math Quest backup.")
      return
    }
    replaceProgress(parsed)
    setMessage('Progress restored!')
  }

  const totalAttempts = Object.values(progress.skills).reduce((n, s) => n + s.attempts, 0)
  const totalCorrect = Object.values(progress.skills).reduce((n, s) => n + s.correct, 0)
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  const topMistakes = Object.entries(progress.mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={onClose}
          className="text-2xl text-ink-soft w-9 h-9 rounded-full flex items-center justify-center active:bg-cream-deep"
          aria-label="Close settings"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <div className="px-5 space-y-6 pb-10">
        <Card title="Your progress">
          <Row label="Total XP" value={progress.xp} />
          <Row label="Coins" value={progress.coins} />
          <Row label="Day streak" value={progress.streakCount} />
          <Row label="Problems answered" value={totalAttempts} />
          <Row label="Accuracy" value={`${accuracy}%`} />
        </Card>

        {topMistakes.length > 0 && (
          <Card title="Things to watch">
            <ul className="space-y-1.5 text-sm text-ink-soft">
              {topMistakes.map(([tag, count]) => (
                <li key={tag} className="flex justify-between gap-4">
                  <span>{humanizeTag(tag)}</span>
                  <span className="tabular-nums font-semibold shrink-0">{count}×</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card title="Your recovery key">
          <RecoveryKeyCard />
        </Card>

        <Card title="Backup">
          <SyncStatus />
          <ExportGate onExport={exportBackup} />
          <button
            onClick={() => fileInput.current?.click()}
            className="w-full py-3.5 mt-2 rounded-2xl bg-white font-bold active:scale-[0.98] transition-transform shadow-soft"
          >
            Restore from a file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importBackup(file)
              e.target.value = ''
            }}
          />
        </Card>

        <Card title="Start over">
          {confirmingReset ? (
            <div className="space-y-2">
              <p className="text-sm text-ink-soft">
                This erases all progress — on this phone and under your recovery key, since the
                two stay in step. There's no undo, and your key won't bring it back.
              </p>
              <button
                onClick={() => {
                  reset()
                  setConfirmingReset(false)
                  setMessage('Progress cleared.')
                }}
                className="w-full py-3.5 rounded-2xl bg-blossom-deep text-white font-bold"
              >
                Yes, erase everything
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="w-full py-3 rounded-2xl font-semibold text-ink-soft"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingReset(true)}
              className="w-full py-3.5 rounded-2xl bg-white font-bold text-blossom-deep shadow-soft"
            >
              Reset progress
            </button>
          )}
        </Card>

        {message && (
          <p className="text-center text-sm font-semibold text-lilac-deep">{message}</p>
        )}
      </div>
    </div>
  )
}

/**
 * The export button is removed by a *runtime* gate, not deleted from the build.
 *
 * Sync supersedes manual export as the routine backup path — but on a device
 * where sync has never once succeeded (bad key, offline install, misconfigured
 * deployment), deleting the button outright would leave the learner with no
 * backup at all and no signal that anything was wrong. Gating on "at least one
 * successful sync on this device" makes that state impossible: the old safety
 * net stays until the new one has demonstrably worked, then quietly retires.
 */
function ExportGate({ onExport }: { onExport: () => void }) {
  const everSynced = useSyncStatus((s) => s.everSynced)
  const snapshot = { everSynced } as SyncSnapshot

  if (hasProvenSync(snapshot)) return null

  return (
    <>
      <button
        onClick={onExport}
        className="w-full h-13 py-3.5 rounded-2xl bg-mint-deep text-white font-bold active:scale-[0.98] transition-transform"
      >
        Export backup
      </button>
      <p className="text-xs text-ink-faint mt-2">
        Your progress hasn't reached your key yet, so here's a file copy in the meantime.
      </p>
    </>
  )
}

/**
 * A sync that is quietly failing is the failure mode this whole change exists
 * to prevent, so every state gets its own words. Nothing here can read as
 * success while progress is not actually reaching the server — and nothing
 * reads as alarm either, because the device copy is fine in every one of these
 * states.
 */
function SyncStatus() {
  const status = useSyncStatus((s) => s.status)
  const lastSyncedAt = useSyncStatus((s) => s.lastSyncedAt)
  const failingSince = useSyncStatus((s) => s.failingSince)
  const everSynced = useSyncStatus((s) => s.everSynced)

  const snapshot: SyncSnapshot = { status, lastSyncedAt, failingSince, everSynced }
  const stale = isDangerouslyStale(snapshot)
  const when = lastSyncedAt ? timeAgo(lastSyncedAt) : null

  const line =
    status === 'never'
      ? // Never-synced is its own state. An empty timestamp would look like a bug.
        'Not saved to your key yet. Finish a lesson and it saves on its own.'
      : status === 'pending'
        ? 'Saving your latest progress…'
        : status === 'offline'
          ? "You're offline. Everything is safe on this phone and will save when you're back."
          : status === 'failed'
            ? "Couldn't save just now — it keeps trying on its own."
            : `Saved to your key ${when ?? 'just now'}.`

  return (
    <div className="mb-3 space-y-2">
      <p className="text-sm text-ink-soft">{line}</p>

      {status !== 'never' && status !== 'synced' && when && (
        <p className="text-xs text-ink-faint">Last saved {when}.</p>
      )}

      {stale && (
        <p className="rounded-2xl bg-butter-soft px-3 py-2.5 text-sm">
          Your progress hasn't reached your key since{' '}
          {failingSince ? timeAgo(failingSince) : 'yesterday'}. It's still here on this phone —
          worth checking your connection when you get a chance.
        </p>
      )}
    </div>
  )
}

/** Coarse on purpose: the useful question is "recently or not", not the minute. */
function timeAgo(at: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000))
  if (seconds < 60) return 'just now'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft mb-2">{title}</h2>
      <div className="rounded-blob bg-white/70 p-4 shadow-soft">{children}</div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1.5 text-[0.95rem]">
      <span className="text-ink-soft">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  )
}

/** Misconception tags are internal; give them a readable face. */
function humanizeTag(tag: string): string {
  const known: Record<string, string> = {
    'forgot-carry': 'Forgetting to carry',
    'forgot-carry-ones': 'Forgetting to carry from the ones',
    'forgot-carry-tens': 'Forgetting to carry from the tens',
    'wrote-full-ones': 'Writing the whole ones total',
    'flipped-column': 'Flipping digits instead of borrowing',
    'forgot-to-reduce-tens': 'Not reducing the tens after borrowing',
    'digit-concat': 'Adding columns out of line',
    added: 'Adding when it asked to subtract',
    subtracted: 'Subtracting when it asked to add',
    'off-by-one-low': 'Counting one short',
    'off-by-one-high': 'Counting one too far',
  }
  return known[tag] ?? tag.replace(/-/g, ' ')
}
