import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

export const textElementFlags =
  VNodeFlags.HtmlElement | VNodeFlags.HasTextChildren;
export const legacyTextChildren = ChildFlags.HasTextChildren;
