import ExecutionEnvironment from './ExecutionEnvironment';

const HOOK = {};
const reDash = /\-./g;

const unitlessProperties = {
	'box-flex': true,
	'animation-iteration-count': true,
	'tab-size': true,
	'box-flex-group': true,
	'column-count': true,
	'counter-increment': true,
	'stop-opacity': true,
	'stroke-dashoffset': true,
	'stroke-opacity': true,
	'stroke-width': true,
	'transform': true,
	'transform-origin': true,
	'flex-grow': true,
	'flex-positive': true,
	'flex': true,
	'float': true,
	'fill-opacity': true,
	'font-weight': true,
	'grid-column': true,
	'flex-shrink': true,
	'line-height': true,
	'line-clamp': true,
	'flex-order': true,
	'opacity': true,
	'orphans': true,
	'order': true,
	'widows': true,
	'z-index': true,
	'zoom': true,
};

// Don't execute this in nodejS
if ( ExecutionEnvironment.canUseDOM )  {
	// get browser supported CSS properties
	const computed =  window.getComputedStyle(document.documentElement);
	const props = Array.prototype.slice.call(computed, 0);

	props.forEach(function(propName) {
		let prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null;
		let stylePropName = propName.replace(reDash, (str) => str[1].toUpperCase());

		HOOK[stylePropName] =  {
			propName: propName.replace(reDash, str => str[1].toUpperCase()),
			unPrefixed: prefix ? propName.substr(prefix.length + 2) : propName,
			unitless: unitlessProperties[propName] ? true : false
		};
	});
}

// TODO! Find a way to solve this for SSR

export default HOOK;