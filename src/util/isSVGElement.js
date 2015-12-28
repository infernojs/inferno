// To be compat with React, we support at least the same SVG elements
function isSVGElement( nodeName ) {
	return nodeName === 'svg'
		|| nodeName === 'clipPath'
		|| nodeName === 'circle'
		|| nodeName === 'defs'
		|| nodeName === 'desc'
		|| nodeName === 'ellipse'
		|| nodeName === 'filter'
		|| nodeName === 'g'
		|| nodeName === 'line'
		|| nodeName === 'linearGradient'
		|| nodeName === 'mask'
		|| nodeName === 'marker'
		|| nodeName === 'metadata'
		|| nodeName === 'mpath'
		|| nodeName === 'path'
		|| nodeName === 'pattern'
		|| nodeName === 'polygon'
		|| nodeName === 'polyline'
		|| nodeName === 'pattern'
		|| nodeName === 'radialGradient'
		|| nodeName === 'rect'
		|| nodeName === 'set'
		|| nodeName === 'stop'
		|| nodeName === 'symbol'
		|| nodeName === 'switch'
		|| nodeName === 'text'
		|| nodeName === 'tspan'
		|| nodeName === 'use'
		|| nodeName === 'view';
};

export default isSVGElement;