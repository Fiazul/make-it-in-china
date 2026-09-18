# D2 — UI fixes from browser test

## Goal
Fix three defects a real-browser playthrough found. Read `.claude/playbooks/localhost-5179.md`
for the confirmed selectors and flow.

## Findings → fixes (fix the category, not the instance)
1. **Bubble/replies off-screen.** `#dialogue-bubble` and `#reply-options` rendered at negative x
   (bubble x=-308 in a 1280px viewport) after the camera followed the player to the NPC. Category:
   any DOM element anchored to a projected 3D point can leave the viewport. Fix: clamp the anchored
   bubble inside the viewport with a margin (and flip above/below if needed); replies are NOT
   anchored — dock `#reply-options` to bottom-center of the viewport always (brief D required this).
   Audit every `anchor(...)`/projected-position consumer in src/ui and src/main.ts.
2. **Word taps skip words not in words.json.** Line "一个杯子，二个碗。" exposed 5 `.word-tap`
   targets, none for 碗 (a bonus word). Category: tokenizing by dictionary instead of by the line's
   own `words` tags. Fix: tokenize `line.hanzi` by greedy match against the exchange's `line.words`
   (plus filled slot words) in order; gloss lookup falls back to `words.json` bonus entries (the
   content worker is adding bonus words to words.json with `bonus: true` concurrently — code
   against `Word.bonus`). Same for reply hanzi if replies are tappable.
3. **`#wallet-toast` visible but empty ~1s after a penalty.** Audit the toast: set text before
   unhiding, keep it ≥1.5s, one toast queue (no overlapping toasts clearing each other). Show
   "-1块" on penalties too, not only "+N块" on rewards (engine emits `reply` with cost / `change`).

## Scope
In: src/ui/**, src/main.ts, index.html CSS. Out: src/engine, src/render (except reading
projected positions), content/, package.json. No commits. No new deps.

## Acceptance
- [ ] `npx tsc --noEmit` clean (orchestrator runs it — you have no shell; do not stop for that).
- [ ] Describe the clamping math and the CSS for the docked reply bar (mobile: full width, ≥44px buttons).
- [ ] Tokenizer: state the algorithm and that 碗 in the sample line yields a tap target.
- [ ] Toast: state sequence for a wrong reply (text, timing) and for scene reward.

## Report
DONE / ACCEPTANCE / FILES TOUCHED / OPEN QUESTIONS. Execute to completion, no check-ins.
