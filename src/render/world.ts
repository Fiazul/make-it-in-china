import type { Scene } from 'three';
import type { World } from '../content/types';
import { makeNpc } from './npc';

const STREET_MIN = -7.5;
const STREET_MAX = 7.5;

export function spawnNpcs(scene: Scene, world: World, toon: boolean) {
  const xs = world.locations.map(location => location.position[0]);
  const min = Math.min(...xs);
  const max = Math.max(...xs);
  return world.npcs.map(npc => {
    const location = world.locations.find(item => item.id === npc.location);
    if (!location) throw new Error(`NPC ${npc.id} has unknown location ${npc.location}`);
    const rendered = makeNpc(npc, toon);
    const ratio = max === min ? 0.5 : (location.position[0] - min) / (max - min);
    rendered.group.position.set(STREET_MIN + ratio * (STREET_MAX - STREET_MIN), 0, 2.5);
    scene.add(rendered.group);
    return rendered;
  });
}
