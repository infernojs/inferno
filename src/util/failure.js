let failure = function () {};

if ( process.env.NODE_ENV !== 'production' ) {

	failure = function ( condition, format, ...args ) {

		if ( format === undefined ) {
			throw new Error( '`Error( condition, format, ...args )` requires a failure ' + 'message argument' );
		}

		if ( !condition ) {

			let argIndex = 0;

			const message = 'Error: ' + format.replace( /%s/g, function () {
				return args[argIndex++];
			} );

			if ( typeof console !== 'undefined' ) {
				console.error( message );
			}

			try {
				throw new Error( message );
			} catch ( x ) {}
		}
	};
}

export default failure;
