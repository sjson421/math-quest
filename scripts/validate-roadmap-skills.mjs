import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sharedRoot = 'docs/agent-workflows/ship-roadmap-item'
const harnessRoots = ['.agents', '.claude', '.pi']
const skillNames = ['prepare-roadmap', 'implement-roadmap', 'review-roadmap']
const sharedNames = [
  'handoff.md',
  'state-template.json',
  'select.md',
  'explore.md',
  'propose-audit.md',
  'apply.md',
  'simplify.md',
  'review.md',
  'finish.md',
]
const skillReferences = {
  'prepare-roadmap': ['handoff.md', 'select.md', 'state-template.json', 'explore.md', 'propose-audit.md'],
  'implement-roadmap': ['handoff.md', 'apply.md'],
  'review-roadmap': ['handoff.md', 'simplify.md', 'review.md', 'finish.md'],
}
const failures = []

function read(relativePath) {
  const absolutePath = resolve(repoRoot, relativePath)
  if (!existsSync(absolutePath)) {
    failures.push(`Missing ${relativePath}`)
    return ''
  }
  return readFileSync(absolutePath, 'utf8')
}

function requireText(content, expected, label) {
  if (!content.includes(expected)) failures.push(`${label} is missing ${JSON.stringify(expected)}`)
}

function frontmatter(content, path) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) {
    failures.push(`${path} has no YAML frontmatter`)
    return new Map()
  }
  return new Map(match[1].split('\n').map((line) => {
    const separator = line.indexOf(':')
    return [line.slice(0, separator), line.slice(separator + 1).trim()]
  }))
}

const adapters = new Map()
for (const skillName of skillNames) {
  const variants = harnessRoots.map((harnessRoot) => {
    const path = `${harnessRoot}/skills/${skillName}/SKILL.md`
    return { path, content: read(path) }
  })
  adapters.set(skillName, variants)

  const metadata = variants.map(({ path, content }) => frontmatter(content, path))
  const expectedDescription = metadata[0].get('description')
  for (let index = 0; index < variants.length; index += 1) {
    const { path, content } = variants[index]
    if (metadata[index].get('name') !== skillName) {
      failures.push(`${path} does not declare name ${skillName}`)
    }
    if (metadata[index].get('description') !== expectedDescription) {
      failures.push(`${path} has a different skill description`)
    }
    for (const referenceName of skillReferences[skillName]) {
      requireText(content, `../../../${sharedRoot}/${referenceName}`, path)
    }
  }
}

const shared = new Map(sharedNames.map((name) => [name, read(`${sharedRoot}/${name}`)]))
const handoff = shared.get('handoff.md')
for (const phaseRow of [
  '| `prepare-roadmap` | 1. Select through 4. Audit | no active run or `needs-preparation` | `ready-to-implement` |',
  '| `implement-roadmap` | 5. Apply | `ready-to-implement` | `ready-to-review` |',
  '| `review-roadmap` | 6. Simplify through 10. Archive | `ready-to-review` | complete |',
]) {
  requireText(handoff, phaseRow, 'cross-session handoff')
}
for (const token of [
  'Keep exactly one phase `in_progress`',
  'set the workflow status to `needs-preparation`',
  'State files are run-owned bookkeeping',
  'Start each reviewer with fresh context',
  'Stop in the current phase with a coherent tree',
]) {
  requireText(handoff, token, 'cross-session handoff')
}

const stateTemplateText = shared.get('state-template.json')
try {
  const stateTemplate = JSON.parse(stateTemplateText)
  if (stateTemplate.schemaVersion !== 1) failures.push('State template schema version is not 1')
  if (stateTemplate.phases?.length !== 10) failures.push('State template does not declare ten phases')
  const phaseIds = stateTemplate.phases?.map(({ id }) => id) ?? []
  if (phaseIds.join(',') !== '1,2,3,4,5,6,7,8,9,10') {
    failures.push('State template phase ids are not ordered 1 through 10')
  }
} catch {
  failures.push('State template is not valid JSON')
}

const codexPrepare = adapters.get('prepare-roadmap')[0].content
for (const token of ['update_plan', 'currently selected model']) {
  requireText(codexPrepare, token, 'Codex prepare adapter')
}
const codexImplement = adapters.get('implement-roadmap')[0].content
for (const token of ['update_plan', 'openspec-apply-change', 'ready-to-review']) {
  requireText(codexImplement, token, 'Codex implement adapter')
}
const codexReview = adapters.get('review-roadmap')[0].content
for (const token of ['update_plan', '$simplify', 'currently selected model', 'openspec-archive-change']) {
  requireText(codexReview, token, 'Codex review adapter')
}

