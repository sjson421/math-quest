import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sharedRoot = resolve(repoRoot, 'docs/agent-workflows/ship-roadmap-item')
const adapterPaths = [
  '.agents/skills/ship-roadmap-item/SKILL.md',
  '.claude/skills/ship-roadmap-item/SKILL.md',
  '.pi/skills/ship-roadmap-item/SKILL.md',
]
const referenceNames = [
  'select.md',
  'explore.md',
  'propose-audit.md',
  'apply.md',
  'simplify.md',
  'review.md',
  'finish.md',
]
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

const adapters = adapterPaths.map((path) => ({ path, content: read(path) }))
const adapterMetadata = adapters.map(({ path, content }) => frontmatter(content, path))
const expectedName = adapterMetadata[0].get('name')
const expectedDescription = adapterMetadata[0].get('description')

for (let index = 0; index < adapters.length; index += 1) {
  const { path, content } = adapters[index]
  const metadata = adapterMetadata[index]
  if (metadata.get('name') !== expectedName) failures.push(`${path} has a different skill name`)
  if (metadata.get('description') !== expectedDescription) {
    failures.push(`${path} has a different skill description`)
  }
  requireText(content, '../../../docs/agent-workflows/ship-roadmap-item/core.md', path)
  for (const referenceName of referenceNames) {
    requireText(content, `../../../docs/agent-workflows/ship-roadmap-item/${referenceName}`, path)
  }
}

const core = read('docs/agent-workflows/ship-roadmap-item/core.md')
const sharedReferences = referenceNames.map((referenceName) =>
  read(`docs/agent-workflows/ship-roadmap-item/${referenceName}`))
const phaseRows = [
  '| 1. Select | Exact scope and clean baseline recorded | `select` |',
  '| 2. Explore (as needed) | Questions resolved or skip justified | `explore` |',
  '| 3. Propose | Required OpenSpec artifacts exist | `propose-audit` |',
  '| 4. Audit | Assumptions verified and OpenSpec validates | `propose-audit` |',
  '| 5. Apply | Every implementation task is complete | `apply` |',
  '| 6. Simplify | Behavior-preserving cleanup is verified | `simplify` |',
  '| 7. Review | Diff and every verification gate pass | `review` |',
  '| 8. Clean up | Only intended changes remain | `finish` |',
  '| 9. Ship | Intended files are committed and pushed | `finish` |',
  '| 10. Archive | Deltas are synced and change is archived | `finish` |',
]
for (const phaseRow of phaseRows) requireText(core, phaseRow, 'shared core')
requireText(core, 'exactly one phase in', 'shared core')
requireText(core, 'Start each reviewer with fresh context, medium reasoning', 'shared core')
requireText(core, 'Never pin a concrete model', 'shared core')

for (const referenceName of referenceNames) {
  if (!existsSync(resolve(sharedRoot, referenceName))) failures.push(`Missing shared ${referenceName}`)
}

const codex = adapters[0].content
for (const token of [
  'update_plan',
  '$simplify',
  'spawn_agent',
  'fork_turns: "none"',
  'reasoning_effort: "medium"',
  'omit `model`',
]) {
  requireText(codex, token, 'Codex adapter')
}

const claude = adapters[1].content
for (const token of ['TaskCreate', 'TaskUpdate', 'roadmap-reviewer',
  'subagent_type: "roadmap-reviewer"']) {
  requireText(claude, token, 'Claude adapter')
}
const claudeReviewer = read('.claude/agents/roadmap-reviewer.md')
for (const token of ['model: inherit', 'effort: medium', 'tools: Read, Glob, Grep, Bash']) {
  requireText(claudeReviewer, token, 'Claude reviewer')
}

const pi = adapters[2].content
for (const token of [
  'mktemp -d',
  "mktemp -d '/tmp/math-quest-ship.XXXXXX'",
  'contained by `$repo_root`',
  'ship-state.json',
  'context: "fresh"',
  'async: false',
  'artifacts: false',
  'mission: false',
  'inline-fallback',
]) {
  requireText(pi, token, 'Pi adapter')
}
const piReviewer = read('.pi/agents/roadmap-reviewer.md')
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
  { path: 'docs/agent-workflows/ship-roadmap-item/core.md', content: core },
  ...referenceNames.map((path, index) => ({
    path: `docs/agent-workflows/ship-roadmap-item/${path}`,
    content: sharedReferences[index],
  })),
  ...adapters,
  { path: '.claude/agents/roadmap-reviewer.md', content: claudeReviewer },
  { path: '.pi/agents/roadmap-reviewer.md', content: piReviewer },
  { path: 'docs/workflow.md', content: read('docs/workflow.md') },
]
const concreteModel = /\b(?:gpt(?:-\d|[._])|o[1-9](?:[-._]|\b)|claude-(?:opus|sonnet|haiku|\d)|deepseek|gemini|qwen|llama|mistral|codestral|command-r|terra|opus|sonnet|haiku)\b/i
for (const { path, content } of modelCheckedFiles) {
  if (concreteModel.test(content)) failures.push(`Concrete model identifier in ${path}`)
  for (const match of content.matchAll(/^model:\s*(\S+)/gm)) {
    if (path !== '.claude/agents/roadmap-reviewer.md' || match[1] !== 'inherit') {
      failures.push(`Pinned model configuration in ${path}`)
    }
  }
}

for (const adapterRoot of ['.agents', '.claude']) {
  const oldReferenceRoot = resolve(repoRoot, adapterRoot, 'skills/ship-roadmap-item/references')
  if (existsSync(oldReferenceRoot) && readdirSync(oldReferenceRoot).length > 0) {
    failures.push(`Duplicated references remain at ${oldReferenceRoot}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Roadmap skill adapters and shared contract are valid')
