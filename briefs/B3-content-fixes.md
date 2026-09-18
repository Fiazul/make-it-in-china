# B3 — Content fixes from browser test

## Goal
Bonus words become first-class dictionary entries, and no exchange can show two identical reply
options. Checker enforces both.

## Findings → fixes (category, not instance)
1. **Bonus words missing from words.json.** 碗 is allowlisted in the checker but absent from
   words.json, so the UI has no gloss/pinyin for it and cannot make it tappable. Fix: every bonus
   word used anywhere in content (碗 now; 老板, 进货 later) lives in words.json with
   `"bonus": true, "hsk": 1` (hsk = phase it's taught in). The checker's "150 phase-list words" count
   must be over `!bonus` entries; remove the hardcoded allowlist. Update scene-list.md bonus row.
2. **Duplicate reply options.** In exchange p1_noodle_dishwasher_01_e5 the correct reply
   "{cup_count}个。" filled to 一个 and the distractor is hardcoded "一个。" — identical buttons.
   Category: a distractor that can equal the filled correct reply. Fix in content: every distractor
   in an exchange with a slot-filled correct reply must itself use a DIFFERENT slot from the same
   pool (e.g. "{bowl_count}个。") so the engine can guarantee distinctness, OR be a different word
   class entirely. Audit all 6 scenes. Add checker rule 7: within an exchange, no two replies may
   have identical hanzi after placeholder normalization, and a hardcoded distractor may not be a
   possible value of any slot used in a sibling reply (compare against the pool values).
3. Also note for the engine (already briefed separately): the engine will re-pick slot values if
   two replies fill identically. Your job is to make that rarely needed.

## Scope
In: content/phase1/**, scripts/check-level.mjs. Out: everything else. No commits.

## Acceptance (orchestrator runs node; you have no shell — never stop for it)
- [ ] `node scripts/check-level.mjs content/phase1` PASS; report shows 150 phase words + N bonus.
- [ ] Break test described: duplicate reply → rule 7 FAIL.
- [ ] Per-exchange audit table: exchange id → replies → distinct-guarantee (slot / word class).

## Report
DONE / ACCEPTANCE / FILES TOUCHED / OPEN QUESTIONS.
