import assert from 'node:assert/strict';
import { addJsExtensionsToRelativeSpecifiers } from './move-typedefs.js';

const input = [
  "import { render } from './core/implementation';",
  "export * from './core/types';",
  "export type { VNode } from '../shared';",
  "import type { X } from './findDOMNode';",
  "import { already } from './done.js';",
  "import data from './data.json';",
  "export { y } from 'inferno-shared';"
].join('\n');

const out = addJsExtensionsToRelativeSpecifiers(input);

assert.match(out, /from '\.\/core\/implementation\.js'/);
assert.match(out, /from '\.\/core\/types\.js'/);
assert.match(out, /from '\.\.\/shared\.js'/);
assert.match(out, /from '\.\/findDOMNode\.js'/);
assert.match(out, /from '\.\/done\.js'/);
assert.match(out, /from '\.\/data\.json'/);
assert.match(out, /from 'inferno-shared'/);
assert.doesNotMatch(out, /from '\.\/done\.js\.js'/);

console.log('move-typedefs relative specifier rewrite: ok');
