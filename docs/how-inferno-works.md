# How Inferno Works
To achieve it's performance advantages, Inferno builds the DOM differently than other JavaScript libraries. Unlike many other libraries, Inferno does not build and compare virtual DOMs.

## Schemas

At the base, Inferno creates a representation of the DOM called a `schema`. These can be created by calling `Inferno.TemplateFactory.createElement`, and are automatically done for you when using the Babel transform for Inferno JSX.

```javascript
const schema = Inferno.TemplateFactory.createElement('p', {
  className: 'basic'
}, 'Hello World!');

// schema = {
//   tag: 'div',
//   attrs: {
//     className: 'basic'
//   },
//   children: [
//     'Hello World!'
//   ]
// }
```

## Templates

Templates are created from Schema representations of elements.

```javascript
const template = Inferno.createTemplate(() => {
  return Inferno.TemplateFactory.createElement('p', {
    className: 'basic'
  }, 'Hello World!');
});
```

Within the `createTemplate` function a "virtual fragment" is created, and a function is returned that has access to this virtual fragment to clone the vitual fragments root node later while rendering.

### Dynamic Templates

As you are not always going to be saying hello to the entire world, so the arguments of the `createTemplate` callback method gives you Variables.

```javascript
const template = Inferno.createTemplate((name) => {
  return Inferno.TemplateFactory.createElement('p', {
    className: 'basic'
  }, 'Hello ', name, '!');
})
```

A Variable is an object that makes the spot in a template where dynamic data should be inserted later. In the above example the `name` argument would look like the following:

```javascript
{
  index: 0
}
```

## Filling in Templates

The variables in a template can be assigned by calling the returned function with the value the replacement values, a Shape representation is returned.

```javascript
const shape = template('Inferno');

// shape = {
//   parent: null,
//   tree: {
//     dom: {
//       create: [object Function]
//     }
//   },
//   id: 1453503782783,
//   key: undefined,
//   nextItem: null,
//   rootNode: null,
//   v0: 'Inferno'
// }
```

While many of the properties are internal, two interesting ones are present: `v0` and `tree`.

 - The `v0` property holds the value for the first variable in our template.
 - The `tree` property contains the `create` function that has access to the DOM fragment and the variables, and returns the hydrated DOM node later in the rendering process.
   - Implementation detail aside: the `dom` portion of the tree is created when the `inferno-dom` module is included.

## Inserting the Shape into the DOM

The shape is the representation passed to Inferno's render method.

```javascript
InfernoDOM.render(shape, document.body)
```

The `render` method hydrates the shape's dom tree, and fills in variables before inserting into the document's body.
