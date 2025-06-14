const test = require('tape');
const { observer } = require('..');

test('observer', t => {
  t.assert(typeof observer === 'function', 'observer exports function');
  t.end();
});
