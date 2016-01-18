/* eslint new-cap:0 */
import isVoid from '../../util/isVoid';
import { recycle } from '../recycling';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import recreateRootNode from '../recreateRootNode';
import { handleHooks, hookTypes } from '../addAttributes';

const statefulError = 'Inferno Error: Stateful ES2015 components from `inferno-component` cannot use inline lifecycle hooks, apply the lifecycle methods to the class itself.';

export default function createRootNodeWithComponent(componentIndex, props, recyclingEnabled) {
	let currentItem;
	let statelessRender;
	const instanceMap = {};
	const node = {
		pool: [],
		keyedPool: [],
		overrideItem: null,
		create(item, treeLifecycle, context) {
			let instance;
			let domNode;
			let toUseItem = item;

			if (node.overrideItem !== null) {
				toUseItem = node.overrideItem;
			}
			if (recyclingEnabled) {
				domNode = recycle(node, item, treeLifecycle, context);
				if (domNode) {
					return domNode;
				}
			}
			const Component = getValueWithIndex(toUseItem, componentIndex);

			currentItem = item;
			if (isVoid(Component)) {
				// bad component, make a text node
				domNode = document.createTextNode('');
				item.rootNode = domNode;
				instance = null;
				return domNode;
			} else if (typeof Component === 'function') {
				// stateless component
				if (!Component.prototype.render) {
					const nextProps = getValueForProps(props, toUseItem);
					if (props) {
						if (props.onComponentWillMount) {
							handleHooks(item, nextProps, null, 'onComponentWillMount', true);
						}
						if (props.onComponentDidMount) {
							treeLifecycle.addTreeSuccessListener(() => {
								item.rootNode = domNode;
								handleHooks(item, nextProps, domNode, 'onComponentDidMount', true);
							});
						}
					}
					const nextRender = Component(nextProps, context);

					nextRender.parent = item;
					domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
					statelessRender = nextRender;
					item.rootNode = domNode;
				} else {
					if (props.onComponentWillMount || props.onComponentDidMount || props.onComponentWillUnmount
						|| props.onComponentShouldUpdate || props.onComponentWillUpdate || props.onComponentDidUpdate) {
						throw Error(statefulError);
					}
					instance = new Component(getValueForProps(props, toUseItem));
					instance.context = context;
					instance.componentWillMount();
					const nextRender = instance.render();
					const childContext = instance.getChildContext();
					let fragmentFirstChild;

					if (childContext) {
						context = { ...context, ...childContext };
					}
					nextRender.parent = item;
					domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
					item.rootNode = domNode;
					instance._lastRender = nextRender;

					if (domNode instanceof DocumentFragment) {
						fragmentFirstChild = domNode.childNodes[0];
					}
					treeLifecycle.addTreeSuccessListener(() => {
						if (fragmentFirstChild) {
							domNode = fragmentFirstChild.parentNode;
							item.rootNode = domNode;
						}
						instance.componentDidMount();
					});
					instance.forceUpdate = () => {
						instance.context = context;
						const nextRender = instance.render.call(instance);
						const childContext = instance.getChildContext();

						if (childContext) {
							context = { ...context, ...childContext };
						}
						nextRender.parent = currentItem;
						nextRender.tree.dom.update(instance._lastRender, nextRender, treeLifecycle, context);
						currentItem.rootNode = nextRender.rootNode;
						instance._lastRender = nextRender;
					};
				}
			}
			instanceMap[item.id] = instance;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const Component = getValueWithIndex(nextItem, componentIndex);
			const instance = instanceMap[lastItem.id];

			nextItem.id = lastItem.id;
			nextItem.rootNode = lastItem.rootNode;
			currentItem = nextItem;
			if (!Component) {
				recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
				return;
			}
			if (typeof Component === 'function') {
				if (!Component.prototype.render) {
					const lastProps = getValueForProps(props, lastItem);
					const nextProps = getValueForProps(props, nextItem);
					let shouldUpdate = true;

					if (nextProps && nextProps.onComponentShouldUpdate) {
						shouldUpdate = handleHooks(nextItem, lastProps, lastItem.rootNode, 'onComponentShouldUpdate', true, nextProps);
					}
					if (!shouldUpdate) {
						return;
					}
					if (nextProps && nextProps.onComponentWillUpdate) {
						handleHooks(nextItem, lastProps, lastItem.rootNode, 'onComponentWillUpdate', true, nextProps);
					}
					const nextRender = Component(nextProps, context);

					nextRender.parent = currentItem;
					if (!isVoid(statelessRender)) {
						const newDomNode = nextRender.tree.dom.update(statelessRender || instance._lastRender, nextRender, treeLifecycle, context);

						if (newDomNode) {
							if (nextRender.rootNode.parentNode) {
								nextRender.rootNode.parentNode.replaceChild(newDomNode, nextRender.rootNode);
							} else {
								lastItem.rootNode.parentNode.replaceChild(newDomNode, lastItem.rootNode);
							}
							currentItem.rootNode = newDomNode;
						} else {
							const newDomNode = nextRender.tree.dom.create(statelessRender, treeLifecycle, context);

							if (newDomNode) {
								if (nextRender.rootNode.parentNode) {
									nextRender.rootNode.parentNode.replaceChild(newDomNode, nextRender.rootNode);
								} else {
									lastItem.rootNode.parentNode.replaceChild(newDomNode, lastItem.rootNode);
								}
								currentItem.rootNode = newDomNode;
							} else {
								currentItem.rootNode = nextRender.rootNode;
							}
						}
					} else {
						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
						return;
					}
					if (props && props.onComponentDidUpdate) {
						handleHooks(nextItem, lastProps, lastItem.rootNode, 'onComponentDidUpdate', true, nextProps);
					}

					statelessRender = nextRender;
				} else {

					if (!instance || node !== lastItem.tree.dom || Component !== instance.constructor) {
						recreateRootNode(lastItem, nextItem, node, treeLifecycle, context);
						return;
					}
					const domNode = lastItem.rootNode;
					const prevProps = instance.props;
					const prevState = instance.state;
					const nextState = instance.state;
					const nextProps = getValueForProps(props, nextItem);

					nextItem.rootNode = domNode;
					instance._updateComponent(prevState, nextState, prevProps, nextProps);
				}
			}
		},
		remove(item, treeLifecycle) {
			const instance = instanceMap[item.id];

			if (instance) {
				instance._lastRender.tree.dom.remove(instance._lastRender, treeLifecycle);
				instance.componentWillUnmount();
				instanceMap[item.id] = null;
			} else {
				if (props && props.onComponentWillUnmount) {
					const lastProps = getValueForProps(props, item);
					handleHooks(item, lastProps, item.rootNode, 'onComponentWillUnmount', true);
				}
			}
		}
	};

	return node;
}
