# Stage 6 — Spoken Mandarin in the game (AudioManager + dialogue speech)

## Goal
Make the game talk. Every NPC line plays out loud as soon as its exchange appears; replies are spoken; the notebook plays word and sentence audio; a replay button replays the line. Clips exist already: `public/audio/phase1/<id>.opus` and `public/audio/manifest.json` (shape in `docs/design/TDD.md` §6.1; `clips[id].url`, `variants[baseId].byBinding["slot=valueId|…"]`, `words[hanzi] = wordClipId`). Design authority: TDD §6.2 AudioManager (lines ~476–517), GDD §5.2 Dialogue and comprehension (audio-before-text ordering, spoken reply options, hint after second miss), ART §4 voices, tickets 6.1–6.2 in TDD §10.

## Read first
`src/ui/README.md`, `src/ui/bubble.ts`, `src/ui/notebook.ts`, `src/main.ts` (dialogue render path: `render()`, `restoreNewWords`, `game.on('change')`), `src/engine/README.md` (DialogueFrame shape: `exchange`, `bindings`, `attempts`), `content/phase1/voices.json`, `scripts/tts-inventory.mjs` (how variant IDs and `byBinding` keys are derived: `slot=valueId` joined with `|`, slots sorted).

## Scope
1. `src/audio/manager.ts` (new, browser-only, no engine imports): loads `manifest.json` with `import.meta.env.BASE_URL` prefix; `unlock()` on first user gesture (pointerdown/keydown) creating one `AudioContext`; `play(id, {interrupt:true})` decodes via `fetch` + `decodeAudioData`, LRU of decoded buffers ≤16 MB, never two voices at once (stop current before starting); `resolve(baseId, bindings)` → variant clip ID via `byBinding` or the base ID; `word(hanzi)` → word clip; volume master/speech from settings persisted in localStorage; `onMissing(id)` callback so UI can show a text fallback. Retry once on fetch failure.
2. Dialogue speech (`src/ui/bubble.ts` + minimal `main.ts` glue): when an exchange appears, play the NPC line first, reveal hanzi/pinyin at playback start (GDD ordering: audio before text; a 250 ms delay is enough, do not block on decode failure); replay button replays; hovering/focusing a reply or a first tap on phone speaks the reply in the player voice (second tap selects, per TDD 6.2 "preview/select distinct"); after a wrong reply the consequence line plays; after the second miss the hint line plays with the hint text; tapping a word in the line plays its word clip.
3. Notebook (`src/ui/notebook.ts`): each word row has a play button for its word clip and, when a `firstSeen` sentence is stored, for that sentence's clip.
4. Settings: a small speaker button in the HUD toggling mute (persisted); speech volume slider inside the notebook/settings panel.
5. Visual state: an animated "speaking" indicator on the bubble while a clip plays; the NPC talk animation is already driven by dialogue-open state (do not touch `src/render/*`).
6. Update `src/ui/README.md`, `src/audio/README.md` (new), `README.md` (audio/mute), `docs/PLAN.md` (no new runtime dependency).

## Scope out
Renderer/camera/collision (another worker is on `src/render/*` now; do not edit those files), engine changes, TTS generation.

## You are the SOLE executor
No spawning/delegation. NO shell. Orchestrator runs `npx tsc --noEmit`, `npm test`, `npm run build` and a browser smoke that checks network requests for `.opus` and audible playback via AudioContext state. Keep `src/main.ts` edits minimal and marked `// speech` so merges are easy.

## Acceptance (browser)
- Open dialogue with the landlord: a `.opus` request fires, the line is heard, hanzi appears with/after audio start; replay works; hovering a reply speaks it; selecting speaks nothing new until the next line plays.
- Notebook word play buttons fetch and play word clips.
- Mute persists across reload; never two clips overlap.
- Missing clip → text still shows, small "no audio" marker, no console error spam.
- tsc clean, tests pass. Report: DONE / FILES / how the orchestrator can verify audio in Playwright (e.g. expose `window.__audioState` = {playing, lastId, contextState}) / OPEN QUESTIONS.
