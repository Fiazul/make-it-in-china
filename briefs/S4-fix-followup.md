Gates on your fix pass: tsc clean, 140/140 tests, legacy check unchanged, strict rule 5 now PASS, S01/S02 rule 2 clean. Two follow-ups, same constraints (no shell, do not touch content/phase1/scenes.json, which another worker is editing):

1. Rule 2 attribution for guided consequences: `p1_ask_time_01/e3/line` is charged with the 9 words that belong to the guided consequence scene `p1_wrong_bus_01` (entered via `exchange.guidedConsequence`). The guided scene is a curriculum scene with its own `introduces` and its own exchanges; evaluate its novelty per its own exchanges, in route order (after S10 e3's correct reply, before S10 e4), and never fold its words into the parent exchange. Add a strict test fixture for a guidedConsequence route. (Rule 14 already correctly flags that S11's cost must be 0; the content fix is scheduled separately.)

2. TTS size caps: measured Opus 32 kbps mono output runs 1–3% over the 4 KB/s-derived caps on lines near a boundary (e.g. 16122 bytes for a 3.9 s line). In `scripts/tts.mjs` (generation check and `--validate`) and `scripts/check-level-rules.mjs` if it mirrors the cap, apply a 5% tolerance: cap = ceil(base × 1.05). Record the tolerance in `docs/design/TDD.md` §6.1 step 7 and §9.2 rule 8 in one sentence each. Update `scripts/README.md`.

Report DONE / FILES / OPEN QUESTIONS.
