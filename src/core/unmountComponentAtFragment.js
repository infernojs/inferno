import removeContext from './removeContext';
import badUpdate from './badUpdate';

export default ( fragment ) => {
	let component = fragment.component;

	component.componentWillUnmount();
	removeContext( component.context.dom );
	component.forceUpdate = badUpdate;
	component.context = null;
	component = null;
};
