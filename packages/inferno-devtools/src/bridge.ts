import {options, VNode} from 'inferno';
import { VNodeFlags, ChildFlags } from 'inferno-vnode-flags';
import {isInvalid, isNullOrUndef} from "inferno-shared";

let updatingDevTool = false;
let Reconciler;
let Mount;

function createReactElement(vNode) {
    return {
        key: vNode.key,
        props: vNode.props,
        ref: vNode.ref,
        type: vNode.type
    };
}

function createReactDOMComponent(vNode, oldDevToolInstance?) {
    const flags = vNode.flags;

    if ((flags & VNodeFlags.Void) > 0) {
        return null;
    }

    const devToolChildren = oldDevToolInstance ? oldDevToolInstance._renderedChildren : null;
    const isTextVNode = (flags & VNodeFlags.Text) > 0;
    const childFlags = vNode.childFlags;
    let renderedChildren;

    if (childFlags & ChildFlags.HasInvalidChildren) {
        renderedChildren = null;
    } else if (childFlags & ChildFlags.MultipleChildren) {
        renderedChildren = [];

        for (let i = 0; i < vNode.children.length; i++) {
            renderedChildren.push(updateReactComponent(vNode.children[i], devToolChildren ? devToolChildren[i] : null))
        }
    } else if (childFlags & ChildFlags.HasVNodeChildren) {
        renderedChildren = [updateReactComponent(vNode.children, devToolChildren ? devToolChildren[0] : devToolChildren)];
    }

    return {
        // --- ReactDOMComponent interface
        _currentElement: isTextVNode ? (vNode.children + '') : {
            props: vNode.props,
            type: vNode.type
        },
        _inDevTools: false,
        _renderedChildren: renderedChildren,
        _stringText: isTextVNode ? vNode.children : null,
        vNode
    };
}

function typeName(element) {
    if (typeof element.type === 'function') {
        return element.type.displayName || element.type.name;
    }
    return element.type;
}

function createReactCompositeComponent(vNode, oldDevToolInstance) {
    const flags = vNode.flags;
    const _currentElement = createReactElement(vNode);
    const component = (flags & VNodeFlags.ComponentClass) > 0 ? vNode.children : vNode.type;

    const instance = {
        // --- ReactDOMComponent properties
        getName() {
            return typeName(_currentElement);
        },
        _currentElement: createReactElement(vNode),
        _instance: component,
        forceUpdate: null,
        props: component.props,
        setState: null,
        state: component.state,
        vNode
    };

    if (!oldDevToolInstance) {
        if (component && component.forceUpdate) {
            const forceInstanceUpdate = component.forceUpdate.bind(component); // Save off for use below.

            component.forceUpdate = (instance as any).forceUpdate = function (originalCallback) {
                if (!updatingDevTool) {
                    updatingDevTool = true;
                    instance.props = vNode.props = Object.assign(instance.props, instance._currentElement.props);
                    forceInstanceUpdate(function () {
                        if (originalCallback) {
                            originalCallback();
                        }
                        checkVNode(component.$V, instance);
                    });
                    checkVNode(component.$V, instance);
                    updatingDevTool = false;
                    return;
                }
                instance.props = vNode.props = Object.assign(instance.props, instance._currentElement.props);
                forceInstanceUpdate(originalCallback);
            };
        }
        if (component && component.setState) {
            const setInstanceState = component.setState.bind(component);

            component.setState = (instance as any).setState = function (newState, callback) {
                if (!updatingDevTool) {
                    updatingDevTool = true;
                    setInstanceState(newState, function () {
                        if (callback) {
                            callback();
                        }
                        checkVNode(component.$V, instance);
                    });
                    updatingDevTool = false;
                    return;
                }
                setInstanceState(newState, callback);
            };
        }
    }

    if ((flags & VNodeFlags.Component) > 0) {
        (instance as any)._renderedComponent = updateReactComponent(
            (flags & VNodeFlags.ComponentClass) > 0 ? vNode.children.$LI : vNode.children,
            oldDevToolInstance ? oldDevToolInstance._renderedComponent : null
        );
    }

    return instance;
}


function updateReactComponent(vNode, oldDevToolInstance?) {
    const newInstance = (vNode.flags & (VNodeFlags.Element | VNodeFlags.Text)) > 0 ?
        createReactDOMComponent(vNode, oldDevToolInstance) :
        createReactCompositeComponent(vNode, oldDevToolInstance);

    if (oldDevToolInstance) {
        Object.assign(oldDevToolInstance, newInstance);

        return oldDevToolInstance;
    }

    return newInstance;
}

function nextRootKey(roots) {
    return '.' + Object.keys(roots).length;
}

function findRoots(roots) {
    const elements = document.body.querySelectorAll('*');

    for (let i = 0; i < elements.length; i++) {
        const vNode = (elements[i] as any).$V;

        if (vNode && isRootVNode(vNode)) {
            roots[nextRootKey(roots)] = updateReactComponent(vNode);
        }
    }
}

