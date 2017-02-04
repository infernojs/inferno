function constructDefaults(string, object, value) {
	/* eslint no-return-assign: 0 */
	const array = string.split(',');
	for (let i = 0, len = array.length; i < len; i++) {
		object[array[i]] = value;
	}
}

export const xlinkNS = 'http://www.w3.org/1999/xlink';
export const xmlNS = 'http://www.w3.org/XML/1998/namespace';
export const svgNS = 'http://www.w3.org/2000/svg';
export const strictProps = {};
export const booleanProps = {};
export const namespaces = {};
export const colonProps = {};
export const probablyColonProps = /^(xlink[HART]|xml[BLS])/;
export function colonize(str, smallLetter, largeLetter) {
	return `${smallLetter}:${largeLetter.toLowerCase()}`;
}
export const isUnitlessNumber = {};
export const skipProps = {};
export const dehyphenProps = {
	httpEquiv: 'http-equiv',
	acceptCharset: 'accept-charset'
};
export const probablyKebabProps = /^(accentH|arabicF|capH|font[FSVW]|glyph[NO]|horiz[AO]|panose1|renderingI|strikethrough[PT]|underline[PT]|v[AHIM]|vert[AO]|xH|alignmentB|baselineS|clip[PR]|color[IPR]|dominantB|enableB|fill[OR]|flood[COF]|imageR|letterS|lightingC|marker[EMS]|pointerE|shapeR|stop[CO]|stroke[DLMOW]|text[ADR]|unicodeB|wordS|writingM).*/;
export function kebabize(str, smallLetter, largeLetter) {
	return `${smallLetter}-${largeLetter.toLowerCase()}`;
}
export const delegatedProps = {};

constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,defaultChecked', strictProps, true);
constructDefaults('children,childrenType,defaultValue,ref,key,selected,checked,multiple', skipProps, true);
constructDefaults('onClick,onMouseDown,onMouseUp,onMouseMove,onSubmit,onDblClick,onKeyDown,onKeyUp,onKeyPress', delegatedProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readOnly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate,hidden', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);
