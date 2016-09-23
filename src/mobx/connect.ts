import invariant from 'invariant';
import Component from '../component/es2015';
import createClass from '../component/createClass';
import reactiveMixin from './reactiveMixin';
import inject from './inject';

/**
 * Utilities
 */

function patch ( target, funcName ) {
	const base = target[ funcName ];
	const mixinFunc = reactiveMixin[ funcName ];
	if ( !base ) {
		target[ funcName ] = mixinFunc;
	} else {
		target[ funcName ] = function () {
			base.apply( this, arguments );
			mixinFunc.apply( this, arguments );
		};
	}
}

export default function connect ( arg1, arg2 = null ) {
	invariant( typeof arg1 !== 'string', 'Store names should be provided as array' )

	if ( Array.isArray( arg1 ) ) {
		// component needs stores
		if ( !arg2 ) {
			// invoked as decorator
			return componentClass => connect( arg1, componentClass );
		} else {
			// TODO: deprecate this invocation style
			return inject.apply( null, arg1 )( connect( arg2 ) );
		}
	}
	const componentClass = arg1;

	// Stateless function component:
	// If it is function but doesn't seem to be a Inferno class constructor,
	// wrap it to a Inferno class automatically
	if ( typeof componentClass === 'function'
		&& (!componentClass.prototype || !componentClass.prototype.render)
		&& !componentClass.isReactClass
		&& !Component.isPrototypeOf( componentClass )
	) {
		return connect( createClass( {
			displayName: componentClass.displayName || componentClass.name,
			propTypes: componentClass.propTypes,
			contextTypes: componentClass.contextTypes,
			getDefaultProps: () => componentClass.defaultProps,
			render: () => componentClass.call( this, this.props, this.context )
		} ) );
	}

	invariant( componentClass, 'Please pass a valid component to "observer"' )

	const target = componentClass.prototype || componentClass;
	[ 'componentWillMount', 'componentWillUnmount', 'componentDidMount', 'componentDidUpdate' ].forEach( function ( funcName ) {
		patch( target, funcName );
	} );
	if ( !target.shouldComponentUpdate ) {
		target.shouldComponentUpdate = reactiveMixin.shouldComponentUpdate;
	}
	componentClass.isMobXInfernoObserver = true;
	return componentClass;
}
