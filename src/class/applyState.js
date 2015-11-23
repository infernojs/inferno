function applyState(component) {
	requestAnimationFrame(() => {
		if(component._deferSetState === false) {
			component._pendingSetState = false;
			for (let stateKey in component._pendingState) {
				component.state[stateKey] = component._pendingState[stateKey];
			}
			component._pendingState = {};
			component._pendingSetState = false;
			component.forceUpdate();
		} else {
			applyState(component);
		}
	});
}

export default applyState;