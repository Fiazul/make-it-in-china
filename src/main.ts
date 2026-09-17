import scenesSource from '../content/phase1/scenes.json?raw';
import wordsSource from '../content/phase1/words.json?raw';
import worldSource from '../content/phase1/world.json?raw';
import type { Scene, Word, World } from './content/types';
import { createGame } from './engine';
import { startScene } from './render/scene';
import { createBubble } from './ui/bubble';
import { createHud } from './ui/hud';
import { createNotebook } from './ui/notebook';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing #app root');

const scenes = JSON.parse(scenesSource) as Scene[];
const words = JSON.parse(wordsSource) as Word[];
const world = JSON.parse(worldSource) as World;
const jobs = scenes.filter(scene => scene.kind === 'job');
const starterWords = Object.fromEntries((jobs[0]?.requires ?? []).map(word => [word, 'met' as const]));
const game = createGame({ scenes, words, world }, { initialWords: starterWords });
const SAVE_KEY = 'make-it-in-china.save.v1';
let saved: string | null = null;
try { saved = localStorage.getItem(SAVE_KEY); } catch { /* storage unavailable */ }
if (saved) {
  try {
    game.importString(saved);
  } catch {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* storage unavailable */ }
  }
}

let nearNpc: string | null = null;
let activeNpcId: string | null = null;
const newWords = new Set<string>();
const completed = () => new Set(
  game.state().events.flatMap(event => event.type === 'sceneEnd' ? [event.data.sceneId] : []),
);
const nextJob = (npcId: string) => {
  const done = completed();
  const available = new Set(game.availableScenes().map(scene => scene.id));
  return jobs.find(scene => scene.npc === npcId && !done.has(scene.id) && available.has(scene.id));
};
const objective = () => {
  const next = jobs.find(scene => !completed().has(scene.id));
  return next ? `today: 洗碗 shift at 面馆` : 'today: shifts complete';
};

const hud = createHud(root);
const notebook = createNotebook(
  root,
  words,
  world.locations,
  () => game.exportString(),
  save => {
    if (!save) throw new Error('Paste a save string first.');
    game.importString(save);
    restoreNewWords();
    render();
  },
);
const bubble = createBubble(
  root,
  words,
  index => {
    newWords.clear();
    game.reply(index);
    maybeStartDialogue();
  },
  word => game.tapWord(word.hanzi),
);

function restoreNewWords(): void {
  newWords.clear();
  const state = game.state();
  if (!state.dialogue) return;
  for (const word of state.dialogue.exchange.line.words) {
    if (state.words[word]?.firstSeen?.audio === state.dialogue.exchange.line.audio) newWords.add(word);
  }
}

function render(): void {
  const state = game.state();
  const scene = state.dialogue ? scenes.find(item => item.id === state.dialogue!.sceneId) : undefined;
  const npc = scene ? world.npcs.find(item => item.id === scene.npc) : undefined;
  activeNpcId = npc?.id ?? null;
  bubble.render(state.dialogue, npc, newWords);
  hud.render(state, objective());
  notebook.render(state);
}

function maybeStartDialogue(): void {
  if (!nearNpc || game.state().dialogue) return;
  const scene = nextJob(nearNpc);
  if (!scene) return;
  newWords.clear();
  game.start(scene.id);
}

game.on('word', event => {
  if (event.reason === 'seen') newWords.add(event.word);
});
game.on('sceneEnd', event => hud.reward(event.reward));
game.on('change', () => {
  try {
    localStorage.setItem(SAVE_KEY, game.exportString());
  } catch {
    // The loop remains playable when storage is disabled or full.
  }
  render();
});

restoreNewWords();
render();
startScene(root, world, {
  onNearNpc(id: string | null): void {
    nearNpc = id;
    maybeStartDialogue();
  },
  onNpcPosition(id: string, x: number, y: number, visible: boolean): void {
    if (activeNpcId === id) bubble.anchor(x, y, visible);
  },
});
