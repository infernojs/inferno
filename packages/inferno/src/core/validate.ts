import type { VNode } from './types';
import {
  isArray,
  isInvalid,
  isNullOrUndef,
  isNumber,
  isStringOrNumber,
  throwError
} from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { getComponentName } from '../DOM/utils/common';

function getTagName(input): string {
  let tagName;

  if (isArray(input)) {
    const arrayText =
      input.length > 3
        ? input.slice(0, 3).toString() + ',...'
        : input.toString();

    tagName = 'Array(' + arrayText + ')';
  } else if (isStringOrNumber(input)) {
    tagName = 'Text(' + input + ')';
  } else if (isInvalid(input)) {
    tagName = 'InvalidVNode(' + input + ')';
  } else {
    const flags = input?.flags;

    if (!isNumber(flags)) {
      try {
        tagName = `Object(${JSON.stringify(input)})`;
      } catch {
        tagName = `Object(${String(input)})`;
      }

      return '>> ' + tagName + '\n';
    }

    if (flags & VNodeFlags.Element) {
      tagName = `<${input.type}${
        input.className ? ' class="' + input.className + '"' : ''
      }>`;
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

function DEV_VALIDATE_KEYS(vNodeTree, childKeys): string | null {
  if ((childKeys & ChildFlags.HasNonKeyedChildren) !== 0) {
    return null;
  }

  const foundKeys: Record<string, boolean> = {};
  const forceKeyed = (childKeys & ChildFlags.HasKeyedChildren) !== 0;

  let foundKeyCount = 0;

  for (let i = 0, len = vNodeTree.length; i < len; ++i) {
    const childNode = vNodeTree[i];

    if (isArray(childNode)) {
      return (
        'Encountered ARRAY in mount, array must be flattened, or normalize used. Location: \n' +
        getTagName(childNode)
      );
    }

    if (isInvalid(childNode)) {
      if (forceKeyed) {
        return (
          'Encountered invalid node when preparing to keyed algorithm. Location: \n' +
          getTagName(childNode)
        );
      } else if (foundKeyCount !== 0) {
        return (
          'Encountered invalid node with mixed keys. Location: \n' +
          getTagName(childNode)
        );
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
      return (
        'Encountered child vNode where key property is not string or number. Location: \n' +
        getTagName(childNode)
      );
    }

    const children = childNode.children;
    const childFlags = childNode.childFlags;
    if (!isInvalid(children)) {
      let val;
      if (childFlags & ChildFlags.MultipleChildren) {
        val = DEV_VALIDATE_KEYS(
          children,
          (childFlags & ChildFlags.HasKeyedChildren) !== 0,
        );
      } else if (childFlags === ChildFlags.HasVNodeChildren) {
        val = DEV_VALIDATE_KEYS([children], false);
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
    } else if (isNullOrUndef(key)) {
      if (foundKeyCount !== 0) {
        return (
          'Encountered children with key missing. Location: \n' +
          getTagName(childNode)
        );
      }
      continue;
    }
    if (foundKeys[key]) {
      return (
        'Encountered two children with same key: {' +
        key +
        '}. Location: \n' +
        getTagName(childNode)
      );
    }
    foundKeys[key] = true;
    foundKeyCount++;
  }

  return null;
}

export function validateVNodeElementChildren(vNode): void {
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
      const tag = vNode.type.toLowerCase();

      switch (tag) {
        case 'media':
        case 'area':
        case 'base':
        case 'br':
        case 'col':
        case 'command':
        case 'embed':
        case 'hr':
        case 'img':
        case 'input':
        case 'keygen':
        case 'link':
        case 'meta':
        case 'param':
        case 'source':
        case 'track':
        case 'wbr':
          throwError(`${tag} elements can't have children.`);
          break;
        default:
          break;
      }
    }
  }
}

export function validateKeys(vNode): void {
  if (process.env.NODE_ENV !== 'production') {
    // Checks if there is any key missing or duplicate keys
    if (
      !vNode.isValidated &&
      vNode.children &&
      vNode.flags & VNodeFlags.Element
    ) {
      const error = DEV_VALIDATE_KEYS(
        Array.isArray(vNode.children) ? vNode.children : [vNode.children],
        vNode.childFlags
      );

      if (error) {
        throwError(error + getTagName(vNode));
      }
    }
    vNode.isValidated = true;
  }
}

function getChildFlagsName(childFlags: ChildFlags): string {
  switch (childFlags) {
    case ChildFlags.HasInvalidChildren:
      return 'ChildFlags.HasInvalidChildren';
    case ChildFlags.HasVNodeChildren:
      return 'ChildFlags.HasVNodeChildren';
    case ChildFlags.HasNonKeyedChildren:
      return 'ChildFlags.HasNonKeyedChildren';
    case ChildFlags.HasKeyedChildren:
      return 'ChildFlags.HasKeyedChildren';
    case ChildFlags.HasTextChildren:
      return 'ChildFlags.HasTextChildren';
    case ChildFlags.UnknownChildren:
      return 'ChildFlags.UnknownChildren';
    default:
      return `ChildFlags.Unknown(${childFlags})`;
  }
}

export function validateChildFlags(vNode: VNode): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const childFlags = vNode.childFlags;
  const children = vNode.children as any;
  const parentTag = getTagName(vNode);

  switch (childFlags) {
    case ChildFlags.UnknownChildren:
    case ChildFlags.HasInvalidChildren:
      return;
    case ChildFlags.HasTextChildren:
      if (isStringOrNumber(children)) {
        return;
      }
      if (
        children &&
        isNumber(children.flags) &&
        children.flags & VNodeFlags.Text
      ) {
        throwError(
          `${getChildFlagsName(childFlags)} expects children to be a bare string, not a Text VNode. Location: \n${getTagName(children)}${parentTag}`,
        );
      }
      throwError(
        `${getChildFlagsName(childFlags)} expects children to be a string. Location: \n${getTagName(children)}${parentTag}`,
      );
      return;
    case ChildFlags.HasVNodeChildren:
      if (isInvalid(children) || isArray(children) || isStringOrNumber(children)) {
        throwError(
          `${getChildFlagsName(childFlags)} expects children to be a VNode. Location: \n${getTagName(children)}${parentTag}`,
        );
      }
      throwIfObjectIsNotVNode(children);
      return;
    case ChildFlags.HasNonKeyedChildren:
    case ChildFlags.HasKeyedChildren:
      if (!isArray(children)) {
        throwError(
          `${getChildFlagsName(childFlags)} expects children to be an array of VNodes. Location: \n${getTagName(children)}${parentTag}`,
        );
      }

      for (let i = 0; i < children.length; i++) {
        if (!(i in children)) {
          throwError(
            `${getChildFlagsName(childFlags)} expects children to be a flat array without holes; found a hole at index ${i}. Location: \n${parentTag}`,
          );
        }

        const child = children[i];
        if (isArray(child)) {
          throwError(
            `${getChildFlagsName(childFlags)} expects children to be a flat array; found a nested array at index ${i}. Location: \n${getTagName(child)}${parentTag}`,
          );
        }
        if (isInvalid(child)) {
          throwError(
            `${getChildFlagsName(childFlags)} expects children to be VNodes; found invalid child at index ${i}. Location: \n${getTagName(child)}${parentTag}`,
          );
        }
        if (isStringOrNumber(child)) {
          throwError(
            `${getChildFlagsName(childFlags)} expects children to be VNodes; found text at index ${i}. Location: \n${getTagName(child)}${parentTag}`,
          );
        }

        throwIfObjectIsNotVNode(child);

        if (childFlags === ChildFlags.HasKeyedChildren) {
          if (isNullOrUndef(child.key)) {
            throwError(
              `${getChildFlagsName(childFlags)} expects all children to have keys; missing key at index ${i}. Location: \n${getTagName(child)}${parentTag}`,
            );
          }
        }
      }
      return;
    default:
      return;
  }
}

export function throwIfObjectIsNotVNode(input): void {
  if (!isNumber(input.flags)) {
    throwError(
      `normalization received an object that's not a valid VNode, you should stringify it first or fix createVNode flags. Object: "${JSON.stringify(
        input,
      )}".`,
    );
  }
}
