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

## Known bugs / rough edges (as of 2026-09-18 check)
- **Dialogue bubble can render off-screen.** After the click at (870,300) triggered dialogue, both
  `#dialogue-bubble` and `#reply-options` had negative `left`/`x` in `getBoundingClientRect()`
  (e.g. bubble x=-308, reply x=-356 in a 1280-wide viewport) — most of the panel was clipped off the
  left edge, only a ~90px sliver on-screen. Looked like the bubble anchors to the player's projected
  screen position without clamping to viewport bounds, and the post-dialogue camera zoom pushes the
  character off-frame. A real tester might not be able to click reply buttons at all in this state.
- **Duplicate-looking reply options.** In the "你做几个？" exchange, both reply buttons render as
  `一个。` with only the English gloss differing by capitalization (`one.` vs `One.`), no other visual
  or DOM distinction (no data attributes). Tester cannot tell which is "correct" from the UI.
- **`#wallet-toast` fires with empty text.** After the -1块 penalty, `#wallet-toast` had `hidden=false`
  but empty `innerHTML`/`textContent` by the time it was queried (~1s after the click) — likely a
  fade-out timing race, not confirmed as a real bug, just note if reproducing.
- Word-tap tokenization may skip a character: for line `一个杯子，二个碗。` only 5 `.word-tap` elements were
  found (一/个/杯子/二/个) — `碗` had no tappable word. Worth re-checking other lines.
- `browser_take_screenshot` with a relative `filename` saves to the **project root**
  (`/home/fiazul/Desktop/chinese_immi/<name>.png`), not the scratchpad — copy it out and delete the
  stray file from the project root afterward.

## Selectors quick reference
- HUD: `#game-hud`, `#hud-wallet`, `#hud-day`, `#hud-objective`, `#wallet-toast`
- Dialogue: `#dialogue-bubble`, `.npc-name`, `#dialogue-line`, `.word-tap`, `#word-popup`
- Replies: `#reply-options .reply-button` (pointerup handler)
- Notebook: `#notebook-button`, `#notebook-panel`, `#notebook-words .notebook-word.state-{known|shaky|met}`
- Save: `#save-string`, `#export-save`, `#import-save`; localStorage key `make-it-in-china.save.v1`
