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

  render () {
    return <li className="test">{this.props.children}</li>
  }
}

class MyList extends Component {
  constructor() {
    super()
    this.state = {
      items: [1, 2, 3, 4, 5]
    }
  }

  render () {
    return (
      <ul>
        {this.state.items.map((item) => <MyAnimated animation="inferno-animation">{item}</MyAnimated>)}
      </ul>
    )
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
import { componentDidAppear, componentWillDisappear, componentWillMove } from 'inferno-animation';

<MyFuncComponent
  onComponentDidAppear={componentDidAppear}
  onComponentWillDisappear={componentWillDisappear}
  onComponentWillMove={componentWillMove}>...</MyFuncComponent>
```

IMPORTANT! Always use the provided helper methods instead of implementing the hooks yourself. There
might be optimisations and/or changes to how the animation hooks are implemented in future versions
of Inferno that you want to benefit from.

### Global animations
Global animations allow you to animate a component between positions on two different "pages". Technincally this means they don't have the same parent element. When you mount one page imediately after unmounting the other page, inferno-animation will perform a FLIP-animation between the two positions. To match the elements you use the attribute `globalAnimationKey` which accept a string.

Global animations are very simple to use, [check this example.](https://github.com/infernojs/inferno/blob/master/docs/animations-global-demo/app.js)

### Bootstrap style modal animation
This is an example of how you could implement a Bootstrap style Modal animation using inferno-animation. These two animations are used both for the backdrop and the modal and the purpose is to support the CSS-rules without modification.

- always use the inferno-animation utility functions
- implementation is straight forward
- `callback` in animateModalOnWillDisappear triggers the dom-removal in Inferno and is crucial!

Custom animations won't be coordinated with the standard animations to reduce reflow, but performance is not an issue with just a few animations running simultaneously. Use the standard animations for grid or list items.

Call these helper methods from `componentDidAppear` and `componentWillDisapper` of your backdrop and content component when you build a Bootstrap style modal. 

```js
import { utils } from 'inferno-animation'
const {
  addClassName,
  removeClassName,
  registerTransitionListener,
  forceReflow,
  setDisplay
} = utils

export function animateModalOnWillDisappear (dom, callback, onClosed) { 
  registerTransitionListener([dom], () => {
    // Always call the dom removal callback first!
    callback && callback()
    onClosed && onClosed()
  })

  setTimeout(() => {
    removeClassName(dom, 'show')
  }, 5)
}

export function animateModalOnDidAppear (dom, onOpened) {
  setDisplay(dom, 'none')
  addClassName(dom, 'fade')
  forceReflow(dom)
  setDisplay(dom, undefined)

  registerTransitionListener([dom, dom.children[0]], function () {
    // *** Cleanup ***
    setDisplay(dom, undefined)
    onOpened && onOpened(dom)
  })
  
  addClassName(dom, 'show')
}
```