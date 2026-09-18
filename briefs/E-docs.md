# E — Apply documentation standards

## Goal
Repo documentation follows the standard below for developers and agents. No code behaviour changes.

## Standard (verbatim, apply exactly)
CLAUDE.md (repo root, new): lead with an architecture diagram (mermaid) showing data flow
content JSON → engine → UI/render, save/load, checker in CI, with the reasoning behind non-obvious
decisions (pure-TS engine, DOM UI over canvas, scene-scoped slots, Reply.correct authoritative,
grey boxes first). Then actionable directives only ("always X", "never Y"). Pin exact commands:
`npm run dev`, `npm test`, `npm run check:content`, `npx tsc --noEmit`, `npm run build`. List
forbidden patterns: DOM/three imports in src/engine; text drawn in WebGL; faces on any mesh;
loans/interest/gambling/alcohol/romance/supernatural content; pinyin tone numbers; new runtime deps
without a PLAN.md note; committing (orchestrator commits); code comments that say *what*. Mark
auto-generated files (none yet — say so; dist/ is build output). Under 200 lines.
Module READMEs (for devs/agents, not end users): src/engine/README.md exists (keep, ≤25 lines —
trim if needed to purpose + file-by-file labels); ADD src/render/README.md, src/ui/README.md,
content/README.md, scripts/README.md, tests/README.md: purpose, then one line per file labelling
its role (feature area / config / glue). No code-level detail.
Global README.md (exists, 55 lines, for end users): keep setup/usage/config; move anything
architectural into CLAUDE.md; keep ≤60 lines.
Code comments: near-zero. Audit every `//` and `/* */` in src/**: delete comments that describe
*what* the code does; keep only *why* / external references. Report count removed per file.
docs/PLAN.md: leave content; add a 3-line "Documentation map" at top pointing to CLAUDE.md, module
READMEs, README.md.

## Scope
In: CLAUDE.md, README.md, src/**/README.md, content/README.md, scripts/README.md, tests/README.md,
comment-only edits in src/**, docs/PLAN.md header. Out: any behavioural code change, content JSON,
tests logic, package.json. No commits.

## Acceptance (orchestrator runs commands; you have no shell — never stop for it)
- [ ] `npx tsc --noEmit` clean and `npm test` green after comment edits (comment-only diff).
- [ ] CLAUDE.md < 200 lines with a mermaid block; every directive is imperative.
- [ ] Six module READMEs exist; each ≤ 30 lines.
- [ ] Comment audit table: file → removed / kept (with the why).

## Report
DONE / ACCEPTANCE / FILES TOUCHED / OPEN QUESTIONS.
