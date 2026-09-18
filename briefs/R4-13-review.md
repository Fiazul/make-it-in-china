# Review — stage-4 tickets 4.1 and 4.3 (read-only)

Review the uncommitted work for two briefs: `briefs/S4-1-schema-checker-preview.md` (files: src/content/types.ts, scripts/check-level.mjs, scripts/check-level-rules.mjs, src/preview/*, preview.html, vite.config.ts, tests/check-level-strict.test.ts) and `briefs/S4-3-tts-script.md` (files: scripts/tts.mjs, scripts/tts-inventory.mjs, content/phase1/voices.json, tests/tts-inventory.test.ts). Ignore content/phase1/scenes.json (another worker is mid-edit) and the failing test tests/engine/content.test.ts that depends on it. Design authority: docs/design/TDD.md §1.1, §6.1, §9.2.

You are the SOLE executor; no delegation; change no files; no shell (read files only).

Orchestrator gate results you may rely on: tsc clean; 129/130 tests pass (the one failure is the content-in-progress test); `check:content` legacy output unchanged; strict mode reports 292 FAILs (134 rule 4 coverage, 151 rule 5 word audio, 3 rule 2, 2 rule 10, 2 rule 14); build emits both entries; `tts.mjs --only p1_noodle_dishwasher_01` produced 165 clips, ffprobe durations sane; `--validate` fails only on not-yet-generated IDs.

Check, with file:line evidence, judged against each brief's acceptance criteria and the TDD:
1. Strict rules 1,2,3,4,5,6,7,10,11,14 each implemented per TDD §9.2 strict column; list rules that are partial or misread. In particular: rule 2 counts eligible slot-pool alternatives as unseen (S01 e4 flags 五…十) — is that the TDD intent, and does the TDD's "eligible" alternative rule (wrong alternatives pair 1↔2, 3↔4...) mean only 2 alternatives count, not the whole pool?
2. Legacy checker behaviour truly unchanged; the shared rules module works under plain node and in Vite.
3. Preview page: DOM only, no three.js/engine import violations, correct blocking behaviour, filters, coverage table.
4. tts.mjs: spawn with arg arrays only, no shell strings; caching by hash correct; concurrency bound; manifest shape exactly TDD §6.1; variant `byBinding` keys match TDD table; speaker resolution (NPC line → NPC voice, reply → player, hint → NPC, word → system); voices.json values match docs/design/ART.md §4 table exactly (voice, rate, pitch per character).
5. Rule-8 validator: caps 8/12/16/24 KB at ≤2/3/4/6 s, duration 0.25–6 s, mono 48 kHz, stale-file detection.
6. Types: all new fields optional and named exactly per TDD §1.1.
7. Anything that will bite stage 5–7 workers (API shape, ID conventions).

Report ≤150 lines: VERDICT (APPROVE / APPROVE WITH FIXES / REJECT); BLOCKING numbered with file:line; NON-BLOCKING; CHECKED / NOT CHECKED; per-item table 1–7.
