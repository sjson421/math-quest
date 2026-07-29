/**
 * Best-effort haptics on iOS Safari.
 *
 * Safari does not implement the Vibration API. It does, however, produce a real
 * haptic tap when the user toggles a native `<input type="checkbox" switch>`
 * (Safari 17.4+), and that fires for programmatic label clicks too. So we keep
 * one hidden switch around and poke it.
 *
 * Everything here is a silent no-op when unsupported — never gate UX on it.
 */

let label: HTMLLabelElement | null = null
let supported: boolean | null = null

function ensureElement(): HTMLLabelElement | null {
  if (label) return label
  if (supported === false) return null
  if (typeof document === 'undefined') return null

  // Detect before touching the attribute: Safari reflects `switch` as a real
  // IDL property, so checking hasAttribute() after setting it always passes and
  // would leave every other browser doing pointless DOM work on each tap.
  supported = 'switch' in HTMLInputElement.prototype
  if (!supported) return null

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  input.id = '__haptic_switch'

  Object.assign(input.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
  })
  input.setAttribute('aria-hidden', 'true')
  input.tabIndex = -1

  label = document.createElement('label')
  label.htmlFor = input.id
  label.setAttribute('aria-hidden', 'true')
  Object.assign(label.style, {
    position: 'absolute',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
  })

  document.body.append(input, label)
  return label
}

export function tap() {
  try {
    ensureElement()?.click()
  } catch {
    /* haptics are decoration — never let them break a lesson */
  }
}

/** A slightly heavier pattern for celebrations. */
export function celebrate() {
  tap()
  window.setTimeout(tap, 90)
  window.setTimeout(tap, 190)
}
