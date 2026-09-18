# D4 — Fresh-game bubble and dead day 2

## Findings (browser release check)
A. On a brand-new game, before any click, a bubble from 王先生·房东 (landlord) says "今天做完了。"
   with an OK button. Cause: the player spawns adjacent to the landlord, proximity fires the
   "no scene" feedback, and the landlord has no job scenes so the "all done" branch is chosen.
B. Day 2: after sleeping, approaching the cook is a silent no-op and `#hud-objective` stays
   "today: shifts complete". Cause: all 3 job scenes are in `completed`, `nextJob()` returns
   undefined, and the feedback bubble did not fire (only once per approach? or suppressed).

## Fix the categories
1. **Proximity feedback only on player intent.** Feedback (and dialogue start) fires only when the
   player *arrives* at an NPC after a click-to-walk, never on spawn or on save-restore placement.
   Track `lastMoveWasUserInitiated` (set true on canvas pointerup, false after handling). Also: an
   NPC with zero job/errand/mentor scenes in content gets a one-line greeting bubble
   ("你好。" / en "Hello.") at most once per day, never the "done" message. Landlord: greeting.
2. **Repeatable shifts (design doc: "Repeatable jobs are the review sessions").** When every job
   scene for an NPC is completed, `nextJob()` returns the least-recently-completed job scene for
   that NPC whose `requires` are met — but only if it has not been completed *today* (track
   `completedOn[sceneId] = day` in a small UI-side map persisted in localStorage next to the save,
   or derive from `game.events()` sceneEnd entries + day events). Engine already allows starting a
   completed scene (verify in src/engine/store.ts `start`; if it rejects completed scenes, add an
   OPEN QUESTION and stop). Objective text: "today: 洗碗 shift at 面馆 (review)" for repeats;
   "today: rest" when out of slots; never stuck on "shifts complete" once a new day starts.
3. **Feedback must always fire on arrival with no scene.** Whatever suppressed it on day 2 (once-
   flag, stale `nearNpc` not resetting because the player never left the cell) — make the arrival
   event fire on every completed walk, even if the destination cell equals the current cell.

## Scope
In: src/main.ts, src/ui/bubble.ts, src/ui/hud.ts, src/render/scene.ts (arrival event only).
Out: src/engine, content. No commits. You have no shell; orchestrator runs tsc/tests — never stop for that.

## Acceptance
- [ ] Describe exactly what a fresh game shows before the first click (nothing but HUD + hint).
- [ ] Describe day-2 flow: sleep → walk to cook → scene 1 replays as review → wallet increases.
- [ ] List every place `nearNpc`/arrival is set and how intent gating applies.
## Report
DONE / ACCEPTANCE / FILES TOUCHED / OPEN QUESTIONS.
