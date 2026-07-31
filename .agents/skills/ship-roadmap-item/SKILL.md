---
name: ship-roadmap-item
description: Take the next unchecked item in docs/roadmap.md all the way to main — propose the OpenSpec change, audit it with fresh eyes, implement, simplify, verify, sync specs, archive, tick the roadmap, commit and push. Use this whenever the user asks to ship, start, take on, or work through "the next roadmap item", "the next thing", "the first unchecked box", or names a roadmap item by number, and whenever they describe wanting the whole propose → apply → commit loop run for them. Prefer this over calling /opsx:propose or /opsx:apply directly — those are single phases of this pipeline, and running one alone leaves the repo mid-flight.
---

# Shipping a roadmap item

`docs/roadmap.md` is an ordered queue. This skill takes the item at the head of it and
lands it on `main`, completely: planned, audited, built, simplified, verified, synced,
archived, and the roadmap updated to say so.

It runs unattended. Nobody is watching between phases, which is exactly why each phase
has to prove it finished before the next begins — a phase that quietly half-succeeded is
invisible until it has been built on top of. Stop and report rather than guess (see
**When to stop**).

**Work the phases in order, one at a time, with a todo per phase.** They are separate on
purpose: proposing and auditing in one breath means auditing your own assumptions while
they still feel true, and verifying in the same turn you implemented means grading your
own homework. The separation is the mechanism, not ceremony.

Read `AGENTS.md` and `openspec/config.yaml` before phase 1 if they are not already in
context. They carry the invariants and the settled design commitments this repo will not
relitigate, and a proposal that contradicts one is wrong.

---

## Phase 0 · Pick the item and check the ground

**Record the working tree baseline first**, before touching anything:

```bash
git status --porcelain > /tmp/ship-roadmap-baseline.txt
git fetch && git status -sb | head -1
```

Anything already dirty at this moment is somebody else's work in progress. Never stage
it in phase 7, and say so in the final report — silently sweeping unrelated edits into a
commit on `main` is the one mistake here that is genuinely annoying to undo. If the
branch is behind `origin/main`, `git pull --ff-only` before starting.

**Check for an active change:**

```bash
ls openspec/changes/ | grep -v '^archive$'
```

The active queue is meant to be empty. If a change is sitting there, it comes first —
a completed-but-unarchived change means the next proposal has nothing accurate to amend.
Run `openspec status --change "<name>" --json` and rejoin this pipeline at whichever
phase that change actually needs, rather than proposing a new one on top of it.

**Find the item:**

```bash
grep -n '^- \[ \]' docs/roadmap.md | head -1
```

Read from that line through to the next `^- \[` line — the item body is several
paragraphs and carries corrections that were expensive to learn. Take it verbatim into
the proposal; do not paraphrase it down to its title.

**Scope it to one change.** Sizing comes from the `tasks` rules in `openspec/config.yaml`:
one task per generator plus its tests, under two hours each. A roadmap item that says
"five changes" or covers several units is five changes — take the *first unit* only, name
the change after that unit, and leave the roadmap box unchecked until its last change
lands. An item that is one unit or one capability is one change.

Then open `docs/curriculum.md` and copy the skill ids in scope **verbatim**. `times-7-8`
is not `times-78`, and a re-spelled id fails the manifest cross-check in a way that looks
like a manifest bug.

Announce the item, the scope you cut, and the change name before moving on.

---

## Phase 1 · Propose

Invoke the `opsx:propose` skill. Give it:

- the roadmap item text, quoted in full
- the unit you scoped to, and the exact skill ids from `docs/curriculum.md`
- the capability question: does this stage need something in `AVAILABLE_CAPABILITIES`
  that is not built? Capability work is its own change and is never bundled with the
  content it unblocks, so if the answer is yes, the change in front of you is the
  capability — say so and re-scope.

Let `opsx:propose` produce the artifacts its schema defines. Do not write them yourself
in parallel; you will only have to reconcile two versions.

