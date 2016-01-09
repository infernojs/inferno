/* eslint new-cap:0 */
import isVoid from '../../util/isVoid';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import recreateNode from '../recreateNode';
import updateComponent from '../../component/updateComponent';

export default function createNodeWithComponent(componentIndex, props) {
	let domNode;
	let currentItem;
	let statelessRender;
	const node = {
		overrideItem: null,
		instance: null,
		create(item, treeLifecycle, context) {
			let toUseItem = item;
			let nextRender;
			let instance = node.instance;

			if (node.overrideItem !== null) {
				toUseItem = node.overrideItem;
			}
			const Component = getValueWithIndex(toUseItem, componentIndex);

			currentItem = item;
			if (isVoid(Component)) {
				domNode = document.createTextNode('');
				node.instance = null;
				return domNode;
			} else if (typeof Component === 'function') {
				// stateless component
				if (!Component.prototype.render) {
					nextRender = Component(getValueForProps(props, toUseItem), context);

					nextRender.parent = item;
					domNode = nextRender.tree.dom.create(nextRender, treeLifecycle, context);
					statelessRender = nextRender;
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
					nextRender.parent = item;
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
						const nextRender = instance.render.call(instance);
						const childContext = instance.getChildContext();

						if (childContext) {
							context = { ...context, ...childContext };
						}
						nextRender.parent = currentItem;
						const newDomNode = nextRender.tree.dom.update(instance._lastRender, nextRender, treeLifecycle, context);

						if (newDomNode) {
							domNode = newDomNode;
							instance._lastRender.rootNode = domNode;
							instance._lastRender = nextRender;
							return domNode;
						} else {
							instance._lastRender = nextRender;
						}
					};
				}
			}
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle, context) {
			const Component = getValueWithIndex(nextItem, componentIndex);
			let instance = node.instance;

			currentItem = nextItem;
			if (!Component) {
				recreateNode(domNode, nextItem, node, treeLifecycle, context);
				if (instance) {
					instance._lastRender.rootNode = domNode;
				}
				return domNode;
			}
			if (typeof Component === 'function') {
				// stateless component
				if (!Component.prototype.render) {
					const nextRender = Component(getValueForProps(props, nextItem), context);
					let newDomNode;

					nextRender.parent = currentItem;
					// Edge case. If we update from a stateless component with a null value, we need to re-create it, not update it
					// E.g. start with 'render(template(null), container); ' will cause this.
					if (!isVoid(statelessRender)) {
						newDomNode = nextRender.tree.dom.update(statelessRender || node.instance._lastRender, nextRender, treeLifecycle, context);
					} else {
						recreateNode(domNode, nextItem, node, treeLifecycle, context);
						return;
					}
					statelessRender = nextRender;

					if (!isVoid(newDomNode)) {
						if (domNode.parentNode) {
							domNode.parentNode.replaceChild(newDomNode, domNode);
						}
						domNode = newDomNode;
						return domNode;
					}
				} else {
					if (!instance || Component !== instance.constructor) {
						recreateNode(domNode, nextItem, node, treeLifecycle, context);
						return domNode;
					}
					const prevProps = instance.props;
					const prevState = instance.state;
					const nextState = instance.state;
					const nextProps = getValueForProps(props, nextItem);

					return updateComponent(instance, prevState, nextState, prevProps, nextProps, instance.forceUpdate);
				}
			}
		},
		remove(item, treeLifecycle) {
			let instance = node.instance;

			if (instance) {
				instance._lastRender.tree.dom.remove(instance._lastRender, treeLifecycle);
				instance.componentWillUnmount();
				node.instance = null;
			}
		}
	};

	return node;
}
