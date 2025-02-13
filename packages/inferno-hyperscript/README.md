# inferno-hyperscript

> [Hyperscript][hyperscript] syntax for [Inferno][inferno] termplates.

## Usage

```javascript
var h = require('inferno-hyperscript');

module.exports = function ExampleComponent(props) {
  return h('.example', [
    h(
      'a.example-link',
      {
        href: '#',
      },
      ['Hello', props.whom, '!'],
    ),
  ]);
};
```

## Documentation

### `h(componentOrTag, properties, children, noNormalize)`

Returns an Inferno VNode from a Hyperscript representation.

- **componentOrTag** `(Object|String)` can be an Inferno component **OR** tag string with optional css class names and ids in the format `h1#some-id.foo.bar`.
  If a tag string, the tag name is parsed out, and the `id` and `className` propertires of the properties argument will be modified.
- **properties** `(Object)` _(optional)_ An object containing the properties you'd like to set on the element.
- **children** `(Array|String)` _(optional)_ An array of `h()` children or strings, This will create childen or text nodes respectively.
  New in v4.0.0
- **noNormalize** Boolean _(optional)_ Set true to avoid normalization process. Tells Inferno to trust the input as is. Used for optimization.

[hyperscript]: https://github.com/dominictarr/hyperscript
[inferno]: https://github.com/infernojs/inferno
