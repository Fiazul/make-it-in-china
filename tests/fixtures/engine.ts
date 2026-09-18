import type { Exchange, Scene, World } from '../../src/content/types';
import type { GameContent } from '../../src/engine';
import scenesJSON from '../../content/phase1/scenes.json?raw';
import worldJSON from '../../content/phase1/world.json?raw';

export const exchange = (id = 'e1'): Exchange => ({ id,
  line: { hanzi: '杯子', pinyin: 'bēizi', en: 'cup', audio: 'cup', words: ['杯子'] },
  replies: [{ hanzi: '好', words: ['杯子'], action: 'take', correct: true }, { hanzi: '不', words: ['杯子'], action: 'miss', correct: false }],
});
export const scene = (overrides: Partial<Scene> = {}): Scene => ({ id: 'job', phase: 1, location: 'shop', npc: 'cook', kind: 'job',
  requires: [], introduces: ['杯子'], reward: 8, exchanges: [exchange()], ...overrides });
export const content = (...scenes: Scene[]): GameContent => ({ scenes: scenes.length ? scenes : [scene()], world: { slotPools: [{ id: 'numbers', values: [
  { hanzi: '一', pinyin: 'yī', en: 'one', words: ['一'] }, { hanzi: '二', pinyin: 'èr', en: 'two', words: ['二'] },
  { hanzi: '三', pinyin: 'sān', en: 'three', words: ['三'] },
] }] } });
export function slotted(): Scene {
  const first = exchange(); first.slots = { n: 'numbers' };
  first.line = { ...first.line, hanzi: '{n}杯子', pinyin: '{n} bēizi', en: '{n} cups' };
  first.replies[0] = { ...first.replies[0], hanzi: '{n}', pinyin: '{n}', en: '{n}' };
  return scene({ exchanges: [first] });
}
export function withConsequence(): GameContent {
  const first = exchange(); first.onWrong = 'wrong';
  return content(scene({ exchanges: [first, exchange('e2')] }), scene({ id: 'wrong', kind: 'consequence', cost: 2, reward: 100, requires: ['未见'], exchanges: [exchange('retry')] }));
}
export function unbound(): GameContent {
  const broken = scene(); broken.exchanges[0].replies[0].hanzi = '{answer}个。';
  return content(broken);
}
export function phaseOne(): GameContent {
  const scenes = JSON.parse(scenesJSON) as Scene[];
  return { scenes, world: JSON.parse(worldJSON) as World };
}
