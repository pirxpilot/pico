import test from 'node:test';
import { cache } from '../index.js';

test('cache', t => {
  t.assert.equal(typeof cache, 'function', 'cache exports function');

  const state = {};
  const emit = () => {};

  cache(state, null, { emit });

  t.assert.ok(state.cache, 'cache is added to state');
  t.assert.equal(JSON.stringify(state), '{"cache":null}', 'cache is not stringified');

  const calls = {
    make: 0
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
  t.assert.ok(el1, 'component created');
  t.assert.equal(calls.make, 1, 'make called');
  t.assert.equal(el1.state, state);
  t.assert.equal(el1.emit, emit);
  t.assert.equal(el1.key, 'abc');

  const el2 = state.cache(make, 'abc');
  t.assert.equal(el1, el2, 'component returned from cache');

  const el3 = state.cache(make, 'def');
  t.assert.ok(el1 !== el3, 'component returned from cache');
  t.assert.equal(calls.make, 2, 'make called again');
  t.assert.equal(el3.key, 'def');
});

test('cache with key function', t => {
  t.assert.equal(typeof cache, 'function', 'cache exports function');

  const state = {};
  const emit = () => {};

  cache(state, null, { emit });

  t.assert.ok(state.cache, 'cache is added to state');
  t.assert.equal(JSON.stringify(state), '{"cache":null}', 'cache is not stringified');

  function make(_key, param) {
    return {
      param
    };
  }
  // key ignores 2nd parameter
  make.key = key => `my:${key}`;

  const el1 = state.cache(make, 'abc', 'def');
  t.assert.ok(el1, 'component created');
  t.assert.equal(el1.param, 'def');

  const el2 = state.cache(make, 'abc', 'xyz');
  t.assert.equal(el1, el2, 'component returned from cache');
});
