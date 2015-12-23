import applyState from './applyState';

export default function queueStateChanges( component, newState ) {
	for ( const stateKey in newState ) {
		if ( newState.hasOwnProperty( stateKey ) ) {
			component._pendingState[stateKey] = newState[stateKey];
		}
	}
	if ( component._pendingSetState === false ) {
		component._pendingSetState = true;
		applyState( component );
	}
}
