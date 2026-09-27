import {
  _FE as findElementFromVNode,
  _MA as setMoveAnimations,
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

type MoveAnimationAdapter = Parameters<typeof setMoveAnimations>[0];

// The registry and all discovery work belong to this optional package. An element list is keyed
// by its element, which stays the same across patches. A keyed fragment has no element of its
// own, so its list is keyed by the children array it currently renders. A list is registered when
// it is first prepared.
let elementLists = new WeakMap<Element, MoveList>();
let fragmentLists = new WeakMap<VNode[], MoveList>();
// Active lists by physical parent, for preparing survivors when a leave animation completes
let parents = new WeakMap<Element, Set<MoveList>>();
// Elements prepared in a commit through a fragment: a keyed fragment list shares its parent with
// the list around it, whose owners prepare those elements first
const coverage = new WeakMap<AnimationQueues, Set<Element>>();
// Bumped by every owner change: a list looks for hooks again when it is prepared next
let topologyVersion = 0;

// Mounted move hook owners: class instances that have componentWillMove by the end of their mount,
// and function component hooks objects with onComponentWillMove. The reconciler reports keyed
// patches, list unmounts and removals only while there is at least one.
let owners = 0;
const classOwners = new WeakSet<object>();

function changeOwners(adapter: MoveAnimationAdapter, delta: number): void {
  const before = owners;
  // A hooks object changed in place can report an owner it did not add
  owners = Math.max(owners + delta, 0);
  topologyVersion++;
  if (before === 0) {
    if (owners !== 0) setMoveAnimations(adapter, true);
  } else if (owners === 0) {
    // Nothing is prepared until an owner mounts again, and lists register again then
    elementLists = new WeakMap();
    fragmentLists = new WeakMap();
    parents = new WeakMap();
    setMoveAnimations(adapter, false);
  }
}

function hasMoveHook(ref): number {
  return ref != null && typeof ref.onComponentWillMove === 'function' ? 1 : 0;
}

function input(vNode: VNode): VNode {
  return vNode.flags & VNodeFlags.ComponentClass
    ? (vNode.children as any).$LI
    : (vNode.children as VNode);
}

function hasCandidates(vNode: VNode): boolean {
  const flags = vNode.flags;
  if (flags & VNodeFlags.ComponentClass) {
    return (
      typeof (vNode.children as any).componentWillMove === 'function' ||
      hasCandidates(input(vNode))
    );
  }
  if (flags & VNodeFlags.ComponentFunction) {
    return hasMoveHook(vNode.ref) !== 0 || hasCandidates(input(vNode));
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
  let list = isFragment
    ? fragmentLists.get(children)
    : elementLists.get(parent);
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

function coverageOf(commit: AnimationQueues): Set<Element> {
  let covered = coverage.get(commit);
  if (covered === undefined) coverage.set(commit, (covered = new Set()));
  return covered;
}

// Calls the move hook of vNode's outermost owner, or of every owner in a fragment. Only a keyed
// fragment list shares its parent with an enclosing list, so only its items are checked against
// the parent and against the elements that the enclosing list prepared.
function prepareOwner(
  vNode: VNode,
  list: MoveList,
  commit: AnimationQueues,
  inFragment: boolean,
): void {
  let flags = vNode.flags;
  while (flags & VNodeFlags.Component) {
    const isClass = (flags & VNodeFlags.ComponentClass) !== 0;
    const owner = isClass ? (vNode.children as any) : vNode.ref;
    if (isClass && (owner === null || owner.$UN)) return;
    const hook =
      owner == null
        ? undefined
        : isClass
          ? owner.componentWillMove
          : owner.onComponentWillMove;
    if (typeof hook === 'function') {
      const dom = findElementFromVNode(vNode);
      if (dom === null) return;
      if (list.owner.flags & VNodeFlags.Fragment) {
        if (dom.parentNode !== list.parent) return;
        const covered = coverage.get(commit);
        if (covered !== undefined && covered.has(dom)) return;
      }
      if (inFragment || rootIsFragment(vNode)) {
        coverRoots(vNode, coverageOf(commit));
      }
      if (isClass) hook.call(owner, list.owner, list.parent, dom);
      else hook.call(owner, list.owner, list.parent, dom, vNode.props);
      return;
    }
    vNode = input(vNode);
    flags = vNode.flags;
  }
  if (flags & VNodeFlags.Fragment) {
    if (vNode.childFlags === ChildFlags.HasVNodeChildren) {
      prepareOwner(input(vNode), list, commit, true);
    } else {
      for (const child of vNode.children as VNode[]) {
        prepareOwner(child, list, commit, true);
      }
    }
  }
}

function rootIsFragment(vNode: VNode): boolean {
  while (vNode.flags & VNodeFlags.Component) vNode = input(vNode);
  return (vNode.flags & VNodeFlags.Fragment) !== 0;
}

function isRetained(child: VNode, next: VNode | undefined): boolean {
  return (
    next !== undefined &&
    next.type === child.type &&
    !((next.flags ^ child.flags) & ~VNodeFlags.InUseOrNormalized) &&
    !(next.flags & VNodeFlags.ReCreate)
  );
}

// Calls the hooks of the items of last that stay in next, before either is patched
function prepareItems(
  list: MoveList,
  previous: VNode[],
  children: VNode[],
  commit: AnimationQueues,
  cancel: (parent: Node) => void,
): void {
  const lastLength = previous.length;
  const nextLength = children.length;
  // Items before prefix and from lastEnd on keep their place at either end, so only the items
  // between need a key map
  let prefix = 0;
  while (
    prefix < lastLength &&
    prefix < nextLength &&
    previous[prefix].key === children[prefix].key
  ) {
    prefix++;
  }
  let lastEnd = lastLength;
  let nextEnd = nextLength;
  while (
    lastEnd > prefix &&
    nextEnd > prefix &&
    previous[lastEnd - 1].key === children[nextEnd - 1].key
  ) {
    lastEnd--;
    nextEnd--;
  }
  let nextByKey: Map<VNode['key'], VNode> | undefined;
  // A few moved items are found by a scan; more of them build the key map
  let scans = 4;
  try {
    for (let i = 0; i < lastLength; i++) {
      const child = previous[i];
      let retained: VNode | undefined;
      if (i < prefix) {
        retained = children[i];
      } else if (i >= lastEnd) {
        retained = children[i - lastLength + nextLength];
      } else {
        retained = i < nextEnd ? children[i] : undefined;
        if (retained === undefined || retained.key !== child.key) {
          retained = undefined;
          if (nextByKey !== undefined) {
            retained = nextByKey.get(child.key);
          } else if (scans-- > 0) {
            for (let j = prefix; j < nextEnd; j++) {
              if (children[j].key === child.key) {
                retained = children[j];
                break;
              }
            }
          } else {
            nextByKey = new Map();
            for (let j = prefix; j < nextEnd; j++) {
              nextByKey.set(children[j].key, children[j]);
            }
            retained = nextByKey.get(child.key);
          }
        }
      }
      if (isRetained(child, retained)) prepareOwner(child, list, commit, false);
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
  const adapter: MoveAnimationAdapter = {
    mountClass(instance) {
      if (!instance.$UN && !classOwners.has(instance)) {
        classOwners.add(instance);
        changeOwners(adapter, 1);
      }
    },
    unmountClass(instance) {
      if (classOwners.delete(instance)) changeOwners(adapter, -1);
    },
    updateHooks(lastRef, nextRef) {
      const delta = hasMoveHook(nextRef) - hasMoveHook(lastRef);
      if (delta !== 0) changeOwners(adapter, delta);
    },
    prepare(last, next, parent, commit) {
      const list = track(last, parent)!;
      if (next.childFlags === ChildFlags.HasKeyedChildren) {
        const children = next.children as VNode[];
        if (list.active)
          prepareItems(
            list,
            last.children as VNode[],
            children,
            commit,
            cancel,
          );
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
    unmountList(vNode) {
      if (vNode.flags & VNodeFlags.Fragment) {
        const list = fragmentLists.get(vNode.children as VNode[]);
        if (list !== undefined) {
          forget(list, true);
          // Moves in progress inside the parent end with its last list
          if (!parents.has(list.parent)) cancel(list.parent);
        }
      } else {
        const list = elementLists.get(vNode.dom as Element);
        if (list !== undefined) forget(list, false);
        cancel(vNode.dom!);
      }
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
  setMoveAnimations(adapter, false);
}
