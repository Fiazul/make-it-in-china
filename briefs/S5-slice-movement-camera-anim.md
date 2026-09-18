# Stage 5 slice — third-person movement, camera, skeletal animation, district blockout

## Goal
Replace the v0.0.1 presentation (click-to-move, fixed camera, static mannequins) with the real third-person 3D layer described in the design docs. Deliver one playable slice at `npm run dev`: you spawn outside the rented room, walk and run through the district with WASD/Shift (touch joystick on phone), the camera follows behind with smoothing, your character and every NPC are skinned UAL bodies playing real animation clips, the eight buildings stand at their designed positions with doors and signs, and pressing E near an NPC still starts the existing dialogue (bubble UI) exactly as today. Quality bar: the Cloudkeep / "nowsome Atoll" three.js demos; not grey boxes.

## Read first (targeted, in this order)
- `CLAUDE.md`, `src/render/README.md`, `src/ui/README.md`, `src/main.ts`, `src/render/scene.ts`, `src/render/assets.ts`, `src/render/toon.ts`
- `docs/design/TDD.md` §2 World v2 and scene graph (lines ~122–312: coordinates, waypoints, doors, triggers, `world.json` v2 example), §3 Characters and animation (~313–360: rig, clip map, state machine, blend times, LOD), §4 Input, motion, and camera math (~361–386: speeds, capsule, camera distance/height/pitch, smoothing constants, occlusion), §5 Rendering, lighting, palette (~387–410)
- `docs/design/ART.md` §1 Visual rules, §2 Palette and time of day, §3 Camera framing, §4 Character sheets, §5 Environment and prop placement
- `docs/design/GDD.md` §2 District, §5.1 Movement, camera, and talking
- `docs/design/ASSETS.csv` rows of type char/building/prop (which CC0 GLBs exist under `public/models`, which are planned)

## Facts
- `public/models/character/UAL1_Standard.glb` (Quaternius, faceless allowed) has 1 skin and these clips: Idle_Loop, Walk_Loop, Jog_Fwd_Loop, Sprint_Loop, Idle_Talking_Loop, Sitting_Enter/Idle_Loop/Exit, PickUp_Table, Interact, Walk_Formal_Loop, plus others. Map idle/walk/run/talk/sit/pickup/interact to those. carry/wave/nod/shake do not exist yet: fall back to Idle_Loop/Interact and expose the clip map in one place so Blender-authored clips drop in later.
- Existing CC0 building/prop/food GLBs live in `public/models/**` with textures embedded; `src/render/assets.ts` loads them with the BASE_URL prefix. Reuse them; for buildings that have no asset, build a clean parametric placeholder (walls, roof, door frame, sign board with DOM sign text) matching ART palette, not a grey cube.
- Text is DOM-only. Never draw text in WebGL. Faces are forbidden on every mesh.
- three.js 0.180, Vite 7, TypeScript strict. No new runtime dependencies without a reason written in `docs/PLAN.md`.

## Scope (all in `src/render/`, `src/main.ts` glue, `content/phase1/world.json` v2 fields)
1. `world.json` v2: add the TDD §2 fields (locations with door positions/facings, NPC anchors and schedule slots, waypoints, colliders, spawn, triggers) keeping the v1 fields so the engine and tests keep passing. Update `src/content/types.ts` optionally-typed.
2. `render/input.ts`: one `Intent {move: Vector2, run, talk, menu}` from keyboard (WASD/arrows, Shift, E, Tab), touch joystick + Run/Talk DOM buttons (phone), gamepad if present. Blur/visibilitychange releases everything.
3. `render/character.ts`: load UAL once, `SkeletonUtils.clone` per character, `AnimationMixer`, state machine idle/walk/run/talk with cross-fades per TDD blend times, root motion stripped, foot speed matched to the TDD walk/run speeds so there is no sliding. Blank head, palette-coloured outfit per NPC `color`, headwear/prop attachments from world.json.
4. `render/motion.ts`: player capsule vs world colliders (TDD §4), speeds, turn smoothing, no wall tunnelling, cannot leave district.
5. `render/camera.ts`: third-person follow, distance/height/pitch and exponential smoothing constants from TDD §4, right-drag / touch-drag orbit, occlusion pull-in, no clipping through buildings.
6. `render/world.ts`: district built from world.json v2: ground, streets, eight buildings at coordinates, doors, DOM signs anchored in 3D, props from ASSETS.csv where GLBs exist, lights and fog per ART §2 for the day slot, toon material + outline from `toon.ts` applied to everything.
7. `render/npc.ts`: NPCs stand at their current slot anchor, face the player when within talk range, play talk clip while dialogue is open; walk between anchors on slot change (straight-line or waypoint path).
8. `main.ts` glue: replace click-to-move with the intent loop; E within range and facing → existing `maybeStartDialogue`; bubble anchors to the NPC head as today; HUD shows an E/Talk prompt; dialogue open locks movement.
9. Resize, DPR clamp, 60 fps desktop / 30 fps phone budget per TDD §9; LOD pair for characters if the TDD asks.
10. Update `src/render/README.md`, `README.md` controls section, `docs/TODO.md` (remove items now done).

## Scope out
Dialogue/UI redesign, audio playback, economy, save changes, Blender scripts, content text.

## You are the SOLE executor
No spawning/delegation. You have NO shell: do not run commands. Orchestrator runs `npx tsc --noEmit`, `npm test`, `npm run build`, then a browser smoke, and resumes you with results. Write strict-TS-clean code. If blocked or ambiguous, end your turn with the precise question.

## Acceptance (orchestrator checks in a browser)
- Spawn outside the room; WASD walks, Shift runs, character animates with matching foot speed; camera follows smoothly, orbits on drag, never clips into a building.
- Eight buildings at TDD coordinates with readable DOM signs; toon look with outlines; fog and palette match ART for the morning slot.
- All NPCs are skinned bodies with idle animation, turn to face the player in range, talk animation during dialogue.
- E starts the existing dialogue; bubble follows the NPC; movement locked during dialogue; existing 115+ engine tests pass unchanged.
- Phone layout: joystick + Run/Talk buttons work at 390×844.
- Report: DONE / FILES / a "how to try it" list / every TDD constant you used with its value / OPEN QUESTIONS.
