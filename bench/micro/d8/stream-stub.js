// inferno-server imports Node's stream for its streaming renderers; the d8
// suite only uses renderToString, so an inert stand-in is enough.
export class Readable {
  constructor() {
    throw new Error('stream.Readable is not available in d8');
  }
}
