# inferno-animation
Helper components and utils to add smooth CSS-animations to your Inferno apps. Extend from `<AnimatedComponent>` and include the css from index.css in this package to get default animation on opacity and height. Requires setting `box-sizing: border-box;` on the animated element.

If you want to customise your animations, just use index.css as a template and replace "inferno-animation" prefix in the CSS-class names with your custom animation name (i.e. mySuperAnimation). Then pass that name to your animated component as an attribute `<MyComponent animation="mySuperAnimation" />` and your customised animation will be used.

For examples of what animations look like you can try inferno/docs/animations/index.html.

## Install

```
npm install inferno-animation
```

## Usage

app.js
```js
import { Component } from 'inferno';
import { AnimatedComponent } from 'inferno-animation';
import './app.css';

class MyAnimated extends AnimatedComponent {

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
