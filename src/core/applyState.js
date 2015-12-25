import updateComponent from './updateComponent';

function applyState( component ) {
	const blockRender = component._blockRender;

	requestAnimationFrame(() => {
		if ( component._deferSetState === false ) {
			component._pendingSetState = false;
			const pendingState = component._pendingState;
			const oldState = component.state;
			const nextState = {
				...oldState,
				...pendingState
			};
			component._pendingState = {};
			component._pendingSetState = false;
			updateComponent( component, oldState, nextState, component.props, component.props, component.forceUpdate, blockRender );
		} else {
			applyState( component );
		}
	} );
}

export default applyState;
