# TODO after v0.0.1

Known gaps found in the 2026-09-18 release checks. Fix in v0.0.2 unless noted.
- `?toon=1` shows no visible difference (materials keep the atlas map; no outlines on loaded models). Decide: MeshToon with map + inverted-hull on static meshes, or drop the flag until M5.
- `#hud-objective` says the same "洗碗 shift at 面馆" for scenes 1–3; show "shift 2 of 3" or the scene's own title.
- No audio yet (design doc: pre-generated TTS, one clip per line). Replay button is disabled. Needs a TTS provider decision from the owner.
- Rodin (hyper3d.ai) props not generated: the Playwright browser is not logged in. Log in once, then rerun the asset brief (briefs/ — Part 1) to spend the 16 credits on lantern/steamer/signboard props.
- Only 3 of 25 scenes exist; scene-list.md has the rest. Content writing is the bottleneck from here (design doc: pipeline matters from day one).
- Level checker rule 4 (every word in ≥3 scenes) is WARN until scenes.json has ≥20 scenes; flip to FAIL then.
- Mentor scenes, rent-due landlord bubble, and hidden-repetition slot filling are implemented in the engine but not exercised by content yet.
- Cursor workers run without a shell (auto-mode blocks `--yolo`); the orchestrator runs tsc/tests for them. Allowing `agent-delegates run` in Bash permissions removes that hop.
