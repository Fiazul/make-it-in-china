import {
  Box3,
  BoxGeometry,
  CanvasTexture,
  Clock,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { World } from '../content/types';
import { cloneModel, loadAll, type LoadedScenes, type ModelId } from './assets';
import { makeCharacter } from './character';
import { cellToWorld, findPath, makeGrid, worldToCell } from './navigation';
import { makeMesh, styleLoadedScene } from './toon';
import { spawnNpcs } from './world';

const GRID_SIZE = 20;
const VIEW_HEIGHT = 16;

function makeShopSign(): Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D unavailable');
  context.fillStyle = '#f2d58b';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#38251f';
  context.font = 'bold 62px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('面馆', 128, 48);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return new Mesh(
    new PlaneGeometry(2.5, 0.95),
    new MeshBasicMaterial({ map: texture, side: DoubleSide }),
  );
}

export interface SceneEvents {
  onMoveIntent(): void;
  onArrivalNpc(id: string | null): void;
  onNpcPosition(id: string, x: number, y: number, visible: boolean): void;
}

function fitModel(model: Object3D, limits: Vector3): void {
  const bounds = new Box3().setFromObject(model);
  const size = bounds.getSize(new Vector3());
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return;
  const scale = Math.min(limits.x / size.x, limits.y / size.y, limits.z / size.z);
  const center = bounds.getCenter(new Vector3());
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
}

function prepareModel(
  assets: LoadedScenes,
  id: ModelId,
  toon: boolean,
  position: Vector3,
  limits: Vector3,
  fallback: () => Object3D,
  rotationY = 0,
): Object3D {
  const loaded = cloneModel(assets, id);
  const model = loaded?.scene ?? fallback();
  if (loaded) styleLoadedScene(model, toon);
  fitModel(model, limits);
  model.position.add(position);
  model.rotation.y = rotationY;
  return model;
}

