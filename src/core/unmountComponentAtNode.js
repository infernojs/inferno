import removeFragment             from './removeFragment';
import removeContext              from './removeContext';
import getContext                 from './getContext';
import unmountComponentAtFragment from './unmountComponentAtFragment';
import isArray from '../util/isArray';

export default function unmountComponentAtNode(dom) {
	const context = getContext( dom );

	if ( context !== null ) {
		const component = context.fragment.templateComponents || context.fragment.templateComponent;

		if ( component ) {
			if (isArray(component)) {
				for (let i = 0; i < component.length; i++) {
					if (component[i]) {
						removeFragment(context, dom, component[i].context.fragment);
						unmountComponentAtFragment(component[i].context.fragment);
					}
				}
			} else {
				if (component) {
					removeFragment(context, dom.firstChild, component.context.fragment);
					unmountComponentAtFragment(component.context.fragment);
				}
			}
		} else {
			removeFragment( context, dom, context.fragment );
			removeContext( dom );
		}
	}
};
