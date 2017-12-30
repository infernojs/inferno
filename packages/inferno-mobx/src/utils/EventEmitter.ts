/**
 * @module Inferno-Mobx
 */ /** TypeDoc Comment */

export class EventEmitter {
  public listeners: Function[] = [];

  public on(cb: Function) {
    this.listeners.push(cb);
    return () => {
      const index = this.listeners.indexOf(cb);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public emit(data: any) {
    const listeners = this.listeners;
    for (let i = 0, len = listeners.length; i < len; i++) {
      listeners[i](data);
    }
  }
}
