# inferno-animation

Helper components and utils to add smooth CSS-animations to your Inferno apps. Extend from `<AnimatedComponent>` and include the css from index.css in this package to get default animation on opacity and height. Requires setting `box-sizing: border-box;` on the animated element.

If you want to customise your animations, just use index.css as a template and replace "inferno-animation" prefix in the CSS-class names with your custom animation name (i.e. mySuperAnimation). Then pass that name to your animated component as an attribute `<MyComponent animation="mySuperAnimation" />` and your customised animation will be used.

For examples of what animations look like you can try inferno/docs/animations/index.html.

## Install

```
npm install inferno-animation
```

## Usage

There are three base components you can extend from to get animations in a straightforward way without any wiring.

- AnimatedComponent -- animates on add/remove
- AnimatedMoveComponent -- animates on move (within the same parent)
- AnimatedAllComponent -- animates on add/remove and move (within the same parent)

You can also animate functional components. There are a couple of examples of animations in the main repos in the `docs/animations` and `docs/animations-demo` folder.

If you don't want to extend from one of the pre-wired components, look att src/AnimatedAllComponent.ts to see
how to wire up the three animation hooks:

- componentDidAppear
- componentWillDisappear
- componentWillMove

Using AnimatedAllComponent is just like working with ordinary components. Don't forget to
add the CSS or you can get strange results:

app.js

```js
import { Component } from 'inferno';
import { AnimatedAllComponent } from 'inferno-animation';
import './app.css';

// Animate on add/remove
class MyAnimated extends AnimatedAllComponent {
  render() {
    return <li className="test">{this.props.children}</li>;
  }
}

class MyList extends Component {
  constructor() {
    super();
    this.state = {
      items: [1, 2, 3, 4, 5],
    };
  }

  render() {
    return (
      <ul>
        {this.state.items.map((item) => (
          <MyAnimated animation="inferno-animation">{item}</MyAnimated>
        ))}
      </ul>
    );
  }
}
```

app.css

```css
@import '~inferno-animation/index.css';
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li.test {
  box-sizing: border-box;
  font-size: 2em;
  background: #ddd;
  border-bottom: 1px solid white;
}
```

The syntax for hooking up a function component is straight forward too:

```js
import {
  componentDidAppear,
  componentWillDisappear,
  componentWillMove,
} from 'inferno-animation';

<MyFuncComponent
  onComponentDidAppear={componentDidAppear}
  onComponentWillDisappear={componentWillDisappear}
  onComponentWillMove={componentWillMove}
>
  ...
</MyFuncComponent>;
```

IMPORTANT! Always use the provided helper methods instead of implementing the hooks yourself. There
might be optimisations and/or changes to how the animation hooks are implemented in future versions
of Inferno that you want to benefit from.

### Keyed-list layout animations

Importing `inferno-animation` installs the optional move engine. Core-only apps
include neither the move registry nor its scheduler, and bundlers that see no
import drop the reconciler's checks for it. Custom `componentWillMove` and
`onComponentWillMove` hooks also require `import 'inferno-animation'` before
rendering; using one of the exported animation components already does this.

The engine stays dormant until a component with a move hook mounts, and becomes
dormant again when the last one unmounts: until then reconciliation does no move
work, and an app that imports the package only for enter and leave animations
does not pay for moves. A class component has a move hook when `componentWillMove`
exists by the end of its mount: in the class, or assigned in the constructor,
`componentWillMount` or `componentDidMount`. A hook assigned later is not
supported. A function component has one when its hooks include
`onComponentWillMove`, also when a re-render adds it. A re-render that removes a
function component's move hook keeps the engine active until the page reloads;
nothing else changes. Mutating a hooks object in place is not supported.

