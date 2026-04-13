[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# @pirxpilot/pico

Less than nanocomponent. To be used with choo-like libs.

## Install

```sh
$ npm install --save @pirxpilot/pico
```

## Usage

```js
import { pico, template, cache, events, observer, tools } from '@pirxpilot/pico';
```

## API

### `pico(name, options)`

Creates a lightweight component instance with DOM diffing support via [nanomorph].

- `name` — string used for performance timing labels
- `options` — object with the following properties:

| Property | Type | Required | Description |
|---|---|---|---|
| `createElement` | `function(...args): Element` | yes | Returns a new DOM element for the component. Receives the arguments passed to `render()`. |
| `update` | `function(...args): boolean` | no | Determines whether the component should re-render. Receives the arguments passed to `render()`. Defaults to returning `false` (never update). |
| `beforerender` | `function(el)` | no | Called with the element after the first render. |
| `afterupdate` | `function(el)` | no | Called with the element after a morph update. |
| `...publicProperties` | any | no | Any additional properties are exposed directly on the returned component object. |

Returns a component object (`self`) with:

- `self.render(...args)` — renders the component. On the first call, creates a new element via `createElement`. On subsequent calls, consults `update()` and morphs the existing DOM element if it returns `true`. Returns either the element or a proxy placeholder for nanomorph's `isSameNode` check.
- `self.update(...args)` — the update function (can be replaced).
- `self.element` — getter that returns the component's current DOM element (found via `[data-pico]` attribute).

#### Example

```js
import { pico } from '@pirxpilot/pico';

const counter = pico('counter', {
  createElement(state) {
    const el = document.createElement('span');
    el.textContent = state.count;
    return el;
  },
  update(state) {
    this.element.textContent = state.count;
    return true;
  }
});

document.body.append(counter.render({ count: 0 }));
counter.render({ count: 1 }); // morphs the existing element
```

---

### `template(templateId[, options])`

A higher-level component built on top of `pico` that creates elements by cloning an HTML `<template>` element from the page.

- `templateId` — the `id` of a `<template>` element in the DOM
- `options` — optional object:

| Property | Type | Description |
|---|---|---|
| `updateElement` | `function(el, ...args)` | Called during both creation and update with the component's element and the render arguments. Use this to apply dynamic state to the cloned template. |
| `...publicProperties` | any | Any additional properties are exposed directly on the returned component object. |

Returns a component object with:

- `self.render(...args)` — renders the component (inherited from `pico`).
- `self.update(...args)` — the update function (inherited from `pico`).
- `self.element` — getter for the current DOM element (inherited from `pico`).
- `self.on(event, handler[, selector])` — registers a DOM event listener. If `selector` is provided, the listener is attached to the matching child element. Returns `self` for chaining.
- `self.slot(name, component)` — registers a slot replacement. `component` can be a component object (with a `.render` method) or a render function. The slot `<slot name="...">` in the template will be replaced with the rendered output. Returns `self` for chaining.

#### `template.fromTemplate(templateId, ...args)`

Static helper that returns a function suitable for use with `cache`. Usage:

```js
template.fromTemplate('my-template', arg1, arg2)
```

Returns `({ cache }) => cache(makeTemplate, templateId).render(...args)`.

#### Example

```html
<template id="greeting">
  <div class="greeting">
    <span class="message"></span>
    <button class="close">×</button>
  </div>
</template>
```

```js
import { template } from '@pirxpilot/pico';

const greeting = template('greeting', {
  updateElement(el, state) {
    el.querySelector('.message').textContent = state.message;
  }
})
  .on('click', () => console.log('closed!'), '.close');

document.body.append(greeting.render({ message: 'Hello!' }));
```

#### Slots Example

```html
<template id="form">
  <form>
    <slot name="field"></slot>
    <button>OK</button>
  </form>
</template>

<template id="input-field">
  <div>
    <label>Name:</label>
    <input>
  </div>
</template>
```

```js
import { template } from '@pirxpilot/pico';

const form = template('form')
  .slot('field', template('input-field'));

document.body.append(form.render({}, () => {}));
```

---

### `cache(state, emitter, { emit })`

A [choo]-compatible plugin that adds a component cache to `state`. Components are stored in an LRU cache (default size: 100) so they persist across renders and are reused by identity.

- `state` — the choo state object; `state.cache` will be set to the lookup function
- `emitter` — the choo emitter (unused)
- `{ emit }` — object containing the choo `emit` function

After initialization, use `state.cache(Component, ...args)` to get or create component instances:

- `Component` — a constructor function. Called as `new Component(...args, state, emit)` when creating a new instance.
- `...args` — arguments forwarded to the constructor and used to compute the cache key.

#### Cache Keys

By default, the cache key is computed as `Component.name + '$' + args.join('$')`, which requires all args to be strings or numbers.

To customize key computation, define a static `key` function on the component constructor:

```js
function MyComponent(id, options, state, emit) { /* ... */ }
MyComponent.key = (id, _options) => `my:${id}`;

// Only `id` determines the cache key; `options` is ignored for caching
state.cache(MyComponent, 'abc', { color: 'red' });
```

---

### `events()`

Creates a declarative event handler registry for use with `pico` or `template` components.

Returns an object with:

- `self.handle(event, handler[, selector])` — registers an event handler. `event` is the event name (e.g. `'click'`), `handler` is the callback function, and `selector` is an optional CSS selector to scope the listener to a child element. Returns `self` for chaining.
- `self.attach(el)` — attaches all registered handlers to the given element. Sets `el.dataset.morph` so that nanomorph replaces the element rather than morphing it (since morphing doesn't preserve event listeners).

#### Example

```js
import { events } from '@pirxpilot/pico';

const handler = events()
  .handle('click', () => console.log('clicked!'))
  .handle('input', e => console.log(e.target.value), '.search-input');

// Typically used as `beforerender` callback:
const component = pico('my-component', {
  createElement() { /* ... */ },
  beforerender(el) {
    handler.attach(el);
  }
});
```

---

### `observer(idname, selector)`

Creates a DOM mutation observer that watches for elements being added to or removed from the document. Useful for triggering load/unload lifecycle hooks on components.

- `idname` — the `dataset` property name to identify observed elements (e.g. `'pico'` matches `data-pico`)
- `selector` — optional CSS selector to narrow the observed subtree (defaults to `document.body`)

Returns an object with:

- `self.add(id, { load, unload })` — starts observing for an element with `data-{idname}="{id}"`. `load(el, id)` is called when the element is added to the DOM. `unload(el, id)` is called when it is removed. At least one callback must be provided. Automatically starts observing if not already active.
- `self.remove(id)` — stops observing the given id. Disconnects the `MutationObserver` if no more ids are being tracked.

#### Example

```js
import { observer } from '@pirxpilot/pico';

const obs = observer('pico');

obs.add('my-component-id', {
  load(el) {
    console.log('Component mounted', el);
  },
  unload(el) {
    console.log('Component unmounted', el);
  }
});
```

---

### `tools`

Utility functions for working with HTML `<template>` elements.

#### `fromTemplate(name)`

Clones and returns the first child element of the `<template>` element with the given `id`. Results are cached in an LRU cache for performance.

- `name` — the `id` of a `<template>` element in the DOM
- Returns a cloned `Element`

#### `replaceSlots(el, replacements)`

Replaces `<slot>` elements inside `el` with the provided replacement elements.

- `el` — the parent element containing `<slot>` elements
- `replacements` — an array of `[name, element]` pairs, or an object of `{ name: element }` entries

Each `<slot name="...">` matching a replacement name will be replaced with the corresponding element.

#### `initTemplateCache(size)`

Reinitializes the internal template cache. Useful for testing or reconfiguring.

- `size` — maximum number of cached templates (default: `100`)

## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[choo]: https://github.com/choojs/choo
[nanomorph]: https://github.com/choojs/nanomorph

[npm-image]: https://img.shields.io/npm/v/@pirxpilot/pico
[npm-url]: https://npmjs.org/package/@pirxpilot/pico

[build-url]: https://github.com/pirxpilot/pico/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/pirxpilot/pico/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@pirxpilot/pico
[deps-url]: https://libraries.io/npm/@pirxpilot%2Fpico
