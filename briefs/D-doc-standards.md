# Documentation pass — apply the project doc standards before release

## Standards (apply exactly)
CLAUDE.md: lead with an architecture diagram (mermaid) incl. data flows and reasoning behind non-obvious decisions; actionable directives only ("always X", "never Y"); pin exact build/test/lint/check commands; list forbidden patterns; mark auto-generated files; under 500 lines.
Module READMEs (for devs/agents, not end users): high-level module purpose, then a file-by-file table with a short label (feature area, config, glue, tests, etc.); no code-level detail; just enough to decide what to read.
Global README.md: for end users only: setup, usage, controls (desktop and phone), configuration/settings, save/import, audio; no architecture.
Code comments: near zero; only for genuinely non-obvious logic or external references; why never what; no docstrings on self-explanatory functions.

## Scope
Audit and update every doc to match the code as it is now (a large rebuild landed today): `CLAUDE.md`, `README.md`, and READMEs in `src/engine`, `src/render`, `src/ui`, `src/audio`, `src/preview`, `src/content` (create if missing), `content`, `content/phase1` (create if missing; describe scenes/words/world/voices/ambient/word-audio-map files), `scripts` (incl. `scripts/blender/` — create README), `tests` (incl. `tests/e2e`), `public/audio` and `public/models` (short READMEs stating what is generated and by which command; mark generated dirs), `docs/README.md` (index of docs: PLAN, WATERFALL, TODO, CREDITS, design/*, screenshots, reference files). Every file present in a module must appear in its README table; remove rows for files that no longer exist. Update the CLAUDE.md mermaid to include audio (edge-tts build step → manifest → AudioManager), preview page, Blender scripts, e2e touch test, and GitHub Pages deploy; add the commands `npm run check:content:strict`, `npm run tts`, `npm run tts:validate`, `npm run e2e:mobile`, the Blender build command from `docs/TODO.md`/`scripts/blender`, and the exact preview commands; add forbidden patterns learned today (never pad Mandarin lines for coverage; never spawn two browser workers; never test touch with mouse events; never let `src/render` import `src/ui` or vice versa if that is the rule — check the imports and state the real rule). Mark `public/audio/**`, `public/audio/manifest.json`, `content/phase1/word-audio-map.json`, `public/models/generated/**`, `dist/` as generated.
Code comments: grep `src/` for `//` and `/*` comments; delete those that describe what the code does; keep why-comments and external references; do not change behaviour.

## Constraints
No shell. Do not change code behaviour, tests, or content. Do not commit. Keep each README under ~120 lines.

## Acceptance
Report: DONE / list of docs created or updated / count of comments removed and files touched / any file without a README row you could not classify / OPEN QUESTIONS.