When it finishes, confirm every artifact exists on disk at the paths
`openspec status --change "<name>" --json` reports. "Created tasks.md" in a transcript is
not the same as a file.

---

## Phase 2 · Audit the proposal with fresh eyes

Spawn a **general-purpose subagent** whose brief is
`references/spec-audit.md` (read it and pass its contents, plus the change name and
paths). The point of a subagent here is narrow but real: the session that just wrote
"the manifest already declares these ids" believes it, and will read the manifest looking
for confirmation. A reader with no memory of writing that sentence checks it instead.

The subagent reviews and reports. It does not edit.

**Then triage its findings yourself.** Each one is a claim to verify, not an order:
read the code or doc it cites and decide. Fix what is real; for anything you reject,
write one line in the change's `design.md` saying why, so the next reader does not
re-raise it. A finding you cannot resolve is a stop condition.

Close the phase with:

```bash
openspec validate --change "<name>"
openspec status --change "<name>" --json
```

Both clean, every artifact `done` or legitimately `skipped`.

---

## Phase 3 · Implement

Invoke the `opsx:apply` skill for the change.

Two repo standards apply to everything written here, and neither is negotiable by a task
description that forgot to mention them:

- **Generators compute their own answers** from the operands they just chose. Nothing is
  hardcoded, nothing calls an LLM at runtime.
- **Every generator gets ~1000 seeded problems whose answers are recomputed independently**
  from what appears on screen, plus the content contract in `src/lib/content-rules.ts`.
  Write the test with the generator, not after all of them.

Mark each task `- [x]` in `tasks.md` as it actually lands, and note decisions inline —
the task list is the running record, and a decision explained only in a chat transcript
is lost the moment the session ends.

If implementation reveals the design was wrong, that is a real finding: update the change
artifacts to match what you are building, rather than letting the spec drift into
fiction. Deltas describe what was built, never what was hoped.

---

## Phase 4 · Simplify

Invoke the `simplify` skill over the changed code.

It is a quality pass — reuse, altitude, dead scaffolding — not a bug hunt. Take its
suggestions on their merits; if one would flatten a distinction the codebase makes on
purpose (the two different `skillById`s, for instance), keep the distinction and move on.

Re-run `npm test` after this phase. Simplification that changes generated wording will
trip the golden snapshot in `curriculum/unit-01-add-sub.test.ts`, which is the snapshot
doing its job — investigate before re-recording it.

---

## Phase 5 · Verify

Nothing here is optional, and none of it counts until you have seen the output. Run the
gates first, then the review, because a reviewer reading code that does not compile
wastes the pass.

```bash
npm test          # full suite
npm run build     # tsc -b across all three tsconfigs — npx tsc --noEmit is NOT sufficient
npm run lint      # oxlint; 3 pre-existing Settings.tsx warnings are expected
```

`npm run build` catches what `tsc --noEmit` cannot, notably a Node builtin imported from
`src`. Run it before claiming types pass.

**Then check the task list is honest.** Every task in `tasks.md` marked `[x]`, and each
one actually done — a checkbox ticked ahead of the work is the failure mode this catches.

**Then drive the app**, if the change is visible in it — new input modes, lesson
mechanics, navigation, anything on screen. Use the browser preview tools, never
`npm run dev` from a shell. If the preview pane is not displayed,
`requestAnimationFrame` never fires and screens will not swap no matter how a click is
dispatched; nothing is broken, so ask for the pane rather than debugging a phantom. Pure
generator or content changes have nothing to see — skip it and say you skipped it.

**Then spawn a general-purpose subagent** with the brief in `references/code-review.md`,
pointed at the diff. Same reasoning as phase 2, same triage discipline: verify each
finding against the code before acting, fix what is real, and re-run the gates after any
fix.

---

## Phase 6 · Sync, archive, and update the roadmap

