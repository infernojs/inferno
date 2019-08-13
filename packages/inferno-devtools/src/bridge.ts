import {findDOMfromVNode, options, VNode} from 'inferno';
import {ChildFlags, VNodeFlags} from 'inferno-vnode-flags';
import {combineFrom, isInvalid, isNullOrUndef} from 'inferno-shared';
import {findDOMNode} from 'inferno-extras';

let updatingDevTool = false;
let Reconciler;
let Mount;
let rootKey = 0;
let isActive = false;

function createReactElement(vNode) {
  return {
    key: vNode.key,
    props: vNode.props,
    ref: vNode.ref,
    type: vNode.type
  };
}

// Reading offsetParent causes forced re-flow
function isDetached(child) {
  if (child === null) {
    return true;
  }

  const documentBody = document.body;
  let node = child;

  do {
    node = node.parentNode;

    if (node === null) {
      return true;
    }
  } while (node !== documentBody);

  return false;
}

function createReactDOMComponent(vNode, oldDevToolInstance?) {
  const flags = vNode.flags;

  if ((flags & VNodeFlags.Void) > 0) {
    return null;
  }

  const devToolChildren = oldDevToolInstance ? oldDevToolInstance._renderedChildren : null;
  const isTextVNode = (flags & VNodeFlags.Text) > 0 || (vNode.childFlags & ChildFlags.HasTextChildren) !== 0;
  const childFlags = vNode.childFlags;
  let renderedChildren;

  if (childFlags === ChildFlags.HasInvalidChildren) {
    renderedChildren = null;
  } else if (childFlags & ChildFlags.MultipleChildren) {
    renderedChildren = [];

    for (let i = 0; i < vNode.children.length; ++i) {
      renderedChildren.push(updateReactComponent(vNode.children[i], devToolChildren ? devToolChildren[i] : null));
    }
  } else if (childFlags === ChildFlags.HasVNodeChildren) {
    renderedChildren = [updateReactComponent(vNode.children, devToolChildren ? devToolChildren[0] : devToolChildren)];
  }

  return {
    // --- ReactDOMComponent interface
    _currentElement:
      (flags & VNodeFlags.Text) > 0
        ? vNode.children + ''
        : {
            props: vNode.className ? combineFrom(vNode.props, { className: vNode.className }) : vNode.props,
            type: flags & VNodeFlags.Portal ? 'InfernoPortal' : vNode.type
          },
    _renderedChildren: renderedChildren,
    _stringText: isTextVNode ? vNode.children + '' : null,
    vNode
  };
}

function updateComponentRoot(lastInput, devToolNode) {
  if ((lastInput.flags & VNodeFlags.ComponentClass) > 0) {
    checkVNode(lastInput.children ? (lastInput.children as any).$LI : null, devToolNode._renderedComponent, devToolNode);
  } else if ((lastInput.flags & VNodeFlags.ComponentFunction) > 0) {
    checkVNode(lastInput.children, devToolNode._renderedComponent, devToolNode);
  } else {
    checkChildVNodes(lastInput.childFlags, lastInput.children, devToolNode);
  }
}

function createReactCompositeComponent(vNode, oldDevToolInstance) {
  const flags = vNode.flags;
  const component = (flags & VNodeFlags.ComponentClass) > 0 ? vNode.children : vNode.type;

  const instance = {
    // --- ReactDOMComponent properties
    _currentElement: createReactElement(vNode),
    _instance: component,
    props: vNode.props,
    state: component && component.state,
    vNode
  };

  if (!oldDevToolInstance) {
    if (component && component.forceUpdate) {
      const forceInstanceUpdate = component.forceUpdate.bind(component); // Save off for use below.

      component.forceUpdate = (instance as any).forceUpdate = function(callback) {
        if (!isActive) {
          return;
        }
        instance.props = vNode.props = combineFrom(instance.props, instance._currentElement.props);

        if (!updatingDevTool && !component.$BR && !component.QU) {
          updatingDevTool = true;
          forceInstanceUpdate(callback);
          updateComponentRoot(component.$LI, (instance as any)._renderedComponent);
          updatingDevTool = false;
          return;
        }
        forceInstanceUpdate(callback);
      };
    }
    if (component && component.setState) {
      const setInstanceState = component.setState.bind(component);

      component.setState = (instance as any).setState = function(newState, callback) {
        if (!isActive) {
          return;
        }
        if (!updatingDevTool && !component.$BR && !component.QU) {
          updatingDevTool = true;
          setInstanceState(newState, callback);
          updateComponentRoot(component.$LI, (instance as any)._renderedComponent);
          updatingDevTool = false;
          return;
        }
        setInstanceState(newState, callback);
      };
    }
  }

  if ((flags & VNodeFlags.Component) > 0) {
    const lastVNode = (flags & VNodeFlags.ComponentClass) > 0 ? (vNode.children ? (vNode.children as any).$LI : null) : vNode.children;

    if (lastVNode) {
      (instance as any)._renderedComponent = updateReactComponent(lastVNode, oldDevToolInstance ? oldDevToolInstance._renderedComponent : null);
    }
  }

  return instance;
}

