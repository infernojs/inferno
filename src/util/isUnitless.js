function isUnitless( cssProp ) {

	/**
	 * Sorted after the most used CSS Properties
	 **/
	return cssProp === 'opacity'
		|| cssProp === 'fontWeight'
		|| cssProp === 'zIndex'
		|| cssProp === 'tabSize'
		|| cssProp === 'widows'
		|| cssProp === 'zoom'
		|| cssProp === 'animationIterationCount'
		|| cssProp === 'boxFlex'
		|| cssProp === 'boxFlexGroup'
		|| cssProp === 'boxOrdinalGroup'
		|| cssProp === 'columnCount'
		|| cssProp === 'counterIncrement'
		|| cssProp === 'flex'
		|| cssProp === 'flexGrow'
		|| cssProp === 'flexPositive'
		|| cssProp === 'flexShrink'
		|| cssProp === 'flexNegative'
		|| cssProp === 'flexOrder'
		|| cssProp === 'gridRow'
		|| cssProp === 'gridColumn'
		|| cssProp === 'lineClamp'
		|| cssProp === 'lineHeight'
		|| cssProp === 'order'
		|| cssProp === 'orphans' // chrome, IE, Opera 9.2
		|| cssProp === 'fillOpacity'
		|| cssProp === 'stopOpacity'
		|| cssProp === 'strokeDashoffset'
		|| cssProp === 'strokeOpacity'
		|| cssProp === 'strokeWidth'

		/**
		 * Firefox
		 **/

		|| cssProp === 'MozTransform'
		|| cssProp === 'MozTransformOrigin'

		/**
		 * Webkit
		 **/

		|| cssProp === 'webkitFlex' // Safari 6.1
		|| cssProp === 'webkitFlexGrow' // Safari 6.1
		|| cssProp === 'WebkitFlexDirection' // Safari 7.0
		|| cssProp === 'WebkitFlexWrap' // Safari 6.1
		|| cssProp === 'WebkitFlexBasis' // Safari 7.0
		|| cssProp === 'WebkitFlexOrder'
		|| cssProp === 'WebkitFlexPositive'
		|| cssProp === 'WebkitGridColumn'
		|| cssProp === 'WebkitGridRow'
		|| cssProp === 'WebkitLineClamp'
		|| cssProp === 'WebkitStrokeDashoffset'
		|| cssProp === 'WebkitStrokeOpacity'
		|| cssProp === 'WebkitTransform'
		|| cssProp === 'WebkitTransformOrigin'

		/**
		 * Internet Explorer / Edge
		 **/

		|| cssProp === 'msFlex' // IE10 - IE11++ ( unprefixed)
		|| cssProp === 'msFlexDirection' // IE10 - IE11++ ( unprefixed)
		|| cssProp === 'msOrder' // IE9 ++
}

export default isUnitless;
