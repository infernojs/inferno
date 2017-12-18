/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

import {
  componentByNodeRegistery,
  errorsReporter,
  inject,
  Observer,
  observer,
  renderReporter,
  trackComponents,
  useStaticRendering
} from './observer';
import { Provider } from './Provider';
import { EventEmitter } from './utils/EventEmitter';

// THIS IS PORT OF AWESOME MOBX-REACT to INFERNO
// LAST POINT OF PORT (4.2.2)
// https://github.com/mobxjs/mobx-react/commit/acdc338db55b05f256c0ef357c9b71433fbd53d2

const onError = fn => errorsReporter.on(fn);

export {
  componentByNodeRegistery,
  errorsReporter,
  inject,
  observer,
  onError,
  EventEmitter,
  Observer,
  Provider,
  renderReporter,
  trackComponents,
  useStaticRendering
};
