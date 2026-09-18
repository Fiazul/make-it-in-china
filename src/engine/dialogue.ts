import type { Scene } from '../content/types';
import { beginAction, penalize, settleRent } from './economy';
import { evidence, meet, wordState } from './learner';
import { fillExchange, validateScene } from './slots';
import { CommandError, ContentError, type DialogueFrame, type Emit, type GameContent, type GameState } from './types';

export function getScene(content: GameContent, id: string): Scene {
  const scene = content.scenes.find(scene => scene.id === id);
  if (!scene) throw new ContentError(`Unknown scene: ${id}`);
  return scene;
}
export function available(state: GameState, content: GameContent): Scene[] {
  if (state.dialogue) return [];
  return content.scenes.filter(scene => {
    if (scene.kind === 'consequence') return false;
    try { validateScene(scene, content, state); fillExchange({ ...state }, scene, scene.exchanges[0], {}, content); return true; }
    catch (error) { if (error instanceof CommandError || error instanceof ContentError) return false; throw error; }
  });
}
function present(state: GameState, content: GameContent, frame: DialogueFrame, emit: Emit, refill = true) {
  const scene = getScene(content, frame.sceneId);
  if (refill) {
    frame.exchange = fillExchange(state, scene, scene.exchanges[frame.index], frame.bindings, content);
    frame.newWords = [...new Set(frame.exchange.line.words.filter(word => wordState(state, word) === 'unseen'))];
  }
  state.dialogue = frame;
  meet(state, frame.exchange.line.words, frame.exchange.line, scene.location, emit);
  emit('exchange', { sceneId: scene.id, exchange: frame.exchange, newWords: frame.newWords });
}
export function enter(state: GameState, content: GameContent, scene: Scene, emit: Emit, consequence = false) {
  if (!consequence && scene.kind === 'consequence') throw new CommandError('Consequences are entered only through onWrong.');
  validateScene(scene, content, state);
  if (!consequence) beginAction(state, scene);
  const frame: DialogueFrame = { sceneId: scene.id, index: 0, bindings: {}, attempts: {}, exchange: scene.exchanges[0], newWords: [] };
  emit('sceneStart', { sceneId: scene.id });
  present(state, content, frame, emit);
}
function finish(state: GameState, scene: Scene, emit: Emit, abandoned = false) {
  const reward = abandoned || scene.kind === 'consequence' ? 0 : (scene.reward ?? 0);
  state.wallet += reward; settleRent(state);
  emit('sceneEnd', { sceneId: scene.id, reward, ...(abandoned ? { abandoned: true } : {}) });
}
function resume(state: GameState, content: GameContent, frame: DialogueFrame, emit: Emit) {
  const target = frame.pendingNext; delete frame.pendingNext;
  if (target && target !== frame.exchange.id) {
    const scene = getScene(content, frame.sceneId), index = scene.exchanges.findIndex(exchange => exchange.id === target);
    if (index < 0) { finish(state, scene, emit, true); enter(state, content, getScene(content, target), emit); return; }
    frame.index = index; present(state, content, frame, emit);
  } else present(state, content, frame, emit, false);
}
export function answer(state: GameState, content: GameContent, index: number, emit: Emit): boolean {
  const frame = state.dialogue;
  if (!frame) throw new CommandError('No active dialogue.');
  const scene = getScene(content, frame.sceneId), exchange = frame.exchange;
  const reply = exchange.replies[index];
  if (!Number.isInteger(index) || !reply) throw new CommandError(`Invalid reply index: ${index}`);
  const correct = reply.correct === true;
  emit('reply', { sceneId: scene.id, exchangeId: exchange.id, index, correct, action: reply.action, ...(reply.check === undefined ? {} : { check: reply.check }) });
  const words = [...exchange.line.words, ...(reply.words ?? [])];
  meet(state, exchange.line.words, exchange.line, scene.location, emit);
  meet(state, reply.words ?? [], reply, scene.location, emit);
  evidence(state, words, correct ? 'correct' : 'wrong', emit);
  if (!correct) {
    const attempts = frame.attempts[exchange.id] = (frame.attempts[exchange.id] ?? 0) + 1;
    const consequence = exchange.onWrong ? getScene(content, exchange.onWrong) : undefined;
    penalize(state, consequence);
    if (attempts >= 2) emit('hint', { sceneId: scene.id, exchangeId: exchange.id, attempts, line: exchange.line, simplified: exchange.line.en });
    frame.pendingNext = reply.next;
    if (consequence) {
      if (state.returns.length >= 32) throw new ContentError('Consequence nesting exceeds 32 scenes; sleep to exit.');
      state.returns.push(frame); enter(state, content, consequence, emit, true);
    } else resume(state, content, frame, emit);
    return false;
  }
  if (reply.next) {
    const targetIndex = scene.exchanges.findIndex(item => item.id === reply.next);
    if (targetIndex >= 0) frame.index = targetIndex;
    else { finish(state, scene, emit); enter(state, content, getScene(content, reply.next), emit); return true; }
  } else frame.index++;
  if (frame.index < scene.exchanges.length) present(state, content, frame, emit);
  else {
    finish(state, scene, emit);
    const parent = state.returns.pop();
    if (parent) resume(state, content, parent, emit);
    else state.dialogue = null;
  }
  return true;
}
