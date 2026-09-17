import type { DialogueFrame } from '../engine';
import type { Npc, Word } from '../content/types';

function onPointerUp(element: HTMLElement, action: () => void): void {
  element.addEventListener('pointerup', event => {
    event.preventDefault();
    action();
  });
}

export function createBubble(
  root: HTMLElement,
  words: Word[],
  onReply: (index: number) => void,
  onWord: (word: Word) => void,
) {
  const byHanzi = new Map(words.map(word => [word.hanzi, word]));
  const element = document.createElement('section');
  element.id = 'dialogue-bubble';
  element.hidden = true;
  element.innerHTML = `
    <div class="npc-name"></div>
    <div id="dialogue-line"></div>
    <div id="word-popup" hidden></div>
    <button class="replay-button" type="button" disabled title="audio pending">↻ audio</button>
    <div id="reply-options"></div>`;
  root.append(element);
  const name = element.querySelector<HTMLElement>('.npc-name')!;
  const line = element.querySelector<HTMLElement>('#dialogue-line')!;
  const popup = element.querySelector<HTMLElement>('#word-popup')!;
  const replies = element.querySelector<HTMLElement>('#reply-options')!;

  function renderLine(frame: DialogueFrame, newWords: Set<string>): void {
    line.replaceChildren();
    const candidates = [...new Set(frame.exchange.line.words)]
      .filter(word => byHanzi.has(word))
      .sort((a, b) => b.length - a.length);
    const hanzi = frame.exchange.line.hanzi;
    for (let offset = 0; offset < hanzi.length;) {
      const match = candidates.find(word => hanzi.startsWith(word, offset));
      if (!match) {
        line.append(hanzi[offset]);
        offset += 1;
        continue;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `word-tap${newWords.has(match) ? ' new-word' : ''}`;
      button.textContent = match;
      button.ariaLabel = `Look up ${match}`;
      onPointerUp(button, () => {
        const word = byHanzi.get(match)!;
        onWord(word);
        popup.textContent = `${word.pinyin} · ${word.en}`;
        popup.hidden = false;
      });
      line.append(button);
      offset += match.length;
    }
  }

  return {
    element,
    render(frame: DialogueFrame | null, npc: Npc | undefined, newWords: Set<string>): void {
      element.hidden = !frame;
      if (!frame) return;
      name.textContent = npc ? `${npc.name} · ${npc.label}` : frame.sceneId;
      popup.hidden = true;
      renderLine(frame, newWords);
      replies.replaceChildren();
      frame.exchange.replies.forEach((reply, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'reply-button';
        const hanzi = document.createElement('span');
        hanzi.textContent = reply.hanzi;
        button.append(hanzi);
        if (reply.en) {
          const gloss = document.createElement('small');
          gloss.textContent = reply.en;
          button.append(gloss);
        }
        onPointerUp(button, () => onReply(index));
        replies.append(button);
      });
    },
    anchor(x: number, y: number, visible: boolean): void {
      element.style.left = `${x}px`;
      element.style.top = `${y - 12}px`;
      element.classList.toggle('offscreen', !visible);
    },
  };
}
