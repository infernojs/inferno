import { isUndefined, isArray, isNull, isNullOrUndef } from '../shared';
import {
	isVComponent,
	isVElement,
	isOptVElement,
	createVElement,
	createVComponent,
	OptVElement
} from '../core/shapes';
import {
	ValueTypes,
	ChildrenTypes
} from '../core/constants';

export function convertVOptElementToVElement(optVElement: OptVElement) {
	const bp = optVElement.bp;
	const staticElement = bp.staticVElement;
	const vElement = createVElement(staticElement.tag, null, null, optVElement.key, null, null);
	const bp0 = bp.v0;
	const staticChildren = staticElement.children;
	const staticProps = staticElement.props;

	if (!isNull(staticChildren)) {
		vElement.children = staticChildren;
	}
	if (!isNull(staticProps)) {
		vElement.props = staticProps;
	}
	if (!isNull(bp0)) {
		attachOptVElementValue(vElement, optVElement, bp0, optVElement.v0, bp.d0);
		const bp1 = bp.v1;

		if (!isNull(bp1)) {
			attachOptVElementValue(vElement, optVElement, bp1, optVElement.v1, bp.d1);
			const bp2 = bp.v2;

			if (!isNull(bp2)) {
				attachOptVElementValue(vElement, optVElement, bp2, optVElement.v2, bp.d2);
				const bp3 = bp.v3;

				if (!isNull(bp3)) {
					const v3 = optVElement.v3;
					const d3 = bp.d3;
					const bp3 = bp.v3;

					for (let i = 0; i < bp3.length; i++) {
						attachOptVElementValue(vElement, optVElement, bp3[i], v3[i], d3[i]);
					}
				}
			}
		}
	}
	return vElement;
}

function attachOptVElementValue(vElement, vOptElement, valueType, value, descriptor) {
	switch (valueType) {
		case ValueTypes.CHILDREN:
			vElement.childrenType = descriptor;
			if (isNullOrUndef(vElement.children)) {
				vElement.children = value;
			} else {
				debugger;
			}
			break;
		case ValueTypes.PROP_CLASS_NAME:
			if (!vElement.props) {
				vElement.props = { className: value };
			} else {
				debugger;
			}
			break;
		case ValueTypes.PROP_DATA:
			if (!vElement.props) {
				vElement.props = {};
			}
			vElement.props['data-' + descriptor] = value;
			break;
		case ValueTypes.PROP_STYLE:
			if (!vElement.props) {
				vElement.props = { style: value };
			} else {
				debugger;
			}
			break;
		case ValueTypes.PROP_VALUE:
			if (!vElement.props) {
				vElement.props = { value: value };
			} else {
				debugger;
			}
			break;
		case ValueTypes.PROP:
			if (!vElement.props) {
				vElement.props = {};
			}
			vElement.props[descriptor] = value;
			break;
		case ValueTypes.PROP_REF:
			vElement.ref = value;
			break;
		case ValueTypes.PROP_SPREAD:
			if (!vElement.props) {
				vElement.props = value;
			} else {
				debugger;
			}
			break;
	}
}

export default function cloneVNode(vNodeToClone, props?, ..._children) {
	let children: any = _children;

	if (_children.length > 0 && !isNull(_children[0])) {
		if (!props) {
			props = {};
		}
		if (_children.length === 1) {
			children = _children[0];
		}
		if (isUndefined(props.children)) {
			props.children = children;
		} else {
			if (isArray(children)) {
				if (isArray(props.children)) {
					props.children = props.children.concat(children);
				} else {
					props.children = [props.children].concat(children);
				}
			} else {
				if (isArray(props.children)) {
					props.children.push(children);
				} else {
					props.children = [props.children];
					props.children.push(children);
				}
			}
		}
	} else {
		children = null;
	}
	let newVNode;

	if (isArray(vNodeToClone)) {
		newVNode = vNodeToClone.map(vNode => cloneVNode(vNode));
	} else if (isNullOrUndef(props) && isNullOrUndef(children)) {
		newVNode = Object.assign({}, vNodeToClone);
	} else {
		if (isVComponent(vNodeToClone)) {
			newVNode = createVComponent(vNodeToClone.component,
				Object.assign({}, vNodeToClone.props, props),
				vNodeToClone.key,
				vNodeToClone.hooks,
				vNodeToClone.ref
			);
		} else if (isVElement(vNodeToClone)) {
			newVNode = createVElement(vNodeToClone.tag,
				Object.assign({}, vNodeToClone.props, props),
				(props && props.children) || children || vNodeToClone.children,
				vNodeToClone.key,
				vNodeToClone.ref,
				ChildrenTypes.UNKNOWN
			);
		} else if (isOptVElement(vNodeToClone)) {
			newVNode = cloneVNode(convertVOptElementToVElement(vNodeToClone), props, children);
		}
	}
	newVNode.dom = null;
	return newVNode;
}