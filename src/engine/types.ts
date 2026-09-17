import type { Exchange, Line, Scene, SlotPool, Word, WordState } from '../content/types';

export interface GameContent { scenes: Scene[]; world: { slotPools: SlotPool[] }; words?: Word[] }
export interface WordProgress {
  state: WordState; lastSeen: number;
  firstSeen?: { location: string; sentence: string; audio: string };
}
export interface GameOptions {
  seed?: number; wallet?: number; actionSlots?: number; foodCost?: number;
  rentCost?: number; graceDays?: number; decayDays?: number;
  wrongPenalty?: number | 'action'; initialWords?: Record<string, WordState>;
}
export type Rules = Required<Omit<GameOptions, 'initialWords' | 'seed' | 'wallet'>>;
export type Bindings = Record<string, SlotPool['values'][number]>;
export interface DialogueFrame {
  sceneId: string; index: number; bindings: Bindings;
  attempts: Record<string, number>; exchange: Exchange;
}
export interface GameEvents {
  sceneStart: { sceneId: string };
  exchange: { sceneId: string; exchange: Exchange };
  reply: { sceneId: string; exchangeId: string; index: number; correct: boolean; action: string; check?: string };
  hint: { sceneId: string; exchangeId: string; attempts: number; line: Line; simplified: string };
  word: { word: string; state: WordState; reason: 'seen' | 'correct' | 'wrong' | 'tap' | 'decay' };
  sceneEnd: { sceneId: string; reward: number };
  day: { day: number; rentDue: boolean; graceUntil: number | null };
  change: Record<string, never>;
}
export type GameEvent = { [K in keyof GameEvents]: { type: K; day: number; data: GameEvents[K] } }[keyof GameEvents];
export interface GameState {
  v: 1; wallet: number; day: number; actionSlots: number;
  rentDue: boolean; graceUntil: number | null; rules: Rules; rng: number;
  words: Record<string, WordProgress>; dialogue: DialogueFrame | null;
  returns: DialogueFrame[]; events: GameEvent[];
}
export type Emit = <K extends keyof GameEvents>(type: K, data: GameEvents[K]) => void;
export class ContentError extends Error { override name = 'ContentError'; }
export class CommandError extends Error { override name = 'CommandError'; }
