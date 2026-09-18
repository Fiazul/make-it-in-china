# G — Design documents for "Make It in China" (DESIGN ONLY, no code)

## Goal
Three documents in docs/design/ that a small implementation model (GPT-5.6 Sol / Grok 4.6 in Cursor)
can build from without asking questions: GDD.md (game design), TDD.md (technical design), ART.md
(art + audio bible) plus ASSETS.csv (every asset the game needs). Write for the builder, not for
the reader's entertainment: exact numbers, tables, state machines, file formats, acceptance tests.

## Read first (all short)
docs/WATERFALL.md (decisions — do not re-open them), docs/design-doc.txt (original owner spec:
learning system, economy, content rules, validation — keep every rule), docs/PLAN.md "Contract" and
"Engine decisions" (existing engine API you must design around, or state precisely what changes),
src/engine/README.md, content/phase1/scene-list.md (the 25-scene curriculum), content/phase1/scenes.json
(scene 01 only), docs/reference-videos.md, docs/TODO.md.
Reference for what a finished small three.js game contains: https://github.com/0xmariowu/cloudkeep
(Blender bpy scripts as build step, DOM UI, procedural audio, exponential-smoothing camera, unified
input, LOD pairs). Ours differs: humans with skeletal animation, and pre-generated speech.

## GDD.md must contain
1. Vision, pillars, audience (from WATERFALL), one-paragraph fantasy.
2. World: the district map (ASCII top-down, ~60×40 m), 8 locations with purpose, opening hours in
   day-slots, walking distances in seconds, landmarks for orientation, signage text (hanzi) per building.
3. Cast: 8 NPCs — silhouette, colour, headwear/prop, personality in one line, voice (which TTS voice,
   pitch/rate), idle behaviour loop, schedule by day-slot, the job/scenes they own.
4. Core loop per in-game day (morning → 4 action slots → evening mentor → sleep): a flowchart and a
   worked example day 1 and day 5 with wallet numbers.
5. Systems: movement + camera feel spec (speeds, accel, turn rate, camera distance/pitch/lag, collision),
   interaction (E-range, prompt, facing), dialogue presentation (bubble anatomy, timing, audio play
   order, tap-for-pinyin, replay, slow replay, reply selection with spoken replies), comprehension
   evidence rules (keep the design doc's word states), hidden repetition (slot filling), economy
   (prices table, wages, rent, costs; tuning targets), notebook, mentor, failure handling
   (consequence scenes: 12 funny mix-ups listed), progression gate to Phase 2.
6. Content plan: the 25 scenes with location/NPC/kind, plus a "living street" ambient line set
   (20 one-liners NPCs say when you pass, all HSK 1).
7. UI: every screen/overlay with a wireframe (ASCII), desktop and phone, controls help, pause, settings
   (audio volume, text size, pinyin default off), save/export.
8. Onboarding: first 3 minutes scripted beat by beat (the arrival scene teaches 10 words + controls).
9. Accessibility and localisation notes (English glosses now, Bengali later).
10. Success metrics (from design doc validation) and playtest script.

## TDD.md must contain
1. Architecture diagram (mermaid) and module list with responsibilities and file names; keep
   src/engine as-is where possible and list exact API additions needed (e.g. audio ids per reply,
   NPC schedule queries).
2. Scene graph and world format (world.json v2: meshes, colliders, spawn points, NPC waypoints,
   triggers) with a full example.
3. Character system: rig requirements, clip names, state machine (idle/walk/run/talk/carry…),
   blending times, root motion no; how NPC schedules drive positions; LOD.
4. Camera controller math (exponential decay, occlusion handling, orbit), input abstraction
   (keyboard/gamepad/touch → one intent struct), mobile joystick spec.
5. Rendering: toon + outline approach (MeshToonMaterial + gradient map + inverted hull vs post
   outline) with the mobile cost budget and a fallback; lighting rig; shadows; palette handling.
6. Audio pipeline: scripts/tts.mjs design (edge-tts CLI, voices, SSML rate, per-line + per-word
   clips, Opus via ffmpeg, manifest), runtime AudioManager (Web Audio, unlock on first tap, ducking,
   slow replay), SFX list and procedural options, music approach.
7. Asset pipeline: Blender bpy build step (scripts/blender/*.py) for authored props + CC0 import rules
   + gltf-transform compression + manifest + CREDITS; budget table.
8. Save v2 schema + migration from v1; instrumentation events.
9. Performance budgets and how to measure; test plan (unit, content checker rules incl. new ones for
   audio ids, browser smoke via Playwright); CI.
10. Build order for Cursor: stages 5–8 of WATERFALL broken into ≤ 12 tickets each with acceptance
    criteria a browser tester can check.

## ART.md + ASSETS.csv
Style guide: palette (hex per district/time of day), proportions (character 1.7 m, head 1/6),
camera framing samples (ASCII), toon ramp, outline width, signage typography (CJK font subset),
UI skin. Character sheet per NPC (colours, headwear, prop). Prop list for the street and each
interior. Voice direction per NPC. SFX and music lists. ASSETS.csv columns: id, type (char/prop/
building/audio/ui), source (CC0 pack | Blender script | owner | TTS), status, budget_kb, notes.
Mark which props are best authored by Blender bpy script (give the script outline for 5 of them).

## Constraints
- Design only. Do not write TypeScript or touch src/, content/, scripts/. Blender python OUTLINES only.
- Every numeric parameter gets a value (not "tune later"). Every open question goes in a final
  "Owner decisions needed" table with a recommended default.
- Length: GDD ≤ 1,800 lines, TDD ≤ 1,500, ART ≤ 700. Prefer tables to prose.

## Report format
DONE / FILES TOUCHED / OWNER DECISIONS NEEDED (copied from the docs) / OPEN QUESTIONS.
Execute to completion in one run; no mid-way check-ins.
