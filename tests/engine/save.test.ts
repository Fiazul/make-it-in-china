import { describe, expect, it } from 'vitest';
import { createGame, encodeSave, EVENT_LIMIT, loadJSON, SaveError, UnsupportedSaveVersionError } from '../../src/engine';
import { content, slotted, withConsequence } from '../fixtures/engine';

describe('versioned saves', () => {
  it('round-trips JSON and base64 including Unicode and instrumentation', () => {
    const game = createGame(content()); game.start('job'); game.tapWord('杯子');
    expect(loadJSON(game.saveJSON())).toEqual(game.state()); expect(JSON.parse(game.saveJSON()).v).toBe(1);
    const resumed = createGame(content()); resumed.importString(game.exportString()); expect(resumed.state()).toEqual(game.state());
    resumed.reply(0); game.reply(0); expect(resumed.state()).toEqual(game.state());
  });
  it('restores a mid-consequence return stack', () => {
    const game = createGame(withConsequence()); game.start('job'); game.reply(1);
    const resumed = createGame(withConsequence()); resumed.importString(game.exportString()); resumed.reply(0);
    expect(resumed.state().dialogue!.sceneId).toBe('job'); expect(resumed.state().dialogue!.attempts.e1).toBe(1);
    expect(resumed.state().wallet).toBe(18);
  });
  it('restores RNG and tuning rules for identical future choices', () => {
    const data = content(slotted()), game = createGame(data, { seed: 42, foodCost: 0, initialWords: { 一: 'met', 二: 'met', 三: 'met' } });
    game.start('job'); game.reply(0); const resumed = createGame(data); resumed.importString(game.exportString());
    game.start('job'); resumed.start('job'); expect(resumed.state()).toEqual(game.state());
  });
  it('throws a typed error for unknown save versions', () => {
    try { loadJSON('{"v":2}'); throw new Error('Expected version rejection'); }
    catch (error) { expect(error).toBeInstanceOf(UnsupportedSaveVersionError); expect((error as UnsupportedSaveVersionError).version).toBe(2); }
  });
  it.each(['{', 'null', '[]', '{"v":1}', '{"v":1,"wallet":-1}'])('rejects malformed JSON/state %s', json => {
    expect(() => loadJSON(json)).toThrow(SaveError);
  });
  it('rejects invalid base64 without replacing the current state', () => {
    const game = createGame(content()); const before = game.state();
    expect(() => game.importString('%%%')).toThrow(SaveError); expect(game.state()).toEqual(before);
  });
  it('rejects structurally invalid saved frames', () => {
    const game = createGame(content()); game.start('job'); const state = game.state(); state.dialogue!.exchange.line.words = null as never;
    expect(() => game.importString(encodeSave(state))).toThrow(SaveError);
  });
  it('rejects a saved exchange index inconsistent with content', () => {
    const game = createGame(content()); game.start('job'); const state = game.state(); state.dialogue!.index = 99;
    expect(() => game.importString(encodeSave(state))).toThrow(SaveError);
  });
  it('caps loaded and newly appended events at 2000 while preserving order', () => {
    const game = createGame(content(), { initialWords: { 杯子: 'met' } }), state = game.state();
    state.events = Array.from({ length: EVENT_LIMIT + 5 }, (_, i) => ({ type: 'day', day: 1, data: { day: i + 1, rentDue: false, graceUntil: null } }));
    const loaded = loadJSON(JSON.stringify(state)); expect(loaded.events).toHaveLength(EVENT_LIMIT); expect(loaded.events[0].data).toMatchObject({ day: 6 });
    game.importString(encodeSave(state)); game.tapWord('杯子'); const events = game.state().events;
    expect(events).toHaveLength(EVENT_LIMIT); expect(events[0].data).toMatchObject({ day: 7 }); expect(events.at(-1)?.type).toBe('word');
    const resumed = createGame(content()); resumed.importString(game.exportString()); expect(resumed.state().events).toEqual(events);
  });
  it.each([{ actionSlots: 0 }, { foodCost: -1 }, { decayDays: 0 }, { graceDays: 0 }, { wrongPenalty: 6 }])('rejects invalid tuning %j', options => {
    expect(() => createGame(content(), options)).toThrow(SaveError);
  });
});
