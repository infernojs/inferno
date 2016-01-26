/* eslint new-cap:0 */
import isVoid from '../../util/isVoid';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import recreateNode from '../recreateNode';
import { handleHooks } from '../addAttributes';

export default function createNodeWithComponent(componentIndex, props) {
	let domNode;
	const currentItemMap = {};
	const instanceMap = {};
	const statelessRenderMap = {};
	const node = {
		overrideItem: null,
		create(item, treeLifecycle, context) {
			let toUseItem = item;
			let nextRender;
			let instance = node.instance;

			if (node.overrideItem !== null) {
				toUseItem = node.overrideItem;
			}
			const Component = getValueWithIndex(toUseItem, componentIndex);

			currentItemMap[item.id] = item;
			if (isVoid(Component)) {
				domNode = document.createTextNode('');
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
								handleHooks(item, nextProps, domNode, 'onComponentDidMount', true);
							});
						}
					}
					const nextRender = Component(nextProps, context);

					domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
					statelessRenderMap[item.id] = nextRender;
				} else {
					instance = new Component(getValueForProps(props, toUseItem));
					instance.context = context;
					instance.componentWillMount();
					nextRender = instance.render();
					const childContext = instance.getChildContext();
					let fragmentFirstChild;

					if (childContext) {
						context = { ...context, ...childContext };
					}
					domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
					instance._lastRender = nextRender;

					if (domNode instanceof DocumentFragment) {
						fragmentFirstChild = domNode.childNodes[0];
					}
					treeLifecycle.addTreeSuccessListener(() => {
						if (fragmentFirstChild) {
							domNode = fragmentFirstChild.parentNode;
						}
						instance.componentDidMount();
					});
					instance.forceUpdate = () => {
						instance.context = context;
						treeLifecycle.reset();
						const nextRender = instance.render.call(instance);
						const childContext = instance.getChildContext();

						if (childContext) {
							context = { ...context, ...childContext };
						}
						const newDomNode = nextRender.tree.dom.update(instance._lastRender, nextRender, treeLifecycle, context);

						if (newDomNode) {
							domNode = newDomNode;
							instance._lastRender.rootNode = domNode;
							instance._lastRender = nextRender;
							return domNode;
						} else {
							instance._lastRender = nextRender;
						}
						treeLifecycle.trigger();
					};
				}
			}
			instanceMap[item.id] = instance;
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const Component = getValueWithIndex(nextItem, componentIndex);
			const instance = instanceMap[lastItem.id];

			currentItemMap[lastItem.id] = nextItem;
			if (!Component) {
				recreateNode(domNode, lastItem, nextItem, node, treeLifecycle, context);
				if (instance) {
					instance._lastRender.rootNode = domNode;
				}
				return domNode;
			}
			if (typeof Component === 'function') {
				// stateless component
				if (!Component.prototype.render) {
					const lastProps = getValueForProps(props, lastItem);
					const nextProps = getValueForProps(props, nextItem);
					let shouldUpdate = true;

					if (nextProps && nextProps.onComponentShouldUpdate) {
						shouldUpdate = handleHooks(nextItem, lastProps, domNode, 'onComponentShouldUpdate', true, nextProps);
					}
					if (!shouldUpdate) {
						return;
					}
					if (nextProps && nextProps.onComponentWillUpdate) {
						handleHooks(nextItem, lastProps, domNode, 'onComponentWillUpdate', true, nextProps);
					}
					const nextRender = Component(nextProps, context);
					let newDomNode;

					// Edge case. If we update from a stateless component with a null value, we need to re-create it, not update it
					// E.g. start with 'render(template(null), container); ' will cause this.
					if (!isVoid(statelessRenderMap[lastItem.id])) {
						newDomNode = nextRender.tree.dom.update(statelessRenderMap[lastItem.id] || instance._lastRender, nextRender, treeLifecycle, context);
					} else {
						recreateNode(domNode, lastItem, nextItem, node, treeLifecycle, context);
						return;
					}
					statelessRenderMap[lastItem.id] = nextRender;

					let returnDomNode = false;

					if (!isVoid(newDomNode)) {
						if (domNode.parentNode) {
							domNode.parentNode.replaceChild(newDomNode, domNode);
						}
						domNode = newDomNode;
						returnDomNode = true;
					}
					if (props && props.onComponentDidUpdate) {
						handleHooks(nextItem, nextProps, domNode, 'onComponentDidUpdate', true);
					}
					if (returnDomNode) {
						return domNode;
					}
				} else {
					if (!instance || Component !== instance.constructor) {
						recreateNode(domNode, lastItem, nextItem, node, treeLifecycle, context);
						return domNode;
					}
					const prevProps = instance.props;
					const prevState = instance.state;
					const nextState = instance.state;
					const nextProps = getValueForProps(props, nextItem);

					return instance._updateComponent(prevState, nextState, prevProps, nextProps);
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
					handleHooks(item, lastProps, domNode, 'onComponentWillUnmount', true);
				}
			}
		}
	};

	return node;
}
