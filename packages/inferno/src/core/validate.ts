import { isArray, isInvalid, isNullOrUndef, isStringOrNumber, throwError } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

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
      const type = input.type;

      // Fallback for IE
      const componentName = type.name || type.displayName || type.constructor.name || (type.toString().match(/^function\s*([^\s(]+)/) || [])[1];

      tagName = `<${componentName} />`;
    }
  }

  return '>> ' + tagName + '\n';
}

function DEV_ValidateKeys(vNodeTree, vNode, forceKeyed) {
  const foundKeys: any[] = [];

  for (let i = 0, len = vNodeTree.length; i < len; i++) {
    const childNode = vNodeTree[i];

    if (isArray(childNode)) {
      return 'Encountered ARRAY in mount, array must be flattened, or normalize used. Location: \n' + getTagName(childNode);
    }

    if (isInvalid(childNode)) {
      if (forceKeyed) {
        return 'Encountered invalid node when preparing to keyed algorithm. Location: \n' + getTagName(childNode);
      } else if (foundKeys.length !== 0) {
        return 'Encountered invalid node with mixed keys. Location: \n' + getTagName(childNode);
      }
      continue;
    }
    if (typeof childNode === 'object') {
      childNode.isValidated = true;
    }

    const key = childNode.key as null | string | number | undefined;

    if (!isNullOrUndef(key) && !isStringOrNumber(key)) {
      return 'Encountered child vNode where key property is not string or number. Location: \n' + getTagName(childNode);
    }

    const children = childNode.children;
    const childFlags = childNode.childFlags;
    if (!isInvalid(children)) {
      let val;
      if (childFlags & ChildFlags.MultipleChildren) {
        val = DEV_ValidateKeys(children, childNode, childNode.childFlags & ChildFlags.HasKeyedChildren);
      } else if (childFlags === ChildFlags.HasVNodeChildren) {
        val = DEV_ValidateKeys([children], childNode, childNode.childFlags & ChildFlags.HasKeyedChildren);
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
      if (foundKeys.length !== 0) {
        return 'Encountered children with key missing. Location: \n' + getTagName(childNode);
      }
      continue;
    }
    if (foundKeys.indexOf(key) > -1) {
      return 'Encountered two children with same key: {' + key + '}. Location: \n' + getTagName(childNode);
    }
    foundKeys.push(key);
  }
}

export function validateVNodeElementChildren(vNode) {
  if (process.env.NODE_ENV !== 'production') {
    if (vNode.childFlags & ChildFlags.HasInvalidChildren) {
      return;
    }
    if (vNode.flags & VNodeFlags.InputElement) {
      throwError("input elements can't have children.");
    }
    if (vNode.flags & VNodeFlags.TextareaElement) {
      throwError("textarea elements can't have children.");
    }
    if (vNode.flags & VNodeFlags.Element) {
      const voidTypes = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
      const tag = vNode.type.toLowerCase();

      if (tag === 'media') {
        throwError("media elements can't have children.");
      }
      const idx = voidTypes.indexOf(tag);
      if (idx !== -1) {
        throwError(`${voidTypes[idx]} elements can't have children.`);
      }
    }
  }
}

export function validateKeys(vNode) {
  if (process.env.NODE_ENV !== 'production') {
    // Checks if there is any key missing or duplicate keys
    if (vNode.isValidated === false && vNode.children && vNode.flags & VNodeFlags.Element) {
      const error = DEV_ValidateKeys(
        Array.isArray(vNode.children) ? vNode.children : [vNode.children],
        vNode,
        (vNode.childFlags & ChildFlags.HasKeyedChildren) > 0
      );

      if (error) {
        throwError(error + getTagName(vNode));
      }
    }
    vNode.isValidated = true;
  }
}
