import test from 'node:test';
import { events } from '../index.js';

test('events', t => {
  t.assert.equal(typeof events, 'function', 'events exports function');
});
