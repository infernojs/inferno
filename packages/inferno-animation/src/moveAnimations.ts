import {
  _FE as findElementFromVNode,
  _MA as setMoveAnimations,
  type AnimationQueues,
  type VNode,
} from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { isFunction } from 'inferno-shared';
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
// The owner whose hook is running, so its animation can cover every root of a fragment.
let preparedOwner: VNode | null = null;

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
  return ref != null && isFunction(ref.onComponentWillMove) ? 1 : 0;
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
      isFunction((vNode.children as any).componentWillMove) ||
      hasCandidates(input(vNode))
    );
  }
  if (flags & VNodeFlags.ComponentFunction) {
    return hasMoveHook(vNode.ref) !== 0 || hasCandidates(input(vNode));
  }
  if (flags & VNodeFlags.Fragment) {
    return flags & VNodeFlags.HasVNodeChildren
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
    if (flags & VNodeFlags.HasVNodeChildren) coverRoots(input(vNode), covered);
    else {
      const children = vNode.children as VNode[];
      for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        coverRoots(child, covered);
      }
    }
  }
}

export function preparedOwnerElements(): Set<Element> | null {
  let vNode = preparedOwner;
  if (vNode === null) return null;
  while (vNode.flags & VNodeFlags.Component) vNode = input(vNode);
  if (!(vNode.flags & VNodeFlags.Fragment)) return null;
  const elements = new Set<Element>();
  coverRoots(vNode, elements);
  return elements;
}