function updateReactComponent(vNode, oldDevToolInstance?) {
  const newInstance =
    (vNode.flags & (VNodeFlags.Element | VNodeFlags.Text | VNodeFlags.Portal)) > 0
      ? createReactDOMComponent(vNode, oldDevToolInstance)
      : createReactCompositeComponent(vNode, oldDevToolInstance);

  if (oldDevToolInstance) {
    oldDevToolInstance = combineFrom(oldDevToolInstance, newInstance);

    return oldDevToolInstance;
  }

  return newInstance;
}

function nextRootKey() {
  return '.' + rootKey++;
}

function findRoots(roots) {
  const elements = document.body.querySelectorAll('*');

  for (let i = 0; i < elements.length; ++i) {
    const vNode = (elements[i] as any).$V;

    if (vNode && isRootVNode(vNode)) {
      roots[nextRootKey()] = updateReactComponent(vNode);
    }
  }
}

function mountDevToolComponentTree(component) {
  if (!component || component._instance === null) {
    return;
  }

  Reconciler.mountComponent(component);

  if (component._renderedComponent) {
    mountDevToolComponentTree(component._renderedComponent);
  } else if (component._renderedChildren) {
    for (let i = 0; i < component._renderedChildren.length; ++i) {
      mountDevToolComponentTree(component._renderedChildren[i]);
    }
  }
}

function checkChildVNodes(childFlags, children, devToolComponent) {
  let devToolChildren = devToolComponent._renderedChildren;
  const devToolLength = devToolChildren ? devToolChildren.length : 0;
  let i;

  switch (childFlags) {
    case ChildFlags.HasVNodeChildren:
      checkVNode(children, devToolChildren ? devToolChildren[0] : null, devToolComponent);

      if (devToolLength > 1) {
        for (i = 1; i < devToolLength; ++i) {
          Reconciler.unmountComponent(devToolChildren[i]);
        }
      }

      break;
    case ChildFlags.HasTextChildren:
      devToolComponent._stringText = children + '';
      break;
    case ChildFlags.HasKeyedChildren:
    case ChildFlags.HasNonKeyedChildren:
      const vNodeLength = children.length;
      const commonLength = vNodeLength > devToolLength ? devToolLength : vNodeLength;
      i = 0;

      for (; i < commonLength; ++i) {
        checkVNode(children[i], devToolChildren[i], devToolComponent, i);
      }
      if (devToolLength < vNodeLength) {
        for (i = commonLength; i < vNodeLength; ++i) {
          const newDevToolChildren = updateReactComponent(children[i]);

          if (!devToolChildren) {
            devToolChildren = devToolComponent._renderedChildren = [];
          }
          devToolChildren.push(newDevToolChildren);

          mountDevToolComponentTree(newDevToolChildren);
        }
      } else if (devToolLength > vNodeLength) {
        for (i = commonLength; i < devToolLength; ++i) {
          Reconciler.unmountComponent(devToolChildren.pop());
        }
      }
      break;
    case ChildFlags.HasInvalidChildren:
      for (i = 0; i < devToolLength; ++i) {
        Reconciler.unmountComponent(devToolChildren[i]);
      }
      devToolComponent._renderedChildren = null;
      break;
  }
}

function isRootVNode(vNode: VNode): boolean {
  if (!(vNode.flags & VNodeFlags.InUse)) {
    return false;
  }
  const dom = findDOMfromVNode(vNode, true);

  if (!dom) {
    return false;
  }
  const parentNode = dom.parentNode as any;

  if (!parentNode) {
    return false;
  }

  return Boolean(parentNode && parentNode.$V === vNode);
}

