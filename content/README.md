# Content
Game data and curriculum authored independently of runtime code.

- `phase1/scene-list.md` — Phase 1 curriculum plan.
- `phase1/scenes.json` — Phase 1 dialogue and activity data.
- `phase1/words.json` — Phase 1 vocabulary data.
- `phase1/world.json` — Phase 1 locations, NPCs, slot pools, and v2 district fields (bounds, colliders, spawns, waypoints, schedules, signs).
- `phase1/voices.json` — build-time player, system, and per-NPC speech presets.
- `phase1/word-audio-map.json` — durable dictionary hanzi-to-`word_NNN` clip IDs.
- `phase1/ambient.json` — overheard street lines: `id`, `location`, `speaker`, `hanzi`,
  `pinyin`, `en`, `words`, and an `audio` ID equal to the line ID.

Speech IDs are authored on line, reply, and hint `audio` fields. Fixed line IDs match
their exchange ID; replies conventionally use `<exchange>_r1`; hints use
`<exchange>_hint`. Slot-filled sites keep that logical base ID and are expanded to
`<base>__v000` files using lexically ordered slot names and stable pool value IDs.
Every slot-pool value requires a unique authored `id` within its pool. Dictionary
clips retain their IDs through `word-audio-map.json`; dictionary reordering reuses
existing IDs and new words append the next unused ID. The same lookup is written
to the manifest.

Run `npm run tts:dry` to inspect inventory without writing files. `npm run tts`
creates the Opus files, `public/audio/manifest.json`, and the native review sheet;
`npm run tts:validate` checks the generated set.

## Stage-4 optional metadata

V2 authoring may add stable reply `id`; per-exchange `introduces`, `tests`, `hint`,
`taskAfterCorrect`, and `guidedConsequence`; and scene `curriculumIndex`, `minDay`,
`afterScenes`, `allowedSlots`, `repeatable`, and `purchase`. These fields remain
optional so existing V1 JSON still loads.

Ambient lines are capped at eight syllables and a word in one counts as placed in every
curriculum scene at its `location`, so curriculum lines stay sayable (checker rules 4 and
15: lines 14 syllables, hints 10, replies 8 unless the reply carries a numeric slot).

Use `npm run check:content:strict` for the release checks. Start `npm run dev` and
open `/preview.html` to inspect every line, reply, hint, slot value, novelty count,
strict issue, and coverage placement.
