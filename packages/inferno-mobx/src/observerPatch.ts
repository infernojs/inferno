import { InfernoNode } from 'inferno';
import { warning } from 'inferno-shared';
import { Reaction } from 'mobx';

type RenderReturn = InfernoNode | undefined | void;

type Render = (this, properties?, state?, context?) => RenderReturn;

type ObserverRender<R extends Render = Render> = R & { dispose: () => void };

function makeObserverRender<R extends Render>(update: () => void, render: R, name: string): ObserverRender<R> {
  const reactor = new Reaction(name, update);
  const track = reactor.track.bind(reactor);
  const observer = function (this, ...parameters: Parameters<typeof render>) {
    let rendered: RenderReturn;
    let caught;
    track(() => {
      try {
        rendered = render.apply(this, parameters);
      } catch(error) {
        caught = error;
      }
    });
    if (caught) {
      throw caught;
    } else {
      return rendered;
    }
  } as ObserverRender<R>;
  observer.dispose = reactor.dispose.bind(reactor);
  return observer;
}

interface Target {
  readonly displayName?: string;
  readonly forceUpdate: (callback?: () => void) => void;
  render: Render;
  componentWillUnmount?: () => void;
}

/**
 * Turns a class Component into a MobX observer.
 * @param clazz The constructor of the class to patch as a MobX observer.
 */
export function observerPatch<T extends Target, P, C>(clazz: (new (p: P, c: C) => T) | (new (p: P) => T) | (new () => T)): void {
  const proto = clazz.prototype as T;
  if (process.env.NODE_ENV !== 'production') {
    if ((clazz as { readonly isMobxInjector?: boolean }).isMobxInjector === true) {
      warning(
        "Mobx observerPatch: You are trying to use 'observerPatch' on a component that already has 'inject'. Please apply 'observerPatch' before applying 'inject'"
      );
    } else if ((clazz as { readonly isMobXReactObserver?: boolean }).isMobXReactObserver === true) {
      warning(
        "Mobx observerPatch: You are trying to use 'observerPatch' on a component that already has 'observer'. Please only apply one of 'observer' or 'observerPatch'"
      );
    } else if ((clazz as { readonly isMobXInfernoObserver?: boolean }).isMobXInfernoObserver === true) {
      warning("Mobx observerPatch: You are trying to use 'observerPatch' on a component that already has 'observerPatch' applied. Please only apply once");
    }
    (clazz as { isMobXInfernoObserver?: boolean }).isMobXInfernoObserver = true;
  }
  const base = proto.render;
  const name = clazz.name;
  proto.render = function (this: T, ...parameters) {
    const update = this.forceUpdate.bind(this, undefined);
    const render = makeObserverRender(update, base, `${this.displayName || name}.render()`);
    this.render = render;
    return render.apply(this, parameters);
  };
  if (proto.componentWillUnmount) {
    const unmount = proto.componentWillUnmount;
    proto.componentWillUnmount = function (this: T & { render: ObserverRender }) {
      this.render.dispose();
      this.render = base as ObserverRender;
      unmount.call(this);
    };
  } else {
    proto.componentWillUnmount = function (this: T & { render: ObserverRender }) {
      this.render.dispose();
      this.render = base as ObserverRender;
    };
  }
}
