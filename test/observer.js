import test from 'node:test';
import { observer } from '../index.js';

test('observer', t => {
  t.assert.equal(typeof observer, 'function', 'observer exports function');
});
