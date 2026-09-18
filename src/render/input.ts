import { Vector2 } from 'three';
import {
  GAMEPAD_DEADZONE,
  GAMEPAD_LOOK_RATE,
  GAMEPAD_RUN_TRIGGER,
  JOYSTICK_BASE,
  JOYSTICK_BOTTOM,
  JOYSTICK_DEAD,
  JOYSTICK_LEFT,
  JOYSTICK_MAX,
  JOYSTICK_THUMB,
  ORBIT_DEG_PER_PX,
  TOUCH_RUN,
  TOUCH_TALK,
} from './constants';

export interface Intent {
  move: Vector2;
  run: boolean;
  talk: boolean;
  menu: boolean;
  orbitYawDelta: number;
  orbitPitchDelta: number;
  source: 'keyboard' | 'gamepad' | 'touch';
}

function typingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (
    target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.isContentEditable
  );
}

function radial(x: number, y: number, dead: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  if (length <= dead) return { x: 0, y: 0 };
  const remapped = Math.min(1, (length - dead) / (1 - dead));
  return { x: (x / length) * remapped, y: (y / length) * remapped };
}

const ORBIT_RAD_PER_PX = (ORBIT_DEG_PER_PX * Math.PI) / 180;

export function createInput(root: HTMLElement): {
  sample(dt: number): Intent;
  isControl(target: EventTarget | null): boolean;
  dispose(): void;
} {
  const keys = new Set<string>();
  const move = new Vector2();
  const touchMove = new Vector2();
  let source: Intent['source'] = 'keyboard';
  let runHeld = false;
  let touchRun = false;
  let talkEdge = false;
  let menuEdge = false;
  let orbitYaw = 0;
  let orbitPitch = 0;
  let joystickId: number | null = null;
  const orbitPointers = new Map<number, { x: number; y: number }>();
  let orbitCentroid: { x: number; y: number } | null = null;
  let mouseOrbit = false;
  let lastMouse = { x: 0, y: 0 };

  const controls = document.createElement('div');
  controls.id = 'touch-controls';
  controls.innerHTML = `
    <div id="joystick-base" aria-hidden="true"><div id="joystick-thumb"></div></div>
    <button id="touch-run" type="button">Run</button>
    <button id="touch-talk" type="button">Talk</button>`;
  root.append(controls);
  const base = controls.querySelector<HTMLDivElement>('#joystick-base')!;
  const thumb = controls.querySelector<HTMLDivElement>('#joystick-thumb')!;
  const runButton = controls.querySelector<HTMLButtonElement>('#touch-run')!;
  const talkButton = controls.querySelector<HTMLButtonElement>('#touch-talk')!;

  function placeJoystick(px: number, py: number): void {
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = px - cx;
    const dy = py - cy;
    const length = Math.hypot(dx, dy);
    const limited = Math.min(length, JOYSTICK_MAX);
    const nx = length > 0 ? (dx / length) * limited : 0;
    const ny = length > 0 ? (dy / length) * limited : 0;
    thumb.style.transform = `translate(${nx}px, ${ny}px)`;
    const analog = radial(nx / JOYSTICK_MAX, -ny / JOYSTICK_MAX, JOYSTICK_DEAD / JOYSTICK_MAX);
    touchMove.set(analog.x, analog.y);
    if (touchMove.lengthSq() > 0) source = 'touch';
  }

  function resetJoystick(): void {
    joystickId = null;
    touchMove.set(0, 0);
    thumb.style.transform = 'translate(0px, 0px)';
  }

  function releaseHeld(): void {
    keys.clear();
    runHeld = false;
    touchRun = false;
    resetJoystick();
    orbitPointers.clear();
    orbitCentroid = null;
    mouseOrbit = false;
    orbitYaw = 0;
    orbitPitch = 0;
  }

  function onKey(event: KeyboardEvent, down: boolean): void {
    if (typingTarget(event.target)) return;
    if (down && (event.code === 'Tab' || event.code === 'KeyE')) event.preventDefault();
    if (down && event.repeat) return;
    if (down) keys.add(event.code);
    else keys.delete(event.code);
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') runHeld = down;
    if (down && event.code === 'KeyE') talkEdge = true;
    if (down && event.code === 'Tab') menuEdge = true;
    source = 'keyboard';
  }

  function controlEl(target: EventTarget | null): boolean {
    return target instanceof Node && controls.contains(target);
  }

  function onPointerDown(event: PointerEvent): void {
    if (controlEl(event.target)) {
      if (event.target === runButton) {
        touchRun = true;
        source = 'touch';
        runButton.setPointerCapture(event.pointerId);
        return;
      }
      if (event.target === talkButton) {
        talkEdge = true;
        source = 'touch';
        return;
      }
      joystickId = event.pointerId;
      base.setPointerCapture(event.pointerId);
      placeJoystick(event.clientX, event.clientY);
      source = 'touch';
      return;
    }
    if (event.button === 2) {
      mouseOrbit = true;
      lastMouse = { x: event.clientX, y: event.clientY };
      return;
    }
    if (event.pointerType === 'touch') {
      orbitPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
  }

  function onPointerMove(event: PointerEvent): void {
    if (event.pointerId === joystickId) {
      placeJoystick(event.clientX, event.clientY);
      return;
    }
    if (mouseOrbit && event.buttons & 2) {
      orbitYaw -= (event.clientX - lastMouse.x) * ORBIT_RAD_PER_PX;
      orbitPitch -= (event.clientY - lastMouse.y) * ORBIT_RAD_PER_PX;
      lastMouse = { x: event.clientX, y: event.clientY };
      return;
    }
    if (!orbitPointers.has(event.pointerId)) return;
    orbitPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (orbitPointers.size < 2 || joystickId !== null) return;
    let sx = 0;
    let sy = 0;
    for (const point of orbitPointers.values()) {
      sx += point.x;
      sy += point.y;
    }
    const cx = sx / orbitPointers.size;
    const cy = sy / orbitPointers.size;
    if (orbitCentroid) {
      orbitYaw -= (cx - orbitCentroid.x) * ORBIT_RAD_PER_PX;
      orbitPitch -= (cy - orbitCentroid.y) * ORBIT_RAD_PER_PX;
    }
    orbitCentroid = { x: cx, y: cy };
  }

  function onPointerUp(event: PointerEvent): void {
    if (event.pointerId === joystickId) resetJoystick();
    if (event.target === runButton) touchRun = false;
    orbitPointers.delete(event.pointerId);
    if (orbitPointers.size < 2) orbitCentroid = null;
    if (event.button === 2) mouseOrbit = false;
  }

  function readGamepad(dt: number): { move: Vector2; run: boolean; lookYaw: number; lookPitch: number; talk: boolean; menu: boolean } | null {
    const pads = navigator.getGamepads?.() ?? [];
    const pad = pads.find(item => item && item.connected);
    if (!pad) return null;
    const stick = radial(pad.axes[0] ?? 0, -(pad.axes[1] ?? 0), GAMEPAD_DEADZONE);
    const look = radial(pad.axes[2] ?? 0, pad.axes[3] ?? 0, GAMEPAD_DEADZONE);
    const buttons = pad.buttons;
    const run = (buttons[6]?.value ?? 0) >= GAMEPAD_RUN_TRIGGER;
    const talk = !!buttons[0]?.pressed;
    const menu = !!buttons[2]?.pressed || !!buttons[9]?.pressed;
    if (stick.x === 0 && stick.y === 0 && look.x === 0 && look.y === 0 && !run && !talk && !menu) return null;
    return {
      move: new Vector2(stick.x, stick.y),
      run,
      lookYaw: -look.x * GAMEPAD_LOOK_RATE * dt,
      lookPitch: -look.y * GAMEPAD_LOOK_RATE * dt,
      talk,
      menu,
    };
  }

  let gamepadTalk = false;
  let gamepadMenu = false;

  const onContext = (event: Event) => {
    if (event.target instanceof HTMLCanvasElement) event.preventDefault();
  };
  addEventListener('keydown', event => onKey(event, true));
  addEventListener('keyup', event => onKey(event, false));
  addEventListener('blur', releaseHeld);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseHeld(); });
  addEventListener('pointerdown', onPointerDown);
  addEventListener('pointermove', onPointerMove);
  addEventListener('pointerup', onPointerUp);
  addEventListener('pointercancel', onPointerUp);
  addEventListener('lostpointercapture', onPointerUp);
  addEventListener('contextmenu', onContext);
  addEventListener('gamepaddisconnected', releaseHeld);

  return {
    sample(dt: number): Intent {
      const keyboard = new Vector2(
        (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0),
        (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0),
      );
      if (keyboard.lengthSq() > 1) keyboard.normalize();
      const pad = readGamepad(dt);
      if (keyboard.lengthSq() > 0) source = 'keyboard';
      else if (touchMove.lengthSq() > 0) source = 'touch';
      else if (pad && pad.move.lengthSq() > 0) source = 'gamepad';

      if (source === 'touch') move.copy(touchMove);
      else if (source === 'gamepad' && pad) move.copy(pad.move);
      else move.copy(keyboard);
      if (move.lengthSq() > 1) move.normalize();

      let talk = talkEdge;
      let menu = menuEdge;
      talkEdge = false;
      menuEdge = false;
      if (pad) {
        if (pad.talk && !gamepadTalk) talk = true;
        if (pad.menu && !gamepadMenu) menu = true;
        gamepadTalk = pad.talk;
        gamepadMenu = pad.menu;
        orbitYaw += pad.lookYaw;
        orbitPitch += pad.lookPitch;
      } else {
        gamepadTalk = false;
        gamepadMenu = false;
      }

      const intent: Intent = {
        move: move.clone(),
        run: runHeld || touchRun || !!pad?.run || keys.has('ShiftLeft') || keys.has('ShiftRight'),
        talk,
        menu,
        orbitYawDelta: orbitYaw,
        orbitPitchDelta: orbitPitch,
        source,
      };
      orbitYaw = 0;
      orbitPitch = 0;
      return intent;
    },
    isControl: controlEl,
    dispose() {
      releaseHeld();
      controls.remove();
      removeEventListener('contextmenu', onContext);
    },
  };
}

export const TOUCH_LAYOUT = {
  base: JOYSTICK_BASE,
  thumb: JOYSTICK_THUMB,
  left: JOYSTICK_LEFT,
  bottom: JOYSTICK_BOTTOM,
  run: TOUCH_RUN,
  talk: TOUCH_TALK,
};
