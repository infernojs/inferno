import { errorsReporter, inject, Observer, observer, renderReporter, trackComponents, useStaticRendering } from './observer';
import { Provider } from './Provider';
import { EventEmitter } from './utils/EventEmitter';
import { observerPatch } from './observerPatch';
import { observerWrap } from './observerWrap';

// THIS IS PORT OF AWESOME MOBX-REACT to INFERNO
// LAST POINT OF PORT
// https://github.com/mobxjs/mobx-react/commit/a1e05d93efd4d9ac819e865e96af138bc6d2ad75

const onError = (fn) => errorsReporter.on(fn);

export {
  errorsReporter,
  inject,
  observer,
  onError,
  EventEmitter,
  Observer,
  observerPatch,
  observerWrap,
  Provider,
  renderReporter,
  trackComponents,
  useStaticRendering
};
