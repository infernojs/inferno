export class EventEmitter {
  public listeners: Array<(data: unknown) => void> = [];

  public on(cb: (data: unknown) => void): () => void {
    this.listeners.push(cb);
    return () => {
      const index = this.listeners.indexOf(cb);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public emit(data: unknown): void {
    const listeners = this.listeners;
    for (let i = 0, len = listeners.length; i < len; ++i) {
      listeners[i](data);
    }
  }
}
