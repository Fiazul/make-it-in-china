import { describe, expect, it } from 'vitest';
import { ContentError, createGame } from '../../src/engine';
import { content, exchange, slotted, unbound, withConsequence } from '../fixtures/engine';

describe('scene-scoped slots', () => {
  it('prefers shaky over met and known, substitutes all three text fields', () => {
    const game = createGame(content(slotted()), { initialWords: { 一: 'met', 二: 'shaky', 三: 'known' } }); game.start('job');
    const ex = game.state().dialogue!.exchange;
    expect(ex.line).toMatchObject({ hanzi: '二杯子', pinyin: 'èr bēizi', en: 'two cups', words: ['杯子', '二'] });
    expect(ex.replies[0]).toMatchObject({ hanzi: '二', pinyin: 'èr', en: 'two', words: ['杯子', '二'] });
    game.reply(0); expect(game.state().words['二'].state).toBe('known');
  });
  it('falls back to met before known', () => {
    const game = createGame(content(slotted()), { initialWords: { 一: 'known', 二: 'met' } }); game.start('job');
    expect(game.state().dialogue!.bindings.n.hanzi).toBe('二');
  });
  it('can reuse known words when no met or shaky word is eligible', () => {
    const game = createGame(content(slotted()), { initialWords: { 三: 'known' } }); game.start('job');
    expect(game.state().dialogue!.bindings.n.hanzi).toBe('三');
  });
  it('never chooses an unseen word outside introduces', () => {
    const game = createGame(content(slotted())); const before = game.state();
    expect(() => game.start('job')).toThrow(ContentError); expect(game.state()).toEqual(before);
  });
  it('allows an unseen word explicitly introduced by the scene', () => {
    const first = slotted(); first.introduces.push('三'); const game = createGame(content(first)); game.start('job');
    expect(game.state().dialogue!.bindings.n.hanzi).toBe('三'); expect(game.state().words['三'].state).toBe('met');
  });
  it('requires eligibility for every word in a pool value', () => {
    const data = content(slotted()); data.world.slotPools[0].values[0].words.push('陌生');
    const game = createGame(data, { initialWords: { 一: 'shaky', 二: 'met' } }); game.start('job');
    expect(game.state().dialogue!.bindings.n.hanzi).toBe('二');
  });
  it('reuses bindings in later lines and replies', () => {
    const first = slotted(), later = exchange('e2'); later.line.hanzi = '{n}'; later.replies[0].hanzi = '{n}'; first.exchanges.push(later);
    const game = createGame(content(first), { initialWords: { 二: 'met' } }); game.start('job'); game.reply(0);
    expect(game.state().dialogue!.exchange.line.hanzi).toBe('二'); expect(game.state().dialogue!.exchange.replies[0].hanzi).toBe('二');
    expect(game.state().dialogue!.exchange.replies[0].words).toContain('二');
  });
  it('rebinds a later declaration using its new pool', () => {
    const first = slotted(), later = exchange('e2'); later.slots = { n: 'other' }; later.line.hanzi = '{n}'; first.exchanges.push(later);
    const data = content(first); data.world.slotPools.push({ id: 'other', values: [data.world.slotPools[0].values[1]] });
    const game = createGame(data, { initialWords: { 一: 'shaky', 二: 'met' } }); game.start('job');
    expect(game.state().dialogue!.bindings.n.hanzi).toBe('一'); game.reply(0); expect(game.state().dialogue!.bindings.n.hanzi).toBe('二');
  });
  it.each(['hanzi', 'pinyin', 'en'] as const)('rejects an unbound reply %s at start', field => {
    const data = unbound(); data.scenes[0].exchanges[0].replies[0].hanzi = '好'; data.scenes[0].exchanges[0].replies[0][field] = '{missing}';
    expect(() => createGame(data).start('job')).toThrow(ContentError);
  });
  it('pre-scans later exchanges and consequences before charging an action', () => {
    const data = withConsequence(); data.scenes[1].exchanges[0].line.hanzi = '{later}';
    const game = createGame(data); expect(() => game.start('job')).toThrow(ContentError); expect(game.state().actionSlots).toBe(4);
  });
  it.each(['hanzi', 'pinyin', 'en'] as const)('rejects unbound line %s in a later exchange at start', field => {
    const first = slotted(), later = exchange('later'); later.line[field] = '{missing}'; first.exchanges.push(later);
    expect(() => createGame(content(first), { initialWords: { 一: 'met' } }).start('job')).toThrow(ContentError);
  });
  it('rejects forward routes that skip a required binding at start', () => {
    const first = slotted(), early = exchange('early'), last = exchange('last');
    early.replies[0].next = 'last'; last.line.hanzi = '{n}'; first.exchanges.unshift(early); first.exchanges.push(last);
    expect(() => createGame(content(first), { initialWords: { 一: 'met' } }).start('job')).toThrow(ContentError);
  });
  it('tags acknowledgement replies with the filled line slot words', () => {
    const first = slotted(); first.exchanges[0].replies[0] = exchange().replies[0];
    const game = createGame(content(first), { initialWords: { 一: 'met' } }); game.start('job');
    expect(game.state().dialogue!.exchange.replies[0].words).toContain('一');
  });
  it('does not permit a later binding to satisfy an earlier placeholder', () => {
    const first = slotted(); first.exchanges.unshift({ ...exchange('early'), line: { ...exchange().line, hanzi: '{n}' } });
    expect(() => createGame(content(first)).start('job')).toThrow(ContentError);
  });
  it('produces the same sequence for equal seeds without mutating content', () => {
    const data = content(slotted()), before = structuredClone(data);
    const opts = { seed: 923, initialWords: { 一: 'met', 二: 'met', 三: 'met' } } as const;
    const first = createGame(data, opts), second = createGame(data, opts);
    for (let i = 0; i < 4; i++) { first.start('job'); second.start('job'); expect(first.state().dialogue).toEqual(second.state().dialogue); first.reply(0); second.reply(0); }
    expect(data).toEqual(before);
  });
});
