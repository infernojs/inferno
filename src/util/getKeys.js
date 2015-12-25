/**
 * PERFORMANCE FIXES
 */
export function getKeys( object, callback ) {

	// Object.keys are supported in all major browsers Inferno are supporting
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys	

	const keys = Object.keys( object );

	for ( let i = 0; i < keys.length; i++ ) {
		callback( keys[i], i, keys );
	}
}