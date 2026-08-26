# Contributing to Math Quest

Math Quest is a React, TypeScript, and Vite PWA for cute, focused GED math practice. Small,
focused changes are welcome.

## Development setup

Use a current Node.js release and npm:

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173` by default.

## Checks before opening a change

Run the full checks relevant to your edit:

```bash
npm test
npm run build
npm run lint
```

`npm test` checks generated problems, curriculum coverage, the manifest/document agreement,
and the learner-facing content contract. `npm run build` uses the repository's complete
TypeScript project references.

## Project conventions

- Use two-space indentation, single quotes, and no semicolons.
- Keep generated answers independently verifiable from what the problem displays.
- Treat `src/curriculum/manifest/` as the authority for skill ids, prerequisites, and stage
  membership. Update `docs/curriculum.md` with it when curriculum data changes.
- Add a generator to ship a skill; do not add an id to the manifest just to mark it playable.
- Keep learner-facing text concise, clear, and respectful. Wrong answers should be diagnosed,
  not scolded.
- Keep the PWA offline-first. Do not add runtime network dependencies for lessons or artwork.

## Change workflow

Use OpenSpec for roadmap items, new capabilities, cross-cutting behavior, migrations, or work
that needs design decisions before implementation:

1. Explore the idea and confirm its scope.
2. Create a proposal with `openspec-propose`.
3. Implement its tasks with `openspec-apply-change`.
4. Run the checks above and validate the real app when the change affects the UI.
5. Archive the completed change with `openspec-archive-change`.

Small bug fixes, narrow behavior changes, documentation, tests, and repository maintenance can
be changed directly. Use the lightest process that still makes the change and its proof clear.

Use the repository documentation as the detailed guide, especially `AGENTS.md`,
`docs/curriculum.md`, `docs/testing.md`, `docs/environment.md`, and `docs/workflow.md`.

Commit messages use Angular format, for example:

```text
docs(readme): clarify GED prep positioning
```
