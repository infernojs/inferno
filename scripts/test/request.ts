// jsdom has no fetch API. inferno-router creates a Request for every route loader,
// this is the minimum the router tests need.
if (typeof Request === 'undefined') {
  global.Request = class Request {
    public url;
    public signal;

    constructor(url: URL | string, init: RequestInit) {
      this.url = url;
      this.signal = init.signal;
    }
  } as any;
}
