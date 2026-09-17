import {
  BoxGeometry,
  CanvasTexture,
  Clock,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
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
import { makeCharacter } from './character';
import { cellToWorld, findPath, makeGrid, worldToCell } from './navigation';
import { makeMesh } from './toon';
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
  onNearNpc(id: string | null): void;
  onNpcPosition(id: string, x: number, y: number, visible: boolean): void;
}

export function startScene(root: HTMLElement, world: World, events: SceneEvents): void {
  const toon = new URLSearchParams(location.search).get('toon') === '1';
  const scene = new Scene();
  scene.background = null;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = SRGBColorSpace;
  root.append(renderer.domElement);

  // Orthographic projection keeps the grey-box scale readable and avoids mobile zoom controls.
  const camera = new OrthographicCamera(-8, 8, 8, -8, 0.1, 100);
  const cameraTarget = new Vector3();
  const cameraOffset = new Vector3(9, 18.7, 9); // fixed yaw and about 55° downward pitch
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

  const grid = makeGrid(GRID_SIZE);
  function addBuilding(
    col: number,
    row: number,
    width: number,
    depth: number,
    height: number,
    color: number,
    shop = false,
  ): void {
    const [x, z] = cellToWorld({ col: col + (width - 1) / 2, row: row + (depth - 1) / 2 }, GRID_SIZE);
    const building = makeMesh(new BoxGeometry(width, height, depth), color, toon);
    building.position.set(x, height / 2, z);
    scene.add(building);
    for (let r = row; r < row + depth; r += 1) {
      for (let c = col; c < col + width; c += 1) grid[r][c] = false;
    }
    if (shop) {
      const sign = makeShopSign();
      sign.position.set(x, height * 0.68, z + depth / 2 + 0.012);
      scene.add(sign);
    }
  }

  addBuilding(2, 2, 5, 3, 3.8, 0xb7604b, true);
  addBuilding(8, 1, 4, 4, 5.2, 0x667785);
  addBuilding(14, 1, 4, 6, 4.5, 0x9a846f);

  const character = makeCharacter(toon);
  character.group.position.set(-7.5, 0, 2.5);
  scene.add(character.group);
  const npcs = spawnNpcs(scene, world, toon);
  let nearNpc: string | null = null;

  let waypoints: Vector3[] = [];
  const pointer = new Vector2();
  const raycaster = new Raycaster();
  renderer.domElement.addEventListener('pointerdown', (event) => {
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
    waypoints = findPath(grid, start, goal).map((cell) => {
      const [x, z] = cellToWorld(cell, GRID_SIZE);
      return new Vector3(x, 0, z);
    });
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
    character.setWalking(waypoints.length > 0, clock.elapsedTime);
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
    if ((nearest?.id ?? null) !== nearNpc) {
      nearNpc = nearest?.id ?? null;
      events.onNearNpc(nearNpc);
    }
    renderer.render(scene, camera);
  });
}
