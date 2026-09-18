import type { Npc } from '../content/types';
import type { LoadedScenes } from './assets';
import { makeCharacter } from './character';

export function makeNpc(npc: Npc, toon: boolean, assets: LoadedScenes) {
  const color = Number.parseInt(npc.color.slice(1), 16);
  const character = makeCharacter(toon, assets, color, {
    headwear: npc.headwear,
    prop: npc.prop,
  });
  character.setWalking(false, 0);
  return { id: npc.id, ...character };
}
