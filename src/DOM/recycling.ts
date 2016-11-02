import {
	isUndefined,
	isNull
} from './../shared';
import {
	patchElement,
	patchComponent
} from './patching';
import { VNode, VNodeFlags } from '../core/shapes';

export let recyclingEnabled = true;
let componentPools = new Map<Function | null, Pools>();
let elementPools = new Map<string | null, Pools>();

interface Pools {
  nonKeyed: Array<VNode>;
  keyed: Map<string | number, Array<VNode>>;
}

export function disableRecycling() {
	recyclingEnabled = false;
	componentPools.clear();
	elementPools.clear();
}

export function recycleElement(vNode, lifecycle, context, isSVG) {
	const tag = vNode.type;
	const key = vNode.key;
	let pools: Pools = elementPools.get(tag);

	if (!isUndefined(pools)) {
		const pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
		const recycledOptVElement = pool.pop();

		if (!isUndefined(recycledOptVElement)) {
			patchElement(recycledOptVElement, vNode, null, lifecycle, context, isSVG);
			return vNode.dom;
		}
	}
	return null;
}

export function poolElement(vNode) {
	const tag = vNode.type;
	const key = vNode.key;
	let pools: Pools = elementPools.get(tag);

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

export function recycleComponent(vNode: VNode, lifecycle, context, isSVG) {
	const type = vNode.type as Function;
	const key = vNode.key;
	let pools: Pools = componentPools.get(type);

	if (!isUndefined(pools)) {
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
					flags & VNodeFlags.ComponentClass
				);

				if (!failed) {
					return vNode.dom;
				}
			}
		}
	}
	return null;
}

export function poolComponent(vNode) {
	const type = vNode.type;
	const key = vNode.key;
	const hooks = vNode.ref;
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
	let pools: Pools = componentPools.get(type);

	if (isUndefined(pools)) {
		pools = {
			nonKeyed: [],
			keyed: new Map<string | number, Array<VNode>>()
		};
		componentPools.set(type, pools);
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
