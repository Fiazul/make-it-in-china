# Audio
Browser-only speech loading, playback, caching, and persisted volume controls.

- `manager.ts` — manifest resolution, Web Audio lifecycle, decoded-buffer LRU, and speech settings.

This module may use DOM and Web Audio APIs. It must not be imported by `src/engine/`.
