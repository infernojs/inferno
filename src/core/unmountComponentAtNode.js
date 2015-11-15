import removeFragment             from './removeFragment';
import removeContext              from './removeContext';
import getContext                 from './getContext';
import unmountComponentAtFragment from './unmountComponentAtFragment';

export default ( dom ) => {
	const context = getContext( dom );

	if ( context !== null ) {
		const component = context.fragment.component;

		if ( component ) {
			removeFragment( context, dom, component.fragment );
			unmountComponentAtFragment( component.fragment );
		} else {
			removeFragment( context, dom, context.fragment );
			removeContext( dom );
		}
	}
};
