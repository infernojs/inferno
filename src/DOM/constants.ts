function constructDefaults(string, object, value) {
	/* eslint no-return-assign: 0 */
	string.split(',').forEach((i) => object[i] = value);
}

export const xlinkNS = 'http://www.w3.org/1999/xlink';
export const xmlNS = 'http://www.w3.org/XML/1998/namespace';
export const svgNS = 'http://www.w3.org/2000/svg';
export const strictProps = {};
export const booleanProps = {};
export const namespaces = {};
export const isUnitlessNumber = {};
export const skipProps = {};
export const dehyphenProps = {
	// SVG

	// Regular attributes
	accentHeight: 'accent-height',
	capHeight: 'cap-height',
	fontFamily: 'font-family',
	fontSize: 'font-size',
	fontStretch: 'font-stretch',
	fontStyle: 'font-style',
	fontVariant: 'font-variant',
	fontWeight: 'font-weight',
	glyphName: 'glyph-name',
	horizAdvX: 'horiz-adv-x',
	horizOriginX: 'horiz-origin-x',
	horizOriginY: 'horiz-origin-y',
	overlinePosition: 'overline-position',
	overlineThickness: 'overline-thickness',
	panose1: 'panose-1',
	renderingIntent: 'rendering-intent',
	strikethroughPosition: 'strikethrough-position',
	strikethroughThickness: 'strikethrough-thickness',
	underlinePosition: 'underline-position',
	underlineThickness: 'underline-thickness',
	unicodeRange: 'unicode-range',
	unitsPerEm: 'units-per-em',
	vAlphabetic: 'v-alphabetic',
	vHanging: 'v-hanging',
	vIdeographic: 'v-ideographic',
	vMathematical: 'v-mathematical',
	vertAdvY: 'vert-adv-y',
	vertOriginX: 'vert-origin-x',
	vertOriginY: 'vert-origin-y',
	xHeight: 'x-height',
	// Presentation attributes
	alignmentBaseline: 'alignment-baseline',
	baselineShift: 'baseline-shift',
	clipPath: 'clip-path',
	clipRule: 'clip-rule',
	colorInterpolationFilters: 'color-interpolation-filters',
	colorInterpolation: 'color-interpolation',
	colorProfile: 'color-profile',
	colorRendering: 'color-rendering',
	dominantBaseline: 'dominant-baseline',
	enableBackground: 'enable-background',
	fillOpacity: 'fill-opacity',
	fillRule: 'fill-rule',
	floodColor: 'flood-color',
	floodOpacity: 'flood-opacity',
	// many font-* are the same as in regular attributes
	fontSizeAdjust: 'font-size-adjust',
	glyphOrientationHorizontal: 'glyph-orientation-horizontal',
	glyphOrientationVertical: 'glyph-orientation-vertical',
	imageRendering: 'image-rendering',
	letterSpacing: 'letter-spacing',
	lightingColor: 'lighting-color',
	markerEnd: 'marker-end',
	markerMid: 'marker-mid',
	markerStart: 'marker-start',
	pointerEvents: 'pointer-events',
	shapeRendering: 'shape-rendering',
	stopColor: 'stop-color',
	stopOpacity: 'stop-opacity',
	strokeDasharray: 'stroke-dasharray',
	strokeOffset: 'stroke-offset',
	strokeLinecap: 'stroke-linecap',
	strokeLinejoin: 'stroke-linejoin',
	strokeMiterlimit: 'stroke-miterlimit',
	strokeOpacity: 'stroke-opacity',
	strokeWidth: 'stroke-width',
	textAnchor: 'text-anchor',
	textDecoration: 'text-decoration',
	textRendering: 'text-rendering',
	unicodeBidi: 'unicode-bidi',
	wordSpacing: 'word-spacing',
	writingMode: 'writing-mode',

	// HTML
	httpEquiv: 'http-equiv',
	acceptCharset: 'accept-charset'
};
export const delegatedProps = {};

constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,defaultValue,defaultChecked', strictProps, true);
constructDefaults('children,ref,key,selected,checked,value,multiple', skipProps, true);
constructDefaults('onClick,onMouseDown,onMouseUp,onMouseMove,onSubmit,onDblClick,onKeyDown,onKeyUp,onKeyPress', delegatedProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readOnly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);
