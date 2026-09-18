import type { GameState } from './types';

export class SaveError extends Error { override name = 'SaveError'; }
export class UnsupportedSaveVersionError extends SaveError {
  override name = 'UnsupportedSaveVersionError';
  constructor(public readonly version: unknown) { super(`Unsupported save version: ${String(version)}`); }
}
export const EVENT_LIMIT = 2000;
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const integer = (value: unknown): value is number => number(value) && Number.isSafeInteger(value);
const strings = (value: unknown) => Array.isArray(value) && value.every(item => typeof item === 'string');
function text(value: unknown): boolean {
  return record(value) && typeof value.hanzi === 'string' && ['pinyin', 'en', 'audio'].every(key => value[key] === undefined || typeof value[key] === 'string') && (value.words === undefined || strings(value.words));
}
function frame(value: unknown): boolean {
  // Older v1 saves have no retained first-appearance markers; do not invent any.
  if (record(value) && !Object.hasOwn(value, 'newWords')) value.newWords = [];
  if (!record(value) || typeof value.sceneId !== 'string' || !integer(value.index) || !record(value.bindings) || !record(value.attempts) || !strings(value.newWords) || (value.pendingNext !== undefined && typeof value.pendingNext !== 'string')) return false;
  const ex = value.exchange;
  return Object.values(value.attempts).every(integer) && Object.values(value.bindings).every(item => text(item) && record(item) && strings(item.words)) &&
    record(ex) && typeof ex.id === 'string' && text(ex.line) && record(ex.line) && strings(ex.line.words) && typeof ex.line.audio === 'string' &&
    Array.isArray(ex.replies) && ex.replies.every(reply => text(reply) && record(reply) && typeof reply.action === 'string');
}
export function saveJSON(state: GameState): string { return JSON.stringify({ ...state, events: state.events.slice(-EVENT_LIMIT) }); }
export function loadJSON(json: string): GameState {
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new SaveError('Invalid save JSON.'); }
  if (!record(value)) throw new SaveError('Save must be an object.');
  if (value.v !== 1) throw new UnsupportedSaveVersionError(value.v);
  const rules = value.rules;
  const validRules = record(rules) && ['actionSlots', 'foodCost', 'rentCost', 'graceDays', 'decayDays'].every(key => integer(rules[key])) &&
    Number(rules.actionSlots) > 0 && Number(rules.graceDays) > 0 && Number(rules.decayDays) > 0 &&
    (rules.wrongPenalty === 'action' || (integer(rules.wrongPenalty) && rules.wrongPenalty >= 1 && rules.wrongPenalty <= 5));
  const firstSeen = (value: unknown) => value === undefined || (record(value) && ['location', 'sentence'].every(key => typeof value[key] === 'string') && (value.audio === undefined || typeof value.audio === 'string'));
  const validWords = record(value.words) && Object.values(value.words).every(word => record(word) &&
    ['unseen', 'met', 'shaky', 'known'].includes(String(word.state)) && integer(word.lastSeen) && word.lastSeen <= Number(value.day) &&
    firstSeen(word.firstSeen));
  const eventNames = ['sceneStart', 'exchange', 'reply', 'hint', 'word', 'sceneEnd', 'rentDue', 'day', 'change'];
  if (!validRules || !validWords || !number(value.wallet) || !integer(value.day) || value.day < 1 ||
    !integer(value.actionSlots) || value.actionSlots > Number((rules as Record<string, unknown>).actionSlots) ||
    !integer(value.rng) || value.rng > 4294967295 || typeof value.rentDue !== 'boolean' ||
    !(value.graceUntil === null || integer(value.graceUntil)) || (value.rentDue !== (value.graceUntil !== null)) ||
    !(value.dialogue === null || frame(value.dialogue)) || !Array.isArray(value.returns) || !value.returns.every(frame) ||
    (value.dialogue === null && value.returns.length > 0) || !Array.isArray(value.events) ||
    !value.events.every(event => record(event) && eventNames.includes(String(event.type)) && integer(event.day) && record(event.data))) throw new SaveError('Malformed save state.');
  const state = value as unknown as GameState;
  state.events = state.events.slice(-EVENT_LIMIT);
  return state;
}
export function encodeSave(state: GameState): string {
  const bytes = new TextEncoder().encode(saveJSON(state));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export function decodeSave(encoded: string): GameState {
  let json: string;
  try { json = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(encoded), char => char.charCodeAt(0))); }
  catch { throw new SaveError('Invalid base64 save.'); }
  return loadJSON(json);
}
