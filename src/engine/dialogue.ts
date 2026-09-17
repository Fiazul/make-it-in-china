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
  return content.scenes.filter(scene => scene.requires.every(word => wordState(state, word) !== 'unseen'));
}
function present(state: GameState, content: GameContent, frame: DialogueFrame, emit: Emit, refill = true) {
  const scene = getScene(content, frame.sceneId);
  if (refill) frame.exchange = fillExchange(state, scene, scene.exchanges[frame.index], frame.bindings, content);
  state.dialogue = frame;
  meet(state, frame.exchange.line.words, frame.exchange.line, scene.location, emit);
  emit('exchange', { sceneId: scene.id, exchange: frame.exchange });
}
export function enter(state: GameState, content: GameContent, scene: Scene, emit: Emit, consequence = false) {
  validateScene(scene, content);
  if (!consequence) {
    if (!available(state, content).includes(scene)) throw new CommandError(`Scene is locked: ${scene.id}`);
    beginAction(state, scene);
  }
  const frame: DialogueFrame = { sceneId: scene.id, index: 0, bindings: {}, attempts: {}, exchange: scene.exchanges[0] };
  emit('sceneStart', { sceneId: scene.id });
  present(state, content, frame, emit);
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
  meet(state, words, exchange.line, scene.location, emit);
  evidence(state, words, correct ? 'correct' : 'wrong', emit);
  if (!correct) {
    const attempts = frame.attempts[exchange.id] = (frame.attempts[exchange.id] ?? 0) + 1;
    const consequence = exchange.onWrong ? getScene(content, exchange.onWrong) : undefined;
    penalize(state, consequence);
    if (attempts >= 2) emit('hint', { sceneId: scene.id, exchangeId: exchange.id, attempts, line: exchange.line, simplified: exchange.line.en });
    if (consequence) { state.returns.push(frame); enter(state, content, consequence, emit, true); }
    else present(state, content, frame, emit, false);
    return false;
  }
  if (reply.next) {
    const targetIndex = scene.exchanges.findIndex(item => item.id === reply.next);
    if (targetIndex >= 0) frame.index = targetIndex;
    else { enter(state, content, getScene(content, reply.next), emit); return true; }
  } else frame.index++;
  if (frame.index < scene.exchanges.length) present(state, content, frame, emit);
  else {
    const reward = scene.kind === 'consequence' ? 0 : (scene.reward ?? 0);
    state.wallet += reward; settleRent(state); emit('sceneEnd', { sceneId: scene.id, reward });
    const resume = state.returns.pop();
    if (resume) present(state, content, resume, emit, false);
    else state.dialogue = null;
  }
  return true;
}
