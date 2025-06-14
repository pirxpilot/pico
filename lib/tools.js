const assert = require('assert');
const LRU = require('nanolru');

module.exports = {
  fromTemplate,
  replaceSlots,
  initTemplateCache
};

let cache;

initTemplateCache();

function initTemplateCache(size = 100) {
  cache = new LRU(size);
}

function fromTemplate(name) {
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

function replaceSlots(el, replacements) {
  const entries = Array.isArray(replacements) ? replacements : Object.entries(replacements);
  for (const [name, replacement] of entries) {
    el.querySelector(`slot[name="${name}"]`).replaceWith(replacement);
  }
}
