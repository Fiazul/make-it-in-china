# Render
Three.js world presentation, movement, and character visuals.

- `assets.ts` — cached GLB manifest/loader and skeleton-safe cloning.
- `character.ts` — normalized mannequin, idle/walk animation, accessories, and primitive fallback.
- `navigation.ts` — movement-grid and pathfinding feature area.
- `npc.ts` — NPC visual feature area.
- `scene.ts` — renderer setup, CC0 street dressing, and scene glue.
- `toon.ts` — flat material conversion, toon shading, and inverted-hull outlines.
- `world.ts` — world-to-renderer assembly glue.

`startScene()` creates the renderer, ground, and primitive world immediately, then replaces each
placeholder as its model settles. The loader caches one source scene per manifest entry and
`cloneModel()` uses `SkeletonUtils.clone()` so each mannequin has an independent skeleton. A failed
request is warned once and leaves its capsule or box fallback in place.

Characters are normalized to 1.7 world units. Animation selection prefers `Idle`/`Idle_A` and
`Walking_A`/`Walk`/`Walking`, then falls back to the first clip whose name contains `idle` or `walk`.
Every character material is rebuilt without a texture map, and separately named eye, brow, mouth,
teeth, tongue, or eyelash meshes are hidden. This keeps the mannequin featureless even if a source
revision adds painted or separate facial details. `makeHead()` remains the single primitive-head
factory used by the fallback, and each `Character` exposes its head mesh or mannequin head bone as
the swappable `head` anchor.

Loaded scenes are flattened to `MeshLambertMaterial` normally and `MeshToonMaterial` under
`?toon=1`, retaining source texture maps except when a forced faceless mannequin colour is applied.
Toon mode adds an inverted-hull outline to static meshes. Skinned-mesh outlines are intentionally
skipped because a second skinned draw hierarchy would materially increase character rendering cost.
