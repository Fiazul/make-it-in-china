import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  Mesh,
  SphereGeometry,
} from 'three';
import { makeMesh } from './toon';

function makeHead(toon: boolean): Mesh {
  // Deliberately blank: all head construction lives here for a future model swap.
  const head = makeMesh(new SphereGeometry(0.34, 12, 8), 0xd8a77c, toon);
  head.position.y = 1.88;
  return head;
}

export interface Character {
  group: Group;
  setWalking(walking: boolean, elapsed: number): void;
}

export function makeCharacter(toon: boolean): Character {
  const group = new Group();
  const body = makeMesh(new CapsuleGeometry(0.38, 0.72, 4, 8), 0xc85b46, toon);
  body.position.y = 1.08;
  group.add(body, makeHead(toon));

  const limbs: Mesh[] = [];
  for (const x of [-0.2, 0.2]) {
    const leg = makeMesh(new BoxGeometry(0.22, 0.65, 0.24), 0x293b52, toon);
    leg.position.set(x, 0.34, 0);
    limbs.push(leg);
    group.add(leg);
  }
  for (const x of [-0.5, 0.5]) {
    const arm = makeMesh(new BoxGeometry(0.18, 0.72, 0.2), 0xd8a77c, toon);
    arm.position.set(x, 1.14, 0);
    limbs.push(arm);
    group.add(arm);
  }

  return {
    group,
    setWalking(walking, elapsed) {
      const swing = walking ? Math.sin(elapsed * 10) * 0.48 : 0;
      limbs[0].rotation.x = swing;
      limbs[1].rotation.x = -swing;
      limbs[2].rotation.x = -swing;
      limbs[3].rotation.x = swing;
    },
  };
}
