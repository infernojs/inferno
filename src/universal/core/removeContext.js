import contexts from '../../vars/contexts';

export default ( dom ) => {
	let idx = contexts.length;

	while ( idx-- ) {
		if ( contexts[idx].dom === dom ) {
			contexts.splice( idx, 1 );
			return;
		}
	}
};
