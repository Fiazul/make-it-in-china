# Make It in China

Browser game in three.js that teaches HSK Mandarin by making the player earn a living in it. Working title.

## Status

**v0.0.2 slice** — third-person district with movement, follow camera, spoken Mandarin dialogue, learner notebook, and eight buildings with DOM signs.

## Quick Start

```bash
npm install
npm run dev       # Open the URL Vite prints
npm test
npm run check:content
npm run build
npm run e2e:mobile   # Pixel 7 touch script; add playwright, then preview at BASE_URL (default http://localhost:4174)
```

Optional: the world already uses toon shading and outlines. `?toon=1` is no longer required.

For content authoring, open `/preview.html` from the development server. The
preview lists stable content sites, strict issues, exchange novelty, and HSK1
coverage. Run `npm run check:content:strict` for the matching command-line gate.

## How to Play

- Start at the title screen with New game, or Continue when a local save exists.
- WASD or arrow keys walk; hold Shift to run. On a phone, use the left joystick plus Run.
- Right-drag (or drag the open street on a phone) orbits the camera.
- Walk up to an NPC, face them, and press E or Talk to start the existing dialogue.
- NPC lines play automatically. Use Replay to hear a line again and Pinyin to reveal pronunciation.
- Hover a reply to preview it. On touch screens, the first tap previews and the second tap says it.
- Use 1–4 to select a reply, then Enter or Say selected reply to commit it.
- Tap any dialogue word for pinyin, a gloss, and its pronunciation.
- Wrong replies cost a yuan and show a consequence; you never lose the game.
- Notebook: Tab or Book. Filter words by learner state or first-heard location, then play word and first-seen sentence audio.
- Pause: Escape or Menu. Help, settings, credits, save export/import, and the title screen are available there.
- Settings persist speech volume, mute, default pinyin visibility, and text size on this device.
- End day opens a sleep confirmation showing unused slots and food cost.
- Use the HUD speaker button to mute or unmute speech. Mute and volume settings persist after reload.

## Documentation

See `docs/design-doc.pdf` for the full game specification, `docs/PLAN.md` for the build plan,
`docs/reference-videos.md` for visual sources, and `content/phase1/scene-list.md` for the curriculum.

## Licence and Credits

See `docs/CREDITS.md`.
