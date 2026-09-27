import {
  findDOMFromVNode,
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
  vNode: VNode;
  parent: Element;
  active: boolean;
  version: number;
}
interface PatchScope {
  parent: Element;
  last: VNode;
  list: MoveList;
}

// The registry and all discovery work belong to this optional package.
const lists = new WeakMap<VNode, MoveList>();
const parents = new WeakMap<Element, Set<MoveList>>();
const depths = new WeakMap<Element, number>();
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
      const dom = findDOMFromVNode(vNode, true, true);
      if (!dom || dom.parentNode !== list.parent) return false;
      if (covered && !covered.has(dom)) {
        coverRoots(vNode, covered);
        if (isClass) hook.call(owner, list.vNode, list.parent, dom);
        else hook.call(owner, list.vNode, list.parent, dom, vNode.props);
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
  list.active = (list.vNode.children as VNode[]).some(hasCandidates);
  list.version = topologyVersion;
  if (list.active) attach(list, list.parent);
  else detach(list);
}
function track(vNode: VNode, parent: Element): MoveList | undefined {
  if (vNode.childFlags !== ChildFlags.HasKeyedChildren) return;
  let list = lists.get(vNode);
  if (!list) {
    list = { vNode, parent, active: false, version: -1 };
    lists.set(vNode, list);
  }
  list.vNode = vNode;
  if (list.version !== topologyVersion) refresh(list);
  return list;
}
function forget(vNode: VNode): void {
  const list = lists.get(vNode);
  if (list) {
    lists.delete(vNode);
    detach(list);
  }
}
function collectNestedLists(vNode: VNode, nested: Set<MoveList>): void {
  const flags = vNode.flags;
  if (flags & VNodeFlags.Component) {
    if (flags & VNodeFlags.ComponentClass && (vNode.children as any).$UN)
      return;
    collectNestedLists(input(vNode), nested);
  } else if (flags & VNodeFlags.Fragment) {
    const list = lists.get(vNode);
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
      for (const child of list.vNode.children as VNode[])
        collectNestedLists(child, nested);
    }
  }
  for (const list of siblings) {
    if (nested.has(list)) continue;
    for (const child of list.vNode.children as VNode[]) {
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
    begin(last, next, parent, commit) {
      const list = track(last, parent)!;
      if (!list.active) {
        // Share cached negative results without a reconciliation wrapper.
        // track(next) rechecks only patches that introduce new candidates.
        if (next.childFlags === ChildFlags.HasKeyedChildren)
          lists.set(next, list);
        return;
      }
      depths.set(parent, (depths.get(parent) || 0) + 1);
      const scope: PatchScope = { last, parent, list };
      try {
        if (next.childFlags === ChildFlags.HasKeyedChildren) {
          const children = next.children as VNode[];
          const previous = last.children as VNode[];
          // Match by position first; allocate a key map only for membership/order changes.
          let nextByKey: Map<VNode['key'], VNode> | undefined;
          let covered = coverage.get(commit);
          if (!covered) coverage.set(commit, (covered = new Set()));
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
              !(
                (retained.flags ^ child.flags) &
                ~VNodeFlags.InUseOrNormalized
              ) &&
              !(retained.flags & VNodeFlags.ReCreate)
            )
              visit(child, list, covered);
          }
        }
      } catch (error) {
        depths.set(parent, depths.get(parent)! - 1);
        cancel(parent);
        throw error;
      }
      return scope;
    },
    end(value, next, succeeded) {
      const { last, parent, list } = value as PatchScope;
      depths.set(parent, depths.get(parent)! - 1);
      if (!succeeded) {
        // Reconciliation writes successful children back to last before reaching here.
        refresh(list);
        cancel(parent);
        return;
      }
      if (next.childFlags === ChildFlags.HasKeyedChildren) {
        lists.delete(last);
        list.vNode = next;
        if (list.version !== topologyVersion) refresh(list);
        lists.set(next, list);
      } else {
        forget(last);
        track(next, parent);
      }
    },
    unmount(vNode) {
      if (
        vNode.flags & VNodeFlags.ComponentClass ||
        (vNode.flags & VNodeFlags.ComponentFunction &&
          typeof vNode.ref?.onComponentWillMove === 'function')
      )
        topologyVersion++;
      if (vNode.childFlags === ChildFlags.HasKeyedChildren) forget(vNode);
      if (vNode.flags & VNodeFlags.Element) cancel(vNode.dom!);
    },
    reparent(vNode, parent) {
      const flags = vNode.flags;
      if (flags & VNodeFlags.Component) this.reparent(input(vNode), parent);
      else if (flags & VNodeFlags.Fragment) {
        const list = lists.get(vNode);
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
        depths.get(parent) ||
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
