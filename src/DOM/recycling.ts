import { VNode, VNodeFlags } from '../core/shapes';
import {
	isNull,
	isUndefined,
} from '../shared';
import {
	patchComponent,
	patchElement,
} from './patching';
import Lifecycle from "./lifecycle";

export let recyclingEnabled = true;
let componentPools = new Map<Function | null, Pools>();
let elementPools = new Map<string | null, Pools>();

interface Pools {
  nonKeyed: VNode[];
  keyed: Map<string | number, VNode[]>;
}

export function disableRecycling() {
	recyclingEnabled = false;
	componentPools.clear();
	elementPools.clear();
}

export function enableRecycling() {
	recyclingEnabled = true;
}

export function recycleElement(vNode, lifecycle: Lifecycle, context, isSVG) {
	const tag = vNode.type;
	const key = vNode.key;
	let pools: Pools = elementPools.get(tag);

	if (!isUndefined(pools)) {
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

export function poolElement(vNode) {
	const tag = vNode.type;
	const key = vNode.key;
	let pools: Pools = elementPools.get(tag);

	if (isUndefined(pools)) {
		pools = {
			nonKeyed: [],
			keyed: new Map<string | number, VNode[]>()
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

export function recycleComponent(vNode: VNode, lifecycle: Lifecycle, context, isSVG) {
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
			keyed: new Map<string | number, VNode[]>()
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
