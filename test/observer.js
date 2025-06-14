const test = require('node:test');
const { observer } = require('..');

test('observer', t => {
  t.assert.equal(typeof observer, 'function', 'observer exports function');
});
