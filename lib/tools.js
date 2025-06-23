import assert from 'assert';
import LRU from 'nanolru';

export default {
  initTemplateCache,
  fromTemplate,
  replaceSlots
};

let cache;

initTemplateCache();

export function initTemplateCache(size = 100) {
  cache = new LRU(size);
}

export function fromTemplate(name) {
  let node = cache.get(name);
  if (node === undefined) {
    const template = document.getElementById(name);
    assert(template, `expected ${name} template element on page`);
    assert(template.nodeName === 'TEMPLATE', `expected ${name} to be template not ${template.nodeName}`);
    node = template.content.firstElementChild;
    cache.set(name, node);
  }
  return node.cloneNode(true);
}

export function replaceSlots(el, replacements) {
  const entries = Array.isArray(replacements) ? replacements : Object.entries(replacements);
  for (const [name, replacement] of entries) {
    el.querySelector(`slot[name="${name}"]`).replaceWith(replacement);
  }
}
