# B — Phase 1 content: HSK 1 words, M0 scene list, 3 vertical-slice scenes, level checker

## Goal
`content/phase1/` holds a correct HSK 2.0 level-1 word list (150 words) as words.json, a
scene-list.md covering all 150 words in ~25 scenes (each word in ≥3 scenes), a world.json for the
one street, and scenes.json containing the 3 noodle-shop dishwasher scenes for the vertical slice.
`node scripts/check-level.mjs content/phase1` implements the 5 checker rules in docs/PLAN.md, and
passes on the 3 scenes (rule 4 "≥3 scenes per word" reports as WARN not FAIL while scenes.json
has fewer than 20 scenes — say so in output).

## Context
- Repo/dir: this directory. Read first: docs/PLAN.md (all), docs/design-doc.txt lines 29–100
  (loop + principles), 192–225 (Phase 1 scope), 235–298 (learning system), 467–526 (content
  format + checker), 102–142 (content constraints — hard rules).
- Another worker concurrently owns package.json, src/**, vite config. Do not touch them. Your
  script must be zero-dependency Node 20 ESM (`.mjs`), runnable before `npm install`.
- Content schema = the TypeScript contract in docs/PLAN.md "Contract" section. JSON must conform.

## Scope
- In: content/phase1/{words.json,scenes.json,world.json,scene-list.md}, scripts/check-level.mjs,
  docs/CREDITS.md line for the HSK list source.
- Out: everything else. No commits. No npm packages.

## Constraints
- HSK 2.0 level 1 is 150 words. Use the standard Hanban list from memory but VERIFY the count
  and spot-check against your knowledge; if unsure about an entry, flag it in OPEN QUESTIONS
  rather than silently substituting. Pinyin with tone marks (nǐ hǎo), never numbers.
- Bonus (off-list) words allowed only when the design doc names them (碗, 老板, 进货) or a scene
  truly needs one; mark `"bonus": true` and keep total bonus ≤ 10 in the scene list.
- Each scene: 4–6 exchanges, ≤2 new words per exchange, ~6 new words per scene, ~90% known
  words. Wrong replies are plausible (same word class). Every wrong reply points to a
  consequence via `onWrong` (write the consequence scenes too: kind "consequence", short, 1–2
  exchanges, small `cost`).
- Vertical slice scenes: p1_noodle_dishwasher_01..03 (first shift: cups/bowls counting; second:
  drinks; third: 有/没有 + 不). Cook NPC. Use slots for numbers (`number_1_10` pool in
  world.json). Requires for scene 01 = the ~10 words the arrival tutorial gives (list them in
  scene-list.md as scene 00 "arrival").
- Hard content rules: no faces mentioned, no alcohol (tea/food only), no loans/gambling/romance/
  supernatural. 信用卡 stays out of Phase 1.
- Segmenter for rule 3: longest-match against words.json hanzi (+bonus), skipping punctuation
  and `{slot}` placeholders. Output clear per-rule PASS/WARN/FAIL lines and exit 1 on FAIL.

## Acceptance criteria
- [ ] `node -e "console.log(JSON.parse(require('fs').readFileSync('content/phase1/words.json')).length)"` prints 150 (plus bonus words if any, counted separately in your report).
- [ ] `node scripts/check-level.mjs content/phase1` exits 0; paste full output.
- [ ] Break it on purpose (add an HSK-3 word to a line) → exits 1 with rule 1 named; restore; paste both outputs.
- [ ] scene-list.md: table of ~25 scenes (id, location, npc, kind, known words used count, new words) + a coverage table: every one of 150 words → scenes count ≥ 3.
- [ ] scenes.json: 3 job scenes + their consequence scenes, all conforming to the contract types.

## Report format
DONE / ACCEPTANCE (each criterion pass|fail) / VERIFICATION (commands + summarized output) /
FILES TOUCHED (with line ranges) / OPEN QUESTIONS.
Ambiguity or blocker: stop and ask under OPEN QUESTIONS. Never guess a decision that belongs to
the orchestrator.
