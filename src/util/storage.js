function doesItExist(value) {

	let i;

	if ( value != value || value === 0 ) {

		for ( i = this.length; i-- && !is( this[ i ], value ); );
	} else {
		i = [].indexOf.call( this, value );
	}
	return i;
}

function Storage( iterable ){
	let _items = [];
	let _keys = [];
	let _values = [];

	return Object.create( Storage.prototype, {

		get: {
			value( key ) {
				const index = doesItExist.call(_keys, key );
				return index > -1 ? _values[index] : undefined;
			}
		},
		set: {
			value( key, value ) {
				// check if key exists and overwrite
				const index = doesItExist.call(_keys, key );
				if ( index > -1 ) {
					_items[index][1] = value;
					_values[index] = value;
				} else {
					_items.push( [key, value ] );
					_keys.push( key );
					_values.push( value );
				}
			}
		}
	} );
}

export default Storage;