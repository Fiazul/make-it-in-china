# Content preview

DOM-only Stage-4 authoring view.

- `main.ts` loads the Phase 1 JSON, runs the shared strict checker, and renders scenes, exchanges, stable content sites, issues, novelty, and coverage.
- `style.css` provides the minimal readable layout and blocked/passed states.

Start with `npm run dev`, then open `/preview.html`. A red banner means at least one strict `FAIL` is blocking the content.
