import {
  _FE as findElementFromVNode,
  options,
  type AnimationQueues,
  type VNode,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import {
  queueRemoval,
  hasQueuedRemoval,
  cancelRemovals,
} from './animationCoordinator';

interface MoveList {
  // The list's vNode when it was last prepared (hooks get it as parentVNode) and the children it
  // renders now
  owner: VNode;
  children: VNode[];
  parent: Element;
  active: boolean;
  version: number;
}

// The registry and all discovery work belong to this optional package. An element list is keyed
// by its element, which stays the same across patches. A keyed fragment has no element of its
// own, so its list is keyed by the children array it currently renders.
const elementLists = new WeakMap<Element, MoveList>();
const fragmentLists = new WeakMap<VNode[], MoveList>();
// Active lists by physical parent, for preparing survivors when a leave animation completes
const parents = new WeakMap<Element, Set<MoveList>>();
const coverage = new WeakMap<AnimationQueues, Set<Element>>();
let topologyVersion = 0;

function input(vNode: VNode): VNode {
  return vNode.flags & VNodeFlags.ComponentClass
    ? (vNode.children as any).$LI
    : (vNode.children as VNode);
}

function hasCandidates(vNode: VNode): boolean {
  const flags = vNode.flags;
  // Keep classes discoverable: an instance can acquire a hook after mounting.
  if (flags & VNodeFlags.ComponentClass) return true;
  if (flags & VNodeFlags.ComponentFunction) {
    return (
      typeof vNode.ref?.onComponentWillMove === 'function' ||
      hasCandidates(input(vNode))
    );
  }
  if (flags & VNodeFlags.Fragment) {
    return vNode.childFlags === ChildFlags.HasVNodeChildren
      ? hasCandidates(input(vNode))
      : (vNode.children as VNode[]).some(hasCandidates);
  }
  return false;
}

function coverRoots(vNode: VNode, covered: Set<Element>): void {
  const flags = vNode.flags;
  if (flags & VNodeFlags.Element) covered.add(vNode.dom!);
  else if (flags & VNodeFlags.Component) coverRoots(input(vNode), covered);
  else if (flags & VNodeFlags.Fragment) {
    if (vNode.childFlags === ChildFlags.HasVNodeChildren)
      coverRoots(input(vNode), covered);
    else
      for (const child of vNode.children as VNode[]) coverRoots(child, covered);
  }
}

function visit(vNode: VNode, list: MoveList, covered?: Set<Element>): boolean {
  const flags = vNode.flags;
  if (flags & VNodeFlags.Component) {
    const isClass = Boolean(flags & VNodeFlags.ComponentClass);
    const owner = isClass ? (vNode.children as any) : vNode.ref;
    if (isClass && (!owner || owner.$UN)) return false;
    const hook =
      owner && (isClass ? owner.componentWillMove : owner.onComponentWillMove);
    if (typeof hook === 'function') {
      const dom = findElementFromVNode(vNode);
      if (!dom || dom.parentNode !== list.parent) return false;
      if (covered && !covered.has(dom)) {
        coverRoots(vNode, covered);
        if (isClass) hook.call(owner, list.owner, list.parent, dom);
        else hook.call(owner, list.owner, list.parent, dom, vNode.props);
      }
      return true;
    }
    return visit(input(vNode), list, covered);
  }
  if (flags & VNodeFlags.Fragment) {
    if (vNode.childFlags === ChildFlags.HasVNodeChildren)
      return visit(input(vNode), list, covered);
    let found = false;
    for (const child of vNode.children as VNode[]) {
      if (visit(child, list, covered)) {
        found = true;
        if (!covered) break;
      }
    }
    return found;
  }
  return false;
}

function attach(list: MoveList, parent: Element): void {
  list.parent = parent;
  let siblings = parents.get(parent);
  if (!siblings) parents.set(parent, (siblings = new Set()));
  siblings.add(list);
}
function detach(list: MoveList): void {
  const siblings = parents.get(list.parent);
  siblings?.delete(list);
  if (siblings?.size === 0) {
    parents.delete(list.parent);
    cancelRemovals(list.parent);
  }
}
function refresh(list: MoveList): void {
  list.active = list.children.some(hasCandidates);
  list.version = topologyVersion;
  if (list.active) attach(list, list.parent);
  else detach(list);
}

function fragmentListOf(vNode: VNode): MoveList | undefined {
  return vNode.flags & VNodeFlags.Fragment &&
    vNode.childFlags === ChildFlags.HasKeyedChildren
    ? fragmentLists.get(vNode.children as VNode[])
    : undefined;
}

// The list of a keyed element or fragment, synced to vNode: created when missing, rescanned for
// hooks when owner changes happened since, or when its children are not the ones last seen (a
// patch that threw keeps the old vNode and its written-back children).
function track(vNode: VNode, parent: Element): MoveList | undefined {
  if (vNode.childFlags !== ChildFlags.HasKeyedChildren) return;
  const children = vNode.children as VNode[];
  const isFragment = (vNode.flags & VNodeFlags.Fragment) !== 0;
  let list = isFragment ? fragmentLists.get(children) : elementLists.get(parent);
  if (list === undefined) {
    list = { owner: vNode, children, parent, active: false, version: -1 };
    if (isFragment) fragmentLists.set(children, list);
    else elementLists.set(parent, list);
  } else if (list.children !== children) {
    list.children = children;
    list.version = -1;
  }
  list.owner = vNode;
  if (list.version !== topologyVersion) refresh(list);
  return list;
}
function forget(list: MoveList, isFragment: boolean): void {
  if (isFragment) fragmentLists.delete(list.children);
  else elementLists.delete(list.parent);
  detach(list);
}

// Calls the hooks of the items of last that stay in next, before either is patched
function prepareItems(
  list: MoveList,
  previous: VNode[],
  children: VNode[],
  commit: AnimationQueues,
  cancel: (parent: Node) => void,
): void {
  // Match by position first; allocate a key map only for membership/order changes.
  let nextByKey: Map<VNode['key'], VNode> | undefined;
  let covered = coverage.get(commit);
  if (!covered) coverage.set(commit, (covered = new Set()));
  try {
    for (let i = 0; i < previous.length; i++) {
      const child = previous[i];
      let retained: VNode | undefined = children[i];
      if (!retained || retained.key !== child.key) {
        if (!nextByKey) {
          nextByKey = new Map();
          for (const nextChild of children)
            nextByKey.set(nextChild.key, nextChild);
        }
        retained = nextByKey.get(child.key);
      }
      if (
        retained &&
        retained.type === child.type &&
        !((retained.flags ^ child.flags) & ~VNodeFlags.InUseOrNormalized) &&
        !(retained.flags & VNodeFlags.ReCreate)
      )
        visit(child, list, covered);
    }
  } catch (error) {
    cancel(list.parent);
    throw error;
  }
}

function collectNestedLists(vNode: VNode, nested: Set<MoveList>): void {
  const flags = vNode.flags;
  if (flags & VNodeFlags.Component) {
    if (flags & VNodeFlags.ComponentClass && (vNode.children as any).$UN)
      return;
    collectNestedLists(input(vNode), nested);
  } else if (flags & VNodeFlags.Fragment) {
    const list = fragmentListOf(vNode);
    if (list?.active) {
      nested.add(list);
      return;
    }
    if (vNode.childFlags === ChildFlags.HasVNodeChildren)
      collectNestedLists(input(vNode), nested);
    else
      for (const child of vNode.children as VNode[])
        collectNestedLists(child, nested);
  }
}
function prepareRemoval(parent: Element, invoke: boolean): boolean {
  const siblings = parents.get(parent);
  if (!siblings) return false;
  const covered = invoke ? new Set<Element>() : undefined;
  const nested = new Set<MoveList>();
  let found = false;
  // Outer owners cover inner fragment roots regardless of mount order.
  if (siblings.size > 1) {
    for (const list of siblings) {
      for (const child of list.children) collectNestedLists(child, nested);
    }
  }
  for (const list of siblings) {
    if (nested.has(list)) continue;
    for (const child of list.children) {
      if (visit(child, list, covered)) {
        found = true;
        if (!invoke) return true;
      }
    }
  }
  return found;
}

export function installMoveAnimations(cancel: (parent: Node) => void): void {
  if (options.$MA) return;
  options.$MA = {
    track,
    changed(vNode) {
      if (!vNode || typeof vNode.ref?.onComponentWillMove === 'function')
        topologyVersion++;
    },
    updated(last, next) {
      if (
        typeof last.ref?.onComponentWillMove === 'function' ||
        typeof next.ref?.onComponentWillMove === 'function'
      )
        topologyVersion++;
    },
    prepare(last, next, parent, commit) {
      const list = track(last, parent)!;
      if (next.childFlags === ChildFlags.HasKeyedChildren) {
        const children = next.children as VNode[];
        if (list.active)
          prepareItems(list, last.children as VNode[], children, commit, cancel);
        // Follows the patch: the next prepare finds next's children here
        list.owner = next;
        list.children = children;
      } else {
        forget(list, false);
      }
    },
    prepareFragment(last, nextChildren, parent, commit) {
      const list = track(last, parent)!;
      if (nextChildren !== null) {
        if (list.active)
          prepareItems(
            list,
            last.children as VNode[],
            nextChildren,
            commit,
            cancel,
          );
        fragmentLists.delete(list.children);
        list.children = nextChildren;
        fragmentLists.set(nextChildren, list);
      } else {
        forget(list, true);
      }
    },
    unmount(vNode) {
      if (
        vNode.flags & VNodeFlags.ComponentClass ||
        (vNode.flags & VNodeFlags.ComponentFunction &&
          typeof vNode.ref?.onComponentWillMove === 'function')
      )
        topologyVersion++;
      if (vNode.childFlags === ChildFlags.HasKeyedChildren) {
        const isFragment = (vNode.flags & VNodeFlags.Fragment) !== 0;
        const list = isFragment
          ? fragmentLists.get(vNode.children as VNode[])
          : elementLists.get(vNode.dom as Element);
        if (list) forget(list, isFragment);
      }
      if (vNode.flags & VNodeFlags.Element) cancel(vNode.dom!);
    },
    reparent(vNode, parent) {
      const flags = vNode.flags;
      if (flags & VNodeFlags.Component) this.reparent(input(vNode), parent);
      else if (flags & VNodeFlags.Fragment) {
        const list = fragmentListOf(vNode);
        if (list && list.parent !== parent) {
          cancel(list.parent);
          detach(list);
          list.parent = parent;
          if (list.active) attach(list, parent);
        }
        if (vNode.childFlags === ChildFlags.HasVNodeChildren)
          this.reparent(input(vNode), parent);
        else
          for (const child of vNode.children as VNode[])
            this.reparent(child, parent);
      }
    },
    remove(parent, callback) {
      if (
        !parent.isConnected ||
        (!hasQueuedRemoval(parent) && !prepareRemoval(parent, false))
      )
        callback();
      else
        queueRemoval(
          parent,
          () => {
            try {
              prepareRemoval(parent, true);
            } catch (error) {
              cancel(parent);
              throw error;
            }
          },
          callback,
        );
    },
  };
}
