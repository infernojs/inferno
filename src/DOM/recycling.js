import { isUndefined, isNull } from './../core/utils';
import { patchOptVElement, patchVComponent } from './patching';
export const recyclingEnabled = true;
const vComponentPools = new Map();
;
export function recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount) {
    const bp = optVElement.bp;
    const key = optVElement.key;
    const pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed.get(key);
    if (!isUndefined(pool)) {
        const recycledOptVElement = pool.pop();
        if (!isUndefined(recycledOptVElement)) {
            patchOptVElement(recycledOptVElement, optVElement, null, lifecycle, context, isSVG, shallowUnmount);
            return optVElement.dom;
        }
    }
    return null;
}
export function poolOptVElement(optVElement) {
    const bp = optVElement.bp;
    const key = optVElement.key;
    const pools = bp.pools;
    if (isNull(key)) {
        pools.nonKeyed.push(optVElement);
    }
    else {
        let pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(optVElement);
    }
}
export function recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount) {
    const component = vComponent.component;
    const key = vComponent.key;
    let pools = vComponentPools.get(component);
    if (!isUndefined(pools)) {
        const pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!isUndefined(pool)) {
            const recycledVComponent = pool.pop();
            if (!isUndefined(recycledVComponent)) {
                const failed = patchVComponent(recycledVComponent, vComponent, null, lifecycle, context, isSVG, shallowUnmount);
                if (!failed) {
                    return vComponent.dom;
                }
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
    }
    else {
        let pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vComponent);
    }
}
//# sourceMappingURL=recycling.js.map