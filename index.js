import cache from './lib/cache.js';
import events from './lib/events.js';
import observer from './lib/observer.js';
import pico from './lib/pico.js';
import template from './lib/template.js';
import tools, { initTemplateCache, fromTemplate, replaceSlots } from './lib/tools.js';

export default {
  pico,
  cache,
  events,
  observer,
  template,
  tools
};

export { pico, cache, events, observer, template, initTemplateCache, fromTemplate, replaceSlots };