Move animations cover reordering, insertions, removals and replacements during
keyed-list reconciliation, including the items these changes displace. An update
that keeps a list's keys in the same order moves nothing: items shifted by
content, prop or container-style changes jump to their new positions, and a move
still in progress keeps running. Keep stable keys on list items. Components may
render other class or function components; an outer move hook takes precedence
over hooks further down the same component chain. Fragments move as a whole,
while text and empty placeholders are excluded from geometry measurements.
Appear, disappear, and move hooks target the first root Element; roots
containing only text or empty placeholders have no animation target.

`componentWillMove(parentVNode, parentDOM, dom)` and
`onComponentWillMove(parentVNode, parentDOM, dom, props)` run **before** the list's
container properties or children are patched. Retained keyed children are
prepared, including items displaced without an explicit DOM move. Hooks see the
existing DOM and pre-update props. Discovery inside a retained wrapper uses its
current rendered subtree: a descendant can receive a preparation hook even if
the wrapper's upcoming render replaces or removes it. Direct keyed children that
are new, removed, or replaced are not prepared. The helpers discard nodes that
are removed or reparented before animation preparation.

Custom hooks should measure or schedule work without moving or removing DOM
nodes. They run for every retained item of an update, also when the keys stay in
order. The helpers then return at once, except for an owner that renders or sits
in a fragment, whose parent an inner keyed fragment can share. When an update
moves something, the helpers measure every sibling before and after it and apply
no styles, classes or computed-style reads to the ones that did not move. A list
is registered when it is first updated with the engine active, and whether it has
hooks is cached until a move hook mounts or unmounts.

The helpers measure siblings once per affected parent and coordinate transforms
with that parent's enter/leave styles. Synchronous commits, including nested
renders from lifecycle callbacks, share the first source positions and prepare
the final target in a microtask before paint. Unrelated parents keep their own
animation schedule. An update that moves items during a move transition starts
from their visible positions.

A moved item starts where it was on screen. The offset is converted into the
item's own coordinates, so 2D transforms of its ancestors, also those around a
shadow root, an SVG `viewBox`, and the item's own `scale` and `rotate`
properties are taken into account. CSS `zoom`, perspective and rotations around
another axis than z are not: items inside them start at a wrong distance. A list
may be rendered into a shadow root or a document fragment.

A list inside an element that starts moving in the same update, such as a group
of a grouped list, moves relative to that element: an item that ends where it
was on screen moves against its group. The items of such a list are measured
while the list around them is patched, and are corrected by the distance that
removals before them have shifted their group. That needs move hooks on the
groups: inside plain elements the items start from the shifted positions.

An element hidden with `display: none` has no position: one that becomes visible
in a reordering update appears in place. An item that runs a CSS animation, also
one that has finished with `animation-fill-mode: forwards`, or whose `transform`
a script animation (`element.animate`) sets, moves with the `translate` property
instead, because the animation would override the move's transform. The move
classes' `transform` transition then applies to `translate`. A CSS animation is
recognized by its computed `animation-name`, so an item moves with `translate`
also when its animation leaves the transform alone; the movement looks the same.

Elements still entering or leaving, or running an author CSS transition, are
excluded from move transforms. On a reorder those elements move directly to
their reconciled positions while eligible neighbours slide. This preserves the
transition styles, including author opacity, size, and transform transitions.
It also applies to plain siblings of animated items. Once that transition ends,
the element is eligible on the next update. Inline transition longhands and
priorities, author transforms, and unrelated classes are restored on cleanup;
styles changed by the application during the move are not overwritten.

Leave animations keep their CSS-driven layout behavior. A leaving element is
measured together with the other leaves once the update's DOM writes are done,
not while it is unmounted between them, so its leave starts from its box after
the update. An element with a `globalAnimationKey` is measured at once, because
its box is the source of another element's enter. Asynchronous completion
callbacks for the same frame are collected before removing DOM: each parent is
measured once, its completed leaves are removed together, and survivors animate
the remaining gap. Physical removal may therefore wait until the next animation
frame. Synchronous completion during reconciliation stays immediate and uses the
existing preparation. Completion callbacks are safe to call repeatedly or after
a later unmount. Survivors animate the gap only in lists the engine has
registered: a keyed list that was never updated since the first move hook
mounted does not animate when a sibling keyed fragment removes an item on its
own, for example through `setState` inside that fragment.

