namespace InfernoMobx {
  declare class EventEmitter {
    private listeners: Function[];

    on(cb: Function);
    emit(data: any);
    getTotalListeners(): number;
    clearListeners(): void;
  }
}

// TODO make these more accurate
declare module 'inferno-mobx' {
  export function Provider(...args: any): any;
  export function inject(...args: any): any;
  export function connect(...args: any): any;
  export function trackComponents(...args: any): any;

  export const renderReporter: InfernoMobx.EventEmitter;
  export const componentByNodeRegistery: WeakMap<any, any>;
}
