import isArray from '../../util/isArray';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import recreateNode from '../recreateNode';
import updateComponent from '../../core/updateComponent';

function getCorrectItemForValues(node, item) {
	if (node !== item.domTree && item.parent) {
		return getCorrectItemForValues(node, item.parent);
	} else {
		return item;
	}
}

export default function createNodeWithComponent(componentIndex, props, domNamespace) {
	let instance;
	let lastRender;
	let domNode;
	let currentItem;
	const node = {
		create(item, treeLifecycle) {
			const valueItem = getCorrectItemForValues(node, item);
			const Component = getValueWithIndex(valueItem, componentIndex);

			currentItem = item;
			if (Component == null) {
				//bad component, make a text node
				return document.createTextNode('');
			} else if (typeof Component === 'function') {
				//stateless component
				if (!Component.prototype.render) {
					const nextRender = Component(getValueForProps(props, valueItem));

					nextRender.parent = item;
					domNode = nextRender.domTree.create(nextRender, treeLifecycle);
					lastRender = nextRender;
				} else {
					instance = new Component(getValueForProps(props, valueItem));
					instance.componentWillMount();
					const nextRender = instance.render();

					nextRender.parent = item;
					domNode = nextRender.domTree.create(nextRender, treeLifecycle);
					lastRender = nextRender;
					treeLifecycle.addTreeSuccessListener(instance.componentDidMount);
					instance.forceUpdate = () => {
						const nextRender = instance.render();

						nextRender.parent = currentItem;
						nextRender.domTree.update(lastRender, nextRender, treeLifecycle);
						lastRender = nextRender;
					};
				}
			}
			return domNode;
		},
		update(lastItem, nextItem, treeLifecycle) {
			const Component = getValueWithIndex(nextItem, componentIndex);
			currentItem = nextItem;

			if (!Component) {
				recreateNode(domNode, nextItem, node, treeLifecycle);
				return;
			}
			if (typeof Component === 'function') {
				//stateless component
				if (!Component.prototype.render) {
					const nextRender = Component(getValueForProps(props, nextItem));

					nextRender.parent = currentItem;
					nextRender.domTree.update(lastRender, nextRender, treeLifecycle);
					lastRender = nextRender;
				} else {
					if (!instance || Component !== instance.constructor) {
						recreateNode(domNode, nextItem, node, treeLifecycle);
						return;
					}
					const prevProps = instance.props;
					const prevState = instance.state;
					const nextState = instance.state;
					const nextProps = getValueForProps(props, nextItem);

					updateComponent(instance, prevState, nextState, prevProps, nextProps, instance.forceUpdate);
				}
			}
		},
		remove(item, treeLifecycle) {
			if (instance) {
				lastRender.domTree.remove(lastRender, treeLifecycle);
				instance.componentWillUnmount();
			}
		}
	};
	return node;
}