function mountDevToolComponentTree(component) {
    if (!component) {
        return;
    }

    Reconciler.mountComponent(component);

    if (component._renderedComponent) {
        mountDevToolComponentTree(component._renderedComponent);
    } else if (component._renderedChildren) {
        for (let i = 0; i < component._renderedChildren.length; i++) {
            mountDevToolComponentTree(component._renderedChildren[i]);
        }
    }
}

function checkChildVNodes(childFlags, children, devToolComponent) {
    const devToolChildren = devToolComponent._renderedChildren;
    let i;

    switch (childFlags) {
        case ChildFlags.HasVNodeChildren:
            checkVNode(children, devToolChildren[0], devToolComponent);

            if (devToolChildren.length > 1) {
                for (i = 1; i < devToolChildren.length; i++) {
                    Reconciler.unmountComponent(devToolChildren[i])
                }
            }

            break;
        case ChildFlags.HasKeyedChildren:
        case ChildFlags.HasNonKeyedChildren:
            const vNodeLength = children.length;
            const devToolLength = devToolChildren.length;
            const commonLength = vNodeLength > devToolLength ? devToolLength : vNodeLength;
            i = 0;

            for (; i < commonLength; i++) {
                checkVNode(children[i], devToolChildren[i], devToolComponent, i);
            }
            if (devToolLength < vNodeLength) {
                const newDevToolChildren = updateReactComponent(children[i]);

                devToolChildren.push(newDevToolChildren);

                mountDevToolComponentTree(newDevToolChildren);
            } else if (devToolLength > vNodeLength) {
                for (i = commonLength; i < devToolLength; i++) {
                    Reconciler.unmountComponent(devToolChildren.pop());
                }
            }
            break;
        case ChildFlags.HasInvalidChildren:
            if (devToolChildren) {
                Reconciler.unmountComponent(devToolChildren);
            }
            break;
    }
}

function isRootVNode(vNode: VNode): boolean {
    if (!vNode.dom) {
        return false;
    }
    const parentNode = vNode.dom.parentNode as any;

    if (!parentNode) {
        return false;
    }

    return Boolean(parentNode && parentNode.$V === vNode);
}

function checkVNode(vNode, devToolNode, devToolParentNode?, index?: number) {
    if (!devToolNode) {
        return updateReactComponent(vNode);
    }
    const vNodeDevTool = devToolNode.vNode;

    if (vNode.type === vNodeDevTool.type &&
        vNode.key === vNodeDevTool.key) {

        if ((vNode.flags & 4) > 0) {
            checkVNode(vNode.children.$LI, devToolNode._renderedComponent, devToolNode);
        } else if ((vNode.flags & 8) > 0) {
            checkVNode(vNode.children, devToolNode._renderedComponent, devToolNode);
        } else {
            checkChildVNodes(vNode.childFlags, vNode.children, devToolNode);
        }

        Reconciler.receiveComponent(updateReactComponent(vNode, devToolNode));
    }
    else {
        Reconciler.unmountComponent(devToolNode);

        const newDevToolComponent = updateReactComponent(vNode);

        // Is component ?
        if (devToolParentNode) {
            if (devToolParentNode._renderedComponent) {
                devToolParentNode._renderedComponent = newDevToolComponent;
            } else if (!isNullOrUndef(index)) {
                devToolParentNode._renderedChildren[index] = newDevToolComponent;
            } else {
                devToolParentNode._renderedChildren = [newDevToolComponent];
            }
        }

        mountDevToolComponentTree(newDevToolComponent);
    }
}

export function createDevToolsBridge() {
    const ComponentTree = {
        getNodeFromInstance(instance) {
            return instance.vNode.dom;
        },
        getClosestInstanceFromNode(vNode) {
            while (vNode && !vNode.$V) {
                vNode = vNode.parentNode;
            }
            return vNode ? updateReactComponent(vNode.$V) : null;
        }
    };

    // Map of root ID (the ID is unimportant) to component instance.
    const roots = Object.create(null);

    findRoots(roots);

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
        // tslint:disable-next-line:no-empty
        mountComponent(instance) {},
        // tslint:disable-next-line:no-empty
        performUpdateIfNecessary(instance) {},
        // tslint:disable-next-line:no-empty
        receiveComponent(instance) {},
        // tslint:disable-next-line:no-empty
        unmountComponent(instance) {}
    };

    const oldRenderComplete = options.renderComplete;

    options.renderComplete = function (rootInput) {
        if (!isInvalid(rootInput)) {
            const instance = updateReactComponent(rootInput);

            if (isRootVNode(rootInput)) {
                instance._rootNodeID = nextRootKey(roots);
                roots[instance._rootNodeID] = instance;
                mountDevToolComponentTree(instance);
                Mount._renderNewRootComponent(instance);
            } else if (rootInput.dom === null) {
                for (const rootKey in roots) {
                    const rootInstance = roots[rootKey];

                    if (!rootInstance.vNode.dom) {
                        Reconciler.unmountComponent(rootInstance);

                        delete roots[rootKey];

                        return;
                    }
                }
            }
            if (oldRenderComplete) {
                oldRenderComplete(rootInput);
            }
        }
    };


    return {
        ComponentTree,
        Mount,
        Reconciler
    };
}
