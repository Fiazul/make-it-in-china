import type { Exchange, Scene, SlotPool } from '../content/types';
import { CommandError, ContentError, type Bindings, type GameContent, type GameState } from './types';
import { wordState } from './learner';

const fields = ['hanzi', 'pinyin', 'en'] as const;
const names = (text = '') => [...text.matchAll(/\{([^{}]+)\}/g)].map(match => match[1]);
const eligible = (state: GameState, scene: Scene, pool: SlotPool) => pool.values.filter(value => value.words.every(word => wordState(state, word) !== 'unseen' || scene.introduces.includes(word)));
const duplicate = (values: string[]) => new Set(values).size !== values.length;
export function validateScene(scene: Scene, content: GameContent, state?: GameState, visited = new Set<string>()) {
  if (state && scene.kind !== 'consequence') {
    if (scene.requires.some(word => wordState(state!, word) === 'unseen')) throw new CommandError(`Scene is locked: ${scene.id}`);
    if (['job', 'errand', 'mentor'].includes(scene.kind)) {
      if (state.actionSlots === 0) throw new CommandError(`No action slots for ${scene.id}`);
      state = { ...state, actionSlots: state.actionSlots - 1 };
    }
  }
  if (visited.has(scene.id)) return;
  visited = new Set(visited).add(scene.id);
  const bound = new Set<string>(), staticBindings: Record<string, string | undefined> = {};
  if (!scene.exchanges.length) throw new ContentError(`Empty scene: ${scene.id}`);
  if ([scene.cost, scene.reward].some(value => value !== undefined && (!Number.isFinite(value) || value < 0))) throw new ContentError(`Invalid money amount: ${scene.id}`);
  for (const exchange of scene.exchanges) {
    for (const [name, poolId] of Object.entries(exchange.slots ?? {})) {
      const pool = content.world.slotPools.find(item => item.id === poolId);
      if (!pool?.values.length) throw new ContentError(`Unknown/empty pool: ${poolId}`);
      const values = state ? eligible(state, scene, pool) : pool.values;
      if (!values.length) throw new ContentError(`No eligible values for ${poolId} in ${exchange.id}`);
      staticBindings[name] = values.every(value => value.hanzi === values[0].hanzi) ? values[0].hanzi : undefined;
      bound.add(name);
    }
    const rendered = exchange.replies.map(reply => reply.hanzi.replace(/\{([^{}]+)\}/g, (match, name: string) => staticBindings[name] ?? match));
    if (duplicate(rendered)) throw new ContentError(`Identical reply hanzi in ${exchange.id}`);
    for (const text of [exchange.line, ...exchange.replies]) for (const field of fields) {
      for (const name of names(text[field])) if (!bound.has(name)) throw new ContentError(`Unbound {${name}} in ${scene.id}/${exchange.id}`);
    }
    for (const target of [exchange.onWrong, ...exchange.replies.map(reply => reply.next)]) {
      if (!target) continue;
      if (target !== exchange.onWrong && scene.exchanges.some(item => item.id === target)) continue;
      const next = content.scenes.find(item => item.id === target);
      if (!next) throw new ContentError(`Unknown scene/route: ${target}`);
      if ((target === exchange.onWrong) !== (next.kind === 'consequence')) throw new ContentError(`Invalid consequence route: ${target}`);
      if (visited.has(next.id) && next.kind !== 'consequence') throw new ContentError(`Cyclic scene route: ${target}`);
      validateScene(next, content, state, visited);
    }
  }
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
    for (const reply of exchange.replies) {
      const index = reply.next ? scene.exchanges.findIndex(item => item.id === reply.next) : reply.correct ? path.index + 1 : path.index;
      if (index >= 0) paths.push({ index, bound: new Set(path.bound) });
    }
  }
}
export function fillExchange(state: GameState, scene: Scene, exchange: Exchange, bindings: Bindings, content: GameContent): Exchange {
  let collision = exchange.id;
  for (let attempt = 0; attempt < 20; attempt++) {
    for (const [name, poolId] of Object.entries(exchange.slots ?? {})) {
      const pool = content.world.slotPools.find(pool => pool.id === poolId)!;
      const values = eligible(state, scene, pool);
      const shaky = values.filter(value => value.words.some(word => wordState(state, word) === 'shaky'));
      const met = values.filter(value => value.words.every(word => wordState(state, word) !== 'unseen') && value.words.some(word => wordState(state, word) === 'met'));
      const introduced = values.filter(value => value.words.some(word => wordState(state, word) === 'unseen'));
      const seen = values.filter(value => value.words.every(word => wordState(state, word) !== 'unseen'));
      const choices = attempt > 0 ? values : shaky.length ? shaky : met.length ? met : introduced.length ? introduced : seen.length ? seen : values;
      if (!choices.length) throw new ContentError(`No eligible values for ${poolId}`);
      state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
      bindings[name] = structuredClone(choices[Math.floor(state.rng / 4294967296 * choices.length)]);
    }
    // Check inherited uses before showing a binding that would make a later answer ambiguous.
    collision = '';
    for (const later of scene.exchanges.slice(scene.exchanges.indexOf(exchange))) {
      if (later !== exchange && Object.keys(later.slots ?? {}).length) break;
      if (later.replies.some(reply => names(reply.hanzi).some(name => !Object.hasOwn(bindings, name)))) continue;
      if (duplicate(later.replies.map(reply => reply.hanzi.replace(/\{([^{}]+)\}/g, (_, name: string) => bindings[name].hanzi)))) { collision = later.id; break; }
    }
    if (!collision) break;
    if (!Object.keys(exchange.slots ?? {}).length) break;
  }
  if (collision) throw new ContentError(`Identical reply hanzi in ${collision} after at most 20 fills`);
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
