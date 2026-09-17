import { describe, expect, it } from 'vitest';
import { createGame } from '../../src/engine';
import { phaseOne } from '../fixtures/engine';

describe('real Phase 1 job and consequence sites', () => {
  for (const scene of phaseOne().scenes.filter(scene => scene.kind === 'job')) {
    it(`${scene.id}: completes each consequence route and resumes without losing bindings`, () => {
      const data = phaseOne(), initialWords = Object.fromEntries(scene.requires.map(word => [word, 'met' as const]));
      const game = createGame(data, { wallet: 100, initialWords, seed: 13 });
      game.start(scene.id);
      for (const exchange of scene.exchanges) {
        const frame = game.state().dialogue!;
        expect(frame.exchange.id).toBe(exchange.id);
        const wrong = exchange.replies.findIndex(reply => reply.correct === false);
        if (wrong >= 0) {
          expect(game.reply(wrong)).toBe(false);
          const consequence = data.scenes.find(item => item.id === exchange.onWrong)!;
          expect(game.state().dialogue!.sceneId).toBe(consequence.id);
          for (const retry of consequence.exchanges) game.reply(retry.replies.findIndex(reply => reply.correct));
          expect(game.state().dialogue!.exchange).toEqual(frame.exchange);
          expect(game.state().dialogue!.bindings).toEqual(frame.bindings);
        }
        expect(game.reply(exchange.replies.findIndex(reply => reply.correct))).toBe(true);
      }
      const penalties = scene.exchanges.reduce((total, exchange) => total + Math.max(1, Math.min(5, data.scenes.find(item => item.id === exchange.onWrong)?.cost ?? 1)), 0);
      expect(game.state()).toMatchObject({ dialogue: null, actionSlots: 3, wallet: 100 + (scene.reward ?? 0) - penalties });
      expect(game.state().returns).toEqual([]);
    });
  }
});
