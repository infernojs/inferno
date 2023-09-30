# InfernoJS v9.0.0

## Breaking changes

`inferno-create-class` has been removed, use `createComponentVNode`, `createElement` APIs instead.
If you were using `createClass` to wrap the class into observable you can do the same by extending inferno component.

```js
observer(
  class MyCom extends Component {
    componentWillReact() {
      willReactCount++;
    }

    render() {
      return (
        <div id="x">
          {[foo.a.get(), foo.b.get(), foo.c.get()].join(',')}
        </div>
      );
    }
  },
);
```

Inferno v9 requires following features to be present in the executing runtime:

- `Promise`
- `String.prototype.includes()`
- `Array.prototype.includes()`
- `Object.spread()`

`options.componentComparator` has been removed
`options.renderComplete` has been removed, same result can be achieved by calling own function after render
