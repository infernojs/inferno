/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

import connect from "./connect";
import inject from "./inject";
import makeReactive, {
  componentByNodeRegistery,
  renderReporter,
  trackComponents,
  useStaticRendering
} from "./makeReactive";
import Provider from "./Provider";
import EventEmitter from "./utils/EventEmitter";

export default {
  EventEmitter,
  Provider,
  componentByNodeRegistery,
  connect,
  inject,
  makeReactive,
  observer: connect,
  renderReporter,
  trackComponents,
  useStaticRendering
};

export {
  EventEmitter,
  Provider,
  componentByNodeRegistery,
  connect as observer,
  connect,
  inject,
  makeReactive,
  renderReporter,
  trackComponents,
  useStaticRendering
};
