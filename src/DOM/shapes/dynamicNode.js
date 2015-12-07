import { getValueWithIndex, getTypeFromValue, ValueTypes } from '../../core/variables';

export default function createDynamicNode(valueIndex, domNamespace) {
	let domNode;

	const node = {
		create(item) {
			const value = getValueWithIndex(item, valueIndex);
			const type = getTypeFromValue(value);

			switch (type) {
				case ValueTypes.TEXT:
					// TODO check if string is empty?
					domNode = document.createTextNode(value);
					break;
				default: break;
			}

			return domNode;
		},
		update(lastItem, nextItem) {
			const nextValue = getValueWithIndex(nextItem, valueIndex);
			const lastValue = getValueWithIndex(lastItem, valueIndex);

			if (nextValue !== lastValue) {
				const nextType = getTypeFromValue(nextValue);
				const lastType = getTypeFromValue(lastValue);

				if(lastType !== nextType) {
					// TODO replace node and rebuild
					return;
				}

				switch (nextType) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						domNode.nodeValue = nextValue;
						break;
					default: break;
				}
			}
		}
	};
	return node;
}