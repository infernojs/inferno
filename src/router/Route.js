import { createVNode } from '../core/createBlueprint';

export default function Route({ path, component }) {
    console.warn(
        `Inferno Warning: An "inferno-router" Route has been directly rendered instead of passed to a Router component.`
    );
    return createVNode().tag(component);
}