import isArray from '../../util/isArray';
import { isRecyclingEnabled, recycle } from '../recycling';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';
import unmountComponent from '../../core/unmountComponent';
import recreateNode from '../recreateNode';

const recyclingEnabled = isRecyclingEnabled();

export default function createRootNodeWithComponent(componentIndex, props, domNamespace) {
	let instance;
	let lastRender;
	const node = {
		pool: [],
		keyedPool: [],
		create(item) {
			let domNode;

			if (recyclingEnabled) {
				domNode = recycle(node, item);
				if (domNode) {
					return domNode;
				}
			}
			const Component = getValueWithIndex(item, componentIndex);

			instance = new Component(getValueForProps(props, item));
			instance.componentWillMount();
			const nextRender = instance.render();

			nextRender.parent = item;
			domNode = nextRender.domTree.create(nextRender);
			item.rootNode = domNode;
			lastRender = nextRender;
			return domNode;
		},
		update(lastItem, nextItem) {
			const Component = getValueWithIndex(nextItem, componentIndex);

			if (Component !== instance.constructor) {
				//unmount component
				unmountComponent(instance);
				recreateNode(lastItem, nextItem, node);
				return;
			}
			if (node !== lastItem.domTree) {
				recreateNode(lastItem, nextItem, node);
				return;
			}
			const domNode = lastItem.rootNode;

			nextItem.rootNode = domNode;

			const prevProps = instance.props;
			const prevState = instance.state;
			const nextState = instance.state;
			const nextProps = getValueForProps(props, nextItem);

			if(!nextProps.children) {
				nextProps.children = prevProps.children;
			}

			if(prevProps !== nextProps || prevState !== nextState) {
				if(prevProps !== nextProps) {
					instance._blockRender = true;
					instance.componentWillReceiveProps(nextProps);
					instance._blockRender = false;
				}
				const shouldUpdate = instance.shouldComponentUpdate(nextProps, nextState);

				if(shouldUpdate) {
					instance._blockSetState = true;
					instance.componentWillUpdate(nextProps, nextState);
					instance._blockSetState = false;
					instance.props = nextProps;
					instance.state = nextState;
					const nextRender = instance.render();

					nextRender.parent = nextItem;
					nextRender.domTree.update(lastRender, nextRender);
					nextItem.rootNode = nextRender.rootNode;
					instance.componentDidUpdate(prevProps, prevState);
					lastRender = nextRender;
				}
			}
		}
	};
	return node;
}
