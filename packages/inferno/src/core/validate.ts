import { isArray, isInvalid, isNullOrUndef, isNumber, isStringOrNumber, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { getComponentName } from '../DOM/utils/common';
import { VNode } from './types';

function getTagName(input) {
  let tagName;

  if (isArray(input)) {
    const arrayText = input.length > 3 ? input.slice(0, 3).toString() + ',...' : input.toString();

    tagName = 'Array(' + arrayText + ')';
  } else if (isStringOrNumber(input)) {
    tagName = 'Text(' + input + ')';
  } else if (isInvalid(input)) {
    tagName = 'InvalidVNode(' + input + ')';
  } else {
    const flags = input.flags;

    if (flags & VNodeFlags.Element) {
      tagName = `<${input.type}${input.className ? ' class="' + input.className + '"' : ''}>`;
    } else if (flags & VNodeFlags.Text) {
      tagName = `Text(${input.children})`;
    } else if (flags & VNodeFlags.Portal) {
      tagName = `Portal*`;
    } else {
      tagName = `<${getComponentName(input.type)} />`;
    }
  }

  return '>> ' + tagName + '\n';
}

function DEV_ValidateKeys(vNodeTree, forceKeyed: boolean) {
  const foundKeys: any = {};

  for (let i = 0, len = vNodeTree.length; i < len; ++i) {
    const childNode = vNodeTree[i];

    if (isArray(childNode)) {
      return 'Encountered ARRAY in mount, array must be flattened, or normalize used. Location: \n' + getTagName(childNode);
    }

    if (isInvalid(childNode)) {
      if (forceKeyed) {
        return 'Encountered invalid node when preparing to keyed algorithm. Location: \n' + getTagName(childNode);
      } else if (Object.keys(foundKeys).length !== 0) {
        return 'Encountered invalid node with mixed keys. Location: \n' + getTagName(childNode);
      }
      continue;
    }
    if (typeof (childNode as VNode) === 'object') {
      if (childNode.isValidated) {
        continue;
      }
      childNode.isValidated = true;
    }

    // Key can be undefined, null too. But typescript complains for no real reason
    const key: string | number = childNode.key as string | number;

    if (!isNullOrUndef(key) && !isStringOrNumber(key)) {
      return 'Encountered child vNode where key property is not string or number. Location: \n' + getTagName(childNode);
    }

    const children = childNode.children;
    const childFlags = childNode.childFlags;
    if (!isInvalid(children)) {
      let val;
      if (childFlags & ChildFlags.MultipleChildren) {
        val = DEV_ValidateKeys(children, (childFlags & ChildFlags.HasKeyedChildren) !== 0);
      } else if (childFlags === ChildFlags.HasVNodeChildren) {
        val = DEV_ValidateKeys([children], false);
      }
      if (val) {
        val += getTagName(childNode);

        return val;
      }
    }
    if (forceKeyed && isNullOrUndef(key)) {
      return (
        'Encountered child without key during keyed algorithm. If this error points to Array make sure children is flat list. Location: \n' +
        getTagName(childNode)
      );
    } else if (!forceKeyed && isNullOrUndef(key)) {
      if (Object.keys(foundKeys).length !== 0) {
        return 'Encountered children with key missing. Location: \n' + getTagName(childNode);
      }
      continue;
    }
    if (foundKeys[key]) {
      return 'Encountered two children with same key: {' + key + '}. Location: \n' + getTagName(childNode);
    }
    foundKeys[key] = true;
  }
}

export function validateVNodeElementChildren(vNode) {
  if (process.env.NODE_ENV !== 'production') {
    if (vNode.childFlags === ChildFlags.HasInvalidChildren) {
      return;
    }
    if (vNode.flags & VNodeFlags.InputElement) {
      throwError("input elements can't have children.");
    }
    if (vNode.flags & VNodeFlags.TextareaElement) {
      throwError("textarea elements can't have children.");
    }
    if (vNode.flags & VNodeFlags.Element) {
      const voidTypes = {
        area: true,
        base: true,
        br: true,
        col: true,
        command: true,
        embed: true,
        hr: true,
        img: true,
        input: true,
        keygen: true,
        link: true,
        meta: true,
        param: true,
        source: true,
        track: true,
        wbr: true
      };
      const tag = vNode.type.toLowerCase();

      if (tag === 'media') {
        throwError("media elements can't have children.");
      }
      if (voidTypes[tag]) {
        throwError(`${tag} elements can't have children.`);
      }
    }
  }
}

export function validateKeys(vNode) {
  if (process.env.NODE_ENV !== 'production') {
    // Checks if there is any key missing or duplicate keys
    if (vNode.isValidated === false && vNode.children && vNode.flags & VNodeFlags.Element) {
      const error = DEV_ValidateKeys(Array.isArray(vNode.children) ? vNode.children : [vNode.children], (vNode.childFlags & ChildFlags.HasKeyedChildren) > 0);

      if (error) {
        throwError(error + getTagName(vNode));
      }
    }
    vNode.isValidated = true;
  }
}

export function throwIfObjectIsNotVNode(input) {
  if (!isNumber(input.flags)) {
    throwError(
      `normalization received an object that's not a valid VNode, you should stringify it first or fix createVNode flags. Object: "${JSON.stringify(input)}".`
    );
  }
}
