import isUndefined from './isUndefined';

let warning = function () {};

if ( process.env.NODE_ENV !== 'production' ) {
	warning = function ( condition, format, ...args ) {
		if ( isUndefined( format ) ) {
			throw new Error( '`warning(condition, format, ...args)` requires a warning ' + 'message argument' );
		}

		if ( !condition ) {
			let argIndex = 0;
			const message = 'Warning: ' + format.replace( /%s/g, function () {
				return args[argIndex++];
			} );

			if ( !isUndefined( console ) ) {
				console.warn( message );
			}

			try {
				throw new Error( message );
			} catch ( x ) {
				// noop
			}
		}
	};
}

export default warning;
