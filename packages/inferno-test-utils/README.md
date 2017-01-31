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

### `renderIntoDocument`

Render a VNode tree into a detached DOM node in the document. This function requires a DOM.

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
```

### `findAllInRenderedTree`

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const predicate = (vNode) => vNode.type === SomeComponent;
const result = findAllInRenderedTree(renderedTree, predicate);
```

### `findAllInVNodeTree`

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const predicate = (vNode) => vNode.type === SomeComponent;
const result = findAllInVNodeTree(vNodeTree, predicate);
```

### `scryRenderedDOMElementsWithClass`

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner one"/>
    <SomeComponent className="inner two"/>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const result1 = scryRenderedDOMElementsWithClass(renderedTree, 'inner');
const result2 = scryRenderedDOMElementsWithClass(renderedTree, 'inner one');
const result3 = scryRenderedDOMElementsWithClass(renderedTree, ['inner', 'two']);
const result4 = scryRenderedDOMElementsWithClass(renderedTree, 'three'); // Empty array
```

### `findRenderedDOMElementWithClass`

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner one"/>
    <SomeComponent className="inner two"/>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const result1 = scryRenderedDOMElementsWithClass(renderedTree, 'outer');
const result2 = scryRenderedDOMElementsWithClass(renderedTree, 'inner one');
// Will throw an error because more than 1 matches were found...
const result3 = scryRenderedDOMElementsWithClass(renderedTree, 'inner');
```

### `scryRenderedDOMElementsWithTag`

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <p>Paragraph One</p>
    <p>Paragraph Two</p>
    <p>Paragraph Three</p>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const result1 = scryRenderedDOMElementsWithTag(renderedTree, 'h1');
const result3 = scryRenderedDOMElementsWithTag(renderedTree, 'p');
const result4 = scryRenderedVNodesWithType(renderedTree, 'span'); // Empty array
```

### `findRenderedDOMElementWithTag`

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <div>
      <p>Paragraph One</p>
      <p>Paragraph Two</p>
      <p>Paragraph Three</p>
    </div>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const result1 = findRenderedDOMElementWithTag(renderedTree, 'h1');
// Will throw an error because more than 1 matches were found...
const result2 = findRenderedDOMElementWithTag(renderedTree, 'p');
```

### `scryRenderedVNodesWithType`

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const result1 = scryRenderedVNodesWithType(renderedTree, 'h1');
const result2 = scryRenderedVNodesWithType(renderedTree, SomeComponent);
const result3 = scryRenderedVNodesWithType(renderedTree, 'p'); // Empty array
```

### `findRenderedVNodeWithType`

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <p>Paragraph 1</p>
    <p>Paragraph 2</p>
    <SomeComponent/>
    <AnotherComponent/>
    <AnotherComponent/>
  </div>
);
const renderedTree = renderIntoDocument(vNodeTree);
const result1 = findRenderedVNodeWithType(renderedTree, 'h1');
const result2 = findRenderedVNodeWithType(renderedTree, SomeComponent);
// Will throw an error because more than 1 matches were found...
const result3 = findRenderedVNodeWithType(renderedTree, 'p);
const result4 = findRenderedVNodeWithType(renderedTree, AnotherComponent);
```

### `scryVNodesWithType`

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const result1 = scryVNodesWithType(vNodeTree, 'h1');
const result2 = scryVNodesWithType(vNodeTree, SomeComponent);
const result3 = scryVNodesWithType(vNodeTree, 'p'); // Empty array
```

### `findVNodeWithType`

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const result1 = findVNodeWithType(vNodeTree, 'h1');
// Will throw an error because more than 1 matches were found...
const result2 = findVNodeWithType(vNodeTree, SomeComponent);
```