A leave that interrupts an enter starts from the size and values the enter has
reached: those of the properties that the element's computed transition lists
name. For a list with `all`, such as the one of `index.css`, the values are
read exactly while at most 16 leaves of an update interrupt an enter; beyond
that, the properties that enter and leave animations commonly transition are
held (opacity, transforms, filter, clip path, shadows, colors, insets, margins,
paddings, border widths, and minimum and maximum sizes). An element that leaves
before its enter has started its transitions is removed at once, without a leave
animation: nothing of it has been visible.

An enter, leave or move ends when the transitions that its element's computed
transition lists can run have ended or been cancelled, or after the longest of
them plus 100 ms. Entries with a zero duration and delay never run and are not
waited for, and transitions of `::before` and `::after` belong to those
pseudo-elements.

A leaving element that was moving stays where its move has brought it, also
when its whole list is removed or replaced. Its offset is kept in the
`translate` property, so that the leave classes can animate its `transform`. An
element that has a `translate` of its own keeps the offset in its `transform`,
which the leave classes then cannot animate.

Enter and leave animations restore the element's inline `width` and `height`,
and a global animation its inline `transform` and `transform-origin`, unless the
application changed them during the animation. Inline declarations take
precedence over the animation classes: an element that the application gives an
inline `height` does not grow or collapse with them.

Children replaced by text or by `dangerouslySetInnerHTML` are removed at once:
their leave hooks do not run. An element replaced by an element of another type
stays in the document until the leave hooks inside it complete.

Resizing the viewport or loading an image without a keyed-list update does not
itself trigger a move animation. The `docs/animation-glitch` example exercises
mixed animated/plain items, nested components, and insertion/removal updates.

### Global animations

Global animations allow you to animate a component between positions on two different "pages". Technincally this means they don't have the same parent element. When you mount one page imediately after unmounting the other page, inferno-animation will perform a FLIP-animation between the two positions. To match the elements you use the attribute `globalAnimationKey` which accept a string. The position of a leaving element can be used for one second: an element that enters with its key later than that, for example on a page that took longer to load, appears in place.

Global animations are very simple to use, [check this example.](https://github.com/infernojs/inferno/blob/master/docs/animations-global-demo/app.js)

### Bootstrap style modal animation

This is an example of how you could implement a Bootstrap style Modal animation using inferno-animation. These two animations are used both for the backdrop and the modal and the purpose is to support the CSS-rules without modification.

- always use the inferno-animation utility functions
- implementation is straight forward
- `callback` in animateModalOnWillDisappear triggers the dom-removal in Inferno and is crucial!

Custom animations won't be coordinated with the standard animations to reduce reflow, but performance is not an issue with just a few animations running simultaneously. Use the standard animations for grid or list items.

Call these helper methods from `componentDidAppear` and `componentWillDisapper` of your backdrop and content component when you build a Bootstrap style modal.

```js
import { utils } from 'inferno-animation';
const {
  addClassName,
  removeClassName,
  registerTransitionListener,
  forceReflow,
  setDisplay,
} = utils;

export function animateModalOnWillDisappear(dom, callback, onClosed) {
  registerTransitionListener([dom], () => {
    // Always call the dom removal callback first!
    callback && callback();
    onClosed && onClosed();
  });

  setTimeout(() => {
    removeClassName(dom, 'show');
  }, 5);
}

export function animateModalOnDidAppear(dom, onOpened) {
  setDisplay(dom, 'none');
  addClassName(dom, 'fade');
  forceReflow(dom);
  setDisplay(dom, undefined);

  registerTransitionListener([dom, dom.children[0]], function () {
    // *** Cleanup ***
    setDisplay(dom, undefined);
    onOpened && onOpened(dom);
  });

  addClassName(dom, 'show');
}
```