function visit(vNode: VNode, list: MoveList, covered?: Set<Element>): boolean {
  const flags = vNode.flags;
  if (flags & VNodeFlags.Component) {
    const isClass = Boolean(flags & VNodeFlags.ComponentClass);
    const owner = isClass ? (vNode.children as any) : vNode.ref;
    if (isClass && (!owner || owner.$UN)) return false;
    const hook =
      owner && (isClass ? owner.componentWillMove : owner.onComponentWillMove);
    if (isFunction(hook)) {
      const dom = findElementFromVNode(vNode);
      if (!dom || dom.parentNode !== list.parent) return false;
      if (covered && !covered.has(dom)) {
        coverRoots(vNode, covered);
        const outerOwner = preparedOwner;
        preparedOwner = vNode;
        try {
          if (isClass) hook.call(owner, list.owner, list.parent, dom);
          else hook.call(owner, list.owner, list.parent, dom, vNode.props);
        } finally {
          preparedOwner = outerOwner;
        }
      }
      return true;
    }
    return visit(input(vNode), list, covered);
  }
  if (flags & VNodeFlags.Fragment) {
    if (flags & VNodeFlags.HasVNodeChildren)
      return visit(input(vNode), list, covered);
    let found = false;
    const children = vNode.children as VNode[];
    for (let i = 0, len = children.length; i < len; ++i) {
      const child = children[i];
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
    (vNode.flags & VNodeFlags.HasKeyedChildren) !== 0
    ? fragmentLists.get(vNode.children as VNode[])
    : undefined;
}

// The list of a keyed element or fragment, synced to vNode: created when missing, rescanned for
// hooks when owner changes happened since, or when its children are not the ones last seen (a
// patch that threw keeps the old vNode and its written-back children). Patching asks for it only
// when vNode has keyed children.
function track(vNode: VNode, parent: Element): MoveList {
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

// Whether the owner whose element was found last renders a fragment (set by firstElement) or was
// reached through one (set by ownerElement)
let ownerInFragment = false;

// Whether the list being prepared keeps its keys in the same order with every item retained
let keysKept = false;

// Whether the owner whose move hook runs can move in this update. An owner of a list that keeps
// its keys cannot, unless it may share its parent with an inner keyed fragment that reorders,
// whose own hooks the enclosing owner covers.
export function preparedOwnerMayMove(): boolean {
  return !keysKept || ownerInFragment;
}

// The first element that vNode renders, or null when that is text, a placeholder or a portal
function firstElement(vNode: VNode): Element | null {
  ownerInFragment = false;
  for (;;) {
    const flags = vNode.flags;
    if (flags & VNodeFlags.Element) return vNode.dom as Element;
    if (flags & VNodeFlags.Fragment) {
      ownerInFragment = true;
      return findElementFromVNode(vNode);
    }
    if ((flags & VNodeFlags.Component) === 0) return null;
    vNode = input(vNode);
  }
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
    if (flags & VNodeFlags.ComponentClass) {
      const instance = vNode.children as any;
      if (instance === null || instance.$UN) return;
      if (isFunction(instance.componentWillMove)) {
        const dom = ownerElement(vNode, list, commit, inFragment);
        if (dom !== null) {
          instance.componentWillMove(list.owner, list.parent, dom);
        }
        return;
      }
    } else {
      const hooks = vNode.ref as any;
      if (hooks != null && isFunction(hooks.onComponentWillMove)) {
        const dom = ownerElement(vNode, list, commit, inFragment);
        if (dom !== null) {
          hooks.onComponentWillMove(list.owner, list.parent, dom, vNode.props);
        }
        return;
      }
    }
    vNode = input(vNode);
    flags = vNode.flags;
  }
  if (flags & VNodeFlags.Fragment) {
    if (flags & VNodeFlags.HasVNodeChildren) {
      prepareOwner(input(vNode), list, commit, true);
    } else {
      const children = vNode.children as VNode[];
      for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        prepareOwner(child, list, commit, true);
      }
    }
  }
}

// The element an owner's hook gets, or null when it has none in the list's parent or an enclosing
// list prepared it already. Records the owner's elements when a keyed fragment list may share them.
function ownerElement(
  owner: VNode,
  list: MoveList,
  commit: AnimationQueues,
  inFragment: boolean,
): Element | null {
  const dom = firstElement(owner);
  if (dom === null) return null;
  if (list.owner.flags & VNodeFlags.Fragment) {
    if (dom.parentNode !== list.parent) return null;
    const covered = coverage.get(commit);
    if (covered !== undefined && covered.has(dom)) return null;
  }
  if (inFragment || ownerInFragment) {
    ownerInFragment = true;
    coverRoots(owner, coverageOf(commit));
  }
  preparedOwner = owner;
  return dom;
}

function isRetained(child: VNode, next: VNode | undefined): boolean {
  return (
    next !== undefined &&
    next.type === child.type &&
    !(
      (next.flags ^ child.flags) &
      ~(VNodeFlags.InUse | VNodeFlags.IgnoredByPatch)
    )
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
  // Items before kept are also retained
  let kept = 0;
  while (prefix < lastLength && prefix < nextLength) {
    const child = previous[prefix];
    const next = children[prefix];
    if (child.key !== next.key) break;
    if (kept === prefix && isRetained(child, next)) kept++;
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
  const outerKeysKept = keysKept;
  const outerOwnerInFragment = ownerInFragment;
  const outerOwner = preparedOwner;
  keysKept = kept === lastLength && lastLength === nextLength;
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
      if (i < kept || isRetained(child, retained)) {
        prepareOwner(child, list, commit, false);
      }
    }
  } catch (error) {
    cancel(list.parent);
    throw error;
  } finally {
    keysKept = outerKeysKept;
    ownerInFragment = outerOwnerInFragment;
    preparedOwner = outerOwner;
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
    if (flags & VNodeFlags.HasVNodeChildren)
      collectNestedLists(input(vNode), nested);
    else {
      const children = vNode.children as VNode[];
      for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        collectNestedLists(child, nested);
      }
    }
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
      const children = list.children;
      for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        collectNestedLists(child, nested);
      }
    }
  }
  for (const list of siblings) {
    if (nested.has(list)) continue;
    const children = list.children;
    for (let i = 0, len = children.length; i < len; ++i) {
      const child = children[i];
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
      const list = track(last, parent);
      if ((next.flags & VNodeFlags.HasKeyedChildren) !== 0) {
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
      const list = track(last, parent);
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
        if (flags & VNodeFlags.HasVNodeChildren)
          this.reparent(input(vNode), parent);
        else {
          const children = vNode.children as VNode[];
          for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            this.reparent(child, parent);
          }
        }
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
