// Browsers have no Node.js streams. The UMD bundles import this module instead of 'stream',
// so that inferno-server loads and renderToString works. Only the stream renderers throw.
export class Readable {
  constructor() {
    throw new Error(
      'Inferno Error: streamAsString and streamQueueAsString need Node.js streams, use renderToString in the browser.'
    );
  }
}
