import ExecutionEnvironment from './ExecutionEnvironment';
import noop from './noop';

const HOOK = {};
const reDash = /\-./g;

/* eslint-disable quote-props */
const unitlessProperties = {
	'animation-iteration-count': true,
	'box-flex': true,
	'box-flex-group': true,
	'column-count': true,
	'counter-increment': true,
	'fill-opacity': true,
	'flex': true,
	'flex-grow': true,
	'flex-order': true,
	'flex-positive': true,
	'flex-shrink': true,
	'float': true,
	'font-weight': true,
	'grid-column': true,
	'line-height': true,
	'line-clamp': true,
	'opacity': true,
	'order': true,
	'orphans': true,
	'stop-opacity': true,
	'stroke-dashoffset': true,
	'stroke-opacity': true,
	'stroke-width': true,
	'tab-size': true,
	'transform': true,
	'transform-origin': true,
	'widows': true,
	'z-index': true,
	'zoom': true
};

/* eslint-enable quote-props */

export let directions = [ 'Top', 'Right', 'Bottom', 'Left' ];
export let dirMap = ( prefix, postfix ) =>
    directions.map( dir => ( prefix || '' ) + dir + ( postfix || '' ) );
export const shortCuts = {
	// rely on cssText
	font: [/*
		font-style
		font-variant
		font-weight
		font-size/line-height
		font-family|caption|icon|menu|message-box|small-caption|status-bar|initial|inherit;
	*/],
	padding: dirMap( 'padding' ),
	margin: dirMap( 'margin' ),
	'border-width': dirMap( 'border', 'Width' ),
	'border-style': dirMap( 'border', 'Style' )
};
export const cssToJSName = cssName =>
	cssName.replace( reDash, str => str[1].toUpperCase() );

// Don't execute this in nodejS
if ( ExecutionEnvironment.canUseDOM ) {
	// get browser supported CSS properties
	const documentElement = document.documentElement;
	const computed = window.getComputedStyle( documentElement );
	const props = Array.prototype.slice.call( computed, 0 );
	for ( let key in documentElement.style ) {
		if ( !computed[key] ) {
			props.push( key );
		}
	}
	props.forEach( function ( propName ) {
		let prefix = propName[0] === '-'
			? propName.substr( 1, propName.indexOf( '-', 1 ) - 1 )
			: null;
		let stylePropName = cssToJSName( propName );

		HOOK[stylePropName] = {
			unPrefixed: prefix
				? propName.substr( prefix.length + 2 )
				: propName,
			unitless: unitlessProperties[propName] ? true : false,
			shorthand: null
		};
	} );

	const lenMap = {
		1: ( values, props, style ) => props.forEach( prop => style[prop] = values[0] ),
		2: ( values, props, style ) => values.forEach( ( value, index ) => {
			style[props[index]] = style[props[index + 2]] = value;
		} ),
		4: ( values, props, style ) => props.forEach( ( prop, index ) => {
			style[prop] = values[index];
		} )
	};

	// normalize property shortcuts
	Object.keys( shortCuts ).forEach( propName => {
		let stylePropName = cssToJSName( propName );

		HOOK[stylePropName] = {
			unPrefixed: propName,
			unitless: false,
			shorthand: ( value, style ) => {
				let type = typeof value;

				if ( type === 'number' ) {
					value += 'px';
				}
				if ( !value ) {
					return;
				}
				if ( 'cssText' in style ) {
					// normalize setting complex property across browsers
					style.cssText += ';' + propName + ':' + value;
				} else {
					let values = value.split( ' ' );

					( lenMap[values.length] || noop )( values, shortCuts[propName], style );
				}
			}
		};
	} );
}

// TODO! Find a way to solve this for SSR

export default HOOK;
