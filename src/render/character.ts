import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  BoxGeometry,
  CapsuleGeometry,
  ColorRepresentation,
  CylinderGeometry,
  Group,
  Mesh,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three';
import type { LoadedScenes } from './assets';
import { cloneModel } from './assets';
import { makeMesh, styleLoadedScene } from './toon';

export function makeHead(toon: boolean): Mesh {
  const head = makeMesh(new SphereGeometry(0.34, 12, 8), 0xd8a77c, toon);
  head.position.y = 1.88;
  return head;
}

export interface CharacterAccessories {
  headwear?: string;
  prop?: string;
}

export interface Character {
  group: Group;
  head: Object3D | null;
  animationClips: { idle: string | null; walk: string | null };
  setWalking(walking: boolean, delta: number): void;
}

function fallbackCharacter(toon: boolean, color: ColorRepresentation): Character {
  const group = new Group();
  const body = makeMesh(new CapsuleGeometry(0.38, 0.72, 4, 8), color, toon);
  body.position.y = 1.08;
  const head = makeHead(toon);
  group.add(body, head);

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

  let elapsed = 0;
  return {
    group,
    head,
    animationClips: { idle: null, walk: null },
    setWalking(walking, delta) {
      elapsed += delta;
      const swing = walking ? Math.sin(elapsed * 10) * 0.48 : 0;
      limbs[0].rotation.x = swing;
      limbs[1].rotation.x = -swing;
      limbs[2].rotation.x = -swing;
      limbs[3].rotation.x = swing;
    },
  };
}

function findClip(
  clips: AnimationClip[],
  preferredNames: string[],
  fallback: RegExp,
): AnimationClip | undefined {
  for (const name of preferredNames) {
    const match = clips.find(clip => clip.name.toLowerCase() === name.toLowerCase());
    if (match) return match;
  }
  return clips.find(clip => fallback.test(clip.name));
}

function normalizeCharacter(model: Group): void {
  const bounds = new Box3().setFromObject(model);
  const size = bounds.getSize(new Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) return;
  const scale = 1.7 / size.y;
  const center = bounds.getCenter(new Vector3());
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
}

function findBone(root: Object3D, pattern: RegExp): Bone | undefined {
  let match: Bone | undefined;
  root.traverse(object => {
    if (!match && object instanceof Bone && pattern.test(object.name)) match = object;
  });
  return match;
}

function removeFacialFeatures(root: Object3D): void {
  const featureName = /eye|brow|mouth|teeth|tongue|lash/i;
  root.traverse(object => {
    if (object instanceof Mesh && featureName.test(object.name)) object.visible = false;
  });
}

function addAccessories(root: Object3D, toon: boolean, accessories: CharacterAccessories): void {
  if (accessories.headwear) {
    const head = findBone(root, /head/i);
    if (head) {
      const cap = makeMesh(new CylinderGeometry(0.28, 0.32, 0.14, 12), 0xf1eee4, toon);
      cap.position.y = 0.25;
      head.add(cap);
    }
  }

  if (accessories.prop) {
    const hand = findBone(root, /(right.*hand|hand.*right|hand_r|r_hand)/i);
    if (hand) {
      const prop = makeMesh(new BoxGeometry(0.28, 0.38, 0.08), 0x6a4935, toon);
      prop.position.set(0, 0.16, 0.08);
      prop.rotation.z = Math.PI / 10;
      hand.add(prop);
    }
  }
}

function playActions(
  mixer: AnimationMixer,
  idleClip: AnimationClip | undefined,
  walkClip: AnimationClip | undefined,
): {
  setWalking(walking: boolean, delta: number): void;
} {
  const idle = idleClip ? mixer.clipAction(idleClip) : undefined;
  const walk = walkClip ? mixer.clipAction(walkClip) : undefined;
  let active: AnimationAction | undefined = idle ?? walk;
  active?.play();

  return {
    setWalking(walking, delta) {
      const next = walking ? (walk ?? idle) : (idle ?? walk);
      if (next && next !== active) {
        next.reset().play();
        active?.crossFadeTo(next, 0.18, true);
        active = next;
      }
      mixer.update(delta);
    },
  };
}

export function makeCharacter(
  toon: boolean,
  assets: LoadedScenes,
  color: ColorRepresentation = 0xc85b46,
  accessories: CharacterAccessories = {},
): Character {
  const loaded = cloneModel(assets, 'mannequin');
  if (!loaded) return fallbackCharacter(toon, color);

  const group = new Group();
  styleLoadedScene(loaded.scene, toon, color);
  removeFacialFeatures(loaded.scene);
  normalizeCharacter(loaded.scene);
  addAccessories(loaded.scene, toon, accessories);
  group.add(loaded.scene);

  const idle = findClip(loaded.animations, ['Idle', 'Idle_A'], /idle/i);
  const walk = findClip(loaded.animations, ['Walking_A', 'Walk', 'Walking'], /walk/i);
  const controls = playActions(new AnimationMixer(loaded.scene), idle, walk);

  return {
    group,
    head: findBone(loaded.scene, /head/i) ?? null,
    animationClips: {
      idle: idle?.name ?? null,
      walk: walk?.name ?? null,
    },
    setWalking: controls.setWalking,
  };
}
