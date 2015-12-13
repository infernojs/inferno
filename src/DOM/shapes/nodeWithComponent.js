import isArray from '../../util/isArray';
import { getValueWithIndex, getValueForProps } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

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
	const node = {
		create(item) {
			const valueItem = getCorrectItemForValues(node, item);
			const Component = getValueWithIndex(valueItem, componentIndex);

			instance = new Component(getValueForProps(props, valueItem));
			instance.componentWillMount();
			const nextRender = instance.render();

			nextRender.parent = item;
			domNode = nextRender.domTree.create(nextRender);
			lastRender = nextRender;
			return domNode;
		},
		update(lastItem, nextItem) {
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
					instance.componentDidUpdate(prevProps, prevState);
					lastRender = nextRender;
				}
			}
		}
	};
	return node;
}
