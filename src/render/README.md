# Render
Three.js world presentation, movement, and character visuals.

- `assets.ts` — cached GLB manifest/loader and skeleton-safe cloning.
- `buildings.ts` — eight parametric location silhouettes (toon fallbacks; optional Blender GLBs).
- `camera.ts` — third-person follow, orbit, exponential smoothing, hull occlusion, and lerp clamp.
- `character.ts` — UAL clone, clip map, locomotion state machine, per-bone outfit vertex colours, blank-head accessories.
- `constants.ts` — TDD speeds, camera, blend, palette, crowd, decal, and clip-name table.
- `crowd.ts` — background pedestrian and cyclist loops with player avoidance, LOD, and a reduced phone spawn.
- `daylight.ts` — four ART day-slot palettes, 1.5 s sky/fog/sun/lamp transitions, day-tone hook.
- `geom.ts` — vertex-coloured geometry merge; one draw plus one hull per batch.
- `input.ts` — keyboard, per-pointer touch joystick/run/orbit, and gamepad fused into one `Intent`.
- `motion.ts` — capsule vs expanded AABBs, sliding, footprint hulls, and district boundary clamp.
- `navigation.ts` — legacy grid pathfinding (tests) plus waypoint Dijkstra for NPCs.
- `npc.ts` — schedule anchors, facing, talk clip, and waypoint walking.
- `props.ts` — parametric lanterns with sway, bicycle, furniture, steam, and GLB fallbacks.
- `scene.ts` — renderer loop, 60/30 fps budget, daylight tick, and dialogue/input glue.
- `street.ts` — road vs paver tiles, kerbs and ramps, road paint, ground decals, gradient sky dome, hedges, trees, tinted skyline.
- `toon.ts` — MeshToon ramp, texture-stripped materials, normal-extrusion outline hulls.
- `world.ts` — district from world.json v2: buildings, props, lights, fog, DOM signs.

`startScene()` builds the morning district immediately from merged parametric shells and prop
fallbacks, then swaps in cached GLBs as they settle. Characters share one UAL source;
`cloneModel()` uses `SkeletonUtils.clone()` so each mixer has an independent skeleton.
Clip names resolve only through `CLIP_MAP` in `constants.ts` (idle/walk/run/talk/sit/
pickup/interact; carry/wave/nod/shake fall back until Blender clips exist). Root X/Z
on the hips/root track is zeroed so locomotion is in-place and foot playback is scaled
to TDD walk/run speeds.

Toon shading is the shipping look: atlas maps are removed and the ART palette fills
materials. Outlines are inverted hulls that extrude along the vertex normal in the vertex
shader, width scaled by view depth and clamped to 0.025 m, so a hull never depends on a
geometry's bounding box or origin; merged batches and thin roof slabs keep their ink line
instead of producing a displaced black slab. Geometry under 0.15 m and geometry thinner
than 0.02 m on any axis carries no hull. Skinned hulls extrude before skinning so they
follow the shared skeleton. DOM signs and the E/Talk prompt are projected over the canvas;
no WebGL text and no facial meshes.

Outfits come from `OUTFITS` in `character.ts`: each vertex takes the colour of its
dominant skin bone, so one shared mannequin mesh reads as shirt, trousers, shoes and blank
skin without new geometry. Head, neck and hand bones resolve to the ART blank skin tone.
Hat and chest kit merge into one batch each on their bone; hand props stay on the hand.
Satchels, apron ties and carried parcels hang off the upright root group via
`addBackAttachments`, so they read from behind while the player walks away from the
camera. A static idle clip is detected by `clipIsStatic`; when one is found the head and
hands get a small procedural drift so nobody stands frozen.

`crowd.ts` walks three to four faceless pedestrians and one cyclist on fixed loops
(two walkers and no cyclist on the coarse-pointer quality path):
pavement lanes plus the noodle-shop crossing for walkers, the road for the cyclist. They
are not in `world.npcs`, so they never enter dialogue, never register for the talk prompt
and never occlude the camera. They steer around the player inside 1.5 m, drop their hulls
past `LOD1_DISTANCE` and stop animating past `CROWD_ANIM_CUTOFF`. Scheduled NPCs walk
their waypoint path between slot anchors at `NPC_WALK_SPEED` and drop hulls at the same
distance unless they are the one talking.

The default camera rests at 22° pitch, 9 m out, and sets a view offset from the projected
foot position so the feet land on the ART 64% line with the horizon still on screen.
Indoors the pitch floor is 34°, not the orbit maximum.

Ground reading comes from two extra draws over the bare street. `road-paint` carries the
centre dashes and the zebra crossing at the noodle shop; `ground-decals` merges building
ground shade, road-centre and doorway wear, manhole covers, drain grates, and the contact
shadows under benches, crates, bushes, lamp posts and the parked bicycle into one
vertex-alpha mesh. Kerb ramps ride in the kerb batch, so they cost nothing extra. Paver
jitter stays in `tiledPaving`.

Daylight follows `state.actionSlots` via `setTimeSlot`: M/A1 morning, A2 midday, A3
afternoon, A4/E evening. Sky, linear fog, sun colour/angle, hemisphere colours, and
lantern/streetlight emissive interpolate over 1.5 s (0.15 s when `prefers-reduced-motion`).
Slot colours stay on the ART §2 table; separation comes from sun elevation and light
level instead: morning sits low in the east (16°, long shadows), midday high and neutral
(76°, short shadows, brightest hemisphere), afternoon warm gold from the west (30°), and
evening rakes in at 8° with lantern emissive, window glow planes and lit skyline dots.
Fog uses the ART `sky` value, not the sky dome's horizon band, so the evening skyline and
distant geometry stay desaturated instead of turning saturated orange. `Daylight.attach()`
takes one `DayTarget`; `scene.ts` points it at the district (skyline tone, window glow)
and the blob shadows (spread and softness with the sun angle).

Roofs and upper walls fade when the player is inside a room volume. Static district
geometry is merged per visibility group with per-vertex colour, so a whole batch is one
draw plus one hull; the static district measures 52 draw units and spawn with the full
cast and crowd estimates at about 163 against a 190 budget (`tests/render/drawcalls.test.ts`).
Generated Blender GLBs under `public/models/generated/` are optional and not yet loaded;
the parametric builders render the same silhouettes without them.

Every building shares one static `GeomBatch` flushed once in `world.ts`, so the whole
district shell is one draw plus one hull instead of one set per building; each building
keeps its own fade group for roof and upper-wall fading.

`window.__debug` is always available for browser smoke runs:

| Call | Result |
|---|---|
| `__debug.position()` | `[x, y, z]` of the player capsule |
| `__debug.teleport(x, z)` | moves the player, keeping the current yaw |
| `__debug.snapToNpc(id)` | stands the player in talk range, facing the NPC |
| `__debug.yaw()` | follow-camera yaw in radians |
| `__debug.setTimeSlot('M'\|'A1'\|'A2'\|'A3'\|'A4'\|'E')` | forces the daylight slot |
| `__debug.timeSlot()` | the slot the renderer is showing |
| `__debug.day()` | the engine day number |
| `__debug.fps()` | frames per second over the last half second |
| `__debug.draws()` | `renderer.info.render.calls` from the last rendered frame |
