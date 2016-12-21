import Component from 'inferno-component';

/**
 * Map of functional component name -> wrapper class.
 */
const functionalComponentWrappers = new Map();

/**
 * Wrap a functional component with a stateful component.
 *
 * Inferno does not record any information about the original hierarchy of
 * functional components in the rendered DOM nodes. Wrapping functional components
 * with a trivial wrapper allows us to recover information about the original
 * component structure from the DOM.
 *
 */
export function wrapFunctionalComponent(vNode) {
	const originalRender = vNode.type;
	const name = vNode.type.name || '(Function.name missing)';
	const wrappers = functionalComponentWrappers;

	if (!wrappers.has(originalRender)) {
		const wrapper = class extends Component<any, any> {
			render(props, state, context) {
				return originalRender(props, context);
			}
		};

		// Expose the original component name. React Dev Tools will use
		// this property if it exists or fall back to Function.name
		// otherwise.
		wrapper['displayName'] = name;
		wrappers.set(originalRender, wrapper);
	}
	vNode.type = wrappers.get(originalRender);
}
