/**
 * @module Inferno-Server
 */ /** TypeDoc Comment */

import { renderToString } from './renderToString';
import { RenderQueueStream, streamQueueAsString } from './renderToString.queuestream';
import { RenderStream, streamAsString } from './renderToString.stream';

// Inferno does not generate "data-root" attributes so staticMarkup is literally same as renderToString
export {
  RenderQueueStream,
  RenderStream,
  renderToString as renderToStaticMarkup,
  renderToString,
  streamAsString as streamAsStaticMarkup,
  streamAsString,
  streamQueueAsString as streamQueueAsStaticMarkup,
  streamQueueAsString
};
