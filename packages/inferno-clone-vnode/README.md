# Inferno-clone-vnode

This package can be used to clone Inferno virtual nodes. This package can also be aliased to `React.cloneElement`.

```
import { cloneVNode } from 'inferno-clone-vnode';

const cloned = cloneVNode(
  vNode,
  [props],
  [...children]
)
``` 

Clone and return a new Inferno vNode using element as the starting point. 
The resulting element will have the original element’s props with the new props merged in shallowly. 
New children will replace existing children. key and ref from the original element will be preserved.
