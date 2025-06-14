import assert from 'assert';
import morph from '@pirxpilot/nanomorph';
import perf from '@pirxpilot/nanotiming';
import { generator } from 'ufid';

const uid = generator({ size: 6 });

const noop = () => {};
const isBrowser = typeof window !== 'undefined';

export default function pico(
  name,
  {
    createElement,
    beforerender = noop,
    afterupdate = noop,
    update = shouldNotUpdate,
    ...publicProperties // properties exposed on `self`
  }
) {
  assert(createElement, 'pico: createElement should be provided');

  const pcID = uid(); // internal pico id
  let proxy;

  const self = {
    ...publicProperties,
    render: isBrowser ? render : coldRender,
    update
  };
  Object.defineProperty(self, 'element', {
    get: isBrowser ? getElement : noop
  });
  return self;

  function getElement() {
    return document.querySelector(`[data-pico="${pcID}"]`);
  }

  // version of render used on the server
  function coldRender(...args) {
    const doneRender = perf(`${name}.render`);
    const doneCreateElement = perf(`${name}.createElement`);
    const el = createElement(...args);
    doneCreateElement();
    doneRender();
    return el;
  }

  function render(...args) {
    const doneRender = perf(`${name}.render`);

    let el = self.element;
    if (!el) {
      el = handleRender(args);
      beforerender(el);
      doneRender();
      return el;
    }

    const doneUpdate = perf(`${name}.update`);
    const shouldUpdate = self.update(...args);
    doneUpdate();

    if (shouldUpdate) {
      const desiredHtml = handleRender(args);

      const doneMorph = perf(`${name}.morph`);
      morph(el, desiredHtml);
      afterupdate(el);
      doneMorph();
    }
    if (!proxy) {
      proxy = createProxy(el, pcID);
    }
    doneRender();
    return proxy;
  }

  function handleRender(args) {
    const doneCreateElement = perf(`${name}.createElement`);
    const el = createElement(...args);
    doneCreateElement();

    assert(el instanceof Element, 'pico: createElement should return a single DOM node');

    el.dataset.pico = pcID;
    return el;
  }
}

function createProxy({ nodeName }, pico) {
  return {
    nodeName,
    dataset: { pico },
    isSameNode
  };
}

function isSameNode(el) {
  return this.dataset.pico === el?.dataset.pico;
}

function shouldNotUpdate() {
  return false;
}
