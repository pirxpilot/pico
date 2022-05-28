const test = require('tape');
const { cache } = require('..');

test('cache', function (t) {
  t.assert(typeof cache === 'function', 'cache exports function');


  const state = {};
  const emit = () => { };

  cache(state, null, { emit });

  t.assert(state.cache, 'cache is added to state');
  t.equal(JSON.stringify(state), '{"cache":null}', 'cache is not stringified');

  const calls = {
    make: 0,
  };

  function make(key, state, emit) {
    calls.make += 1;
    return {
      key,
      state,
      emit
    };
  }

  const el1 = state.cache(make, 'abc');
  t.assert(el1, 'component created');
  t.equal(calls.make, 1, 'make called');
  t.is(el1.state, state);
  t.is(el1.emit, emit);
  t.is(el1.key, 'abc');

  const el2 = state.cache(make, 'abc');
  t.is(el1, el2, 'component returned from cache');

  const el3 = state.cache(make, 'def');
  t.isNot(el1, el3, 'component returned from cache');
  t.equal(calls.make, 2, 'make called again');
  t.is(el3.key, 'def');

  t.end();
});


test('cache with key function', function (t) {
  t.assert(typeof cache === 'function', 'cache exports function');


  const state = {};
  const emit = () => { };

  cache(state, null, { emit });

  t.assert(state.cache, 'cache is added to state');
  t.equal(JSON.stringify(state), '{"cache":null}', 'cache is not stringified');

  function make(key, param) {
    return {
      param
    };
  }
  // key ignores 2nd parameter
  make.key = key => `my:${key}`;

  const el1 = state.cache(make, 'abc', 'def');
  t.assert(el1, 'component created');
  t.is(el1.param, 'def');

  const el2 = state.cache(make, 'abc', 'xyz');
  t.is(el1, el2, 'component returned from cache');

  t.end();
});
