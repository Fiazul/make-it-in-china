import type { Scene } from '../content/types';
import { CommandError, type Emit, type GameState } from './types';

export function spend(state: GameState, amount: number) { state.wallet = Math.max(0, state.wallet - amount); }
export function beginAction(state: GameState, scene: Scene) {
  if (['job', 'errand', 'mentor'].includes(scene.kind)) {
    if (state.actionSlots === 0) throw new CommandError('No action slots left; sleep to start a new day.');
    state.actionSlots--;
  }
  spend(state, scene.cost ?? 0);
}
export function penalize(state: GameState, consequence?: Scene) {
  if (state.rules.wrongPenalty === 'action') state.actionSlots = Math.max(0, state.actionSlots - 1);
  else spend(state, Math.max(1, Math.min(5, consequence?.cost ?? state.rules.wrongPenalty)));
}
export function settleRent(state: GameState) {
  if (state.rentDue && state.wallet >= state.rules.rentCost) {
    spend(state, state.rules.rentCost); state.rentDue = false; state.graceUntil = null;
  }
}
export function nextDay(state: GameState, emit: Emit) {
  state.day++; state.actionSlots = state.rules.actionSlots; spend(state, state.rules.foodCost);
  if (state.day % 7 === 0) { state.rentDue = true; state.graceUntil = state.day + state.rules.graceDays; }
  settleRent(state);
  if (state.day % 7 === 0 && state.rentDue) emit('rentDue', { amount: state.rules.rentCost, graceUntil: state.graceUntil! });
  if (state.rentDue && state.day >= state.graceUntil!) state.graceUntil = state.day + state.rules.graceDays;
}
