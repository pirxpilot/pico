const test = require('tape');
const { events } = require('..');

test('events', function (t) {
  t.assert(typeof events === 'function', 'events exports function');
  t.end();
});
