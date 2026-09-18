# One-shot: make the game fully playable on an Android phone

## Goal
On a real Android phone (Chrome), the live build https://fiazul.github.io/make-it-in-china/ is currently uncontrollable: the owner reports "there is literally no way to control it in phone". Fix the entire mobile control path in one pass so that a phone player can: start from the title screen, move with the on-screen joystick, run, turn the camera by dragging the free area, press Talk to open dialogue, tap replies (first tap previews speech, second selects), hear audio after the first touch, open the notebook and menus, and never scroll/zoom the page. Then verify it yourself with real touch events, not mouse emulation.

## Repo
/home/fiazul/Desktop/chinese_immi — TypeScript strict, Vite 7, three.js 0.180, DOM UI over a canvas. Key files: `src/render/input.ts` (unified intent: keyboard, touch joystick `#joystick-base/#joystick-thumb`, `#touch-run`, `#touch-talk`, gamepad; uses pointer events on `window`), `src/render/scene.ts` (loop, camera drag), `src/render/camera.ts`, `src/style.css` (`#touch-controls` visibility media query around line 168–230 and the phone bottom-sheet block near 1315–1345), `index.html` (viewport meta, `canvas { touch-action:none }`), `src/ui/shell.ts` (title screen / modals), `src/ui/bubble.ts` (reply preview vs select on touch), `src/audio/manager.ts` (`unlock()` on first gesture), `src/main.ts` glue. Read `src/render/README.md`, `src/ui/README.md`, `src/audio/README.md`, and `.claude/playbooks/localhost-5179.md` (selectors; note earlier "phone" checks used Playwright mouse events at a phone viewport, which is why this was never caught).

## Likely defect classes to audit (fix every instance, not one)
- Touch controls hidden or non-interactive: media query keyed on `(hover:hover) and (pointer:fine)` vs `min-width`; `#touch-controls` `pointer-events:none` with children not re-enabled; controls rendered before the title screen and covered by it or by the bottom sheet; z-index vs canvas.
- Pointer handling: `pointerdown` on `window` racing with the canvas orbit drag; no `setPointerCapture`; no `touch-action: none` on the joystick/buttons themselves; `preventDefault` missing so the page scrolls/zooms; multi-touch (joystick + Run simultaneously) not tracked per `pointerId`; `pointercancel` on Chrome Android when the browser takes over the gesture.
- Viewport: missing `viewport-fit=cover`/`user-scalable=no`, 100vh vs `dvh`, safe-area insets, iOS/Android address-bar resize not handled → controls off-screen.
- Audio unlock only on `keydown`/`pointerdown` on canvas, not on the first touch on a DOM button.
- Bubble on phone: replies need tap-to-preview then tap-to-select; hover states don't exist; ensure a second tap on the same reply selects.
- Performance on phone: DPR clamp 1.0 and 30 fps budget path actually engaged (`matchMedia`/`navigator.maxTouchPoints`), shadows off, crowd reduced.

## Constraints
Do not change gameplay/engine behaviour (`src/engine`) or content. Keep desktop controls working (WASD, Shift, E, Tab, right-drag orbit). No new runtime dependencies. Comments near zero. Do not commit.

## Verification you must run
- `npx tsc --noEmit`, `npm test`, `npm run build`.
- Playwright with REAL touch: use `npx playwright` (install browsers if needed with `npx playwright install chromium`) and a device descriptor (`devices['Pixel 7']`, `hasTouch: true`, `isMobile: true`) against `npx vite preview --port 4174` of your build. Script: load, tap "New game", wait, dispatch touch sequences on the joystick (touchstart/move/end via `page.touchscreen` or CDP `Input.dispatchTouchEvent`), assert `window.__debug.position()` changes; hold Run + joystick simultaneously and assert speed; single-finger drag on the free canvas area and assert camera yaw changes (expose or read via `__debug` if needed, adding a `yaw()` accessor is fine); tap `#touch-talk` near the landlord (use `__debug.teleport`) and assert a `.opus` request and `window.__audioState.contextState === 'running'`; tap a reply twice and assert the exchange advanced; assert `document.documentElement.scrollWidth === clientWidth` and no page scroll after gestures; measure fps. Save the script as `tests/e2e/mobile-touch.spec.ts` (or `.mjs` runnable with `node`) and its screenshots to `docs/screenshots/mobile-*.png`.
- Paste the last lines of each gate and the touch script output in your report.

## Report
DONE / root causes found (one line each, file:line) / what changed / touch verification output / anything a real device could still do differently / OPEN QUESTIONS.
