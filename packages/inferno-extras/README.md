# inferno-extras

Is a collection of pure functions to ease some tasks with InfernoJS virtual DOM.

## Install

```
npm install inferno-extras
```

### isDOMinsideComponent

DOM - Html node

instance - Class component instance

Returns boolean:
- `true` when DOM is found from children of given instance;
- `false` when DOM node is not found.

```js
import { isDOMinsideComponent } from 'inferno-extras';

isDOMinsideComponent(
  DOM,
  instance,
)
```


**Motivation:**

InfernoJS events bubble through the real DOM.
This can cause issues when you need to for example: stop event propagation from all child Components.
Native `node.contains( otherNode )` returns false when Portal renders outside its root node.
This utility method solves the problem using non recursive DFS algorithm.


**Example:**

```jsx
import { Component } from 'inferno';
import { isDOMinsideVDOM } from 'inferno-extras';

class Clicker extends Component {

    isClickOutside(event) {
        // Check if click event came from any child component
        if (!isDOMinsideComponent(event.target, this) {
            this.setState({closeMenu: true});
        }
    }

    ...
}
```

### isDOMinsideVNode

Exactly same as isDOMinsideComponent but second parameter is virtual node.
