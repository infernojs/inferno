/**
 * @module Inferno
 */ /** TypeDoc Comment */

export const xlinkNS = 'http://www.w3.org/1999/xlink';
export const xmlNS = 'http://www.w3.org/XML/1998/namespace';
export const svgNS = 'http://www.w3.org/2000/svg';

export const strictProps = new Set<string>();
strictProps.add('volume');
strictProps.add('defaultChecked');

export const booleanProps = new Set<string>();
booleanProps.add('muted');
booleanProps.add('scoped');
booleanProps.add('loop');
booleanProps.add('open');
booleanProps.add('checked');
booleanProps.add('default');
booleanProps.add('capture');
booleanProps.add('disabled');
booleanProps.add('readOnly');
booleanProps.add('required');
booleanProps.add('autoplay');
booleanProps.add('controls');
booleanProps.add('seamless');
booleanProps.add('reversed');
booleanProps.add('allowfullscreen');
booleanProps.add('novalidate');
booleanProps.add('hidden');
booleanProps.add('autoFocus');
booleanProps.add('selected');
booleanProps.add('indeterminate');

// TODO: MathML namespace
export const namespaces = new Map<string, string>();
namespaces.set('xlink:href', xlinkNS);
namespaces.set('xlink:arcrole', xlinkNS);
namespaces.set('xlink:actuate', xlinkNS);
namespaces.set('xlink:show', xlinkNS);
namespaces.set('xlink:role', xlinkNS);
namespaces.set('xlink:title', xlinkNS);
namespaces.set('xlink:type', xlinkNS);
namespaces.set('xml:base', xmlNS);
namespaces.set('xml:lang', xmlNS);
namespaces.set('xml:space', xmlNS);

export const isUnitlessNumber = new Set<string>();
isUnitlessNumber.add('animationIterationCount');
isUnitlessNumber.add('animation-iteration-count');
isUnitlessNumber.add('borderImageOutset');
isUnitlessNumber.add('border-image-outset');
isUnitlessNumber.add('borderImageSlice');
isUnitlessNumber.add('border-image-slice');
isUnitlessNumber.add('borderImageWidth');
isUnitlessNumber.add('border-image-width');
isUnitlessNumber.add('boxFlex');
isUnitlessNumber.add('box-flex');
isUnitlessNumber.add('boxFlexGroup');
isUnitlessNumber.add('box-flex-group');
isUnitlessNumber.add('boxOrdinalGroup');
isUnitlessNumber.add('box-ordinal-group');
isUnitlessNumber.add('columnCount');
isUnitlessNumber.add('column-count');
isUnitlessNumber.add('flex');
isUnitlessNumber.add('flexGrow');
isUnitlessNumber.add('flex-grow');
isUnitlessNumber.add('flexPositive');
isUnitlessNumber.add('flex-positive');
isUnitlessNumber.add('flexShrink');
isUnitlessNumber.add('flex-shrink');
isUnitlessNumber.add('flexNegative');
isUnitlessNumber.add('flex-negative');
isUnitlessNumber.add('flexOrder');
isUnitlessNumber.add('flex-order');
isUnitlessNumber.add('gridRow');
isUnitlessNumber.add('grid-row');
isUnitlessNumber.add('gridColumn');
isUnitlessNumber.add('grid-column');
isUnitlessNumber.add('fontWeight');
isUnitlessNumber.add('font-weight');
isUnitlessNumber.add('lineClamp');
isUnitlessNumber.add('line-clamp');
isUnitlessNumber.add('lineHeight');
isUnitlessNumber.add('line-height');
isUnitlessNumber.add('opacity');
isUnitlessNumber.add('order');
isUnitlessNumber.add('orphans');
isUnitlessNumber.add('tabSize');
isUnitlessNumber.add('tab-size');
isUnitlessNumber.add('widows');
isUnitlessNumber.add('zIndex');
isUnitlessNumber.add('z-index');
isUnitlessNumber.add('zoom');
isUnitlessNumber.add('fillOpacity');
isUnitlessNumber.add('fill-opacity');
isUnitlessNumber.add('floodOpacity');
isUnitlessNumber.add('flood-opacity');
isUnitlessNumber.add('stopOpacity');
isUnitlessNumber.add('stop-opacity');
isUnitlessNumber.add('strokeDasharray');
isUnitlessNumber.add('stroke-dasharray');
isUnitlessNumber.add('strokeDashoffset');
isUnitlessNumber.add('stroke-dashoffset');
isUnitlessNumber.add('strokeMiterlimit');
isUnitlessNumber.add('stroke-miterlimit');
isUnitlessNumber.add('strokeOpacity');
isUnitlessNumber.add('stroke-opacity');
isUnitlessNumber.add('strokeWidth');
isUnitlessNumber.add('stroke-width');

export const skipProps = new Set<string>();
skipProps.add('children');
skipProps.add('childrenType');
skipProps.add('className');
skipProps.add('defaultValue');
skipProps.add('ref');
skipProps.add('key');
skipProps.add('checked');
skipProps.add('multiple');

export const delegatedEvents = new Set<string>();
delegatedEvents.add('onClick');
delegatedEvents.add('onMouseDown');
delegatedEvents.add('onMouseUp');
delegatedEvents.add('onMouseMove');

delegatedEvents.add('onTouchStart');
delegatedEvents.add('onTouchEnd');
delegatedEvents.add('onTouchMove');

delegatedEvents.add('onSubmit');
delegatedEvents.add('onDblClick');
delegatedEvents.add('onKeyDown');
delegatedEvents.add('onKeyUp');
delegatedEvents.add('onKeyPress');
delegatedEvents.add('onFocusIn');
delegatedEvents.add('onFocusOut');
