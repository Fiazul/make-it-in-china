# Brief H — Review the v0.1 design package (read-only)

## Goal
Independent review of the design package Astra produced in `docs/design/` (GDD.md, TDD.md, ART.md, ASSETS.csv) against its brief `briefs/G-astra-design.md` and the fixed decisions in `docs/WATERFALL.md`. The owner will sign off (or not) on the GDD based on your report. Be a hard reviewer; a bare "looks good" is a failed review.

## You are the SOLE executor
You cannot spawn agents or delegate. Do the work yourself, to completion. Read-only: change no files.

## What to check (give a verdict per item, with file:line evidence)
1. Brief compliance: every section the brief demands exists in the right doc, with line budgets respected (GDD ≤1800, TDD ≤1500, ART ≤700).
2. Fixed decisions honored: third-person follow camera with exponential smoothing; WASD+Shift+E+Tab and touch joystick; skeletal AnimationMixer clip set (idle/walk/run/talk/carry/wave/nod/shake/sit); edge-tts zh-CN voices and spoken replies; faceless characters; GLB+Draco; ≤25 MB total; 60/30 fps targets; adult self-learners. Flag any doc that reopens or silently contradicts one.
3. Content rules: no faces, no loans/interest/gambling/alcohol/romance/supernatural, pinyin with tone marks only, HSK-1 vocabulary scope (150 words). Grep for violations.
4. Numeric completeness: every gameplay parameter is a number (speeds, camera distances/heights/smoothing constants, budgets, wages, rent, slot counts). List parameters left vague.
5. Engine fit: TDD claims about the existing engine (`src/engine`, `content/phase1`, save format, level checker rules in `scripts/check-level.mjs`) must match the code. Spot-check at least 8 claims against the source; list mismatches. Astra says it made "explicit engine/content corrections" — find them and judge whether each is justified.
6. Buildability by Cursor workers who have NO shell: the 32 tickets in TDD §10. Are they small enough (each ≤ ~1 day for one worker), ordered by dependency, with browser-visible acceptance? Which tickets are too big or ambiguous? Which acceptance criteria cannot be checked without a shell or a device?
7. Asset list sanity: ASSETS.csv has 1041 rows (873 audio). Is the audio row count derivable from the content (words × voices + lines)? Do budget_kb totals stay ≤25 MB? Are there rows with status/source inconsistencies?
8. Internal consistency across the four docs: names, IDs, counts (locations, NPCs, scenes, clips) agree.
9. Top risks to shipping a playable v0.1 given this plan: max 5, ranked.

## Report format (write it as your final message)
- VERDICT: APPROVE / APPROVE WITH FIXES / REJECT, one sentence why.
- BLOCKING (must fix before owner sign-off): numbered list, file:line, what, why.
- NON-BLOCKING: numbered list.
- CHECKED vs NOT CHECKED: explicit lists.
- Per-item verdict table for items 1–9 above.
Keep the report under 200 lines. Do not paste doc content back.
