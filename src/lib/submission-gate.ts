export type SubmissionGate = {
  tryAcquire: () => boolean
  release: () => void
}

/**
 * Blocks another submission synchronously, before React can render feedback.
 */
export function createSubmissionGate(): SubmissionGate {
  let active = false

  return {
    tryAcquire() {
      if (active) return false
      active = true
      return true
    },
    release() {
      active = false
    },
  }
}