const claudePrepare = adapters.get('prepare-roadmap')[1].content
for (const token of ['TaskCreate', 'TaskUpdate', 'roadmap-reviewer', 'subagent_type: "roadmap-reviewer"']) {
  requireText(claudePrepare, token, 'Claude prepare adapter')
}
const claudeImplement = adapters.get('implement-roadmap')[1].content
for (const token of ['Create one task named Apply', 'openspec-apply-change', 'ready-to-review']) {
  requireText(claudeImplement, token, 'Claude implement adapter')
}
const claudeReview = adapters.get('review-roadmap')[1].content
for (const token of ['TaskCreate', 'TaskUpdate', 'roadmap-reviewer', 'openspec-archive-change']) {
  requireText(claudeReview, token, 'Claude review adapter')
}
const claudeReviewerPath = '.claude/agents/roadmap-reviewer.md'
const claudeReviewer = read(claudeReviewerPath)
for (const token of ['model: inherit', 'effort: medium', 'tools: Read, Glob, Grep, Bash']) {
  requireText(claudeReviewer, token, 'Claude reviewer')
}

const piPrepare = adapters.get('prepare-roadmap')[2].content
const piImplement = adapters.get('implement-roadmap')[2].content
const piReview = adapters.get('review-roadmap')[2].content
for (const [label, content] of [
  ['Pi prepare adapter', piPrepare],
  ['Pi review adapter', piReview],
]) {
  for (const token of [
    'agent: "roadmap-reviewer"',
    'context: "fresh"',
    'async: false',
    'artifacts: false',
    'mission: false',
  ]) {
    requireText(content, token, label)
  }
}
for (const token of ['Mark only Apply `in_progress`', 'openspec-apply-change', 'ready-to-review']) {
  requireText(piImplement, token, 'Pi implement adapter')
}
requireText(piReview, 'openspec-archive-change', 'Pi review adapter')

const piReviewerPath = '.pi/agents/roadmap-reviewer.md'
const piReviewer = read(piReviewerPath)
for (const token of [
  'thinking: medium',
  'inheritProjectContext: true',
  'inheritSkills: false',
  'defaultContext: fresh',
  'acceptanceRole: read-only',
]) {
  requireText(piReviewer, token, 'Pi reviewer')
}
if (/^model:/m.test(piReviewer)) failures.push('Pi reviewer must inherit the active model')

const modelCheckedFiles = [
  ...sharedNames.map((name) => ({ path: `${sharedRoot}/${name}`, content: shared.get(name) })),
  ...skillNames.flatMap((skillName) => adapters.get(skillName)),
  { path: claudeReviewerPath, content: claudeReviewer },
  { path: piReviewerPath, content: piReviewer },
  { path: 'docs/workflow.md', content: read('docs/workflow.md') },
]
const concreteModel = /\b(?:gpt(?:-\d|[._])|o[1-9](?:[-._]|\b)|claude-(?:opus|sonnet|haiku|\d)|deepseek|gemini|qwen|llama|mistral|codestral|command-r|terra|luna|opus|sonnet|haiku)\b/i
for (const { path, content } of modelCheckedFiles) {
  if (concreteModel.test(content)) failures.push(`Unexpected concrete model identifier in ${path}`)
  for (const match of content.matchAll(/^model:\s*(\S+)/gm)) {
    if (path !== claudeReviewerPath || match[1] !== 'inherit') {
      failures.push(`Pinned model configuration in ${path}`)
    }
  }
}

for (const harnessRoot of harnessRoots) {
  const oldSkillPath = resolve(repoRoot, harnessRoot, 'skills/ship-roadmap-item/SKILL.md')
  const oldReferenceRoot = resolve(repoRoot, harnessRoot, 'skills/ship-roadmap-item/references')
  if (existsSync(oldSkillPath)) failures.push(`Old single-session skill remains at ${oldSkillPath}`)
  if (existsSync(oldReferenceRoot) && readdirSync(oldReferenceRoot).length > 0) {
    failures.push(`Old single-session references remain at ${oldReferenceRoot}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Roadmap skill adapters and cross-session handoff are valid')
