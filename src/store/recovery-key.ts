import { create } from 'zustand'
import { get as idbGet, set as idbSet } from 'idb-keyval'
import { generateKey, isValidKey, normalizeKey } from '../lib/recovery-key'

/**
 * Stored under its own IndexedDB key rather than inside the progress record.
 * Resetting progress, or adopting a server copy, must never take the key with
 * it — with file export gone, the key is the only route back to the data.
 */
const KEY_STORAGE_KEY = 'math-quest-recovery-key'

/**
 * Whether the learner has been shown the explainer. Device-local rather than
 * part of the synced record — it describes this install, not this learner.
 */
const INTRODUCED_STORAGE_KEY = 'math-quest-recovery-key-introduced'

type KeyStore = {
  key: string | null
  loaded: boolean
  introduced: boolean
  /** The key for this device, generating one on first run. */
  load: () => Promise<string>
  /** Switch to a key the learner typed in. */
  replace: (key: string) => Promise<void>
  markIntroduced: () => void
}

export const useRecoveryKey = create<KeyStore>((set, get) => ({
  key: null,
  loaded: false,
  introduced: true, // Assume seen until storage says otherwise; never flash it.

  async load() {
    const existing = get().key
    if (existing) return existing

    const [stored, introduced] = await Promise.all([
      idbGet<string>(KEY_STORAGE_KEY).catch(() => undefined),
      idbGet<boolean>(INTRODUCED_STORAGE_KEY).catch(() => undefined),
    ])

    if (stored && isValidKey(stored)) {
      const key = normalizeKey(stored)
      set({ key, loaded: true, introduced: introduced === true })
      return key
    }

    const fresh = generateKey()
    await idbSet(KEY_STORAGE_KEY, fresh).catch(() => {})
    set({ key: fresh, loaded: true, introduced: false })
    return fresh
  },

  async replace(key) {
    const normalized = normalizeKey(key)
    await idbSet(KEY_STORAGE_KEY, normalized).catch(() => {})
    // Someone typing in a key already knows what one is.
    set({ key: normalized, loaded: true, introduced: true })
    void idbSet(INTRODUCED_STORAGE_KEY, true).catch(() => {})
  },

  markIntroduced() {
    set({ introduced: true })
    void idbSet(INTRODUCED_STORAGE_KEY, true).catch(() => {})
  },
}))
