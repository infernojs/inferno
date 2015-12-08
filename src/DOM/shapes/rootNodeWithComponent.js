import isArray from '../../util/isArray';
import { getValueWithIndex } from '../../core/variables';
import { updateKeyed } from '../domMutate';
import { addDOMDynamicAttributes, updateDOMDynamicAttributes } from '../addAttributes';

export default function createRootNodeWithComponent(componentIndex, props, domNamespace) {
	const node = {
		create(item) {
			const Component = getValueWithIndex(item, componentIndex);
			const instance = new Component(props);
			instance.componentWillMount();
			const nextItem = instance.render();
			const domNode = nextItem.domTree.create(nextItem);

			item.rootNode = domNode;
			return domNode;
		},
		update(lastItem, nextItem) {
			let domNode;
			// TODO

		}
	};
	return node;
}
