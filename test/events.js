const test = require('node:test');
const { events } = require('..');

test('events', t => {
  t.assert.equal(typeof events, 'function', 'events exports function');
});
