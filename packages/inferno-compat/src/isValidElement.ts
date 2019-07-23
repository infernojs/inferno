import { VNode } from 'inferno';
import { isNull } from 'inferno-shared';
import { VNodeFlags } from 'inferno-vnode-flags';

export function isValidElement(obj: VNode): boolean {
  const isValidObject = typeof obj === 'object' && !isNull(obj);

  if (!isValidObject) {
    return false;
  }

  return (obj.flags & (VNodeFlags.Component | VNodeFlags.Element)) > 0;
}
