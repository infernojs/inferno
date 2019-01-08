# inferno-test-utils

> Suite of utilities for testing Inferno applications

## Install

```
npm install inferno --save
npm install inferno-test-utils --save-dev
```

## Contents

* [`findAllInRenderedTree`](#findallinrenderedtreerenderedtree-predicate)
* [`findAllInVNodeTree`](#findallinvnodetreevnodetree-predicate)
* [`scryRenderedDOMElementsWithClass`](#scryrendereddomelementswithclassrenderedtree-classnames)
* [`findRenderedDOMElementWithClass`](#findrendereddomelementwithclassrenderedtree-classnames)
* [`scryRenderedDOMElementsWithTag`](#scryrendereddomelementswithtagrenderedtree-tagname)
* [`findRenderedDOMElementWithTag`](#findrendereddomelementwithtagrenderedtree-tagname)
* [`scryRenderedVNodesWithType`](#scryrenderedvnodeswithtyperenderedtree-type)
* [`findRenderedVNodeWithType`](#findrenderedvnodewithtyperenderedtree-type)
* [`scryVNodesWithType`](#scryvnodeswithtypevnodetree-type)
* [`findVNodeWithType`](#findvnodewithtypevnodetree-type)
* [`isVNode`](#isvnodeinstance)
* [`isVNodeOfType`](#isvnodeoftypeinstance-type)
* [`isDOMVNode`](#isdomvnodeinstance)
* [`isDOMVNodeOfType`](#isdomvnodeoftypeinstance-type)
* [`isFunctionalVNode`](#isfunctionalvnodeinstance)
* [`isFunctionalVNodeOfType`](#isfunctionalvnodeoftypeinstance-type)
* [`isClassVNode`](#isclassvnodeinstance)
* [`isClassVNodeOfType`](#isclassvnodeoftypeinstance-type)
* [`isDOMElement`](#isdomelementinstance)
* [`isDOMElementOfType`](#isdomelementoftypeinstance-type)
* [`isRenderedClassComponent`](#isrenderedclasscomponentinstance)
* [`isRenderedClassComponentOfType`](#isrenderedclasscomponentoftypeinstance-type)
* [`renderIntoContainer`](#renderIntoContainervnodetree)

## Usage

### `renderIntoContainer(vNodeTree)`

Renders `vNodeTree` into a detached DOM element in the document and returns a rendered `VNode` tree.

_This function requires a DOM. JEST can provide this for you_.

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const renderedTree = renderIntoContainer(vNodeTree);
```

### `findAllInRenderedTree(renderedTree, predicate)`

Calls `predicate` with each `VNode` instance in `renderedTree`. 

Returns an array of `VNodes` where `predicate` returns `true`.

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const renderedTree = render(vNodeTree, DOM);
const predicate = (vNode) => vNode.type === SomeComponent;
const result = findAllInRenderedTree(renderedTree, predicate);
```

### `findAllInVNodeTree(vNodeTree, predicate)`

Calls `predicate` with each `VNode` instance in `vNodeTree`. 

Returns an array of `VNodes` where `predicate` returns `true`.

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner"/>
  </div>
);
const predicate = (vNode) => vNode.type === SomeComponent;
const result = findAllInVNodeTree(vNodeTree, predicate);
```

### `scryRenderedDOMElementsWithClass(renderedTree, classNames)`

Returns an array of DOM elements with `classNames`.

`classNames` can be a space-separated string or an array of strings.

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner one"/>
    <SomeComponent className="inner two"/>
  </div>
);
const renderedTree = render(vNodeTree, DOM);
const result1 = scryRenderedDOMElementsWithClass(renderedTree, 'inner');
const result2 = scryRenderedDOMElementsWithClass(renderedTree, 'inner one');
const result3 = scryRenderedDOMElementsWithClass(renderedTree, ['inner', 'two']);
const result4 = scryRenderedDOMElementsWithClass(renderedTree, 'three'); // Empty array
```

### `findRenderedDOMElementWithClass(renderedTree, classNames)`

Returns a single DOM element with `classNames`. If more than one matches are found, throws an error.

`classNames` can be a space-separated string or an array of strings.

```js
const vNodeTree = (
  <div className="outer">
    <SomeComponent className="inner one"/>
    <SomeComponent className="inner two"/>
  </div>
);
const renderedTree = render(vNodeTree, DOM);
const result1 = scryRenderedDOMElementsWithClass(renderedTree, 'outer');
const result2 = scryRenderedDOMElementsWithClass(renderedTree, 'inner one');
// Will throw an error because more than 1 matches were found...
const result3 = scryRenderedDOMElementsWithClass(renderedTree, 'inner');
```

### `scryRenderedDOMElementsWithTag(renderedTree, tagName)`

Returns an array of DOM elements with `tagName`.

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <p>Paragraph One</p>
    <p>Paragraph Two</p>
    <p>Paragraph Three</p>
  </div>
);
const renderedTree = render(vNodeTree, DOM);
const result1 = scryRenderedDOMElementsWithTag(renderedTree, 'h1');
const result3 = scryRenderedDOMElementsWithTag(renderedTree, 'p');
const result4 = scryRenderedVNodesWithType(renderedTree, 'span'); // Empty array
```

### `findRenderedDOMElementWithTag(renderedTree, tagName)`

Returns a single DOM element with `tagName`. If more than one matches are found, throws an error.

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
const renderedTree = render(vNodeTree, DOM);
const result1 = findRenderedDOMElementWithTag(renderedTree, 'h1');
// Will throw an error because more than 1 matches were found...
const result2 = findRenderedDOMElementWithTag(renderedTree, 'p');
```

### `scryRenderedVNodesWithType(renderedTree, type)`

Returns an array of rendered `VNodes` with `type`.

```js
const vNodeTree = (
  <div>
    <h1>Heading</h1>
    <SomeComponent/>
    <SomeComponent/>
  </div>
);
const renderedTree = render(vNodeTree, DOM);
const result1 = scryRenderedVNodesWithType(renderedTree, 'h1');
const result2 = scryRenderedVNodesWithType(renderedTree, SomeComponent);
const result3 = scryRenderedVNodesWithType(renderedTree, 'p'); // Empty array
```

### `findRenderedVNodeWithType(renderedTree, type)`

Returns a single rendered `VNode` with `type`. If more than one matches are found, throws an error.

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
const renderedTree = render(vNodeTree, DOM);
const result1 = findRenderedVNodeWithType(renderedTree, 'h1');
const result2 = findRenderedVNodeWithType(renderedTree, SomeComponent);
// Will throw an error because more than 1 matches were found...
const result3 = findRenderedVNodeWithType(renderedTree, 'p');
const result4 = findRenderedVNodeWithType(renderedTree, AnotherComponent);
```

### `scryVNodesWithType(vNodeTree, type)`

Returns an array of `VNode` instances with `type`.

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

### `findVNodeWithType(vNodeTree, type)`

Returns a single `VNode` instance with `type`. If more than one matches are found, throws an error.

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

### `isVNode(instance)`

Returns `true` when `instance` is a `VNode`.

### `isVNodeOfType(instance, type)`

Returns `true` when `instance` is a `VNode` of `type`.

### `isDOMVNode(instance)`

Returns `true` when `instance` is a DOM-type `VNode`.

### `isDOMVNodeOfType(instance, type)`

Returns `true` when `instance` is a DOM-type `VNode` of `type`.

### `isFunctionalVNode(instance)`

Returns `true` when `instance` is a functional-type `VNode`.

### `isFunctionalVNodeOfType(instance, type)`

Returns `true` when `instance` is a functional-type `VNode` of `type`.

### `isClassVNode(instance)`

Returns `true` when `instance` is a class-type `VNode`.

### `isClassVNodeOfType(instance, type)`

Returns `true` when `instance` is a class-type `VNode` of `type`.

### `isDOMElement(instance)`

Returns `true` when `instance` is a DOM element.

### `isDOMElementOfType(instance, type)`

Returns `true` when `instance` is a DOM element of `type`.

### `isRenderedClassComponent(instance)`

Returns `true` when `instance` is a rendered class `VNode`.

### `isRenderedClassComponentOfType(instance, type)`

Returns `true` when `instance` is a rendered class `VNode` of `type`.
