# Stage 6b — Dialogue, HUD and screens redesign (DOM UI)

## Goal
Replace the v0.0.1 utility UI with the screens and dialogue presentation in `docs/design/GDD.md` §7 (surface catalogue with ASCII wireframes for desktop and phone) and `docs/design/ART.md` §3 (UI skin: tokens, type, spacing, bubble anatomy). Keep all existing behaviour (speech sequencing in `src/ui/bubble.ts`, notebook audio, mute, save/import, HUD toasts) working. Files: `src/ui/*`, `src/style.css` or the UI stylesheet in use, `index.html`, minimal `src/main.ts` glue. Read `src/ui/README.md`, `src/audio/README.md`, existing UI files first.

## Scope
1. Design tokens as CSS variables from ART §3 (colours, radii, type scale, shadows); Noto Sans SC via Google Fonts link (already allowed) with a system fallback; DOM text crisp at 200% zoom.
2. Dialogue bubble: anchored above the NPC head as now, redesigned per wireframe: NPC name chip, spoken-first reveal (hanzi large, pinyin toggle, English gloss small), replay button, speaking indicator, reply cards with hover/tap preview state vs select state, hint card after second miss, new-word chips tappable for word audio.
3. HUD: day + slot indicator, wallet with animated change, objective line, E/Talk prompt, speaker/mute, phone controls unchanged.
4. Screens: title screen (New game / Continue / Settings / Credits / Help), pause/settings sheet (speech volume, mute, pinyin default on/off, text size, reset save), notebook redesign (word list with state colours, filter by state/location, per-word audio, first-seen sentence), help overlay (controls, desktop and phone), credits (from `docs/CREDITS.md` content), end-of-day sleep card, rent-due toast.
5. Accessibility: keyboard focus order and visible focus rings, `aria-live` for toasts, modal focus trap, reduced-motion respect.
6. Phone layout at 390×844 and 360×740: nothing overlaps; bubble docks to bottom sheet when the NPC is off-screen.
7. Update `src/ui/README.md`, `README.md` (screens/controls).

## Scope out
Renderer, audio manager internals, engine, content.

## You are the SOLE executor
No spawning/delegation. NO shell. Another worker is concurrently editing `src/render/*` only; do not touch those files. Keep `src/main.ts` edits minimal and marked `// ui`. Orchestrator runs tsc/tests/build and a browser smoke with screenshots at desktop and phone sizes, then resumes you.

## Acceptance (browser)
- Title screen on first load; Continue when a save exists; settings persist.
- Bubble matches wireframe; speech sequencing behaviour identical to before (line auto-plays, hover/tap preview, replay, hint).
- Notebook, help, credits, pause reachable via keyboard and touch; focus trapped in modals.
- No overlaps at 390×844 and 360×740; no console errors; tsc clean; tests pass.
- Report: DONE / FILES / screens list with how to open each / OPEN QUESTIONS.
