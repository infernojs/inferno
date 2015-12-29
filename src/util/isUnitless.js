function isUnitless( cssProp ) {

	/**
	 * Sorted after the most used CSS Properties
	 **/
	return cssProp === 'opacity'
		|| cssProp === 'fontWeight'
		|| cssProp === 'font-weight'
		|| cssProp === 'zIndex'
		|| cssProp === 'z-index'
		|| cssProp === 'tabSize'
		|| cssProp === 'tab-size'
		|| cssProp === 'widows'
		|| cssProp === 'zoom'
		|| cssProp === 'animationIterationCount'
		|| cssProp === 'animation-iteration-count'
		|| cssProp === 'boxFlex'
		|| cssProp === 'box-flex'
		|| cssProp === 'boxFlexGroup'
		|| cssProp === 'box-flex-group'
		|| cssProp === 'boxOrdinalGroup'
		|| cssProp === 'box-ordinal-group'
		|| cssProp === 'columnCount'
		|| cssProp === 'column-count'
		|| cssProp === 'counterIncrement'
		|| cssProp === 'counter-increment'
		|| cssProp === 'flex'
		|| cssProp === 'flexGrow'
		|| cssProp === 'flex-grow'
		|| cssProp === 'flexPositive'
		|| cssProp === 'flex-positive'
		|| cssProp === 'flexShrink'
		|| cssProp === 'flex-shrink'
		|| cssProp === 'flexOrder'
		|| cssProp === 'flex-order'
		|| cssProp === 'gridRow'
		|| cssProp === 'gridColumn'
		|| cssProp === 'grid-golumn'
		|| cssProp === 'lineClamp'
		|| cssProp === 'line-clamp'
		|| cssProp === 'lineHeight'
		|| cssProp === 'order'
		|| cssProp === 'orphans' // chrome, IE, Opera 9.2
		|| cssProp === 'fillOpacity'
		|| cssProp === 'stopOpacity'
		|| cssProp === 'stop-opacity'
		|| cssProp === 'strokeDashoffset'
		|| cssProp === 'stroke-dashoffset'
		|| cssProp === 'strokeOpacity'
		|| cssProp === 'stroke-opacity'
		|| cssProp === 'strokeWidth'
		|| cssProp === 'stroke-width'
		|| cssProp === 'transform'
		|| cssProp === 'transform-origin'

		/**
		 * Firefox
		 **/
		|| cssProp === 'MozTransform'
		|| cssProp === '-moz-transform'
		|| cssProp === 'MozTransformOrigin'
		|| cssProp === '-moz-transform-origin'

		/**
		 * Webkit
		 **/
		|| cssProp === 'webkitFlex' // Safari 6.1
		|| cssProp === '-webkit-flex' // Safari 6.1
		|| cssProp === 'webkitFlexGrow' // Safari 6.1
		|| cssProp === '-webkit-flex-grow' // Safari 6.1
		|| cssProp === 'WebkitFlexDirection' // Safari 7.0
		|| cssProp === '-webkit-flex-direction' // Safari 7.0
		|| cssProp === 'WebkitFlexWrap' // Safari 6.1
		|| cssProp === '-webkit-flex-wrap' // Safari 6.1
		|| cssProp === 'WebkitFlexBasis' // Safari 7.0
		|| cssProp === '-webkit-flex-basis' // Safari 7.0
		|| cssProp === 'WebkitFlexOrder'
		|| cssProp === '-webkit-flex-order'
		|| cssProp === 'WebkitFlexPositive'
		|| cssProp === '-webkit-flex-positive'
		|| cssProp === 'WebkitGridColumn'
		|| cssProp === '-webkit-grid-column'
		|| cssProp === 'WebkitGridRow'
		|| cssProp === '-webkit-grid-row'
		|| cssProp === 'WebkitLineClamp'
		|| cssProp === '-webkit-line-clamp'
		|| cssProp === 'WebkitStrokeDashoffset'
		|| cssProp === 'WebkitStrokeOpacity'
		|| cssProp === '-webkit-stroke-opacity'
		|| cssProp === 'WebkitTransform'
		|| cssProp === '-webkit-transform' //  Chrome, Safari, Opera
		|| cssProp === 'WebkitTransformOrigin'
		|| cssProp === '-webkit-transform-origin' // Chrome, Safari, Oper

		/**
		 * Internet Explorer / Edge
		 **/

		|| cssProp === 'msFlex' // IE10 - IE11++ ( unprefixed)
		|| cssProp === '-ms-flex' // IE10 - IE11++ ( unprefixed)
		|| cssProp === 'msFlexDirection' // IE10 - IE11++ ( unprefixed)
		|| cssProp === '-ms-flex-direction' // IE10 - IE11++ ( unprefixed)
		|| cssProp === 'msOrder' // IE9 ++
		|| cssProp === '-ms-order' // IE9 ++
		|| cssProp === '-ms-transform' // IE9
		|| cssProp === '-ms-transform-origin' // IE9,
}

export default isUnitless;
