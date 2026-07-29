import { describe, expect, it } from 'vitest'
import { generateKey, isValidKey, normalizeKey } from './recovery-key'

const AMBIGUOUS = /[ILOU]/

describe('generateKey', () => {
  it('produces the documented format', () => {
    expect(generateKey()).toMatch(/^MATH-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)
  })

  it('always produces a key that validates', () => {
    for (let i = 0; i < 1000; i++) expect(isValidKey(generateKey())).toBe(true)
  })

  it('never emits a character that reads ambiguously', () => {
    // The key gets copied by hand, so I/L/O/U must never appear in the payload.
    for (let i = 0; i < 1000; i++) {
      const payload = generateKey().slice('MATH-'.length)
      expect(payload).not.toMatch(AMBIGUOUS)
    }
  })

  it('does not collide across 10k generations', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 10_000; i++) seen.add(generateKey())
    expect(seen.size).toBe(10_000)
  })
})

describe('normalizeKey', () => {
  const canonical = 'MATH-A1B2-C3D4-E5F6-G7H8'

  it('is a no-op on an already canonical key', () => {
    expect(normalizeKey(canonical)).toBe(canonical)
  })

  it('accepts lowercase', () => {
    expect(normalizeKey('math-a1b2-c3d4-e5f6-g7h8')).toBe(canonical)
  })

  it('accepts a key typed with no hyphens', () => {
    expect(normalizeKey('MATHA1B2C3D4E5F6G7H8')).toBe(canonical)
  })

  it('accepts the payload without the prefix', () => {
    expect(normalizeKey('A1B2-C3D4-E5F6-G7H8')).toBe(canonical)
  })

  it('accepts stray spaces', () => {
    expect(normalizeKey('  MATH A1B2 C3D4  E5F6 G7H8 ')).toBe(canonical)
  })

  it('folds the characters people substitute when transcribing', () => {
    // O read as zero, I and L read as one — the three slips this format expects.
    expect(normalizeKey('MATH-OIL0-1234-5678-9ABC')).toBe('MATH-0110-1234-5678-9ABC')
  })

  it('is idempotent', () => {
    const once = normalizeKey('math oil0 1234 5678 9abc')
    expect(normalizeKey(once)).toBe(once)
  })

  it('round-trips a key whose payload happens to begin with MATH', () => {
    // Only the prefix is stripped, and only once, so the payload survives.
    expect(normalizeKey('MATH-MATH-1234-5678-90AB')).toBe('MATH-MATH-1234-5678-90AB')
    expect(normalizeKey('MATHMATH1234567890AB')).toBe('MATH-MATH-1234-5678-90AB')
  })
})

describe('isValidKey', () => {
  it('accepts the forgiving forms of a real key', () => {
    const key = generateKey()
    expect(isValidKey(key.toLowerCase())).toBe(true)
    expect(isValidKey(key.replace(/-/g, ''))).toBe(true)
    expect(isValidKey(` ${key} `)).toBe(true)
  })

  it('rejects malformed input', () => {
    for (const bad of [
      '',
      'MATH',
      'MATH-',
      'MATH-A1B2-C3D4-E5F6', // one group short
      'MATH-A1B2-C3D4-E5F6-G7H8-J9K0', // one group long
      'MATH-A1B2-C3D4-E5F6-G7H', // short final group
      'NOPE-A1B2-C3D4-E5F6-G7H8', // wrong prefix
      'MATH-A1B2-C3D4-E5F6-G7H!', // punctuation is stripped, leaving it short
      'not a key at all',
    ]) {
      expect(isValidKey(bad), bad).toBe(false)
    }
  })

  it('rejects U, which the alphabet excludes and entry does not remap', () => {
    // Unlike I/L/O there is nothing sensible to fold U onto, so it stays invalid.
    expect(isValidKey('MATH-UUUU-C3D4-E5F6-G7H8')).toBe(false)
  })
})
