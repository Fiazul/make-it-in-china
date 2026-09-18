# Content quality review — all 25 Phase-1 scenes (read-only)

## Goal
Native-level review of every Mandarin string in `content/phase1/scenes.json` (25 curriculum scenes plus their consequence scenes) and `content/phase1/world.json` slot pools, for an adult self-learner game where every line is spoken aloud by TTS and the player hears it before reading it. Design authority: `docs/design/GDD.md` §5.2–5.3 (dialogue and hidden repetition), §3 (cast personalities), `docs/design/TDD.md` §9.2 rule 11 ("do not pad unnatural repetition; native naturalness"), `content/phase1/scene-list.md` (which words each scene introduces). Dictionary: `content/phase1/words.json` (150 HSK1 words + 碗). You may not change files; no shell.

## Known failure example (find every instance of the class)
`p1_buy_fruit_01_e2` line: 上午我坐出租车来，中午他开出租车；飞机在后面。现在我买水果，钱在这。 — 7 s long, stitches unrelated vocabulary to hit coverage, nobody at a fruit stall says this. The class: coverage-padding sentences, semicolon-chained clauses, lines > ~14 syllables / ~6 s at slow speech, NPC saying things that make no situational sense, replies that are not something a person would say.

## Check every line, reply, hint, consequence line and pool value for
1. Naturalness: would this NPC say this, here, to a newcomer? Register per cast sheet (cook gruff-short, landlord practical, mentor warm, customers casual).
2. Length: line ≤ 14 syllables (~5 s at -10% rate); hints shorter than their line; replies ≤ 6 syllables unless a count/echo demands more.
3. Grammar and collocation errors within HSK1 vocabulary (e.g. 会汉语 ok; 读多少本 questionable; 二个 vs 两个 — note 两 is not in the list, so 二个 is a known compromise: flag only where it sounds worst).
4. Comprehension design: does the reply choice actually test the introduced word's meaning, are wrong options plausible but clearly wrong once the word is understood, are the two spoken reply options distinguishable by ear?
5. Situational logic across the scene: props/actions referenced exist in the location (GDD §2), counts and objects consistent, consequence branches show a visible mix-up.
6. Content rules: no faces, no loans/interest/gambling/alcohol/romance/supernatural; pinyin tone marks only and correct (check every pinyin against the hanzi, including tone sandhi conventions used consistently: write 不 and 一 with their dictionary tones unless the file consistently marks sandhi; report which convention it uses and any inconsistencies).

## Output (≤250 lines, as your final message)
- VERDICT per scene: OK / REWRITE (count of sites).
- A rewrite table: `siteId | current hanzi | problem class | proposed replacement hanzi + pinyin + en` using only dictionary words, keeping the exchange's `introduces` words present and ≤2 new words per exchange. Propose replacements for every REWRITE site; the fixer applies them verbatim.
- Pinyin error list: siteId | wrong | correct.
- Comprehension-design issues: siteId | issue | fix.
- Top 5 systemic problems across authors, one line each.
