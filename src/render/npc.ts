import { BoxGeometry, CapsuleGeometry, Group, SphereGeometry } from 'three';
import type { Npc } from '../content/types';
import { makeMesh } from './toon';

export function makeNpc(npc: Npc, toon: boolean) {
  const group = new Group();
  const color = Number.parseInt(npc.color.slice(1), 16);
  const body = makeMesh(new CapsuleGeometry(0.38, 0.72, 4, 8), color, toon);
  body.position.y = 1.08;
  const head = makeMesh(new SphereGeometry(0.34, 12, 8), 0xd8a77c, toon);
  head.position.y = 1.88;
  group.add(body, head);

  if (npc.headwear) {
    const hat = makeMesh(new BoxGeometry(0.72, 0.16, 0.72), 0xf1eee4, toon);
    hat.position.y = 2.18;
    group.add(hat);
  }
  return { id: npc.id, group };
}
