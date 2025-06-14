const assert = require('assert');
const LRU = require('nanolru');

module.exports = setCache;

function setCache(state, _emitter, { emit }) {
  state.cache = cache(state, emit);

  // make sure `state.cache` isn't stringified
  state.cache.toJSON = () => null;
}

function cache(state, emit, size = 100) {
  assert(typeof state === 'object', 'cache: state should be type object');
  assert(typeof emit === 'function', 'cache: emit should be type function');

  const lru = new LRU(size);

  return lookup;

  // Get & create component instances.
  function lookup(Component, ...args) {
    assert(typeof Component === 'function', 'cache: Component should be type function');

    const key = calculateKey(Component, ...args);
    let el = lru.get(key);
    if (!el) {
      el = new Component(...args, state, emit);
      lru.set(key, el);
    }
    return el;
  }
}

function calculateKey(Component, ...args) {
  if (typeof Component.key === 'function') {
    return Component.key(...args);
  }
  assert(
    args.every(a => typeof a === 'string' || typeof a === 'number'),
    'cache: component should have "key" function or id should be string/number'
  );
  return [Component.name, ...args].join('$');
}
