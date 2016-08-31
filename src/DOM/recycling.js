import {
	isUndefined,
	isNull
} from './../core/utils';
import {
	patchVTemplate,
	patchVComponent
} from './patching';

export const recyclingEnabled = true;

const vComponentPools = new Map();

export function recycleVTemplate(vTemplate, lifecycle, context, isSVG) {
	const templateReducers = vTemplate.tr;
	const key = vTemplate.key;
	const pool = key === null ? templateReducers.pools.nonKeyed : templateReducers.pools.keyed.get(key);

	if (!isUndefined(pool)) {
		const recycledVTemplate = pool.pop();

		if (!isUndefined(recycledVTemplate)) {
			patchVTemplate(recycledVTemplate, vTemplate, null, lifecycle, context, isSVG);
			return vTemplate.dom;
		}
	}
	return null;
}

export function poolVTemplate(vTemplate) {
	const templateReducers = vTemplate.tr;
	const key = vTemplate.key;
	const pools = templateReducers.pools;

	if (isNull(key)) {
		pools.nonKeyed.push(vTemplate);
	} else {
		let pool = pools.keyed.get(key);

		if (isUndefined(pool)) {
			pool = [];
			pools.keyed.set(key, pool);
		}
		pool.push(vTemplate);
	}
}

export function recycleVComponent(vComponent, lifecycle, context, isSVG) {
	const component = vComponent.component;
	const key = vComponent.key;
	let pools = vComponentPools.get(component);

	if (!isUndefined(pools)) {
		const pool = key === null ? pools.nonKeyed : pools.keyed.get(key);

		if (!isUndefined(pool)) {
			const recycledVComponent = pool.pop();

			if (!isUndefined(recycledVComponent)) {
				patchVComponent(recycledVComponent, vComponent, null, lifecycle, context, isSVG);
				return vComponent.dom;
			}
		}
	}
	return null;
}

export function poolVComponent(vComponent) {
	const component = vComponent.component;
	const key = vComponent.key;
	let pools = vComponentPools.get(component);

	if (isUndefined(pools)) {
		pools = {
			nonKeyed: [],
			keyed: new Map()
		};
		vComponentPools.set(component, pools);
	}
	if (isNull(key)) {
		pools.nonKeyed.push(vComponent);
	} else {
		let pool = pools.keyed.get(key);

		if (isUndefined(pool)) {
			pool = [];
			pools.keyed.set(key, pool);
		}
		pool.push(vComponent);
	}
}