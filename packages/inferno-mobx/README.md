# inferno-mobx

This is a fork of [mobx-react](https://github.com/mobxjs/mobx-react) for [Inferno](https://github.com/infernojs/inferno)

The module is compatible with Inferno v1+, for older versions use [mobx-inferno](https://www.npmjs.com/package/mobx-inferno)

This package provides the bindings for MobX and Inferno.
Exports `observer` and `inject` decorators, a `Provider` and some development utilities.
*New*: exports `observerPatch`, a function to turn Component classes into MobX observers.
`observerPatch` is implemented in a better manner, but is separate as it would break compatibility in some cases.

## Install

```
npm install --save inferno-mobx
```

Also install [mobx](https://github.com/mobxjs/mobx) dependency _(required)_ if you don't already have it

```
npm install --save mobx
```

## Example

Pass a class Component to `observerPatch` to have in automatically re-render if MobX observables read by `render` are modified.

```tsx
// MyComponent.tsx (also works with plain JavaScript)
import { Component } from 'inferno';
import { observerPatch } from 'inferno-mobx';

interface CountStore {
    readonly count: number
}

export class MyComponentA extends Component<{ countStore: CountStore }> {
    render({ countStore }: { countStore: CountStore }) {
        return (<p>Current Count: {countStore.count.toString()}</p>);
    }
}

observerPatch(MyComponentA);

// Or you can use functions that read from stores instead of the stores
export class MyComponentB extends Component<{ count: () => number }> {
    render({ count }: { count: () => number }) {
        return (<p>Current Count: {count().toString()}</p>);
    }
}

observerPatch(MyComponentB);

// However, passing a value from an observable directly as a property will NOT work!
export class MyComponentC extends Component<{ count: number }> {
    render({ count }: { count: number }) {
        return (<p>Current Count: {count.toString()}</p>);
    }
}

observerPatch(MyComponentC);

function MyComponentF({ count }: { count: () => number }) {
    return (<p>Current Count: {count().toString()}</p>);
}

// Detection does NOT cross component boundaries. So this does NOT work:
export class MyComponentD extends Component<{ countStore: CountStore }> {
    render({ countStore }: { countStore: CountStore }) {
        return (<div className="fancy">
            <MyComponentF count={() => countStore.count} />
        </div>);
    }
}

observerPatch(MyComponentD);

// You can use simple functional components as functions:
export class MyComponentE extends Component<{ countStore: CountStore }> {
    render({ countStore }: { countStore: CountStore }) {
        // But keep in mind that the whole component will re-render.
        return (<div className="fancy">{
            MyComponentF({count: () => countStore.count})
        }</div>);
    }
}

observerPatch(MyComponentE);

// Only Components that depend on MobX observables need to be observers.
export class MyComponentG extends Component<{ countStore: CountStore }> {
    render({ countStore }: { countStore: CountStore }) {
        // MyComponentB is an observer and will re-render when countStore.count changes.
        return (<div className="fancy">
            <MyComponentB count={() => countStore.count} />
        </div>);
    }
}

// observerPatch(MyComponentG) is not needed and would add overhead for no reason.

// If you want both an observer and a non observer versions of a component,
// then you can just extend the non observer and patch the sub class.
export class MyComponentH extends Component<{ count: () => number }> { // non observer base class
    render({ count }: { count: () => number }) {
        return (<p>Current Count: {count().toString()}</p>);
    }
}

export class MyComponentI extends MyComponentH {} // sub class indended to be an observer
observerPatch(MyComponentI); // make the sub class an observer

// DO NOT extend from Components that are obsevers.
// If you do have reason to extend a Component class that will be an observer,
// see above on how to easily have both an obsever and a non-observer version.
export class MyComponentJ extends MyComponentA {
    render(properties: { countStore: CountStore }) {
        return (<div className="fancy">
            {super.render(properties)}
        </div>);
    }
}

// Even if you do not call observerPatch on the sub class, extending
// from observers can create problems.
observerPatch(MyComponentJ);

// DO NOT call observerPatch more than once on a clase.
export class MyComponentK extends Component<{ countStore: CountStore }> {
    render({ countStore }: { countStore: CountStore }) {
        return (<p>Current Count: {countStore.count.toString()}</p>);
    }
}

observerPatch(MyComponentK);
observerPatch(MyComponentK); // NEVER call more than once per class!
```

```tsx
// index.tsx
import {
    MyComponentA,
    MyComponentB,
    MyComponentC,
    MyComponentD,
    MyComponentE,
    MyComponentG,
    MyComponentH,
    MyComponentI,
    MyComponentJ,
    MyComponentK
} from './MyComponent';
import { render } from 'inferno';
import { action, observable } from 'mobx';

const store = observable({ count: 0 });

render(<div>
  <MyComponentA countStore={store} />
  <MyComponentB count={() => store.count} />
  <MyComponentC count={store.count} /> {/* This component WILL NOT detect when count changes! */}
  <MyComponentD countStore={store} /> {/* This component WILL NOT detect when count changes! */}
  <MyComponentE countStore={store} />
  <MyComponentG countStore={store} />
  <MyComponentH count={() => store.count} /> {/* Not an observer so no updating when count changes. */}
  <MyComponentI count={() => store.count} /> {/* Is an observer so it will update. */}
  <MyComponentJ countStore={store} /> {/* Works... BUT! when it unmounts there will be an error! */}
  <MyComponentK countStore={store} /> {/* Works... BUT! when it unmounts there will be an error! */}
  <button type="button" onClick={action(() => {store.count += 1})}>Click Me</button>
</div>, document.getElementById('components'));
```

NOTES:

`observerPatch` installs a `componentWillUnmount` hook to dispose of the MobX Reaction.
It will then call the `componentWillUnmount` from the class's prototype.
If you dynamically add a `componentWillUnmount` to a class you pass to `observerPatch`, be sure it calls the hook installed by `observerPatch`.

`observerPatch` also replaces the `render` method in the prototype.
The `render` method gets replaced twice on a per instance basis during the life cycle of a Component.
It is replaced the first time `render` is called with a version that is wrapped in a MobX reaction.
Then it is restored to the class's original `render` method when `componentWillUnmount` is called.

It is strongly recommended to avoid replacing the `render` method on classes `observerPatch` is applied to.

## Legacy Example

You can inject props using the following syntax ( This example requires, babel decorators-legacy plugin )

```javascript
// MyComponent.js
import { Component } from 'inferno';
import { inject, observer } from 'inferno-mobx';

@inject('englishStore', 'frenchStore') @observer
class MyComponent extends Component {
    render({ englishStore, frenchStore }) {
        return <div>
            <p>{ englishStore.title }</p>
            <p>{ frenchStore.title }</p>
        </div>
    }
}

export default MyComponent
```

If you're not using decorators, you can do this instead:

```javascript
// MyComponent.js
import { Component } from 'inferno';
import { inject, observer } from 'inferno-mobx';

class MyComponent extends Component {
    render({ englishStore, frenchStore }) {
        return <div>
            <p>{ englishStore.title }</p>
            <p>{ frenchStore.title }</p>
        </div>
    }
}

export default inject('englishStore', 'frenchStore')(observer(MyComponent));
```

Just make sure that you provided your stores using the `Provider`. Ex:

```javascript
// index.js
import { render } from 'inferno';
import { Provider } from 'inferno-mobx';
import { observable } from 'mobx';
import MyComponent from './MyComponent';

const englishStore = observable({
    title: 'Hello World'
});

const frenchStore = observable({
    title: 'Bonjour tout le monde'
});

render(<Provider englishStore={ englishStore } frenchStore={ frenchStore }>
    <MyComponent/>
</Provider>, document.getElementById('root'));
```

## Migrating from observer to observerPatch

The `observerPatch` was added because the way `observer` was implemented cannot work on class Components that implement either `getSnapshotBeforeUpdate` or `getDerivedStateFromProps`.
Having differences in implementation that can matter to user code based on which lifecycle hooks are present is not good design.
Changing how `observer` is implemented in ways that could break existing user code is not worth the cost.
Furthermore, `observerPatch` provides better performance in the resulting class than `observer`.

The differences to be aware of when switching from `observer` to `observerPatch` are:

1. `observerPatch` is not implemented to be used as a decorator
2. `observerPatch` returns `void` instead of returning the class it was applied to
3. `observerPatch` will not have the observer call `this.componentWillReact()` if such a member exists
4. `observerPatch` does not add a `shouldComponentUpdate` hook to classes that do not have one
5. `observerPatch` will not catch exceptions thrown by `render` and forward them to `errorsReporter`
6. `observerPatch` ignores `useStaticRendering(true)`
7. `observerPatch` will not emit events through `renderReporter` that list how long `render` took
8. `observerPatch` does not make `this.props` nor `this.state` observable
9. `observerPatch` does not set `isMobXReactObserver = true` as a static class member
10. `observerPatch` is only for class Components, functional Components are not supported

Points 1 and 2 are a simple change to call `observerPatch` after the class is defined and removing `observer`.

To replicate the behavior of `observer` for point 3, call `this.componentWillReact()` at the start of your `componentWillMount` hook.
Or if your Component does not have a `componentWillMount`, rename `componentWillReact` to `componentWillMount`.

For point 4, you can implement your own `shouldComponentUpdate` hook is you want to prevent needless re-renders.
The `shouldComponentUpdate` does not affect re-renders triggered by MobX obervables being modified.
So it exists for when new properties are set or `this.setState` is used.

Errors sent to `errorsReporter` as mentioned in point 5 could then be sent to a custom handler provided to `onError`.
For exceptions occuring in your render method, catch them in the method and forward to your handler.
This cuts out extra intermediate steps.
Otherwise, they will go to the MobX global Reaction error handler set with `onReactionError`.
Which is where they may have been going anyways.
There was no unit test checking this behavior.

For point 6, all your components other than those passed to `observer` already ignore it.
If there is demand, generating warning messages might return `useStaticRendering(true)` is called.
But it would only be in development builds of Inferno and would not prevent methods from running.

For point 7, you can do it better that `observer` did.
Also, it only did so if you toggled it on by calling `trackComponents()`.

Point 8 means that if you directly set `this.props` or `this.state` to a new value it will not trigget a re-render.
You should not be directly setting `this.props`. Let Inferno update Component properties.
You should not be directly setting `this.state` outside of the `componentWillMount` and `componentWillReceiveProps` hooks.
The component will always have `render` called after `componentWillMount`.
The component will have `render` called after `componentWillReceiveProps` unless `shouldComponentUpdate` returns `false`.
Any time Inferno updates `this.props` or `this.setState` is used to update state, the component will re-render unless `shouldComponentUpdate` returns `false`.

For point 9, `observerPatch` instead sets `isMobXInfernoObserver = true` as a static member of the class.
But it only does do in development builds as it is intended for use internally for sanity checks.
The issues it is used to spot and warn about should be fixed before reaching production.

Finally for point 10, the way `observer` worked with functional was to wrap them in a class Component.
It likely was not what you wanted.
It ignored any default hooks and being wrapped in class Component you could not add new ones.
And if your functional Component was only ever used as an observer, then directly making it a class Component would be better.

If this seems intimidating, know that nearly all unit tests for `observer` worked as they were after replacing `observer` with `observerPatch`.
Outside of needing to switch functional Components to class Components, that is.

## Using observerPatch with Provider and inject

The `observerPatch` function can be used with `Provider` and `inject` just like with `observer`.
However, using `inject` as a decorator along side `observerPatch` is not supported.

```tsx
// MyInjected.tsx
import { Component } from 'inferno';
import { observerPatch, inject } from 'inferno-mobx';

interface CountStore {
    readonly count: number
}

// The class produced by inject will require the injected properties if required by the base class
class MyComponentA extends Component<{ countStore?: CountStore }> {
    render({ countStore }: { countStore?: CountStore }) {
        // If only the injected version will be used, casting is safe as an exception is thrown
        // if the property is unavailable
        const count = (countStore as CountStore).count.toString(); // unsafe if MyComponentA was exported
        return (<p>Current Count: {count}</p>);
    }
}

// Recommended order
observerPatch(MyComponentA);
export const MyInjectedA = inject('countStore')(MyComponentA);

class MyComponentB extends Component<{ countStore?: CountStore }> {
    render({ countStore }: { countStore?: CountStore }) {
        const count = (countStore as CountStore).count.toString();
        return (<p>Current Count: {count}</p>);
    }
}

// The order of inject and observerPatch does not matter.
export const MyInjectedB = inject('countStore')(MyComponentB);
observerPatch(MyComponentB); // Works, but this order is more prone to the mistake shown below

class MyComponentC extends Component<{ countStore?: CountStore }> {
    render({ countStore }: { countStore?: CountStore }) {
        const count = (countStore as CountStore).count.toString();
        return (<p>Current Count: {count}</p>);
    }
}

// Be sure to use observerPatch on the class, not the injected class.
// A warning message is output if you do this.
export const MyInjectedC = inject('countStore')(MyComponentC);
observerPatch(MyInjectedC); // WRONG! Should be: observerPatch(MyComponentC);
//Having observerPatch before inject lets tools detect this issue.
```

```tsx
// index.tsx
import {
    MyInjectedA,
    MyInjectedB,
    MyInjectedC
} from './MyInjected';
import { render } from 'inferno';
import { Provider } from 'inferno-mobx';
import { action, observable } from 'mobx';

const store = observable({ count: 0 });

const store2 = observable({ count: 0 });

// NOTE: Do not use Provider and inject for trivial cases like this in real code.
render(<div>
    <Provider countStore={store}>
        <MyInjectedA />
        <MyInjectedB />
        <MyInjectedC /> {/* This one will not update as MyComponentC was not made into an observer. */}
        <MyInjectedA countStore={store2} /> {/* Will not update as direct properties override injection */}
    </Provider>
  <button type="button" onClick={action(() => {store.count += 1})}>Click Me</button>
</div>, document.getElementById('root'));
```

IMPORTANT: The values injected are the ones available to `Provider` when it is first mounted.
So `Provider` and `inject` are only useful for properties that will NEVER change.
