import assert from 'assert';

export default function observer(idname, selector) {
  const loaders = Object.create(null);
  const unloaders = Object.create(null);
  const mo = new MutationObserver(onmutations);
  let target = false;

  const self = {
    add,
    remove
  };
  return self;

  function add(id, { load, unload }) {
    assert(load || unload, 'at least one of the load/unload callbacks needs to be specified');
    if (load) {
      loaders[id] = load;
    }
    if (unload) {
      unloaders[id] = unload;
    }
    ensureActive();
  }

  function remove(id) {
    delete loaders[id];
    delete unloaders[id];
    maybeDisconnect();
  }

  function ensureActive() {
    if (target) {
      return;
    }
    target = selector ? document.body.querySelector(selector) : document.body;
    mo.observe(target, {
      subtree: true,
      childList: true
    });
  }

  function maybeDisconnect() {
    if (!target) {
      return;
    }
    if (Object.keys(loaders).length > 0) {
      return;
    }
    if (Object.keys(unloaders).length > 0) {
      return;
    }
    mo.disconnect();
    target = false;
  }

  function onmutations(mutations) {
    for (const { addedNodes, removedNodes } of mutations) {
      notifyNodes(removedNodes, unloaders, false);
      notifyNodes(addedNodes, loaders, true);
    }
  }

  function notifyNodes(nodes, listeners, expectedIn) {
    for (const el of nodes) {
      const id = el.dataset?.[idname];
      if (!id) {
        continue;
      }
      const listener = listeners[id];
      if (!listener) {
        continue;
      }
      if (expectedIn === target.contains(el)) {
        listener(el, id);
      }
    }
  }
}
