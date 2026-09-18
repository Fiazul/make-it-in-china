import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: (globalThis as any).process?.env?.GITHUB_PAGES ? '/make-it-in-china/' : '/',
  test: {
    environment: 'node',
  },
});
