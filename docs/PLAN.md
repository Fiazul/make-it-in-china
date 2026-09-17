# Make It in China — build plan

Source of truth for scope: `docs/design-doc.txt` (PDF in `docs/design-doc.pdf`). This file adds
what the doc leaves to the implementer: layout, contracts, assumptions, tonight's split.

## Assumptions (owner can overturn any — each is a one-line change)
- Open questions from the doc answered with defaults: adult self-learners; English-only glosses;
  blank featureless head is acceptable; fictional generic city; fixed protagonist; private test
  release; animals left out of Phase 1; TTS deferred (M1 ships without audio files, UI degrades:
  replay button disabled, "audio pending" tooltip).
- One repo, static Vite site, no backend, no accounts. Node 20, npm.
- Grey boxes first. Toon + outline exists as a toggle from day one because it is cheap in three.js,
  but no time is spent on art until M4 feedback.

## Smallest thing that proves the loop (tonight → M1)
Noodle shop, one job (dishwasher), 3 scenes, pick-a-reply, wallet changes, word states change,
notebook fills. Check: a tester can play 3 scenes in the browser and the notebook shows ~15 words
with states. Stop signal: if scripted pick-a-reply in a 3D box feels no better than a flashcard,
rethink before M3.

## Layout
```
docs/          design doc, PLAN.md, CREDITS.md
content/phase1/words.json scenes.json world.json scene-list.md
scripts/check-level.mjs     level checker (node, zero deps) — runs in `npm run check:content`
src/main.ts                 boot: load content, build world, start dialogue runner
src/content/types.ts        THE CONTRACT (below). All workers import from here.
src/engine/                 pure TS, no DOM/three: dialogue.ts learner.ts economy.ts store.ts save.ts slots.ts
src/render/                 three.js: scene.ts camera.ts toon.ts character.ts world.ts input.ts
src/ui/                     DOM over canvas: bubble.ts hud.ts notebook.ts
tests/                      vitest, engine + checker only
briefs/                     delegate briefs (history)
```

## Contract: content types (src/content/types.ts)
```ts
export type WordId = string;               // the hanzi itself, e.g. "杯子"
export interface Word { hanzi: WordId; pinyin: string; en: string; hsk: 1|2|3|4; bonus?: boolean; pos?: string }
export type WordState = 'unseen'|'met'|'shaky'|'known';
export interface Line { hanzi: string; pinyin: string; en: string; audio: string; words: WordId[] }
export interface Reply { hanzi: string; pinyin?: string; en?: string; words?: WordId[]; audio?: string;
  action: string; check?: string; correct?: boolean; next?: string }
export interface Exchange { id: string; line: Line; slots?: Record<string,string>; replies: Reply[]; onWrong?: string }
export interface Scene { id: string; phase: 1|2|3|4; location: string; npc: string; kind: 'story'|'job'|'errand'|'mentor'|'consequence';
  requires: WordId[]; introduces: WordId[]; reward?: number; cost?: number; exchanges: Exchange[] }
export interface SlotPool { id: string; values: { hanzi: string; pinyin: string; en: string; words: WordId[] }[] }
export interface Location { id: string; name: string; position: [number,number]; signs: string[] }
export interface Npc { id: string; name: string; label: string; location: string; color: string; headwear?: string; prop?: string }
export interface World { phase: number; locations: Location[]; npcs: Npc[]; slotPools: SlotPool[] }
```
Slots: `{n}` in `line.hanzi` is filled from `slotPools[slots.n]`; the filled value's `words` are
appended to the line's word tags at runtime. `Reply.correct` marks the intended answer for
pick-a-reply and is authoritative in Phase 1. `check` is an opaque analytics tag (e.g. `count_and_table`);
the runner records it in the event log and does not evaluate it. Slot bindings are SCENE-scoped: a
slot filled in exchange 2 (`{cup_count}`) stays bound for the rest of the scene, and `{name}` in any
later line or reply (hanzi/pinyin/en each substituted from the pool value's matching field) reuses
it. A placeholder with no binding in scope is a content error: checker rule 6 fails the build, and
the runner throws `ContentError`.

## Level checker rules (scripts/check-level.mjs) — fail the build if
1. a line uses a word above the scene's phase not in `introduces` and not `bonus`;
2. an exchange introduces >2 new words;
3. `line.words` ≠ longest-match segmentation of `line.hanzi` against words.json (+slot placeholders, punctuation ignored);
4. any phase-list word appears in <3 scenes; 5. a line lacks pinyin/en/audio id;
6. a `{placeholder}` in a line or reply has no slot binding in scope (see contract).

## Tonight (2026-09-18) — delegate split
| # | Worker | Owns | Depends on |
|---|--------|------|-----------|
| A | Cursor | scaffold: Vite+TS+three, types.ts, grey-box noodle shop, faceless capsule char, click-to-walk grid, fixed camera, toon toggle | — |
| B | Cursor | content: words.json (HSK1 150), scene-list.md (M0, ~25 scenes), 3 vertical-slice scenes, world.json, check-level.mjs | types contract only |
| C | Codex astra | engine: dialogue runner, learner model, economy, store, save/load + vitest | A (package.json) |
| D | Cursor | ui: bubble/hud/notebook wiring engine→DOM; playable M1 | A, B, C |
Video-reference notes (Astra three.js demos) land in `docs/reference-videos.md` and feed D/A's polish.

## Rules for workers
No commits (orchestrator commits). Zero new runtime deps beyond three, zustand (optional). Content
must pass `npm run check:content`. Faceless rule applies to every mesh. No loans/gambling/alcohol
content. Pinyin with tone marks only.

## Engine decisions (2026-09-18, after review R1)
- `availableScenes()` excludes `kind: 'consequence'`; consequences are only entered via `onWrong`.
- Reply-origin words record `firstSeen` from the reply (sentence = reply hanzi, audio = `Reply.audio`
  if present, else undefined). `Reply.audio` is optional in the contract.
- Rent: one outstanding week at a time. A missed week stays due; each new rent day re-arms grace and
  the due amount stays one week (older weeks forgiven). Emits `rentDue` event. No debt, no interest.
- `DialogueFrame.newWords: WordId[]` is part of state so the UI can underline first appearances after reload.
- `tapWord` on any word present in the current exchange (line or replies) is legal: meet-then-down.
- Engine must never softlock: `sleep()` abandons an active dialogue (no reward), and the scene pre-scan
  checks slot-pool eligibility and cross-scene `next` availability for every reachable exchange.
