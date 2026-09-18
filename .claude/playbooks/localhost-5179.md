# localhost:5179 — Make It in China (vertical slice)

Vite dev server, three.js isometric grey-box street. Do not start/stop it — assume already running.

## Confirmed flow
1. `browser_navigate` to `http://localhost:5179/`, viewport 1280x800 for desktop pass.
2. Scene loads immediately: red "面馆" (noodle shop) building top-right of default camera, faceless
   blocky mannequins (player + NPCs, indistinguishable by look alone) scattered on a beige grid street.
   HUD top-right (`#game-hud`): `20块 · 第1天` / `today: 洗碗 shift at 面馆`. Notebook button `#notebook-button`
   ("词本") bottom-right, tooltip top-left "Click or tap the street to walk".
3. **Click that reaches the cook and auto-starts dialogue**: click on the ground at approx
   `(870, 300)` in the *default* 1280x800 camera framing (near the shop's front step). Dialogue
   triggered on the very first click there (within <1s, no need to poll 8s). Camera then zooms in
   tight on the shop/NPC.
4. Dialogue DOM: `.npc-name` → `陈师傅 · 厨师`. `#dialogue-line` has `.word-tap` spans per hanzi word/phrase.
   Tap a `.word-tap` (real click or `el.click()`) → `#word-popup` shows `pinyin · gloss`, e.g.
   `bēizi · cup; glass`.
5. Reply buttons: `#reply-options .reply-button`. Real user clicks work when the bubble is on-screen;
   when it's off-screen (see bug below) use `el.dispatchEvent(new PointerEvent('pointerup', {bubbles:true}))`
   via `browser_evaluate` — handlers fire on `pointerup`, this reproduces real interaction faithfully.
6. Wrong reply → line changes to a short consequence (e.g. `这是杯子，不是碗。`), wallet -1, then returns to
   the *same* exchange (line + reply options identical to before). Confirmed exactly this in scene
   `p1_noodle_dishwasher_01`.
7. Finishing all exchanges in the scene hides `#dialogue-bubble` and pays a shift wage added to wallet
   as a lump sum (e.g. `+8块` shown transiently in `#game-hud` text, wallet jumped 19→27). This is a
   scene-completion payout, not a bug — don't mistake a jump >1 for a wallet-math error.
8. Notebook (`#notebook-button` at bottom-right, screen coords depend on viewport — use
   `getBoundingClientRect()` then real `browser_mouse_click_xy`, JS `.click()` on it did NOT open the
   panel in one earlier attempt): opens `#notebook-panel`, word list in `#notebook-words` as
   `<section><h3>group name</h3><div class="notebook-word state-{known|shaky|met}">hanzi · pinyin · gloss — state</div>...</section>`.
   Two sections seen: scene-specific group (e.g. "面馆") + `已会 · Starter words`.
9. `#export-save` populates `#save-string` (an `<input>`/`<textarea>`, read via `.value`) with a
   base64 JSON blob, e.g. `eyJ2IjoxLCJ3YWxsZXQiOjI3LCJkYXkiOjEsLi4u` → decodes to `{"v":1,"wallet":27,"day":1,...}`.
10. localStorage key `make-it-in-china.save.v1` persists across reload; `#hud-wallet`/`#hud-day` match
    pre-reload after a plain navigate (no special reload button needed).
11. Mobile viewport 390x844: no horizontal scroll (`document.documentElement.scrollWidth === clientWidth`).

## Static preview on 5180
Same app, `vite preview` build served at `http://localhost:5180/` — no HMR. Reachable-click
coordinate is viewport-relative, not fixed: `(870,300)` works at 1280x800, but at the default
1850x966 window the cook is reached at `(1108,600)` instead — always confirm with
`#dialogue-bubble.hidden` after a click+~1.5s wait rather than trusting one fixed coordinate.
Asset loading is inconsistent between full reloads: sometimes GLTF models 404 (HTML returned
instead of JSON) and the scene falls back to grey-box primitives (mannequins/boxes, matches the
5179 grey-box description); other times real Quaternius-style rigged character models + detailed
buildings/table/lamp load fine — same URL, no code change, likely a dev/preview server flakiness
or CDN/asset-path race. When primitives are used, ~14 `console.warn` fallback messages appear
(non-fatal). When real models load, 9 `console.error THREE.GLTFLoader: Couldn't load texture
Textures/colormap.png` appear every time — this is a genuine repeatable runtime error (missing
texture asset in the build), not just a favicon 404.

## Fixed 2026-09-18
- Dialogue bubble off-screen positioning — now clamped; `#dialogue-bubble` fully within viewport
  (verified left=469,right=821,top=256 in 1280x800) and `#reply-options` docked fixed bottom-center
  (bottom≈790/800, horizontally centered exactly). Real `browser_mouse_click_xy` on `.reply-button`
  now advances dialogue — no `dispatchEvent` workaround needed.
- Tokenizer dropping 碗: line "一个杯子，二个碗。" now yields 6 `.word-tap` spans (一/个/杯子/二/个/碗); tapping
  碗 shows `#word-popup` "wǎn · bowl". First-appearance words carry `.new-word` class with
  `text-decoration-line: underline` (computed style confirmed, e.g. 个, 杯子).
- "Duplicate-looking reply options" bug: re-verified 2026-09-18 on 5180, 3 fresh-save runs. The
  "你做几个？" exchange (5th exchange, scene `p1_noodle_dishwasher_01`) now always renders two
  genuinely distinct buttons `一个。one.` / `二个。two.` — text differs, no dupes. All 3 runs drew
  the identical pair though (template values look non-randomized, always cup_count=1/bowl_count=2)
  — data-level fix confirmed for distinctness, but slot variety across sessions is NOT actually
  exercised by current content.
- `#wallet-toast` race re-verified: NOT a bug in the runtime sense — toast shows `-1块` and
  `hidden=false` reliably within ~5-290ms of a wrong-reply click (polled via rAF in the same JS
  tick as the click) and correctly flips to `hidden=true`/empty text by 2.5s. The earlier "empty
  text" observation was a *test-harness* artifact: a separate `browser_evaluate` round-trip after
  the click has enough latency that the toast's own timeout had already fired. Use the
  same-tick-poll technique, not a follow-up round trip, to observe it.
- Scene-completion `+N块` toast: not captured this run (round-trip latency issue as above); would
  need the same same-tick-poll technique wired to the exact click that completes a scene — not yet
  automated, still outstanding.

## CRITICAL ENVIRONMENT BLOCKER (2026-09-18 regression run)
Mid-session, the shared Playwright MCP browser was hijacked by what looks like a **concurrent
automated process** (likely another agent/worker using the same browser instance for asset
sourcing): new tabs kept opening/navigating to itch.io (Quaternius animation packs, KayKit city
kit — an actual zip was downloaded to `.playwright-mcp/`), kenney.nl, hyper3d.ai, and Google/Bing/
DuckDuckGo image-reference searches for terms like "low poly chinese street noodle shop game
artstation" / "toon shaded chinese alley lanterns 3d" — clearly related to sourcing/researching
assets for *this* game, not anything I triggered. It got aggressive enough to hijack the
current/active tab within 1-3s of any action (even a fresh `browser_tabs new` tab), making
multi-step scripted flows (bugs 3-8 below) unreliable/impossible to verify in this run. Confirmed
via: grep of src/, dist/, content/*.json, vite.config.ts for itch.io/kenney/hyper3d/quaternius/
location.href/window.open — zero matches, so this is NOT app code, it's an external process
sharing the browser session. Before the next regression pass, ensure no other worker/agent holds
the Playwright MCP browser concurrently.

## Release-check findings 2026-09-18 (v0.0.1 candidate, static 5180)
- **NEW BUG — spontaneous landlord dialogue on fresh load.** After `localStorage.clear()` +
  reload (confirmed localStorage genuinely empty, day1/wallet20 state), `#dialogue-bubble` opens
  immediately (no click) with `王先生 · 房东` saying `今天做完了。` and a `好 · OK` button, no
  `#reply-options`. Clicking OK dismisses it and the game proceeds normally (cook dialogue reachable
  right after). Reproduced twice (plain reload and `?toon=1` reload). Cosmetic/confusing on first
  boot but not blocking — dismiss via OK before scripting further steps.
- `#hud-objective` DOES now update within a play session (fix vs earlier note): went
  `today: 洗碗 shift at 面馆` → `today: shifts complete` after finishing all of day 1's dialogue
  content (3 chained exchanges/scenes with 陈师傅, ending in `今天做完了。` + `好 · OK`, wallet
  20→46 total across 3 payouts of +8/+9/+10-ish). **NEW BUG**: this same `today: shifts complete`
  string persists into day 2 after sleeping (`#hud-day` correctly flips to `第2天`, wallet -2
  overnight cost 46→44) — objective never resets for the new day, and approaching the cook on day 2
  is a silent no-op (no dialogue, matches the day-1 "exhausted slot" bug but now spans days).
- `#reply-options` hidden/empty confirmed correctly after the final `好 · OK` of the day (`hidden`
  attribute set, 0 children) — the earlier "stale buttons" bug looks fixed.
- Cook dialogue chain observed as one continuous multi-exchange conversation (no separate re-approach
  needed) covering wash-up counting, water/tea serving, and a rice/dishes meal exchange, ending in
  the `今天做完了` line — content is richer than the earlier "exactly 2 scenes" note; that earlier
  finding is superseded.
- Exchange "你做几个？" (asks count of the *first-named* item, e.g. cups) now draws genuinely
  randomized numbers per fresh save: run A → options `二个`/`三个`; run B (separate clear+reload) →
  options `三个`/`一个`. Confirms per-session variety works (earlier note about non-randomized
  cup_count=1/bowl_count=2 was itself a snapshot of one seed, not a hardcoded value).
- Notebook 碗 row: `碗 · wǎn · bowl — known 额外 · bonus` — bonus tag present. Progress line:
  `28 / 150` (N/150 format confirmed).
- `?toon=1` produces **no visible rendering difference** from default — same shading/colors/models,
  same 5 GLTFLoader texture errors. If a distinct toon/cel-shaded pipeline is intended, it does not
  appear to be wired up (or the flag name/param is wrong).
- `#loading` element never observed present at any poll (immediately after reload, or +6s) — either
  it disappears in <0.1s or isn't rendered at all in this build. Not a fail per spec (spec only
  requires it show-then-disappear; can't distinguish "never appeared" from "appeared+vanished
  instantly" without finer polling).
- Consistent 5 `console.error THREE.GLTFLoader: Couldn't load texture Textures/colormap.png` on every
  load in this run (matches prior finding — real models loaded, not grey-box fallback this run).

## New bugs found 2026-09-18 (5180 regression, items 5-8)
- **`#hud-objective` never updates.** Text stays "today: 洗碗 shift at 面馆" through scene1
  completion, scene2 start/completion, and the 3rd (blocked) interaction — same string the whole
  day regardless of which scene is active/done.
- **Silent no-op when a day's action slots are exhausted.** Day 1 supports exactly 2 completed
  scenes with the cook (scene1 `p1_noodle_dishwasher_01` "你好，工作。", scene2 "你好，请。" — the
  water/tea/cup-count scene). Walking up and clicking the cook a 3rd time same day does *nothing*:
  no dialogue, no toast, no HUD change, no console message — confirmed via
  `document.body.innerText` diff before/after the click. Per spec this silent nothing is a FAIL;
  expected a "no more work today" / "come back tomorrow" message.
- **`#reply-options` doesn't hide/clear when `#dialogue-bubble` hides.** After a scene completes
  (bubble `hidden=true`), the last exchange's `.reply-button`s remain in the DOM, visible on
  screen, and presumably still clickable — stale UI left over from the finished scene, easy to
  mistake for a live prompt.
- Player-reach-NPC click coordinate drifts each time the player/NPC actually walk (expected), but
  worth noting for future runs: after finishing a scene, re-approaching the same NPC from a
  standing-adjacent position sometimes requires walking away first and re-clicking near the NPC —
  a click directly on the NPC's mesh while already standing next to it does not re-trigger.

## Known bugs / rough edges (as of 2026-09-18 check)
- **Duplicate-looking reply options** ("你做几个？" both `一个。`) and **`#wallet-toast` empty-text race**
  — NOT re-verified in the 2026-09-18 regression run due to the environment blocker above; scenes.json
  now uses `{cup_count}`/`{bowl_count}` templates for that exchange (data-level fix looks present) but
  runtime confirmation of distinct rendered text, and toast timing/text, is still outstanding — re-run
  once the browser is free of concurrent use.
- `browser_take_screenshot` with a relative `filename` saves to the **project root**
  (`/home/fiazul/Desktop/chinese_immi/<name>.png`), not the scratchpad — copy it out and delete the
  stray file from the project root afterward.

## Day-2 regression re-check 2026-09-18 (static 5180)
- Fresh `localStorage.clear()`+reload: `#dialogue-bubble.hidden===true`, no spontaneous landlord
  popup this run (earlier "landlord on fresh load" bug NOT reproduced here — may be intermittent).
  5 `Couldn't load texture Textures/colormap.png` console errors present every load (real models
  loaded, not grey-box fallback) — same known GLTFLoader texture-path bug, not zero as hoped.
- Reaching the cook: clicking directly on the cook's mannequin sprite at the shop table works
  reliably; clicking open ground several tiles away (e.g. the old `(870,300)` note) did NOT trigger
  a walk-to-NPC or dialogue in this run — camera panned toward the click point but the player
  mannequin barely moved and no interaction fired. Table/NPC screen position shifts a lot between
  camera pans, so re-screenshot and click the mannequin itself each time rather than trusting a
  fixed coordinate.
- Played day-1 scene1 (dishwasher cup/bowl counting, 5 exchanges: 好/不→杯子→碗→好→三个) all correct
  first try: bubble hid, wallet 20→28块 (+8 payout). `#hud-objective` stayed
  `today: 洗碗 shift at 面馆` the whole time (unchanged by scene completion — confirms known bug).
- Sleep (`睡觉`) button: `#hud-day` 第1天→第2天, wallet 28→26块 (-2 overnight), objective text
  reset to identical `today: 洗碗 shift at 面馆` string (NOT "shifts complete", but also not a
  distinct "(review)" variant — just looks like day-1's string reused).
- Day 2, re-approaching the cook (clicking the mannequin) DID start a new dialogue immediately —
  first line `你好，请。` (not a silent no-op this run, contradicts the earlier "silent no-op /
  spans days" bug note — looks fixed, or at least not reproduced with a fresh day-2 approach).
  Played 2 exchanges (好→水和茶) correctly, wallet unchanged at 26块 (no completion payout yet,
  mid-scene).
- Reload mid-conversation (day2, dialogue left open on "你喝水。" exchange): day/wallet persisted
  correctly (第2天/26块) AND the in-progress dialogue bubble resumed exactly where left off
  (same NPC, same line, same reply options) — this is dialogue-state persistence working as
  intended, not the "spontaneous unwanted popup" bug; don't conflate the two. A reload while no
  dialogue is active would be needed to re-check the "no bubble on load" criterion cleanly.

## Selectors quick reference
- HUD: `#game-hud`, `#hud-wallet`, `#hud-day`, `#hud-objective`, `#wallet-toast`
- Dialogue: `#dialogue-bubble`, `.npc-name`, `#dialogue-line`, `.word-tap`, `#word-popup`
- Replies: `#reply-options .reply-button` (pointerup handler)
- Notebook: `#notebook-button`, `#notebook-panel`, `#notebook-words .notebook-word.state-{known|shaky|met}`
- Save: `#save-string`, `#export-save`, `#import-save`; localStorage key `make-it-in-china.save.v1`
