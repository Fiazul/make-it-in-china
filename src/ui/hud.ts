import type { GameState } from '../engine';

type Toast = { text: string; tone: 'gain' | 'loss' | 'notice' };

export function createHud(root: HTMLElement, onSleep: () => void) {
  const element = document.createElement('aside');
  element.id = 'game-hud';
  element.innerHTML = `
    <div><span id="hud-wallet"></span> · <span id="hud-day"></span></div>
    <div id="hud-objective"></div>
    <button id="sleep-button" type="button">睡觉 · Sleep</button>
    <div id="wallet-toast" aria-live="polite" hidden></div>`;
  root.append(element);
  const wallet = element.querySelector<HTMLElement>('#hud-wallet')!;
  const day = element.querySelector<HTMLElement>('#hud-day')!;
  const objectiveElement = element.querySelector<HTMLElement>('#hud-objective')!;
  const sleep = element.querySelector<HTMLButtonElement>('#sleep-button')!;
  const toast = element.querySelector<HTMLElement>('#wallet-toast')!;
  const queue: Toast[] = [];
  let showing = false;
  sleep.addEventListener('pointerup', event => {
    event.preventDefault();
    onSleep();
  });

  function showNext(): void {
    const next = queue.shift();
    if (!next) {
      showing = false;
      return;
    }
    showing = true;
    toast.textContent = next.text;
    toast.className = next.tone;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('show'));
    window.setTimeout(() => {
      toast.classList.remove('show');
      window.setTimeout(() => {
        toast.hidden = true;
        toast.textContent = '';
        showNext();
      }, 200);
    }, 1600);
  }

  return {
    render(state: GameState, objective: string): void {
      wallet.textContent = `${state.wallet}块`;
      day.textContent = `第${state.day}天`;
      objectiveElement.textContent = objective;
      sleep.hidden = state.dialogue !== null;
    },
    walletChange(amount: number): void {
      if (amount === 0) return;
      queue.push({
        text: `${amount > 0 ? '+' : ''}${amount}块`,
        tone: amount > 0 ? 'gain' : 'loss',
      });
      if (!showing) showNext();
    },
    toast(text: string): void {
      queue.push({ text, tone: 'notice' });
      if (!showing) showNext();
    },
  };
}
