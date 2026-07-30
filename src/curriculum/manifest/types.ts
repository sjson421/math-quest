/**
 * Shape of the curriculum manifest — the machine-readable form of
 * `docs/curriculum.md`.
 *
 * The manifest is the roster: it declares every skill id, its unit and stage
 * membership, and its prerequisite edges. Generators fill the roster in over
 * time, so most entries here have no generator yet and that is the normal
 * state, not a gap. See `resolve.ts` for how state is derived.
 */

/**
 * Infrastructure a stage's skills depend on. Recording a requirement says
 * nothing about whether it is built — `resolve.ts` holds that separately, so a
 * whole stage can stay honestly `planned` on missing infrastructure rather than
 * looking broken.
 */
export type Capability =
  | 'katex'
  | 'fraction-input'
  | 'diagram'
  | 'expression-input'
  | 'number-line'
  | 'coordinate-plane'
  | 'chart'
  | 'timed'

export type SkillEntry = {
  /** Taken verbatim from `docs/curriculum.md`. Never re-spelled. */
  id: string
  name: string
  /** Shown on the skill tree node. */
  blurb: string
  /** Lesson ends at 5 correct instead of 10. Opens every hard unit. */
  quick?: boolean
  /**
   * Known difficulty wall (⚠️ in the curriculum document). These get the most
   * misconception-prediction effort, and the content check requires at least
   * two distinct predicted misconceptions.
   */
  wall?: boolean
  /**
   * Replaces the derived prerequisites *entirely*. Only for the non-linear
   * edges the curriculum document calls out; the default derivation covers the
   * rest. See `resolvePrerequisites()`.
   */
  prerequisites?: string[]
}

export type UnitEntry = {
  /** e.g. `unit-3`, matching "Unit 3" in the curriculum document. */
  id: string
  name: string
  /**
   * Units this one builds on. The *first* skill of this unit takes the *last*
   * skill of each named unit as a prerequisite. This is what keeps hand-written
   * edges down to roughly one declaration per unit.
   */
  dependsOn?: string[]
  /** In learning order. Order is meaningful: it drives prerequisites. */
  skills: SkillEntry[]
}

export type StageEntry = {
  /** e.g. `stage-b`. */
  id: string
  name: string
  /** Capabilities this stage's skills depend on. Does not imply they exist. */
  requires?: Capability[]
  units: UnitEntry[]
}

/**
 * Whether a skill can actually be played. Always derived, never stored —
 * storing it would go stale the moment a generator landed.
 */
export type SkillState = 'implemented' | 'planned'
