const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('./core.js');

test('classifies the strongest procrastination trigger', () => {
  assert.equal(Core.classifyExcuse('I am too tired to work out tonight'), 'fatigue');
  assert.equal(Core.classifyExcuse('My coding project feels overwhelming and hard'), 'overwhelmed');
  assert.equal(Core.classifyExcuse('I will start next week when I have more time'), 'time');
});

test('derives personalized advice from a user history', () => {
  const advice = Core.getPersonalizedAdvice([{ category: 'fatigue' }, { category: 'gym' }, { category: 'fatigue' }]);
  assert.equal(advice.trigger, 'fatigue');
  assert.equal(advice.occurrences, 2);
  assert.match(advice.message, /Energy/);
});

test('normalizes valid model output and rejects incomplete output', () => {
  const result = Core.normalizeResponse({ excuse: 'Fear of starting', callout: 'Start small.', action: 'Open the document.' }, false);
  assert.deepEqual(result.action_steps, ['Open the document.']);
  assert.throws(() => Core.normalizeResponse({ excuse: 'Fear' }, false), /incomplete/);
});

test('response orchestrator safely falls back when remote generation fails', async () => {
  const generate = Core.createResponseOrchestrator({
    remote: async () => { throw new Error('network down'); },
    fallback: () => ({ excuse: 'Local pattern', callout: 'Keep moving.', action: 'Set a two-minute timer.' })
  });
  const outcome = await generate({ roadmapMode: false });
  assert.equal(outcome.source, 'local');
  assert.equal(outcome.response.action_steps[0], 'Set a two-minute timer.');
});

test('requestJson reports timeouts clearly', async () => {
  await assert.rejects(
    () => Core.requestJson('https://example.invalid', {}, () => Promise.reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))),
    /timed out/
  );
});
