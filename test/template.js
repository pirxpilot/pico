const test = require('node:test');
const { template } = require('..');

test('template', t => {
  document.body.innerHTML = `
    <template id='foo'>
      <span>bongo</span>
    </template>
  `;
  const tt = template('foo');
  const el = tt.render({}, () => {});
  t.assert.equal(el.outerHTML, `<span data-pico="${el.dataset.pico}">bongo</span>`);
});

test('template updateElement', t => {
  document.body.innerHTML = `
    <template id='bongo'>
      <input>
    </template>
  `;
  const tt = template('bongo', {
    updateElement(el, state) {
      el.value = state.value;
    }
  });
  const el = tt.render({ value: 5 }, () => {});
  t.assert.equal(el.value, '5');
});

test('template with slots', t => {
  document.body.innerHTML = `
    <template id='form'>
      <form>
        <slot name='field'/>
        <button>OK</button>
      </fomr>
    </template>
    <template id='field'>
      <div>
        <label>Label:</label>
        <input>
      </div>
    <template>
  `;
  const tt = template('form').slot('field', template('field'));
  const el = tt.render({}, () => {});

  t.assert.equal(el.nodeName, 'FORM', 'rendered element is a form');
  t.assert.equal(el.querySelector('label').textContent, 'Label:', 'label is rendered');
  t.assert.ok(el.querySelector('input'), 'input is rendered');
});
