# Scripts
Repository checks and maintenance entry points.

- `check-level.mjs` — legacy and strict content validation CLI.
- `check-level-rules.mjs` — shared pure rule logic used by Node and the browser preview.
- `check-level-rules.d.mts` — TypeScript declarations for the shared rules.
- `slot-tuples.mjs` — shared fixed-pair eligibility and same-pool tuple enumeration.
- `tts-inventory.mjs` — pure speech inventory, slot expansion, and logical ID builder.
- `tts.mjs` — build-time Edge TTS → mono 48 kHz Opus generator and rule-8 validator.
- `blender/` — deterministic bpy builders for optional `public/models/generated/` GLBs.

## Content checks

`npm run check:content` preserves the seven development checks and their existing
output. `npm run check:content:strict` applies release rules 1–7, 10, 11, 14, and 15,
prints `RULE<n> <severity> <stableSiteId>: <message>`, and exits nonzero on any
failure. Dialogue site IDs use `<sceneId>/<exchangeId>/line|r<k>|hint`; slot
values use `pool:<poolId>/<index>`, world signs use `sign:<locationId>/<index>`,
and ambient street lines use `ambient:<lineId>`.

Rule 15 caps spoken length: NPC lines 14 syllables, hints 10, replies 8 unless the
reply carries a numeric slot, and ambient lines 8. One Han character counts as one
syllable and each `{placeholder}` counts as two.

Coverage (rule 4) counts a word for a curriculum scene when it appears in that
scene's lines, replies, hints, or in a `content/phase1/ambient.json` line whose
`location` matches the scene. Ambient lines carry `id`, `location`, `speaker`,
`hanzi`, `pinyin`, `en`, `words`, and an `audio` ID equal to the line ID.

## Speech authoring
Node 20, `edge-tts`, `ffmpeg`, and `ffprobe` must be on `PATH`. The generator never runs
as part of normal builds or CI.

```sh
npm run tts:dry
npm run tts
npm run tts:validate
```

Use `npm run tts -- --only <idPrefix>` for a subset or add `--force` to regenerate
matching clips. Generation runs four clips concurrently and retries each failed clip
once. It writes `public/audio/phase1/*.opus`, `public/audio/manifest.json`, and
`docs/design/review-sheet.tsv`. Cache keys include the pinned provider version and
all codec settings. Stable dictionary clip IDs are retained in
`content/phase1/word-audio-map.json`; reordering words does not renumber them, and
new words receive the next unused `word_NNN` ID. Validation checks source metadata, file hashes,
Opus format, duration, and duration-derived byte caps. Byte caps allow 5% container
and encoder overhead, rounded up to the next byte. Stale Opus files are reported but
not deleted.

## Optional Blender meshes

Blender 4.2 at `~/.local/bin/blender` is an orchestrator gate. The game renders without
these GLBs; parametric three.js fallbacks cover every silhouette.

```sh
~/.local/bin/blender --background --python scripts/blender/build_all.py -- --out public/models/generated
```

Individual builders:

```sh
~/.local/bin/blender --background --python scripts/blender/buildings.py -- --out public/models/generated
~/.local/bin/blender --background --python scripts/blender/furniture.py -- --out public/models/generated
~/.local/bin/blender --background --python scripts/blender/lantern.py -- --out public/models/generated
~/.local/bin/blender --background --python scripts/blender/fruit_stall.py -- --out public/models/generated
~/.local/bin/blender --background --python scripts/blender/doorway.py -- --out public/models/generated
~/.local/bin/blender --background --python scripts/blender/steamer.py -- --out public/models/generated
~/.local/bin/blender --background --python scripts/blender/signboard.py -- --out public/models/generated
```

