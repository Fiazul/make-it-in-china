# Stage 5 fix — wall collision, camera inside walls, phone HUD overlap, reload spawn

## Goal
Fix four defects found in the browser smoke of the third-person slice you built (`src/render/motion.ts`, `camera.ts`, `world.ts`, `input.ts`, `scene.ts`, `content/phase1/world.json`). Design authority `docs/design/TDD.md` §2 (colliders, footprints, doors), §4 (capsule, camera occlusion), ticket 5.7 (reload returns to a safe position).

## Defects (observed at http://localhost:5179, screenshots in docs/screenshots/s5-*.png)
1. **No wall collision.** Holding W from spawn walks straight through the 家 building walls and out the far side. `motion.ts` has `collidersFromWorld`/`expandRoomWalls`, but in practice nothing blocks. Diagnose (colliders not generated from footprints? capsule test not applied to the integrated position? door-side wall gaps too wide?) and fix so every building footprint in `world.json` blocks the player except through its door opening. Fences/hedges/props with `collider` entries also block. Player cannot leave the district bounds.
2. **Camera enters building interiors and shows backfaces (black screen).** Occlusion pull-in must treat building hulls as blockers and clamp to the min distance; when the player is inside a room, roof/upper walls fade or the camera clamps above the player, never inside geometry.
3. **Phone layout:** at 390×844 the "WASD walk…" hint overlaps the HUD wallet/day panel. Hide the keyboard hint when touch controls are shown; ensure no HUD element overlaps another at 390×844 and 360×740.
4. **Reload spawn:** with a saved game the page resumed mid-dialogue with the camera wherever it was. On load, place the player at the last safe street position (persist `[x,z,yaw]` in the UI localStorage state on each dialogue end and every 2 s while moving on a walkable spot); if a dialogue is restored, snap the player to the NPC's arrival offset facing the NPC and lock movement as during any dialogue.

Also: signs count is 9 (a 医院 sign): confirm it is a designed location in TDD §2; keep it if so.

## You are the SOLE executor
No spawning/delegation. NO shell. The orchestrator runs `npx tsc --noEmit`, `npm test`, `npm run build` and a browser smoke, then resumes you with results. Do not edit `src/ui/bubble.ts`, `src/ui/notebook.ts` or add audio code: another worker is wiring speech concurrently; keep `src/main.ts` edits to the minimum needed for defect 4 and mark them with a short `// safe-spawn` region so merges are easy.

## Acceptance (browser)
- From spawn, holding W stops at the 家 wall; walking to the doorway enters; cannot pass any other wall; cannot exit district.
- Camera never shows backfaces or a black frame while circling any building or standing inside a room.
- 390×844: hint hidden, no overlapping HUD boxes.
- Reload with a save: player on the street at the saved spot, or at the NPC if a dialogue is open.
- tsc clean, tests pass.
- Report: DONE / root cause of defect 1 in two sentences / FILES / OPEN QUESTIONS.
