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
  onWord: (word: string) => void,
  onDismiss: () => void,
) {
  const byHanzi = new Map(words.filter(word => !word.bonus).map(word => [word.hanzi, word]));
  const bonusByHanzi = new Map(words.filter(word => word.bonus).map(word => [word.hanzi, word]));
  const wordInfo = (hanzi: string): Word | undefined => byHanzi.get(hanzi) ?? bonusByHanzi.get(hanzi);
  const element = document.createElement('section');
  element.id = 'dialogue-bubble';
  element.hidden = true;
  element.innerHTML = `
    <div class="npc-name"></div>
    <div id="dialogue-line"></div>
    <div id="word-popup" hidden></div>
    <button class="replay-button" type="button" disabled title="audio pending">↻ audio</button>`;
  const replies = document.createElement('div');
  replies.id = 'reply-options';
  replies.hidden = true;
  root.append(element, replies);
  const name = element.querySelector<HTMLElement>('.npc-name')!;
  const line = element.querySelector<HTMLElement>('#dialogue-line')!;
  const popup = element.querySelector<HTMLElement>('#word-popup')!;

  function reset(): void {
    element.hidden = true;
    element.classList.remove('below', 'offscreen');
    name.textContent = '';
    line.replaceChildren();
    popup.hidden = true;
    popup.textContent = '';
    replies.hidden = true;
    replies.replaceChildren();
  }

  function renderLine(frame: DialogueFrame, newWords: Set<string>): void {
    line.replaceChildren();
    const candidates = [...new Set(frame.exchange.line.words)]
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
        const word = wordInfo(match);
        onWord(match);
        popup.textContent = word ? `${word.pinyin} · ${word.en}` : `${match} · gloss pending`;
        popup.hidden = false;
      });
      line.append(button);
      offset += match.length;
    }
  }

  return {
    element,
    render(frame: DialogueFrame | null, npc: Npc | undefined, newWords: Set<string>): void {
      reset();
      if (!frame) return;
      element.hidden = false;
      replies.hidden = false;
      name.textContent = npc ? `${npc.name} · ${npc.label}` : frame.sceneId;
      renderLine(frame, newWords);
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
    message(hanzi: string, en: string | undefined, npc: Npc | undefined): void {
      reset();
      element.hidden = false;
      replies.hidden = false;
      name.textContent = npc ? `${npc.name} · ${npc.label}` : '提示 · Notice';
      if (!npc) {
        element.style.left = '50%';
        element.style.top = '35%';
        element.classList.add('below');
      }
      line.append(hanzi);
      if (en) {
        const gloss = document.createElement('small');
        gloss.className = 'message-gloss';
        gloss.textContent = en;
        line.append(gloss);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reply-button';
      button.textContent = '好 · OK';
      onPointerUp(button, () => {
        reset();
        onDismiss();
      });
      replies.append(button);
    },
    anchor(x: number, y: number, visible: boolean): void {
      const margin = 12;
      const gap = 12;
      const nameClearance = 30;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const left = Math.min(
        Math.max(x, margin + width / 2),
        Math.max(margin + width / 2, innerWidth - margin - width / 2),
      );
      const roomAbove = y - gap - margin - nameClearance;
      const roomBelow = innerHeight - margin - y - gap;
      const below = roomAbove < height && roomBelow > roomAbove;
      const minTop = below ? margin + nameClearance : margin + nameClearance + height;
      const maxTop = below ? innerHeight - margin - height : innerHeight - margin;
      const desiredTop = below ? y + gap : y - gap;
      element.style.left = `${left}px`;
      element.style.top = `${Math.min(Math.max(desiredTop, minTop), Math.max(minTop, maxTop))}px`;
      element.classList.toggle('below', below);
      element.classList.toggle('offscreen', !visible);
    },
  };
}