Archive as soon as the change completes, and sync its deltas into the baseline first —
in that order, because syncing after archiving means editing the baseline from a
directory that has moved.

1. Invoke `opsx:sync` to fold the delta specs into `openspec/specs/`. A delta amending
   built behaviour lands as `## MODIFIED` against one of the existing capabilities;
   `## ADDED` is for genuinely new surface.
2. Invoke `opsx:archive`. The change lands in
   `openspec/changes/archive/YYYY-MM-DD-<name>/`.
3. Update `docs/roadmap.md`:
   - Tick the item `- [x]` and append `— **shipped YYYY-MM-DD**` in the style of the
     items above it, **only if the whole item is done**. A multi-change item stays `[ ]`
     with a note of which unit landed.
   - Rewrite the item body to say what shipped, in past tense, including anything the
     item got wrong that the work corrected. Items 0 and 1 show the shape — they record
     the surprises, which is most of the value.
   - Update the `**Status: N of 201 skills are playable.**` line. It is the only progress
     number in the repo's documentation, so re-derive it rather than incrementing:

     ```bash
     cat > src/curriculum/__count.test.ts <<'EOF'
     import { it } from 'vitest'
     import { implementedSkillIds } from './index'
     it('count', () => console.log('IMPLEMENTED', implementedSkillIds.length))
     EOF
     npx vitest run src/curriculum/__count.test.ts
     rm src/curriculum/__count.test.ts
     ```
4. Update the ✅ markers in `docs/curriculum.md` to match. This is not bookkeeping:
   `manifest/curriculum-doc.ts` imports that file with `?raw` and the test suite asserts
   the ✅ set equals `implementedSkillIds`.
5. **Re-run `npm test`.** The documentation is load-bearing here, so a docs-only edit can
   break 17 tests. Confirm green before phase 7.

---

## Phase 7 · Commit and push

Stage only paths this run touched. Diff against the baseline recorded in phase 0 and
leave anything that was already dirty alone:

```bash
git status --porcelain
```

Commit directly to `main` and push — that is this workflow's deliberate shape, so do not
branch.

Match the repo's commit style, which is substantial: an imperative sentence-case subject
with no conventional-commit prefix and no emoji, then a prose body that explains what
landed and what was learned. Look at `git log -3` and write something a reader six months
out would be glad to find. End with:

```
Co-Authored-By: Codex Opus 5 <noreply@anthropic.com>
```

Then `git push`.

---

## When to stop

Unattended does not mean unstoppable. Stop, leave the tree in a coherent state, and
report clearly when:

- A test, the build, or the lint fails for a reason you cannot resolve within the change's
  scope — especially a pre-existing failure, which is not yours to absorb.
- The audit or code review raises something you can neither fix nor confidently reject.
- The roadmap item contradicts a non-negotiable in `openspec/config.yaml` (no hearts or
  lives, generators compute their own answers, wrong answers diagnosed not rejected,
  custom keypad only, progress local and fragile, patient pacing). Call the contradiction
  out; do not silently redesign around it.
- The item needs a capability that is not built, and the capability is its own change.
- The working tree was dirty in a way that makes a clean commit impossible.
- `git push` is rejected — someone else moved `main`.

A stop is a good outcome reported honestly. A phase quietly skipped is not.

---

## Final report

Close with:

- **Item** — the roadmap line, and the scope you cut if it was one of several changes.
- **Change** — name, and where it archived to.
- **Built** — what landed, in a few lines. Skill count before → after if it moved.
- **Verified** — the actual result of each gate: tests, build, lint, task list, and either
  what you exercised in the preview or why there was nothing to exercise.
- **Corrected** — anything the audit or review caught, and anything the roadmap item
  itself turned out to have wrong.
- **Commit** — the sha and subject, and confirmation of the push.
- **Left alone** — any pre-existing working-tree changes you did not stage.
- **Next** — the item now at the head of the queue.
