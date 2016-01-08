import updateComponent from './updateComponent';
import { requestAnimationFrame } from './../util/requestAnimationFrame';
import ExecutionEnvironment from '../util/ExecutionEnvironment';

function applyState(component) {
	const blockRender = component._blockRender;

	requestAnimationFrame(() => {
		if (component._deferSetState === false) {
			let activeNode;

			if (ExecutionEnvironment.canUseDOM) {
				activeNode = document.activeElement;
			}

			component._pendingSetState = false;
			const pendingState = component._pendingState;
			const oldState = component.state;
			const nextState = {
				...oldState,
				...pendingState
			};

			component._pendingState = {};
			component._pendingSetState = false;
			updateComponent(component, oldState, nextState, component.props, component.props, component.forceUpdate, blockRender);

			if (ExecutionEnvironment.canUseDOM &&
				activeNode !== document.body &&
				document.activeElement !== activeNode) {
				activeNode.focus();
			}
		} else {
			applyState( component );
		}
	});
}

export default applyState;
