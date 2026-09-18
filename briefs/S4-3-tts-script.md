# Ticket 4.3 — `scripts/tts.mjs` speech build script + manifest + rule-8 validator

## Goal
Write the build-time speech generator specified in `docs/design/TDD.md` §6.1 "Build-time speech" (lines ~418–475; read the whole section, the manifest JSON example and the variants table) so the orchestrator can run it with a shell. Also read `docs/design/ART.md` §4 (per-character voice/rate/pitch table), `docs/design/ASSETS.csv` audio rows for ID conventions, `scripts/README.md`, `content/README.md`, `src/content/types.ts`.

## You are the SOLE executor
No spawning/delegation. You have NO shell: do not run anything. The orchestrator runs the script with Node 20, `edge-tts` (Python CLI on PATH; flags `--voice`, `--rate=-10%`, `--pitch=+2Hz`, `--text`, `--write-media out.mp3`) and `ffmpeg`/`ffprobe`. If blocked or ambiguous, end your turn with the question.

## Scope
1. `scripts/tts.mjs` (plain Node ESM, no new dependencies):
   - Inputs: `content/phase1/words.json`, `scenes.json`, `world.json`, voice presets (put them in `content/phase1/voices.json`: per NPC id + `player` + `system`, fields voice/rate/pitch, values from ART §4; create this file), plus optional `content/phase1/ambient.json` if present.
   - Inventory: every line audio ID, reply audio ID, hint audio ID, per-word clips `word_001…` in words.json order plus hanzi lookup, slot-variant lines/replies per TDD §6.1 variants table (`<id>__v000` with `byBinding` keys), system lines, ambient lines. Speaker resolution: NPC line → NPC voice; reply → `player`; hint → NPC voice; word clips → `system` voice.
   - Generation: `child_process.spawn` with argument arrays only. edge-tts → temp mp3 → ffmpeg `-c:a libopus -b:a 32k -ac 1 -ar 48000` → `public/audio/phase1/<id>.opus`. Skip when the manifest entry's text+voice+rate+pitch hash matches and the file exists. Concurrency limit 4. Retry once on failure; then record the error and continue.
   - ffprobe: durationMs, channels, sampleRate; store `bytes`, `sha256`, `durationMs`.
   - Output: `public/audio/manifest.json` exactly in the TDD §6.1 shape (schemaVersion, contentRevision, clips, variants, words), deterministic key order; `docs/design/review-sheet.tsv` (id, text, pinyin, voice, file) for the native reviewer.
   - Flags: `--dry-run` (print inventory counts by category and exit), `--only <idPrefix>`, `--force`, `--validate` (rule 8 from TDD §9.2: every referenced ID has manifest entry + file + matching sha256; mono 48 kHz; duration 0.25–6 s; size cap 8/12/16/24 KB at ≤2/3/4/6 s; report stale files not referenced).
2. `package.json` scripts: `tts`, `tts:dry`, `tts:validate`.
3. `scripts/README.md` and `content/README.md` updated (voices.json, manifest, how to run).
4. Unit tests `tests/tts-inventory.test.ts` for the pure inventory/variant/ID logic (export it from `scripts/tts-inventory.mjs` so it is testable without spawning anything).

## Scope out
Runtime AudioManager, UI, engine, generating any audio yourself.

## Constraints
No runtime dependencies. Never interpolate text into a shell string. Do not commit. Handle missing `hint`/`audio` fields on current v1 content gracefully (skip with a listed warning).

## Acceptance
- `node scripts/tts.mjs --dry-run` prints category counts against the current content without error.
- Inventory unit tests pass; `npx tsc --noEmit` clean.
- Report: DONE / FILES / exact commands for the orchestrator to run / assumptions made about IDs / OPEN QUESTIONS.
