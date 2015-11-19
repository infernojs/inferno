import contexts                  from '../vars/contexts';
import getContext                from './getContext';
import attachFragment            from './attachFragment';
import updateFragment            from './updateFragment';

function render(fragment, dom, component, useVirtual) {
	let context, generatedFragment;

	if (component) {
		if (component.context) {
			context = component.context;
			generatedFragment = typeof fragment === 'function' ? fragment() : fragment;
			updateFragment(context, context.fragment, generatedFragment, dom, component, false);
			context.fragment = generatedFragment;
		} else {
			generatedFragment = typeof fragment === 'function' ? fragment() : fragment;
			context = component.context = {
				fragment: generatedFragment,
				dom: dom,
				shouldRecycle: !useVirtual,
				useVirtual
			};
			component.componentWillMount();
			attachFragment(context, generatedFragment, dom, component);
			component.componentDidMount();
		}
	} else {
		if(!useVirtual) {
			context = getContext(dom);
		}
		if (context) {
			updateFragment(context, context.fragment, fragment, dom, component, false);
			context.fragment = fragment;
		} else {
			context = {
				fragment: fragment,
				dom: dom,
				shouldRecycle: !useVirtual,
				useVirtual
			};
			attachFragment(context, fragment, dom, component);
			if(!useVirtual) {
				contexts.push(context);
			}
		}
	}
}

export default render;
