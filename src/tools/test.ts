import { VNode, VNodeFlags } from '../core/shapes';
import isValidElement from '../factories/isValidElement';
import { throwError } from '../shared';
// import Component from '../component/es2015';

export function isElement(element: VNode): boolean {
	return isValidElement(element);
};

export function isElementOfType(inst: VNode, componentClass: Function): boolean {
	return (
		isValidElement(inst) &&
		inst.type === componentClass
	);
};

export function isDOMComponent(inst): boolean  {
	return !!(
		inst && 
		inst.flags === VNodeFlags.Text && 
		inst.tagName
	);
}

export function isDOMComponentElement(inst): boolean {
	return !!(inst &&
		isValidElement(inst) &&
		!!inst.tagName
	);
};

export function isCompositeComponent(inst): boolean {
	if (isDOMComponent(inst)) {
		return false;
	}
	return (
		inst != null &&
		typeof inst.render === 'function' &&
		typeof inst.setState === 'function'
	);
};

export function isCompositeComponentWithType(inst, type: Function): boolean {
	if (!isCompositeComponent(inst)) {
		return false;
	}

	return (inst.type === type);
}

function findAllInTree(inst: any, testFn: Function): VNode[] {
	if (!inst || !inst.getPublicInstance) {
    return [];
  }
  var publicInst = inst.getPublicInstance();
  var ret = test(publicInst) ? [publicInst] : [];
  var currentElement = inst._currentElement;
  if (isDOMComponent(publicInst)) {
    var renderedChildren = inst._renderedChildren;
    var key;
    for (key in renderedChildren) {
      if (!renderedChildren.hasOwnProperty(key)) {
        continue;
      }
      ret = ret.concat(
        findAllInTree(
          renderedChildren[key],
          test
        )
      );
    }
  } else if (
    isValidElement(currentElement) &&
    typeof currentElement.type === 'function'
  ) {
    ret = ret.concat(
      findAllInTree(inst._renderedComponent, test)
    );
  }
  return ret;
}

export function findAllInRenderedTree(inst: VNode, testFn: Function): VNode[] {
	const result: VNode[] = [];
	if (!inst) {
		return result;
	}
	if (isDOMComponent(inst)) {
		throwError('findAllInRenderedTree(...): instance must be a composite component');
	}
	return findAllInTree(inst, testFn);
}