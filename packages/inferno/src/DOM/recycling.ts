import { isNull, isUndefined, LifecycleClass } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { Refs, VNode } from '../core/VNodes';
import { patchComponent, patchElement } from './patching';

const componentPools = new Map<Function | null, Pools>();
const elementPools = new Map<string | null, Pools>();

interface Pools {
	nonKeyed: VNode[];
	keyed: Map<string | number, VNode[]>;
}

export function recycleElement(vNode: VNode, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
	const tag = vNode.type as string | null;
	const pools: Pools|undefined = elementPools.get(tag);

	if (!isUndefined(pools)) {
		const key = vNode.key;
		const pool = key === null ? pools.nonKeyed : pools.keyed.get(key);

		if (!isUndefined(pool)) {
			const recycledVNode = pool.pop();

			if (!isUndefined(recycledVNode)) {
				patchElement(recycledVNode, vNode, null, lifecycle, context, isSVG, true);
				return vNode.dom;
			}
		}
	}
	return null;
}

export function poolElement(vNode: VNode) {
	const tag = vNode.type as string | null;
	const key = vNode.key;
	let pools: Pools|undefined = elementPools.get(tag);

	if (isUndefined(pools)) {
		pools = {
			keyed: new Map<string | number, VNode[]>(),
			nonKeyed: []
		};
		elementPools.set(tag, pools);
	}
	if (isNull(key)) {
		pools.nonKeyed.push(vNode);
	} else {
		let pool = pools.keyed.get(key);

		if (isUndefined(pool)) {
			pool = [];
			pools.keyed.set(key, pool);
		}
		pool.push(vNode);
	}
}

export function recycleComponent(vNode: VNode, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
	const type = vNode.type as Function;
	const pools: Pools|undefined = componentPools.get(type);

	if (!isUndefined(pools)) {
		const key = vNode.key;
		const pool = key === null ? pools.nonKeyed : pools.keyed.get(key);

		if (!isUndefined(pool)) {
			const recycledVNode = pool.pop();

			if (!isUndefined(recycledVNode)) {
				const flags = vNode.flags;
				const failed = patchComponent(
					recycledVNode,
					vNode,
					null,
					lifecycle,
					context,
					isSVG,
					flags & VNodeFlags.ComponentClass,
					true
				);

				if (!failed) {
					return vNode.dom;
				}
			}
		}
	}
	return null;
}

export function poolComponent(vNode: VNode) {
	const hooks = vNode.ref as Refs;
	const nonRecycleHooks = hooks && (
			hooks.onComponentWillMount ||
			hooks.onComponentWillUnmount ||
			hooks.onComponentDidMount ||
			hooks.onComponentWillUpdate ||
			hooks.onComponentDidUpdate
		);
	if (nonRecycleHooks) {
		return;
	}
	const type = vNode.type;
	const key = vNode.key;
	let pools: Pools|undefined = componentPools.get(type as Function);

	if (isUndefined(pools)) {
		pools = {
			keyed: new Map<string | number, VNode[]>(),
			nonKeyed: []
		};
		componentPools.set(type as Function, pools);
	}
	if (isNull(key)) {
		pools.nonKeyed.push(vNode);
	} else {
		let pool = pools.keyed.get(key);

		if (isUndefined(pool)) {
			pool = [];
			pools.keyed.set(key, pool);
		}
		pool.push(vNode);
	}
}
