# UI
DOM interface for dialogue, status, screens, and learner tools. Text remains outside WebGL for zoom, selection, and assistive technology.

- `activityAvailability.ts` — pure availability-reason derivation shared by the activity chooser and the notebook's mentor topics; no DOM.
- `bubble.ts` — sequenced speech, pinyin and word help, reply preview/selection, replay, hints, message/notice cards, the activity chooser, and assisted-flag hooks.
- `hud.ts` — day, action slots, wallet changes, objective, mute, menu, sleep, gate badge, and live toasts.
- `modal.ts` — shared keyboard focus trap and focus restoration.
- `notebook.ts` — vocabulary filters, learner-state rows, first-seen details, word/sentence audio, mentor topics, and inventory.
- `preferences.ts` — validated persisted pinyin and text-size settings.
- `shell.ts` — title, pause, settings, help, credits, save transfer, sleep, money ledger, leave-conversation confirm, rent, and gate surfaces.
- `index.ts` — public UI exports.
- `../style.css` — ART token implementation and responsive desktop/phone layouts.
