import { describe, expect, it } from 'vitest'
import { addDays, dayBefore, daysBetween, isDayKey, todayKey } from './calendar'

describe('calendar days', () => {
  it('names a local day, not a UTC one', () => {
    expect(todayKey(new Date(2025, 11, 31, 23, 30))).toBe('2025-12-31')
  })

  it('keeps local day keys zero-padded within the supported year range', () => {
    const date = new Date(2000, 0, 2, 12)
    date.setFullYear(9)

    expect(todayKey(date)).toBe('0009-01-02')
  })

  it('accepts only real zero-padded calendar dates', () => {
    for (const valid of ['0000-01-01', '2026-02-28', '2024-02-29']) {
      expect(isDayKey(valid), valid).toBe(true)
    }

    for (const invalid of [
      '',
      '2026-2-03',
      '2026-02-30',
      '2026-13-01',
      '2026-00-01',
      '2026-01-00',
      '2026-01-01T00:00:00',
      'not-a-date',
    ]) {
      expect(isDayKey(invalid), invalid).toBe(false)
    }
  })

  it('counts whole named days in either direction', () => {
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0)
    expect(daysBetween('2026-03-01', '2026-03-02')).toBe(1)
    expect(daysBetween('2026-03-08', '2026-03-01')).toBe(-7)
  })

  it('steps forward and backward across month and year boundaries', () => {
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(dayBefore('2026-03-01')).toBe('2026-02-28')
    expect(dayBefore('2026-01-01')).toBe('2025-12-31')
  })

  it('handles leap day', () => {
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01')
    expect(dayBefore('2024-03-01')).toBe('2024-02-29')
  })

  it('keeps both daylight-saving boundaries on their named days', () => {
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09')
    expect(addDays('2026-11-01', 1)).toBe('2026-11-02')
    expect(dayBefore('2026-03-08')).toBe('2026-03-07')
    expect(dayBefore('2026-11-02')).toBe('2026-11-01')
  })

  it('rejects malformed dates before arithmetic', () => {
    expect(() => addDays('2026-02-30', 1)).toThrow('Invalid calendar day')
    expect(() => daysBetween('2026-01-01', '2026-02-30')).toThrow('Invalid calendar day')
    expect(() => addDays('2026-01-01', 1.5)).toThrow('safe integer')
    expect(() => addDays('2026-01-01', Number.MAX_SAFE_INTEGER)).toThrow('supported range')
    expect(() => addDays('9999-12-31', 1)).toThrow('supported range')
    expect(() => addDays('0000-01-01', -1)).toThrow('supported range')
  })
})
