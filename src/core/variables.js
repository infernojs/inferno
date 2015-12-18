import isArray from '../util/isArray';

export const ObjectTypes = {
	VARIABLE: 1
};

export const ValueTypes = {
	TEXT: 0,
	ARRAY: 1,
	TREE:21
};

export function createVariable(index) {
	return {
		index,
		type: ObjectTypes.VARIABLE
	};
}

export function getValueWithIndex(item, index) {
	return (index < 2) ? ((index === 0) ? item.v0 : item.v1) : item.values[index - 2];
}

export function getTypeFromValue(value) {
	if (typeof value === 'string' || typeof value === 'number' || value === undefined) {
		return ValueTypes.TEXT;
	} else if (isArray(value)) {
		return ValueTypes.ARRAY;
	} else if (typeof value === 'object' &&  value.create) {
		return ValueTypes.TREE;
	}
}

export function getValueForProps(props, item) {
	const newProps = {};

	if (props.index) {
		return getValueWithIndex(item, props.index);
	}
	for (let name in props) {
		const val = props[name];

		if (val && val.index) {
			newProps[name] = getValueWithIndex(item, val.index);
		} else {
			newProps[name] = val;
		}
	}
	return newProps;
}

export function removeValueTree(value, treeLifecycle) {
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const child = value[i];

      removeValueTree(child, treeLifecycle)
    }
  } else if (typeof value === 'object') {
    const tree = value.domTree;

    tree.remove(value, treeLifecycle);
  }
}
