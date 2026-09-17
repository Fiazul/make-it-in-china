import { answer, available, enter, getScene } from './dialogue';
import { nextDay } from './economy';
import { decay, evidence } from './learner';
import { decodeSave, encodeSave, EVENT_LIMIT, loadJSON, SaveError, saveJSON } from './save';
import { validateScene } from './slots';
import { CommandError, type Emit, type GameContent, type GameEvent, type GameEvents, type GameOptions, type GameState } from './types';

export function createGame(input: GameContent, opts: GameOptions = {}) {
  const content = structuredClone(input);
  const rules = { actionSlots: opts.actionSlots ?? 4, foodCost: opts.foodCost ?? 2, rentCost: opts.rentCost ?? 20,
    graceDays: opts.graceDays ?? 3, decayDays: opts.decayDays ?? 3, wrongPenalty: opts.wrongPenalty ?? 1 };
  let current: GameState = loadJSON(JSON.stringify({ v: 1, wallet: opts.wallet ?? 20, day: 1, actionSlots: rules.actionSlots,
    rentDue: false, graceUntil: null, rules, rng: opts.seed ?? 1, words: Object.fromEntries(Object.entries(opts.initialWords ?? {}).map(([word, state]) => [word, { state, lastSeen: 1 }])),
    dialogue: null, returns: [], events: [] }));
  const listeners = new Map<keyof GameEvents, Set<(data: never) => void>>();
  const notify = (event: GameEvent) => { for (const callback of [...(listeners.get(event.type) ?? [])]) callback(structuredClone(event.data) as never); };
  function command<T>(action: (state: GameState, emit: Emit) => T): T {
    const state = structuredClone(current), pending: GameEvent[] = [];
    const emit: Emit = (type, data) => {
      const event = structuredClone({ type, day: state.day, data }) as GameEvent;
      state.events.push(event); pending.push(event);
    };
    const result = action(state, emit);
    state.events = state.events.slice(-EVENT_LIMIT); current = state;
    for (const event of pending) notify(event);
    notify({ type: 'change', day: state.day, data: {} });
    return result;
  }
  return {
    start(sceneId: string) { return command((state, emit) => {
      if (state.dialogue) throw new CommandError('Finish the current dialogue first.');
      enter(state, content, getScene(content, sceneId), emit);
    }); },
    reply(index: number) { return command((state, emit) => answer(state, content, index, emit)); },
    tapWord(word: string) { return command((state, emit) => {
      if (!Object.hasOwn(state.words, word) || state.words[word].state === 'unseen') throw new CommandError(`Word has not been met: ${word}`);
      evidence(state, [word], 'tap', emit);
    }); },
    sleep() { return command((state, emit) => {
      if (state.dialogue) throw new CommandError('Finish the current dialogue before sleeping.');
      nextDay(state); decay(state, emit);
      emit('day', { day: state.day, rentDue: state.rentDue, graceUntil: state.graceUntil });
    }); },
    availableScenes: () => structuredClone(available(current, content)),
    state: () => structuredClone(current),
    on<K extends keyof GameEvents>(event: K, callback: (data: GameEvents[K]) => void): () => void {
      const callbacks = listeners.get(event) ?? new Set(); listeners.set(event, callbacks);
      callbacks.add(callback as (data: never) => void);
      return () => { callbacks.delete(callback as (data: never) => void); };
    },
    exportString: () => encodeSave(current),
    importString(encoded: string) {
      const state = decodeSave(encoded);
      for (const frame of [...state.returns, ...(state.dialogue ? [state.dialogue] : [])]) {
        const scene = getScene(content, frame.sceneId); validateScene(scene, content);
        if (scene.exchanges[frame.index]?.id !== frame.exchange.id) throw new SaveError('Save dialogue does not match content.');
      }
      current = state; notify({ type: 'change', day: current.day, data: {} });
    },
    saveJSON: () => saveJSON(current),
  };
}
export type Game = ReturnType<typeof createGame>;
