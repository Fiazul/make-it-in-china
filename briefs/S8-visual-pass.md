# Stage 8a — Visual pass: the district must look like the art bible

## Goal
Take the working third-person slice (movement, camera, collision, speech are done; do not regress them) from "CC0 boxes with signs" to the look in `docs/design/ART.md`: toon-shaded, outlined, warm-palette Chinese street district with time-of-day lighting and readable, lively props. Reference quality: the Cloudkeep / Atoll three.js demos the owner cited. Read `docs/design/ART.md` §1–§3 and §5 fully, `docs/design/TDD.md` §5 Rendering, lighting, palette and §2 (locations, props table), `docs/design/ASSETS.csv` building/prop rows, `src/render/README.md`, `src/render/world.ts`, `toon.ts`, `scene.ts`, `constants.ts`, `docs/CREDITS.md`.

## Facts
- Existing CC0 GLBs under `public/models/**` (Kenney buildings/food/city kit, Quaternius UAL). Textures embedded. Loader: `src/render/assets.ts`.
- Blender 4.2 is available to the ORCHESTRATOR only. You may write Blender Python scripts under `scripts/blender/` per ART §7 outlines (facades, roofs, signs, props); the orchestrator runs them and drops GLBs into `public/models/generated/`. If you rely on a generated asset, also provide the parametric three.js fallback so the scene renders without it.
- No text in WebGL (signs stay DOM). No faces on any mesh. No new runtime dependency.

## Scope
1. Buildings: each of the 8 designed locations gets a distinct silhouette per ART §5 (noodle shop with awning + lanterns + steam vent, warehouse with roll door + crates, tea house with wooden lattice + tiled roof, fruit stall with canopy + crates of produce (reuse food GLBs), shop with shelves visible through door, rented room block with balcony + laundry line, bus stop/train gate with shelter + bench, clinic with plain facade). Parametric three.js geometry with the toon material, or Blender script + fallback.
2. Streets: pavement tiles vs road, kerbs, a few trees/planters, lamp posts, bicycles (parametric), benches, the parked bicycle from ASSETS, hedges at district edge, distant low skyline silhouette so the horizon isn't empty.
3. Toon: ramp and outline per ART/TDD; ensure the outline hull handles skinned characters and static meshes; rim/hemisphere lighting so nothing is flat grey.
4. Time of day: implement the four palettes (M, A1/A2, A3/A4, E) from ART §2 driven by the engine day slot (read `state.actionSlots` or the slot exposed by `main.ts`); smooth 1.5 s transition of sky, fog, sun colour/angle, lamp emissive at evening.
5. Characters: palette-coloured outfits per NPC `color` role in ART §2/§4, headwear/prop attachments from `world.json` (hat, apron, satchel, parcel) built parametrically and attached to the rig bones.
6. Interior visibility: when the player enters a room the roof/upper walls fade (already partly there); rooms get a floor, a table/counter and 2–3 props so entering is worth it.
7. Performance: TDD §9 budgets (desktop 60 fps, phone 30 fps); merge static geometry where possible; ≤ 150 draw calls at spawn; report your estimate.
8. Update `src/render/README.md`, `docs/CREDITS.md` for any new asset use, `docs/TODO.md`.

## Scope out
UI redesign (separate ticket), audio, engine, content, collision changes beyond adding colliders for new solid props.

## You are the SOLE executor
No spawning/delegation. NO shell. The orchestrator runs `npx tsc --noEmit`, `npm test`, `npm run build`, Blender scripts, and a browser smoke with screenshots, then resumes you with results. Write strict-TS-clean code.

## Acceptance (browser screenshots at spawn, noodle shop, tea house, evening)
- Each building recognisable without reading its sign; no plain boxes remain.
- Toon shading + outlines everywhere, warm palette per ART, sky/fog/sun change across the four slots.
- Props and street furniture present; horizon not empty.
- Collision, camera, movement, speech unchanged (smoke re-run).
- Report: DONE / FILES / Blender scripts to run (exact commands) / draw-call estimate / OPEN QUESTIONS.
