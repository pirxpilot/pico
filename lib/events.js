import assert from 'assert';

export default function handler() {
  const handlers = [];

  const self = {
    handle,
    attach
  };
  return self;

  function handle(...args) {
    assert(typeof args[0] === 'string', 'event has to be a string');
    assert(typeof args[1] === 'function', 'handler has to be a string');
    assert(args.length < 3 || typeof args[2] === 'string', 'selector has to be a string');

    handlers.push(args);
    return self;
  }

  function attach(el) {
    for (const [event, handler, selector] of handlers) {
      const target = selector ? el.querySelector(selector) : el;
      target.addEventListener(event, handler);
    }
    // nanomorph doesn't know how to morph elements with attached event listeners
    // tell nanomorph to replace them (not to morph them)
    el.dataset.morph = el.dataset.pico;
  }
}
