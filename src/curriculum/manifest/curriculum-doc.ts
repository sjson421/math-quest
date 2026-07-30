/**
 * Parser for `docs/curriculum.md` — **test support only.**
 *
 * It exists so the tests can hold the document and the manifest up against each
 * other. The document is the human-readable authority for skill ids and pacing
 * markers, and nothing else validates it.
 *
 * The document arrives as a `?raw` import rather than through `node:fs`, because
 * `src` is type-checked with browser types only — deliberately, so app code
 * cannot reach for a Node builtin and typecheck its way into a runtime error.
 * Nothing in the app imports this module, so the text is not in the bundle.
 *
 * Skill rows are anchored on the id column — `| N.N | \`id\` | … |` — and only
 * there. A looser scrape for backticked tokens anywhere in a row also picks up
 * the `` `quick` `` marker in the Note column and reports it as a phantom
 * skill id.
 */

import curriculumDocText from '../../../docs/curriculum.md?raw'

export type DocSkillRow = {
  /** Unit number from the `N.N` label, e.g. 3 for `3.12`. */
  unit: number
  /** Position within the unit from the `N.N` label, e.g. 12 for `3.12`. */
  index: number
  id: string
  /** The Skill column. Empty on 90 of the 201 rows. */
  skill: string
  /** The Note column, where every marker lives alongside free text. */
  note: string
  quick: boolean
  /** A difficulty wall (⚠️), whether or not the note explains it. */
  wall: boolean
  /** Marked ✅ built. Used by the generator-coverage tests. */
  built: boolean
}

export type DocUnit = {
  number: number
  name: string
  /** The count in the heading, e.g. 14 from `### Unit 3 — Multiplication (14)`. */
  declared: number
  rows: DocSkillRow[]
}

export type DocStage = {
  /** Lower-case letter, matching the manifest's `stage-b` ids. */
  letter: string
  name: string
  /** First and last unit number from the stage map's Units column. */
  units: [number, number]
  /** The count in the stage map's Skills column. */
  declaredSkills: number
}

export type CurriculumDoc = {
  /** From the title block: `**8 stages · 23 units · 201 skills.**` */
  declared: { stages: number; units: number; skills: number }
  stages: DocStage[]
  units: DocUnit[]
  rows: DocSkillRow[]
  /** Stage letter → skill count declared in the Build order section. */
  buildOrder: Map<string, number>
}

/** Split a markdown table row into trimmed cells, dropping the outer empties. */
function cells(line: string): string[] {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim())
}

export function parseCurriculumDoc(text: string = curriculumDocText): CurriculumDoc {
  const lines = text.split('\n')

  const declaredMatch = lines
    .join('\n')
    .match(/\*\*(\d+) stages · (\d+) units · (\d+) skills\.\*\*/)
  if (!declaredMatch) throw new Error('No "N stages · N units · N skills" line found')

  const stages: DocStage[] = []
  const units: DocUnit[] = []
  const rows: DocSkillRow[] = []
  const buildOrder = new Map<string, number>()

  let currentUnit: DocUnit | undefined
  let inBuildOrder = false
  let buildOrderItem = ''

  const flushBuildOrderItem = () => {
    const stage = buildOrderItem.match(/Stage ([A-H])\b/)
    const count = buildOrderItem.match(/\((\d+)(?: skills)?\)/)
    if (stage && count) buildOrder.set(stage[1].toLowerCase(), Number(count[1]))
    buildOrderItem = ''
  }

  for (const line of lines) {
    // Stage map rows: | **A · Numbers** | 0 | 8 | … |
    const stageRow = line.match(/^\| \*\*([A-H]) · ([^*]+)\*\* \| ([\d–-]+) \| (\d+) \|/)
    if (stageRow) {
      const [first, last = first] = stageRow[3].split(/[–-]/)
      stages.push({
        letter: stageRow[1].toLowerCase(),
        name: stageRow[2].trim(),
        units: [Number(first), Number(last)],
        declaredSkills: Number(stageRow[4]),
      })
      continue
    }

    // Unit headings: ### Unit 3 — Multiplication (14) — *slowest unit by design*
    const heading = line.match(/^### Unit (\d+) — (.+?) \((\d+)\)/)
    if (heading) {
      currentUnit = {
        number: Number(heading[1]),
        name: heading[2].trim(),
        declared: Number(heading[3]),
        rows: [],
      }
      units.push(currentUnit)
      continue
    }

    // Skill rows, anchored on the id column and nothing else.
    const anchor = line.match(/^\| (\d+)\.(\d+) \| `([^`]+)` \|/)
    if (anchor) {
      const [, , skill = '', note = ''] = cells(line)
      const row: DocSkillRow = {
        unit: Number(anchor[1]),
        index: Number(anchor[2]),
        id: anchor[3],
        skill,
        note,
        quick: note.includes('`quick`'),
        wall: note.includes('⚠️'),
        built: note.includes('✅'),
      }
      rows.push(row)
      currentUnit?.rows.push(row)
      continue
    }

    if (line.startsWith('## Build order')) {
      inBuildOrder = true
      continue
    }
    if (inBuildOrder) {
      if (line.startsWith('##')) {
        flushBuildOrderItem()
        inBuildOrder = false
      } else if (/^\d+\. /.test(line)) {
        flushBuildOrderItem()
        buildOrderItem = line
      } else {
        buildOrderItem += ` ${line}`
      }
    }
  }
  flushBuildOrderItem()

  return {
    declared: {
      stages: Number(declaredMatch[1]),
      units: Number(declaredMatch[2]),
      skills: Number(declaredMatch[3]),
    },
    stages,
    units,
    rows,
    buildOrder,
  }
}
