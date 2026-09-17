# Engine API
Import named exports from `src/engine/index.ts`; the engine uses no DOM or renderer.
`createGame({ scenes, world, words? }, opts?)` creates an isolated, deterministic game.
`opts.initialWords` maps word IDs to states; unspecified words start unseen.
Defaults: wallet 20, seed 1, four action slots, food 2, rent 20, grace/decay three days.
Options: `wallet`, `seed`, `actionSlots`, `foodCost`, `rentCost`, `graceDays`, `decayDays`.
`wrongPenalty` defaults to 1 yuan; `'action'` instead spends one action slot.
`start(sceneId)` validates content, checks prerequisites, spends a slot for job/errand/mentor.
`reply(i)` returns correctness; `Reply.correct` is authoritative, `check` is logged only.
Wrong replies cost 1–5 yuan (consequence cost overrides default) or one slot, never both.
Consequences return to the same filled exchange; the second and later misses emit `hint`.
`tapWord(w)` lowers a met word's evidence; `sleep()` requires a completed dialogue.
Sleeping restores slots, applies decay/food, and charges weekly rent or extends soft grace.
`availableScenes()` returns prerequisite-eligible scenes, including consequences.
`state()` returns a detached snapshot, including `dialogue.exchange`, notebook words and economy.
`on(event, cb)` is typed by `GameEvents`, returns unsubscribe; `change` signals committed state.
Events: `sceneStart`, `exchange`, `reply`, `hint`, `word`, `sceneEnd`, `day`, `change`.
`saveJSON()` / exported `loadJSON(json)` use version 1; `exportString()` / `importString(s)` use UTF-8 base64.
Saves retain RNG, bindings, retries and the latest 2000 log entries; import emits `change`.
Typed errors: `ContentError`, `CommandError`, `SaveError`, `UnsupportedSaveVersionError`.
