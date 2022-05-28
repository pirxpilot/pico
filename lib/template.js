const { fromTemplate, replaceSlots } = require('./tools');
const makeHandler = require('./events');
const makePico = require('./pico');

module.exports = makeTemplate;

Object.assign(makeTemplate, {
  fromTemplate(template, ...args) {
    return ({ cache }) => cache(makeTemplate, template).render(...args);
  }
});

function makeTemplate(template, {
  updateElement,
  ...publicProperties
} = {}) {

  let handler;
  let slots;

  const self = makePico(`template:${template}`, {
    createElement,
    update,
    beforerender,
    on,
    slot,
    ...publicProperties
  });
  return self;

  function createElement(...args) {
    const el = fromTemplate(template);
    if (slots) {
      createSlots(el, ...args);
    }
    if (updateElement) {
      updateElement(el, ...args);
    }
    return el;
  }

  function update(...args) {
    if (slots) {
      updateSlots(...args);
    }
    if (updateElement) {
      updateElement(self.element, ...args);
    }
  }

  function on(...args) {
    if (!handler) {
      handler = makeHandler();
    }
    handler.handle(...args);
    return self;
  }

  function slot(name, component) {
    if (!slots) {
      slots = [];
    }
    const render = typeof component === 'function' ?
      component :
      component.render;
    slots.push([name, render]);
    return self;
  }

  function createSlots(el, ...args) {
    const replacements = slots.map(
      ([name, render]) => [name, render(...args)]
    );
    replaceSlots(el, replacements);
  }

  function updateSlots(...args) {
    slots.forEach(info => info[1](...args));
  }

  function beforerender(el) {
    if (handler) {
      handler.attach(el);
    }
  }
}
