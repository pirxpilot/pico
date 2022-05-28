const test = require('tape');
const { pico } = require('..');

test('pico', function (t) {
  t.assert(typeof pico === 'function', 'pico exports function');

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
  t.assert(el instanceof Element);
  t.equal(el.nodeName, 'SPAN');
  const id = el.dataset.pico;
  t.assert(id != null, 'pico should be branded');

  document.body.append(el);

  t.equal(
    document.body.innerHTML,
    `<span data-pico="${id}">akuku</span>`
  );

  const el2 = p.render({ text: 'foo'}, emit);

  t.equal(el2.nodeName, el.nodeName);
  t.assert(el2.isSameNode(el));

  t.equal(
    document.body.innerHTML,
    `<span data-pico="${id}">foo</span>`
  );

  t.end();
});
