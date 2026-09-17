import type { Exchange, Scene } from '../content/types';
import { ContentError, type Bindings, type GameContent, type GameState } from './types';
import { wordState } from './learner';

const fields = ['hanzi', 'pinyin', 'en'] as const;
const names = (text = '') => [...text.matchAll(/\{([^{}]+)\}/g)].map(match => match[1]);
export function validateScene(scene: Scene, content: GameContent, visited = new Set<string>()) {
  if (visited.has(scene.id)) return;
  visited.add(scene.id);
  const bound = new Set<string>();
  if (!scene.exchanges.length) throw new ContentError(`Empty scene: ${scene.id}`);
  if ([scene.cost, scene.reward].some(value => value !== undefined && (!Number.isFinite(value) || value < 0))) throw new ContentError(`Invalid money amount: ${scene.id}`);
  for (const exchange of scene.exchanges) {
    for (const [name, pool] of Object.entries(exchange.slots ?? {})) {
      if (!content.world.slotPools.some(item => item.id === pool && item.values.length)) throw new ContentError(`Unknown/empty pool: ${pool}`);
      bound.add(name);
    }
    for (const text of [exchange.line, ...exchange.replies]) for (const field of fields) {
      for (const name of names(text[field])) if (!bound.has(name)) throw new ContentError(`Unbound {${name}} in ${scene.id}/${exchange.id}`);
    }
    for (const target of [exchange.onWrong, ...exchange.replies.map(reply => reply.next)]) {
      if (!target) continue;
      if (target !== exchange.onWrong && scene.exchanges.some(item => item.id === target)) continue;
      const next = content.scenes.find(item => item.id === target);
      if (!next) throw new ContentError(`Unknown scene/route: ${target}`);
      if (target === exchange.onWrong && next.kind !== 'consequence') throw new ContentError(`Not a consequence: ${target}`);
      validateScene(next, content, visited);
    }
  }
  // A forward jump must not bypass a binding needed by its destination.
  const paths = [{ index: 0, bound: new Set<string>() }], checked = new Set<string>();
  while (paths.length) {
    const path = paths.pop()!, exchange = scene.exchanges[path.index];
    if (!exchange) continue;
    for (const name of Object.keys(exchange.slots ?? {})) path.bound.add(name);
    const key = JSON.stringify([path.index, [...path.bound].sort()]);
    if (checked.has(key)) continue;
    checked.add(key);
    for (const text of [exchange.line, ...exchange.replies]) for (const field of fields) {
      for (const name of names(text[field])) if (!path.bound.has(name)) throw new ContentError(`Route skips binding {${name}} in ${exchange.id}`);
    }
    for (const reply of exchange.replies.filter(reply => reply.correct === true)) {
      const index = reply.next ? scene.exchanges.findIndex(item => item.id === reply.next) : path.index + 1;
      if (index >= 0) paths.push({ index, bound: new Set(path.bound) });
    }
  }
}
export function fillExchange(state: GameState, scene: Scene, exchange: Exchange, bindings: Bindings, content: GameContent): Exchange {
  for (const [name, poolId] of Object.entries(exchange.slots ?? {})) {
    const pool = content.world.slotPools.find(pool => pool.id === poolId)!;
    const eligible = pool.values.filter(value => value.words.every(word => wordState(state, word) !== 'unseen' || scene.introduces.includes(word)));
    const shaky = eligible.filter(value => value.words.some(word => wordState(state, word) === 'shaky'));
    const met = eligible.filter(value => value.words.every(word => wordState(state, word) !== 'unseen') && value.words.some(word => wordState(state, word) === 'met'));
    const seen = eligible.filter(value => value.words.every(word => wordState(state, word) !== 'unseen'));
    const choices = shaky.length ? shaky : met.length ? met : seen.length ? seen : eligible;
    if (!choices.length) throw new ContentError(`No eligible values for ${poolId}`);
    state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
    bindings[name] = structuredClone(choices[Math.floor(state.rng / 4294967296 * choices.length)]);
  }
  const exchangeSlots = [...Object.keys(exchange.slots ?? {}), ...fields.flatMap(field => names(exchange.line[field]))];
  const fill = <T extends { hanzi: string; pinyin?: string; en?: string; words?: string[] }>(text: T): T => {
    const result = structuredClone(text);
    const used = new Set([...exchangeSlots, ...fields.flatMap(field => names(text[field]))]);
    for (const field of fields) if (text[field] !== undefined) result[field] = text[field]!.replace(/\{([^{}]+)\}/g, (_, name: string) => {
      if (!Object.hasOwn(bindings, name)) throw new ContentError(`Unbound {${name}} in ${exchange.id}`);
      return bindings[name][field];
    });
    result.words = [...(text.words ?? []), ...[...used].flatMap(name => bindings[name].words)];
    return result;
  };
  return { ...structuredClone(exchange), line: fill(exchange.line), replies: exchange.replies.map(fill) };
}