function checkVNode(vNode, devToolNode, devToolParentNode?, index?: number) {
  if (!devToolNode && vNode) {
    mountNewVNode(vNode, devToolParentNode, index);
    return;
  } else if (devToolNode && vNode) {
    const vNodeDevTool = devToolNode.vNode;

    if (vNode.type === vNodeDevTool.type && vNode.key === vNodeDevTool.key) {
      if ((vNode.flags & VNodeFlags.Text) > 0 && devToolNode._stringText) {
        devToolNode._currentElement = vNode.children + '';
        devToolNode._stringText = vNode.children + '';
      } else if ((vNode.flags & VNodeFlags.ComponentClass) > 0) {
        checkVNode(vNode.children ? (vNode.children as any).$LI : null, devToolNode._renderedComponent, devToolNode);
      } else if ((vNode.flags & VNodeFlags.ComponentFunction) > 0) {
        checkVNode(vNode.children, devToolNode._renderedComponent, devToolNode);
      } else {
        checkChildVNodes(vNode.childFlags, vNode.children, devToolNode);
      }
      devToolNode.vNode = vNode;
      // Dont inform dev tools if component is not yet functional
      if (devToolNode._instance !== null) {
        Reconciler.receiveComponent(devToolNode);
      }
    } else {
      Reconciler.unmountComponent(devToolNode);
      mountNewVNode(vNode, devToolParentNode, index);
    }
  } else if (!vNode && devToolNode) {
    if (devToolParentNode._renderedChildren) {
      devToolParentNode._renderedChildren = [];
    } else if (devToolParentNode._renderedComponent) {
      devToolParentNode._renderedComponent = null;
    }
    Reconciler.unmountComponent(devToolNode);
  }
}

function mountNewVNode(vNode, devToolParentNode?, index?: number) {
  const newDevToolComponent = updateReactComponent(vNode);

  // Is component ?
  if (devToolParentNode) {
    if (devToolParentNode._renderedComponent) {
      devToolParentNode._renderedComponent = newDevToolComponent;
    } else if (!isNullOrUndef(index)) {
      devToolParentNode._renderedChildren[index] = newDevToolComponent;
    } else if (devToolParentNode._renderedChildren) {
      devToolParentNode._renderedChildren.splice(0, devToolParentNode._renderedChildren.length - 1, newDevToolComponent);
    } else {
      devToolParentNode._renderedChildren = [newDevToolComponent];
    }
  }

  mountDevToolComponentTree(newDevToolComponent);
}

export function createDevToolsBridge() {
  const ComponentTree = {
    getNodeFromInstance(devToolNode) {
      return findDOMNode(devToolNode.vNode);
    },
    getClosestInstanceFromNode(vNode) {
      while (vNode && !vNode.$V) {
        vNode = vNode.parentNode;
      }
      return vNode ? updateReactComponent(vNode.$V) : null;
    }
  };

  // Map of root ID (the ID is unimportant) to component instance.
  let roots = Object.create(null);

  // ReactMount-like object
  //
  // Used by devtools to discover the list of root component instances and get
  // notified when new root components are rendered.
  Mount = {
    _instancesByReactRootID: roots,
    _renderNewRootComponent(instance) {
      return instance;
    }
  };

  // ReactReconciler-like object
  Reconciler = {
    mountComponent(instance) {
      return instance;
    },
    performUpdateIfNecessary(instance) {
      return instance;
    },
    receiveComponent(instance) {
      return instance;
    },
    unmountComponent(instance) {
      return instance;
    }
  };

  const oldRenderComplete = options.renderComplete;

  options.renderComplete = function(rootInput, parentDOM) {
    if (!isActive) {
      return;
    }
    if (!isInvalid(rootInput)) {
      let root;
      let instance;

      if ((parentDOM as any).$V) {
        // Check if root exists
        for (root in roots) {
          const rootInstance = roots[root];
          const rootNode = findDOMfromVNode(rootInstance.vNode, true);

          if (isDetached(rootNode)) {
            Reconciler.unmountComponent(rootInstance);

            delete roots[root];

            break;
          } else if (rootNode === findDOMNode(rootInput)) {
            checkVNode(rootInput, rootInstance);
            return;
          }
        }
        instance = updateReactComponent(rootInput);
        instance._rootNodeID = nextRootKey();
        roots[instance._rootNodeID] = instance;
        mountDevToolComponentTree(instance);
        Mount._renderNewRootComponent(instance);
      } else {
        const dom = findDOMNode(rootInput);

        if (isDetached(dom)) {
          for (root in roots) {
            const rootInstance = roots[root];

            if (isDetached(findDOMNode(rootInstance.vNode))) {
              Reconciler.unmountComponent(rootInstance);

              delete roots[root];

              return;
            }
          }
        }
      }
      if (oldRenderComplete) {
        oldRenderComplete(rootInput, parentDOM);
      }
    }
  };

  function _listener(evt) {
    if (evt.source !== window || !evt.data || evt.data.source !== 'react-devtools-content-script' || !evt.data.payload) {
      return;
    }
    const type = evt.data.payload.type;

    if (type === 'resume' || (type === 'callback' && !isActive)) {
      isActive = true;
      findRoots(roots);
    } else if (type === 'pause') {
      isActive = false;
      roots = Object.create(null);
    }
  }

  window.addEventListener('message', _listener);

  return {
    ComponentTree,
    Mount,
    Reconciler,
    _listener
  };
}
