# D3 — Release fixes for v0.0.1 (from gate review R2 + browser regression)

## Goal
Every item below fixed as a category, not an instance. tsc clean, tests green (orchestrator runs
them — you have no shell; never stop for that).

## Fixes
1. **Silent dead-ends → always feedback.** Walking to an NPC with no startable scene does nothing.
   Category: any player action that the engine rejects or ignores must show a message. Implement:
   when near an NPC and `nextJob()` is undefined, show a short NPC bubble line (no replies) with the
   reason: no action slots left → "今天没有工作了。明天再来。" (en: "No more work today. Come back
   tomorrow."); scene locked by words → "你还不认识这些字。" (en: "You don't know these words yet.");
   all scenes done → "今天做完了。" Use the existing bubble with an OK button. Also catch
   `CommandError` from every `game.*` call in src/main.ts and show its message in the same way.
2. **End the day.** `game.sleep()` has no UI. Add a HUD button "睡觉 · Sleep" (visible when no
   dialogue is active) → `sleep()`, then toast "第N天" and re-render. Show a `rentDue` event as a
   landlord toast.
3. **`#hud-objective` never changes.** Derive it from state each render: next uncompleted job's
   location/verb; when out of slots → "today: rest"; when all done → "today: shifts complete".
4. **Stale `#reply-options` after scene end.** Clear/hide the reply bar whenever `state.dialogue` is
   null or the exchange changes; category: every DOM region driven by dialogue state must be reset
   in the same `render()` path, not in event handlers.
5. **Seed.** New games always use seed 1, so every fresh player sees the same numbers. In main.ts,
   when there is no save, pass `seed: crypto.getRandomValues(new Uint32Array(1))[0]` (falls back to
   `Date.now()`); the engine already persists the RNG in the save.
6. **Bonus marker.** Notebook rows for `Word.bonus` show a "额外 · bonus" tag; progress count
   excludes bonus words ("N / 150").
7. **Loading state (R2 #4).** src/render/scene.ts awaits `loadAll()` before creating the renderer.
   Create renderer + ground + primitive placeholders immediately, show a DOM line "加载中… loading
   models" (`#loading`), then swap in models as each resolves; remove the line when all settle.
8. **Unhandled rejection (R2 #5).** `void startScene(...)` in main.ts → `.catch(err => showFatal(err))`
   rendering a one-line message in the DOM ("WebGL unavailable" etc.).
9. **Textures dropped → white buildings (R2 medium).** `flatMaterial()` rebuilds materials from
   `color` and drops `map`. Kenney/KayKit colours live in the atlas texture. Keep `map` in both
   normal and toon paths (MeshToonMaterial supports `map`); only the mannequin gets a forced flat
   colour (faceless rule). The Kenney colormap now exists at public/models/buildings/Textures/colormap.png.

## Scope
In: src/ui/**, src/main.ts, src/render/scene.ts, src/render/toon.ts, src/render/assets.ts,
index.html CSS. Out: src/engine/**, content/**, package.json. No commits.

## Acceptance
- [ ] tsc clean, tests green (orchestrator verifies).
- [ ] For each of 1–9: file:line and a one-sentence description of the behaviour a tester sees.
- [ ] List every `game.*` call site in main.ts and confirm each is inside the CommandError guard.

## Report
DONE / ACCEPTANCE / FILES TOUCHED / OPEN QUESTIONS.
