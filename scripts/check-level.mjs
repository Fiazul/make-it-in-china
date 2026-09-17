#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const phaseDir = resolve(process.argv[2] ?? "");
if (!process.argv[2]) {
  console.error("Usage: node scripts/check-level.mjs <phase-directory>");
  process.exit(1);
}

const DESIGN_BONUS_WORDS = [
  { hanzi: "碗", pinyin: "wǎn", en: "bowl", hsk: 1, bonus: true }
];

const failures = Array.from({ length: 6 }, () => []);
const warnings = Array.from({ length: 6 }, () => []);

let words;
let scenes;
let world;

try {
  [words, scenes, world] = await Promise.all(
    ["words.json", "scenes.json", "world.json"].map(async (name) =>
      JSON.parse(await readFile(resolve(phaseDir, name), "utf8"))
    )
  );
} catch (error) {
  console.log(`Rule 1 FAIL — content files could not be read: ${error.message}`);
  console.log("Rule 2 FAIL — not checked because content could not be read.");
  console.log("Rule 3 FAIL — not checked because content could not be read.");
  console.log("Rule 4 FAIL — not checked because content could not be read.");
  console.log("Rule 5 FAIL — not checked because content could not be read.");
  console.log("Rule 6 FAIL — not checked because content could not be read.");
  console.log("Summary FAIL — 6 rules failed.");
  process.exit(1);
}

const wordByHanzi = new Map(words.map((word) => [word.hanzi, word]));
const bonusByHanzi = new Map(DESIGN_BONUS_WORDS.map((word) => [word.hanzi, word]));
const lexicon = [...new Set([...wordByHanzi.keys(), ...bonusByHanzi.keys()])]
  .sort((a, b) => [...b].length - [...a].length || a.localeCompare(b, "zh-CN"));
const pools = new Map(world.slotPools.map((pool) => [pool.id, pool]));
const sceneIds = new Set(scenes.map((scene) => scene.id));
let lineCount = 0;
let replyCount = 0;
let signCount = 0;
let slotValueCount = 0;
let maxIntroducedInExchange = 0;

function label(scene, exchange) {
  return `${scene.id}/${exchange.id}`;
}

function allExchangeWords(exchange) {
  return [
    ...(exchange.line?.words ?? []),
    ...(exchange.replies ?? []).flatMap((reply) => reply.words ?? [])
  ];
}

function segment(hanzi) {
  const placeholders = [];
  const withoutSlots = String(hanzi).replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => {
    placeholders.push(name);
    return "";
  });
  const chars = [...withoutSlots];
  const tokens = [];
  const unknown = [];

  for (let index = 0; index < chars.length;) {
    if (!/\p{Script=Han}/u.test(chars[index])) {
      index += 1;
      continue;
    }

    const remainder = chars.slice(index).join("");
    const match = lexicon.find((candidate) => remainder.startsWith(candidate));
    if (match) {
      tokens.push(match);
      index += [...match].length;
    } else {
      unknown.push(chars[index]);
      tokens.push(`<?>${chars[index]}`);
      index += 1;
    }
  }

  return { tokens, unknown, placeholders };
}

function addUnique(bucket, message) {
  if (!bucket.includes(message)) bucket.push(message);
}

function validateSite({
  scene,
  where,
  site,
  kind,
  boundSlots = new Map(),
  rule1Bucket = failures[0]
}) {
  const segmented = segment(site?.hanzi ?? "");
  const sceneIntroduces = new Set(scene?.introduces ?? []);
  const phase = scene?.phase ?? world.phase;
  const tagged = site?.words ?? [];

  for (const token of new Set([...tagged, ...segmented.tokens])) {
    if (token.startsWith("<?>")) continue;
    const word = wordByHanzi.get(token) ?? bonusByHanzi.get(token);
    if (!word) {
      addUnique(rule1Bucket, `${where} tags off-list word "${token}"`);
    } else if (word.hsk > phase && !sceneIntroduces.has(token) && !word.bonus) {
      addUnique(rule1Bucket, `${where} uses HSK ${word.hsk} word "${token}" above phase ${phase}`);
    }
  }
  for (const token of new Set(segmented.unknown)) {
    addUnique(rule1Bucket, `${where} contains off-list word/character "${token}"`);
  }

  if (kind !== "sign" && JSON.stringify(tagged) !== JSON.stringify(segmented.tokens)) {
    failures[2].push(
      `${where} tags [${tagged.join(", ")}] != segmentation [${segmented.tokens.join(", ")}]`
    );
  }

  if (kind !== "sign") {
    const requiredFields = kind === "line"
      ? ["hanzi", "pinyin", "en", "audio"]
      : ["hanzi", "pinyin", "en"];
    for (const field of requiredFields) {
      if (typeof site?.[field] !== "string" || site[field].trim() === "") {
        failures[4].push(`${where} is missing ${field}`);
      }
    }

    if (kind === "line" || kind === "reply") {
      for (const field of ["hanzi", "pinyin", "en"]) {
        const placeholders = [...String(site?.[field] ?? "").matchAll(
          /\{([A-Za-z_][A-Za-z0-9_]*)\}/g
        )].map((match) => match[1]);
        for (const placeholder of new Set(placeholders)) {
          if (!boundSlots.has(placeholder)) {
            failures[5].push(`${where}.${field} has unbound slot "{${placeholder}}"`);
          }
        }
      }
    }
  }
}

