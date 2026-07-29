/**
 * The recovery key is the learner's whole identity — no account, no password,
 * no email. It will be copied onto paper and typed back in on a phone keyboard
 * months later, so every decision here is about surviving that trip.
 *
 * Crockford base32 drops `I`, `L`, `O`, and `U`, which are exactly the glyphs
 * that get misread in handwriting. Entry additionally maps the substitutions
 * someone makes anyway (`O`→`0`, `I`/`L`→`1`), so a transcription slip still
 * lands on the right key.
 *
 * This is a bearer credential. Anyone holding it can read and write that
 * progress. It is not a password and nothing here should be described as
 * secure — see the recovery-key spec.
 *
 * Deliberately free of storage and DOM concerns: the serverless endpoint
 * imports this same module so the client and the server can never disagree
 * about what a well-formed key is. Persistence lives in `src/store/recovery-key`.
 */

/** Crockford base32: no `I`, `L`, `O`, or `U`. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** Makes the key recognisable on a scrap of paper months later. */
const PREFIX = 'MATH'

const GROUP_SIZE = 4
const GROUP_COUNT = 4

/** 16 base32 characters = 80 bits. Guessing another learner's key is infeasible. */
const PAYLOAD_LENGTH = GROUP_SIZE * GROUP_COUNT

const KEY_PATTERN = new RegExp(
  `^${PREFIX}(?:-[${ALPHABET}]{${GROUP_SIZE}}){${GROUP_COUNT}}$`,
)

/** `MATH-XXXX-XXXX-XXXX-XXXX`. Groups whatever it is given, valid or not. */
function group(payload: string): string {
  const groups = payload.match(/.{1,4}/g) ?? []
  return [PREFIX, ...groups].join('-')
}

/**
 * A fresh key. 32 divides 256 evenly, so masking a random byte to five bits is
 * uniform over the alphabet — no modulo bias, no rejection loop.
 */
export function generateKey(): string {
  const bytes = new Uint8Array(PAYLOAD_LENGTH)
  crypto.getRandomValues(bytes)

  let payload = ''
  for (const byte of bytes) payload += ALPHABET[byte & 31]
  return group(payload)
}

/**
 * Canonical form of anything the learner typed: uppercase, punctuation gone,
 * ambiguous glyphs folded onto the character they were meant to be, regrouped.
 *
 * Always returns a formatted string — a malformed input produces a malformed
 * key rather than an error, so callers can validate and message once.
 */
export function normalizeKey(input: string): string {
  const cleaned = input
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')

  // `MATH` is itself made of alphabet characters, so a bare payload can start
  // with those four letters — the leading `MATH` is genuinely ambiguous. Strip
  // it exactly once regardless of length: dropping a group while typing is far
  // more likely than drawing a payload that starts `MATH` (1 in ~10^6), and
  // silently accepting a mistyped key as a valid-but-different one is the worse
  // failure. Such a key still round-trips in full, prefix and all.
  const payload = cleaned.startsWith(PREFIX) ? cleaned.slice(PREFIX.length) : cleaned

  return group(payload)
}

/**
 * Format check only — there is no checksum, so this cannot tell a real key from
 * a well-formed invented one. It exists so obviously-wrong input is rejected
 * before any network request.
 */
export function isValidKey(input: string): boolean {
  return KEY_PATTERN.test(normalizeKey(input))
}