export async function startScene(root: HTMLElement, world: World, events: SceneEvents): Promise<void> {
  const toon = new URLSearchParams(location.search).get('toon') === '1';
  const assets: LoadedScenes = new Map();
  const scene = new Scene();
  scene.background = null;
  const loading = document.createElement('div');
  loading.id = 'loading';
  loading.textContent = '加载中… loading models';
  root.append(loading);

  try {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = SRGBColorSpace;
  root.append(renderer.domElement);

  const camera = new OrthographicCamera(-8, 8, 8, -8, 0.1, 100);
  const cameraTarget = new Vector3();
  const cameraOffset = new Vector3(9, 18.7, 9);
  camera.position.copy(cameraOffset);
  camera.lookAt(0, 0.8, 0);

  scene.add(new HemisphereLight(0xfff2d5, 0x657080, 2.2));
  const sun = new DirectionalLight(0xffffff, 2);
  sun.position.set(-5, 10, 7);
  scene.add(sun);

  const ground = makeMesh(new PlaneGeometry(GRID_SIZE, GRID_SIZE), 0xb9ae96, toon);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const gridLines = new GridHelper(GRID_SIZE, GRID_SIZE, 0x746d60, 0x938b7c);
  gridLines.position.y = 0.012;
  scene.add(gridLines);

  const modelSwaps = new Map<ModelId, Array<() => void>>();
  function addModel(
    id: ModelId,
    position: Vector3,
    limits: Vector3,
    fallback: () => Object3D,
    rotationY = 0,
  ): Object3D {
    let current = prepareModel(assets, id, toon, position, limits, fallback, rotationY);
    scene.add(current);
    const swap = () => {
      if (!assets.has(id)) return;
      const replacement = prepareModel(assets, id, toon, position, limits, fallback, rotationY);
      scene.remove(current);
      scene.add(replacement);
      current = replacement;
    };
    const swaps = modelSwaps.get(id) ?? [];
    swaps.push(swap);
    modelSwaps.set(id, swaps);
    return current;
  }

  const grid = makeGrid(GRID_SIZE);
  function addBuilding(
    id: Extract<ModelId, 'building-a' | 'building-b' | 'building-c'>,
    col: number,
    row: number,
    width: number,
    depth: number,
    height: number,
    color: number,
    shop = false,
  ): void {
    const [x, z] = cellToWorld({ col: col + (width - 1) / 2, row: row + (depth - 1) / 2 }, GRID_SIZE);
    addModel(
      id,
      new Vector3(x, 0, z),
      new Vector3(width, height, depth),
      () => makeMesh(new BoxGeometry(width, height, depth), color, toon),
    );
    for (let r = row; r < row + depth; r += 1) {
      for (let c = col; c < col + width; c += 1) grid[r][c] = false;
    }
    if (shop) {
      const sign = makeShopSign();
      sign.position.set(x, height * 0.68, z + depth / 2 + 0.012);
      scene.add(sign);
    }
  }

  addBuilding('building-a', 2, 2, 5, 3, 3.8, 0xb7604b, true);
  addBuilding('building-b', 8, 1, 4, 4, 5.2, 0x667785);
  addBuilding('building-c', 14, 1, 4, 6, 4.5, 0x9a846f);

  addModel(
    'awning',
    new Vector3(-5.5, 2.25, -4.9),
    new Vector3(3.2, 0.8, 1.1),
    () => makeMesh(new BoxGeometry(3.2, 0.18, 1.1), 0xe5c36b, toon),
  );

  const streetProps: Array<{
    id: Extract<ModelId, 'streetlight' | 'bench' | 'box-a' | 'bush'>;
    position: Vector3;
    limits: Vector3;
    color: number;
  }> = [
    { id: 'streetlight', position: new Vector3(-7, 0, -2.2), limits: new Vector3(0.8, 3.2, 0.8), color: 0x4d5358 },
    { id: 'bench', position: new Vector3(-2.2, 0, -2.1), limits: new Vector3(2.1, 1, 0.8), color: 0x8b6547 },
    { id: 'box-a', position: new Vector3(1.6, 0, -2), limits: new Vector3(0.8, 0.8, 0.8), color: 0x9b734f },
    { id: 'bush', position: new Vector3(6.2, 0, -2.2), limits: new Vector3(1.5, 1.2, 1.5), color: 0x66834f },
  ];
  for (const prop of streetProps) {
    addModel(
      prop.id,
      prop.position,
      prop.limits,
      () => makeMesh(new BoxGeometry(prop.limits.x, prop.limits.y, prop.limits.z), prop.color, toon),
    );
  }

  const table = makeMesh(new BoxGeometry(2.1, 0.75, 0.9), 0x855d3f, toon);
  table.position.set(-4.25, 0.375, 1.5);
  scene.add(table);
  const foodProps: Array<{
    id: Extract<ModelId, 'bowl-broth' | 'chopstick' | 'cup-tea' | 'steamer' | 'pot'>;
    position: Vector3;
    limits: Vector3;
    color: number;
  }> = [
    { id: 'bowl-broth', position: new Vector3(-4.85, 0.76, 1.5), limits: new Vector3(0.34, 0.22, 0.34), color: 0xe7e1d4 },
    { id: 'chopstick', position: new Vector3(-4.45, 0.76, 1.4), limits: new Vector3(0.08, 0.06, 0.55), color: 0x65452f },
    { id: 'cup-tea', position: new Vector3(-4.05, 0.76, 1.45), limits: new Vector3(0.25, 0.32, 0.25), color: 0xb8c6ac },
    { id: 'steamer', position: new Vector3(-3.68, 0.76, 1.5), limits: new Vector3(0.42, 0.34, 0.42), color: 0xc99d62 },
    { id: 'pot', position: new Vector3(-4.25, 0.76, 1.7), limits: new Vector3(0.42, 0.36, 0.42), color: 0x5a6063 },
  ];
  for (const prop of foodProps) {
    addModel(
      prop.id,
      prop.position,
      prop.limits,
      () => makeMesh(new BoxGeometry(prop.limits.x, prop.limits.y, prop.limits.z), prop.color, toon),
    );
  }

  let character = makeCharacter(toon, assets);
  character.group.position.set(-7.5, 0, 2.5);
  scene.add(character.group);
  let npcs = spawnNpcs(scene, world, toon, assets);

  let waypoints: Vector3[] = [];
  let arrivalPending = false;
  const pointer = new Vector2();
  const raycaster = new Raycaster();
  renderer.domElement.addEventListener('pointerup', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(ground, false)[0];
    if (!hit) return;
    const start = worldToCell(character.group.position.x, character.group.position.z, GRID_SIZE);
    const goal = worldToCell(hit.point.x, hit.point.z, GRID_SIZE);
    if (!start || !goal || !grid[goal.row][goal.col]) return;
    const path = findPath(grid, start, goal);
    if (!path.length && (start.col !== goal.col || start.row !== goal.row)) return;
    events.onMoveIntent();
    waypoints = path.map((cell) => {
      const [x, z] = cellToWorld(cell, GRID_SIZE);
      return new Vector3(x, 0, z);
    });
    arrivalPending = true;
  });

  function resize(): void {
    const aspect = innerWidth / innerHeight;
    camera.left = -(VIEW_HEIGHT * aspect) / 2;
    camera.right = (VIEW_HEIGHT * aspect) / 2;
    camera.top = VIEW_HEIGHT / 2;
    camera.bottom = -VIEW_HEIGHT / 2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', resize);
  resize();

  const clock = new Clock();
  renderer.setAnimationLoop(() => {
    const delta = Math.min(clock.getDelta(), 0.05);
    let travel = delta * 3.4;
    while (waypoints.length && travel > 0) {
      const target = waypoints[0];
      const direction = target.clone().sub(character.group.position);
      const distance = direction.length();
      character.group.rotation.y = Math.atan2(direction.x, direction.z);
      if (distance <= travel) {
        character.group.position.copy(target);
        waypoints.shift();
        travel -= distance;
      } else {
        character.group.position.addScaledVector(direction.normalize(), travel);
        travel = 0;
      }
    }
    character.setWalking(waypoints.length > 0, delta);
    for (const npc of npcs) npc.setWalking(false, delta);
    cameraTarget.lerp(character.group.position, 1 - Math.exp(-delta * 2.2));
    camera.position.copy(cameraTarget).add(cameraOffset);
    camera.lookAt(cameraTarget.x, 0.8, cameraTarget.z);
    const playerCell = worldToCell(character.group.position.x, character.group.position.z, GRID_SIZE);
    let nearest: { id: string; distance: number } | null = null;
    for (const npc of npcs) {
      const npcCell = worldToCell(npc.group.position.x, npc.group.position.z, GRID_SIZE);
      if (playerCell && npcCell) {
        const distance = Math.abs(playerCell.col - npcCell.col) + Math.abs(playerCell.row - npcCell.row);
        if (distance <= 1 && (!nearest || distance < nearest.distance)) nearest = { id: npc.id, distance };
      }
      const head = npc.group.localToWorld(new Vector3(0, 2.35, 0)).project(camera);
      events.onNpcPosition(
        npc.id,
        (head.x * 0.5 + 0.5) * innerWidth,
        (-head.y * 0.5 + 0.5) * innerHeight,
        head.z >= -1 && head.z <= 1,
      );
    }
    if (arrivalPending && waypoints.length === 0) {
      arrivalPending = false;
      events.onArrivalNpc(nearest?.id ?? null);
    }
    renderer.render(scene, camera);
  });

    await loadAll((id, loaded) => {
      if (!loaded) return;
      assets.set(id, loaded);
      if (id === 'mannequin') {
        const playerPosition = character.group.position.clone();
        const playerRotation = character.group.rotation.clone();
        scene.remove(character.group);
        character = makeCharacter(toon, assets);
        character.group.position.copy(playerPosition);
        character.group.rotation.copy(playerRotation);
        scene.add(character.group);
        for (const npc of npcs) scene.remove(npc.group);
        npcs = spawnNpcs(scene, world, toon, assets);
      }
      for (const swap of modelSwaps.get(id) ?? []) swap();
      modelSwaps.delete(id);
    });
  } finally {
    loading.remove();
  }
}
