let warning = function () {};

if ( process.env.NODE_ENV !== 'production' ) {

	warning = function ( condition, format, ...args ) {

		if ( format === undefined ) {
			throw new Error( '`warning( condition, format, ...args )` requires a warning ' + 'message argument' );
		}

		if ( !condition ) {
			let argIndex = 0;
			const message = 'Warning: ' + format.replace( /%s/g, function () {
				return args[argIndex++];
			} );

			if ( typeof console !== 'undefined' ) {
				console.warn( message );
			}

			try {
				throw new Error( message );
			} catch ( x ) {}
		}
	};
}

export default warning;
