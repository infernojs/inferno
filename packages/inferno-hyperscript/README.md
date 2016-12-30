# inferno-hyperscript [![Travis-CI Status](https://img.shields.io/travis/terinjokes/inferno-hyperscript/master.svg?label=Travis%20CI&style=flat-square)](https://travis-ci.org/terinjokes/inferno-hyperscript) [![](https://img.shields.io/npm/dm/inferno-hyperscript.svg?style=flat-square)](https://www.npmjs.org/package/inferno-hyperscript) [![](https://img.shields.io/npm/v/inferno-hyperscript.svg?style=flat-square)](https://www.npmjs.org/package/inferno-hyperscript) [![](https://img.shields.io/coveralls/terinjokes/inferno-hyperscript/master.svg?style=flat-square)](https://coveralls.io/github/terinjokes/inferno-hyperscript)
> [Hyperscript][hyperscript] syntax for [Inferno][inferno] termplates.

## Usage

```javascript
var h = require('inferno-hyperscript');

module.exports = function ExampleComponent(props) {
  return h('.example', [
    h('a.example-link', {
      href: '#'
    }, [
      'Hello',
      props.whom,
      '!'
    ])
  ]);
};
```

## Documentation

### `h(componentOrTag, properties, children)`

Returns an Inferno VNode from a Hyperscript representation.

* **componentOrTag** `(Object|String)` can be an Inferno component **OR** tag string with optional css class names and ids in the format `h1#some-id.foo.bar`.
  If a tag string, the tag name is parsed out, and the `id` and `className` propertires of the properties argument will be modified.
* **properties** `(Object)` *(optional)* An object containing the properties you'd like to set on the element.
* **children** `(Array|String)` *(optional)* An array of `h()` children or strings, This will create childen or text nodes respectively.

[hyperscript]: https://github.com/dominictarr/hyperscript
[inferno]: https://github.com/infernojs/inferno
