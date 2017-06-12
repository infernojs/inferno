export const xlinkNS = 'http://www.w3.org/1999/xlink';
export const xmlNS = 'http://www.w3.org/XML/1998/namespace';
export const svgNS = 'http://www.w3.org/2000/svg';

export const strictProps = new Set<string>([
	'volume',
	'defaultChecked'
]);

export const booleanProps = new Set<string>([
	'muted',
	'scoped',
	'loop',
	'open',
	'checked',
	'default',
	'capture',
	'disabled',
	'readOnly',
	'required',
	'autoplay',
	'controls',
	'seamless',
	'reversed',
	'allowfullscreen',
	'novalidate',
	'hidden',
	'autoFocus',
	'selected'
]);

export const namespaces = new Map<string, string>([
	['xlink:href', xlinkNS],
	['xlink:arcrole', xlinkNS],
	['xlink:actuate', xlinkNS],
	['xlink:show', xlinkNS],
	['xlink:role', xlinkNS],
	['xlink:title', xlinkNS],
	['xlink:type', xlinkNS],
	['xml:base', xmlNS],
	['xml:lang', xmlNS],
	['xml:space', xmlNS]
]);

export const isUnitlessNumber = new Set<string>([
	'animationIterationCount',
	'borderImageOutset',
	'borderImageSlice',
	'borderImageWidth',
	'boxFlex',
	'boxFlexGroup',
	'boxOrdinalGroup',
	'columnCount',
	'flex',
	'flexGrow',
	'flexPositive',
	'flexShrink',
	'flexNegative',
	'flexOrder',
	'gridRow',
	'gridColumn',
	'fontWeight',
	'lineClamp',
	'lineHeight',
	'opacity',
	'order',
	'orphans',
	'tabSize',
	'widows',
	'zIndex',
	'zoom',
	'fillOpacity',
	'floodOpacity',
	'stopOpacity',
	'strokeDasharray',
	'strokeDashoffset',
	'strokeMiterlimit',
	'strokeOpacity',
	'strokeWidth'
]);

export const skipProps = new Set<string>([
	'children',
	'childrenType',
	'defaultValue',
	'ref',
	'key',
	'checked',
	'multiple'
]);

export const delegatedEvents = new Set<string>([
	'onClick',
	'onMouseDown',
	'onMouseUp',
	'onMouseMove',
	'onSubmit',
	'onDblClick',
	'onKeyDown',
	'onKeyUp',
	'onKeyPress'
]);
