import { EventEmitter } from 'inferno-mobx';

describe('EventEmitter', () => {
  it('Should be possible to listen changes and remove listeners by calling callback', () => {
    const emitter = new EventEmitter();
    const listener1 = function() {};
    expect(emitter.listeners.length).toEqual(0);

    const listener = emitter.on(listener1);

    expect(emitter.listeners.length).toEqual(1);
    expect(emitter.listeners[0]).toEqual(listener1);

    listener();

    expect(emitter.listeners.length).toEqual(0);
  });

  it('Should do nothing if removing same callback twice/or more', () => {
    const emitter = new EventEmitter();
    const listener1 = function() {};
    expect(emitter.listeners.length).toEqual(0);

    const listener = emitter.on(listener1);

    expect(emitter.listeners.length).toEqual(1);
    expect(emitter.listeners[0]).toEqual(listener1);

    listener();
    listener();
    listener();

    expect(emitter.listeners.length).toEqual(0);
  });

  it('Should emit the change data to all active listeners', () => {
    const emitter = new EventEmitter();
    const listener1 = function() {};
    const listener2 = function(data) {
      console.error(data);
    };

    spyOn(console, 'error');

    expect(emitter.listeners.length).toEqual(0);

    const listener = emitter.on(listener1);
    const listenerTwo = emitter.on(listener2);

    expect(emitter.listeners.length).toEqual(2);
    expect(emitter.listeners[0]).toEqual(listener1);

    listener();
    listener();
    listener();

    expect(emitter.listeners.length).toEqual(1);

    emitter.emit('foobar');

    expect(console.error.calls.count()).toBe(1);
    expect(console.error.calls.mostRecent().args[0]).toContain('foobar');
  });
});
