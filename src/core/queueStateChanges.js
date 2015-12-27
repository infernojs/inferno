import applyState from './applyState';

export default function queueStateChanges( component, newState ) {
	for ( let stateKey in newState ) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if ( component._pendingSetState === false ) {
		component._pendingSetState = true;
		applyState( component );
	}
}
