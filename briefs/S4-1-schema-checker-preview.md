# Ticket 4.1 — Stage-4 content schema, strict checker, content preview page

## Goal
Make the content layer ready for stage-4 authoring: additive v2 content types, strict checker mode, and a browser preview page that lists every content site by stable ID and blocks on issues. Design authority: `docs/design/TDD.md` §1.1 (table "Seam / proposed addition", lines ~62–99) for field names and semantics, §9.2 (lines ~618–640) for checker rules; `docs/design/GDD.md` §5.2–5.3 for dialogue rules. Read `docs/PLAN.md` "Content types contract", `content/README.md`, `scripts/README.md`, `src/content/types.ts`, `scripts/check-level.mjs` first.

## You are the SOLE executor
No spawning/delegation. You have NO shell: do not attempt to run commands; the orchestrator runs `npx tsc --noEmit`, `npm test`, `npm run check:content`, `npm run build` after hand-back. Write code you are confident type-checks. If blocked or ambiguous, end your turn with the question.

## Scope
1. `src/content/types.ts`: add, all OPTIONAL (v1 JSON must still parse and all 115 existing tests must pass unchanged):
   - `Reply.id?: string`
   - `Exchange.introduces?: WordId[]`, `Exchange.tests?: WordId[]`, `Exchange.hint?: Line`, `Exchange.taskAfterCorrect?: {taskId:string; targetTriggerId:string; propId:string}`, `Exchange.guidedConsequence?: string`
   - `Scene.curriculumIndex?: number`, `Scene.minDay?: number`, `Scene.afterScenes?: string[]`, `Scene.allowedSlots?: ('M'|'A1'|'A2'|'A3'|'A4'|'E')[]`, `Scene.repeatable?: boolean`, `Scene.purchase?: {itemId:string; price:number; mode:'optional-entry'|'withhold-first-reward'}`
   No engine behaviour changes in this ticket (those are stage 5–7 tickets).
2. `scripts/check-level.mjs`: keep rules 1–7 and their numbering. Add `--strict` flag implementing the strict column of TDD §9.2 for rules 1, 2, 3, 4, 5, 6, 7, 10, 11, 14 (skip 8, 9, 12, 13: they need audio/world assets). Without `--strict`, behaviour is unchanged (existing WARN for rule 4 stays). Strict output: one line per site `RULE<n> <severity> <stableSiteId>: <message>`, exit 1 on any FAIL. Stable site IDs: `<sceneId>/<exchangeId>/line|r<k>|hint`, slot values `pool:<poolId>/<index>`. Add `npm run check:content:strict`.
3. Preview page: `preview.html` at repo root as a second Vite entry (`vite.config.ts` `build.rollupOptions.input` with `index.html` and `preview.html`), source in `src/preview/` (DOM only, no three.js). It imports the same content JSON, runs the same rule logic (factor the rule functions into `scripts/check-level-rules.mjs` or a TS module importable by both the script and the page; the checker script must keep working with plain `node`), and renders: scene list with curriculumIndex, every exchange with line / replies / hint, per-exchange new-word count with the ≤2 rule, per-site issue list, and a "coverage" table (word → scenes count, 150/150 target, placements total). Blocks (red banner + list) when any strict FAIL exists. Filters: by scene, by rule. No styling beyond a minimal readable stylesheet.
4. Tests: `tests/check-level-strict.test.ts` (or `.mjs`) with fixtures covering each strict rule pass and fail case at least once. Update `scripts/README.md`, `content/README.md`, `src/preview/README.md` (new), and the "Content types contract" in `docs/PLAN.md` to list the new optional fields.

## Scope out
Engine changes, audio, world v2, renderer, styling polish, any content authoring.

## Constraints
Project CLAUDE.md rules: no DOM/three.js imports in `src/engine`, near-zero comments, no runtime dependency additions. Do not commit.

## Acceptance
- `npx tsc --noEmit` clean; `npm test` passes incl. new tests; `npm run check:content` output unchanged for current content; `npm run check:content:strict` runs and reports (current content is expected to FAIL strict on coverage; that's fine).
- `npm run build` emits both `index.html` and `preview.html`.
- Report: DONE / FILES / how to open preview (`npm run dev` then `/preview.html`) / list of strict rules implemented with their site-ID format / OPEN QUESTIONS.
