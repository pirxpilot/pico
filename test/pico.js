import test from 'node:test';
import { pico } from '../index.js';

test('pico', t => {
  t.assert.equal(typeof pico, 'function', 'pico exports function');

  const p = pico('bar', {
    createElement(state) {
      const el = document.createElement('span');
      el.textContent = state.text;
      return el;
    },
    update(state) {
      this.element.textContent = state.text;
    }
  });
  const emit = () => {};

  const el = p.render({ text: 'akuku' }, emit);
  t.assert.ok(el instanceof Element);
  t.assert.equal(el.nodeName, 'SPAN');
  const id = el.dataset.pico;
  t.assert.ok(id != null, 'pico should be branded');

  document.body.append(el);

  t.assert.equal(document.body.innerHTML, `<span data-pico="${id}">akuku</span>`);

  const el2 = p.render({ text: 'foo' }, emit);

  t.assert.equal(el2.nodeName, el.nodeName);
  t.assert.ok(el2.isSameNode(el));

  t.assert.equal(document.body.innerHTML, `<span data-pico="${id}">foo</span>`);
});
