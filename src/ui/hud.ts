import type { GameState } from '../engine';

export function createHud(root: HTMLElement) {
  const element = document.createElement('aside');
  element.id = 'game-hud';
  element.innerHTML = `
    <div><span id="hud-wallet"></span> · <span id="hud-day"></span></div>
    <div id="hud-objective"></div>
    <div id="wallet-toast" aria-live="polite"></div>`;
  root.append(element);
  const wallet = element.querySelector<HTMLElement>('#hud-wallet')!;
  const day = element.querySelector<HTMLElement>('#hud-day')!;
  const objectiveElement = element.querySelector<HTMLElement>('#hud-objective')!;
  const toast = element.querySelector<HTMLElement>('#wallet-toast')!;
  let timer = 0;

  return {
    render(state: GameState, objective: string): void {
      wallet.textContent = `${state.wallet}块`;
      day.textContent = `第${state.day}天`;
      objectiveElement.textContent = objective;
    },
    reward(amount: number): void {
      if (amount <= 0) return;
      toast.textContent = `+${amount}块`;
      toast.classList.remove('show');
      requestAnimationFrame(() => toast.classList.add('show'));
      clearTimeout(timer);
      timer = window.setTimeout(() => toast.classList.remove('show'), 1500);
    },
  };
}
