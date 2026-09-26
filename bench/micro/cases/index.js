// Entry of the micro bundle: every case, keyed by name. Import order matters
// for ssr.jsx, which reuses the uibench config initialized by uibench.jsx.
import { cases as jfb } from './jfb.jsx';
import { cases as lists } from './lists.jsx';
import { cases as lifecycle } from './lifecycle.jsx';
import { cases as events } from './events.jsx';
import { cases as uibench } from './uibench.jsx';
import { cases as fuzz } from './fuzz.js';
import { cases as ssr } from './ssr.jsx';

export { version } from 'inferno';
export * as Inferno from 'inferno';

export { renderFuzzStep } from './fuzz.js';

export const cases = { ...jfb, ...lists, ...lifecycle, ...events, ...uibench, ...fuzz, ...ssr };
