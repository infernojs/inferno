# inferno-test-utils

> Suite of utilities for testing Inferno applications

## Install

```
npm install inferno --save
npm install inferno-test-utils --save-dev
```

## Contents

* [`renderIntoDocument`](#renderIntoDocument)
* [`findAllInRenderedTree`](#findAllInRenderedTree)
* [`findAllInVNodeTree`](#findAllInVNodeTree)
* [`scryRenderedDOMElementsWithClass`](#scryRenderedDOMElementsWithClass)
* [`findRenderedDOMElementWithClass`](#findRenderedDOMElementWithClass)
* [`scryRenderedDOMElementsWithTag`](#scryRenderedDOMElementsWithTag)
* [`findRenderedDOMElementWithTag`](#findRenderedDOMElementWithTag)
* [`scryRenderedVNodesWithType`](#scryRenderedVNodesWithType)
* [`findRenderedVNodeWithType`](#findRenderedVNodeWithType)
* [`scryVNodesWithType`](#scryVNodesWithType)
* [`findVNodeWithType`](#findVNodeWithType)

## Usage

### `renderIntoDocument(VNodeTree)`

Renders `VNodeTree` into a detached DOM element in the document and returns a rendered `VNode` tree.

_This function requires a DOM_.

```js
const VNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
```

### `findAllInRenderedTree(renderedVNodeTree, predicate)`

Calls `predicate` with each `VNode` instance in `renderedVNodeTree`. 

Returns an array of `VNodes` where `predicate` returns `true`.

```js
const VNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const predicate = (VNode) => VNode.type === SomeComponent;
const result = findAllInRenderedTree(renderedVNodeTree, predicate);
```

### `findAllInVNodeTree(VNodeTree, predicate)`

Calls `predicate` with each `VNode` instance in `VNodeTree`. 

Returns an array of `VNodes` where `predicate` returns `true`.

```js
const VNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const predicate = (VNode) => VNode.type === SomeComponent;
const result = findAllInVNodeTree(VNodeTree, predicate);
```

### `scryRenderedDOMElementsWithClass(renderedVNodeTree, className)`

Returns an array of DOM elements with `className`.

`className` can be a space-separated string or an array of strings.

```js
const VNodeTree = (
  <div className="outer">
    <SomeComponent className="inner one"/>
    <SomeComponent className="inner two"/>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const result1 = scryRenderedDOMElementsWithClass(renderedVNodeTree, 'inner');
const result2 = scryRenderedDOMElementsWithClass(renderedVNodeTree, 'inner one');
const result3 = scryRenderedDOMElementsWithClass(renderedVNodeTree, ['inner', 'two']);
const result4 = scryRenderedDOMElementsWithClass(renderedVNodeTree, 'three'); // Empty array
```

### `findRenderedDOMElementWithClass(renderedVNodeTree, className)`

Returns a single DOM element with `className`. If more than one matches are found, throws an error.

`className` can be a space-separated string or an array of strings.

```js
const VNodeTree = (
  <div className="outer">
    <SomeComponent className="inner one"/>
    <SomeComponent className="inner two"/>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const result1 = scryRenderedDOMElementsWithClass(renderedVNodeTree, 'outer');
const result2 = scryRenderedDOMElementsWithClass(renderedVNodeTree, 'inner one');
// Will throw an error because more than 1 matches were found...
const result3 = scryRenderedDOMElementsWithClass(renderedVNodeTree, 'inner');
```

### `scryRenderedDOMElementsWithTag(renderedVNodeTree, tagName)`

Returns an array of DOM elements with `tagName`.

```js
const VNodeTree = (
  <div>
    <h1>Heading</h1>
    <p>Paragraph One</p>
    <p>Paragraph Two</p>
    <p>Paragraph Three</p>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const result1 = scryRenderedDOMElementsWithTag(renderedVNodeTree, 'h1');
const result3 = scryRenderedDOMElementsWithTag(renderedVNodeTree, 'p');
const result4 = scryRenderedVNodesWithType(renderedVNodeTree, 'span'); // Empty array
```

### `findRenderedDOMElementWithTag(renderedVNodeTree, tagName)`

Returns a single DOM element with `tagName`. If more than one matches are found, throws an error.

```js
const VNodeTree = (
  <div>
    <h1>Heading</h1>
    <div>
      <p>Paragraph One</p>
      <p>Paragraph Two</p>
      <p>Paragraph Three</p>
    </div>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const result1 = findRenderedDOMElementWithTag(renderedVNodeTree, 'h1');
// Will throw an error because more than 1 matches were found...
const result2 = findRenderedDOMElementWithTag(renderedVNodeTree, 'p');
```

### `scryRenderedVNodesWithType(renderedVNodeTree, type)`

Returns an array of rendered `VNodes` with `type`.

```js
const VNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const result1 = scryRenderedVNodesWithType(renderedVNodeTree, 'h1');
const result2 = scryRenderedVNodesWithType(renderedVNodeTree, SomeComponent);
const result3 = scryRenderedVNodesWithType(renderedVNodeTree, 'p'); // Empty array
```

### `findRenderedVNodeWithType(renderedVNodeTree, type)`

Returns a single rendered `VNode` with `type`. If more than one matches are found, throws an error.

```js
const VNodeTree = (
  <div>
    <h1>Heading</h1>
    <p>Paragraph 1</p>
    <p>Paragraph 2</p>
    <SomeComponent/>
    <AnotherComponent/>
    <AnotherComponent/>
  </div>
);
const renderedVNodeTree = renderIntoDocument(VNodeTree);
const result1 = findRenderedVNodeWithType(renderedVNodeTree, 'h1');
const result2 = findRenderedVNodeWithType(renderedVNodeTree, SomeComponent);
// Will throw an error because more than 1 matches were found...
const result3 = findRenderedVNodeWithType(renderedVNodeTree, 'p');
const result4 = findRenderedVNodeWithType(renderedVNodeTree, AnotherComponent);
```

### `scryVNodesWithType(VNodeTree, type)`

Returns an array of `VNodes` with `type`.

```js
const VNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const result1 = scryVNodesWithType(VNodeTree, 'h1');
const result2 = scryVNodesWithType(VNodeTree, SomeComponent);
const result3 = scryVNodesWithType(VNodeTree, 'p'); // Empty array
```

### `findVNodeWithType(VNodeTree, type)`

Returns a single `VNode` with `type`. If more than one matches are found, throws an error.

```js
const VNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const result1 = findVNodeWithType(VNodeTree, 'h1');
// Will throw an error because more than 1 matches were found...
const result2 = findVNodeWithType(VNodeTree, SomeComponent);
```