for (const scene of scenes) {
  const introducedSoFar = new Set();
  const sceneIntroduces = new Set(scene.introduces ?? []);
  const boundSlots = new Map();

  for (const exchange of scene.exchanges ?? []) {
    lineCount += 1;
    const where = label(scene, exchange);

    for (const [name, poolId] of Object.entries(exchange.slots ?? {})) {
      if (!pools.has(poolId)) {
        failures[5].push(`${where} binds "{${name}}" to unknown slot pool "${poolId}"`);
      } else {
        boundSlots.set(name, poolId);
      }
    }

    validateSite({
      scene,
      where: `${where}/line`,
      site: exchange.line,
      kind: "line",
      boundSlots
    });
    for (const [replyIndex, reply] of (exchange.replies ?? []).entries()) {
      replyCount += 1;
      validateSite({
        scene,
        where: `${where}/reply[${replyIndex}]`,
        site: reply,
        kind: "reply",
        boundSlots
      });
    }

    const wordsHere = new Set(allExchangeWords(exchange));
    const newlyIntroduced = [...wordsHere].filter(
      (word) => sceneIntroduces.has(word) && !introducedSoFar.has(word)
    );
    maxIntroducedInExchange = Math.max(maxIntroducedInExchange, newlyIntroduced.length);
    if (newlyIntroduced.length > 2) {
      failures[1].push(
        `${where} introduces ${newlyIntroduced.length} words: ${newlyIntroduced.join(", ")}`
      );
    }
    newlyIntroduced.forEach((word) => introducedSoFar.add(word));

    const hasWrongReply = (exchange.replies ?? []).some((reply) => reply.correct === false);
    if (hasWrongReply && (!exchange.onWrong || !sceneIds.has(exchange.onWrong))) {
      failures[4].push(`${where} has a wrong reply without a valid onWrong consequence`);
    }
  }

  const missingIntroductions = [...sceneIntroduces].filter(
    (word) => !introducedSoFar.has(word)
  );
  if (missingIntroductions.length > 0) {
    failures[1].push(
      `${scene.id} declares but never introduces: ${missingIntroductions.join(", ")}`
    );
  }
}

for (const pool of world.slotPools ?? []) {
  for (const [valueIndex, value] of (pool.values ?? []).entries()) {
    slotValueCount += 1;
    validateSite({
      scene: { phase: world.phase, introduces: [] },
      where: `world/slotPool[${pool.id}]/value[${valueIndex}]`,
      site: value,
      kind: "slot-value"
    });
  }
}

for (const location of world.locations ?? []) {
  for (const [signIndex, sign] of (location.signs ?? []).entries()) {
    signCount += 1;
    validateSite({
      scene: { phase: world.phase, introduces: [] },
      where: `world/location[${location.id}]/sign[${signIndex}]`,
      site: { hanzi: sign },
      kind: "sign",
      rule1Bucket: warnings[0]
    });
  }
}

const regularScenes = scenes.filter((scene) => scene.kind !== "consequence");
const coverage = new Map(words.map((word) => [word.hanzi, new Set()]));
for (const scene of regularScenes) {
  const seen = new Set(
    (scene.exchanges ?? []).flatMap((exchange) => allExchangeWords(exchange))
  );
  for (const word of seen) {
    coverage.get(word)?.add(scene.id);
  }
}
const undercovered = [...coverage].filter(([, ids]) => ids.size < 3);
if (undercovered.length > 0) {
  const message =
    `${undercovered.length}/${words.length} phase-list words appear in fewer than 3 ` +
    `non-consequence scenes`;
  if (scenes.length < 20) {
    warnings[3].push(
      `${message}; scenes.json has ${scenes.length} scenes (<20), so rule 4 is advisory`
    );
  } else {
    failures[3].push(message);
  }
}

const ruleMessages = [
  `all ${lineCount + replyCount + slotValueCount} dialogue and slot-value sites use phase-appropriate words; ${signCount} signs checked`,
  `no exchange introduces more than 2 new words (maximum ${maxIntroducedInExchange})`,
  `all ${lineCount + replyCount + slotValueCount} line, reply, and slot-value word tags match longest-match segmentation`,
  `all ${words.length} phase-list words appear in at least 3 non-consequence scenes`,
  `all ${lineCount} lines have hanzi, pinyin, English, and audio; all ${replyCount} replies and ${slotValueCount} slot values have hanzi, pinyin, and English`,
  `all placeholders in lines and replies have valid scene-scoped bindings`
];

for (let index = 0; index < 6; index += 1) {
  const ruleNumber = index + 1;
  if (failures[index].length > 0) {
    console.log(`Rule ${ruleNumber} FAIL — ${failures[index].join("; ")}`);
  } else if (warnings[index].length > 0) {
    console.log(`Rule ${ruleNumber} WARN — ${warnings[index].join("; ")}`);
  } else {
    console.log(`Rule ${ruleNumber} PASS — ${ruleMessages[index]}.`);
  }
}

const failureCount = failures.filter((items) => items.length > 0).length;
const warningCount = warnings.filter((items) => items.length > 0).length;
if (failureCount > 0) {
  console.log(
    `Summary FAIL — ${failureCount} rule${failureCount === 1 ? "" : "s"} failed, ` +
    `${warningCount} warning${warningCount === 1 ? "" : "s"}.`
  );
  process.exit(1);
}

console.log(
  `Summary PASS — 0 failures, ${warningCount} warning${warningCount === 1 ? "" : "s"}.`
);
