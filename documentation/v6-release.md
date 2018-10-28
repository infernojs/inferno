# InfernoJS v6.0.0

## Breaking changes

- `hydrate` moved to `inferno-hydrate` package
- Style properties use hyphen syntax `backgroundColor` => `background-color`
- JSX plugin depends on babel v7
- Lifecycle changed to have better compatibility with ReactJS
- String refs completely removed


For complete list see [Migration guide](https://github.com/infernojs/inferno/blob/master/documentation/v6-migration.md)

## New features

- Fragments, a new type of VNode that can be used to render Component root level arrays
- createRef API
- forwardRef API
- new Component lifecycle: `getDerivedStateFromProps` and `getSnapshotBeforeUpdate`
- `$HasTextChildren` new JSX compilation time optimization flag added
- rerender method
- top level context



### Fragments

Fragment support means you can return array from Component render creating an invisible layer that ties its content together
but will not render any container to actual DOM. The examples below need v6 [babel-plugin-inferno](https://github.com/infernojs/babel-plugin-inferno)

Short syntax example `<> ... </>`

```jsx
import { Component } from 'inferno';

class MyApplication extends Component {

    render() {

        /*
         * This will render "<span>Hi</span><div>Okay</div>"
         * to location where MyApplication is used
         * /
        return (
            <>
                <span>Hi</span>
                <div>Okay</div>
            </>
        )
    }
}

```

Long syntax allows you to specify keys for Fragments. This is useful if there are many Fragments or if array is built dynamically.

```jsx
import { Component, Fragment } from 'inferno';

class MyApplication extends Component {

    render() {

        const list = [];


        if (/* some logic */) {
            list.push(
                <Fragment key="coffee">
                    <dt>Coffee</dt>
                    <dd>Black hot drink</dd>
                </Fragment/>
            );
        }

        ...

        if (/* other logic */) {
            list.push(
                <Fragment key="milk">
                    <dt>Milk</dt>
                    <dd>White cold drink</dd>
                </Fragment/>
            );
        }

        /*
         * This will render
         * <dl>
         *    <dt>Coffee</dt>
         *    <dd>Black hot drink</dd>
         *    <dt>Milk</dt>
         *    <dd>White cold drink</dd>
         * </dl>
         * /
        return (
            <dl>
                {list}
            </dl>
        )
    }
}

```

You can create fragment:

- Using native Inferno API `createFragment(children: any, childFlags: ChildFlags, key?: string | number | null)`
- Using JSX `<> ... </>`, `<Fragment> .... </Fragment>` or `<Inferno.Fragment> ... </Inferno.Fragment>`
- Using createElement API `createElement(Inferno.Fragment, {key: 'test'}, ...children)`
- Using hyperscript API `h(Inferno.Fragment, {key: 'test'}, children)`

React documentation: https://reactjs.org/docs/fragments.html

### CreateRef API

createRef method allows nicer syntax, and reduces code when no callback to DOM creation is needed.
The below example creates ref object and stores it to Component property `element`.
This object is then assigned to the element where you want to create reference. In the example below we want to reference "span".
After render has gone, span element is available in `this.element.current` property.


```jsx
import { Component, render, createRef } from 'inferno';

class Foobar extends Component {
  constructor(props) {
    super(props);

    // Store reference somewhere
    this.element = createRef(); // Returns object {current: null}
  }

  render() {
    return (
      <div>
        <span id="span" ref={this.element}>
          Ok
        </span>
      </div>
    );
  }
}

render(<Foobar />, container);

```

React documentation: https://reactjs.org/docs/refs-and-the-dom.html


### ForwardRef API

forwardRef is a new mechanism to "forward" ref inside a functional Component.
It can be useful if you have simple functional Components and you want to create reference to a specific element inside it.

```jsx
import { forwardRef, Component, render } from 'inferno';

const FancyButton = forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

class Hello extends Component {
  render() {
    return (
      <FancyButton
        ref={btn => {
          if (btn) {
            // btn variable is the button rendered from FancyButton
          }
        }}
      >
        Click me!
      </FancyButton>
    );
  }
}

render(<Hello />, container);
```

React documentation: https://reactjs.org/docs/forwarding-refs.html

### New lifecycle

Like in React when new lifecycle methods `getDerivedStateFromProps` or `getSnapshotBeforeUpdate` are used old lifecycle methods will not be called ( `componentWillMount`, `componentWillReceiveProps` `componentWillUpdate` ).
There will not be `UNSAFE_` methods in Inferno. Just use the normal names.


### TextChildren

New optimization paths have been added for text. JSX users can force this optimization by adding `$HasTextChildren` tag to any vNode element.
This makes given element always render text. Normalization will also default into text children when only single text element is detected as children.

This flag also simplifies an old version of:
```
import { createTextVNode } from 'inferno';

// While this still works, this is not recommended anymore
<div $HasVNodeChildren>{createTextVNode('text')}</div>
```

New version:
```
// No imports needed
<div $HasTextChildren>text</div>
```


### rerender

rerender is a new method that will flush all pending setState calls and render immediately.
It can be used when render timing is important, or to simplify tests.

```jsx
import { Component, rerender, render } from 'inferno';

describe('test example', () => {
    it('Should update immediately', () => {
      class Foo extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            value: 'initial'
          };
        }

        componentDidMount() {
          this.setState({ value: 'updated' });
        }

        render() {
          return <div className={this.state.value} />;
        }
      }

      const container = document.createElement('div');

      render(<Foo />, container);
      expect(container.firstChild.className).toEqual('initial');

      // Call rerender to flush pending setState, no timeouts needed
      rerender();
      expect(container.firstChild.className).toEqual('updated');
    });
});
```

### Top level context

Inferno.render now takes fourth parameter which is initial context.
This removes the need of wrapping application with Class component.

```jsx
import { render } from 'inferno';

function App (props, context) {
    // context contains property "foo" => "bar"

    return <div>Cool App!</div>;
}


render(<App />, document.getElementById('root'), callback, { foo: 'bar' });
```

## Common

Runtime memory usage has been improved. `dom` properties are no longer stored to component vNode.
Various properties have been removed from ES6 Component as well. `parentVNode` hack has been removed removing circular
references from vNode tree. Normalization `array['$'] = true` hack has been removed.

### Core

- Better recovery from user land errors
- Fixes performance issue where normalization copied input data two times
- Fixes performance issue where frozen input data was always copied

### Typescript

- Adds support for pointer event types
- setState typings have been improved. https://github.com/infernojs/inferno/pull/1388

### Inferno-router

- Improved nested routes handling #1360
- `Route` component can now have multiple children

### Inferno-compat

- `options.reactStyles` option added, setting it false removes runtime transformation of style properties


List of Github issues can be found using this link: https://github.com/infernojs/inferno/issues?utf8=%E2%9C%93&q=label%3A%22Fixed+in+v6.0.0%22+


