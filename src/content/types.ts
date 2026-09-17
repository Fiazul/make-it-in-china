export type WordId = string;
export interface Word { hanzi: WordId; pinyin: string; en: string; hsk: 1|2|3|4; bonus?: boolean; pos?: string }
export type WordState = 'unseen'|'met'|'shaky'|'known';
export interface Line { hanzi: string; pinyin: string; en: string; audio: string; words: WordId[] }
export interface Reply { hanzi: string; pinyin?: string; en?: string; words?: WordId[]; audio?: string;
  action: string; check?: string; correct?: boolean; next?: string }
export interface Exchange { id: string; line: Line; slots?: Record<string,string>; replies: Reply[]; onWrong?: string }
export interface Scene { id: string; phase: 1|2|3|4; location: string; npc: string; kind: 'story'|'job'|'errand'|'mentor'|'consequence';
  requires: WordId[]; introduces: WordId[]; reward?: number; cost?: number; exchanges: Exchange[] }
export interface SlotPool { id: string; values: { hanzi: string; pinyin: string; en: string; words: WordId[] }[] }
export interface Location { id: string; name: string; position: [number,number]; signs: string[] }
export interface Npc { id: string; name: string; label: string; location: string; color: string; headwear?: string; prop?: string }
export interface World { phase: number; locations: Location[]; npcs: Npc[]; slotPools: SlotPool[] }
