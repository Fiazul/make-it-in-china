# F — Swap grey boxes for CC0 models (character + street + noodle-shop props)

## Goal
The street uses real low-poly CC0 models instead of primitive boxes, and the player/NPCs are the
Quaternius faceless mannequin with idle + walk animations, all still toon-shaded/outlined under
`?toon=1` and flat-coloured otherwise. Build stays < 15 MB total; no faces anywhere.

## Context
- Repo/dir: this directory. Read: docs/PLAN.md (Layout + Visual direction in docs/design-doc.txt
  lines 333–416), src/render/README.md, src/render/*.ts (≈330 lines), src/main.ts, content/phase1/world.json.
- Extracted CC0 packs (NOT in git; you copy what you use into public/models/):
  - Character: `assets/extracted/universal-animation-library-standard/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb`
    (rig + ~45 clips, faceless mannequin; ~7.6 MB — see README.txt in that folder for clip names;
    `_RM` variant is root-motion, don't use). If 7.6 MB is too heavy, note it and still use it — an
    orchestrator will run gltf-transform later.
  - Buildings: `assets/extracted/city-kit-commercial/Models/GLB format/*.glb` (building-a..n, low-detail-*, detail-awning*, detail-overhang*).
  - Street bits: `assets/extracted/kaykit-city-builder-bits-1.0-free/**/Assets/gltf/{streetlight,bench,box_A,box_B,bush,road_straight,trash_A}.gltf` (+ .bin, + textures if referenced).
  - Food props: `assets/extracted/food-kit/Models/GLB format/{bowl-broth,bowl-soup,bowl,chopstick,cup-tea,pot,pot-lid,steamer,plate,egg-cooked,rice-ball}.glb`.
- The pipeline rule from the design doc: GLB only in the build; flat colours (Kenney/KayKit already
  flat); keep a CREDITS.md line per asset (docs/CREDITS.md has the pack rows — add a "used files" list).

## Scope
- In: src/render/**, src/main.ts (only if a render API changes), public/models/** (copied assets),
  docs/CREDITS.md, src/render/README.md. Out: src/engine, src/ui, content/, package.json (three already
  ships GLTFLoader/DRACOLoader/SkeletonUtils under `three/examples/jsm` — no new deps). No commits.

## Requirements
1. `src/render/assets.ts`: one loader with a manifest `{ id → url }`, `loadAll()` returning a map of
   scenes; GLTFLoader; cache; `clone()` via SkeletonUtils for skinned meshes. Fail soft: if a model
   404s, log once and fall back to the existing box/capsule so the game still runs.
2. Character: replace the capsule in character.ts with the UAL1 mannequin (player + every NPC).
   Per-NPC colour from world.json `color` applied to the body material; headwear/prop optional via a
   small primitive (cap = cylinder, book = box) attached to the head/hand bone if a bone is easy to
   find, else skip. AnimationMixer: idle when still, walk when moving (pick clip names from README).
   `makeHead()` contract stays: the head must remain swappable — and MUST have no facial features
   (verify the mannequin mesh has none; if the texture has painted eyes, force a flat MeshStandard/
   MeshToon material with no map).
3. Street: replace the 3 boxes with Kenney buildings; the noodle shop keeps its 面馆 sign (existing
   text texture) plus an awning; place streetlight/bench/box/bush along the street; ground = road_straight
   or the existing plane tinted. Keep grid cells for buildings blocked in navigation.ts.
4. Noodle shop dressing: bowl-broth, chopstick, cup-tea, steamer, pot on a simple table (box) by the cook.
5. Scale: a mannequin ≈ 1.7 grid units tall; buildings scaled so the character is ≈ 1/8 screen height
   as before. Preserve camera framing.
6. Toon path: when `?toon=1`, traverse loaded scenes and swap materials for MeshToonMaterial with the
   same `color` (drop maps for flat colour), and add the inverted-hull outline to every mesh (skip
   skinned outline if it costs too much — note it).
7. Budget: copy only the files you reference into public/models/; report total bytes of public/models.

## Acceptance (orchestrator runs commands; you have no shell — never stop for that)
- [ ] `npx tsc --noEmit` clean; `npm run build` ok; report `du -sh public/models` estimate from file sizes.
- [ ] Manifest lists every model with its source pack; CREDITS.md "used files" list matches.
- [ ] Describe the fallback path and the animation clip names used.
- [ ] State explicitly how you verified "no facial features" on the mannequin.

## Report
DONE / ACCEPTANCE / FILES TOUCHED / OPEN QUESTIONS.
