import { rerender } from 'inferno';

export function createEventGuard() {
  const eventState = { done: false };
  const markEventCompleted = () => {
    eventState.done = true;
  }
  const waitForEventToTriggerRender = async () => {
    // Wait until event is marked as completed
    while (!eventState.done) {
      await new Promise((resolved) => setTimeout(resolved, 1));
    }
    // Allow resolving promises to finish
    await new Promise((resolved) => setTimeout(resolved, 0));
    
    // Allow render loop to complete
    rerender()
  }

  return [
    markEventCompleted,
    waitForEventToTriggerRender
  ]
}

export function createResponse(data, type, status) {
  switch (type) {
    case 'json':
      return createJsonResponse(data, status);
    case 'text':
      if (typeof data !== 'string') throw new Error('Type "text" requires string as data');
      return createTextResponse(data, status);
    default:
      throw new Error('Unknown value for param "type"');
  }
}

function createJsonResponse(data, status = 200) {
  return new MockResponse(data, 'application/json', status);
}

function createTextResponse(data, status = 200) {
  return new MockResponse(data, 'text/plain', status);
}

class MockResponseHeaders {
  private _headers;

  constructor(headers) {
    this._headers = headers;
  }

  public get(key) {
    return this._headers[key];
  }
}

class MockResponse {
  private _data: any;
  private _contentType: string;
  private _statusCode: number;

  constructor(data, contentType = 'application/json', statusCode = 200) {
    this._data = data;
    this._contentType = contentType;
    this._statusCode = statusCode;
  }

  get headers() {
    return new MockResponseHeaders({
      'Content-Type': this._contentType
    });
  }

  get ok() {
    return this._statusCode >= 200 && this._statusCode < 300;
  }

  get type () {
    return 'basic';
  }

  get status () {
    return this._statusCode;
  }

  public json() {
    return Promise.resolve(this._data);
  }

  public text() {
    return Promise.resolve(this._data);
  }
}