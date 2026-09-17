import type { GameState } from '../engine';
import type { Location, Word } from '../content/types';

function pointerAction(element: HTMLElement, action: () => void): void {
  element.addEventListener('pointerup', event => {
    event.preventDefault();
    action();
  });
}

export function createNotebook(
  root: HTMLElement,
  words: Word[],
  locations: Location[],
  onExport: () => string,
  onImport: (save: string) => void,
) {
  const byHanzi = new Map(words.map(word => [word.hanzi, word]));
  const locationNames = new Map(locations.map(location => [location.id, location.name]));
  const button = document.createElement('button');
  button.id = 'notebook-button';
  button.type = 'button';
  button.textContent = '词本';
  const panel = document.createElement('aside');
  panel.id = 'notebook-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header><h2>词本</h2><button id="notebook-close" type="button" aria-label="Close">×</button></header>
    <div id="notebook-words"></div>
    <label for="save-string">Save string</label>
    <textarea id="save-string" rows="3" spellcheck="false"></textarea>
    <div class="save-actions">
      <button id="export-save" type="button">Export</button>
      <button id="import-save" type="button">Import</button>
    </div>
    <div id="save-status" role="status"></div>`;
  root.append(button, panel);
  const list = panel.querySelector<HTMLElement>('#notebook-words')!;
  const textarea = panel.querySelector<HTMLTextAreaElement>('#save-string')!;
  const status = panel.querySelector<HTMLElement>('#save-status')!;
  pointerAction(button, () => { panel.hidden = false; });
  pointerAction(panel.querySelector<HTMLElement>('#notebook-close')!, () => { panel.hidden = true; });
  pointerAction(panel.querySelector<HTMLElement>('#export-save')!, () => {
    textarea.value = onExport();
    textarea.select();
    status.textContent = 'Save exported.';
  });
  pointerAction(panel.querySelector<HTMLElement>('#import-save')!, () => {
    try {
      onImport(textarea.value.trim());
      status.textContent = 'Save imported.';
      panel.hidden = false;
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Import failed.';
    }
  });

  return {
    render(state: GameState): void {
      const grouped = new Map<string, Array<{ word: Word; state: string }>>();
      for (const hanzi of Object.keys(state.words)) {
        const progress = state.words[hanzi];
        if (progress.state === 'unseen') continue;
        const word = byHanzi.get(hanzi);
        if (!word) continue;
        const location = progress.firstSeen?.location ?? 'starter';
        const group = grouped.get(location) ?? [];
        group.push({ word, state: progress.state });
        grouped.set(location, group);
      }
      list.replaceChildren();
      for (const [location, entries] of grouped) {
        const section = document.createElement('section');
        const heading = document.createElement('h3');
        heading.textContent = location === 'starter' ? '已会 · Starter words' : (locationNames.get(location) ?? location);
        section.append(heading);
        for (const entry of entries.sort((a, b) => a.word.hanzi.localeCompare(b.word.hanzi))) {
          const row = document.createElement('div');
          row.className = `notebook-word state-${entry.state}`;
          row.textContent = `${entry.word.hanzi} · ${entry.word.pinyin} · ${entry.word.en} — ${entry.state}`;
          section.append(row);
        }
        list.append(section);
      }
      if (!grouped.size) list.textContent = 'Tap words in conversation to fill your notebook.';
    },
  };
}
