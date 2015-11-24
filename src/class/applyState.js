import updateComponent from '../core/updateComponent';

function applyState(component) {
	requestAnimationFrame(() => {
		if(component._deferSetState === false) {
			component._pendingSetState = false;
			const pendingState = component._pendingState;
			const oldState = component.state;
			const nextState = {
				...oldState,
				...pendingState
			}
			component._pendingState = {};
			component._pendingSetState = false;
			updateComponent(component, component.props, nextState);
		} else {
			applyState(component);
		}
	});
}

export default applyState;
