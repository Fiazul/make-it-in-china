# Brief I — Apply review fixes to the v0.1 design package

## Goal
Edit `docs/design/GDD.md`, `TDD.md`, `ART.md`, `ASSETS.csv` and `docs/WATERFALL.md` so every item in the review below is resolved. Design-doc edits only. No source code, no content JSON changes, no commits.

## You are the SOLE executor
You cannot spawn agents or delegate. No shell is available; use file tools. If blocked or ambiguous, end your turn with the question instead of guessing.

## Facts established by the orchestrator (use these, do not re-verify)
- Blender 4.2.3 LTS is installed at `~/.local/bin/blender`. Update WATERFALL.md and any doc stating it is not installed.
- `public/models/character/UAL1_Standard.glb` (Quaternius UAL) contains 1 skin, 1 mesh, 67 nodes and these clips: A_TPose, Crouch_Fwd_Loop, Crouch_Idle_Loop, Dance_Loop, Death01, Driving_Loop, Fixing_Kneeling, Hit_Chest, Hit_Head, Idle_Loop, Idle_Talking_Loop, Idle_Torch_Loop, Interact, Jog_Fwd_Loop, Jump_Land, Jump_Loop, Jump_Start, PickUp_Table, Pistol_*, Punch_*, Push_Loop, Roll, Sitting_Enter, Sitting_Exit, Sitting_Idle_Loop, Sitting_Talking_Loop, Spell_*, Sprint_Loop, Swim_*, Sword_*, Walk_Formal_Loop, Walk_Loop.
  Canonical mapping: idle=Idle_Loop, walk=Walk_Loop, run=Jog_Fwd_Loop, talk=Idle_Talking_Loop, sit=Sitting_Idle_Loop (+Sitting_Enter/Exit), pickup=PickUp_Table, interact=Interact. Missing and therefore Blender-authored (`character_prepare.py`): carry, wave, nod, shake. Set ASSETS.csv status/source per row accordingly (existing for the 6 found, planned/Blender script for the 4 missing).
- Orchestrator decisions:
  - D1: `sys_gate` line is rewritten using dictionary words only; the word list stays at 150. Do not add 说.
  - D2: Player voice = zh-CN-YunxiNeural; cook voice = zh-CN-YunjianNeural. No two speaking characters share a voice within 2 Hz of pitch shift; player voice is unique.
  - D3: Drop the 3,000 KB AAC compatibility reserve. Opus in WebM/Ogg only; Safari 17+ and all Chromium/Firefox decode Opus. Tighten TTS per-file caps to measured reality: 32 kbps mono Opus ≈ 4 KB per second, so a cap column must be duration-derived (≤2 s → 8 KB, ≤3 s → 12 KB, ≤4 s → 16 KB, ≤6 s → 24 KB). Add a totals section to TDD §7 proving the sum of all ASSETS.csv budget_kb + app shell + world content ≤ 25,000 KB, with the numbers.
  - D4: Stage 4 (content + TTS) becomes explicit tickets 4.1–4.n in TDD §10, before 5.1. Content authoring (25 scene scripts, exchanges, consequence branches) is Cursor Sol work using the checker rules; TTS generation (`scripts/tts.mjs` running edge-tts + ffmpeg) is run by the orchestrator, who has a shell. State that split in the tickets and in WATERFALL roles.
  - D5: Split oversized tickets 5.2, 5.4, 6.7, 7.3, 8.1 into ≤1-day pieces each with its own browser-visible acceptance. Move human-tester, physical-device, native-reviewer and Blender-run acceptance items (5.8, 6.8, 7.8, 8.6, 8.7, 8.1's Blender part) into a separate "Owner/orchestrator gates" table so the worker ticket list contains only work a shell-less worker can finish and self-check in a browser.

## Review items to resolve (numbering from the review)
Blocking: 1 (说 in sys_gate → D1), 2 (stage-4 plan → D4), 3 (clips asserted → use clip facts above), 4 (ticket sizing → D5), 5 (budget contradiction → D3).
Non-blocking: 6 (voice overlap → D2), 7 (four character colours need palette roles in ART §2 and TDD material mapping), 8 (add fog near/far distances and density per time slot), 9 (GDD §7: replace bracket-cell tables with ASCII wireframes for every surface), 10 (GDD rent wording: reward credited first, then settleRent, matching src/engine/dialogue.ts), 11 (remove the Draco sentence; state Meshopt only and that no decoder is registered today), 12 (toon ramp [70,165,255] and outline 0x171717 to match src/render/toon.ts, or state the new values as an intentional change in the §1.2 audit), 13 (add coverage margin: at least 10 words scheduled in 4 scenes, update the scene table and arithmetic), 14 (bicycle: name a concrete CC0 source or mark Blender-authored; add a `licence` column to ASSETS.csv so font rows say OFL not owner), 15 (add a waypoint for the residential_delivery trigger at [26,0,2]).

## Constraints
- Keep line budgets: GDD ≤1800, TDD ≤1500, ART ≤700.
- Keep every fixed decision in docs/WATERFALL.md.
- Content rules: faceless, no loans/gambling/alcohol/romance/supernatural, pinyin with tone marks only, only the 150 dictionary words in any Chinese line (check content/phase1/words.json).
- Every changed number must stay consistent across all four docs.

## Acceptance
- Each of the 15 review items has a one-line entry in a new "Review log" section at the end of TDD.md: item → what changed → file:line.
- ASSETS.csv still parses as CSV with a header row; row count and category counts stated in the review log.
- Budget proof table present with a total ≤ 25,000 KB.
- Report: DONE / FILES / REVIEW LOG summary / OPEN QUESTIONS.
